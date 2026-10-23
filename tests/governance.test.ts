import { describe, it, expect } from 'vitest';
import {
  citizenVoteWeight,
  calculateContributorWeights,
  evaluateBicameralDecision,
  contributionAward,
  activeMerit,
  checkMayorInactivity,
  verifyEventLogIntegrity,
  Contribution,
  Proposal,
  Ballot,
  MayorTerm,
  CityEvent
} from '../packages/domain/src/index.js';

describe('Matricea Atomică de Guvernanță (GOV-T01 — GOV-T12)', () => {
  it('GOV-T01: cetățean cu 1.000.000 monede și 100 parcele are EXACT aceeași greutate de vot (1) ca un cetățean eligibil fără bani', () => {
    const poorCitizenWeight = citizenVoteWeight(true, 0, 0, 0, false);
    const ultraRichCitizenWeight = citizenVoteWeight(true, 1_000_000, 100, 0, false);
    expect(poorCitizenWeight).toBe(1);
    expect(ultraRichCitizenWeight).toBe(1);
    expect(poorCitizenWeight).toBe(ultraRichCitizenWeight);

    const ineligibleWeight = citizenVoteWeight(false, 5_000_000, 500, 0, false);
    expect(ineligibleWeight).toBe(0);
  });

  it('GOV-T02: deținătorul a 100% din firma operatoare are ZERO voturi adiționale în camera cetățenilor', () => {
    const regularEligible = citizenVoteWeight(true, 50, 1, 0, false);
    const companyOwner100Percent = citizenVoteWeight(true, 10_000, 50, 100, false);
    expect(companyOwner100Percent).toBe(1);
    expect(companyOwner100Percent).toBe(regularEligible);
  });

  it('GOV-T03: fondatorul, prin redevența de 5%, are ZERO voturi adiționale în cameră', () => {
    const regularEligible = citizenVoteWeight(true, 10, 0, 0, false);
    const founderWeight = citizenVoteWeight(true, 0, 0, 0, true);
    expect(founderWeight).toBe(1);
    expect(founderWeight).toBe(regularEligible);
  });

  it('GOV-T04: un contributor nu poate valida propria contribuție; conflict => awarded=0', () => {
    const selfReviewed: Contribution = {
      id: 'c1',
      actorId: 'alice',
      kind: 'code',
      evidenceHash: 'sha256-abc',
      licenseAcceptanceRef: 'cla-v1',
      rubricScore: 90,
      impactWeight: 2,
      reviewerIds: ['alice'], // CONFLICT: author reviewing self
      reviewerIndependent: false,
      conflictsDeclared: false,
      testsPassed: true,
      mergedAndDelivered: true,
      isSpamOrFakeTraffic: false,
      acceptedAtMs: 1000,
      revoked: false
    };

    expect(contributionAward(selfReviewed)).toBe(0);

    // Independent review by bob
    const validContribution: Contribution = {
      ...selfReviewed,
      reviewerIds: ['bob'],
      reviewerIndependent: true
    };
    expect(contributionAward(validContribution)).toBe(180); // 90 * 2
  });

  it('GOV-T05: contribuția acceptată în urmă cu 45 zile are 50% din scor; peste 90 zile nu contribuie (0)', () => {
    const MS_PER_DAY = 86_400_000;
    const now = 100 * MS_PER_DAY;

    const contribDay0: Contribution = {
      id: 'c-new',
      actorId: 'carol',
      kind: 'systems',
      evidenceHash: 'hash-1',
      licenseAcceptanceRef: 'cla-v1',
      rubricScore: 100,
      impactWeight: 1,
      reviewerIds: ['dave'],
      reviewerIndependent: true,
      conflictsDeclared: false,
      testsPassed: true,
      mergedAndDelivered: true,
      isSpamOrFakeTraffic: false,
      acceptedAtMs: now, // 0 days old
      revoked: false
    };

    const contribDay45: Contribution = {
      ...contribDay0,
      id: 'c-45',
      acceptedAtMs: now - 45 * MS_PER_DAY // 45 days old
    };

    const contribDay91: Contribution = {
      ...contribDay0,
      id: 'c-91',
      acceptedAtMs: now - 91 * MS_PER_DAY // 91 days old
    };

    const meritDay0 = activeMerit([contribDay0], 'carol', now);
    const meritDay45 = activeMerit([contribDay45], 'carol', now);
    const meritDay91 = activeMerit([contribDay91], 'carol', now);

    expect(meritDay0).toBeCloseTo(100, 3);
    expect(meritDay45).toBeCloseTo(50, 3); // Half-life exactly at 45 days
    expect(meritDay91).toBe(0); // Excluded beyond 90 days
  });

  it('GOV-T06: sub 20 de contributori eligibili, toate voturile au greutate egală', () => {
    const contributorIds = ['c1', 'c2', 'c3', 'c4', 'c5']; // 5 contributors (< 20)
    const weights = calculateContributorWeights(contributorIds, [], 1000);

    expect(weights.size).toBe(5);
    for (const id of contributorIds) {
      expect(weights.get(id)).toBeCloseTo(1.0 / 5, 5);
    }
  });

  it('GOV-T07: la >=20 contributori, nicio greutate finală nu depășește 5% (0.05)', () => {
    const contributorIds: string[] = [];
    for (let i = 1; i <= 25; i++) {
      contributorIds.push(`contributor_${i}`);
    }

    // Contributor 1 has huge merit, others have small merit
    const now = 10000;
    const contributions: Contribution[] = [
      {
        id: 'c-huge',
        actorId: 'contributor_1',
        kind: 'code',
        evidenceHash: 'h1',
        licenseAcceptanceRef: 'cla',
        rubricScore: 100,
        impactWeight: 3,
        reviewerIds: ['contributor_2'],
        reviewerIndependent: true,
        conflictsDeclared: false,
        testsPassed: true,
        mergedAndDelivered: true,
        isSpamOrFakeTraffic: false,
        acceptedAtMs: now,
        revoked: false
      }
    ];

    const weights = calculateContributorWeights(contributorIds, contributions, now);

    expect(weights.size).toBe(25);
    for (const [id, w] of weights.entries()) {
      expect(w).toBeLessThanOrEqual(0.050001); // Strict <= 5% cap
    }
  });

  it('GOV-T08: decizie constituțională fără 2/3 în ambele camere este respinsă; fără 7z dezbatere sau 72h timelock este neexecutabilă', () => {
    const proposal: Proposal = {
      proposalId: 'prop-const-1',
      title: 'Amendament Constituțional',
      description: 'Regulă fundamentală',
      scope: 'constitution',
      proposerId: 'citizen1',
      createdAtMs: 1000,
      deliberationDays: 5, // INSUFFICIENT: requires >= 7 days
      timelockHours: 24, // INSUFFICIENT: requires >= 72 hours
      snapshotId: 'snap-1',
      deadlineMs: 50000,
      status: 'voting'
    };

    // Citizen chamber has 60% (below 66.67%)
    const citizenBallots: Ballot[] = [
      { ballotId: 'b1', proposalId: 'prop-const-1', actorId: 'c1', chamber: 'citizen', choice: 'yes', weight: 1, castAtMs: 2000 },
      { ballotId: 'b2', proposalId: 'prop-const-1', actorId: 'c2', chamber: 'citizen', choice: 'yes', weight: 1, castAtMs: 2000 },
      { ballotId: 'b3', proposalId: 'prop-const-1', actorId: 'c3', chamber: 'citizen', choice: 'yes', weight: 1, castAtMs: 2000 },
      { ballotId: 'b4', proposalId: 'prop-const-1', actorId: 'c4', chamber: 'citizen', choice: 'no', weight: 1, castAtMs: 2000 },
      { ballotId: 'b5', proposalId: 'prop-const-1', actorId: 'c5', chamber: 'citizen', choice: 'no', weight: 1, castAtMs: 2000 }
    ];

    const contribBallots: Ballot[] = [
      { ballotId: 'b6', proposalId: 'prop-const-1', actorId: 'dev1', chamber: 'contributor', choice: 'yes', weight: 1, castAtMs: 2000 }
    ];
    const contribWeights = new Map([['dev1', 1.0]]);

    // 1. Rejected because citizen chamber got 60% < 66.67%
    const res1 = evaluateBicameralDecision(proposal, citizenBallots, contribBallots, contribWeights);
    expect(res1.passed).toBe(false);

    // 2. Both chambers pass with 100%, but deliberation is 5 days and timelock is 24h
    const passingCitizens: Ballot[] = [
      { ballotId: 'b1', proposalId: 'prop-const-1', actorId: 'c1', chamber: 'citizen', choice: 'yes', weight: 1, castAtMs: 2000 },
      { ballotId: 'b2', proposalId: 'prop-const-1', actorId: 'c2', chamber: 'citizen', choice: 'yes', weight: 1, castAtMs: 2000 },
      { ballotId: 'b3', proposalId: 'prop-const-1', actorId: 'c3', chamber: 'citizen', choice: 'yes', weight: 1, castAtMs: 2000 }
    ];
    const res2 = evaluateBicameralDecision(proposal, passingCitizens, contribBallots, contribWeights);
    expect(res2.passed).toBe(true);
    expect(res2.executable).toBe(false); // Cannot execute due to deliberation < 7d and timelock < 72h

    // 3. Deliberation 7 days + timelock 72h -> Executable!
    const validProposal: Proposal = {
      ...proposal,
      deliberationDays: 7,
      timelockHours: 72
    };
    const res3 = evaluateBicameralDecision(validProposal, passingCitizens, contribBallots, contribWeights);
    expect(res3.passed).toBe(true);
    expect(res3.executable).toBe(true);
  });

  it('GOV-T09: primar inactiv fără livrabile => avertisment, termen 7 zile; fără revocare arbitrară imediată', () => {
    const MS_PER_DAY = 86_400_000;
    const now = 100 * MS_PER_DAY;

    const term: MayorTerm = {
      mayorId: 'mayor-john',
      termNumber: 1,
      startedAtMs: 50 * MS_PER_DAY,
      termLengthDays: 30,
      consecutiveTermsServed: 0,
      isActive: true,
      lastCivicActivityMs: now - 32 * MS_PER_DAY, // 32 days inactive
      inRemedyPeriod: false,
      revoked: false
    };

    // Step 1: Inactive 32 days, no warning yet -> status is warning_issued, cannot revoke immediately
    const check1 = checkMayorInactivity(term, now);
    expect(check1.status).toBe('warning_issued');
    expect(check1.canRevokeImmediately).toBe(false);

    // Step 2: Warning issued 3 days ago (inside 7 day remedy period) -> cannot revoke arbitrarily!
    const termWithWarning: MayorTerm = {
      ...term,
      warningIssuedAtMs: now - 3 * MS_PER_DAY,
      inRemedyPeriod: true
    };
    const check2 = checkMayorInactivity(termWithWarning, now);
    expect(check2.status).toBe('remedy_period');
    expect(check2.canRevokeImmediately).toBe(false);

    // Step 3: Remedy period expired (8 days since warning without activity) -> eligible for revocation
    const termExpiredRemedy: MayorTerm = {
      ...term,
      warningIssuedAtMs: now - 8 * MS_PER_DAY,
      inRemedyPeriod: true
    };
    const check3 = checkMayorInactivity(termExpiredRemedy, now);
    expect(check3.status).toBe('eligible_for_revocation');
    expect(check3.canRevokeImmediately).toBe(true);
  });

  it('GOV-T10: verificator integritate detectează alterarea event log-ului sau a hash-urilor', () => {
    const validEvents: CityEvent[] = [
      { seq: 1, eventId: 'e1', type: 'INIT', actorRef: 'sys', payloadVersion: '1', payload: {}, stateHashBefore: '0000', stateHashAfter: 'hash1', serverAcceptedAtMs: 1, signatureOrIntegrityProof: 'sig1' },
      { seq: 2, eventId: 'e2', type: 'TICK', actorRef: 'sys', payloadVersion: '1', payload: {}, stateHashBefore: 'hash1', stateHashAfter: 'hash2', serverAcceptedAtMs: 2, signatureOrIntegrityProof: 'sig2' },
      { seq: 3, eventId: 'e3', type: 'TICK', actorRef: 'sys', payloadVersion: '1', payload: {}, stateHashBefore: 'hash2', stateHashAfter: 'hash3', serverAcceptedAtMs: 3, signatureOrIntegrityProof: 'sig3' }
    ];
    expect(verifyEventLogIntegrity(validEvents).valid).toBe(true);

    // Tampered: hash link broken
    const tamperedEvents: CityEvent[] = [
      validEvents[0],
      { ...validEvents[1], stateHashBefore: 'CORRUPTED_HASH' },
      validEvents[2]
    ];
    const checkTampered = verifyEventLogIntegrity(tamperedEvents);
    expect(checkTampered.valid).toBe(false);
    expect(checkTampered.error).toContain('GOV-T10');
  });

  it('GOV-T11: contributor cu 1000 commit-uri fără merge și teste nu obține puncte de merit', () => {
    const unmergedSpam: Contribution = {
      id: 'c-spam',
      actorId: 'spammer',
      kind: 'code',
      evidenceHash: 'hash-abc',
      licenseAcceptanceRef: 'cla-v1',
      rubricScore: 100,
      impactWeight: 3,
      reviewerIds: ['reviewer1'],
      reviewerIndependent: true,
      conflictsDeclared: false,
      testsPassed: false, // Tests failed
      mergedAndDelivered: false, // Not merged
      isSpamOrFakeTraffic: false,
      acceptedAtMs: 1000,
      revoked: false
    };

    expect(contributionAward(unmergedSpam)).toBe(0);
  });

  it('GOV-T12: 100 invitații artificiale / trafic spam nu aduc puncte', () => {
    const fakeTraffic: Contribution = {
      id: 'c-fake',
      actorId: 'botnet',
      kind: 'growth',
      evidenceHash: 'hash-xyz',
      licenseAcceptanceRef: 'cla-v1',
      rubricScore: 100,
      impactWeight: 3,
      reviewerIds: ['reviewer1'],
      reviewerIndependent: true,
      conflictsDeclared: false,
      testsPassed: true,
      mergedAndDelivered: true,
      isSpamOrFakeTraffic: true, // Flagged as artificial/spam
      acceptedAtMs: 1000,
      revoked: false
    };

    expect(contributionAward(fakeTraffic)).toBe(0);
  });
});
