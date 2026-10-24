import { describe, it, expect, afterAll } from 'vitest';
import { Server } from 'node:http';
import http from 'node:http';
import { Authority } from '../packages/server/src/authority.js';
import { StateDB } from '../packages/server/src/db.js';
import { startHttpServer, MultiDimensionalRateLimiter } from '../packages/server/src/httpServer.js';
import { AuthManager } from '../packages/server/src/auth.js';

const serversToClean: Server[] = [];
afterAll(() => {
  for (const s of serversToClean) {
    try { s.close(); } catch {}
  }
});

function postHttp(port: number, path: string, body: unknown, token?: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': String(Buffer.byteLength(payload)),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const req = http.request(
      `http://127.0.0.1:${port}${path}`,
      { method: 'POST', headers },
      (res) => {
        let resBody = '';
        res.on('data', c => resBody += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, data: JSON.parse(resBody) });
          } catch {
            resolve({ status: res.statusCode || 500, data: resBody });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

describe('STUPUL GENESIS v3.4 — Multiplayer & Cloud Concurrency Benchmark', () => {
  it('BENCH-10: 10 clienți concurenți execută comenzi distincte fără conflicte', async () => {
    const db = new StateDB(':memory:');
    const authManager = new AuthManager('localhost', 'STUPUL Civilization', 300_000, 86_400_000, undefined, db);
    const authority = new Authority(db);
    const multiLimiter = new MultiDimensionalRateLimiter({
      ipCapacity: 500,
      ipRefillPerSec: 500,
      sessionCapacity: 100,
      sessionRefillPerSec: 100,
      identityCapacity: 100,
      identityRefillPerSec: 100,
      trustedProxies: ['127.0.0.1'],
    });

    const { server, port } = await startHttpServer(authority, 0, { multiLimiter, authManager });
    serversToClean.push(server);

    // 10 sesiuni unice de oaspeți
    const clients = Array.from({ length: 10 }, () => authManager.createGuestSession());
    const t0 = Date.now();

    const promises = clients.map((client, idx) => {
      return postHttp(port, '/api/command', {
        commandId: `bench10_cmd_${idx}_${Date.now()}`,
        command: {
          type: 'WORK_CIVIC_TASK',
          taskKind: idx % 2 === 0 ? 'farming' : 'masonry',
          actorId: client.identity.actorId,
        },
      }, client.sessionToken);
    });

    const results = await Promise.all(promises);
    const duration = Date.now() - t0;

    expect(results.length).toBe(10);
    for (const r of results) {
      expect(r.status).toBe(200);
      expect(r.data.applied).toBe(true);
    }
    expect(duration).toBeLessThan(1000); // 10 cereri concurente procesate sub 1s
  });

  it('BENCH-50: 50 clienți concurenți — măsurare latență p50, p95, p99 și zero 500', async () => {
    const db = new StateDB(':memory:');
    const authManager = new AuthManager('localhost', 'STUPUL Civilization', 300_000, 86_400_000, undefined, db);
    const authority = new Authority(db);
    const multiLimiter = new MultiDimensionalRateLimiter({
      ipCapacity: 1000,
      ipRefillPerSec: 1000,
      sessionCapacity: 200,
      sessionRefillPerSec: 200,
      identityCapacity: 200,
      identityRefillPerSec: 200,
      trustedProxies: ['127.0.0.1'],
    });

    const { server, port } = await startHttpServer(authority, 0, { multiLimiter, authManager });
    serversToClean.push(server);

    const clients = Array.from({ length: 50 }, () => authManager.createGuestSession());
    const latencies: number[] = [];

    const promises = clients.map(async (client, idx) => {
      const start = Date.now();
      const res = await postHttp(port, '/api/command', {
        commandId: `bench50_cmd_${idx}_${Date.now()}_${Math.random()}`,
        command: {
          type: 'WORK_CIVIC_TASK',
          taskKind: idx % 3 === 0 ? 'farming' : (idx % 3 === 1 ? 'masonry' : 'woodcutting'),
          actorId: client.identity.actorId,
        },
      }, client.sessionToken);
      const elapsed = Date.now() - start;
      latencies.push(elapsed);
      return res;
    });

    const results = await Promise.all(promises);
    latencies.sort((a, b) => a - b);

    const p50 = latencies[Math.floor(latencies.length * 0.50)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const errors500 = results.filter(r => r.status >= 500);

    expect(errors500.length).toBe(0);
    expect(results.every(r => r.status === 200 && r.data.applied)).toBe(true);
    expect(p50).toBeLessThan(250);
    expect(p95).toBeLessThan(600);
    expect(p99).toBeLessThan(1000);
  });

  it('BENCH-100: 100 clienți concurenți — conflict resolution 409 pe aceeași parcelă și integritate stare', async () => {
    const db = new StateDB(':memory:');
    const authManager = new AuthManager('localhost', 'STUPUL Civilization', 300_000, 86_400_000, undefined, db);
    const authority = new Authority(db);
    const multiLimiter = new MultiDimensionalRateLimiter({
      ipCapacity: 2000,
      ipRefillPerSec: 2000,
      sessionCapacity: 300,
      sessionRefillPerSec: 300,
      identityCapacity: 300,
      identityRefillPerSec: 300,
      trustedProxies: ['127.0.0.1'],
    });

    const { server, port } = await startHttpServer(authority, 0, { multiLimiter, authManager });
    serversToClean.push(server);

    const clients = Array.from({ length: 100 }, (_, idx) => authManager.registerCitizen(`cetatean_bench_${idx}`));
    const TARGET_PARCEL = { x: 2, y: 2 };

    // Toți cei 100 încearcă să revendice EXACT aceeași parcelă neocupată (2, 2) simultan
    const promises = clients.map((client, idx) => {
      return postHttp(port, '/api/command', {
        commandId: `bench100_race_${idx}_${Date.now()}`,
        command: {
          type: 'CLAIM_PARCEL',
          x: TARGET_PARCEL.x,
          y: TARGET_PARCEL.y,
          actorId: client.identity.actorId,
        },
      }, client.sessionToken);
    });

    const results = await Promise.all(promises);

    const accepted = results.filter(r => r.status === 200 && r.data.applied);
    const conflicts = results.filter(r => r.status === 409);
    const errors500 = results.filter(r => r.status >= 500);

    // Exact un singur client trebuie să câștige parcela!
    expect(accepted.length).toBe(1);
    expect(conflicts.length).toBe(99);
    expect(errors500.length).toBe(0);

    // Starea din memorie și baza de date trebuie să conțină câștigătorul unic
    const state = authority.getState();
    const winningActor = accepted[0].data.state.grid[TARGET_PARCEL.y][TARGET_PARCEL.x].ownerAccountId;
    expect(state.grid[TARGET_PARCEL.y][TARGET_PARCEL.x].ownerAccountId).toBe(winningActor);
    expect(typeof state.stateHash).toBe('string');
    expect(state.stateHash.length).toBe(64);
  });
});
