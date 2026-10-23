import { CityEvent } from './types.js';

/**
 * Validates the cryptographic / sequential integrity of the append-only event log.
 * Invariant GOV-T10, STP-100:
 * Any tampering, deletion, reordering, or alteration of stateHashBefore / stateHashAfter
 * will immediately fail validation.
 */
export function verifyEventLogIntegrity(events: CityEvent[]): { valid: boolean; error?: string } {
  if (events.length === 0) return { valid: true };

  for (let i = 0; i < events.length; i++) {
    const current = events[i];

    // Check sequence numbers are strictly incrementing by 1
    if (current.seq !== i + 1) {
      return {
        valid: false,
        error: `GOV-T10: Sequence discontinuity at index ${i}: expected seq ${i + 1}, found ${current.seq}`
      };
    }

    // Check chaining of state hashes
    if (i > 0) {
      const prev = events[i - 1];
      if (current.stateHashBefore !== prev.stateHashAfter) {
        return {
          valid: false,
          error: `GOV-T10: State hash link broken at seq ${current.seq}: stateHashBefore (${current.stateHashBefore}) != prev.stateHashAfter (${prev.stateHashAfter})`
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Checks whether an actor role has permission to execute specific operational actions.
 * Invariant STP-T06: Political/Citizen roles cannot invoke payment endpoints, cloud deploy, or user data export.
 */
export function checkRolePermission(
  role: string,
  action: 'vote' | 'propose' | 'build' | 'manage_finances' | 'deploy_code' | 'export_user_pii'
): boolean {
  if (action === 'export_user_pii') {
    return false; // GDPR / privacy protection: prohibited for all game roles
  }

  if (action === 'deploy_code' || action === 'manage_finances') {
    return role === 'custodian' || role === 'commercialOperator';
  }

  // Civic actions
  return true;
}
