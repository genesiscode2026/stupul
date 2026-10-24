import { createServer, IncomingMessage, ServerResponse, Server } from 'node:http';
import { EngineCommand } from '@stupul/engine';
import { Authority } from './authority.js';

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

function json(res: ServerResponse, code: number, body: unknown): void {
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
  opts?: { rateLimiter?: RateLimiter },
): Promise<{ server: Server; port: number }> {
  const rl = opts?.rateLimiter ?? new TokenBucketRateLimiter();
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    try {
      if (req.method === 'GET' && url.pathname === '/api/health') {
        json(res, 200, { ok: true, writeDisabled: authority.isWriteDisabled(), version: authority.getVersion(), tick: authority.getState().tick });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/state') {
        json(res, 200, { version: authority.getVersion(), state: authority.getState() });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/events') {
        const since = Number(url.searchParams.get('since') ?? '0');
        json(res, 200, { events: authority.getEventsSince(since) });
        return;
      }
      if (req.method === 'POST' && url.pathname === '/api/command') {
        const ip = req.socket.remoteAddress ?? 'unknown';
        if (!rl.allow(ip)) {
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
