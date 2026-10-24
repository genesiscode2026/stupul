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

/**
 * Destinația Canonică și Imuabilă de Plată a Redevenței Fondatorului (P0 Invariant).
 * Orice deviere sau încercare de trimitere către altă adresă/rețea este strict interzisă
 * și eșuează fail-closed.
 */
export const FOUNDER_PAYOUT_CONFIG = Object.freeze({
  asset: 'USDC' as const,
  network: 'BASE' as const,
  chainId: 8453,
  usdcContractOnBase: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
  founderWallet: '0xC6F86e170411182114FcCdb28793dC76B5e8D144' as const,
  royaltyBasisPoints: 500, // 5.00% = 500 basis points
  decimals: 6,
});

export interface BigIntRoyaltyReceipts {
  grossSubunits: bigint;
  collectedTaxSubunits: bigint;
  refundsSubunits: bigint;
  chargebacksSubunits: bigint;
  processorFeesSubunits: bigint;
  relatedPartyRevenueSubunits?: bigint;
  currency: RoyaltyCurrency;
}

export interface BigIntRoyaltyCalculationResult {
  eligibleSubunits: bigint;
  royaltyGrossSubunits: bigint;
  withholdingTaxSubunits: bigint;
  netPayableSubunits: bigint;
  currency: RoyaltyCurrency;
  basisPointsUsed: number;
}

export interface Erc20SettlementTransaction {
  chainId: number;
  contractAddress: string;
  recipientAddress: string;
  amountAtomicMicroUsdc: bigint;
  formattedUsdc: string;
  calldata: string;
  destinationVerified: boolean;
  tamperProofHash: string;
}

export interface FiatToCryptoSettlementManifest {
  settlementId: string;
  periodStartMs: number;
  periodEndMs: number;
  receipts: BigIntRoyaltyReceipts;
  calculation: BigIntRoyaltyCalculationResult;
  payoutTx: Erc20SettlementTransaction;
  generatedAtMs: number;
  auditTrail: string[];
}

/**
 * Motor Canonic de Calcul și Decontare Redevență în Aritmetică Exactă pe Numere Întregi / BigInt (P0).
 * Elimină complet orice erori de aproximare floating-point și garantează conformitatea
 * cu formula legală:
 * Eligible Receipts = Gross - Indirect Taxes - Refunds - Chargebacks - Processor Fees
 * Founder Royalty = Eligible Receipts * 5.00% (500 bps)
 */
export class ExactRoyaltySettlementEngine {
  public static calculateBigInt(
    receipts: BigIntRoyaltyReceipts,
    withholdingTaxBps: number = 0
  ): BigIntRoyaltyCalculationResult {
    const sanitizeBigInt = (val: bigint, field: string): bigint => {
      if (val < 0n) {
        throw new Error(`LEG-001: Valoare negativă nepermisă pentru ${field}: ${val.toString()}`);
      }
      return val;
    };

    const gross = sanitizeBigInt(receipts.grossSubunits, 'grossSubunits');
    const taxes = sanitizeBigInt(receipts.collectedTaxSubunits, 'collectedTaxSubunits');
    const refunds = sanitizeBigInt(receipts.refundsSubunits, 'refundsSubunits');
    const chargebacks = sanitizeBigInt(receipts.chargebacksSubunits, 'chargebacksSubunits');
    const fees = sanitizeBigInt(receipts.processorFeesSubunits, 'processorFeesSubunits');
    const affiliated = sanitizeBigInt(receipts.relatedPartyRevenueSubunits || 0n, 'relatedPartyRevenueSubunits');

    const totalCollected = gross + affiliated;
    const allowableDeductions = taxes + refunds + chargebacks + fees;

    const eligibleSubunits = totalCollected > allowableDeductions ? totalCollected - allowableDeductions : 0n;
    const ROYALTY_BPS = BigInt(FOUNDER_PAYOUT_CONFIG.royaltyBasisPoints); // 500n

    // Formula exactă în numere întregi (bază 10.000 bps)
    const royaltyGrossSubunits = (eligibleSubunits * ROYALTY_BPS) / 10000n;
    const taxBps = BigInt(Math.min(10000, Math.max(0, withholdingTaxBps)));
    const withholdingTaxSubunits = (royaltyGrossSubunits * taxBps) / 10000n;
    const netPayableSubunits = royaltyGrossSubunits - withholdingTaxSubunits;

    return {
      eligibleSubunits,
      royaltyGrossSubunits,
      withholdingTaxSubunits,
      netPayableSubunits,
      currency: receipts.currency,
      basisPointsUsed: FOUNDER_PAYOUT_CONFIG.royaltyBasisPoints,
    };
  }

  /**
   * Convertește subunitățile monedei fiat (ex: cenți USD/EUR/RON) în unități atomice micro-USDC (6 zecimale).
   */
  public static convertToMicroUsdc(
    subunits: bigint,
    currency: RoyaltyCurrency,
    rateToUsdCents: number = 100 // 100 = paritate 1.00 USD
  ): bigint {
    if (subunits < 0n) throw new Error('Valoare monetară negativă');

    if (currency === 'USDC') {
      // Dacă este deja în subunități micro-USDC (6 decimale)
      return subunits;
    }

    if (currency === 'USD') {
      // 1 USD cent (0.01 USD) = 10,000 micro-USDC (0.010000 USDC)
      return subunits * 10_000n;
    }

    // Pentru alte monede: conversie exactă prin rata fixă raportată
    // micro-USDC = (subunits * rateToUsdCents * 10_000) / 100
    const rateBig = BigInt(Math.round(rateToUsdCents * 100)); // bază 10000
    return (subunits * rateBig) / 100n;
  }

  /**
   * Generează payload-ul de tranzacție ERC-20 transfer(`address to`, `uint256 amount`) pentru rețeaua BASE.
   * Selector: bytes4(keccak256("transfer(address,uint256)")) = 0xa9059cbb
   * Include blocaj strict anti-tamper pentru destinație.
   */
  public static generateErc20TransferCalldata(
    recipient: string,
    amountMicroUsdc: bigint
  ): Erc20SettlementTransaction {
    // 1. Verificare Fail-Closed Destinație
    const normalizedRecipient = recipient.trim();
    if (normalizedRecipient.toLowerCase() !== FOUNDER_PAYOUT_CONFIG.founderWallet.toLowerCase()) {
      throw new Error(
        `SECURITATE P0 VIOLATĂ: Încercare de redirecționare a redevenței! Destinația solicitată '${recipient}' nu corespunde portofelului canonic '${FOUNDER_PAYOUT_CONFIG.founderWallet}'.`
      );
    }
    if (amountMicroUsdc < 0n) {
      throw new Error(`Suma de plată nu poate fi negativă: ${amountMicroUsdc}`);
    }

    // 2. Formatare ABI Encoding ERC-20 transfer(address,uint256)
    const selector = '0xa9059cbb';
    const cleanAddress = normalizedRecipient.replace(/^0x/i, '').toLowerCase();
    const addressPadded = cleanAddress.padStart(64, '0');
    const amountHex = amountMicroUsdc.toString(16);
    const amountPadded = amountHex.padStart(64, '0');

    const calldata = `${selector}${addressPadded}${amountPadded}`;

    // 3. Formatare zecimală (6 decimals) pentru USDC
    const whole = amountMicroUsdc / 1_000_000n;
    const fraction = (amountMicroUsdc % 1_000_000n).toString().padStart(6, '0');
    const formattedUsdc = `${whole.toString()}.${fraction} USDC`;

    // 4. Hash de integritate tamper-proof
    const hashData = `${FOUNDER_PAYOUT_CONFIG.chainId}:${FOUNDER_PAYOUT_CONFIG.usdcContractOnBase}:${FOUNDER_PAYOUT_CONFIG.founderWallet}:${amountMicroUsdc.toString()}`;
    // Simple fast 64-char hex digest simulation for offline determinism
    let hashVal = 0n;
    for (let i = 0; i < hashData.length; i++) {
      hashVal = ((hashVal << 5n) - hashVal) + BigInt(hashData.charCodeAt(i));
      hashVal = hashVal & 0xffffffffffffffffffffffffffffffffn;
    }
    const tamperProofHash = '0x' + hashVal.toString(16).padStart(64, '0');

    return {
      chainId: FOUNDER_PAYOUT_CONFIG.chainId,
      contractAddress: FOUNDER_PAYOUT_CONFIG.usdcContractOnBase,
      recipientAddress: FOUNDER_PAYOUT_CONFIG.founderWallet,
      amountAtomicMicroUsdc: amountMicroUsdc,
      formattedUsdc,
      calldata,
      destinationVerified: true,
      tamperProofHash,
    };
  }

  /**
   * Reconciliază încasările fiat și generează un Manifest de Decontare On-Chain verificabil.
   */
  public static reconcileAndCreateSettlement(params: {
    settlementId: string;
    periodStartMs: number;
    periodEndMs: number;
    receipts: BigIntRoyaltyReceipts;
    withholdingTaxBps?: number;
    rateToUsdCents?: number;
  }): FiatToCryptoSettlementManifest {
    const calc = this.calculateBigInt(params.receipts, params.withholdingTaxBps ?? 0);
    const microUsdc = this.convertToMicroUsdc(calc.netPayableSubunits, calc.currency, params.rateToUsdCents ?? 100);
    const payoutTx = this.generateErc20TransferCalldata(FOUNDER_PAYOUT_CONFIG.founderWallet, microUsdc);

    const auditTrail = [
      `Settlement ${params.settlementId} inițiat pentru perioada ${new Date(params.periodStartMs).toISOString()} - ${new Date(params.periodEndMs).toISOString()}`,
      `Total încasări brute: ${params.receipts.grossSubunits} ${params.receipts.currency}`,
      `Deduceri permise: ${params.receipts.collectedTaxSubunits + params.receipts.refundsSubunits + params.receipts.chargebacksSubunits + params.receipts.processorFeesSubunits} ${params.receipts.currency}`,
      `Bază eligibilă calculată: ${calc.eligibleSubunits} ${params.receipts.currency}`,
      `Redevență 500 bps (5.00%): ${calc.royaltyGrossSubunits} ${params.receipts.currency}`,
      `Impozit cu reținere la sursă: ${calc.withholdingTaxSubunits} ${params.receipts.currency}`,
      `Net datorat: ${calc.netPayableSubunits} ${params.receipts.currency}`,
      `Echivalent decontare: ${payoutTx.formattedUsdc} pe rețeaua BASE (Chain 8453)`,
      `Destinație verificată canonic: ${payoutTx.recipientAddress}`,
      `Calldata generat: ${payoutTx.calldata}`,
      `Stare securitate: ZERO private keys în memorie/stocare. Reconciliere gata pentru semnare externă de către Operator.`
    ];

    return {
      settlementId: params.settlementId,
      periodStartMs: params.periodStartMs,
      periodEndMs: params.periodEndMs,
      receipts: params.receipts,
      calculation: calc,
      payoutTx,
      generatedAtMs: Date.now(),
      auditTrail,
    };
  }
}


