import { createServer, IncomingMessage, ServerResponse, Server } from 'node:http';
import { EngineCommand } from '@stupul/engine';
import { Authority } from './authority.js';
import { AuthManager } from './auth.js';

export interface RateLimiter {
  allow(key: string): boolean;
}

/** Token bucket simplu (în memorie) pentru protecție anti-bot. */
export class TokenBucketRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { tokens: number; last: number }>();
  constructor(private readonly capacity = 60, private readonly refillPerSec = 30) {}

  allow(key: string): boolean {
    const now = Date.now();
    let b = this.buckets.get(key);
    if (!b) {
      b = { tokens: this.capacity, last: now };
      this.buckets.set(key, b);
    }
    const refill = ((now - b.last) / 1000) * this.refillPerSec;
    b.tokens = Math.min(this.capacity, b.tokens + refill);
    b.last = now;
    if (b.tokens < 1) return false;
    b.tokens -= 1;
    return true;
  }
}


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
  opts?: { rateLimiter?: RateLimiter; authManager?: AuthManager },
): Promise<{ server: Server; port: number }> {
  const rl = opts?.rateLimiter ?? new TokenBucketRateLimiter();
  const auth = opts?.authManager ?? new AuthManager();

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

      // 6. Command Dispatch
      if (req.method === 'POST' && url.pathname === '/api/command') {
        const rateKey = (req.headers['x-actor-id'] as string) || req.socket.remoteAddress || 'unknown';
        if (!rl.allow(rateKey)) {
          json(res, 429, { error: 'rate limit exceeded' });
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
        const result = authority.applyCommand(payload.command, payload.commandId, payload.actorId ?? 'anonymous');
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
