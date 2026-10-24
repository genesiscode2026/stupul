import { describe, it, expect } from 'vitest';
import {
  fileAppeal,
  assignReviewer,
  decideAppeal,
  expireAppeal,
  isAppealTimely,
} from '../packages/domain/src/index.js';

const T0 = 1_000_000;
const DAY = 86_400_000;

describe('GOV-050 — Apel și contestații', () => {
  it('contestație validă: motiv scris + termen + independență', () => {
    const appeal = fileAppeal({
      appealId: 'a1', subjectId: 'contrib-1', appellantId: 'alice', respondentId: 'moderator',
      grounds: 'decizie nemotivată', filedAtMs: T0, deadlineMs: T0 + 7 * DAY,
    });
    expect(appeal.status).toBe('open');
    expect(isAppealTimely(appeal, T0 + 3 * DAY)).toBe(true);
  });

  it('contestație fără motiv scris este respinsă', () => {
    expect(() => fileAppeal({
      appealId: 'a2', subjectId: 'c', appellantId: 'alice', respondentId: 'moderator',
      grounds: '   ', filedAtMs: T0, deadlineMs: T0 + DAY,
    })).toThrow(/written grounds/);
  });

  it('auto-contestație (propria decizie) este respinsă', () => {
    expect(() => fileAppeal({
      appealId: 'a3', subjectId: 'c', appellantId: 'moderator', respondentId: 'moderator',
      grounds: 'x', filedAtMs: T0, deadlineMs: T0 + DAY,
    })).toThrow(/own decision/);
  });

  it('conflict de interese: revizuitor = appellant/respondent respins', () => {
    const appeal = fileAppeal({
      appealId: 'a4', subjectId: 'c', appellantId: 'alice', respondentId: 'bob',
      grounds: 'x', filedAtMs: T0, deadlineMs: T0 + DAY,
    });
    expect(() => assignReviewer(appeal, 'alice', T0 + 1)).toThrow(/conflict/);
    expect(() => assignReviewer(appeal, 'bob', T0 + 1)).toThrow(/conflict/);
    const reviewed = assignReviewer(appeal, 'carol', T0 + 1);
    expect(reviewed.status).toBe('under_review');
    expect(reviewed.reviewerIndependent).toBe(true);
  });

  it('decizie motivată: upheld/rejected + reversibilitate + audit', () => {
    const appeal = assignReviewer(fileAppeal({
      appealId: 'a5', subjectId: 'c', appellantId: 'alice', respondentId: 'bob',
      grounds: 'x', filedAtMs: T0, deadlineMs: T0 + DAY,
    }), 'carol', T0 + 1);
    const decided = decideAppeal(appeal, 'upheld', 'sancțiunea a fost disproporționată', T0 + 2);
    expect(decided.status).toBe('upheld');
    expect(decided.reversible).toBe(true);
    expect(decided.auditLog.length).toBe(3);
    expect(decided.decisionReason).toContain('disproporționată');
  });

  it('decizie fără revizuire prealabilă respinsă', () => {
    const appeal = fileAppeal({
      appealId: 'a6', subjectId: 'c', appellantId: 'alice', respondentId: 'bob',
      grounds: 'x', filedAtMs: T0, deadlineMs: T0 + DAY,
    });
    expect(() => decideAppeal(appeal, 'rejected', 'motiv', T0 + 2)).toThrow(/under review/);
  });

  it('contestație tardivă devine expirată', () => {
    const appeal = fileAppeal({
      appealId: 'a7', subjectId: 'c', appellantId: 'alice', respondentId: 'bob',
      grounds: 'x', filedAtMs: T0, deadlineMs: T0 + DAY,
    });
    const expired = expireAppeal(appeal, T0 + DAY + 1);
    expect(expired.status).toBe('expired');
  });
});
