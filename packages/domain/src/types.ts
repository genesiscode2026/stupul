/**
 * STUPUL GENESIS v1.1 — Domain Contracts & Types
 * Normalized, strict, pure domain contracts.
 */

export type ActorId = string;

export type ActorRole = 
  | 'citizen'
  | 'contributor'
  | 'elected'
  | 'reviewer'
  | 'custodian'
  | 'commercialOperator';

export interface Actor {
  actorId: ActorId;
  name: string;
  accountCreatedAtMs: number;
  eligibilityEvidenceRefs: string[];
  role: ActorRole;
  isEligibleCitizen: boolean;
  isEligibleContributor: boolean;
}

export type ContributionKind =
  | 'code'
  | 'visual'
  | 'systems'
  | 'qa'
  | 'security'
  | 'documentation'
  | 'civic'
  | 'growth';

export interface Contribution {
  id: string;
  actorId: ActorId;
  kind: ContributionKind;
  evidenceHash: string;
  licenseAcceptanceRef: string;
  rubricScore: number; // 0..100
  impactWeight: 1 | 2 | 3;
  reviewerIds: ActorId[];
  reviewerIndependent: boolean;
  conflictsDeclared: boolean;
  testsPassed: boolean;
  mergedAndDelivered: boolean;
  isSpamOrFakeTraffic: boolean;
  acceptedAtMs: number;
  revoked: boolean;
  appealRef?: string;
}

export type ProposalScope = 'city' | 'roadmap' | 'constitution' | 'legal' | 'commercial';

export type ProposalStatus =
  | 'draft'
  | 'deliberation'
  | 'voting'
  | 'passed'
  | 'rejected'
  | 'quarantined'
  | 'timelocked'
  | 'executed'
  | 'rolledBack';

export interface Proposal {
  proposalId: string;
  title: string;
  description: string;
  scope: ProposalScope;
  proposerId: ActorId;
  createdAtMs: number;
  deliberationDays: number;
  timelockHours: number;
  snapshotId: string;
  deadlineMs: number;
  status: ProposalStatus;
  reason?: string;
  targetPolicyChanges?: Record<string, number | string | boolean>;
}

export type VoteChoice = 'yes' | 'no' | 'abstain';

export interface Ballot {
  ballotId: string;
  proposalId: string;
  actorId: ActorId;
  chamber: 'citizen' | 'contributor';
  choice: VoteChoice;
  weight: number;
  castAtMs: number;
}

export interface LegalGate {
  operatorVerified: boolean;
  ipInventoryReviewed: boolean;
  licenseExecuted: boolean;
  counselApproved: boolean;
  taxPaymentReviewed: boolean;
  gdprCompliant: boolean;
}

export interface EligibleReceipts {
  gross: number;
  collectedTax: number;
  refunds: number;
  refundedChargebacks: number;
  directProcessorFees: number;
  relatedPartyRevenue?: number;
}

export interface RoyaltyCalculation {
  gross: number;
  deductions: number;
  eligible: number;
  founderRoyaltyGross: number; // exactly 5% (0.05)
  withholdingTax: number;
  founderRoyaltyNetPayable: number;
}

export interface CityEvent<T = unknown> {
  seq: number;
  eventId: string;
  type: string;
  actorRef: ActorId;
  payloadVersion: string;
  payload: T;
  stateHashBefore: string;
  stateHashAfter: string;
  serverAcceptedAtMs: number;
  signatureOrIntegrityProof: string;
}
