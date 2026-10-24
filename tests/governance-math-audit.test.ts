import { describe, it, expect } from 'vitest';
import {
  calculateContributorWeights,
  citizenVoteWeight,
  evaluateBicameralDecision,
  ActorId,
  Contribution,
  Ballot,
  Proposal,
} from '@stupul/domain';

function makeContribution(
  actorId: ActorId,
  rubricScore: number = 80,
  impactWeight: 1 | 2 | 3 = 1,
  atMs: number = Date.now() - 1000
): Contribution {
  return {
    id: `c_${Math.random().toString(36).slice(2, 9)}`,
    actorId,
    kind: 'code',
    evidenceHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    licenseAcceptanceRef: 'DCO-1.1-accepted-commit-proof',
    rubricScore: Math.min(100, Math.max(0, rubricScore)),
    impactWeight,
    reviewerIds: ['reviewer_peer_alpha', 'reviewer_peer_beta'],
    reviewerIndependent: true,
    conflictsDeclared: false,
    testsPassed: true,
    mergedAndDelivered: true,
    isSpamOrFakeTraffic: false,
    acceptedAtMs: atMs,
    revoked: false,
  };
}

describe('Audit Matematic Riguros Guvernanță & Plafonare Vot Contributori (GOV-T06, GOV-T07, GOV-T08)', () => {
  const now = Date.now();

  it('GOV-T01 — Votul Cetățenesc: 1 cetățean eligibil = exact 1 vot, bogăția/parcelele dau 0 voturi în plus', () => {
    // Bogăție extremă, parcele, acțiuni operator, status fondator -> NICIUN vot adițional
    expect(citizenVoteWeight(true, 1_000_000, 500, 99, true)).toBe(1);
    expect(citizenVoteWeight(true, 0, 0, 0, false)).toBe(1);
    expect(citizenVoteWeight(false, 10_000_000, 100, 100, true)).toBe(0);
  });

  it('GOV-T06 — Sub 20 contributori eligibili: ponderi STRICT EGALE indiferent de punctele de merit', () => {
    const testCounts = [1, 2, 5, 10, 19];

    for (const count of testCounts) {
      const ids: ActorId[] = Array.from({ length: count }, (_, i) => `contrib_${i + 1}`);
      // Contrib 1 are multiple contribuții cu scor maxim, restul au o contribuție minoră
      const contributions: Contribution[] = [
        ...Array.from({ length: 5 }, () => makeContribution(ids[0], 100, 3, now - 1000)),
      ];
      for (let i = 1; i < count; i++) {
        contributions.push(makeContribution(ids[i], 10, 1, now - 1000));
      }

      const weights = calculateContributorWeights(ids, contributions, now);
      expect(weights.size).toBe(count);

      const expectedWeight = 1.0 / count;
      let sum = 0;
      for (const id of ids) {
        const w = weights.get(id)!;
        expect(w).toBeCloseTo(expectedWeight, 5);
        sum += w;
      }
      expect(sum).toBeCloseTo(1.0, 5);
    }
  });

  it('GOV-T07 — Exact 20 contributori: caz limită, toți au ponderi calculate cu plafon de 5% (0.05)', () => {
    const count = 20;
    const ids: ActorId[] = Array.from({ length: count }, (_, i) => `contrib_20_${i + 1}`);
    const contributions: Contribution[] = ids.map((id, idx) =>
      makeContribution(id, 50 + (idx % 50), 1, now - 1000)
    );

    const weights = calculateContributorWeights(ids, contributions, now);
    expect(weights.size).toBe(20);

    let sum = 0;
    for (const [_, w] of weights) {
      expect(w).toBeLessThanOrEqual(0.05 + 1e-6);
      sum += w;
    }
    // Cu 20 contributori, dacă toți sunt plafonați la 5%, fiecare are exact 0.05
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('GOV-T07 — 21 contributori cu distribuție asimetrică: cel dominant este plafonat la EXACT 5%', () => {
    const count = 21;
    const ids: ActorId[] = Array.from({ length: count }, (_, i) => `contrib_21_${i + 1}`);
    // Contributorul 1 are merit masiv (10 contribuții majore), ceilalți 20 au merit minim (1 contribuție scor 10)
    const contributions: Contribution[] = [
      ...Array.from({ length: 10 }, () => makeContribution(ids[0], 100, 3, now - 1000)),
    ];
    for (let i = 1; i < count; i++) {
      contributions.push(makeContribution(ids[i], 10, 1, now - 1000));
    }

    const weights = calculateContributorWeights(ids, contributions, now);
    expect(weights.size).toBe(21);

    const dominantWeight = weights.get(ids[0])!;
    expect(dominantWeight).toBeCloseTo(0.05, 5); // Plafonat la exact 5%!

    let sum = 0;
    for (const [_, w] of weights) {
      expect(w).toBeLessThanOrEqual(0.05 + 1e-6);
      sum += w;
    }
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('GOV-T07 — 100 contributori: scenariu extrem unde 1 utilizator are 99% din merit, iar 99 au sub 1%', () => {
    const count = 100;
    const ids: ActorId[] = Array.from({ length: count }, (_, i) => `whale_vs_crowd_${i + 1}`);
    // Whale deține 100 de contribuții mari, restul au 1 contribuție mică
    const contributions: Contribution[] = [
      ...Array.from({ length: 100 }, () => makeContribution(ids[0], 100, 3, now - 1000)),
    ];
    for (let i = 1; i < count; i++) {
      contributions.push(makeContribution(ids[i], 5, 1, now - 1000));
    }

    const weights = calculateContributorWeights(ids, contributions, now);
    expect(weights.size).toBe(100);

    // Contributorul dominant (whale) este strict înghețat la 0.05
    const whaleWeight = weights.get(ids[0])!;
    expect(whaleWeight).toBeCloseTo(0.05, 5);

    let sum = 0;
    for (const [_, w] of weights) {
      expect(w).toBeLessThanOrEqual(0.05 + 1e-6);
      sum += w;
    }
    expect(sum).toBeCloseTo(1.0, 5);

    // Fiecare din ceilalți 99 a primit surplus redistribuit, fără ca vreunul să depășească 0.05
    for (let i = 1; i < count; i++) {
      expect(weights.get(ids[i])!).toBeLessThanOrEqual(0.05);
    }
  });

  it('GOV-T07 — Puncte de merit zero pentru toți contributorii: fallback egalitar 1/N garantat <= 5%', () => {
    const count = 50;
    const ids: ActorId[] = Array.from({ length: count }, (_, i) => `zero_merit_${i + 1}`);
    const contributions: Contribution[] = []; // Nicio contribuție

    const weights = calculateContributorWeights(ids, contributions, now);
    expect(weights.size).toBe(50);

    const expectedWeight = 1.0 / 50; // 0.02, care este sub 0.05
    for (const [_, w] of weights) {
      expect(w).toBeCloseTo(expectedWeight, 5);
    }
  });

  it('GOV-T08 — Decizie Bicamerală Constituțională: necesită 2/3 în ambele camere, 7 zile deliberare, 72h timelock', () => {
    const proposal: Proposal = {
      proposalId: 'prop_const_01',
      title: 'Amendament Constituțional',
      description: 'Protecție perpetuă a redevenței și drepturilor cetățenești',
      authorId: 'actor_legal',
      scope: 'constitution',
      createdAtMs: now - 8 * 86_400_000,
      deliberationDays: 7,
      timelockHours: 72,
      status: 'active',
    };

    // Cetățeni: 10 prezenți, 7 votează DA (70% >= 66.67%), 3 votează NU
    const citizenBallots: Ballot[] = [
      ...Array.from({ length: 7 }, (_, i) => ({
        ballotId: `cb_${i}`,
        proposalId: 'prop_const_01',
        actorId: `cit_${i}`,
        choice: 'yes' as const,
        castAtMs: now - 1000,
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        ballotId: `cb_no_${i}`,
        proposalId: 'prop_const_01',
        actorId: `cit_no_${i}`,
        choice: 'no' as const,
        castAtMs: now - 1000,
      })),
    ];

    // Contributori: 20 contributori, pondere 0.05 fiecare
    const contribIds = Array.from({ length: 20 }, (_, i) => `contrib_${i}`);
    const contribWeights = new Map<ActorId, number>();
    contribIds.forEach(id => contribWeights.set(id, 0.05));

    // 15 votează DA (75% >= 66.67%), 5 votează NU
    const contribBallots: Ballot[] = [
      ...contribIds.slice(0, 15).map((id, i) => ({
        ballotId: `conb_${i}`,
        proposalId: 'prop_const_01',
        actorId: id,
        choice: 'yes' as const,
        castAtMs: now - 1000,
      })),
      ...contribIds.slice(15).map((id, i) => ({
        ballotId: `conb_no_${i}`,
        proposalId: 'prop_const_01',
        actorId: id,
        choice: 'no' as const,
        castAtMs: now - 1000,
      })),
    ];

    const result = evaluateBicameralDecision(proposal, citizenBallots, contribBallots, contribWeights);
    expect(result.passed).toBe(true);
    expect(result.executable).toBe(true);
    expect(result.citizenTally.approvalRatio).toBeCloseTo(0.7, 2);
    expect(result.contributorTally.approvalRatio).toBeCloseTo(0.75, 2);

    // Dacă deliberarea are sub 7 zile, este passed dar NU executable!
    const immatureProposal = { ...proposal, deliberationDays: 3 };
    const immatureResult = evaluateBicameralDecision(immatureProposal, citizenBallots, contribBallots, contribWeights);
    expect(immatureResult.passed).toBe(true);
    expect(immatureResult.executable).toBe(false);
    expect(immatureResult.failureReason).toContain('requires >= 7 days deliberation');
  });
});
