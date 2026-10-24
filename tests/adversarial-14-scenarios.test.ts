import { describe, it, expect } from 'vitest';
import {
  buildInitialManifest,
  signManifest,
  verifyManifest,
  generateSigningKeyPair,
  reconcileTransaction,
  AppendOnlyAuditLog,
  verifyAuditLog,
  evaluateApprovals,
  proposePayoutAddressChange,
  BeneficiaryRecord,
  appendManifestChange,
  contentHash,
} from '../packages/genesis-integrity/src/index.js';
import {
  calculateRoyalties,
  assessProductRoyaltyObligation,
} from '../packages/domain/src/royalties.js';
import { StateDB } from '../packages/server/src/db.js';

describe('P1 — Teste Adversariale pe cele 14 Scenarii de Risc GENESIS v3.1', () => {

  // Scenariul 1: Dezvoltatorul elimină sau reduce procentul de 5%
  it('Scenariul 1: Încercarea de eliminare sau reducere a procentului de 5% este respinsă de manifest și verificator', () => {
    const manifest = buildInitialManifest({ manifestId: 'm-scen1', version: '3.1.0', documentHashes: {} });
    const kp = generateSigningKeyPair();
    // Atac: dezvoltatorul schimbă royaltyRateBasisPoints la 0 sau 200 (2%)
    const tamperedManifest = {
      ...manifest,
      content: { ...manifest.content, royaltyRateBasisPoints: 200 },
    };
    const signed = signManifest(tamperedManifest, 'dev-attacker', kp);
    const verification = verifyManifest(signed, { 'dev-attacker': kp.publicKeyPem });
    expect(verification.valid).toBe(false);
    expect(verification.reason).toContain('5%');
  });

  // Scenariul 2: Operatorul modifică formula de calcul (încearcă să deducă salarii, chirii, marketing)
  it('Scenariul 2: Formula matematică respinge deducerea costurilor operaționale (salarii, marketing, chirii)', () => {
    // Calculul strict exclude salariile din deduceri permise
    const receipts = {
      gross: 100_000,
      collectedTax: 10_000,
      refunds: 2_000,
      refundedChargebacks: 500,
      directProcessorFees: 1_500,
    };
    const res = calculateRoyalties(receipts);
    // Baza eligibilă = 100.000 - 14.000 = 86.000 => 5% = 4.300
    expect(res.eligible).toBe(86_000);
    expect(res.founderRoyaltyGross).toBe(4_300);

    // Deducerile nu acceptă câmpuri necunoscute de cheltuieli generale
    const reconciliation = reconcileTransaction({
      transactionId: 'tx-scen2',
      grossReceipts: 100_000,
      indirectTaxes: 10_000,
      refunds: 2_000,
      chargebacks: 500,
      permittedDirectProcessorFees: 1_500,
      currency: 'USD',
    });
    expect(reconciliation.eligibleReceipts).toBe(86_000);
    expect(reconciliation.founderRoyalty).toBe(4_300);
  });

  // Scenariul 3: Administratorul modifică manifestul fără semnătură sau resemnează unilateral
  it('Scenariul 3: Modificarea neautorizată a manifestului invalidează semnătura criptografică Ed25519', () => {
    const manifest = buildInitialManifest({ manifestId: 'm-scen3', version: '3.1.0', documentHashes: { 'doc.md': 'hash1' } });
    const kp = generateSigningKeyPair();
    const signed = signManifest(manifest, 'custodian', kp);

    // Administratorul alterează documentHashes după semnare
    const tampered = {
      ...signed,
      content: { ...signed.content, documentHashes: { 'doc.md': 'hash-malitios' } },
    };
    const check = verifyManifest(tampered, { custodian: kp.publicKeyPem });
    expect(check.valid).toBe(false);
    expect(check.reason).toContain('insufficient valid signatures');
  });

  // Scenariul 4: Atacatorul încearcă să schimbe adresa de plată Exodus a Fondatorului
  it('Scenariul 4: Schimbarea adresei Exodus fără aprobări independente sau cu adresă invalidă este blocată', () => {
    const record: BeneficiaryRecord = {
      beneficiaryId: 'founder',
      label: 'Exodus Wallet',
      publicPayoutAddress: '0x1111111111111111111111111111111111111111',
      addressHistory: [],
    };

    // 4.1: Adresă invalidă
    expect(() => {
      proposePayoutAddressChange(
        record,
        '0xHackerAddressInvalidLength',
        { actorId: 'admin1', actorRole: 'custodian' },
        [{ approverId: 'c1', approverRole: 'custodian' }, { approverId: 'op1', approverRole: 'commercialOperator' }],
        'tentativa furt',
      );
    }).toThrow(/invalid public payout address/);

    // 4.2: Fără independență (același om aprobă de 2 ori)
    expect(() => {
      proposePayoutAddressChange(
        record,
        '0x2222222222222222222222222222222222222222',
        { actorId: 'hacker', actorRole: 'custodian' },
        [{ approverId: 'hacker', approverRole: 'custodian' }],
        'tentativa singur',
      );
    }).toThrow(/insufficient distinct approvers/);
  });

  // Scenariul 5: Operatorul mută încasările către o filială sau o companie afiliată
  it('Scenariul 5: Veniturile sustrase prin companii afiliate sunt capturate obligatoriu în baza eligibilă (anti-diversion)', () => {
    const tx = {
      transactionId: 'tx-affiliate',
      grossReceipts: 20_000, // operatorul raportează doar 20k
      affiliatedReceipts: 80_000, // dar filiala a încasat 80k
      currency: 'USD',
    };
    const res = reconcileTransaction(tx);
    // Total colectat trebuie să fie 100k, iar redevența 5k
    expect(res.totalCollected).toBe(100_000);
    expect(res.eligibleReceipts).toBe(100_000);
    expect(res.founderRoyalty).toBe(5_000);
  });

  // Scenariul 6: Operatorul vinde proiectul către o altă companie
  it('Scenariul 6: Succesorul care preia proiectul datorează contractual redevența conform regulilor de succesiune', () => {
    const evalResult = assessProductRoyaltyObligation({
      usesLicensedIP: true,
      usesStupulTrademarks: true,
      hasExecutedContract: false,
      isCoveredAffiliateOrSuccessor: true,
    });
    expect(evalResult.owesRoyalty).toBe(true);
    expect(evalResult.reason).toContain('covered entity');
  });

  // Scenariul 7: Noul cumpărător refuză plata redevenței
  it('Scenariul 7: Dacă noul cumpărător refuză redevența dar utilizează codul/IP STUPUL, este clasificat drept utilizator ilicit', () => {
    const evalResult = assessProductRoyaltyObligation({
      usesLicensedIP: true,
      usesStupulTrademarks: true,
      hasExecutedContract: false,
      isCoveredAffiliateOrSuccessor: false,
    });
    expect(evalResult.owesRoyalty).toBe(true);
    expect(evalResult.reason).toContain('proprietary protected assets');
  });

  // Scenariul 8: Operatorul comercializează o versiune derivată fără licență
  it('Scenariul 8: Versiunile derivate care utilizează IP STUPUL sunt acoperite de obligația de redevență', () => {
    const evalResult = assessProductRoyaltyObligation({
      usesLicensedIP: true,
      usesStupulTrademarks: false,
      hasExecutedContract: false,
      isCoveredAffiliateOrSuccessor: false,
    });
    expect(evalResult.owesRoyalty).toBe(true);
  });

  // Scenariul 9: Operatorul încalcă obligația de raportare (transmite date trunchiate sau NaN)
  it('Scenariul 9: Datele financiare corupte (NaN, negative, infinite) eșuează fail-closed', () => {
    expect(() => {
      reconcileTransaction({ transactionId: 'bad1', grossReceipts: NaN, currency: 'USD' });
    }).toThrow();
    expect(() => {
      reconcileTransaction({ transactionId: 'bad2', grossReceipts: -500, currency: 'USD' });
    }).toThrow();
    expect(() => {
      reconcileTransaction({ transactionId: 'bad3', grossReceipts: Infinity, currency: 'USD' });
    }).toThrow();
  });

  // Scenariul 10: Operatorul închide serviciul brusc
  it('Scenariul 10: Jurnalul imutabil append-only conservă istoricul complet al obligațiilor înainte de închidere', () => {
    const log = new AppendOnlyAuditLog('closure-test');
    log.append('operator1', 'COLLECT', { amount: 50_000, royaltyDue: 2_500 });
    log.append('operator1', 'SHUTDOWN_NOTICE', { reason: 'market_exit' });
    const entries = log.getEntries();
    expect(entries.length).toBe(2);
    const verification = verifyAuditLog(entries, entries[0].prevHash);
    expect(verification.valid).toBe(true);
  });

  // Scenariul 11: Operatorul este în insolvență
  it('Scenariul 11: Persistența tranzacțiilor în baza de date oferă evidență probatorie de necontestat a creanțelor', () => {
    const db = new StateDB(':memory:');
    db.appendEvent(100, 'ROYALTY_DUE', 'operator-insolvent', JSON.stringify({ dueCents: 500000 }), 'hash1', Date.now());
    const events = db.getEventsSince(0);
    expect(events.length).toBe(1);
    expect(events[0].actor).toBe('operator-insolvent');
    expect(events[0].payload).toContain('500000');
    db.close();
  });

  // Scenariul 12: Cheia privată a unui semnatar este compromisă
  it('Scenariul 12: Manifestul permite rotirea semnăturilor și verificarea exclusivă împotriva cheilor publice autorizate', () => {
    const manifest = buildInitialManifest({ manifestId: 'm-rot', version: '3.1.0', documentHashes: {} });
    const oldKp = generateSigningKeyPair();
    const newKp = generateSigningKeyPair();

    // Dacă vechea cheie a fost compromisă, verificatorul acceptă doar noul registru de chei publice
    const signedWithNew = signManifest(manifest, 'custodian-renewed', newKp);
    const validWithNew = verifyManifest(signedWithNew, { 'custodian-renewed': newKp.publicKeyPem });
    const invalidWithOld = verifyManifest(signedWithNew, { 'custodian-renewed': oldKp.publicKeyPem });

    expect(validWithNew.valid).toBe(true);
    expect(invalidWithOld.valid).toBe(false);
  });

  // Scenariul 13: Administratorul încearcă să cumuleze roluri sau să își aprobe propria acțiune
  it('Scenariul 13: Politica de independență respinge cumulul de roluri și auto-aprobarea', () => {
    const policy = {
      requiredApprovals: 2,
      allowedRoles: ['custodian', 'commercialOperator'],
      independenceRequired: true,
    };
    // Inițiatorul încearcă să fie și aprobator
    const resultSelf = evaluateApprovals(
      { actorId: 'same-user', actorRole: 'custodian' },
      [
        { approverId: 'same-user', approverRole: 'custodian' },
        { approverId: 'partner', approverRole: 'commercialOperator' },
      ],
      policy,
    );
    expect(resultSelf.approved).toBe(false);
    expect(resultSelf.reason).toContain('self-approval conflict');
  });

  // Scenariul 14: Contracte și versiuni cu date sau cronologie incompatibile
  it('Scenariul 14: Istoricul modificărilor manifestului impune consecutivitate strictă (seq monotonic)', () => {
    const manifest = buildInitialManifest({ manifestId: 'm-seq', version: '3.1.0', documentHashes: {} });
    const nextContent = { ...manifest.content, version: '3.1.1' };
    const updated = appendManifestChange(manifest, nextContent, ['c1', 'c2'], 'minor update');
    expect(updated.changeHistory.length).toBe(1);
    expect(updated.changeHistory[0].seq).toBe(1);
    expect(updated.changeHistory[0].contentHashBefore).toBe(contentHash(manifest.content));
    expect(updated.changeHistory[0].contentHashAfter).toBe(contentHash(nextContent));
  });

});
