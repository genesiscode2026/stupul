import { ActorId } from './types.js';

export interface CustodyRecord {
  payoutDestination: {
    asset: 'USDC';
    network: 'BASE';
    address: string;
    label: string;
  };
  lastAuditedAtMs: number;
  authorizedSigners: ActorId[];
  requiredSignatures: number; // M of N multi-sig / dual control
  changeAuditLog: Array<{
    timestampMs: number;
    changedBy: ActorId;
    previousAddress: string;
    newAddress: string;
    signatures: ActorId[];
    reason: string;
  }>;
}

/**
 * Validates and executes an address change for payout custody.
 * Invariant LEG-T06: Requires valid multi-party authorization and audit logging.
 * Anonymous or unilateral single-admin changes are strictly rejected.
 */
export function updatePayoutAddress(
  record: CustodyRecord,
  newAddress: string,
  initiator: ActorId,
  approvingSignatures: ActorId[],
  reason: string,
  timestampMs: number
): CustodyRecord {
  if (!newAddress || !newAddress.startsWith('0x') || newAddress.length !== 42) {
    throw new Error('LEG-T06: Invalid address format for Base network (must be 42-char hex starting with 0x)');
  }

  // Verify approving signatures match authorized signers
  const validSignatures = approvingSignatures.filter(s => record.authorizedSigners.includes(s));
  if (validSignatures.length < record.requiredSignatures) {
    throw new Error(
      `LEG-T06: Insufficient authorized signatures (${validSignatures.length}/${record.requiredSignatures}). Unilateral change rejected.`
    );
  }

  const previousAddress = record.payoutDestination.address;
  const updatedLog = [
    ...record.changeAuditLog,
    {
      timestampMs,
      changedBy: initiator,
      previousAddress,
      newAddress,
      signatures: validSignatures,
      reason
    }
  ];

  return {
    ...record,
    payoutDestination: {
      ...record.payoutDestination,
      address: newAddress
    },
    lastAuditedAtMs: timestampMs,
    changeAuditLog: updatedLog
  };
}

/**
 * Checks whether an operational admin list improperly includes the passive founder.
 * Invariant LEG-T07: Passive founder MUST NOT be in operational admin lists after handover.
 */
export function verifyOperationalAdminList(
  adminList: ActorId[],
  passiveFounderId: ActorId
): boolean {
  return !adminList.includes(passiveFounderId);
}
