import { Authority } from './authority.js';
import { StateDB } from './db.js';
import { DurableObjectSqlStorageAdapter } from './storageAdapter.js';
import { AuthManager } from './auth.js';
import { MultiDimensionalRateLimiter } from './rateLimit.js';
import { EngineCommand } from '@stupul/engine';

export interface DurableObjectStateLike {
  storage: {
    sql?: any;
    get(key: string): Promise<any>;
    put(key: string, value: any): Promise<void>;
  };
}

/**
 * Server Autoritativ STUPUL rulat ca Cloudflare Durable Object (CityStateDO).
 * Oferă execuție unică autoritativă, stare sincronă SQLite pe edge (ctx.storage.sql),
 * Server-Sent Events (SSE) live stream, WebSockets cu hibernare și securitate completă P0.
 */
export class CityStateDO {
  private authority: Authority;
  private state: DurableObjectStateLike;
  private env: any;
  private auth: AuthManager;
  private rateLimiter: MultiDimensionalRateLimiter;
  private connectedSockets = new Set<WebSocket>();

  constructor(state: DurableObjectStateLike, env: any) {
    this.state = state;
    this.env = env;
    const adapter = new DurableObjectSqlStorageAdapter(state.storage?.sql);
    const db = new StateDB(adapter);
    this.authority = new Authority(db);

    // Configurare origin/RP ID dinamic sau din env (suport producție HTTPS non-localhost)
    const rpId = env?.WEBAUTHN_RP_ID || 'localhost';
    const allowedOrigins = env?.ALLOWED_ORIGINS ? String(env.ALLOWED_ORIGINS).split(',') : undefined;
    this.auth = new AuthManager(rpId, 'STUPUL Civilization', 300_000, 86_400_000, allowedOrigins, db);

    this.rateLimiter = new MultiDimensionalRateLimiter({
      ipCapacity: 120,
      ipRefillPerSec: 40,
      sessionCapacity: 60,
      sessionRefillPerSec: 30,
      identityCapacity: 60,
      identityRefillPerSec: 30,
      trustedProxies: ['127.0.0.1', '::1', 'localhost'],
    });

    // Broadcast la schimbări de stare către conexiunile WebSocket active
    this.authority.subscribe((gameState, version, events) => {
      const message = JSON.stringify({ event: 'update', state: gameState, version, events });
      for (const ws of this.connectedSockets) {
        try {
          ws.send(message);
        } catch {
          this.connectedSockets.delete(ws);
        }
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Actor-Id, X-Session-Token',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const json = (status: number, body: unknown) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    try {
      // 1. Health check
      if (request.method === 'GET' && url.pathname.endsWith('/api/health')) {
        return json(200, {
          ok: true,
          writeDisabled: this.authority.isWriteDisabled(),
          version: this.authority.getVersion(),
          tick: this.authority.getState().tick,
        });
      }

      // 2. State snapshot
      if (request.method === 'GET' && url.pathname.endsWith('/api/state')) {
        return json(200, {
          version: this.authority.getVersion(),
          state: this.authority.getState(),
        });
      }

      // 3. Events backlog
      if (request.method === 'GET' && url.pathname.endsWith('/api/events')) {
        const since = Number(url.searchParams.get('since') ?? '0');
        return json(200, {
          events: this.authority.getEventsSince(since),
        });
      }

      // 4. WebSocket Endpoint (/api/ws) cu suport pentru hibernare
      if (url.pathname.endsWith('/api/ws') || request.headers.get('Upgrade') === 'websocket') {
        const pair = new (globalThis as any).WebSocketPair();
        const clientWs = pair[0];
        const serverWs = pair[1];

        // Verificăm dacă runtime-ul suportă Hibernation API (Cloudflare DO)
        if (typeof (this as any).ctx?.acceptWebSocket === 'function') {
          (this as any).ctx.acceptWebSocket(serverWs);
        } else {
          serverWs.accept();
        }

        this.connectedSockets.add(serverWs);

        // Trimitem starea inițială pe WebSocket
        serverWs.send(
          JSON.stringify({
            event: 'init',
            version: this.authority.getVersion(),
            state: this.authority.getState(),
          })
        );

        serverWs.addEventListener('close', () => {
          this.connectedSockets.delete(serverWs);
        });

        serverWs.addEventListener('message', async (event: any) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PING') {
              serverWs.send(JSON.stringify({ type: 'PONG', tick: this.authority.getState().tick }));
            }
          } catch {
            // Ignoră mesaje formatate greșit
          }
        });

        return new Response(null, {
          status: 101,
          webSocket: clientWs,
          headers: corsHeaders,
        } as any);
      }

      // 5. Server-Sent Events (SSE) Stream (/api/stream)
      if (request.method === 'GET' && url.pathname.endsWith('/api/stream')) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        // Mesaj inițial de conectare și stare
        writer.write(encoder.encode(': connected\n\n'));
        writer.write(
          encoder.encode(
            `event: init\ndata: ${JSON.stringify({ version: this.authority.getVersion(), state: this.authority.getState() })}\n\n`
          )
        );

        const unsubscribe = this.authority.subscribe((state, version, events) => {
          try {
            writer.write(encoder.encode(`event: update\ndata: ${JSON.stringify({ state, version, events })}\n\n`));
          } catch {
            // Conexiune închisă
          }
        });

        request.signal?.addEventListener('abort', () => {
          unsubscribe();
          try {
            writer.close();
          } catch {}
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...corsHeaders,
          },
        });
      }

      // 6. Autentificare WebAuthn & Guest Endpoints
      if (request.method === 'POST' && url.pathname.endsWith('/api/auth/register-challenge')) {
        const body = (await request.json()) as { username: string };
        try {
          const ch = this.auth.createRegistrationChallenge(body.username);
          return json(200, ch);
        } catch (err) {
          return json(400, { error: (err as Error).message });
        }
      }

      if (request.method === 'POST' && url.pathname.endsWith('/api/auth/verify-registration')) {
        const body = (await request.json()) as any;
        try {
          const result = this.auth.verifyRegistration(body);
          return json(200, result);
        } catch (err) {
          return json(400, { error: (err as Error).message });
        }
      }

      if (request.method === 'POST' && url.pathname.endsWith('/api/auth/login-challenge')) {
        const body = (await request.json()) as { actorId: string };
        try {
          const ch = this.auth.createLoginChallenge(body.actorId);
          return json(200, ch);
        } catch (err) {
          return json(400, { error: (err as Error).message });
        }
      }

      if (request.method === 'POST' && url.pathname.endsWith('/api/auth/verify-login')) {
        const body = (await request.json()) as any;
        try {
          const result = this.auth.verifyLogin(body);
          return json(200, result);
        } catch (err) {
          return json(400, { error: (err as Error).message });
        }
      }

      if (request.method === 'POST' && (url.pathname.endsWith('/api/auth/citizen') || url.pathname.endsWith('/api/auth/register-citizen'))) {
        let body: any = {};
        try { body = await request.json(); } catch {}
        const result = this.auth.registerCitizen(body?.username);
        return json(200, result);
      }

      if (request.method === 'POST' && (url.pathname.endsWith('/api/auth/guest') || url.pathname.endsWith('/api/auth/guest-session'))) {
        try { await request.text(); } catch {}
        const result = this.auth.createGuestSession();
        return json(200, result);
      }

      if (request.method === 'GET' && url.pathname.endsWith('/api/auth/session')) {
        const authHeader = request.headers.get('Authorization') ?? request.headers.get('X-Session-Token');
        const result = this.auth.verifySession(authHeader ?? '');
        return json(result.valid ? 200 : 401, result);
      }

      if (request.method === 'POST' && url.pathname.endsWith('/api/auth/logout')) {
        try { await request.text(); } catch {}
        const authHeader = request.headers.get('Authorization') ?? request.headers.get('X-Session-Token');
        if (authHeader) {
          this.auth.revokeSession(authHeader);
        }
        return json(200, { success: true });
      }

      // 7. Command Dispatch cu Securitate P0 (Identitate, Anti-Spoofing, Autorizare Resursă, Rate Limiting)
      if (request.method === 'POST' && url.pathname.endsWith('/api/command')) {
        const clientIp =
          request.headers.get('CF-Connecting-IP') ||
          request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
          '127.0.0.1';

        const rawAuth = request.headers.get('Authorization') || request.headers.get('X-Session-Token') || '';
        const sessionToken = rawAuth.startsWith('Bearer ') ? rawAuth.slice(7).trim() : rawAuth.trim();

        const verifiedSession = sessionToken ? this.auth.verifySession(sessionToken) : null;
        const authenticatedActorId =
          verifiedSession?.valid && verifiedSession.identity ? verifiedSession.identity.actorId : undefined;
        const headerActor = request.headers.get('X-Actor-Id');

        // Rate limiting multi-dimensional (IP, Sesiune, Identitate)
        const rateCheck = this.rateLimiter.check({
          ip: clientIp,
          sessionToken: sessionToken || undefined,
          actorId: authenticatedActorId || (headerActor ?? undefined),
        });

        if (!rateCheck.allowed) {
          return json(429, {
            error: 'rate limit exceeded',
            dimension: rateCheck.rejectedDimension,
          });
        }

        let payload: { commandId?: string; actorId?: string; command?: EngineCommand };
        try {
          payload = (await request.json()) as any;
        } catch {
          return json(400, { error: 'invalid JSON' });
        }

        if (!payload.commandId || typeof payload.commandId !== 'string') {
          return json(400, { error: 'commandId required' });
        }
        if (!payload.command || typeof payload.command !== 'object') {
          return json(400, { error: 'command required' });
        }

        // Anti-Spoofing & Derivare Identitate Server-Side (Securitate P0):
        if (sessionToken) {
          if (!verifiedSession?.valid || !verifiedSession.identity) {
            return json(401, { error: `Unauthorized: ${verifiedSession?.error || 'invalid session'}` });
          }
          const expectedActor = verifiedSession.identity.actorId;

          // Respinge dacă headerul sau payloadul încearcă să uzurpe alt actor
          if (headerActor && headerActor !== expectedActor) {
            return json(403, {
              error: 'Forbidden: header actor mismatch (cannot impersonate another actor)',
              authenticatedActor: expectedActor,
              attemptedActor: headerActor,
            });
          }
          if (payload.actorId && payload.actorId !== expectedActor) {
            return json(403, {
              error: 'Forbidden: actor mismatch (cannot impersonate another actor)',
              authenticatedActor: expectedActor,
              attemptedActor: payload.actorId,
            });
          }
          const commandHasActor = 'actorId' in payload.command;
          const attemptedCmdActor = commandHasActor ? (payload.command as { actorId: string }).actorId : undefined;
          if (attemptedCmdActor && attemptedCmdActor !== expectedActor) {
            return json(403, {
              error: 'Forbidden: command actor mismatch (cannot act on behalf of another actor)',
              authenticatedActor: expectedActor,
              attemptedActor: attemptedCmdActor,
            });
          }

          payload.actorId = expectedActor;
          if (commandHasActor) {
            (payload.command as { actorId: string }).actorId = expectedActor;
          }
        }

        const cmdHasActor = 'actorId' in payload.command;
        const currentCmdActor = cmdHasActor ? (payload.command as { actorId: string }).actorId : undefined;
        const effectiveActor =
          payload.actorId || currentCmdActor || authenticatedActorId || headerActor || 'anonymous';
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
            return json(403, {
              error: 'Forbidden: conturile de oaspete nu pot revendica parcele sau construi clădiri persistente în orașul comun. Înregistrează-te gratuit ca Cetățean.',
            });
          }
        }

        // Autorizare Resursă (Protecție Proprietăți Parcele):
        const currentGrid = this.authority.getState().grid;
        if (payload.command.type === 'UPGRADE_BUILDING' || payload.command.type === 'DEMOLISH_BUILDING') {
          if (isGuestOrAnon) {
            return json(403, {
              error: 'Forbidden: conturile de oaspete nu pot modifica clădiri în orașul comun. Înregistrează-te gratuit ca Cetățean.',
            });
          }
          const { x, y } = payload.command;
          if (x >= 0 && x < currentGrid[0].length && y >= 0 && y < currentGrid.length) {
            const parcel = currentGrid[y][x];
            if (parcel.ownerAccountId && parcel.ownerAccountId !== effectiveActor && parcel.ownerAccountId !== 'public_town_trust') {
              return json(403, {
                error: `Forbidden: parcel (${x}, ${y}) is owned by '${parcel.ownerAccountId}', not '${effectiveActor}'`,
              });
            }
          }
        }

        // Autorizare Guvernanță (Doar cetățeni validați pot modifica politicile):
        if (payload.command.type === 'SET_POLICY') {
          if (isGuestOrAnon) {
            return json(403, {
              error: 'Forbidden: guest and anonymous accounts cannot directly modify city policies',
            });
          }
        }

        const result = this.authority.applyCommand(payload.command, payload.commandId, effectiveActor);
        if (result.applied) {
          return json(200, { applied: true, version: result.version, state: result.state, events: result.events });
        } else if (result.idempotentReplay) {
          return json(200, { applied: false, replayed: true, version: result.version, state: result.state, events: [] });
        } else {
          return json(409, { applied: false, error: result.error });
        }
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return json(500, { error: err?.message || 'Internal Server Error' });
    }
  }
}
