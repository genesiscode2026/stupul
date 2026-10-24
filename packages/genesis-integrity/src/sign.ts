import {
  generateKeyPairSync,
  sign as cryptoSign,
  verify as cryptoVerify,
} from 'node:crypto';

/**
 * Semnare Ed25519 (algoritm standard, auditat) pentru manifestul GENESIS.
 * Cheile private NU trebuie comise în repository.
 * În dezvoltare se folosește o cheie DEV, generată local, marcată explicit.
 */

export interface KeyPair {
  /** Cheie publică PEM (SPKI) — sigură de publicat. */
  publicKeyPem: string;
  /** Cheie privată PEM (PKCS#8) — NICIOdată în cod/arhive. */
  privateKeyPem: string;
}

export function generateSigningKeyPair(): KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return {
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  };
}

export function signPayload(privateKeyPem: string, payload: string | Buffer): string {
  const sig = cryptoSign(null, Buffer.from(payload), privateKeyPem);
  return sig.toString('base64');
}

export function verifySignature(publicKeyPem: string, payload: string | Buffer, signatureB64: string): boolean {
  try {
    return cryptoVerify(null, Buffer.from(payload), publicKeyPem, Buffer.from(signatureB64, 'base64'));
  } catch {
    return false;
  }
}
