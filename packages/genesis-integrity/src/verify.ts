import { GenesisManifest, contentHash } from './manifest.js';
import { verifySignature } from './sign.js';
import {
  ROYALTY_FORMULA_ID,
  ROYALTY_RATE_BASIS_POINTS,
} from './royaltyConstants.js';

export interface VerifyManifestResult {
  valid: boolean;
  reason?: string;
}

/**
 * Verifică integritatea manifestului GENESIS:
 * 1. Invarianta redevenței (5%) și formula.
 * 2. Hash-ul conținutului.
 * 3. Semnăturile Ed25519 ale semnatarilor de încredere.
 * 4. Lanțul istoricului de modificări (secvențial + hash-uri).
 */
export function verifyManifest(
  manifest: GenesisManifest,
  trustedSigners: Record<string, string>, // signerId -> publicKeyPem
  options?: { requiredSignatures?: number },
): VerifyManifestResult {
  if (manifest.content.royaltyRateBasisPoints !== ROYALTY_RATE_BASIS_POINTS) {
    return { valid: false, reason: 'royalty rate basis points != 500 (5% invariant violated)' };
  }
  if (manifest.content.royaltyFormulaId !== ROYALTY_FORMULA_ID) {
    return { valid: false, reason: 'royalty formula id changed' };
  }

  const hash = contentHash(manifest.content);
  const required = options?.requiredSignatures ?? 1;
  let validCount = 0;
  for (const s of manifest.signatures) {
    const trustedPem = trustedSigners[s.signerId];
    if (!trustedPem) continue;
    if (s.publicKeyPem !== trustedPem) continue;
    if (verifySignature(trustedPem, hash, s.signature)) validCount++;
  }
  if (validCount < required) {
    return { valid: false, reason: `insufficient valid signatures (${validCount}/${required})` };
  }

  // Lanțul istoricului
  for (let i = 0; i < manifest.changeHistory.length; i++) {
    const rec = manifest.changeHistory[i];
    if (rec.seq !== i + 1) {
      return { valid: false, reason: `change history seq discontinuity at ${i}` };
    }
    if (i === 0) continue;
    if (rec.contentHashBefore !== manifest.changeHistory[i - 1].contentHashAfter) {
      return { valid: false, reason: `change history hash link broken at seq ${rec.seq}` };
    }
  }

  return { valid: true };
}
