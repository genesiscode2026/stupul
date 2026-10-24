import { describe, it, expect } from 'vitest';
import { translations, Language } from '../apps/web/src/i18n/translations.js';

describe('Bilingual Localization (i18n) — Romanian 🇷🇴 & English 🇬🇧', () => {
  const languages: Language[] = ['ro', 'en'];

  it('both ro and en translations exist and are populated', () => {
    expect(translations.ro).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  it('verifies complete key parity and non-empty strings between ro and en', () => {
    function assertParity(roObj: any, enObj: any, path: string = '') {
      const roKeys = Object.keys(roObj);
      const enKeys = Object.keys(enObj);

      expect(enKeys).toEqual(roKeys);

      for (const k of roKeys) {
        const subPath = path ? `${path}.${k}` : k;
        const roVal = roObj[k];
        const enVal = enObj[k];

        if (typeof roVal === 'string') {
          expect(typeof enVal).toBe('string');
          expect(roVal.trim().length, `Empty ro key at ${subPath}`).toBeGreaterThan(0);
          expect(enVal.trim().length, `Empty en key at ${subPath}`).toBeGreaterThan(0);
        } else if (typeof roVal === 'object' && roVal !== null) {
          expect(typeof enVal).toBe('object');
          assertParity(roVal, enVal, subPath);
        }
      }
    }

    assertParity(translations.ro, translations.en);
  });

  it('has localized entries for all 10 building types in both languages', () => {
    const expectedBuildings = [
      'house', 'farm', 'well', 'warehouse', 'school',
      'town_hall', 'road', 'workshop', 'clinic', 'guard_post'
    ];

    for (const lang of languages) {
      const t = translations[lang];
      for (const bType of expectedBuildings) {
        expect(t.buildings[bType], `Missing building ${bType} in ${lang}`).toBeDefined();
        expect(t.buildings[bType].name.length).toBeGreaterThan(0);
        expect(t.buildings[bType].description.length).toBeGreaterThan(0);
        expect(t.buildings[bType].shortName.length).toBeGreaterThan(0);
      }
    }
  });

  it('has localized entries for all 4 settlement stages in both languages', () => {
    const stages = ['frontier_outpost', 'wild_west_settlement', 'growing_town', 'modern_civilisation'];

    for (const lang of languages) {
      const t = translations[lang];
      for (const st of stages) {
        expect(t.topbar.stages[st], `Missing stage ${st} in ${lang}`).toBeDefined();
        expect(t.topbar.stages[st].length).toBeGreaterThan(0);
      }
    }

    expect(translations.ro.topbar.stages.frontier_outpost).toBe('Avanpost de Frontieră');
    expect(translations.en.topbar.stages.frontier_outpost).toBe('Frontier Outpost');
  });

  it('has localized entries for all 5 tutorial steps in both languages', () => {
    for (const lang of languages) {
      const tut = translations[lang].tutorial;
      expect(tut.step1Title).toBeDefined();
      expect(tut.step2Title).toBeDefined();
      expect(tut.step3Title).toBeDefined();
      expect(tut.step4Title).toBeDefined();
      expect(tut.step5Title).toBeDefined();
      expect(tut.prev.length).toBeGreaterThan(0);
      expect(tut.next.length).toBeGreaterThan(0);
      expect(tut.start.length).toBeGreaterThan(0);
    }

    expect(translations.ro.tutorial.start).toBe('Începe Jocul!');
    expect(translations.en.tutorial.start).toBe('Start Game!');
  });

  it('has localized entries for all 4 civic tasks in both languages', () => {
    for (const lang of languages) {
      const c = translations[lang].civicTasks;
      expect(c.farmingTitle.length).toBeGreaterThan(0);
      expect(c.woodcuttingTitle.length).toBeGreaterThan(0);
      expect(c.masonryTitle.length).toBeGreaterThan(0);
      expect(c.civicDutyTitle.length).toBeGreaterThan(0);
      expect(c.workBtn.length).toBeGreaterThan(0);
    }

    expect(translations.ro.civicTasks.workBtn).toBe('Muncește');
    expect(translations.en.civicTasks.workBtn).toBe('Work');
  });

  it('has legal and royalty 5% simulation terms localized in both languages', () => {
    expect(translations.ro.audit.royaltyBadge).toBe('5% FIX DIN NET ELIGIBIL');
    expect(translations.en.audit.royaltyBadge).toBe('FIXED 5% OF ELIGIBLE NET');
    expect(translations.ro.audit.monetizationLocked).toBe('MONETIZARE STRICT BLOCATĂ');
    expect(translations.en.audit.monetizationLocked).toBe('MONETIZATION STRICTLY LOCKED');
  });
});
