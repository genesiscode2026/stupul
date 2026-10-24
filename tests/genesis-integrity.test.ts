import { describe, it, expect } from 'vitest';
import {
  ROYALTY_RATE,
  ROYALTY_RATE_BASIS_POINTS,
  ROYALTY_FORMULA_ID,
  reconcileTransaction,
  reconcileBatch,
  buildInitialManifest,
  contentHash,
  signManifest,
  verifyManifest,
  generateSigningKeyPair,
  AppendOnlyAuditLog,
  verifyAuditLog,
  evaluateApprovals,
  proposePayoutAddressChange,
  BeneficiaryRecord,
} from '../packages/genesis-integrity/src/index.js';

describe('P1 — Integritatea redevenței de 5% (genesis-integrity)', () => {
  it('invariant: ROYALTY_RATE = 0.05 și 500 puncte de bază', () => {
    expect(ROYALTY_RATE).toBe(0.05);
    expect(ROYALTY_RATE_BASIS_POINTS).toBe(500);
    expect(ROYALTY_FORMULA_ID).toBe('stupul-founder-royalty-v1');
  });

  it('reconciliere: 100.000 brute fără deduceri => 5.000 redevență', () => {
    const r = reconcileTransaction({ transactionId: 't1', grossReceipts: 100_000, currency: 'USD' });
    expect(r.eligibleReceipts).toBe(100_000);
    expect(r.founderRoyalty).toBe(5_000);
  });

  it('reconciliere: deduceri corecte (taxe/refunds/chargebacks/fees)', () => {
    const r = reconcileTransaction({
      transactionId: 't2', grossReceipts: 100_000, indirectTaxes: 10_000,
      refunds: 2_000, chargebacks: 0, permittedDirectProcessorFees: 1_000, currency: 'USD',
    });
    expect(r.eligibleReceipts).toBe(87_000);
    expect(r.founderRoyalty).toBe(4_350);
  });

  it('reconciliere: venituri afiliate + sublicențe nu pot fi deturnate', () => {
    const r = reconcileTransaction({
      transactionId: 't3', grossReceipts: 50_000, affiliatedReceipts: 20_000, sublicenseReceipts: 5_000,
      indirectTaxes: 5_000, currency: 'EUR',
    });
    expect(r.totalCollected).toBe(75_000);
    expect(r.eligibleReceipts).toBe(70_000);
    expect(r.founderRoyalty).toBe(3_500);
  });

  it('reconciliere: valori negative/zero respinse', () => {
    expect(() => reconcileTransaction({ transactionId: 't4', grossReceipts: -10, currency: 'USD' })).toThrow();
    expect(() => reconcileTransaction({ transactionId: 't5', grossReceipts: NaN, currency: 'USD' })).toThrow();
    expect(() => reconcileTransaction({ transactionId: 't6', grossReceipts: Infinity, currency: 'USD' })).toThrow();
    const zero = reconcileTransaction({ transactionId: 't7', grossReceipts: 0, currency: 'USD' });
    expect(zero.eligibleReceipts).toBe(0);
    expect(zero.founderRoyalty).toBe(0);
  });

  it('reconciliere: cheltuielile generale nu sunt câmp de deducere', () => {
    const r = reconcileTransaction({ transactionId: 't8', grossReceipts: 100_000, indirectTaxes: 5_000, currency: 'USD' });
    expect(r.eligibleReceipts).toBe(95_000);
    expect(r.founderRoyalty).toBe(4_750);
  });

  it('reconciliere batch: dublarea înregistrărilor este deduplicată', () => {
    const tx = { transactionId: 'dup', grossReceipts: 100_000, currency: 'USD' };
    const r = reconcileBatch([tx, tx, tx]);
    expect(r.transactionCount).toBe(1);
    expect(r.founderRoyalty).toBe(5_000);
  });

  it('reconciliere batch: monede diferite în același lot sunt respinse', () => {
    expect(() => reconcileBatch([
      { transactionId: 'a', grossReceipts: 10, currency: 'USD' },
      { transactionId: 'b', grossReceipts: 10, currency: 'EUR' },
    ])).toThrow(/mixed currencies/);
  });

  it('manifest: semnare Ed25519 + verificare validă', () => {
    const manifest = buildInitialManifest({ manifestId: 'm1', version: '1.0.0', documentHashes: { '05_GOVERNANCE/CONSTITUTION.md': 'abc123' } });
    const kp = generateSigningKeyPair();
    const signed = signManifest(manifest, 'custodian-dev', kp);
    const res = verifyManifest(signed, { 'custodian-dev': kp.publicKeyPem });
    expect(res.valid).toBe(true);
  });

  it('manifest: modificarea procentului de 5% este detectată', () => {
    const manifest = buildInitialManifest({ manifestId: 'm2', version: '1.0.0', documentHashes: {} });
    const kp = generateSigningKeyPair();
    const tampered = {
      ...manifest,
      content: { ...manifest.content, royaltyRateBasisPoints: 700 },
    };
    const signed = signManifest(tampered, 'custodian-dev', kp);
    const res = verifyManifest(signed, { 'custodian-dev': kp.publicKeyPem });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('5%');
  });

  it('manifest: modificarea conținutului invalidează semnătura', () => {
    const manifest = buildInitialManifest({ manifestId: 'm3', version: '1.0.0', documentHashes: { a: 'x' } });
    const kp = generateSigningKeyPair();
    const signed = signManifest(manifest, 'custodian-dev', kp);
    const tampered = { ...signed, content: { ...signed.content, version: '2.0.0' } };
    const res = verifyManifest(tampered, { 'custodian-dev': kp.publicKeyPem });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('insufficient valid signatures');
  });

  it('manifest: semnături insuficiente sunt respinse (necesită 2)', () => {
    const manifest = buildInitialManifest({ manifestId: 'm4', version: '1.0.0', documentHashes: {} });
    const kp = generateSigningKeyPair();
    const signed = signManifest(manifest, 'custodian-dev', kp);
    const res = verifyManifest(signed, { 'custodian-dev': kp.publicKeyPem }, { requiredSignatures: 2 });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('insufficient valid signatures');
  });

  it('manifest: contentHash este determinist', () => {
    const a = buildInitialManifest({ manifestId: 'm5', version: '1.0.0', documentHashes: { k: 'v' } });
    const b = buildInitialManifest({ manifestId: 'm5', version: '1.0.0', documentHashes: { k: 'v' } });
    expect(contentHash(a.content)).toBe(contentHash(b.content));
  });

  it('jurnal audit: append-only + detecția falsificării', () => {
    const log = new AppendOnlyAuditLog('genesis-v2');
    log.append('sys', 'INIT', { seed: 42 });
    log.append('operator-1', 'REPORT', { gross: 100 });
    const entries = log.getEntries();
    // tamper: modificăm payload-ul primei intrări
    const tampered = entries.map(e => ({ ...e }));
    tampered[0] = { ...tampered[0], payload: { seed: 999 } };
    const res = verifyAuditLog(tampered, entries[0].prevHash);
    expect(res.valid).toBe(false);
  });

  it('aprobări: 2 din 2 + independență + rol permis', () => {
    const policy = { requiredApprovals: 2, allowedRoles: ['custodian', 'commercialOperator'], independenceRequired: true };
    expect(evaluateApprovals(
      { actorId: 'admin1', actorRole: 'custodian' },
      [{ approverId: 'cust1', approverRole: 'custodian' }, { approverId: 'op1', approverRole: 'commercialOperator' }],
      policy,
    ).approved).toBe(true);
    expect(evaluateApprovals(
      { actorId: 'cust1', actorRole: 'custodian' },
      [{ approverId: 'cust1', approverRole: 'custodian' }, { approverId: 'op1', approverRole: 'commercialOperator' }],
      policy,
    ).approved).toBe(false);
    expect(evaluateApprovals(
      { actorId: 'x', actorRole: 'custodian' },
      [{ approverId: 'cust1', approverRole: 'custodian' }, { approverId: 'player', approverRole: 'citizen' }],
      policy,
    ).approved).toBe(false);
  });

  it('beneficiar: schimbare adresă necesită aprobări independente', () => {
    const rec: BeneficiaryRecord = {
      beneficiaryId: 'founder',
      label: 'Founder beneficiary',
      publicPayoutAddress: '0x1111111111111111111111111111111111111111',
      addressHistory: [],
    };
    const newAddr = '0x2222222222222222222222222222222222222222';
    expect(() => proposePayoutAddressChange(
      rec, newAddr, { actorId: 'cust1', actorRole: 'custodian' },
      [{ approverId: 'cust1', approverRole: 'custodian' }], 'rotation',
    )).toThrow(/insufficient distinct approvers/);

    const updated = proposePayoutAddressChange(
      rec, newAddr, { actorId: 'initiator', actorRole: 'custodian' },
      [{ approverId: 'cust1', approverRole: 'custodian' }, { approverId: 'op1', approverRole: 'commercialOperator' }],
      'rotation',
    );
    expect(updated.publicPayoutAddress).toBe(newAddr);
    expect(updated.addressHistory.length).toBe(1);
  });

  it('beneficiar: adresă publică invalidă respinsă', () => {
    const rec: BeneficiaryRecord = {
      beneficiaryId: 'founder', label: 'x',
      publicPayoutAddress: '0x1111111111111111111111111111111111111111', addressHistory: [],
    };
    expect(() => proposePayoutAddressChange(
      rec, 'not-an-address', { actorId: 'a', actorRole: 'custodian' },
      [{ approverId: 'b', approverRole: 'custodian' }, { approverId: 'c', approverRole: 'commercialOperator' }], 'x',
    )).toThrow(/invalid public payout address/);
  });
});
