import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  DistrictManager,
  toGlobalParcelId,
  parseGlobalParcelId,
  toAbsoluteCoordinates,
  fromAbsoluteCoordinates,
  calculateChunkOccupancy,
  EXPANSION_OCCUPANCY_THRESHOLD,
  CHUNK_SIZE,
} from '@stupul/engine';

describe('GENESIS v3.3 — Extindere Progresivă a Orașului STUPUL (Chunks / Districte)', () => {

  // TEST 1: Păstrarea Compatibilității Genesis (Districtul Central 0,0)
  it('EXPAND-01: Districtul Central (0,0) păstrează 100% din starea matricei inițiale 16x16', () => {
    const initialState = createInitialState(42);
    const dm = new DistrictManager(42);
    const genesisDistrict = dm.initializeGenesisDistrict(initialState.grid, 0);

    expect(genesisDistrict.id).toBe('district_0_0');
    expect(genesisDistrict.chunkX).toBe(0);
    expect(genesisDistrict.chunkY).toBe(0);
    expect(genesisDistrict.parcels.length).toBe(16);
    expect(genesisDistrict.parcels[0].length).toBe(16);

    // Parcela (7,7) Primăria (town_hall) este intactă
    const townHallParcel = genesisDistrict.parcels[7][7];
    expect(townHallParcel.building).toBe('town_hall');
    expect(townHallParcel.ownerAccountId).toBe('public_town_trust');

    // Nicio parcelă existentă nu este pierdută
    expect(dm.getDistrictCount()).toBe(1);
  });

  // TEST 2: Mapare Biunivocă Coordonate Globale & Continue
  it('EXPAND-02: Mapare biunivocă între ID global de parcelă, coordonate de chunk și coordonate absolute', () => {
    // Parcela (5, 10) din chunk-ul (2, -1)
    const globalId = toGlobalParcelId(2, -1, 5, 10);
    expect(globalId).toBe('2_-1:5:10');

    const parsed = parseGlobalParcelId(globalId);
    expect(parsed.chunkX).toBe(2);
    expect(parsed.chunkY).toBe(-1);
    expect(parsed.localX).toBe(5);
    expect(parsed.localY).toBe(10);

    // Coordonate absolute continue:
    // absX = 2 * 16 + 5 = 37
    // absY = -1 * 16 + 10 = -6
    const abs = toAbsoluteCoordinates(parsed);
    expect(abs.absX).toBe(37);
    expect(abs.absY).toBe(-6);

    // Conversie inversă din absolut în chunk + local
    const backToGlobal = fromAbsoluteCoordinates(abs.absX, abs.absY);
    expect(backToGlobal.chunkX).toBe(2);
    expect(backToGlobal.chunkY).toBe(-1);
    expect(backToGlobal.localX).toBe(5);
    expect(backToGlobal.localY).toBe(10);
  });

  // TEST 3: Prag de Ocupare (Sub 75% nu extinde)
  it('EXPAND-03: Dacă ocuparea este sub 75%, nu se declanșează extinderea automată', () => {
    const initialState = createInitialState(42);
    const dm = new DistrictManager(42);
    dm.initializeGenesisDistrict(initialState.grid, 0);

    const result = dm.evaluateAndExpand(100);
    expect(result.expanded).toBe(false);
    expect(result.newlyUnlockedDistricts.length).toBe(0);
    expect(dm.getDistrictCount()).toBe(1);
  });

  // TEST 4: Declanșare Extindere la Ocupare >= 75%
  it('EXPAND-04: Ocuparea >= 75% generează procedural 4 noi districte cardinale la frontieră', () => {
    const initialState = createInitialState(42);
    const dm = new DistrictManager(42);
    const genesis = dm.initializeGenesisDistrict(initialState.grid, 0);

    // Simulăm dezvoltarea rapidă a orașului: ocupăm 200 din 256 parcele (200/256 = 78.125% > 75%)
    let count = 0;
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        if (count < 200) {
          genesis.parcels[y][x].ownerAccountId = `citizen_${count}`;
          genesis.parcels[y][x].building = 'house';
          count++;
        }
      }
    }

    const occupancy = calculateChunkOccupancy(genesis.parcels);
    expect(occupancy).toBeGreaterThanOrEqual(EXPANSION_OCCUPANCY_THRESHOLD);

    // Evaluăm extinderea la tick-ul 500
    const result = dm.evaluateAndExpand(500);
    expect(result.expanded).toBe(true);
    expect(result.newlyUnlockedDistricts.length).toBe(4);
    expect(result.newlyUnlockedDistricts).toEqual([
      'district_1_0',
      'district_-1_0',
      'district_0_1',
      'district_0_-1',
    ]);
    expect(dm.getDistrictCount()).toBe(5); // 1 Genesis + 4 noi districte

    // Districtul Răsăritului (1, 0) are 256 de parcele proaspete cu relief determinist
    const eastDistrict = dm.getDistrict(1, 0);
    expect(eastDistrict).toBeDefined();
    expect(eastDistrict?.name).toBe('Districtul Răsăritului');
    expect(eastDistrict?.unlockedAtTick).toBe(500);
    expect(eastDistrict?.parcels.length).toBe(16);
    expect(eastDistrict?.parcels[0].length).toBe(16);
  });

  // TEST 5: Generarea este Deterministă și Imutabilă pe Seed
  it('EXPAND-05: Districtele generate procedural cu același seed sunt identice bit-cu-bit', () => {
    const dm1 = new DistrictManager(12345);
    const dm2 = new DistrictManager(12345);

    const s1 = createInitialState(12345);
    const s2 = createInitialState(12345);

    const g1 = dm1.initializeGenesisDistrict(s1.grid, 0);
    const g2 = dm2.initializeGenesisDistrict(s2.grid, 0);

    // Ocupăm ambele pentru a forța expansiunea
    for (let i = 0; i < 200; i++) {
      g1.parcels[Math.floor(i / 16)][i % 16].ownerAccountId = 'player';
      g2.parcels[Math.floor(i / 16)][i % 16].ownerAccountId = 'player';
    }

    dm1.evaluateAndExpand(1);
    dm2.evaluateAndExpand(1);

    const d1North = dm1.getDistrict(0, 1);
    const d2North = dm2.getDistrict(0, 1);

    expect(d1North).toBeDefined();
    expect(d2North).toBeDefined();

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        expect(d1North!.parcels[y][x].terrain).toBe(d2North!.parcels[y][x].terrain);
        expect(d1North!.parcels[y][x].isPurchasable).toBe(d2North!.parcels[y][x].isPurchasable);
      }
    }
  });

});
