import { EligibleReceipts, RoyaltyCalculation } from './types.js';

/**
 * Calculates founder contractual royalty (5%) strictly based on Eligible Receipts.
 * Invariant LEG-001, LEG-T01, LEG-T02, LEG-T03:
 * Formula:
 *   EligibleReceipts = GrossCollected - Taxes - Refunds - Chargebacks - ProcessorFees + AffiliatedCoveredReceipts
 *   RoyaltyGross = EligibleReceipts * 0.05
 * 
 * General operational expenses, marketing, server costs, salaries DO NOT reduce the eligible base.
 */
export function calculateRoyalties(
  receipts: EligibleReceipts,
  withholdingTaxRate: number = 0.0
): RoyaltyCalculation {
  const sanitize = (n: number, field: string): number => {
    if (!Number.isFinite(n) || n < 0) {
      throw new Error(`LEG-001: Invalid financial input for ${field}: ${n}`);
    }
    return n;
  };

  const gross = sanitize(receipts.gross, 'gross');
  const tax = sanitize(receipts.collectedTax, 'collectedTax');
  const refunds = sanitize(receipts.refunds, 'refunds');
  const chargebacks = sanitize(receipts.refundedChargebacks, 'refundedChargebacks');
  const fees = sanitize(receipts.directProcessorFees, 'directProcessorFees');
  const affiliated = sanitize(receipts.relatedPartyRevenue || 0, 'relatedPartyRevenue');

  const totalCollected = gross + affiliated;
  const deductions = tax + refunds + chargebacks + fees;

  const eligible = Math.max(0, totalCollected - deductions);
  const founderRoyaltyGross = eligible * 0.05;

  const withholdingTax = founderRoyaltyGross * Math.min(1, Math.max(0, withholdingTaxRate));
  const founderRoyaltyNetPayable = founderRoyaltyGross - withholdingTax;

  return {
    gross: totalCollected,
    deductions,
    eligible,
    founderRoyaltyGross,
    withholdingTax,
    founderRoyaltyNetPayable
  };
}

/**
 * Evaluates whether an external codebase/product owes royalties.
 * Invariant LEG-T04:
 * A clean-room independent reimplementation without licensed original IP,
 * without trademarks, and without an executed operator contract OWES ZERO (0) royalties.
 */
export function assessProductRoyaltyObligation(params: {
  usesLicensedIP: boolean;
  usesStupulTrademarks: boolean;
  hasExecutedContract: boolean;
  isCoveredAffiliateOrSuccessor: boolean;
}): { owesRoyalty: boolean; reason: string } {
  if (params.hasExecutedContract || params.isCoveredAffiliateOrSuccessor) {
    return {
      owesRoyalty: true,
      reason: 'Contractual obligation under license agreement / covered entity'
    };
  }

  if (params.usesLicensedIP || params.usesStupulTrademarks) {
    return {
      owesRoyalty: true,
      reason: 'Use of proprietary protected assets / trademarks without clean exemption'
    };
  }

  // LEG-T04: Independent reimplementation without IP/contract
  return {
    owesRoyalty: false,
    reason: 'LEG-T04: Independent clean reimplementation without licensed IP owes zero royalty'
  };
}
