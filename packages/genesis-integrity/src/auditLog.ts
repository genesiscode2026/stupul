import { hashObject } from './hash.js';

export interface AuditEntry<T = unknown> {
  seq: number;
  atIso: string;
  actorId: string;
  action: string;
  payload: T;
  prevHash: string;
  entryHash: string;
}

/**
 * Jurnal append-only cu integritate verificabilă (lanț de hash-uri).
 */
export class AppendOnlyAuditLog {
  private entries: AuditEntry[] = [];
  private readonly genesisHash: string;

  constructor(genesisLabel: string) {
    this.genesisHash = hashObject({ genesis: genesisLabel, atIso: new Date().toISOString() });
  }

  append<T>(actorId: string, action: string, payload: T, atIso?: string): AuditEntry<T> {
    const prev = this.entries.length ? this.entries[this.entries.length - 1].entryHash : this.genesisHash;
    const seq = this.entries.length + 1;
    const at = atIso ?? new Date().toISOString();
    const entryHash = hashObject({ seq, atIso: at, actorId, action, payload, prevHash: prev });
    const entry: AuditEntry<T> = { seq, atIso: at, actorId, action, payload, prevHash: prev, entryHash };
    this.entries.push(entry as AuditEntry);
    return entry;
  }

  getEntries(): AuditEntry[] {
    return this.entries.map(e => ({ ...e }));
  }

  getLastHash(): string {
    return this.entries.length ? this.entries[this.entries.length - 1].entryHash : this.genesisHash;
  }
}

export function verifyAuditLog(
  entries: AuditEntry[],
  genesisHash: string,
): { valid: boolean; error?: string } {
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.seq !== i + 1) {
      return { valid: false, error: `seq discontinuity at ${i}: expected ${i + 1}, got ${e.seq}` };
    }
    const prev = i === 0 ? genesisHash : entries[i - 1].entryHash;
    if (e.prevHash !== prev) {
      return { valid: false, error: `prevHash broken at seq ${e.seq}` };
    }
    const recomputed = hashObject({ seq: e.seq, atIso: e.atIso, actorId: e.actorId, action: e.action, payload: e.payload, prevHash: e.prevHash });
    if (e.entryHash !== recomputed) {
      return { valid: false, error: `entryHash mismatch at seq ${e.seq}` };
    }
  }
  return { valid: true };
}
