import { describe, it, expect } from 'vitest';
import { AuthManager } from '../packages/server/src/auth.js';

describe('Securitate Autentificare WebAuthn & Sesiuni Anonime Guest (AUTH-T01 - AUTH-T06)', () => {
  it('AUTH-T01: Înregistrare WebAuthn generează challenge criptografic unic cu TTL 5 minute', () => {
    const auth = new AuthManager('localhost', 'STUPUL Civilization', 300_000);
    const reg = auth.createRegistrationChallenge('cetatean_elena');

    expect(reg.challenge).toBeDefined();
    expect(reg.challenge.length).toBeGreaterThan(20);
    expect(reg.rpId).toBe('localhost');
    expect(reg.user.name).toBe('cetatean_elena');
    expect(reg.user.id).toBeDefined();
  });

  it('AUTH-T02: Verificare înregistrare emite sesiune și previne Replay Attacks pe același challenge', () => {
    const auth = new AuthManager('localhost', 'STUPUL Civilization', 300_000);
    const reg = auth.createRegistrationChallenge('cetatean_radu');

    const result = auth.verifyRegistration({
      username: 'cetatean_radu',
      challenge: reg.challenge,
      credentialId: 'cred_mock_pubkey_12345',
      publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\n-----END PUBLIC KEY-----',
    });

    expect(result.sessionToken).toBeDefined();
    expect(result.identity.username).toBe('cetatean_radu');
    expect(result.identity.actorId).toContain('cetatean_');

    // Tentativă de reutilizare a aceluiași challenge (Replay Attack) -> EROARE
    expect(() => {
      auth.verifyRegistration({
        username: 'cetatean_radu',
        challenge: reg.challenge,
        credentialId: 'cred_mock_pubkey_67890',
        publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\n-----END PUBLIC KEY-----',
      });
    }).toThrow('Invalid or unknown challenge');
  });

  it('AUTH-T03: Challenge-ul expirat este respins automat conform TTL', () => {
    // TTL de 1 milisecundă
    const auth = new AuthManager('localhost', 'STUPUL Civilization', 1);
    const reg = auth.createRegistrationChallenge('cetatean_expirat');

    // Așteptăm 10ms pentru a depăși TTL
    const start = Date.now();
    while (Date.now() - start < 10) {}

    expect(() => {
      auth.verifyRegistration({
        username: 'cetatean_expirat',
        challenge: reg.challenge,
        credentialId: 'cred_mock_expirat',
        publicKeyPem: 'pem_data',
      });
    }).toThrow('Challenge expired');
  });

  it('AUTH-T04: Flux complet Login WebAuthn cu challenge separat și protecție anti-replay', () => {
    const auth = new AuthManager('localhost', 'STUPUL Civilization', 300_000);
    const reg = auth.createRegistrationChallenge('cetatean_vlad');
    const { identity } = auth.verifyRegistration({
      username: 'cetatean_vlad',
      challenge: reg.challenge,
      credentialId: 'cred_vlad_999',
      publicKeyPem: 'pem_vlad',
    });

    // Login challenge
    const loginCh = auth.createLoginChallenge(identity.actorId);
    expect(loginCh.challenge).toBeDefined();

    // Verificare autentificare
    const loginRes = auth.verifyLogin({
      actorId: identity.actorId,
      challenge: loginCh.challenge,
      signature: 'mock_signature_valid',
    });

    expect(loginRes.sessionToken).toBeDefined();
    expect(loginRes.identity.actorId).toBe(identity.actorId);

    // Replay attack pe login challenge -> respins
    expect(() => {
      auth.verifyLogin({
        actorId: identity.actorId,
        challenge: loginCh.challenge,
        signature: 'mock_signature_valid',
      });
    }).toThrow('Invalid or unknown challenge');
  });

  it('AUTH-T05: Sesiune anonimă de tip Oaspete (Guest) cu zero-PII și validare token', () => {
    const auth = new AuthManager('localhost', 'STUPUL Civilization');
    const guest = auth.createGuestSession();

    expect(guest.sessionToken).toBeDefined();
    expect(guest.identity.mode).toBe('guest');
    expect(guest.identity.actorId).toContain('oaspete_');

    const verified = auth.verifySession(guest.sessionToken);
    expect(verified.valid).toBe(true);
    expect(verified.identity?.actorId).toBe(guest.identity.actorId);

    // Revocare sesiune (Logout)
    auth.revokeSession(guest.sessionToken);
    const postLogout = auth.verifySession(guest.sessionToken);
    expect(postLogout.valid).toBe(false);
  });

  it('AUTH-T06: Credential ID duplicat este respins la înregistrare', () => {
    const auth = new AuthManager('localhost', 'STUPUL Civilization');
    const reg1 = auth.createRegistrationChallenge('user1');
    auth.verifyRegistration({
      username: 'user1',
      challenge: reg1.challenge,
      credentialId: 'shared_credential_id',
      publicKeyPem: 'pem_1',
    });

    const reg2 = auth.createRegistrationChallenge('user2');
    expect(() => {
      auth.verifyRegistration({
        username: 'user2',
        challenge: reg2.challenge,
        credentialId: 'shared_credential_id',
        publicKeyPem: 'pem_2',
      });
    }).toThrow('Credential ID already registered');
  });
});
