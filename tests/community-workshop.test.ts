import { describe, it, expect } from 'vitest';
import {
  CommunityWorkshop,
  areRolesCompatible,
  validateRoleAssignment,
} from '../packages/domain/src/index.js';

describe('P3 & P4 — Atelierul Comunității și Incompatibilități Guvernanță', () => {

  it('P3 — Ciclu complet: Propunere -> Proiect -> Atribuire -> Submit DCO/CLA -> Review -> Aprobare Merit', () => {
    const workshop = new CommunityWorkshop();

    // 1. Depunere propunere
    const prop = workshop.submitProposal({
      id: 'prop-1',
      title: 'Extindere Rețea Apeduct Sud',
      description: 'Conectarea parcelelor sudice la sursa de apă de munte',
      category: 'infra',
      authorId: 'cetatean_1',
    });
    expect(prop.status).toBe('submitted');

    // Vot comunitar pe propunere
    workshop.voteProposal('prop-1', 'cetatean_2', true);
    workshop.voteProposal('prop-1', 'cetatean_3', true);
    expect(prop.votesUp).toBe(3);

    // 2. Promovare la proiect în backlog
    const proj = workshop.promoteToProject({
      projectId: 'proj-1',
      proposalId: 'prop-1',
      priority: 'high',
      estimatedCivicPoints: 120,
      reviewerId: 'arhitect_civic',
    });
    expect(proj.stage).toBe('backlog');

    // 3. Atribuire către un dezvoltator comunitar
    workshop.assignProject('proj-1', 'dev_comunitar');
    expect(proj.stage).toBe('assigned');
    expect(proj.assigneeId).toBe('dev_comunitar');

    // 4. Trimitere contribuție fără DCO/CLA => respinsă!
    expect(() => {
      workshop.submitWork({
        submissionId: 'sub-fail',
        projectId: 'proj-1',
        contributorId: 'dev_comunitar',
        gitRefOrPrUrl: 'https://github.com/stupul/pull/1',
        description: 'Implementat conducte',
        dcoAccepted: false,
        claAccepted: true,
      });
    }).toThrow(/DCO and CLA acceptance are mandatory/);

    // Trimitere validă cu DCO & CLA semnate
    const sub = workshop.submitWork({
      submissionId: 'sub-1',
      projectId: 'proj-1',
      contributorId: 'dev_comunitar',
      gitRefOrPrUrl: 'https://github.com/stupul/pull/1',
      description: 'Implementat conducte și conexiuni sud',
      dcoAccepted: true,
      claAccepted: true,
    });
    expect(sub.dcoAccepted).toBe(true);
    expect(sub.claAccepted).toBe(true);
    expect(proj.stage).toBe('review');

    // 5. Peer Review: Anti-self-review (contributorul nu poate fi reviewerul propriu)
    expect(() => {
      workshop.reviewWork({
        reviewId: 'rev-fail',
        submissionId: 'sub-1',
        reviewerId: 'dev_comunitar', // același ID
        approved: true,
        feedback: 'Am făcut treabă bună',
      });
    }).toThrow(/Anti-self-review/);

    // Review independent valid
    const review = workshop.reviewWork({
      reviewId: 'rev-1',
      submissionId: 'sub-1',
      reviewerId: 'peer_reviewer_1',
      approved: true,
      feedback: 'Cod conform, teste incluse, determinism verificat',
    });
    expect(review.approved).toBe(true);
    expect(proj.stage).toBe('testing');

    // 6. Aprobare și acordare merit: Anti-self-reward (contributorul nu își poate aproba recompensa)
    expect(() => {
      workshop.acceptAndAwardMerit({
        awardId: 'award-fail',
        submissionId: 'sub-1',
        approverId: 'dev_comunitar', // același ID
      });
    }).toThrow(/Anti-self-reward/);

    // Aprobare validă de către un administrator civic independent
    const award = workshop.acceptAndAwardMerit({
      awardId: 'award-1',
      submissionId: 'sub-1',
      approverId: 'trezorier_civic',
    });
    expect(award.civicPointsAwarded).toBe(120);
    expect(proj.stage).toBe('accepted');

    // Verificare total merit
    expect(workshop.getTotalMeritForContributor('dev_comunitar')).toBe(120);
  });

  it('P4 — Incompatibilități constituționale între roluri', () => {
    // 1. Operatorul Comercial NU poate fi Custode Independent
    expect(areRolesCompatible('commercial_operator', 'independent_custodian')).toBe(false);
    expect(areRolesCompatible('independent_custodian', 'commercial_operator')).toBe(false);

    // 2. Operatorul Comercial NU poate fi Primar sau Consilier
    expect(areRolesCompatible('commercial_operator', 'mayor')).toBe(false);
    expect(areRolesCompatible('commercial_operator', 'council_member')).toBe(false);

    // 3. Custodele Independent NU poate fi Admin Financiar
    expect(areRolesCompatible('independent_custodian', 'financial_admin')).toBe(false);

    // 4. Roluri compatibile: cetățean și contributor
    expect(areRolesCompatible('citizen', 'contributor')).toBe(true);

    // 5. Validare asignare de rol
    const conflict = validateRoleAssignment(['commercial_operator'], 'independent_custodian');
    expect(conflict.allowed).toBe(false);
    expect(conflict.conflictWith).toBe('commercial_operator');

    const ok = validateRoleAssignment(['citizen'], 'contributor');
    expect(ok.allowed).toBe(true);
  });

  it('P6 — Identitate, Explorare Oaspete și Autentificare Passkeys', async () => {
    const { createGuestIdentity, registerCitizenWithPasskey, canPerformCivicAction } = await import('../packages/domain/src/index.js');

    // 1. Mod Oaspete (Guest): Permite explorare și simulare, blochează acțiuni cu miză civică
    const guest = createGuestIdentity(1234);
    expect(guest.mode).toBe('guest');
    expect(guest.username).toBe('Oaspete-1234');

    expect(canPerformCivicAction(guest, 'EXPLORE').allowed).toBe(true);
    expect(canPerformCivicAction(guest, 'PLAY_SIMULATION').allowed).toBe(true);

    const claimBlock = canPerformCivicAction(guest, 'CLAIM_PARCEL');
    expect(claimBlock.allowed).toBe(false);
    expect(claimBlock.reason).toContain('înregistrarea gratuită a unui cont civic');

    const voteBlock = canPerformCivicAction(guest, 'VOTE_ORDINARY_POLICY');
    expect(voteBlock.allowed).toBe(false);

    // 2. Înregistrare Cetățean cu Passkey (fără date personale)
    const citizen = registerCitizenWithPasskey({
      actorId: 'cetatean_alex',
      username: 'AlexPionier',
      passkeyCredentialId: 'cred-webauthn-xyz789',
      passkeyPublicKeyPem: 'PUBLIC KEY DATA...',
    });
    expect(citizen.mode).toBe('registered_citizen');
    expect(citizen.civicScore).toBe(10);
    expect(canPerformCivicAction(citizen, 'CLAIM_PARCEL').allowed).toBe(true);
    expect(canPerformCivicAction(citizen, 'VOTE_ORDINARY_POLICY').allowed).toBe(true);
    expect(canPerformCivicAction(citizen, 'APPROVE_REWARD').allowed).toBe(false); // doar admin
  });

});
