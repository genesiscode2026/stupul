import { ApprovalPolicy, evaluateApprovals, Approver, ApprovalRequest } from './approvals.js';

export interface BeneficiaryRecord {
  beneficiaryId: string;
  label: string;
  /** Adresă PUBLICĂ de încasare — NICIODATĂ cheie privată. */
  publicPayoutAddress: string;
  addressHistory: Array<{
    atIso: string;
    previousAddress: string;
    newAddress: string;
    approvalIds: string[];
    reason: string;
  }>;
}

const CHANGE_POLICY: ApprovalPolicy = {
  requiredApprovals: 2,
  allowedRoles: ['custodian', 'commercialOperator'],
  independenceRequired: true,
};

/**
 * Schimbarea adresei publice de încasare necesită aprobări independente multiple.
 * Nu stochează și nu solicită chei private; nu efectuează transferuri reale.
 */
export function proposePayoutAddressChange(
  record: BeneficiaryRecord,
  newAddress: string,
  initiator: ApprovalRequest,
  approvals: Approver[],
  reason: string,
  atIso?: string,
  policy: ApprovalPolicy = CHANGE_POLICY,
): BeneficiaryRecord {
  if (!/^0x[0-9a-fA-F]{40}$/.test(newAddress)) {
    throw new Error('invalid public payout address (must be 0x + 40 hex)');
  }
  const res = evaluateApprovals(initiator, approvals, policy);
  if (!res.approved) {
    throw new Error(`payout address change rejected: ${res.reason}`);
  }
  const previousAddress = record.publicPayoutAddress;
  return {
    ...record,
    publicPayoutAddress: newAddress,
    addressHistory: [
      ...record.addressHistory,
      {
        atIso: atIso ?? new Date().toISOString(),
        previousAddress,
        newAddress,
        approvalIds: approvals.map(a => a.approverId),
        reason,
      },
    ],
  };
}
