import { createRequire } from 'node:module';
import type { DatabaseSync } from 'node:sqlite';

// node:sqlite este un built-in introdus după lansarea Vite 5, deci Vite nu-l
// rezolvă static; îl încărcăm la runtime prin createRequire (Node 22.5+/24).
const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync: DatabaseSyncImpl } = nodeRequire('node:sqlite') as typeof import('node:sqlite');

export interface EventRecord {
  seq: number;
  tick: number;
  type: string;
  actor: string;
  payload: string;
  state_hash: string;
  at: number;
}

/**
 * Persistență SQLite (node:sqlite) pentru starea autoritativă a orașului comun.
 * Oferă tranzacții atomice reale și constrângeri UNIQUE (idempotență).
 */
export class StateDB {
  private readonly db: DatabaseSync;

  constructor(filePath: string) {
    this.db = new DatabaseSyncImpl(filePath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        json TEXT NOT NULL,
        version INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS commands (
        command_id TEXT PRIMARY KEY,
        result TEXT NOT NULL,
        applied_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS events (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        tick INTEGER NOT NULL,
        type TEXT NOT NULL,
        actor TEXT NOT NULL,
        payload TEXT NOT NULL,
        state_hash TEXT NOT NULL,
        at INTEGER NOT NULL
      );
    `);
  }

  loadState(): { json: string; version: number } | null {
    const row = this.db.prepare('SELECT json, version FROM state WHERE id = 1').get() as
      | { json: string; version: number }
      | undefined;
    return row ? { json: row.json, version: row.version } : null;
  }

  saveState(json: string, version: number): void {
    this.db.prepare('INSERT OR REPLACE INTO state (id, json, version) VALUES (1, ?, ?)').run(json, version);
  }

  hasCommand(commandId: string): boolean {
    return !!this.db.prepare('SELECT 1 FROM commands WHERE command_id = ?').get(commandId);
  }

  saveCommand(commandId: string, result: string, appliedAt: number): void {
    this.db.prepare('INSERT INTO commands (command_id, result, applied_at) VALUES (?, ?, ?)').run(commandId, result, appliedAt);
  }

  appendEvent(tick: number, type: string, actor: string, payload: string, stateHash: string, at: number): void {
    this.db.prepare('INSERT INTO events (tick, type, actor, payload, state_hash, at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(tick, type, actor, payload, stateHash, at);
  }

  getEventsSince(seq: number): EventRecord[] {
    return this.db.prepare('SELECT * FROM events WHERE seq > ? ORDER BY seq ASC').all(seq) as unknown as EventRecord[];
  }

  transaction<T>(fn: () => T): T {
    this.db.exec('BEGIN');
    try {
      const r = fn();
      this.db.exec('COMMIT');
      return r;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }

  close(): void {
    this.db.close();
  }
}

