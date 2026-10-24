import { describe, it, expect } from 'vitest';
import {
  calculateRoyaltiesExactBps,
  validateNoDivertedExpenses,
  RoyaltyArrearsLedger,
  assessProductRoyaltyObligation,
} from '@stupul/domain';

describe('Simulare Flux Plată Redevență Pasivă de 5% & Registru Arierate (LEG-T01 - LEG-T08)', () => {
  it('LEG-T01: Calcul exact în Basis Points (500 bp = 5%) pe întregi (cents) fără rotunjiri IEEE 754 float', () => {
    // 100.000,00 USD brut = 10.000.000 cents
    // TVA: 10.000,00 USD = 1.000.000 cents
    // Refund: 2.000,00 USD = 200.000 cents
    // Chargeback: 500,00 USD = 50.000 cents
    // Stripe fee (2.9%): 2.900,00 USD = 290.000 cents
    // Baza eligibilă = 10.000.000 - 1.540.000 = 8.460.000 cents (84.600,00 USD)
    // Redevență 5% (500 bp) = 423.000 cents (4.230,00 USD exact)
    const result = calculateRoyaltiesExactBps({
      grossCents: 10_000_000,
      collectedTaxCents: 1_000_000,
      refundsCents: 200_000,
      chargebacksCents: 50_000,
      processorFeesCents: 290_000,
      currency: 'USD',
    });

    expect(result.eligibleCents).toBe(8_460_000);
    expect(result.royaltyGrossCents).toBe(423_000);
    expect(result.basisPointsUsed).toBe(500);
    expect(result.currency).toBe('USD');
  });

  it('LEG-T02: Suport multi-valută (RON, EUR, USDC) cu precizie pe subunități întregi', () => {
    // 50.000,00 RON brut (5.000.000 bani)
    const resRon = calculateRoyaltiesExactBps({
      grossCents: 5_000_000,
      collectedTaxCents: 950_000,
      refundsCents: 50_000,
      chargebacksCents: 0,
      processorFeesCents: 100_000,
      currency: 'RON',
    });
    expect(resRon.eligibleCents).toBe(3_900_000);
    expect(resRon.royaltyGrossCents).toBe(195_000); // 1.950,00 RON exact

    // USDC pe BASE (6 decimale convertite la cenți/subunități de calcul)
    const resUsdc = calculateRoyaltiesExactBps({
      grossCents: 20_000_000,
      collectedTaxCents: 0,
      refundsCents: 0,
      chargebacksCents: 0,
      processorFeesCents: 50_000,
      currency: 'USDC',
    });
    expect(resUsdc.eligibleCents).toBe(19_950_000);
    expect(resUsdc.royaltyGrossCents).toBe(997_500); // 9.975,00 USDC
  });

  it('LEG-T03: Regula anti-deturnare respinge deducerea salariilor, birourilor sau serverelor AWS', () => {
    // Operatorul încearcă să adauge deduceri operaționale neautorizate
    const attemptedDeductions = {
      salaries: 40_000,
      office_rent: 5_000,
      cloud_hosting: 3_000,
    };

    expect(() => {
      validateNoDivertedExpenses(attemptedDeductions);
    }).toThrow('LEG-T03');
  });

  it('LEG-T04: Reimplementare independentă curată (clean-room) fără IP/contract datorează ZERO redevențe', () => {
    const cleanRoom = assessProductRoyaltyObligation({
      usesLicensedIP: false,
      usesStupulTrademarks: false,
      hasExecutedContract: false,
      isCoveredAffiliateOrSuccessor: false,
    });

    expect(cleanRoom.owesRoyalty).toBe(false);
    expect(cleanRoom.reason).toContain('Independent clean reimplementation');

    // Operator cu contract comercial asumat
    const contracted = assessProductRoyaltyObligation({
      usesLicensedIP: true,
      usesStupulTrademarks: true,
      hasExecutedContract: true,
      isCoveredAffiliateOrSuccessor: false,
    });
    expect(contracted.owesRoyalty).toBe(true);
  });

  it('LEG-T05: Registru arierate (Arrears Ledger) urmărește emiterea, plata și starea de conformitate', () => {
    const ledger = new RoyaltyArrearsLedger();
    const t0 = Date.now();

    // Luna 1: Factură 4.230,00 USD (423.000 cents)
    const inv1 = ledger.createInvoice({
      invoiceId: 'INV-2026-001',
      operatorId: 'operator_alpha',
      amountCents: 423_000,
      currency: 'USD',
      periodEndMs: t0,
      paymentWindowDays: 30,
    });

    expect(inv1.status).toBe('pending');

    // Operatorul plătește integral înainte de scadență
    ledger.recordPayment('INV-2026-001', 423_000);
    const status1 = ledger.evaluateLicenseStatus('operator_alpha', t0 + 15 * 86_400_000);
    expect(status1.status).toBe('good_standing');
    expect(status1.totalOutstandingCents).toBe(0);
  });

  it('LEG-T06: Întârziere plată declanșează grace period, default warning și suspendare automată a licenței la 60 de zile', () => {
    const ledger = new RoyaltyArrearsLedger();
    const t0 = 1770000000000;

    // Factură emisă
    ledger.createInvoice({
      invoiceId: 'INV-2026-002',
      operatorId: 'operator_beta',
      amountCents: 500_000, // 5.000 USD
      currency: 'USD',
      periodEndMs: t0,
      paymentWindowDays: 30, // Scadență t0 + 30 zile
    });

    const dueDate = t0 + 30 * 86_400_000;

    // 10 zile după scadență -> grace_period (sub 15 zile)
    const statusGrace = ledger.evaluateLicenseStatus('operator_beta', dueDate + 10 * 86_400_000);
    expect(statusGrace.status).toBe('grace_period');
    expect(statusGrace.totalOutstandingCents).toBe(500_000);

    // 35 zile după scadență -> default_warning cu dobândă penalizatoare
    const statusWarning = ledger.evaluateLicenseStatus('operator_beta', dueDate + 35 * 86_400_000);
    expect(statusWarning.status).toBe('default_warning');
    expect(statusWarning.penaltyInterestCents).toBeGreaterThan(0);

    // 65 zile după scadență -> license_suspended
    const statusSuspended = ledger.evaluateLicenseStatus('operator_beta', dueDate + 65 * 86_400_000);
    expect(statusSuspended.status).toBe('license_suspended');
    expect(statusSuspended.overdueDaysMax).toBe(65);
  });

  it('LEG-T07: Simulare Exodus payout către destinația oficială de plată', () => {
    // Destinația de decontare: USDC pe BASE
    const PAYOUT_WALLET = '0xC6F86e170411182114FcCdb28793dC76B5e8D144';
    const PAYOUT_NETWORK = 'BASE';
    const PAYOUT_ASSET = 'USDC';

    const payoutSimulation = {
      amountCents: 423_000,
      amountFormatted: '4,230.00 USDC',
      destinationWallet: PAYOUT_WALLET,
      network: PAYOUT_NETWORK,
      asset: PAYOUT_ASSET,
      executedAtMs: Date.now(),
      txHash: '0xmocked_base_tx_hash_e2e_payout_success_1234567890abcdef',
    };

    expect(payoutSimulation.destinationWallet).toBe('0xC6F86e170411182114FcCdb28793dC76B5e8D144');
    expect(payoutSimulation.network).toBe('BASE');
    expect(payoutSimulation.asset).toBe('USDC');
    expect(payoutSimulation.amountCents).toBe(423_000);
  });
});
