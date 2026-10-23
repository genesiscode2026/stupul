import { ActorId } from './types.js';

export interface MayorTerm {
  mayorId: ActorId;
  termNumber: 1 | 2;
  startedAtMs: number;
  termLengthDays: number; // strictly 30 days
  consecutiveTermsServed: number;
  isActive: boolean;
  lastCivicActivityMs: number;
  warningIssuedAtMs?: number;
  inRemedyPeriod: boolean;
  revoked: boolean;
  revocationReason?: string;
}

/**
 * Checks mayor term eligibility according to GOV-030.
 * Maximum 2 consecutive 30-day terms.
 */
export function canServeAsMayor(consecutiveTermsServed: number): boolean {
  return consecutiveTermsServed < 2;
}

export type MayorInactivityStatus = 
  | 'active'
  | 'warning_issued'
  | 'remedy_period'
  | 'eligible_for_revocation';

/**
 * Evaluates mayor inactivity according to GOV-030 & GOV-T09:
 * - Inactive 30 days without deliverables -> warning issued.
 * - Remedy window of 7 days -> cannot immediately revoke arbitrarily.
 * - If still inactive after 30 + 7 days -> procedure permits revocation.
 */
export function checkMayorInactivity(
  term: MayorTerm,
  currentMs: number
): { status: MayorInactivityStatus; daysInactive: number; canRevokeImmediately: boolean } {
  const MS_PER_DAY = 86_400_000;
  const daysInactive = (currentMs - term.lastCivicActivityMs) / MS_PER_DAY;

  if (daysInactive < 30) {
    return { status: 'active', daysInactive, canRevokeImmediately: false };
  }

  // 30 days inactive reached
  if (!term.warningIssuedAtMs) {
    return { status: 'warning_issued', daysInactive, canRevokeImmediately: false };
  }

  const daysSinceWarning = (currentMs - term.warningIssuedAtMs) / MS_PER_DAY;
  if (daysSinceWarning < 7) {
    // Inside 7-day remedy window: GOV-T09 forbids immediate arbitrary revocation!
    return { status: 'remedy_period', daysInactive, canRevokeImmediately: false };
  }

  // Exceeded 30 days + 7 days remedy period
  return { status: 'eligible_for_revocation', daysInactive, canRevokeImmediately: true };
}
