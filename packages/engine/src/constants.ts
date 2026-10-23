import { BuildingType, BuildingCost } from './types.js';

export const BUILDING_DEFINITIONS: Record<BuildingType, BuildingCost & { description: string; name: string }> = {
  house: {
    name: 'Casă de Lemn',
    description: 'Oferă adăpost pentru până la 25 de cetățeni.',
    materials: 30,
    virtualCredits: 20,
    foodUpkeepPerTick: 0,
    materialsUpkeepPerTick: 1
  },
  farm: {
    name: 'Fermă Comunitară',
    description: 'Produce 40 unități de hrană pe ciclu.',
    materials: 40,
    virtualCredits: 30,
    foodUpkeepPerTick: 0,
    materialsUpkeepPerTick: 2
  },
  well: {
    name: 'Puț cu Ciutură',
    description: 'Furnizează apă potabilă în raza de 3 parcele.',
    materials: 25,
    virtualCredits: 15,
    foodUpkeepPerTick: 0,
    materialsUpkeepPerTick: 1
  },
  warehouse: {
    name: 'Hambar & Depozit',
    description: 'Crește capacitatea de stocare cu 250 unități.',
    materials: 60,
    virtualCredits: 40,
    foodUpkeepPerTick: 0,
    materialsUpkeepPerTick: 2
  },
  school: {
    name: 'Școală Publică',
    description: 'Crește educația și productivitatea muncii cu 20%.',
    materials: 80,
    virtualCredits: 60,
    foodUpkeepPerTick: 2,
    materialsUpkeepPerTick: 3
  },
  town_hall: {
    name: 'Primărie & Sfat Civic',
    description: 'Centrul administrativ și guvernanța așezării.',
    materials: 120,
    virtualCredits: 100,
    foodUpkeepPerTick: 2,
    materialsUpkeepPerTick: 4
  },
  road: {
    name: 'Drum Pietruit',
    description: 'Conectează parcelele și îmbunătățește circulația.',
    materials: 10,
    virtualCredits: 5,
    foodUpkeepPerTick: 0,
    materialsUpkeepPerTick: 0
  },
  workshop: {
    name: 'Atelier Meșteșugăresc',
    description: 'Produce 25 unități de materiale de construcție pe ciclu.',
    materials: 50,
    virtualCredits: 35,
    foodUpkeepPerTick: 1,
    materialsUpkeepPerTick: 1
  },
  clinic: {
    name: 'Dispensar Medical',
    description: 'Îmbunătățește sănătatea publică și reduce mortalitatea.',
    materials: 70,
    virtualCredits: 50,
    foodUpkeepPerTick: 2,
    materialsUpkeepPerTick: 2
  },
  guard_post: {
    name: 'Post de Pază & Siguranță',
    description: 'Asigură ordinea civică și protecția împotriva abuzurilor.',
    materials: 45,
    virtualCredits: 30,
    foodUpkeepPerTick: 1,
    materialsUpkeepPerTick: 2
  }
};

export const PARCEL_BASE_PRICE_CREDITS = 50;
export const INITIAL_POPULATION_COUNT = 100;
