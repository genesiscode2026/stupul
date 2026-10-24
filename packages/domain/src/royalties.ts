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

export type RoyaltyCurrency = 'USD' | 'EUR' | 'RON' | 'GBP' | 'USDC';

export interface ExactRoyaltyReceiptsCents {
  grossCents: number;
  collectedTaxCents: number;
  refundsCents: number;
  chargebacksCents: number;
  processorFeesCents: number;
  relatedPartyRevenueCents?: number;
  currency: RoyaltyCurrency;
}

export interface ExactRoyaltyCalculationResult {
  eligibleCents: number;
  royaltyGrossCents: number;
  withholdingTaxCents: number;
  netPayableCents: number;
  currency: RoyaltyCurrency;
  basisPointsUsed: number; // 500 bp = 5.00%
}

/**
 * Calcul de mare precizie în unități monetare întregi (bani / cents) și basis points (500 bp = 5%).
 * Previne erorile de rotunjire IEEE 754 floating point.
 */
export function calculateRoyaltiesExactBps(
  receipts: ExactRoyaltyReceiptsCents,
  withholdingTaxBps: number = 0
): ExactRoyaltyCalculationResult {
  const sanitize = (n: number, field: string): number => {
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      throw new Error(`LEG-001: Valoare monetară întreagă invalidă pentru ${field}: ${n}`);
    }
    return n;
  };

  const gross = sanitize(receipts.grossCents, 'grossCents');
  const tax = sanitize(receipts.collectedTaxCents, 'collectedTaxCents');
  const refunds = sanitize(receipts.refundsCents, 'refundsCents');
  const chargebacks = sanitize(receipts.chargebacksCents, 'chargebacksCents');
  const fees = sanitize(receipts.processorFeesCents, 'processorFeesCents');
  const affiliated = sanitize(receipts.relatedPartyRevenueCents || 0, 'relatedPartyRevenueCents');

  const totalCollected = gross + affiliated;
  const allowableDeductions = tax + refunds + chargebacks + fees;

  const eligibleCents = Math.max(0, totalCollected - allowableDeductions);
  const ROYALTY_BPS = 500; // 5.00% = 500 basis points

  // Calcul exact rotunjit la cel mai apropiat cent întreg
  const royaltyGrossCents = Math.round((eligibleCents * ROYALTY_BPS) / 10000);
  const withholdingTaxCents = Math.round((royaltyGrossCents * Math.min(10000, Math.max(0, withholdingTaxBps))) / 10000);
  const netPayableCents = royaltyGrossCents - withholdingTaxCents;

  return {
    eligibleCents,
    royaltyGrossCents,
    withholdingTaxCents,
    netPayableCents,
    currency: receipts.currency,
    basisPointsUsed: ROYALTY_BPS,
  };
}

/**
 * Verificare anti-deturnare (LEG-T03):
 * Cheltuielile generale (salarii directori, birouri, cloud servere, marketing, bonusuri)
 * NU pot fi deduse din baza eligibilă de calcul.
 */
export function validateNoDivertedExpenses(claimedDeductions: Record<string, number>): void {
  const FORBIDDEN_DEDUCTIONS = [
    'salaries',
    'executive_compensation',
    'management_fees',
    'marketing_costs',
    'ad_spend',
    'office_rent',
    'cloud_hosting',
    'server_costs',
    'travel',
    'legal_retainer',
    'dividends',
  ];

  for (const [key, amount] of Object.entries(claimedDeductions)) {
    if (amount > 0 && FORBIDDEN_DEDUCTIONS.some(f => key.toLowerCase().includes(f))) {
      throw new Error(
        `LEG-T03: Deducerea '${key}' (${amount}) este o cheltuială operațională/generală interzisă la calculul bazei eligibile STUPUL.`
      );
    }
  }
}

export interface RoyaltyInvoice {
  invoiceId: string;
  operatorId: string;
  periodStartMs: number;
  periodEndMs: number;
  amountCents: number;
  currency: RoyaltyCurrency;
  dueDateMs: number;
  paidAmountCents: number;
  status: 'pending' | 'paid' | 'overdue' | 'defaulted';
}

/**
 * Registru de Arierate și Urmărire a Plăților Redevenței (Arrears Ledger)
 */
export class RoyaltyArrearsLedger {
  private invoices = new Map<string, RoyaltyInvoice>();

  public createInvoice(params: {
    invoiceId: string;
    operatorId: string;
    amountCents: number;
    currency: RoyaltyCurrency;
    periodEndMs: number;
    paymentWindowDays?: number;
  }): RoyaltyInvoice {
    const windowDays = params.paymentWindowDays ?? 30;
    const dueDateMs = params.periodEndMs + windowDays * 86_400_000;

    const invoice: RoyaltyInvoice = {
      invoiceId: params.invoiceId,
      operatorId: params.operatorId,
      periodStartMs: params.periodEndMs - 30 * 86_400_000,
      periodEndMs: params.periodEndMs,
      amountCents: params.amountCents,
      currency: params.currency,
      dueDateMs,
      paidAmountCents: 0,
      status: 'pending',
    };

    this.invoices.set(invoice.invoiceId, invoice);
    return invoice;
  }

  public recordPayment(invoiceId: string, amountPaidCents: number): RoyaltyInvoice {
    const inv = this.invoices.get(invoiceId);
    if (!inv) throw new Error(`Factură necunoscută: ${invoiceId}`);

    inv.paidAmountCents += amountPaidCents;
    if (inv.paidAmountCents >= inv.amountCents) {
      inv.status = 'paid';
    }
    return inv;
  }

  public evaluateLicenseStatus(operatorId: string, asOfMs: number): {
    status: 'good_standing' | 'grace_period' | 'default_warning' | 'license_suspended';
    totalOutstandingCents: number;
    overdueDaysMax: number;
    penaltyInterestCents: number;
  } {
    let totalOutstanding = 0;
    let maxOverdueDays = 0;
    let penaltyInterest = 0;

    const PENALTY_BPS_PER_MONTH = 50; // 0.50% pe lună dobândă legală/contractuală

    for (const inv of this.invoices.values()) {
      if (inv.operatorId !== operatorId || inv.status === 'paid') continue;

      const remaining = inv.amountCents - inv.paidAmountCents;
      if (remaining > 0) {
        totalOutstanding += remaining;
        if (asOfMs > inv.dueDateMs) {
          const overdueDays = Math.floor((asOfMs - inv.dueDateMs) / 86_400_000);
          if (overdueDays > maxOverdueDays) maxOverdueDays = overdueDays;

          // Calcul dobândă penalizatoare lunară
          const months = overdueDays / 30;
          penaltyInterest += Math.round((remaining * PENALTY_BPS_PER_MONTH * months) / 10000);
        }
      }
    }

    if (totalOutstanding === 0 || maxOverdueDays <= 0) {
      return { status: 'good_standing', totalOutstandingCents: totalOutstanding, overdueDaysMax: 0, penaltyInterestCents: 0 };
    }

    if (maxOverdueDays <= 15) {
      return { status: 'grace_period', totalOutstandingCents: totalOutstanding, overdueDaysMax: maxOverdueDays, penaltyInterestCents: penaltyInterest };
    }

    if (maxOverdueDays <= 60) {
      return { status: 'default_warning', totalOutstandingCents: totalOutstanding, overdueDaysMax: maxOverdueDays, penaltyInterestCents: penaltyInterest };
    }

    // Peste 60 de zile întârziere -> licența comercială este suspendată de drept
    return { status: 'license_suspended', totalOutstandingCents: totalOutstanding, overdueDaysMax: maxOverdueDays, penaltyInterestCents: penaltyInterest };
  }
}

