import { describe, it, expect, afterAll } from 'vitest';
import { Server } from 'node:http';
import { Authority } from '../packages/server/src/authority.js';
import { StateDB } from '../packages/server/src/db.js';
import { startHttpServer, TokenBucketRateLimiter } from '../packages/server/src/httpServer.js';
import { EngineCommand } from '../packages/engine/src/index.js';

const tmpServers: Server[] = [];
afterAll(() => { for (const s of tmpServers) s.close(); });

function claim(x: number, y: number, actorId: string): EngineCommand {
  return { type: 'CLAIM_PARCEL', x, y, actorId };
}

describe('P4 — Server autoritativ (local, integrare reală)', () => {
  it('idempotență: aceeași comandă (commandId) se aplică o singură dată', () => {
    const a = new Authority(new StateDB(':memory:'));
    const r1 = a.applyCommand(claim(3, 3, 'p1'), 'cmd-1', 'p1');
    const r2 = a.applyCommand(claim(3, 3, 'p1'), 'cmd-1', 'p1');
    expect(r1.applied).toBe(true);
    expect(r2.applied).toBe(false);
    expect(r2.idempotentReplay).toBe(true);
    expect(a.getVersion()).toBe(2);
  });

  it('anti-double-claim: două cereri pe aceeași parcelă => exact una reușește', () => {
    const a = new Authority(new StateDB(':memory:'));
    const r1 = a.applyCommand(claim(4, 4, 'p1'), 'c-a', 'p1');
    const r2 = a.applyCommand(claim(4, 4, 'p2'), 'c-b', 'p2');
    expect(r1.applied).toBe(true);
    expect(r2.applied).toBe(false);
    expect(r2.error).toBeTruthy();
    expect(a.getState().grid[4][4].ownerAccountId).toBe('p1');
  });

  it('anti-double-spend: resursele nu pot fi cheltuite de două ori', () => {
    const a = new Authority(new StateDB(':memory:'));
    // Inițial 250 materiale. Construim 7 case (7*30=210) => rămân 40.
    for (let i = 0; i < 7; i++) {
      const r = a.applyCommand({ type: 'CONSTRUCT_BUILDING', x: 2 + i, y: 2, buildingType: 'house', actorId: 'p1' } as EngineCommand, `b${i}`, 'p1');
      expect(r.applied).toBe(true);
    }
    const before = a.getState().resources.materials;
    const ok = a.applyCommand({ type: 'CONSTRUCT_BUILDING', x: 10, y: 2, buildingType: 'house', actorId: 'p1' } as EngineCommand, 'b7', 'p1');
    const fail = a.applyCommand({ type: 'CONSTRUCT_BUILDING', x: 11, y: 2, buildingType: 'house', actorId: 'p1' } as EngineCommand, 'b8', 'p1');
    expect(before).toBeLessThan(60); // am epuizat materialele
    expect(ok.applied).toBe(true);
    expect(fail.applied).toBe(false);
    expect(fail.error).toBeTruthy();
  });

  it('persistență/reconectare: starea supraviețuiește recreării serverului', () => {
    const path = '/tmp/stupul-server-test.sqlite';
    const db = new StateDB(path);
    const a1 = new Authority(db);
    a1.applyCommand(claim(6, 6, 'alice'), 'c-reconnect', 'alice');
    const versionBefore = a1.getVersion();
    db.close();
    // reconectare: nouă instanță din aceeași bază
    const db2 = new StateDB(path);
    const a2 = new Authority(db2);
    expect(a2.getVersion()).toBe(versionBefore);
    expect(a2.getState().grid[6][6].ownerAccountId).toBe('alice');
    db2.close();
  });

  it('write-disable: scrierile sunt respinse când modul este dezactivat', () => {
    const a = new Authority(new StateDB(':memory:'));
    a.setWriteDisabled(true);
    const r = a.applyCommand(claim(1, 1, 'p1'), 'c-wd', 'p1');
    expect(r.applied).toBe(false);
    expect(r.error).toContain('writes disabled');
  });

  it('falsificare sold: comenzi necunoscute (MINT) respinse', () => {
    const a = new Authority(new StateDB(':memory:'));
    const r = a.applyCommand({ type: 'MINT_FREE_CREDITS', amount: 999999 } as unknown as EngineCommand, 'c-mint', 'hacker');
    expect(r.applied).toBe(false);
    expect(r.error).toContain('Comandă necunoscută');
  });

  it('HTTP: 100 clienți concurenți pe aceeași parcelă => exact 1 succes', async () => {
    const a = new Authority(new StateDB(':memory:'));
    const { server, port } = await startHttpServer(a, 0, { rateLimiter: new TokenBucketRateLimiter(1000, 1000) });
    tmpServers.push(server);
    const base = `http://127.0.0.1:${port}`;
    const requests = Array.from({ length: 100 }, (_, i) =>
      fetch(`${base}/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId: `race-${i}`, actorId: `client-${i}`, command: claim(5, 5, `client-${i}`) }),
      }).then(r => r.json()),
    );
    const results = await Promise.all(requests);
    const applied = results.filter((r: any) => r.applied === true).length;
    const rejected = results.filter((r: any) => r.applied === false).length;
    expect(applied).toBe(1);
    expect(rejected).toBe(99);
    const state = await (await fetch(`${base}/api/state`)).json();
    expect(state.state.grid[5][5].ownerAccountId).toMatch(/^client-/);
  });

  it('HTTP: rate limiting respinge excesul de cereri (429)', async () => {
    const a = new Authority(new StateDB(':memory:'));
    const { server, port } = await startHttpServer(a, 0);
    tmpServers.push(server);
    const base = `http://127.0.0.1:${port}`;
    let got429 = false;
    for (let i = 0; i < 80; i++) {
      const r = await fetch(`${base}/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId: `rl-${i}`, actorId: 'spammer', command: claim(12, 12, 'spammer') }),
      });
      if (r.status === 429) { got429 = true; break; }
    }
    expect(got429).toBe(true);
  });

  it('HTTP: health + evenimente verificabile', async () => {
    const a = new Authority(new StateDB(':memory:'));
    const { server, port } = await startHttpServer(a, 0);
    tmpServers.push(server);
    const base = `http://127.0.0.1:${port}`;
    const health = await (await fetch(`${base}/api/health`)).json();
    expect(health.ok).toBe(true);
    const events = await (await fetch(`${base}/api/events?since=0`)).json();
    expect(Array.isArray(events.events)).toBe(true);
  });
});
