import { GameState, EngineCommand, CommandResult, BuildingType, SettlementStage } from './types.js';
import { BUILDING_DEFINITIONS, PARCEL_BASE_PRICE_CREDITS } from './constants.js';
import { PRNG } from './prng.js';
import { computeStateHash } from './initialState.js';
import { rotateTile, evaluatePuzzleConnectivity } from './puzzle.js';

/**
 * Deep-clones the game state cleanly.
 */
function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Pure deterministic state reducer for STUPUL simulation engine.
 * Invariant: nextState = reduce(prevState, command)
 * Given the same initial state and same sequence of commands,
 * the resulting state and stateHash will be 100% bit-for-bit identical.
 */
export function reduce(prevState: GameState, command: EngineCommand): CommandResult {
  const state = cloneState(prevState);
  const eventsEmitted: string[] = [];

  switch (command.type) {
    case 'TICK': {
      state.tick += 1;
      const tickPrng = new PRNG(state.seed + state.tick * 31);

      // 1. Count buildings and facilities
      let houses = 0;
      let farms = 0;
      let wells = 0;
      let warehouses = 0;
      let schools = 0;
      let townHalls = 0;
      let workshops = 0;
      let clinics = 0;
      let guardPosts = 0;
      let roads = 0;

      for (let y = 0; y < state.gridHeight; y++) {
        for (let x = 0; x < state.gridWidth; x++) {
          const b = state.grid[y][x].building;
          const lvl = state.grid[y][x].level || 1;
          if (b === 'house') houses += lvl;
          else if (b === 'farm') farms += lvl;
          else if (b === 'well') wells += lvl;
          else if (b === 'warehouse') warehouses += lvl;
          else if (b === 'school') schools += lvl;
          else if (b === 'town_hall') townHalls += lvl;
          else if (b === 'workshop') workshops += lvl;
          else if (b === 'clinic') clinics += lvl;
          else if (b === 'guard_post') guardPosts += lvl;
          else if (b === 'road') roads += 1;
        }
      }

      // Storage capacities
      state.resources.maxFoodStorage = 1000 + warehouses * 300;
      state.resources.maxMaterialsStorage = 1000 + warehouses * 300;

      // 2. Production & Consumption
      // Food production from farms + puzzle bonus
      const puzzleWaterBonus = state.infrastructurePuzzle.solved ? 1.3 : 1.0;
      const baseFoodPerFarm = 35;
      const totalFoodProduced = Math.floor(farms * baseFoodPerFarm * puzzleWaterBonus);
      state.resources.food = Math.min(state.resources.maxFoodStorage, state.resources.food + totalFoodProduced);

      // Food consumption by population
      let rationFactor = 1.0;
      if (state.policies.foodRationing === 'abundant') rationFactor = 1.4;
      else if (state.policies.foodRationing === 'austere') rationFactor = 0.7;

      const foodRequired = Math.ceil(state.population.total * 0.3 * rationFactor);
      let foodEaten = 0;
      if (state.resources.food >= foodRequired) {
        state.resources.food -= foodRequired;
        foodEaten = foodRequired;
      } else {
        foodEaten = state.resources.food;
        state.resources.food = 0;
      }

      // Materials production from workshops and base gathering
      const baseGathering = 10;
      const totalMaterialsProduced = baseGathering + workshops * 25;
      state.resources.materials = Math.min(state.resources.maxMaterialsStorage, state.resources.materials + totalMaterialsProduced);

      // Materials upkeep
      let totalMaterialsUpkeep = houses * 1 + farms * 1 + schools * 2 + townHalls * 2 + clinics * 1;
      if (state.resources.materials >= totalMaterialsUpkeep) {
        state.resources.materials -= totalMaterialsUpkeep;
      } else {
        state.resources.materials = 0;
      }

      // Taxes & Virtual Economy
      const baseTaxPerCapita = 1.5;
      const taxRate = state.policies.taxRatePercent / 100;
      const virtualTaxesCollected = Math.floor(state.population.employed * baseTaxPerCapita * taxRate);
      state.resources.virtualCredits += virtualTaxesCollected;

      // Infrastructure budget upkeep
      if (state.resources.virtualCredits >= state.policies.infrastructureBudgetCredits) {
        state.resources.virtualCredits -= state.policies.infrastructureBudgetCredits;
      }

      // 3. Needs & Satisfaction calculation
      // Food satisfaction
      const foodSatisfaction = foodRequired > 0 ? Math.min(100, Math.floor((foodEaten / foodRequired) * 100)) : 100;
      
      // Shelter satisfaction (each house level supports 25 people)
      const housingCapacity = houses * 25;
      const shelterSatisfaction = Math.min(100, Math.floor((housingCapacity / Math.max(1, state.population.total)) * 100));

      // Water satisfaction (wells provide water to city)
      const waterSatisfaction = Math.min(100, Math.floor((wells * 40 / Math.max(1, state.population.total)) * 100));

      // Safety satisfaction (guard posts + town hall)
      const safetySatisfaction = Math.min(100, 50 + guardPosts * 15 + townHalls * 10);

      // Education satisfaction (schools)
      const educationSatisfaction = Math.min(100, 40 + schools * 20 + Math.floor(state.policies.educationSubsidyPercent * 0.5));

      state.population.foodSatisfaction = foodSatisfaction;
      state.population.shelterSatisfaction = shelterSatisfaction;
      state.population.waterSatisfaction = waterSatisfaction;
      state.population.safetySatisfaction = safetySatisfaction;
      state.population.educationSatisfaction = educationSatisfaction;

      // Composite happiness / satisfaction
      const compositeSatisfaction = Math.floor(
        foodSatisfaction * 0.35 +
        shelterSatisfaction * 0.25 +
        waterSatisfaction * 0.15 +
        safetySatisfaction * 0.15 +
        educationSatisfaction * 0.10
      );
      state.population.satisfaction = compositeSatisfaction;

      // 4. Population dynamics
      // Births / immigration if satisfaction >= 65 and shelter available
      let newArrivals = 0;
      if (compositeSatisfaction >= 65 && housingCapacity > state.population.total) {
        newArrivals = Math.min(5, Math.floor((compositeSatisfaction - 60) / 10) + (tickPrng.next() < 0.5 ? 1 : 0));
        state.population.total += newArrivals;
        state.population.birthsCumulative += newArrivals;
      }

      // Starvation deaths if food satisfaction < 40
      let deaths = 0;
      if (foodSatisfaction < 40) {
        deaths = Math.min(8, Math.max(1, Math.floor((40 - foodSatisfaction) / 5)));
        state.population.total = Math.max(10, state.population.total - deaths);
        state.population.deathsCumulative += deaths;
        eventsEmitted.push(`Criză de hrană: ${deaths} cetățeni au suferit.`);
      }

      state.population.employed = Math.min(state.population.total, Math.floor(state.population.total * 0.75));

      // 5. Settlement Stage evolution
      const totalBuildings = houses + farms + wells + warehouses + schools + townHalls + workshops + clinics + guardPosts;
      let newStage: SettlementStage = 'frontier_outpost';
      if (state.population.total >= 400 && totalBuildings >= 25 && schools >= 2) {
        newStage = 'modern_civilisation';
      } else if (state.population.total >= 200 && totalBuildings >= 14 && (schools >= 1 || clinics >= 1)) {
        newStage = 'growing_town';
      } else if (state.population.total >= 120 && totalBuildings >= 8) {
        newStage = 'wild_west_settlement';
      }

      if (newStage !== state.stage) {
        eventsEmitted.push(`Evoluție urbană! Așezarea a atins treapta: ${newStage}`);
        state.stage = newStage;
      }

      eventsEmitted.push(`Tick ${state.tick}: recolte +${totalFoodProduced} hrană, +${totalMaterialsProduced} materiale, taxe +${virtualTaxesCollected} credite.`);
      break;
    }

    case 'CLAIM_PARCEL': {
      const { x, y, actorId } = command;
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= state.gridWidth || y < 0 || y >= state.gridHeight) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Coordonate de parcelă invalide (trebuie întregi în limitele 0-15)' };
      }
      if (!actorId || typeof actorId !== 'string' || actorId.trim().length === 0) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Identificator actor invalid' };
      }
      const parcel = state.grid[y][x];

      // STP-T02: Invariant: parcel cannot be claimed twice
      if (parcel.ownerAccountId !== null) {
        return { 
          success: false, 
          nextState: prevState, 
          eventsEmitted, 
          error: `STP-T02: Parcela (${x}, ${y}) este deja deținută de ${parcel.ownerAccountId}` 
        };
      }
      if (!parcel.isPurchasable || parcel.terrain === 'water') {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Această parcelă nu poate fi achiziționată' };
      }

      const cost = parcel.virtualPriceCredits || PARCEL_BASE_PRICE_CREDITS;
      if (state.resources.virtualCredits < cost) {
        return { 
          success: false, 
          nextState: prevState, 
          eventsEmitted, 
          error: `T-004: Fonduri insuficiente (${state.resources.virtualCredits}/${cost} credite virtuale)` 
        };
      }

      state.resources.virtualCredits -= cost;
      parcel.ownerAccountId = actorId.trim();
      parcel.claimedAtTick = state.tick;
      eventsEmitted.push(`Cetățeanul ${actorId} a achiziționat parcela virtuală (${x}, ${y}).`);
      break;
    }

    case 'CONSTRUCT_BUILDING': {
      const { x, y, buildingType, actorId } = command;
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= state.gridWidth || y < 0 || y >= state.gridHeight) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Coordonate invalide' };
      }
      if (!actorId || typeof actorId !== 'string' || actorId.trim().length === 0) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Identificator actor invalid' };
      }
      const parcel = state.grid[y][x];

      // T-003: Double construction on same parcel rejected
      if (parcel.building !== null) {
        return { 
          success: false, 
          nextState: prevState, 
          eventsEmitted, 
          error: `T-003: Parcela (${x}, ${y}) conține deja o construcție (${parcel.building})` 
        };
      }
      if (parcel.terrain === 'water' && buildingType !== 'well') {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Nu se poate construi pe apă' };
      }

      const def = BUILDING_DEFINITIONS[buildingType];
      if (!def) {
        return { success: false, nextState: prevState, eventsEmitted, error: `Tip clădire necunoscut: ${buildingType}` };
      }

      // Check resource sufficiency (T-004)
      if (state.resources.materials < def.materials) {
        return { 
          success: false, 
          nextState: prevState, 
          eventsEmitted, 
          error: `T-004: Materiale insuficiente (${state.resources.materials}/${def.materials})` 
        };
      }
      if (state.resources.virtualCredits < def.virtualCredits) {
        return { 
          success: false, 
          nextState: prevState, 
          eventsEmitted, 
          error: `T-004: Credite virtuale insuficiente (${state.resources.virtualCredits}/${def.virtualCredits})` 
        };
      }

      // Deduct costs
      state.resources.materials -= def.materials;
      state.resources.virtualCredits -= def.virtualCredits;
      parcel.building = buildingType;
      parcel.level = 1;
      if (!parcel.ownerAccountId) {
        parcel.ownerAccountId = actorId.trim();
      }
      eventsEmitted.push(`A fost construită clădirea ${def.name} la (${x}, ${y}).`);
      break;
    }

    case 'UPGRADE_BUILDING': {
      const { x, y } = command;
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= state.gridWidth || y < 0 || y >= state.gridHeight) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Coordonate invalide' };
      }
      const parcel = state.grid[y][x];
      if (!parcel.building) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Nicio clădire de modernizat' };
      }
      if (parcel.level >= 3) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Nivel maxim atins (nivelul 3)' };
      }

      const def = BUILDING_DEFINITIONS[parcel.building];
      const upgradeMaterials = Math.floor(def.materials * 0.7);
      const upgradeCredits = Math.floor(def.virtualCredits * 0.7);

      if (state.resources.materials < upgradeMaterials || state.resources.virtualCredits < upgradeCredits) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Resurse insuficiente pentru modernizare' };
      }

      state.resources.materials -= upgradeMaterials;
      state.resources.virtualCredits -= upgradeCredits;
      parcel.level += 1;
      eventsEmitted.push(`Clădirea ${def.name} de la (${x}, ${y}) a fost ridicată la nivelul ${parcel.level}.`);
      break;
    }

    case 'DEMOLISH_BUILDING': {
      const { x, y } = command;
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= state.gridWidth || y < 0 || y >= state.gridHeight) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Coordonate invalide' };
      }
      const parcel = state.grid[y][x];
      if (!parcel.building) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Nicio clădire de demolat' };
      }
      const bName = parcel.building;
      parcel.building = null;
      parcel.level = 0;
      // Recover some materials
      state.resources.materials += 15;
      eventsEmitted.push(`Clădirea ${bName} de la (${x}, ${y}) a fost demolată.`);
      break;
    }

    case 'SET_POLICY': {
      const { policyKey, value } = command;
      const keyStr = String(policyKey);
      if (keyStr === '__proto__' || keyStr === 'constructor' || keyStr === 'prototype') {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Tentativă de injectare securitate blocată' };
      }

      if (policyKey === 'taxRatePercent') {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 30) {
          return { success: false, nextState: prevState, eventsEmitted, error: 'Rata impozitului trebuie să fie număr între 0 și 30%' };
        }
        state.policies.taxRatePercent = Math.round(value);
      } else if (policyKey === 'foodRationing') {
        if (value !== 'austere' && value !== 'standard' && value !== 'abundant') {
          return { success: false, nextState: prevState, eventsEmitted, error: 'Mod de raționalizare invalid (austere | standard | abundant)' };
        }
        state.policies.foodRationing = value;
      } else if (policyKey === 'educationSubsidyPercent') {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 50) {
          return { success: false, nextState: prevState, eventsEmitted, error: 'Subvenția pentru educație trebuie să fie între 0 și 50%' };
        }
        state.policies.educationSubsidyPercent = Math.round(value);
      } else if (policyKey === 'infrastructureBudgetCredits') {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
          return { success: false, nextState: prevState, eventsEmitted, error: 'Bugetul de infrastructură trebuie să fie între 0 și 100 credite' };
        }
        state.policies.infrastructureBudgetCredits = Math.round(value);
      } else {
        return { success: false, nextState: prevState, eventsEmitted, error: `Politica ${String(policyKey)} este necunoscută` };
      }

      eventsEmitted.push(`Politica publică ${String(policyKey)} a fost actualizată la ${value}.`);
      break;
    }

    case 'ROTATE_PUZZLE_TILE': {
      const { x, y } = command;
      if (!Number.isInteger(x) || !Number.isInteger(y)) {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Coordonate puzzle invalide' };
      }
      const connectedBefore = state.infrastructurePuzzle.solved;
      rotateTile(state.infrastructurePuzzle, x, y);
      const connectedAfter = state.infrastructurePuzzle.solved;

      if (!connectedBefore && connectedAfter) {
        state.infrastructurePuzzle.timesSolved += 1;
        state.resources.virtualCredits += 50;
        state.resources.materials += 30;
        eventsEmitted.push('Rețeaua de apeduct a fost conectată cu succes! Orașul a primit recompensă de 50 credite și 30 materiale.');
      }
      break;
    }

    case 'WORK_CIVIC_TASK': {
      const { taskKind } = command;
      if (taskKind === 'farming') {
        state.resources.food += 15;
        state.resources.virtualCredits += 8;
        eventsEmitted.push('Muncă la ferma comunitară: +15 hrană, +8 credite virtuale.');
      } else if (taskKind === 'woodcutting') {
        state.resources.materials += 15;
        state.resources.virtualCredits += 8;
        eventsEmitted.push('Muncă la exploatarea forestieră: +15 materiale, +8 credite virtuale.');
      } else if (taskKind === 'masonry') {
        state.resources.materials += 20;
        state.resources.virtualCredits += 10;
        eventsEmitted.push('Muncă la cariera de piatră: +20 materiale, +10 credite virtuale.');
      } else if (taskKind === 'civic_duty') {
        state.resources.virtualCredits += 12;
        eventsEmitted.push('Serviciu civic public: +12 credite virtuale.');
      } else {
        return { success: false, nextState: prevState, eventsEmitted, error: 'Tip de sarcină civică necunoscută' };
      }
      break;
    }

    default: {
      return { 
        success: false, 
        nextState: prevState, 
        eventsEmitted, 
        error: `Comandă necunoscută sau nepermisă: ${(command as any)?.type}` 
      };
    }
  }

  // Recalculate canonical state hash synchronously
  const { stateHash: _old, ...stateWithoutHash } = state;
  state.stateHash = computeStateHash(stateWithoutHash);

  return {
    success: true,
    nextState: state,
    eventsEmitted
  };
}
