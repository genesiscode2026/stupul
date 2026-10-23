import { GameState, computeStateHash } from '@stupul/engine';

export interface SnapshotFile {
  formatVersion: 'stupul-genesis-v1.1';
  exportedAtIso: string;
  state: GameState;
  integrityHash: string;
}

export function exportSnapshotToJson(state: GameState): string {
  const file: SnapshotFile = {
    formatVersion: 'stupul-genesis-v1.1',
    exportedAtIso: new Date().toISOString(),
    state,
    integrityHash: state.stateHash
  };
  return JSON.stringify(file, null, 2);
}

export function validateAndImportSnapshot(jsonString: string): { success: boolean; state?: GameState; error?: string } {
  try {
    // 1. Guard against DoS payloads > 5MB
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, error: 'T-006: Conținut JSON invalid sau gol' };
    }
    if (jsonString.length > 5 * 1024 * 1024) {
      return { success: false, error: 'T-006: Fișierul depășește limita maximă permisă (5MB)' };
    }

    // 2. Guard against Prototype Pollution keys
    if (jsonString.includes('__proto__') || jsonString.includes('"constructor"') || jsonString.includes('"prototype"')) {
      return { success: false, error: 'T-006: Fișierul conține chei interzise (tentativă de injectare securitate)' };
    }

    const parsed = JSON.parse(jsonString) as SnapshotFile;
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'T-006: Fișier JSON invalid sau corupt' };
    }

    if (parsed.formatVersion !== 'stupul-genesis-v1.1') {
      return { success: false, error: 'T-006: Versiune de format incompatibilă' };
    }

    const state = parsed.state;
    if (!state || typeof state !== 'object' || !Array.isArray(state.grid) || !state.resources || !state.population || !state.policies) {
      return { success: false, error: 'T-006: Structură de date incompletă în fișierul de salvare' };
    }

    // 3. Deep structure validation: grid must be exactly 16x16
    if (state.grid.length !== 16) {
      return { success: false, error: 'T-006: Dimensiune grilă invalidă (trebuie exact 16 rânduri)' };
    }
    for (let y = 0; y < 16; y++) {
      if (!Array.isArray(state.grid[y]) || state.grid[y].length !== 16) {
        return { success: false, error: `T-006: Grila la rândul ${y} nu are 16 parcele` };
      }
    }

    // 4. Resources validation
    if (
      typeof state.resources.food !== 'number' || !Number.isFinite(state.resources.food) || state.resources.food < 0 ||
      typeof state.resources.materials !== 'number' || !Number.isFinite(state.resources.materials) || state.resources.materials < 0 ||
      typeof state.resources.virtualCredits !== 'number' || !Number.isFinite(state.resources.virtualCredits) || state.resources.virtualCredits < 0
    ) {
      return { success: false, error: 'T-006: Valori de resurse invalide sau negative în salvare' };
    }

    // 5. Verify hash integrity
    const { stateHash: declaredHash, ...withoutHash } = state;
    const computed = computeStateHash(withoutHash);

    if (computed !== declaredHash) {
      return { 
        success: false, 
        error: `T-006: Sumă de control invalidă (integritate compromisă: declarat ${declaredHash}, calculat ${computed})` 
      };
    }

    return { success: true, state };
  } catch (err: any) {
    return { success: false, error: `T-006: Eroare la parsarea JSON: ${err?.message || 'Format corupt'}` };
  }
}

export class OfflineStorage {
  private key = 'stupul_game_save_v1_1';

  saveLocal(state: GameState): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const json = exportSnapshotToJson(state);
        localStorage.setItem(this.key, json);
        return true;
      }
    } catch (e) {
      console.warn('LocalStorage save failed, running in memory mode', e);
    }
    return false;
  }

  loadLocal(): GameState | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(this.key);
        if (item) {
          const res = validateAndImportSnapshot(item);
          if (res.success && res.state) {
            return res.state;
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage load failed', e);
    }
    return null;
  }
}
