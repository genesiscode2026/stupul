import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  reduce
} from '../packages/engine/src/index.js';
import {
  validateAndImportSnapshot
} from '../packages/shared/src/index.js';
import {
  evaluateBicameralDecision,
  Proposal,
  Ballot
} from '../packages/domain/src/index.js';

describe('Audit Avansat de Securitate, Robustețe și Stres (10.000 de Pași)', () => {
  it('STRESS-10K: Simulare de 10.000 de pași pe seed fix produce determinism matematic identic (fără NaN sau overflow)', () => {
    const SEED = 7777;
    const TOTAL_TICKS = 10_000;

    let stateA = createInitialState(SEED);
    let stateB = createInitialState(SEED);

    for (let i = 0; i < TOTAL_TICKS; i++) {
      const resA = reduce(stateA, { type: 'TICK' });
      const resB = reduce(stateB, { type: 'TICK' });
      stateA = resA.nextState;
      stateB = resB.nextState;
    }

    // 1. Bit-for-bit identical state hash
    expect(stateA.stateHash).toBe(stateB.stateHash);
    expect(stateA.tick).toBe(10_000);
    expect(stateB.tick).toBe(10_000);

    // 2. No NaN, Infinity or negative values
    expect(Number.isFinite(stateA.resources.food)).toBe(true);
    expect(Number.isFinite(stateA.resources.materials)).toBe(true);
    expect(Number.isFinite(stateA.resources.virtualCredits)).toBe(true);
    expect(Number.isFinite(stateA.population.total)).toBe(true);

    expect(stateA.resources.food).toBeGreaterThanOrEqual(0);
    expect(stateA.resources.materials).toBeGreaterThanOrEqual(0);
    expect(stateA.resources.virtualCredits).toBeGreaterThanOrEqual(0);
    expect(stateA.population.total).toBeGreaterThanOrEqual(0);

    expect(stateA.population.satisfaction).toBeGreaterThanOrEqual(0);
    expect(stateA.population.satisfaction).toBeLessThanOrEqual(100);
  }, 25000); // 25s timeout for 10k ticks

  it('SEC-VOTE-DEDUP: Trimiterea de 50 de voturi duplicate de la același cetățean este deduplicată la EXACT 1 vot', () => {
    const proposal: Proposal = {
      proposalId: 'prop-sec-1',
      title: 'Propunere Test Anti-Spam Vot',
      description: 'Test securitate deduplicare vot',
      scope: 'city',
      proposerId: 'primar',
      createdAtMs: 1000,
      deliberationDays: 1,
      timelockHours: 0,
      snapshotId: 'snap-1',
      deadlineMs: 50000,
      status: 'voting'
    };

    // Attacker sends 50 duplicate 'yes' votes
    const spamBallots: Ballot[] = [];
    for (let i = 0; i < 50; i++) {
      spamBallots.push({
        ballotId: `spam-${i}`,
        proposalId: 'prop-sec-1',
        actorId: 'sybil_attacker',
        chamber: 'citizen',
        choice: 'yes',
        weight: 1,
        castAtMs: 2000 + i
      });
    }

    // Honest citizen sends 1 'no' vote
    spamBallots.push({
      ballotId: 'honest-1',
      proposalId: 'prop-sec-1',
      actorId: 'honest_citizen',
      chamber: 'citizen',
      choice: 'no',
      weight: 1,
      castAtMs: 2050
    });

    const contribWeights = new Map<string, number>();
    const result = evaluateBicameralDecision(proposal, spamBallots, [], contribWeights);

    // Tally must count exactly 2 unique citizen ballots (1 yes from attacker, 1 no from honest)
    expect(result.citizenTally.totalBallots).toBe(2);
    expect(result.citizenTally.yesWeight).toBe(1);
    expect(result.citizenTally.noWeight).toBe(1);
    expect(result.citizenTally.approvalRatio).toBe(0.5); // 50%, NOT 50/51
  });

  it('SEC-JSON-INJECT: Respinge încercările de Prototype Pollution și fișiere JSON malițioase', () => {
    // 1. Prototype pollution string in snapshot
    const maliciousJson = '{"formatVersion":"stupul-genesis-v1.1","__proto__":{"isAdmin":true},"state":{"grid":[]}}';

    const resProto = validateAndImportSnapshot(maliciousJson);
    expect(resProto.success).toBe(false);
    expect(resProto.error).toContain('chei interzise');

    // 2. Oversized payload > 5MB
    const hugePayload = '{"formatVersion":"stupul-genesis-v1.1","padding":"' + 'X'.repeat(6 * 1024 * 1024) + '"}';
    const resHuge = validateAndImportSnapshot(hugePayload);
    expect(resHuge.success).toBe(false);
    expect(resHuge.error).toContain('limita maximă');

    // 3. Corrupted grid dimension (e.g. 15 rows instead of 16)
    const validState = createInitialState(42);
    const corruptedGridState = JSON.parse(JSON.stringify(validState));
    corruptedGridState.grid.pop(); // now 15 rows
    const corruptedSnapshot = JSON.stringify({
      formatVersion: 'stupul-genesis-v1.1',
      state: corruptedGridState,
      integrityHash: 'fake_hash'
    });
    const resGrid = validateAndImportSnapshot(corruptedSnapshot);
    expect(resGrid.success).toBe(false);
    expect(resGrid.error).toContain('16 rânduri');
  });

  it('SEC-FRAUD-CMD: Respinge coordonate float, injectare comenzi necunoscute și valori de politici nepermise', () => {
    const state = createInitialState(42);

    // 1. Float coordinates (NaN / crash exploit)
    const floatClaim = reduce(state, { type: 'CLAIM_PARCEL', x: 2.5, y: 3.7, actorId: 'hacker' } as any);
    expect(floatClaim.success).toBe(false);
    expect(floatClaim.error).toContain('întregi');

    // 2. Whitespace / empty actorId
    const emptyActor = reduce(state, { type: 'CLAIM_PARCEL', x: 2, y: 2, actorId: '   ' });
    expect(emptyActor.success).toBe(false);
    expect(emptyActor.error).toContain('actor invalid');

    // 3. Unknown fraudulent command (e.g. MINT_MONEY)
    const unknownCmd = reduce(state, { type: 'MINT_FREE_CREDITS', amount: 999999 } as any);
    expect(unknownCmd.success).toBe(false);
    expect(unknownCmd.error).toContain('Comandă necunoscută');

    // 4. Policy out of bounds (negative tax or 500% tax)
    const negativeTax = reduce(state, { type: 'SET_POLICY', policyKey: 'taxRatePercent', value: -10, actorId: 'admin' });
    expect(negativeTax.success).toBe(false);
    expect(negativeTax.error).toContain('între 0 și 30%');

    const excessiveTax = reduce(state, { type: 'SET_POLICY', policyKey: 'taxRatePercent', value: 99, actorId: 'admin' });
    expect(excessiveTax.success).toBe(false);
    expect(excessiveTax.error).toContain('între 0 și 30%');

    // 5. Prototype pollution policy key
    const protoPolicy = reduce(state, { type: 'SET_POLICY', policyKey: '__proto__' as any, value: true, actorId: 'admin' });
    expect(protoPolicy.success).toBe(false);
    expect(protoPolicy.error).toContain('securitate blocată');

    // 6. Demolish out of bounds
    const oobDemolish = reduce(state, { type: 'DEMOLISH_BUILDING', x: 999, y: -5, actorId: 'admin' });
    expect(oobDemolish.success).toBe(false);
    expect(oobDemolish.error).toContain('Coordonate invalide');
  });

  it('SEC-RACE-CONCURRENCY: 100 de comenzi concurente pe aceeași parcelă acordă proprietatea exact o dată', () => {
    let state = createInitialState(42);
    // Parcel (5, 5) is wild
    let successCount = 0;
    let failureCount = 0;

    for (let i = 1; i <= 100; i++) {
      const res = reduce(state, {
        type: 'CLAIM_PARCEL',
        x: 5,
        y: 5,
        actorId: `citizen_concurrent_${i}`
      });

      if (res.success) {
        successCount++;
        state = res.nextState;
      } else {
        failureCount++;
      }
    }

    expect(successCount).toBe(1);
    expect(failureCount).toBe(99);
    expect(state.grid[5][5].ownerAccountId).toBe('citizen_concurrent_1');
  });
});
