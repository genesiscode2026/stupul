import { Contribution, ActorId } from './types.js';

/**
 * Calculates the awarded score for an individual contribution.
 * Strict adherence to GOV-010, GOV-T04, GOV-T11, GOV-T12.
 */
export function contributionAward(c: Contribution): number {
  // If revoked, tests failed, not merged/delivered, or flagged as spam/artificial -> 0
  if (c.revoked || !c.testsPassed || !c.mergedAndDelivered || c.isSpamOrFakeTraffic) {
    return 0;
  }

  // Must have evidence hash and accepted license
  if (!c.evidenceHash || c.evidenceHash.trim().length === 0) {
    return 0;
  }
  if (!c.licenseAcceptanceRef || c.licenseAcceptanceRef.trim().length === 0) {
    return 0;
  }

  // Reviewer checks: must have reviewers, must be independent, contributor CANNOT review self
  if (!c.reviewerIds || c.reviewerIds.length === 0) {
    return 0;
  }
  if (!c.reviewerIndependent) {
    return 0;
  }
  if (c.reviewerIds.includes(c.actorId)) {
    return 0; // Self-review conflict of interest
  }

  // Score bounded [0, 100] multiplied by impact weight [1, 2, 3]
  const clampedScore = Math.min(100, Math.max(0, c.rubricScore));
  return clampedScore * c.impactWeight;
}

/**
 * Calculates active merit for an actor at a specific timestamp.
 * Invariant: Half-life of 45 days, 0 weight after 90 days.
 * Formula: sum(awarded_i * 2 ^ (-ageDays_i / 45)) for ageDays <= 90
 */
export function activeMerit(allContributions: Contribution[], actorId: ActorId, atMs: number): number {
  const MS_PER_DAY = 86_400_000;
  
  return allContributions
    .filter(c => c.actorId === actorId)
    .reduce((sum, c) => {
      const ageDays = (atMs - c.acceptedAtMs) / MS_PER_DAY;
      // Future dated contributions or older than 90 days are excluded
      if (ageDays < 0 || ageDays > 90) {
        return sum;
      }
      const award = contributionAward(c);
      if (award <= 0) return sum;

      const decayFactor = Math.pow(2, -ageDays / 45);
      return sum + (award * decayFactor);
    }, 0);
}
