import { ActorId } from './types.js';

export type AccountMode = 'guest' | 'registered_citizen' | 'official_contributor' | 'admin';

export interface UserIdentity {
  actorId: ActorId;
  username: string;
  mode: AccountMode;
  /** Identificator credențial WebAuthn / Passkey (hardware token / TouchID / FaceID). */
  passkeyCredentialId?: string;
  /** Cheie publică WebAuthn (NICIODATĂ cheie privată). */
  passkeyPublicKeyPem?: string;
  civicScore: number;
  registeredAtMs?: number;
  lastActiveMs: number;
}

export type CivicAction =
  | 'EXPLORE'
  | 'PLAY_SIMULATION'
  | 'CLAIM_PARCEL'
  | 'CONSTRUCT'
  | 'VOTE_ORDINARY_POLICY'
  | 'VOTE_CONSTITUTION'
  | 'SUBMIT_CONTRIBUTION'
  | 'APPROVE_REWARD';

/**
 * Creează o identitate temporară de Oaspete (Guest) pentru explorare fără cont.
 * Respectă principiul P6: intrare instantanee fără bariere sau colectare de date.
 */
export function createGuestIdentity(seed = Math.floor(Math.random() * 10000)): UserIdentity {
  return {
    actorId: `oaspete_${seed}`,
    username: `Oaspete-${seed}`,
    mode: 'guest',
    civicScore: 0,
    lastActiveMs: Date.now(),
  };
}

/**
 * Înregistrare cetățean cu Passkey (WebAuthn).
 * Minimizare date (P6): nu se stochează nume real, email, telefon sau date biometrice.
 * Autentificarea se bazează exclusiv pe criptografie asimetrică.
 */
export function registerCitizenWithPasskey(params: {
  actorId: ActorId;
  username: string;
  passkeyCredentialId: string;
  passkeyPublicKeyPem: string;
  nowMs?: number;
}): UserIdentity {
  if (!params.username.trim() || params.username.length < 3) {
    throw new Error('Numele de utilizator civic trebuie să aibă minim 3 caractere');
  }
  if (!params.passkeyCredentialId.trim()) {
    throw new Error('Identificatorul de credențial Passkey este obligatoriu');
  }

  return {
    actorId: params.actorId,
    username: params.username.trim(),
    mode: 'registered_citizen',
    passkeyCredentialId: params.passkeyCredentialId,
    passkeyPublicKeyPem: params.passkeyPublicKeyPem,
    civicScore: 10, // Puncte civice inițiale de bun venit
    registeredAtMs: params.nowMs ?? Date.now(),
    lastActiveMs: params.nowMs ?? Date.now(),
  };
}

/**
 * Verifică dreptul de a executa o acțiune civică în funcție de modul contului.
 */
export function canPerformCivicAction(
  identity: UserIdentity,
  action: CivicAction
): { allowed: boolean; reason?: string } {
  // Oaspeții pot explora și rula simularea locală
  if (identity.mode === 'guest') {
    if (action === 'EXPLORE' || action === 'PLAY_SIMULATION') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Acțiunea ${action} necesită înregistrarea gratuită a unui cont civic de cetățean (Passkey) pentru persistență și integritate comunitară.`,
    };
  }

  // Cetățenii înregistrați pot construi, revendica parcele și vota politici
  if (identity.mode === 'registered_citizen') {
    if (action === 'APPROVE_REWARD') {
      return {
        allowed: false,
        reason: 'Aprobarea recompenselor civice este rezervată administratorilor și recenzorilor validați',
      };
    }
    return { allowed: true };
  }

  // Contributorii oficiali și adminii au acces complet conform rolului
  return { allowed: true };
}
