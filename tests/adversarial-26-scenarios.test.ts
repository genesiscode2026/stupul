import { describe, it, expect } from 'vitest';
import {
  calculateRoyaltiesExactBps,
  validateNoDivertedExpenses,
  assessProductRoyaltyObligation,
  citizenVoteWeight,
  calculateContributorWeights,
  evaluateBicameralDecision,
  contributionAward,
  activeMerit,
  ActorId,
  Contribution,
  Proposal,
} from '@stupul/domain';
import {
  createInitialState,
  reduce,
} from '@stupul/engine';
import { AuthManager } from '../packages/server/src/auth.js';
import { validateAndImportSnapshot } from '@stupul/shared';

describe('Baterie de Teste Adversariale: 26 de Scenarii de Atac și Eludare (Scenariile A - Z)', () => {
  const now = Date.now();

  // Scenariul A: Fork de cod deschis și ștergere fișier royalties.ts
  it('Scenariul A — Tentativă de ștergere a modulului de redevență: obligația rămâne contractuală și se detectează la audit', () => {
    const obligation = assessProductRoyaltyObligation({
      usesLicensedIP: true,
      usesStupulTrademarks: false,
      hasExecutedContract: true,
      isCoveredAffiliateOrSuccessor: false,
    });
    expect(obligation.owesRoyalty).toBe(true);
    expect(obligation.reason).toContain('Contractual obligation');
  });

  // Scenariul B: OpCo / IPCo split (redirecționare venituri către o entitate afiliată)
  it('Scenariul B — OpCo/IPCo Split: veniturile entităților afiliate sunt incluse forțat în baza eligibilă', () => {
    const res = calculateRoyaltiesExactBps({
      grossCents: 1_000_000,
      collectedTaxCents: 0,
      refundsCents: 0,
      chargebacksCents: 0,
      processorFeesCents: 0,
      relatedPartyRevenueCents: 9_000_000, // 90.000 USD ascunși prin firmă afiliată
      currency: 'USD',
    });
    // Baza calculată include integral cei 90.000 USD
    expect(res.eligibleCents).toBe(10_000_000);
    expect(res.royaltyGrossCents).toBe(500_000); // 5.000 USD redevență
  });

  // Scenariul C: Schimbare de branding dar păstrare active/cod
  it('Scenariul C — Schimbare de nume (Rebranding): folosirea IP-ului original menține datoria de redevență', () => {
    const ob = assessProductRoyaltyObligation({
      usesLicensedIP: true,
      usesStupulTrademarks: false,
      hasExecutedContract: false,
      isCoveredAffiliateOrSuccessor: false,
    });
    expect(ob.owesRoyalty).toBe(true);
  });

  // Scenariul D: Deduceri operaționale mascate (salarii directori, birouri)
  it('Scenariul D — Deduceri operaționale mascate: regula anti-deturnare blochează diminuarea bazei', () => {
    expect(() => {
      validateNoDivertedExpenses({ executive_compensation: 50_000 });
    }).toThrow('LEG-T03');
  });

  // Scenariul E: Creare monedă virtuală fictivă (tokens/gems) pentru mascarea banilor reali
  it('Scenariul E — Monedă virtuală fictivă: încasările reale din vânzarea tokenilor sunt considerate venit brut', () => {
    // Vânzare de "Gems" în valoare de 20.000 USD reali
    const res = calculateRoyaltiesExactBps({
      grossCents: 2_000_000,
      collectedTaxCents: 0,
      refundsCents: 0,
      chargebacksCents: 0,
      processorFeesCents: 58_000,
      currency: 'USD',
    });
    expect(res.royaltyGrossCents).toBe(97_100);
  });

  // Scenariul F: Donații mascate declarate non-comerciale de către un operator comercial
  it('Scenariul F — Donații mascate către operator: intră în venitul brut raportat al entității licențiate', () => {
    const res = calculateRoyaltiesExactBps({
      grossCents: 500_000, // 5.000 USD donații primite pentru acces joc
      collectedTaxCents: 0,
      refundsCents: 0,
      chargebacksCents: 0,
      processorFeesCents: 15_000,
      currency: 'USD',
    });
    expect(res.royaltyGrossCents).toBe(24_250);
  });

  // Scenariul G: Contributor spammer încearcă să obțină vot masiv prin PR-uri fără teste sau unmerged
  it('Scenariul G — PR-uri de spam sau neaprobate: primesc ZERO merit în mod automat', () => {
    const badContrib: Contribution = {
      id: 'spam_01',
      actorId: 'spammer_bot',
      kind: 'code',
      evidenceHash: '',
      licenseAcceptanceRef: '',
      rubricScore: 100,
      impactWeight: 3,
      reviewerIds: [],
      reviewerIndependent: false,
      conflictsDeclared: false,
      testsPassed: false,
      mergedAndDelivered: false,
      isSpamOrFakeTraffic: true,
      acceptedAtMs: now,
      revoked: false,
    };
    expect(contributionAward(badContrib)).toBe(0);
  });

  // Scenariul H: Reviewer complice aprobă propriul PR (conflict de interese / self-review)
  it('Scenariul H — Auto-recenzare (Self-review): acordă ZERO merit când autorul este printre recenzenți', () => {
    const selfReview: Contribution = {
      id: 'self_rev_01',
      actorId: 'corrupt_author',
      kind: 'code',
      evidenceHash: 'hash123',
      licenseAcceptanceRef: 'DCO',
      rubricScore: 100,
      impactWeight: 2,
      reviewerIds: ['corrupt_author', 'peer2'], // Autorul se recenzează pe el însuși!
      reviewerIndependent: true,
      conflictsDeclared: false,
      testsPassed: true,
      mergedAndDelivered: true,
      isSpamOrFakeTraffic: false,
      acceptedAtMs: now,
      revoked: false,
    };
    expect(contributionAward(selfReview)).toBe(0);
  });

  // Scenariul I: Puncte de merit vechi de peste 90 de zile expiră complet
  it('Scenariul I — Puncte de merit peste 90 de zile: au pondere zero conform half-life de 45 zile', () => {
    const oldContrib: Contribution = {
      id: 'old_01',
      actorId: 'veteran_inactive',
      kind: 'code',
      evidenceHash: 'hash123',
      licenseAcceptanceRef: 'DCO',
      rubricScore: 100,
      impactWeight: 3,
      reviewerIds: ['rev1'],
      reviewerIndependent: true,
      conflictsDeclared: false,
      testsPassed: true,
      mergedAndDelivered: true,
      isSpamOrFakeTraffic: false,
      acceptedAtMs: now - 95 * 86_400_000, // 95 zile vechime
      revoked: false,
    };
    expect(activeMerit([oldContrib], 'veteran_inactive', now)).toBe(0);
  });

  // Scenariul J: Oligarh cumpără toate parcelele din joc pentru vot suplimentar
  it('Scenariul J — Oligarhie financiară: deținerea a 1.000 de parcele oferă EXACT 1 vot cetățenesc', () => {
    expect(citizenVoteWeight(true, 50_000_000, 1000, 100, true)).toBe(1);
  });

  // Scenariul K: Plafonare strictă a puterii de vot a unui contributor la 5%
  it('Scenariul K — Monopol de vot contributor: un contributor cu 99.9% din puncte este plafonat la max 5%', () => {
    const ids: ActorId[] = Array.from({ length: 25 }, (_, i) => `contrib_${i}`);
    const contributions: Contribution[] = [
      {
        id: 'c_whale',
        actorId: ids[0],
        kind: 'code',
        evidenceHash: 'hash',
        licenseAcceptanceRef: 'ref',
        rubricScore: 100,
        impactWeight: 3,
        reviewerIds: ['indep'],
        reviewerIndependent: true,
        conflictsDeclared: false,
        testsPassed: true,
        mergedAndDelivered: true,
        isSpamOrFakeTraffic: false,
        acceptedAtMs: now - 1000,
        revoked: false,
      },
      ...ids.slice(1).map(id => ({
        id: `c_${id}`,
        actorId: id,
        kind: 'code' as const,
        evidenceHash: 'hash',
        licenseAcceptanceRef: 'ref',
        rubricScore: 10,
        impactWeight: 1 as const,
        reviewerIds: ['indep'],
        reviewerIndependent: true,
        conflictsDeclared: false,
        testsPassed: true,
        mergedAndDelivered: true,
        isSpamOrFakeTraffic: false,
        acceptedAtMs: now - 1000,
        revoked: false,
      })),
    ];
    const weights = calculateContributorWeights(ids, contributions, now);
    expect(weights.get(ids[0])!).toBeCloseTo(0.05, 5);
  });

  // Scenariul L: Replay attack pe challenge WebAuthn
  it('Scenariul L — Replay Attack pe challenge WebAuthn: a doua folosire este respinsă cu eroare', () => {
    const auth = new AuthManager('localhost');
    const ch = auth.createRegistrationChallenge('cetatean_replay');
    auth.verifyRegistration({
      username: 'cetatean_replay',
      challenge: ch.challenge,
      credentialId: 'cred_replay_01',
      publicKeyPem: 'pem',
    });
    expect(() => {
      auth.verifyRegistration({
        username: 'cetatean_replay',
        challenge: ch.challenge,
        credentialId: 'cred_replay_02',
        publicKeyPem: 'pem',
      });
    }).toThrow('Invalid or unknown challenge');
  });

  // Scenariul M: Challenge expirat WebAuthn
  it('Scenariul M — Challenge WebAuthn expirat: respins după depășirea TTL', () => {
    const auth = new AuthManager('localhost', 'STUPUL', 1);
    const ch = auth.createRegistrationChallenge('cetatean_slow');
    const start = Date.now();
    while (Date.now() - start < 5) {}
    expect(() => {
      auth.verifyRegistration({
        username: 'cetatean_slow',
        challenge: ch.challenge,
        credentialId: 'cred_slow',
        publicKeyPem: 'pem',
      });
    }).toThrow('Challenge expired');
  });

  // Scenariul N: Înregistrare cu username sub 3 caractere
  it('Scenariul N — Username prea scurt: respins la generarea challenge-ului', () => {
    const auth = new AuthManager('localhost');
    expect(() => auth.createRegistrationChallenge('ab')).toThrow('Username must have at least 3 characters');
  });

  // Scenariul O: Injectare de cheie interzisă în politici (__proto__, constructor)
  it('Scenariul O — Prototype pollution attack în SET_POLICY: blocat cu eroare', () => {
    const s = createInitialState(1, 'Test');
    const res = reduce(s, {
      type: 'SET_POLICY',
      policyKey: '__proto__' as any,
      value: 10,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Tentativă de injectare securitate blocată');
  });

  // Scenariul P: Rată de impozit negativă sau peste maximul de 30%
  it('Scenariul P — Valoare de politică în afara limitelor legale: respinsă de reducer', () => {
    const s = createInitialState(1, 'Test');
    const resNeg = reduce(s, {
      type: 'SET_POLICY',
      policyKey: 'taxRatePercent',
      value: -5,
    });
    expect(resNeg.success).toBe(false);

    const resTooHigh = reduce(s, {
      type: 'SET_POLICY',
      policyKey: 'taxRatePercent',
      value: 99,
    });
    expect(resTooHigh.success).toBe(false);
  });

  // Scenariul Q: Construire dublă pe aceeași parcelă (T-003)
  it('Scenariul Q — Construire dublă pe parcelă ocupată: respinsă (T-003)', () => {
    const s = createInitialState(1, 'Test');
    s.grid[2][2].building = 'house';
    const res = reduce(s, {
      type: 'CONSTRUCT_BUILDING',
      x: 2,
      y: 2,
      buildingType: 'farm',
      actorId: 'c1',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('T-003');
  });

  // Scenariul R: Revendicare parcelă deja ocupată (STP-T02)
  it('Scenariul R — Revendicare parcelă deja deținută: respinsă (STP-T02)', () => {
    const s = createInitialState(1, 'Test');
    s.grid[4][4].ownerAccountId = 'original_owner';
    const res = reduce(s, {
      type: 'CLAIM_PARCEL',
      x: 4,
      y: 4,
      actorId: 'thief_actor',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('STP-T02');
  });

  // Scenariul S: Fonduri virtuale insuficiente pentru construcție (T-004)
  it('Scenariul S — Fonduri virtuale insuficiente: respinsă (T-004)', () => {
    const s = createInitialState(1, 'Test');
    s.resources.virtualCredits = 0;
    const res = reduce(s, {
      type: 'CONSTRUCT_BUILDING',
      x: 2,
      y: 2,
      buildingType: 'house',
      actorId: 'c1',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('T-004');
  });

  // Scenariul T: Construire clădire pe apă (fără a fi fântână)
  it('Scenariul T — Construire pe celulă de apă: respinsă', () => {
    const s = createInitialState(1, 'Test');
    s.grid[0][0].terrain = 'water';
    const res = reduce(s, {
      type: 'CONSTRUCT_BUILDING',
      x: 0,
      y: 0,
      buildingType: 'house',
      actorId: 'c1',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Nu se poate construi pe apă');
  });

  // Scenariul U: Upgrade clădire peste nivelul 3
  it('Scenariul U — Modernizare peste nivelul 3: respinsă', () => {
    const s = createInitialState(1, 'Test');
    s.grid[2][2].building = 'house';
    s.grid[2][2].level = 3;
    const res = reduce(s, {
      type: 'UPGRADE_BUILDING',
      x: 2,
      y: 2,
      actorId: 'c1',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Nivel maxim atins');
  });

  // Scenariul V: Modificare constituțională fără deliberare de 7 zile
  it('Scenariul V — Vot constituțional fără minim 7 zile deliberare: non-executabil', () => {
    const p: Proposal = {
      proposalId: 'prop_fast',
      title: 'Fast Amendment',
      description: 'Desc',
      authorId: 'a1',
      scope: 'constitution',
      createdAtMs: now,
      deliberationDays: 2, // Sub 7 zile!
      timelockHours: 72,
      status: 'active',
    };
    const cWeights = new Map<ActorId, number>([['c1', 1]]);
    const res = evaluateBicameralDecision(
      p,
      [{ ballotId: 'b1', proposalId: 'prop_fast', actorId: 'u1', choice: 'yes', castAtMs: now }],
      [{ ballotId: 'b2', proposalId: 'prop_fast', actorId: 'c1', choice: 'yes', castAtMs: now }],
      cWeights
    );
    expect(res.passed).toBe(true);
    expect(res.executable).toBe(false);
    expect(res.failureReason).toContain('deliberation');
  });

  // Scenariul W: Modificare constituțională fără timelock de 72 ore
  it('Scenariul W — Vot constituțional fără timelock de minim 72h: non-executabil', () => {
    const p: Proposal = {
      proposalId: 'prop_no_lock',
      title: 'No Timelock',
      description: 'Desc',
      authorId: 'a1',
      scope: 'constitution',
      createdAtMs: now,
      deliberationDays: 7,
      timelockHours: 24, // Doar 24h în loc de 72h!
      status: 'active',
    };
    const cWeights = new Map<ActorId, number>([['c1', 1]]);
    const res = evaluateBicameralDecision(
      p,
      [{ ballotId: 'b1', proposalId: 'prop_no_lock', actorId: 'u1', choice: 'yes', castAtMs: now }],
      [{ ballotId: 'b2', proposalId: 'prop_no_lock', actorId: 'c1', choice: 'yes', castAtMs: now }],
      cWeights
    );
    expect(res.passed).toBe(true);
    expect(res.executable).toBe(false);
    expect(res.failureReason).toContain('timelock');
  });

  // Scenariul X: Modificare constituțională fără 2/3 în Camera Cetățenească
  it('Scenariul X — Vot constituțional respins dacă nu atinge 66.7% în Camera Cetățenilor', () => {
    const p: Proposal = {
      proposalId: 'prop_fail_cit',
      title: 'Amendament',
      description: 'Desc',
      authorId: 'a1',
      scope: 'constitution',
      createdAtMs: now,
      deliberationDays: 7,
      timelockHours: 72,
      status: 'active',
    };
    const cWeights = new Map<ActorId, number>([['c1', 1]]);
    // 50% DA, 50% NU la cetățeni
    const res = evaluateBicameralDecision(
      p,
      [
        { ballotId: 'b1', proposalId: 'prop_fail_cit', actorId: 'u1', choice: 'yes', castAtMs: now },
        { ballotId: 'b2', proposalId: 'prop_fail_cit', actorId: 'u2', choice: 'no', castAtMs: now },
      ],
      [{ ballotId: 'b3', proposalId: 'prop_fail_cit', actorId: 'c1', choice: 'yes', castAtMs: now }],
      cWeights
    );
    expect(res.passed).toBe(false);
    expect(res.failureReason).toContain('Failed 2/3 supermajority');
  });

  // Scenariul Y: Modificare constituțională fără 2/3 în Camera Contributorilor
  it('Scenariul Y — Vot constituțional respins dacă nu atinge 66.7% în Camera Contributorilor', () => {
    const p: Proposal = {
      proposalId: 'prop_fail_con',
      title: 'Amendament',
      description: 'Desc',
      authorId: 'a1',
      scope: 'constitution',
      createdAtMs: now,
      deliberationDays: 7,
      timelockHours: 72,
      status: 'active',
    };
    const cWeights = new Map<ActorId, number>([
      ['c1', 0.5],
      ['c2', 0.5],
    ]);
    const res = evaluateBicameralDecision(
      p,
      [{ ballotId: 'b1', proposalId: 'prop_fail_con', actorId: 'u1', choice: 'yes', castAtMs: now }],
      [
        { ballotId: 'b2', proposalId: 'prop_fail_con', actorId: 'c1', choice: 'yes', castAtMs: now },
        { ballotId: 'b3', proposalId: 'prop_fail_con', actorId: 'c2', choice: 'no', castAtMs: now }, // 50%
      ],
      cWeights
    );
    expect(res.passed).toBe(false);
    expect(res.failureReason).toContain('Failed 2/3 supermajority');
  });

  // Scenariul Z: Import de snapshot corupt sau modificat manual (tampering cu stateHash)
  it('Scenariul Z — Import snapshot alterat: respins pentru neconcordanță stateHash', () => {
    const s = createInitialState(42, 'City');
    const manipulatedJson = JSON.stringify({
      formatVersion: 'stupul-genesis-v1.1',
      exportedAtIso: new Date().toISOString(),
      state: {
        ...s,
        resources: { ...s.resources, virtualCredits: 999_999 }, // Bani adăugați manual fără recalcul hash
      },
      integrityHash: s.stateHash,
    });

    const importRes = validateAndImportSnapshot(manipulatedJson);
    expect(importRes.success).toBe(false);
    expect(importRes.error).toContain('integritate compromisă');
  });
});

