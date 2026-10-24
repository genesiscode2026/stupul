import { Parcel, TerrainType } from './types.js';

export interface ChunkCoordinate {
  chunkX: number;
  chunkY: number;
}

export interface GlobalParcelCoordinate {
  chunkX: number;
  chunkY: number;
  localX: number; // 0..15
  localY: number; // 0..15
}

export interface CityDistrict {
  id: string; // e.g. "district_0_0"
  chunkX: number;
  chunkY: number;
  name: string;
  unlockedAtTick: number;
  parcels: Parcel[][];
  occupancyRate: number; // 0.0 - 1.0 (>= 0.75 declanșează extinderea)
}

export const CHUNK_SIZE = 16;
export const EXPANSION_OCCUPANCY_THRESHOLD = 0.75; // 75% densitate de ocupare

/**
 * Generează un identificator canonic global pentru o parcelă: "chunkX_chunkY:localX:localY"
 */
export function toGlobalParcelId(chunkX: number, chunkY: number, localX: number, localY: number): string {
  return `${chunkX}_${chunkY}:${localX}:${localY}`;
}

/**
 * Parsează un identificator global de parcelă.
 */
export function parseGlobalParcelId(id: string): GlobalParcelCoordinate {
  const [chunkPart, localPart] = id.split(':');
  if (!chunkPart || !localPart) throw new Error(`ID parcelă invalid: ${id}`);
  const [cx, cy] = chunkPart.split('_').map(Number);
  const parts = id.split(':');
  const lx = Number(parts[1]);
  const ly = Number(parts[2]);
  if (isNaN(cx) || isNaN(cy) || isNaN(lx) || isNaN(ly)) {
    throw new Error(`Coordonate numerice invalide în ID parcelă: ${id}`);
  }
  return { chunkX: cx, chunkY: cy, localX: lx, localY: ly };
}

/**
 * Convertește o coordonată globală în coordonate continue absolute.
 */
export function toAbsoluteCoordinates(coord: GlobalParcelCoordinate): { absX: number; absY: number } {
  return {
    absX: coord.chunkX * CHUNK_SIZE + coord.localX,
    absY: coord.chunkY * CHUNK_SIZE + coord.localY,
  };
}

/**
 * Convertește coordonate absolute continue în coordonată de chunk și coordonată locală.
 */
export function fromAbsoluteCoordinates(absX: number, absY: number): GlobalParcelCoordinate {
  const chunkX = Math.floor(absX / CHUNK_SIZE);
  const chunkY = Math.floor(absY / CHUNK_SIZE);
  const localX = ((absX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const localY = ((absY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  return { chunkX, chunkY, localX, localY };
}

/**
 * Calculează gradul de ocupare al unui district/chunk (0.0..1.0).
 * O parcelă este considerată ocupată dacă este revendicată sau are o clădire construită.
 */
export function calculateChunkOccupancy(parcels: Parcel[][]): number {
  let occupied = 0;
  let total = 0;
  for (let y = 0; y < parcels.length; y++) {
    for (let x = 0; x < parcels[y].length; x++) {
      total++;
      const p = parcels[y][x];
      if (p.ownerAccountId !== null || p.building !== null) {
        occupied++;
      }
    }
  }
  return total > 0 ? occupied / total : 0;
}

/**
 * PRNG determinist (Mulberry32) bazat pe seed și coordonate chunk.
 */
function createDeterministicRandom(seed: number, chunkX: number, chunkY: number): () => number {
  let h = (seed ^ (chunkX * 73856093) ^ (chunkY * 19349663)) >>> 0;
  return function () {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generează un nou District procedural la frontieră, determinist conform seed-ului.
 */
export function generateProceduralDistrict(
  chunkX: number,
  chunkY: number,
  masterSeed: number,
  currentTick: number
): CityDistrict {
  const rng = createDeterministicRandom(masterSeed, chunkX, chunkY);
  const parcels: Parcel[][] = [];

  const districtNames: Record<string, string> = {
    '0_0': 'Districtul Central (Genesis)',
    '1_0': 'Districtul Răsăritului',
    '-1_0': 'Districtul Apusului',
    '0_1': 'Districtul Miazănoapte',
    '0_-1': 'Districtul Miazăzi',
  };

  const name = districtNames[`${chunkX}_${chunkY}`] ?? `Districtul Sector (${chunkX}, ${chunkY})`;

  for (let y = 0; y < CHUNK_SIZE; y++) {
    parcels[y] = [];
    for (let x = 0; x < CHUNK_SIZE; x++) {
      const roll = rng();
      let terrain: TerrainType = 'grass';
      if (roll < 0.15) terrain = 'forest';
      else if (roll < 0.25) terrain = 'dirt';
      else if (roll < 0.32) terrain = 'water';
      else if (roll < 0.38) terrain = 'rock';

      // Parcelele de apă și stâncă nu sunt cumpărabile inițial
      const isPurchasable = terrain !== 'water' && terrain !== 'rock';

      parcels[y][x] = {
        x,
        y,
        terrain,
        building: null,
        level: 0,
        ownerAccountId: null,
        isPurchasable,
        virtualPriceCredits: 100, // Preț standard de frontieră
      };
    }
  }

  return {
    id: `district_${chunkX}_${chunkY}`,
    chunkX,
    chunkY,
    name,
    unlockedAtTick: currentTick,
    parcels,
    occupancyRate: 0,
  };
}

/**
 * Manager de Districte pentru Expansiunea Progresivă a Orașului STUPUL.
 * Păstrează intact Genesis Chunk (0,0) și extinde determinist harta pe măsură ce populația crește.
 */
export class DistrictManager {
  private districts = new Map<string, CityDistrict>();

  constructor(public readonly masterSeed: number = 42) {}

  /**
   * Inițializează Districtul Central (Genesis 0,0) din matricea inițială existentă de 16x16.
   * Păstrează integral toate parcelele, clădirile, nivelele și proprietarii.
   */
  public initializeGenesisDistrict(genesisGrid: Parcel[][], tick: number = 0): CityDistrict {
    const occupancy = calculateChunkOccupancy(genesisGrid);
    const genesisDistrict: CityDistrict = {
      id: 'district_0_0',
      chunkX: 0,
      chunkY: 0,
      name: 'Districtul Central (Genesis)',
      unlockedAtTick: tick,
      parcels: genesisGrid,
      occupancyRate: occupancy,
    };
    this.districts.set(genesisDistrict.id, genesisDistrict);
    return genesisDistrict;
  }

  public getDistrict(chunkX: number, chunkY: number): CityDistrict | undefined {
    return this.districts.get(`district_${chunkX}_${chunkY}`);
  }

  public getAllDistricts(): CityDistrict[] {
    return Array.from(this.districts.values());
  }

  public getDistrictCount(): number {
    return this.districts.size;
  }

  /**
   * Verifică dacă densitatea de ocupare a unui district depășește pragul de 75%
   * și deblochează districtele adiacente neexplorate.
   */
  public evaluateAndExpand(currentTick: number): {
    expanded: boolean;
    newlyUnlockedDistricts: string[];
  } {
    const newlyUnlocked: string[] = [];

    // Verificăm districtele existente
    for (const district of Array.from(this.districts.values())) {
      district.occupancyRate = calculateChunkOccupancy(district.parcels);

      if (district.occupancyRate >= EXPANSION_OCCUPANCY_THRESHOLD) {
        // Districtul a depășit 75% ocupare -> deblocăm vecinii cardinali (N, E, S, V)
        const neighbors: ChunkCoordinate[] = [
          { chunkX: district.chunkX + 1, chunkY: district.chunkY },
          { chunkX: district.chunkX - 1, chunkY: district.chunkY },
          { chunkX: district.chunkX, chunkY: district.chunkY + 1 },
          { chunkX: district.chunkX, chunkY: district.chunkY - 1 },
        ];

        for (const n of neighbors) {
          const key = `district_${n.chunkX}_${n.chunkY}`;
          if (!this.districts.has(key)) {
            const newDistrict = generateProceduralDistrict(n.chunkX, n.chunkY, this.masterSeed, currentTick);
            this.districts.set(key, newDistrict);
            newlyUnlocked.push(newDistrict.id);
          }
        }
      }
    }

    return {
      expanded: newlyUnlocked.length > 0,
      newlyUnlockedDistricts: newlyUnlocked,
    };
  }

  /**
   * Returnează o parcelă după coordonata sa globală completă.
   */
  public getParcel(coord: GlobalParcelCoordinate): Parcel | null {
    const district = this.getDistrict(coord.chunkX, coord.chunkY);
    if (!district) return null;
    if (coord.localX < 0 || coord.localX >= CHUNK_SIZE || coord.localY < 0 || coord.localY >= CHUNK_SIZE) {
      return null;
    }
    return district.parcels[coord.localY][coord.localX];
  }
}
