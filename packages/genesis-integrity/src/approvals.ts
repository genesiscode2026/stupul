export interface ApprovalPolicy {
  requiredApprovals: number;
  allowedRoles: string[];
  /** Interzice auto-aprobarea (actorul nu își poate aproba propria acțiune). */
  independenceRequired: boolean;
}

export interface Approver {
  approverId: string;
  approverRole: string;
}

export interface ApprovalRequest {
  actorId: string;
  actorRole: string;
}

/**
 * Evaluează dacă o acțiune sensibilă (ex. schimbarea destinației de plată)
 * are aprobările independente necesare. Nicio persoană nu poate acționa unilateral.
 */
export function evaluateApprovals(
  request: ApprovalRequest,
  approvals: Approver[],
  policy: ApprovalPolicy,
): { approved: boolean; reason?: string } {
  const distinct = new Set(approvals.map(a => a.approverId));
  if (distinct.size < policy.requiredApprovals) {
    return { approved: false, reason: `insufficient distinct approvers (${distinct.size}/${policy.requiredApprovals})` };
  }
  if (policy.independenceRequired && approvals.some(a => a.approverId === request.actorId)) {
    return { approved: false, reason: 'self-approval conflict (independence required)' };
  }
  for (const a of approvals) {
    if (!policy.allowedRoles.includes(a.approverRole)) {
      return { approved: false, reason: `role ${a.approverRole} not allowed to approve` };
    }
  }
  return { approved: true };
}
