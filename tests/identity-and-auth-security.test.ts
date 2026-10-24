import { describe, it, expect, afterAll } from 'vitest';
import { Server } from 'node:http';
import { Authority } from '../packages/server/src/authority.js';
import { StateDB } from '../packages/server/src/db.js';
import { AuthManager } from '../packages/server/src/auth.js';
import { 
  startHttpServer, 
  MultiDimensionalRateLimiter 
} from '../packages/server/src/httpServer.js';
import { UserIdentity } from '../packages/domain/src/types.js';

const activeServers: Server[] = [];
afterAll(() => {
  for (const s of activeServers) s.close();
});

function createTestCitizen(actorId: string, username: string): UserIdentity {
  return {
    actorId,
    username,
    role: 'citizen',
    joinedAtMs: Date.now(),
    lastActiveMs: Date.now(),
    authenticatorCount: 1,
  };
}

describe('GENESIS v3.3 — Audit de Securitate Identitate, Autentificare & Rate Limiting (11 Scenarii P0)', () => {
  
  // SCENARIUL 1: Actor fals în payload respins cu HTTP 403 (Anti-Impersonation)
  it('SEC-01: Cerere cu sessionToken valid dar payload.actorId diferit este respinsă cu 403 Forbidden', async () => {
    const authority = new Authority(new StateDB(':memory:'));
    const authManager = new AuthManager('localhost', 'STUPUL Civilization');
    const { sessionToken } = authManager.registerTestUser(createTestCitizen('citizen_alice', 'alice'));

    const { server, port } = await startHttpServer(authority, 0, { authManager });
    activeServers.push(server);

    const res = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        commandId: 'cmd-spoof-payload-1',
        actorId: 'citizen_bob', // Atacator pretinde că este Bob în payload
        command: { type: 'CLAIM_PARCEL', x: 2, y: 2, actorId: 'citizen_bob' },
      }),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('cannot impersonate another actor');
    expect(data.authenticatedActor).toBe('citizen_alice');
  });

  // SCENARIUL 2: Header x-actor-id modificat nu poate ocoli identitatea derivată din sesiune
  it('SEC-02: Header x-actor-id modificat este respins cu 403 dacă diferă de identitatea autoritativă a sesiunii', async () => {
    const authority = new Authority(new StateDB(':memory:'));
    const authManager = new AuthManager('localhost', 'STUPUL Civilization');
    const { sessionToken } = authManager.registerTestUser(createTestCitizen('citizen_alice', 'alice'));

    const { server, port } = await startHttpServer(authority, 0, { authManager });
    activeServers.push(server);

    const res = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken,
        'X-Actor-Id': 'attacker_evil_actor', // Injectat în header
      },
      body: JSON.stringify({
        commandId: 'cmd-spoof-header-2',
        command: { type: 'CLAIM_PARCEL', x: 3, y: 3, actorId: 'citizen_alice' },
      }),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('header actor mismatch');
    expect(data.authenticatedActor).toBe('citizen_alice');
  });

  // SCENARIUL 3: 100 de actori falși în aceeași sesiune sunt blocați de rate-limiterul multidimensional
  it('SEC-03: Rotația a 100 de actori falși în aceeași sesiune este blocată de Session/IP Rate Limiter (429)', async () => {
    const authority = new Authority(new StateDB(':memory:'));
    const authManager = new AuthManager('localhost', 'STUPUL Civilization');
    const { sessionToken } = authManager.registerTestUser(createTestCitizen('citizen_spammer', 'spammer'));

    const rateLimiter = new MultiDimensionalRateLimiter({
      sessionCapacity: 20,
      sessionRefillPerSec: 1,
      ipCapacity: 100,
      ipRefillPerSec: 10,
    });

    const { server, port } = await startHttpServer(authority, 0, { authManager, rateLimiter });
    activeServers.push(server);

    let hit429 = false;
    let successfulRequests = 0;

    for (let i = 0; i < 50; i++) {
      const res = await fetch(`http://127.0.0.1:${port}/api/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          commandId: `cmd-spam-${i}`,
          command: { type: 'WORK_CIVIC_TASK', actorId: 'citizen_spammer', taskKind: 'farming' },
        }),
      });

      if (res.status === 429) {
        hit429 = true;
        const err = await res.json();
        expect(err.error.toLowerCase()).toContain('rate limit exceeded');
        break;
      } else if (res.status === 200) {
        successfulRequests++;
      }
    }

    expect(hit429).toBe(true);
    expect(successfulRequests).toBeLessThanOrEqual(25);
  });

  // SCENARIUL 4: Sesiune expirată respinsă cu 401 Unauthorized
  it('SEC-04: Sesiunea expirată conform TTL este respinsă automat cu 401', async () => {
    const authority = new Authority(new StateDB(':memory:'));
    // AuthManager cu session TTL de 1ms
    const authManager = new AuthManager('localhost', 'STUPUL Civilization', 300_000, 1);
    const { sessionToken } = authManager.registerTestUser(createTestCitizen('citizen_timeout', 'timeout'));

    // Așteptăm 10ms pentru expirare
    await new Promise(r => setTimeout(r, 10));

    const { server, port } = await startHttpServer(authority, 0, { authManager });
    activeServers.push(server);

    const res = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        commandId: 'cmd-expired-session',
        command: { type: 'CLAIM_PARCEL', x: 1, y: 1, actorId: 'citizen_timeout' },
      }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error.toLowerCase()).toContain('session expired');
  });

  // SCENARIUL 5: Sesiune revocată respinsă cu 401 Unauthorized
  it('SEC-05: Sesiunea revocată explicit pe server este respinsă imediat cu 401', async () => {
    const authority = new Authority(new StateDB(':memory:'));
    const authManager = new AuthManager('localhost', 'STUPUL Civilization');
    const { sessionToken } = authManager.registerTestUser(createTestCitizen('citizen_revoked', 'revoked'));

    // Revocăm sesiunea
    const revoked = authManager.revokeSession(sessionToken);
    expect(revoked).toBe(true);

    const { server, port } = await startHttpServer(authority, 0, { authManager });
    activeServers.push(server);

    const res = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        commandId: 'cmd-revoked-session',
        command: { type: 'CLAIM_PARCEL', x: 1, y: 1, actorId: 'citizen_revoked' },
      }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error.toLowerCase()).toContain('session not found');
  });

  // SCENARIUL 6: Token falsificat / necunoscut respins cu 401 Unauthorized
  it('SEC-06: Token arbitrar falsificat este respins cu 401 Unauthorized', async () => {
    const authority = new Authority(new StateDB(':memory:'));
    const authManager = new AuthManager('localhost', 'STUPUL Civilization');

    const { server, port } = await startHttpServer(authority, 0, { authManager });
    activeServers.push(server);

    const res = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer forged_fake_token_1234567890abcdef',
      },
      body: JSON.stringify({
        commandId: 'cmd-forged-token',
        command: { type: 'CLAIM_PARCEL', x: 1, y: 1, actorId: 'hacker' },
      }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error.toLowerCase()).toContain('session not found');
  });

  // SCENARIUL 7: Modificare neautorizată de politică (SET_POLICY) de către guest este respinsă cu 403
  it('SEC-07: Utilizatorii Guest sau Anonimi nu pot modifica direct politicile orașului (403)', async () => {
    const authority = new Authority(new StateDB(':memory:'));
    const authManager = new AuthManager('localhost', 'STUPUL Civilization');
    const guest = authManager.createGuestSession();

    const { server, port } = await startHttpServer(authority, 0, { authManager });
    activeServers.push(server);

    const res = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${guest.sessionToken}`,
      },
      body: JSON.stringify({
        commandId: 'cmd-guest-policy-exploit',
        command: { type: 'SET_POLICY', policyKey: 'taxRatePercent', value: 0, actorId: guest.identity.actorId },
      }),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('guest and anonymous accounts cannot directly modify city policies');
  });

  // SCENARIUL 8: Modificarea unei parcele a altui cetățean este respinsă la nivel de resursă (403)
  it('SEC-08: Modificarea sau demolarea unei clădiri de pe parcela altui cetățean este respinsă cu 403', async () => {
    const authority = new Authority(new StateDB(':memory:'));
    const authManager = new AuthManager('localhost', 'STUPUL Civilization');
    const { sessionToken: aliceToken } = authManager.registerTestUser(createTestCitizen('citizen_alice', 'alice'));
    const { sessionToken: eveToken } = authManager.registerTestUser(createTestCitizen('citizen_eve', 'eve'));

    const { server, port } = await startHttpServer(authority, 0, { authManager });
    activeServers.push(server);

    // Alice revendică și construiește o casă pe parcela (6, 6)
    const claimRes = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aliceToken}` },
      body: JSON.stringify({
        commandId: 'alice-claim-6-6',
        command: { type: 'CLAIM_PARCEL', x: 6, y: 6, actorId: 'citizen_alice' },
      }),
    });
    expect((await claimRes.json()).applied).toBe(true);

    const buildRes = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aliceToken}` },
      body: JSON.stringify({
        commandId: 'alice-build-6-6',
        command: { type: 'CONSTRUCT_BUILDING', x: 6, y: 6, buildingType: 'house', actorId: 'citizen_alice' },
      }),
    });
    expect((await buildRes.json()).applied).toBe(true);

    // Eve încearcă să demoleze clădirea lui Alice
    const demolishRes = await fetch(`http://127.0.0.1:${port}/api/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${eveToken}` },
      body: JSON.stringify({
        commandId: 'eve-attack-demolish',
        command: { type: 'DEMOLISH_BUILDING', x: 6, y: 6, actorId: 'citizen_eve' },
      }),
    });

    expect(demolishRes.status).toBe(403);
    const demolishData = await demolishRes.json();
    expect(demolishData.error).toContain("is owned by 'citizen_alice', not 'citizen_eve'");
  });

  // SCENARIUL 9: X-Forwarded-For de la IP ne-de-încredere este ignorat (Anti-IP-Spoofing)
  it('SEC-09: Header X-Forwarded-For de la un peer neîncredere este ignorat și nu poate eluda rate-limitingul', () => {
    const rateLimiter = new MultiDimensionalRateLimiter({
      ipCapacity: 5,
      ipRefillPerSec: 1,
      trustedProxies: ['10.0.0.1'], // Doar 10.0.0.1 este proxy de încredere
    });

    // Simulăm un request direct de la un peer netrusted (ex: 203.0.113.50) care încearcă să injecteze IP-uri false
    const mockUntrustedReq = {
      socket: { remoteAddress: '203.0.113.50' },
      headers: { 'x-forwarded-for': '198.51.100.1, 198.51.100.2' },
    } as any;

    const extractedIp = rateLimiter.extractClientIp(mockUntrustedReq);
    // Trebuie să returneze 203.0.113.50, ignorând headerul injectat
    expect(extractedIp).toBe('203.0.113.50');

    // Dacă provine de la proxy-ul configurat de încredere (10.0.0.1), headerul este onorat
    const mockTrustedReq = {
      socket: { remoteAddress: '10.0.0.1' },
      headers: { 'x-forwarded-for': '198.51.100.99, 10.0.0.1' },
    } as any;

    const extractedTrustedIp = rateLimiter.extractClientIp(mockTrustedReq);
    expect(extractedTrustedIp).toBe('198.51.100.99');
  });

  // SCENARIUL 10: WebAuthn Origin nepermis respins cu eroare de securitate
  it('SEC-10: Verificarea WebAuthn cu origin netrusted este respinsă', () => {
    const authManager = new AuthManager('localhost', 'STUPUL Civilization', 300_000, 86_400_000, [
      'https://stupul.ro',
      'http://localhost:5173',
    ]);

    expect(() => {
      authManager.verifyLogin({
        actorId: 'citizen_alice',
        challenge: 'nonexistent_challenge',
        signature: 'fake_sig',
        origin: 'https://phishing-fake-stupul.com', // Atac de phishing origin
      });
    }).toThrow('Untrusted origin: https://phishing-fake-stupul.com');
  });

  // SCENARIUL 11: Replay Attack pe același challenge WebAuthn este blocat
  it('SEC-11: Challenge-ul WebAuthn este consumat atomic și nu permite replay attack', () => {
    const authManager = new AuthManager('localhost', 'STUPUL Civilization', 300_000);
    const reg = authManager.createRegistrationChallenge('citizen_secure');

    // Prima înregistrare reușește
    const regResult = authManager.verifyRegistration({
      username: 'citizen_secure',
      challenge: reg.challenge,
      credentialId: 'cred_unique_abc',
      publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A\n-----END PUBLIC KEY-----',
    });
    expect(regResult.sessionToken).toBeDefined();

    // Replay attack cu același challenge este respins
    expect(() => {
      authManager.verifyRegistration({
        username: 'citizen_secure',
        challenge: reg.challenge,
        credentialId: 'cred_duplicate_replay',
        publicKeyPem: 'mock_pem',
      });
    }).toThrow('Invalid or unknown challenge');
  });

});
