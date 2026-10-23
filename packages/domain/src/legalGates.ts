import { LegalGate } from './types.js';

/**
 * Checks whether commercial monetization is legally authorized.
 * Invariant LEG-004, LEG-T05:
 * Monetization MUST remain strictly false unless every single gate requirement is satisfied:
 * - Operator legal entity formally verified
 * - IP inventory formally reviewed and signed
 * - License agreement executed with 5% royalty
 * - Legal counsel approved
 * - Tax compliance reviewed
 * - GDPR and consumer compliance reviewed
 */
export function mayMonetize(gate: LegalGate): boolean {
  if (!gate) return false;
  return Boolean(
    gate.operatorVerified &&
    gate.ipInventoryReviewed &&
    gate.licenseExecuted &&
    gate.counselApproved &&
    gate.taxPaymentReviewed &&
    gate.gdprCompliant
  );
}

/**
 * Default safe production state: Fail-closed!
 */
export const DEFAULT_LOCKED_LEGAL_GATE: LegalGate = {
  operatorVerified: false,
  ipInventoryReviewed: false,
  licenseExecuted: false,
  counselApproved: false,
  taxPaymentReviewed: false,
  gdprCompliant: false
};
