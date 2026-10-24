import { randomBytes } from 'node:crypto';
import { UserIdentity, createGuestIdentity, registerCitizenWithPasskey } from '@stupul/domain';

export interface AuthSession {
  token: string;
  actorId: string;
  identity: UserIdentity;
  createdAtMs: number;
  expiresAtMs: number;
}

export interface AuthChallenge {
  challenge: string;
  userId?: string;
  username?: string;
  createdAtMs: number;
  expiresAtMs: number;
  consumed: boolean;
}

export class AuthManager {
  private challenges = new Map<string, AuthChallenge>();
  private sessions = new Map<string, AuthSession>();
  private registeredUsers = new Map<string, UserIdentity>(); // actorId -> UserIdentity
  private userByCredential = new Map<string, string>(); // credentialId -> actorId

  constructor(
    public readonly rpId: string = 'localhost',
    public readonly rpName: string = 'STUPUL Civilization',
    private readonly challengeTtlMs: number = 300_000, // 5 min
    private readonly sessionTtlMs: number = 86_400_000 // 24 hours
  ) {}

  /**
   * Generează un challenge criptografic pentru înregistrare WebAuthn.
   */
  createRegistrationChallenge(username: string): {
    challenge: string;
    rpId: string;
    rpName: string;
    user: { id: string; name: string; displayName: string };
  } {
    if (!username || username.trim().length < 3) {
      throw new Error('Username must have at least 3 characters');
    }

    const challenge = randomBytes(32).toString('base64url');
    const userId = randomBytes(16).toString('hex');
    const now = Date.now();

    this.challenges.set(challenge, {
      challenge,
      userId,
      username: username.trim(),
      createdAtMs: now,
      expiresAtMs: now + this.challengeTtlMs,
      consumed: false,
    });

    return {
      challenge,
      rpId: this.rpId,
      rpName: this.rpName,
      user: {
        id: userId,
        name: username.trim(),
        displayName: username.trim(),
      },
    };
  }

  /**
   * Validează răspunsul WebAuthn la înregistrare și emite sesiune.
   */
  verifyRegistration(params: {
    username: string;
    challenge: string;
    credentialId: string;
    publicKeyPem: string;
    origin?: string;
  }): { sessionToken: string; identity: UserIdentity } {
    const chRecord = this.challenges.get(params.challenge);
    if (!chRecord) {
      throw new Error('Invalid or unknown challenge');
    }
    if (chRecord.consumed) {
      throw new Error('Challenge already consumed (replay attack prevention)');
    }
    if (Date.now() > chRecord.expiresAtMs) {
      this.challenges.delete(params.challenge);
      throw new Error('Challenge expired');
    }

    // Consumă challenge-ul imediat
    chRecord.consumed = true;
    this.challenges.delete(params.challenge);

    if (this.userByCredential.has(params.credentialId)) {
      throw new Error('Credential ID already registered');
    }

    const actorId = `cetatean_${chRecord.userId || randomBytes(8).toString('hex')}`;
    const identity = registerCitizenWithPasskey({
      actorId,
      username: params.username,
      passkeyCredentialId: params.credentialId,
      passkeyPublicKeyPem: params.publicKeyPem,
    });

    this.registeredUsers.set(actorId, identity);
    this.userByCredential.set(params.credentialId, actorId);

    const session = this.createSession(identity);
    return { sessionToken: session.token, identity };
  }

  /**
   * Generează challenge de autentificare (login).
   */
  createLoginChallenge(actorId: string): { challenge: string; rpId: string } {
    const identity = this.registeredUsers.get(actorId);
    if (!identity) {
      throw new Error(`User not found: ${actorId}`);
    }

    const challenge = randomBytes(32).toString('base64url');
    const now = Date.now();

    this.challenges.set(challenge, {
      challenge,
      userId: actorId,
      createdAtMs: now,
      expiresAtMs: now + this.challengeTtlMs,
      consumed: false,
    });

    return {
      challenge,
      rpId: this.rpId,
    };
  }

  /**
   * Validează autentificarea și emite sesiune.
   */
  verifyLogin(params: {
    actorId: string;
    challenge: string;
    signature: string;
  }): { sessionToken: string; identity: UserIdentity } {
    const chRecord = this.challenges.get(params.challenge);
    if (!chRecord) {
      throw new Error('Invalid or unknown challenge');
    }
    if (chRecord.consumed) {
      throw new Error('Challenge already consumed (anti-replay)');
    }
    if (Date.now() > chRecord.expiresAtMs) {
      this.challenges.delete(params.challenge);
      throw new Error('Challenge expired');
    }
    if (chRecord.userId !== params.actorId) {
      throw new Error('Challenge user mismatch');
    }

    chRecord.consumed = true;
    this.challenges.delete(params.challenge);

    const identity = this.registeredUsers.get(params.actorId);
    if (!identity) {
      throw new Error(`User not found: ${params.actorId}`);
    }

    if (!params.signature || params.signature.trim().length === 0) {
      throw new Error('Signature required');
    }

    identity.lastActiveMs = Date.now();
    const session = this.createSession(identity);
    return { sessionToken: session.token, identity };
  }

  /**
   * Creează o sesiune anonimă de Oaspete (Guest) cu zero-PII.
   */
  createGuestSession(): { sessionToken: string; identity: UserIdentity } {
    const identity = createGuestIdentity();
    const session = this.createSession(identity);
    return { sessionToken: session.token, identity };
  }

  /**
   * Verifică valabilitatea unui token de sesiune.
   */
  verifySession(token: string): { valid: boolean; identity?: UserIdentity; error?: string } {
    if (!token) return { valid: false, error: 'missing token' };
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    const s = this.sessions.get(cleanToken);
    if (!s) {
      return { valid: false, error: 'session not found' };
    }
    if (Date.now() > s.expiresAtMs) {
      this.sessions.delete(cleanToken);
      return { valid: false, error: 'session expired' };
    }
    s.identity.lastActiveMs = Date.now();
    return { valid: true, identity: s.identity };
  }

  revokeSession(token: string): void {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    this.sessions.delete(cleanToken);
  }

  private createSession(identity: UserIdentity): AuthSession {
    const token = randomBytes(32).toString('hex');
    const now = Date.now();
    const session: AuthSession = {
      token,
      actorId: identity.actorId,
      identity,
      createdAtMs: now,
      expiresAtMs: now + this.sessionTtlMs,
    };
    this.sessions.set(token, session);
    return session;
  }
}
