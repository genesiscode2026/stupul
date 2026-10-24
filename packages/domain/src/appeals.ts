import { ActorId } from './types.js';

/**
 * GOV-050 — Drepturi și remedii: apel și contestații.
 * O sancțiune/decizie poate fi contestată cu motiv scris, dovezi permise,
 * termen limitat, revizuire independentă (fără conflict de interese) și
 * decizie motivată, reversibilă și auditată.
 */

export type AppealStatus = 'open' | 'under_review' | 'upheld' | 'rejected' | 'expired';

export interface Appeal {
  appealId: string;
  /** Subiectul contestat (ex. id-ul contribuției sau al sancțiunii). */
  subjectId: string;
  appellantId: ActorId;
  /** Actorul care a emis decizia inițială. */
  respondentId: ActorId;
  grounds: string;
  evidenceRefs: string[];
  filedAtMs: number;
  deadlineMs: number;
  status: AppealStatus;
  reviewerId?: ActorId;
  reviewerIndependent?: boolean;
  decision?: 'upheld' | 'rejected';
  decisionReason?: string;
  decidedAtMs?: number;
  reversible: boolean;
  auditLog: Array<{ atIso: string; event: string; actorId: ActorId }>;
}

export function fileAppeal(params: {
  appealId: string;
  subjectId: string;
  appellantId: ActorId;
  respondentId: ActorId;
  grounds: string;
  evidenceRefs?: string[];
  filedAtMs: number;
  deadlineMs: number;
  reversible?: boolean;
}): Appeal {
  if (!params.grounds || params.grounds.trim().length === 0) {
    throw new Error('appeal requires written grounds');
  }
  if (params.appellantId === params.respondentId) {
    throw new Error('appellant cannot appeal their own decision');
  }
  return {
    appealId: params.appealId,
    subjectId: params.subjectId,
    appellantId: params.appellantId,
    respondentId: params.respondentId,
    grounds: params.grounds,
    evidenceRefs: params.evidenceRefs ?? [],
    filedAtMs: params.filedAtMs,
    deadlineMs: params.deadlineMs,
    status: 'open',
    reversible: params.reversible ?? true,
    auditLog: [{ atIso: new Date(params.filedAtMs).toISOString(), event: 'filed', actorId: params.appellantId }],
  };
}

export function isAppealTimely(appeal: Appeal, nowMs: number): boolean {
  return nowMs <= appeal.deadlineMs;
}

export function assignReviewer(
  appeal: Appeal,
  reviewerId: ActorId,
  nowMs: number,
): Appeal {
  // Conflict de interese: revizuitorul nu poate fi appellant sau respondent.
  if (reviewerId === appeal.appellantId || reviewerId === appeal.respondentId) {
    throw new Error('appeal reviewer conflict of interest');
  }
  return {
    ...appeal,
    status: 'under_review',
    reviewerId,
    reviewerIndependent: true,
    auditLog: [...appeal.auditLog, { atIso: new Date(nowMs).toISOString(), event: 'reviewer_assigned', actorId: reviewerId }],
  };
}

export function decideAppeal(
  appeal: Appeal,
  decision: 'upheld' | 'rejected',
  decisionReason: string,
  nowMs: number,
): Appeal {
  if (appeal.status !== 'under_review' || !appeal.reviewerId) {
    throw new Error('appeal must be under review before a decision');
  }
  if (!decisionReason || decisionReason.trim().length === 0) {
    throw new Error('appeal decision requires a written reason');
  }
  return {
    ...appeal,
    status: decision === 'upheld' ? 'upheld' : 'rejected',
    decision,
    decisionReason,
    decidedAtMs: nowMs,
    auditLog: [...appeal.auditLog, { atIso: new Date(nowMs).toISOString(), event: `decided_${decision}`, actorId: appeal.reviewerId }],
  };
}

/** Contestație tardivă → expirată. */
export function expireAppeal(appeal: Appeal, nowMs: number): Appeal {
  if (appeal.status !== 'open' || nowMs <= appeal.deadlineMs) {
    return appeal;
  }
  return { ...appeal, status: 'expired' };
}
