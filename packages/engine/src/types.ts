/**
 * STUPUL Engine Types — Deterministic 16x16 Simulation Engine
 */

export type TerrainType = 'grass' | 'forest' | 'dirt' | 'water' | 'rock';

export type BuildingType = 
  | 'house'
  | 'farm'
  | 'well'
  | 'warehouse'
  | 'school'
  | 'town_hall'
  | 'road'
  | 'workshop'
  | 'clinic'
  | 'guard_post';

export interface BuildingCost {
  materials: number;
  virtualCredits: number;
  foodUpkeepPerTick: number;
  materialsUpkeepPerTick: number;
}

export interface Parcel {
  x: number;
  y: number;
  terrain: TerrainType;
  building: BuildingType | null;
  level: number; // 0 = undeveloped, 1..3
  ownerAccountId: string | null; // In-game virtual ownership ONLY, STP-008, T-019
  claimedAtTick?: number;
  isPurchasable: boolean;
  virtualPriceCredits: number;
}

export interface Resources {
  food: number;
  materials: number;
  virtualCredits: number; // Exclusively virtual, non-convertible
  maxFoodStorage: number;
  maxMaterialsStorage: number;
}

export interface PopulationNeeds {
  foodSatisfaction: number; // 0..100
  shelterSatisfaction: number; // 0..100
  waterSatisfaction: number; // 0..100
  safetySatisfaction: number; // 0..100
  educationSatisfaction: number; // 0..100
}

export interface Population extends PopulationNeeds {
  total: number;
  employed: number;
  satisfaction: number; // composite 0..100
  birthsCumulative: number;
  deathsCumulative: number;
}

export type FoodRationingMode = 'abundant' | 'standard' | 'austere';

export interface CityPolicies {
  taxRatePercent: number; // 0..30%
  foodRationing: FoodRationingMode;
  educationSubsidyPercent: number; // 0..50% of treasury
  infrastructureBudgetCredits: number; // per tick
}

export type PipeType = 'straight' | 'corner' | 'cross' | 'source' | 'reservoir';

export interface PuzzleTile {
  x: number;
  y: number;
  type: PipeType;
  rotation: 0 | 90 | 180 | 270;
  connected: boolean;
}

export interface InfrastructurePuzzle {
  width: number;
  height: number;
  tiles: PuzzleTile[][];
  sourceX: number;
  sourceY: number;
  reservoirX: number;
  reservoirY: number;
  solved: boolean;
  timesSolved: number;
}

export type SettlementStage = 
  | 'frontier_outpost'
  | 'wild_west_settlement'
  | 'growing_town'
  | 'modern_civilisation';

export interface GameState {
  rulesetVersion: string;
  seed: number;
  tick: number;
  settlementName: string;
  stage: SettlementStage;
  gridWidth: 16;
  gridHeight: 16;
  grid: Parcel[][];
  resources: Resources;
  population: Population;
  policies: CityPolicies;
  infrastructurePuzzle: InfrastructurePuzzle;
  stateHash: string;
}

export type EngineCommand =
  | { type: 'TICK' }
  | { type: 'CLAIM_PARCEL'; x: number; y: number; actorId: string }
  | { type: 'CONSTRUCT_BUILDING'; x: number; y: number; buildingType: BuildingType; actorId: string }
  | { type: 'UPGRADE_BUILDING'; x: number; y: number; actorId: string }
  | { type: 'DEMOLISH_BUILDING'; x: number; y: number; actorId: string }
  | { type: 'SET_POLICY'; policyKey: keyof CityPolicies; value: number | string; actorId: string }
  | { type: 'ROTATE_PUZZLE_TILE'; x: number; y: number; actorId: string }
  | { type: 'WORK_CIVIC_TASK'; actorId: string; taskKind: 'farming' | 'woodcutting' | 'masonry' | 'civic_duty' };

export interface CommandResult {
  success: boolean;
  nextState: GameState;
  eventsEmitted: string[];
  error?: string;
}
