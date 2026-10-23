import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  reduce,
  SimulationHistory,
  evaluatePuzzleConnectivity
} from '../packages/engine/src/index.js';
import {
  validateAndImportSnapshot
} from '../packages/shared/src/index.js';
import { checkRolePermission } from '../packages/domain/src/index.js';

describe('Motorul Deterministic și Simularea Urbană (STP-T01 — STP-T06, T-001 — T-020)', () => {
  it('STP-T01 & T-001: seed fix + 1000 de tick-uri produce ACELAȘI stateHash în rulări repetate (Determinism)', () => {
    const SEED = 1337;
    const TICKS = 1000;

    let stateA = createInitialState(SEED);
    for (let i = 0; i < TICKS; i++) {
      const res = reduce(stateA, { type: 'TICK' });
      stateA = res.nextState;
    }

    let stateB = createInitialState(SEED);
    for (let i = 0; i < TICKS; i++) {
      const res = reduce(stateB, { type: 'TICK' });
      stateB = res.nextState;
    }

    expect(stateA.stateHash).toBe(stateB.stateHash);
    expect(stateA.resources.food).toBe(stateB.resources.food);
    expect(stateA.population.total).toBe(stateB.population.total);
  });

  it('STP-T02 & T-003: două revendicări / construcții pe aceeași parcelă => exact una acceptată, cealaltă respinsă', () => {
    let state = createInitialState(42);
    // Parcel (3, 3) is wild land
    expect(state.grid[3][3].ownerAccountId).toBeNull();
    expect(state.grid[3][3].building).toBeNull();

    // Actor 1 claims parcel (3, 3)
    const claim1 = reduce(state, { type: 'CLAIM_PARCEL', x: 3, y: 3, actorId: 'player1' });
    expect(claim1.success).toBe(true);
    state = claim1.nextState;
    expect(state.grid[3][3].ownerAccountId).toBe('player1');

    // Actor 2 tries to claim the same parcel (3, 3) -> MUST FAIL (STP-T02)
    const claim2 = reduce(state, { type: 'CLAIM_PARCEL', x: 3, y: 3, actorId: 'player2' });
    expect(claim2.success).toBe(false);
    expect(claim2.error).toContain('STP-T02');

    // Now construct building: Player 1 builds a house
    const build1 = reduce(state, { type: 'CONSTRUCT_BUILDING', x: 3, y: 3, buildingType: 'house', actorId: 'player1' });
    expect(build1.success).toBe(true);
    state = build1.nextState;
    expect(state.grid[3][3].building).toBe('house');

    // Player tries to construct a farm on the already built parcel -> MUST FAIL (T-003)
    const build2 = reduce(state, { type: 'CONSTRUCT_BUILDING', x: 3, y: 3, buildingType: 'farm', actorId: 'player1' });
    expect(build2.success).toBe(false);
    expect(build2.error).toContain('T-003');
  });

  it('T-004: resurse insuficiente => comanda este respinsă și trezoreria rămâne neschimbată', () => {
    const state = createInitialState(42);
    // Empty town materials
    state.resources.materials = 5;
    const initialCredits = state.resources.virtualCredits;

    const build = reduce(state, { type: 'CONSTRUCT_BUILDING', x: 4, y: 4, buildingType: 'school', actorId: 'player1' });
    expect(build.success).toBe(false);
    expect(build.error).toContain('T-004');
    expect(state.resources.virtualCredits).toBe(initialCredits);
    expect(state.grid[4][4].building).toBeNull();
  });

  it('T-006: import JSON corupt returnează mesaj de eroare clar fără distrugerea stării', () => {
    const corruptJson = '{"formatVersion":"stupul-genesis-v1.1","state":{"corrupted":true}}';
    const res = validateAndImportSnapshot(corruptJson);
    expect(res.success).toBe(false);
    expect(res.error).toContain('T-006');
  });

  it('STP-T05 & T-011: replay determinist din istoric produce aceeași stare ca aplicarea directă', () => {
    const SEED = 999;
    const history = new SimulationHistory(SEED);

    let liveState = createInitialState(SEED);
    for (let i = 0; i < 50; i++) {
      const cmd = { type: 'TICK' as const };
      const res = reduce(liveState, cmd);
      liveState = res.nextState;
      history.record(cmd, liveState.stateHash);
    }

    const replayRes = history.replay();
    expect(replayRes.valid).toBe(true);
    expect(replayRes.finalState.stateHash).toBe(liveState.stateHash);
  });

  it('STP-005: puzzle-ul de apeduct detectează conexiunea topologică și acordă recompensa', () => {
    const state = createInitialState(42);
    const puzzle = state.infrastructurePuzzle;
    expect(puzzle.width).toBe(4);
    expect(puzzle.height).toBe(4);

    // Initial state is unsolved
    expect(puzzle.solved).toBe(false);

    // Solve path: source at (0, 0), reservoir at (3, 3)
    // Rotate tiles along the top and right edge to make a complete path
    // Tile (0, 1): corner (flows S and E) -> rotate to 90 (flows E-S)
    puzzle.tiles[0][1].type = 'straight';
    puzzle.tiles[0][1].rotation = 90; // E-W
    puzzle.tiles[0][2].type = 'straight';
    puzzle.tiles[0][2].rotation = 90; // E-W
    puzzle.tiles[0][3].type = 'corner';
    puzzle.tiles[0][3].rotation = 90; // E-S (connects from West, goes South) -> wait, corner 180 is S-W (accepts from East and flows South)
    puzzle.tiles[0][3].rotation = 180; // S-W: accepts W, flows S
    puzzle.tiles[1][3].type = 'straight';
    puzzle.tiles[1][3].rotation = 0; // N-S
    puzzle.tiles[2][3].type = 'straight';
    puzzle.tiles[2][3].rotation = 0; // N-S

    const connected = evaluatePuzzleConnectivity(puzzle);
    expect(connected).toBe(true);
    expect(puzzle.solved).toBe(true);
  });

  it('STP-T06: rolurile de cetățean/politice nu pot accesa acțiuni administrative/securitate', () => {
    expect(checkRolePermission('citizen', 'export_user_pii')).toBe(false);
    expect(checkRolePermission('elected', 'export_user_pii')).toBe(false);
    expect(checkRolePermission('citizen', 'deploy_code')).toBe(false);
    expect(checkRolePermission('custodian', 'deploy_code')).toBe(true);
    expect(checkRolePermission('citizen', 'vote')).toBe(true);
  });
});
