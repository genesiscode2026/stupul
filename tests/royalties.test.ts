import { describe, it, expect } from 'vitest';
import {
  calculateRoyalties,
  assessProductRoyaltyObligation,
  mayMonetize,
  DEFAULT_LOCKED_LEGAL_GATE,
  updatePayoutAddress,
  verifyOperationalAdminList,
  LegalGate,
  CustodyRecord
} from '../packages/domain/src/index.js';

describe('Separare Economică și Drepturile Fondatorului (LEG-T01 — LEG-T07)', () => {
  it('LEG-T01: calcul redevență: 100.000 eligibile => exact 5.000 către fondator (5% brut)', () => {
    const calculation = calculateRoyalties({
      gross: 100_000,
      collectedTax: 0,
      refunds: 0,
      refundedChargebacks: 0,
      directProcessorFees: 0
    });

    expect(calculation.eligible).toBe(100_000);
    expect(calculation.founderRoyaltyGross).toBe(5_000);
  });

  it('LEG-T02: 100.000 încasări, 10.000 TVA, 2.000 refunds, 1.000 fee => 87.000 bază, 4.350 redevență brută; cheltuielile generale nu reduc baza', () => {
    const calculation = calculateRoyalties({
      gross: 100_000,
      collectedTax: 10_000,
      refunds: 2_000,
      refundedChargebacks: 0,
      directProcessorFees: 1_000
    });

    expect(calculation.eligible).toBe(87_000);
    expect(calculation.founderRoyaltyGross).toBe(4_350); // 87000 * 0.05
  });

  it('LEG-T03: venit afiliați atribuit exploatării acoperite este inclus în baza de calcul', () => {
    const calculation = calculateRoyalties({
      gross: 50_000,
      collectedTax: 5_000,
      refunds: 1_000,
      refundedChargebacks: 0,
      directProcessorFees: 500,
      relatedPartyRevenue: 20_000 // Affiliated revenue cannot be diverted
    });

    // Total gross = 50000 + 20000 = 70000. Deductions = 5000 + 1000 + 500 = 6500. Eligible = 63500.
    expect(calculation.eligible).toBe(63_500);
    expect(calculation.founderRoyaltyGross).toBe(3_175); // 63500 * 0.05
  });

  it('LEG-T04: reimplementare independentă fără IP licențiat și fără contract => ZERO creanță de 5%', () => {
    const cleanReimplementation = assessProductRoyaltyObligation({
      usesLicensedIP: false,
      usesStupulTrademarks: false,
      hasExecutedContract: false,
      isCoveredAffiliateOrSuccessor: false
    });

    expect(cleanReimplementation.owesRoyalty).toBe(false);
    expect(cleanReimplementation.reason).toContain('LEG-T04');
  });

  it('LEG-T05: fără operator și licență verificate => mayMonetize este strict false (fail-closed)', () => {
    // Default production state: fail-closed!
    expect(mayMonetize(DEFAULT_LOCKED_LEGAL_GATE)).toBe(false);

    // Incomplete gate (e.g. counsel missing)
    const partialGate: LegalGate = {
      operatorVerified: true,
      ipInventoryReviewed: true,
      licenseExecuted: true,
      counselApproved: false, // NOT approved
      taxPaymentReviewed: true,
      gdprCompliant: true
    };
    expect(mayMonetize(partialGate)).toBe(false);

    // Fully approved gate
    const fullGate: LegalGate = {
      ...partialGate,
      counselApproved: true
    };
    expect(mayMonetize(fullGate)).toBe(true);
  });

  it('LEG-T06: schimbarea adresei de plată necesită autorizații multi-semnătură și audit log, respinge modificarea anonimă', () => {
    const custody: CustodyRecord = {
      payoutDestination: {
        asset: 'USDC',
        network: 'BASE',
        address: '0xC6F86e170411182114FcCdb28793dC76B5e8D144',
        label: 'Founder Exodus Custody'
      },
      lastAuditedAtMs: 1000,
      authorizedSigners: ['custodian1', 'custodian2', 'founder_rep'],
      requiredSignatures: 2,
      changeAuditLog: []
    };

    const newAddr = '0x1111111111111111111111111111111111111111';

    // Attempt 1: only 1 signature when 2 required -> REJECTED
    expect(() => {
      updatePayoutAddress(custody, newAddr, 'custodian1', ['custodian1'], 'Routine rotation', 2000);
    }).toThrow(/LEG-T06: Insufficient authorized signatures/);

    // Attempt 2: 2 authorized signatures -> ACCEPTED and logged
    const updated = updatePayoutAddress(
      custody,
      newAddr,
      'custodian1',
      ['custodian1', 'custodian2'],
      'Security upgrade',
      2000
    );
    expect(updated.payoutDestination.address).toBe(newAddr);
    expect(updated.changeAuditLog.length).toBe(1);
    expect(updated.changeAuditLog[0].changedBy).toBe('custodian1');
    expect(updated.changeAuditLog[0].previousAddress).toBe('0xC6F86e170411182114FcCdb28793dC76B5e8D144');
  });

  it('LEG-T07: fondatorul pasiv este exclus din listele de admini operaționali', () => {
    const passiveFounderId = 'founder_passive_id';
    const badAdminList = ['operator_lead', 'tech_lead', 'founder_passive_id'];
    const cleanAdminList = ['operator_lead', 'tech_lead', 'dev_lead'];

    expect(verifyOperationalAdminList(badAdminList, passiveFounderId)).toBe(false);
    expect(verifyOperationalAdminList(cleanAdminList, passiveFounderId)).toBe(true);
  });
});
