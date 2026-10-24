import { createServer, IncomingMessage, ServerResponse, Server } from 'node:http';
import { EngineCommand } from '@stupul/engine';
import { Authority } from './authority.js';
import { AuthManager } from './auth.js';
import { 
  RateLimiter, 
  TokenBucketRateLimiter, 
  MultiDimensionalRateLimiter 
} from './rateLimit.js';

export type { RateLimiter };
export { TokenBucketRateLimiter, MultiDimensionalRateLimiter };

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Actor-Id, X-Session-Token');
}

function json(res: ServerResponse, code: number, body: unknown): void {
  setCorsHeaders(res);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => {
      data += c;
      if (data.length > 1_000_000) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export function startHttpServer(
  authority: Authority,
  port: number,
  opts?: { 
    rateLimiter?: RateLimiter; 
    multiLimiter?: MultiDimensionalRateLimiter; 
    authManager?: AuthManager;
  },
): Promise<{ server: Server; port: number }> {
  let multiLimiter: MultiDimensionalRateLimiter;
  if (opts?.multiLimiter) {
    multiLimiter = opts.multiLimiter;
  } else if (opts?.rateLimiter instanceof MultiDimensionalRateLimiter) {
    multiLimiter = opts.rateLimiter;
  } else if (opts?.rateLimiter) {
    multiLimiter = new MultiDimensionalRateLimiter({
      ipCapacity: (opts.rateLimiter as any).capacity ?? 1000,
      ipRefillPerSec: (opts.rateLimiter as any).refillPerSec ?? 1000,
      sessionCapacity: (opts.rateLimiter as any).capacity ?? 1000,
      sessionRefillPerSec: (opts.rateLimiter as any).refillPerSec ?? 1000,
      identityCapacity: (opts.rateLimiter as any).capacity ?? 1000,
      identityRefillPerSec: (opts.rateLimiter as any).refillPerSec ?? 1000,
    });
  } else {
    multiLimiter = new MultiDimensionalRateLimiter();
  }
  const auth = opts?.authManager ?? new AuthManager('localhost', 'STUPUL Civilization', 300_000, 86_400_000, undefined, authority.getDB());

  const server = createServer(async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    try {
      // 1. Health check
      if (req.method === 'GET' && url.pathname === '/api/health') {
        json(res, 200, { ok: true, writeDisabled: authority.isWriteDisabled(), version: authority.getVersion(), tick: authority.getState().tick });
        return;
      }

      // 2. State snapshot
      if (req.method === 'GET' && url.pathname === '/api/state') {
        json(res, 200, { version: authority.getVersion(), state: authority.getState() });
        return;
      }

      // 3. Events backlog
      if (req.method === 'GET' && url.pathname === '/api/events') {
        const since = Number(url.searchParams.get('since') ?? '0');
        json(res, 200, { events: authority.getEventsSince(since) });
        return;
      }

      // 4. Server-Sent Events (SSE) Stream pentru multiplayer live în timp real
      if (req.method === 'GET' && url.pathname === '/api/stream') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });

        // Conexiune stabilită
        res.write(': connected\n\n');

        // Transmite starea inițială
        res.write(`event: init\ndata: ${JSON.stringify({ version: authority.getVersion(), state: authority.getState() })}\n\n`);

        // Subscrie la actualizările de stare atomice din Authority
        const unsubscribe = authority.subscribe((state, version, events) => {
          try {
            res.write(`event: update\ndata: ${JSON.stringify({ state, version, events })}\n\n`);
          } catch {
            // Socket închis
          }
        });

        // Heartbeat periodic la fiecare 15 secunde pentru keep-alive
        const heartbeat = setInterval(() => {
          try {
            res.write(': heartbeat\n\n');
          } catch {
            clearInterval(heartbeat);
          }
        }, 15000);

        req.on('close', () => {
          clearInterval(heartbeat);
          unsubscribe();
        });
        return;
      }

      // 5. Auth WebAuthn & Guest Endpoints
      if (req.method === 'POST' && url.pathname === '/api/auth/register-challenge') {
        const raw = await readBody(req);
        const { username } = JSON.parse(raw);
        try {
          const ch = auth.createRegistrationChallenge(username);
          json(res, 200, ch);
        } catch (err) {
          json(res, 400, { error: (err as Error).message });
        }
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/verify-registration') {
        const raw = await readBody(req);
        const body = JSON.parse(raw);
        try {
          const result = auth.verifyRegistration(body);
          json(res, 200, result);
        } catch (err) {
          json(res, 400, { error: (err as Error).message });
        }
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/login-challenge') {
        const raw = await readBody(req);
        const { actorId } = JSON.parse(raw);
        try {
          const ch = auth.createLoginChallenge(actorId);
          json(res, 200, ch);
        } catch (err) {
          json(res, 400, { error: (err as Error).message });
        }
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/verify-login') {
        const raw = await readBody(req);
        const body = JSON.parse(raw);
        try {
          const result = auth.verifyLogin(body);
          json(res, 200, result);
        } catch (err) {
          json(res, 400, { error: (err as Error).message });
        }
        return;
      }

      if (req.method === 'POST' && (url.pathname === '/api/auth/citizen' || url.pathname === '/api/auth/register-citizen')) {
        let body: any = {};
        try {
          const raw = await readBody(req);
          body = raw ? JSON.parse(raw) : {};
        } catch {}
        const result = auth.registerCitizen(body?.username);
        json(res, 200, result);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/guest') {
        const result = auth.createGuestSession();
        json(res, 200, result);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/auth/session') {
        const authHeader = req.headers.authorization ?? (req.headers['x-session-token'] as string);
        const result = auth.verifySession(authHeader ?? '');
        if (result.valid) {
          json(res, 200, result);
        } else {
          json(res, 401, result);
        }
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
        const authHeader = req.headers.authorization ?? (req.headers['x-session-token'] as string);
        if (authHeader) {
          auth.revokeSession(authHeader);
        }
        json(res, 200, { success: true });
        return;
      }

      // 6. Command Dispatch cu Rate Limiting Multi-Dimensional și Identitate Server-Side (Securitate P0)
      if (req.method === 'POST' && url.pathname === '/api/command') {
        const clientIp = multiLimiter.extractClientIp(req);
        const rawAuth = (req.headers.authorization as string) || (req.headers['x-session-token'] as string) || '';
        const sessionToken = rawAuth.startsWith('Bearer ') ? rawAuth.slice(7).trim() : rawAuth.trim();

        const verifiedSession = sessionToken ? auth.verifySession(sessionToken) : null;
        const authenticatedActorId = verifiedSession?.valid && verifiedSession.identity ? verifiedSession.identity.actorId : undefined;
        const headerActor = req.headers['x-actor-id'] as string;

        // Rate limiting multi-dimensional (IP, Sesiune, Identitate)
        const rateCheck = multiLimiter.check({
          ip: clientIp,
          sessionToken: sessionToken || undefined,
          actorId: authenticatedActorId || headerActor,
        });

        if (!rateCheck.allowed) {
          json(res, 429, { 
            error: 'rate limit exceeded', 
            dimension: rateCheck.rejectedDimension 
          });
          return;
        }

        const raw = await readBody(req);
        let payload: { commandId?: string; actorId?: string; command?: EngineCommand };
        try {
          payload = JSON.parse(raw);
        } catch {
          json(res, 400, { error: 'invalid JSON' });
          return;
        }

        if (!payload.commandId || typeof payload.commandId !== 'string') {
          json(res, 400, { error: 'commandId required' });
          return;
        }
        if (!payload.command || typeof payload.command !== 'object') {
          json(res, 400, { error: 'command required' });
          return;
        }

        // Anti-Spoofing & Derivare Identitate Server-Side:
        if (sessionToken) {
          if (!verifiedSession?.valid || !verifiedSession.identity) {
            json(res, 401, { error: `Unauthorized: ${verifiedSession?.error || 'invalid session'}` });
            return;
          }
          const expectedActor = verifiedSession.identity.actorId;
          // Respinge încercarea de falsificare / uzurpare a identității
          if (headerActor && headerActor !== expectedActor) {
            json(res, 403, { 
              error: 'Forbidden: header actor mismatch (cannot impersonate another actor)',
              authenticatedActor: expectedActor,
              attemptedActor: headerActor 
            });
            return;
          }
          if (payload.actorId && payload.actorId !== expectedActor) {
            json(res, 403, { 
              error: 'Forbidden: actor mismatch (cannot impersonate another actor)',
              authenticatedActor: expectedActor,
              attemptedActor: payload.actorId 
            });
            return;
          }
          const commandHasActor = 'actorId' in payload.command;
          const attemptedCmdActor = commandHasActor ? (payload.command as { actorId: string }).actorId : undefined;
          if (attemptedCmdActor && attemptedCmdActor !== expectedActor) {
            json(res, 403, { 
              error: 'Forbidden: command actor mismatch (cannot act on behalf of another actor)',
              authenticatedActor: expectedActor,
              attemptedActor: attemptedCmdActor 
            });
            return;
          }
          payload.actorId = expectedActor;
          if (commandHasActor) {
            (payload.command as { actorId: string }).actorId = expectedActor;
          }
        }

        const cmdHasActor = 'actorId' in payload.command;
        const currentCmdActor = cmdHasActor ? (payload.command as { actorId: string }).actorId : undefined;
        const effectiveActor = payload.actorId || currentCmdActor || authenticatedActorId || headerActor || 'anonymous';
        if (cmdHasActor) {
          (payload.command as { actorId: string }).actorId = effectiveActor;
        }

        const isGuestOrAnon =
          effectiveActor.startsWith('guest_') ||
          effectiveActor.startsWith('oaspete_') ||
          effectiveActor === 'anonymous' ||
          (verifiedSession?.identity as any)?.mode === 'guest' ||
          (verifiedSession?.identity as any)?.role === 'guest';

        // P2 Invariant: Oaspeții/Anonimii nu pot revendica parcele și nu pot construi clădiri persistente în orașul comun
        if (payload.command.type === 'CLAIM_PARCEL' || payload.command.type === 'CONSTRUCT_BUILDING') {
          if (isGuestOrAnon) {
            json(res, 403, {
              error: 'Forbidden: conturile de oaspete nu pot revendica parcele sau construi clădiri persistente în orașul comun. Înregistrează-te gratuit ca Cetățean.',
            });
            return;
          }
        }

        // Autorizare Resursă (Protecție Proprietăți Parcele):
        const currentGrid = authority.getState().grid;
        if (payload.command.type === 'UPGRADE_BUILDING' || payload.command.type === 'DEMOLISH_BUILDING') {
          if (isGuestOrAnon) {
            json(res, 403, {
              error: 'Forbidden: conturile de oaspete nu pot modifica clădiri în orașul comun. Înregistrează-te gratuit ca Cetățean.',
            });
            return;
          }
          const { x, y } = payload.command;
          if (x >= 0 && x < currentGrid[0].length && y >= 0 && y < currentGrid.length) {
            const parcel = currentGrid[y][x];
            if (parcel.ownerAccountId && parcel.ownerAccountId !== effectiveActor && parcel.ownerAccountId !== 'public_town_trust') {
              json(res, 403, { 
                error: `Forbidden: parcel (${x}, ${y}) is owned by '${parcel.ownerAccountId}', not '${effectiveActor}'` 
              });
              return;
            }
          }
        }

        // Autorizare Guvernanță (Doar cetățeni validați pot modifica politicile):
        if (payload.command.type === 'SET_POLICY') {
          if (isGuestOrAnon) {
            json(res, 403, { 
              error: 'Forbidden: guest and anonymous accounts cannot directly modify city policies' 
            });
            return;
          }
        }

        const result = authority.applyCommand(payload.command, payload.commandId, effectiveActor);
        if (result.applied) {
          json(res, 200, { applied: true, version: result.version, state: result.state, events: result.events });
        } else if (result.idempotentReplay) {
          json(res, 200, { applied: false, replayed: true, version: result.version, state: result.state, events: [] });
        } else {
          json(res, 409, { applied: false, error: result.error });
        }
        return;
      }

      // 7. Admin mode
      if (req.method === 'POST' && url.pathname === '/api/admin/write-mode') {
        const raw = await readBody(req);
        let payload: { enabled?: boolean };
        try {
          payload = JSON.parse(raw);
        } catch {
          json(res, 400, { error: 'invalid JSON' });
          return;
        }
        authority.setWriteDisabled(!payload.enabled);
        json(res, 200, { writeDisabled: authority.isWriteDisabled() });
        return;
      }

      json(res, 404, { error: 'not found' });
    } catch (e) {
      json(res, 500, { error: (e as Error).message });
    }
  });

  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      resolve({ server, port: actualPort });
    });
  });
}
