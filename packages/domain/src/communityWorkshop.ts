import { ActorId } from './types.js';

export type ProposalCategory = 'feature' | 'fix' | 'content' | 'lore' | 'infra' | 'governance';
export type WorkshopProposalStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectStage =
  | 'backlog'
  | 'assigned'
  | 'in_development'
  | 'testing'
  | 'review'
  | 'accepted'
  | 'closed';

export interface CommunityProposal {
  id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  authorId: ActorId;
  votesUp: number;
  votesDown: number;
  status: WorkshopProposalStatus;
  createdAtMs: number;
  reviewedBy?: ActorId;
}

export interface CommunityProject {
  id: string;
  proposalId: string;
  title: string;
  description: string;
  priority: ProjectPriority;
  stage: ProjectStage;
  assigneeId?: ActorId;
  assignedAtMs?: number;
  estimatedCivicPoints: number;
}

export interface ContributionSubmission {
  id: string;
  projectId: string;
  contributorId: ActorId;
  gitRefOrPrUrl: string;
  description: string;
  /** Developer Certificate of Origin (DCO) conform standardului Linux Kernel / Linux Foundation. */
  dcoAccepted: boolean;
  /** Contributor License Agreement (CLA) ce permite exploatarea și transferabilitatea legală. */
  claAccepted: boolean;
  submittedAtMs: number;
}

export interface PeerReview {
  id: string;
  submissionId: string;
  reviewerId: ActorId;
  approved: boolean;
  feedback: string;
  reviewedAtMs: number;
}

export interface CivicMeritAward {
  id: string;
  projectId: string;
  submissionId: string;
  contributorId: ActorId;
  approvedByActorId: ActorId;
  civicPointsAwarded: number;
  awardedAtMs: number;
}

export class CommunityWorkshop {
  private proposals: Map<string, CommunityProposal> = new Map();
  private projects: Map<string, CommunityProject> = new Map();
  private submissions: Map<string, ContributionSubmission> = new Map();
  private reviews: Map<string, PeerReview[]> = new Map();
  private meritAwards: CivicMeritAward[] = [];

  submitProposal(params: {
    id: string;
    title: string;
    description: string;
    category: ProposalCategory;
    authorId: ActorId;
    nowMs?: number;
  }): CommunityProposal {
    if (!params.title.trim()) throw new Error('Proposal title is required');
    if (!params.description.trim()) throw new Error('Proposal description is required');

    const prop: CommunityProposal = {
      id: params.id,
      title: params.title.trim(),
      description: params.description.trim(),
      category: params.category,
      authorId: params.authorId,
      votesUp: 1, // Autorul votează implicit pro
      votesDown: 0,
      status: 'submitted',
      createdAtMs: params.nowMs ?? Date.now(),
    };
    this.proposals.set(prop.id, prop);
    return prop;
  }

  voteProposal(proposalId: string, voterId: ActorId, up: boolean): void {
    const prop = this.proposals.get(proposalId);
    if (!prop) throw new Error('Proposal not found');
    if (prop.status !== 'submitted' && prop.status !== 'under_review') {
      throw new Error('Voting closed for this proposal');
    }
    if (up) prop.votesUp += 1;
    else prop.votesDown += 1;
  }

  promoteToProject(params: {
    projectId: string;
    proposalId: string;
    priority: ProjectPriority;
    estimatedCivicPoints: number;
    reviewerId: ActorId;
  }): CommunityProject {
    const prop = this.proposals.get(params.proposalId);
    if (!prop) throw new Error('Proposal not found');
    prop.status = 'approved';
    prop.reviewedBy = params.reviewerId;

    const proj: CommunityProject = {
      id: params.projectId,
      proposalId: params.proposalId,
      title: prop.title,
      description: prop.description,
      priority: params.priority,
      stage: 'backlog',
      estimatedCivicPoints: Math.max(0, params.estimatedCivicPoints),
    };
    this.projects.set(proj.id, proj);
    return proj;
  }

  assignProject(projectId: string, assigneeId: ActorId, nowMs?: number): CommunityProject {
    const proj = this.projects.get(projectId);
    if (!proj) throw new Error('Project not found');
    if (proj.stage !== 'backlog') throw new Error('Project is not in backlog');

    proj.assigneeId = assigneeId;
    proj.assignedAtMs = nowMs ?? Date.now();
    proj.stage = 'assigned';
    return proj;
  }

  submitWork(params: {
    submissionId: string;
    projectId: string;
    contributorId: ActorId;
    gitRefOrPrUrl: string;
    description: string;
    dcoAccepted: boolean;
    claAccepted: boolean;
    nowMs?: number;
  }): ContributionSubmission {
    const proj = this.projects.get(params.projectId);
    if (!proj) throw new Error('Project not found');
    if (proj.assigneeId !== params.contributorId) {
      throw new Error('Only the assigned contributor can submit work');
    }
    // Garanție legală imperativă P3: Fără DCO și CLA semnate, munca nu poate fi acceptată
    if (!params.dcoAccepted || !params.claAccepted) {
      throw new Error('DCO and CLA acceptance are mandatory for community contributions');
    }

    const sub: ContributionSubmission = {
      id: params.submissionId,
      projectId: params.projectId,
      contributorId: params.contributorId,
      gitRefOrPrUrl: params.gitRefOrPrUrl,
      description: params.description,
      dcoAccepted: true,
      claAccepted: true,
      submittedAtMs: params.nowMs ?? Date.now(),
    };
    this.submissions.set(sub.id, sub);
    proj.stage = 'review';
    return sub;
  }

  reviewWork(params: {
    reviewId: string;
    submissionId: string;
    reviewerId: ActorId;
    approved: boolean;
    feedback: string;
    nowMs?: number;
  }): PeerReview {
    const sub = this.submissions.get(params.submissionId);
    if (!sub) throw new Error('Submission not found');

    // Regula P3: Conflict de interese — contributorul nu își poate recenza propria muncă!
    if (sub.contributorId === params.reviewerId) {
      throw new Error('Anti-self-review: Contributor cannot review their own submission');
    }

    const rev: PeerReview = {
      id: params.reviewId,
      submissionId: params.submissionId,
      reviewerId: params.reviewerId,
      approved: params.approved,
      feedback: params.feedback,
      reviewedAtMs: params.nowMs ?? Date.now(),
    };

    const currentReviews = this.reviews.get(sub.id) ?? [];
    currentReviews.push(rev);
    this.reviews.set(sub.id, currentReviews);

    const proj = this.projects.get(sub.projectId);
    if (proj) {
      proj.stage = params.approved ? 'testing' : 'in_development';
    }
    return rev;
  }

  acceptAndAwardMerit(params: {
    awardId: string;
    submissionId: string;
    approverId: ActorId;
    pointsToAward?: number;
    nowMs?: number;
  }): CivicMeritAward {
    const sub = this.submissions.get(params.submissionId);
    if (!sub) throw new Error('Submission not found');

    // Regula de aur P3: „Nu permite aprobarea propriei recompense”
    if (sub.contributorId === params.approverId) {
      throw new Error('Anti-self-reward: Contributor cannot approve their own merit reward');
    }

    const proj = this.projects.get(sub.projectId);
    if (!proj) throw new Error('Project not found');

    const points = params.pointsToAward ?? proj.estimatedCivicPoints;
    const award: CivicMeritAward = {
      id: params.awardId,
      projectId: proj.id,
      submissionId: sub.id,
      contributorId: sub.contributorId,
      approvedByActorId: params.approverId,
      civicPointsAwarded: points,
      awardedAtMs: params.nowMs ?? Date.now(),
    };

    this.meritAwards.push(award);
    proj.stage = 'accepted';
    return award;
  }

  getProposals(): CommunityProposal[] {
    return Array.from(this.proposals.values());
  }

  getProjects(): CommunityProject[] {
    return Array.from(this.projects.values());
  }

  getMeritAwards(): CivicMeritAward[] {
    return [...this.meritAwards];
  }

  getTotalMeritForContributor(contributorId: ActorId): number {
    return this.meritAwards
      .filter(a => a.contributorId === contributorId)
      .reduce((sum, a) => sum + a.civicPointsAwarded, 0);
  }
}
