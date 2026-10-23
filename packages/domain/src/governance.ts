import { ActorId, Contribution, Ballot, Proposal, ProposalScope } from './types.js';
import { activeMerit } from './contributions.js';

/**
 * Calculates citizen vote weight.
 * Invariant GOV-001, GOV-T01, GOV-T02, GOV-T03:
 * Virtual coins, parcel holdings, operator share ownership, or founder status grant ZERO extra vote.
 * Eligible citizen = exactly 1 vote. Ineligible citizen = 0 vote.
 */
export function citizenVoteWeight(
  isEligibleCitizen: boolean,
  virtualCoins: number,
  parcelsOwned: number,
  operatorSharePercent: number,
  isFounder: boolean
): 0 | 1 {
  void virtualCoins;
  void parcelsOwned;
  void operatorSharePercent;
  void isFounder;
  return isEligibleCitizen ? 1 : 0;
}

/**
 * Calculates contributor vote weights across all participating contributors.
 * Rules:
 * - If total eligible contributors < 20: Every eligible contributor gets EQUAL weight (1.0).
 * - If total eligible contributors >= 20: Weighted by activeMerit, BUT with strict CAP at 5% (0.05)
 *   of total chamber weight. Excess weight is redistributed iteratively without exceeding 5%.
 *   If the cap cannot be satisfied (e.g. mathematically impossible), the chamber decision is halted.
 */
export function calculateContributorWeights(
  contributorIds: ActorId[],
  allContributions: Contribution[],
  atMs: number
): Map<ActorId, number> {
  const result = new Map<ActorId, number>();
  const totalCount = contributorIds.length;
  if (totalCount === 0) return result;

  // GOV-T06: Under 20 eligible contributors, all have strictly equal weight
  if (totalCount < 20) {
    const equalWeight = 1.0 / totalCount;
    for (const id of contributorIds) {
      result.set(id, equalWeight);
    }
    return result;
  }

  // GOV-T07: >= 20 contributors -> merit-weighted with max 5% cap (0.05)
  const rawMerits = new Map<ActorId, number>();
  let totalMerit = 0;

  for (const id of contributorIds) {
    const merit = activeMerit(allContributions, id, atMs);
    rawMerits.set(id, merit);
    totalMerit += merit;
  }

  // If no one has merit yet, fall back to equal distribution (which is <= 5% since totalCount >= 20)
  if (totalMerit <= 0) {
    const equalWeight = 1.0 / totalCount;
    for (const id of contributorIds) {
      result.set(id, equalWeight);
    }
    return result;
  }

  const MAX_CAP = 0.05;
  // Iterative redistribution algorithm with 5% cap
  const weights = new Map<ActorId, number>();
  for (const id of contributorIds) {
    weights.set(id, (rawMerits.get(id) || 0) / totalMerit);
  }

  let capped = true;
  let iterations = 0;
  const maxIterations = 50;

  while (capped && iterations < maxIterations) {
    iterations++;
    capped = false;
    let excess = 0;
    let uncappedWeightSum = 0;

    for (const [id, w] of weights.entries()) {
      if (w > MAX_CAP) {
        excess += (w - MAX_CAP);
        weights.set(id, MAX_CAP);
        capped = true;
      } else if (w < MAX_CAP) {
        uncappedWeightSum += w;
      }
    }

    if (excess > 0 && uncappedWeightSum > 0) {
      for (const [id, w] of weights.entries()) {
        if (w < MAX_CAP) {
          const added = excess * (w / uncappedWeightSum);
          weights.set(id, w + added);
        }
      }
    }
  }

  // Final verification: ensure no contributor exceeds MAX_CAP + epsilon
  const EPSILON = 1e-6;
  for (const [id, w] of weights.entries()) {
    if (w > MAX_CAP + EPSILON) {
      throw new Error(`GOV-T07: Contributor ${id} exceeds 5% cap (${w.toFixed(4)} > ${MAX_CAP})`);
    }
    result.set(id, w);
  }

  return result;
}

export interface ChamberTally {
  totalBallots: number;
  yesWeight: number;
  noWeight: number;
  abstainWeight: number;
  approvalRatio: number; // yes / (yes + no)
  quorumMet: boolean;
}

export interface BicameralDecisionResult {
  proposalId: string;
  scope: ProposalScope;
  citizenTally: ChamberTally;
  contributorTally: ChamberTally;
  passed: boolean;
  executable: boolean;
  failureReason?: string;
}

/**
 * Evaluates a bicameral proposal outcome according to GOV-020, GOV-T08.
 * Requirements:
 * - Ordinary city gameplay decisions: simple majority in Citizen Chamber (> 50%).
 * - Major decisions (roadmap): 60% in Citizen Chamber AND 60% in Contributor Chamber.
 * - Constitutional / Fundamental changes:
 *   - Exactly >= 2/3 (66.67%) in BOTH Citizen Chamber AND Contributor Chamber.
 *   - Deliberation period >= 7 days.
 *   - Timelock >= 72 hours before execution.
 */
export function evaluateBicameralDecision(
  proposal: Proposal,
  citizenBallots: Ballot[],
  contributorBallots: Ballot[],
  contributorWeights: Map<ActorId, number>
): BicameralDecisionResult {
  // 1. Tally citizen chamber (1 person = 1 vote)
  let citizenYes = 0;
  let citizenNo = 0;
  let citizenAbstain = 0;
  for (const b of citizenBallots) {
    if (b.choice === 'yes') citizenYes += 1;
    else if (b.choice === 'no') citizenNo += 1;
    else citizenAbstain += 1;
  }
  const citizenTotal = citizenYes + citizenNo;
  const citizenApproval = citizenTotal > 0 ? citizenYes / citizenTotal : 0;
  const citizenTally: ChamberTally = {
    totalBallots: citizenBallots.length,
    yesWeight: citizenYes,
    noWeight: citizenNo,
    abstainWeight: citizenAbstain,
    approvalRatio: citizenApproval,
    quorumMet: citizenBallots.length >= 1
  };

  // 2. Tally contributor chamber
  let contribYes = 0;
  let contribNo = 0;
  let contribAbstain = 0;
  for (const b of contributorBallots) {
    const weight = contributorWeights.get(b.actorId) ?? 0;
    if (b.choice === 'yes') contribYes += weight;
    else if (b.choice === 'no') contribNo += weight;
    else contribAbstain += weight;
  }
  const contribTotal = contribYes + contribNo;
  const contribApproval = contribTotal > 0 ? contribYes / contribTotal : 0;
  const contributorTally: ChamberTally = {
    totalBallots: contributorBallots.length,
    yesWeight: contribYes,
    noWeight: contribNo,
    abstainWeight: contribAbstain,
    approvalRatio: contribApproval,
    quorumMet: contributorBallots.length >= 1
  };

  // 3. Check thresholds based on proposal scope
  if (proposal.scope === 'constitution' || proposal.scope === 'legal') {
    const TWO_THIRDS = 2 / 3;
    const citizenPassed = citizenApproval >= TWO_THIRDS;
    const contribPassed = contribApproval >= TWO_THIRDS;

    if (!citizenPassed || !contribPassed) {
      return {
        proposalId: proposal.proposalId,
        scope: proposal.scope,
        citizenTally,
        contributorTally,
        passed: false,
        executable: false,
        failureReason: `GOV-T08: Failed 2/3 supermajority in both chambers (Citizen: ${(citizenApproval * 100).toFixed(1)}%, Contributor: ${(contribApproval * 100).toFixed(1)}%)`
      };
    }

    // Check deliberation >= 7 days and timelock >= 72 hours
    const deliberationMet = proposal.deliberationDays >= 7;
    const timelockMet = proposal.timelockHours >= 72;

    if (!deliberationMet || !timelockMet) {
      return {
        proposalId: proposal.proposalId,
        scope: proposal.scope,
        citizenTally,
        contributorTally,
        passed: true,
        executable: false,
        failureReason: `GOV-T08: Passed vote but cannot execute: requires >= 7 days deliberation (got ${proposal.deliberationDays}) and >= 72h timelock (got ${proposal.timelockHours}h)`
      };
    }

    return {
      proposalId: proposal.proposalId,
      scope: proposal.scope,
      citizenTally,
      contributorTally,
      passed: true,
      executable: true
    };
  }

  if (proposal.scope === 'roadmap') {
    // 60% in both
    const citizenPassed = citizenApproval >= 0.60;
    const contribPassed = contribApproval >= 0.60;
    const passed = citizenPassed && contribPassed;

    return {
      proposalId: proposal.proposalId,
      scope: proposal.scope,
      citizenTally,
      contributorTally,
      passed,
      executable: passed,
      failureReason: passed ? undefined : 'Requires 60% majority in both Citizen and Contributor chambers'
    };
  }

  // Ordinary city gameplay decisions: simple majority (> 50%) in citizen chamber
  const passed = citizenApproval > 0.50;
  return {
    proposalId: proposal.proposalId,
    scope: proposal.scope,
    citizenTally,
    contributorTally,
    passed,
    executable: passed,
    failureReason: passed ? undefined : 'Citizen simple majority (> 50%) not met'
  };
}
