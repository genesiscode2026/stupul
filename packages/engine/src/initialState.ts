import { GameState, Parcel, TerrainType } from './types.js';
import { PRNG } from './prng.js';
import { sha256, canonicalJsonStringify } from './hash.js';
import { createInitialPuzzle } from './puzzle.js';
import { INITIAL_POPULATION_COUNT, PARCEL_BASE_PRICE_CREDITS } from './constants.js';

export function computeStateHash(state: Omit<GameState, 'stateHash'>): string {
  const canonicalStr = canonicalJsonStringify(state);
  return sha256(canonicalStr);
}

export function createInitialState(seed: number = 42, settlementName: string = 'Avanpostul Văii'): GameState {
  const prng = new PRNG(seed);
  const width = 16;
  const height = 16;
  const grid: Parcel[][] = [];

  // 1. Generate base landscape
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      let terrain: TerrainType = 'grass';
      const roll = prng.next();

      // Creek running through x around 12-14
      if (Math.abs(x - (13 + Math.sin(y * 0.5) * 1.5)) < 1.0) {
        terrain = 'water';
      } else if (roll < 0.22) {
        terrain = 'forest';
      } else if (roll < 0.35) {
        terrain = 'dirt';
      } else if (roll < 0.42) {
        terrain = 'rock';
      } else {
        terrain = 'grass';
      }

      grid[y][x] = {
        x,
        y,
        terrain,
        building: null,
        level: 0,
        ownerAccountId: null,
        isPurchasable: terrain !== 'water',
        virtualPriceCredits: PARCEL_BASE_PRICE_CREDITS
      };
    }
  }

  // 2. Establish Frontier Outpost starting settlement core (around 7, 7)
  const coreBuildings: Array<{ x: number; y: number; building: any; level: number }> = [
    { x: 7, y: 7, building: 'town_hall', level: 1 },
    { x: 8, y: 7, building: 'well', level: 1 },
    { x: 7, y: 6, building: 'farm', level: 1 },
    { x: 8, y: 6, building: 'farm', level: 1 },
    { x: 6, y: 7, building: 'house', level: 1 },
    { x: 6, y: 8, building: 'house', level: 1 },
    { x: 7, y: 8, building: 'road', level: 1 },
    { x: 8, y: 8, building: 'road', level: 1 },
    { x: 9, y: 7, building: 'workshop', level: 1 }
  ];

  for (const b of coreBuildings) {
    const parcel = grid[b.y][b.x];
    parcel.terrain = 'dirt';
    parcel.building = b.building;
    parcel.level = b.level;
    parcel.ownerAccountId = 'public_town_trust';
  }

  const puzzle = createInitialPuzzle();

  const stateWithoutHash: Omit<GameState, 'stateHash'> = {
    rulesetVersion: '1.1.0',
    seed,
    tick: 0,
    settlementName,
    stage: 'frontier_outpost',
    gridWidth: 16,
    gridHeight: 16,
    grid,
    resources: {
      food: 350,
      materials: 250,
      virtualCredits: 200,
      maxFoodStorage: 1000,
      maxMaterialsStorage: 1000
    },
    population: {
      total: INITIAL_POPULATION_COUNT,
      employed: 65,
      satisfaction: 78,
      foodSatisfaction: 85,
      shelterSatisfaction: 75,
      waterSatisfaction: 80,
      safetySatisfaction: 70,
      educationSatisfaction: 60,
      birthsCumulative: 0,
      deathsCumulative: 0
    },
    policies: {
      taxRatePercent: 10,
      foodRationing: 'standard',
      educationSubsidyPercent: 15,
      infrastructureBudgetCredits: 5
    },
    infrastructurePuzzle: puzzle
  };

  const stateHash = computeStateHash(stateWithoutHash);

  return {
    ...stateWithoutHash,
    stateHash
  };
}
