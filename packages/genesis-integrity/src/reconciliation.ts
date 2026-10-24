import { ROYALTY_RATE } from './royaltyConstants.js';

export interface ReconciliationTransaction {
  transactionId: string;
  grossReceipts: number;
  /** Venituri prin firme afiliate (anti-deturnare: se atribuie exploatării acoperite). */
  affiliatedReceipts?: number;
  /** Venituri din sublicențe acoperite. */
  sublicenseReceipts?: number;
  indirectTaxes?: number;
  refunds?: number;
  chargebacks?: number;
  permittedDirectProcessorFees?: number;
  currency: string;
}

export interface ReconciliationResult {
  currency: string;
  totalCollected: number;
  deductions: number;
  eligibleReceipts: number;
  founderRoyalty: number;
  royaltyRate: number;
  transactionCount: number;
}

function sanitize(n: number | undefined, field: string): number {
  const v = n ?? 0;
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
    throw new Error(`reconciliation: invalid ${field} = ${v}`);
  }
  return v;
}

/**
 * Formula contractuală (P1-H):
 *   eligibleReceipts = grossReceipts - indirectTaxes - refunds - chargebacks - permittedDirectProcessorFees
 *   founderRoyalty   = eligibleReceipts * 0.05
 * Cheltuielile generale, salariile, marketingul și admin-ul NU reduc baza.
 */
export function reconcileTransaction(tx: ReconciliationTransaction): ReconciliationResult {
  const gross = sanitize(tx.grossReceipts, 'grossReceipts');
  const affiliated = sanitize(tx.affiliatedReceipts, 'affiliatedReceipts');
  const sublicense = sanitize(tx.sublicenseReceipts, 'sublicenseReceipts');
  const taxes = sanitize(tx.indirectTaxes, 'indirectTaxes');
  const refunds = sanitize(tx.refunds, 'refunds');
  const chargebacks = sanitize(tx.chargebacks, 'chargebacks');
  const fees = sanitize(tx.permittedDirectProcessorFees, 'permittedDirectProcessorFees');
  if (!tx.currency || typeof tx.currency !== 'string') {
    throw new Error('reconciliation: invalid currency');
  }

  const totalCollected = gross + affiliated + sublicense;
  const deductions = taxes + refunds + chargebacks + fees;
  const eligible = Math.max(0, totalCollected - deductions);
  const founderRoyalty = eligible * ROYALTY_RATE;

  return {
    currency: tx.currency,
    totalCollected,
    deductions,
    eligibleReceipts: eligible,
    founderRoyalty,
    royaltyRate: ROYALTY_RATE,
    transactionCount: 1,
  };
}

/** Agregare cu deduplicare pe transactionId (previne dubla înregistrare). */
export function reconcileBatch(transactions: ReconciliationTransaction[]): ReconciliationResult {
  const seen = new Set<string>();
  const uniq: ReconciliationTransaction[] = [];
  for (const t of transactions) {
    if (!seen.has(t.transactionId)) {
      seen.add(t.transactionId);
      uniq.push(t);
    }
  }
  if (uniq.length === 0) {
    return { currency: 'USD', totalCollected: 0, deductions: 0, eligibleReceipts: 0, founderRoyalty: 0, royaltyRate: ROYALTY_RATE, transactionCount: 0 };
  }
  const currency = uniq[0].currency;
  let totalCollected = 0;
  let deductions = 0;
  let eligible = 0;
  let royalty = 0;
  for (const t of uniq) {
    const r = reconcileTransaction(t);
    if (r.currency !== currency) {
      throw new Error('reconciliation: mixed currencies in batch');
    }
    totalCollected += r.totalCollected;
    deductions += r.deductions;
    eligible += r.eligibleReceipts;
    royalty += r.founderRoyalty;
  }
  return { currency, totalCollected, deductions, eligibleReceipts: eligible, founderRoyalty: royalty, royaltyRate: ROYALTY_RATE, transactionCount: uniq.length };
}
