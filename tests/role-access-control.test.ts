import { describe, it, expect } from 'vitest';
import {
  DomainRole,
  ROLE_PERMISSIONS,
  hasPermission,
  areRolesCompatible,
  validateRoleAssignment,
  canServeAsMayor,
  checkMayorInactivity,
  MayorTerm,
} from '../packages/domain/src/index.js';

describe('STUPUL GENESIS v3.4 — Access Control Matrix & Incompatibility Law (11 Roles)', () => {
  const allRoles: DomainRole[] = [
    'guest',
    'citizen',
    'property_owner',
    'contributor',
    'reviewer',
    'council_member',
    'mayor',
    'technical_admin',
    'financial_admin',
    'commercial_operator',
    'independent_custodian',
  ];

  it('ACM-01: Toate cele 11 roluri sunt definite și conțin seturi explicite de permisiuni', () => {
    expect(allRoles.length).toBe(11);
    for (const r of allRoles) {
      const perms = ROLE_PERMISSIONS[r];
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBeGreaterThan(0);
      // Toate rolurile au cel puțin permisiunea VIEW_STATE
      expect(hasPermission([r], 'VIEW_STATE')).toBe(true);
    }
  });

  it('ACM-02: Rolul Oaspete (Guest) are strict permisiune de citire (zero privilegii de scriere/financiare)', () => {
    expect(hasPermission(['guest'], 'VIEW_STATE')).toBe(true);
    expect(hasPermission(['guest'], 'WORK_CIVIC_TASK')).toBe(false);
    expect(hasPermission(['guest'], 'VOTE_BALLOT')).toBe(false);
    expect(hasPermission(['guest'], 'CLAIM_PARCEL')).toBe(false);
    expect(hasPermission(['guest'], 'BUILD_ON_PARCEL')).toBe(false);
    expect(hasPermission(['guest'], 'PROPOSE_POLICY')).toBe(false);
    expect(hasPermission(['guest'], 'GENERATE_ROYALTY_CALLDATA')).toBe(false);
    expect(hasPermission(['guest'], 'VETO_NON_COMPLIANT_FORK')).toBe(false);
  });

  it('ACM-03: Separarea puterilor administrative (Tehnic, Financiar, Custode, Operator)', () => {
    // Adminul Tehnic gestionează infrastructura dar NU poate genera calldata financiar
    expect(hasPermission(['technical_admin'], 'MANAGE_INFRASTRUCTURE')).toBe(true);
    expect(hasPermission(['technical_admin'], 'GENERATE_ROYALTY_CALLDATA')).toBe(false);

    // Adminul Financiar generează calldata dar NU poate da ordine primărești sau modifica infrastructura
    expect(hasPermission(['financial_admin'], 'GENERATE_ROYALTY_CALLDATA')).toBe(true);
    expect(hasPermission(['financial_admin'], 'EXECUTE_MAYOR_ORDER')).toBe(false);
    expect(hasPermission(['financial_admin'], 'MANAGE_INFRASTRUCTURE')).toBe(false);

    // Custodele Independent are drept de audit și veto de conformitate redevență
    expect(hasPermission(['independent_custodian'], 'AUDIT_ROYALTY_COMPLIANCE')).toBe(true);
    expect(hasPermission(['independent_custodian'], 'VETO_NON_COMPLIANT_FORK')).toBe(true);
    expect(hasPermission(['independent_custodian'], 'OPERATE_DISTRIBUTION_PORTAL')).toBe(false);
  });

  it('ACM-04: Teste adversariale de incompatibilitate constituțională (Anti-Captură)', () => {
    // Operatorul Comercial NU poate deveni Custode Independent
    expect(areRolesCompatible('commercial_operator', 'independent_custodian')).toBe(false);
    expect(areRolesCompatible('independent_custodian', 'commercial_operator')).toBe(false);

    // Operatorul Comercial NU poate deveni Primar sau Consilier
    expect(areRolesCompatible('commercial_operator', 'mayor')).toBe(false);
    expect(areRolesCompatible('commercial_operator', 'council_member')).toBe(false);

    // Operatorul Comercial NU poate fi Admin Tehnic
    expect(areRolesCompatible('commercial_operator', 'technical_admin')).toBe(false);

    // Custodele Independent NU poate fi Admin Financiar
    expect(areRolesCompatible('independent_custodian', 'financial_admin')).toBe(false);

    // Încercare de atribuire rol incompatibil este respinsă
    const check1 = validateRoleAssignment(['commercial_operator'], 'independent_custodian');
    expect(check1.allowed).toBe(false);
    expect(check1.conflictWith).toBe('commercial_operator');
    expect(check1.reason).toContain('Incompatibilitate constituțională');

    const check2 = validateRoleAssignment(['citizen', 'property_owner'], 'contributor');
    expect(check2.allowed).toBe(true);
  });

  it('ACM-05: Reguli Guvernanță Primar (GOV-030) — Maxim 2 mandate de 30 de zile și fereastră remediere 7 zile', () => {
    // Verificare număr de mandate consecutive
    expect(canServeAsMayor(0)).toBe(true);
    expect(canServeAsMayor(1)).toBe(true);
    expect(canServeAsMayor(2)).toBe(false); // Refuz la al 3-lea mandat consecutiv

    const now = Date.now();
    const MS_DAY = 86_400_000;

    const activeTerm: MayorTerm = {
      mayorId: 'primar_001',
      termNumber: 1,
      startedAtMs: now - 10 * MS_DAY,
      termLengthDays: 30,
      consecutiveTermsServed: 0,
      isActive: true,
      lastCivicActivityMs: now - 5 * MS_DAY,
      inRemedyPeriod: false,
      revoked: false,
    };
    expect(checkMayorInactivity(activeTerm, now).status).toBe('active');

    // 31 de zile inactiv fără avertisment prealabil => doar warning_issued, revocarea arbitrară imediată este interzisă!
    const inactiveTerm: MayorTerm = {
      ...activeTerm,
      lastCivicActivityMs: now - 31 * MS_DAY,
    };
    const checkWarn = checkMayorInactivity(inactiveTerm, now);
    expect(checkWarn.status).toBe('warning_issued');
    expect(checkWarn.canRevokeImmediately).toBe(false);

    // În interiorul ferestrei de remediere de 7 zile => revocarea este blocată (GOV-T09)
    const remedyTerm: MayorTerm = {
      ...inactiveTerm,
      warningIssuedAtMs: now - 3 * MS_DAY, // Au trecut doar 3 zile din cele 7
    };
    const checkRemedy = checkMayorInactivity(remedyTerm, now);
    expect(checkRemedy.status).toBe('remedy_period');
    expect(checkRemedy.canRevokeImmediately).toBe(false);

    // După 30 zile inactivitate + depășirea ferestrei de 7 zile (30 + 8 zile) => eligibil pentru revocare
    const expiredRemedyTerm: MayorTerm = {
      ...inactiveTerm,
      warningIssuedAtMs: now - 8 * MS_DAY,
    };
    const checkEligible = checkMayorInactivity(expiredRemedyTerm, now);
    expect(checkEligible.status).toBe('eligible_for_revocation');
    expect(checkEligible.canRevokeImmediately).toBe(true);
  });
});
