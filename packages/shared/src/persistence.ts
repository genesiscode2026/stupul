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
    const parsed = JSON.parse(jsonString) as SnapshotFile;
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'T-006: Fișier JSON invalid sau corupt' };
    }

    if (parsed.formatVersion !== 'stupul-genesis-v1.1') {
      return { success: false, error: 'T-006: Versiune de format incompatibilă' };
    }

    const state = parsed.state;
    if (!state || typeof state !== 'object' || !Array.isArray(state.grid) || !state.resources) {
      return { success: false, error: 'T-006: Structură de date incompletă în fișierul de salvare' };
    }

    // Verify hash integrity
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
