import { createRequire } from 'node:module';
import type { DatabaseSync } from 'node:sqlite';

export interface EventRecord {
  seq: number;
  tick: number;
  type: string;
  actor: string;
  payload: string;
  state_hash: string;
  at: number;
}

export interface StorageAdapter {
  loadState(): { json: string; version: number } | null;
  saveState(json: string, version: number): void;
  hasCommand(commandId: string): boolean;
  saveCommand(commandId: string, result: string, appliedAt: number): void;
  appendEvent(tick: number, type: string, actor: string, payload: string, stateHash: string, at: number): void;
  getEventsSince(seq: number): EventRecord[];
  transaction<T>(fn: () => T): T;
  close(): void;

  // Persistență Sesiuni & Utilizatori (Securitate P0 Cloud & Node)
  saveSession?(token: string, actorId: string, identityJson: string, createdAt: number, expiresAt: number): void;
  loadSession?(token: string): { actorId: string; identityJson: string; createdAt: number; expiresAt: number } | null;
  deleteSession?(token: string): void;
  saveUser?(actorId: string, identityJson: string): void;
  loadUser?(actorId: string): string | null;
}

/**
 * Adapter SQLite nativ Node.js (node:sqlite) pentru persistență fișier sau :memory:
 */
export class NodeSqliteStorageAdapter implements StorageAdapter {
  private readonly db: DatabaseSync;

  constructor(filePath: string) {
    const nodeRequire = createRequire(import.meta.url);
    const { DatabaseSync: DatabaseSyncImpl } = nodeRequire('node:sqlite') as typeof import('node:sqlite');
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
      CREATE TABLE IF NOT EXISTS auth_sessions (
        token TEXT PRIMARY KEY,
        actor_id TEXT NOT NULL,
        identity_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS auth_users (
        actor_id TEXT PRIMARY KEY,
        identity_json TEXT NOT NULL
      );
    `);
  }

  saveSession(token: string, actorId: string, identityJson: string, createdAt: number, expiresAt: number): void {
    this.db.prepare('INSERT OR REPLACE INTO auth_sessions (token, actor_id, identity_json, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
      .run(token, actorId, identityJson, createdAt, expiresAt);
  }

  loadSession(token: string): { actorId: string; identityJson: string; createdAt: number; expiresAt: number } | null {
    const row = this.db.prepare('SELECT actor_id, identity_json, created_at, expires_at FROM auth_sessions WHERE token = ?').get(token) as
      | { actor_id: string; identity_json: string; created_at: number; expires_at: number }
      | undefined;
    return row ? { actorId: row.actor_id, identityJson: row.identity_json, createdAt: row.created_at, expiresAt: row.expires_at } : null;
  }

  deleteSession(token: string): void {
    this.db.prepare('DELETE FROM auth_sessions WHERE token = ?').run(token);
  }

  saveUser(actorId: string, identityJson: string): void {
    this.db.prepare('INSERT OR REPLACE INTO auth_users (actor_id, identity_json) VALUES (?, ?)').run(actorId, identityJson);
  }

  loadUser(actorId: string): string | null {
    const row = this.db.prepare('SELECT identity_json FROM auth_users WHERE actor_id = ?').get(actorId) as
      | { identity_json: string }
      | undefined;
    return row ? row.identity_json : null;
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

/**
 * Adapter 100% în memorie, portabil, fără dependențe native.
 * Simulează tranzacționalitate atomică prin snapshot rollback.
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private state: { json: string; version: number } | null = null;
  private commands = new Map<string, { result: string; appliedAt: number }>();
  private events: EventRecord[] = [];
  private currentSeq = 0;
  private sessions = new Map<string, { actorId: string; identityJson: string; createdAt: number; expiresAt: number }>();
  private users = new Map<string, string>();

  saveSession(token: string, actorId: string, identityJson: string, createdAt: number, expiresAt: number): void {
    this.sessions.set(token, { actorId, identityJson, createdAt, expiresAt });
  }

  loadSession(token: string): { actorId: string; identityJson: string; createdAt: number; expiresAt: number } | null {
    const s = this.sessions.get(token);
    return s ? { ...s } : null;
  }

  deleteSession(token: string): void {
    this.sessions.delete(token);
  }

  saveUser(actorId: string, identityJson: string): void {
    this.users.set(actorId, identityJson);
  }

  loadUser(actorId: string): string | null {
    return this.users.get(actorId) ?? null;
  }

  loadState(): { json: string; version: number } | null {
    return this.state ? { ...this.state } : null;
  }

  saveState(json: string, version: number): void {
    this.state = { json, version };
  }

  hasCommand(commandId: string): boolean {
    return this.commands.has(commandId);
  }

  saveCommand(commandId: string, result: string, appliedAt: number): void {
    this.commands.set(commandId, { result, appliedAt });
  }

  appendEvent(tick: number, type: string, actor: string, payload: string, stateHash: string, at: number): void {
    this.currentSeq += 1;
    this.events.push({
      seq: this.currentSeq,
      tick,
      type,
      actor,
      payload,
      state_hash: stateHash,
      at,
    });
  }

  getEventsSince(seq: number): EventRecord[] {
    return this.events.filter(e => e.seq > seq).map(e => ({ ...e }));
  }

  transaction<T>(fn: () => T): T {
    // Snapshot pentru rollback în caz de eroare
    const stateSnap = this.state ? { ...this.state } : null;
    const commandsSnap = new Map(this.commands);
    const eventsSnap = [...this.events];
    const seqSnap = this.currentSeq;

    try {
      return fn();
    } catch (err) {
      this.state = stateSnap;
      this.commands = commandsSnap;
      this.events = eventsSnap;
      this.currentSeq = seqSnap;
      throw err;
    }
  }

  close(): void {
    this.state = null;
    this.commands.clear();
    this.events = [];
    this.sessions.clear();
    this.users.clear();
  }
}

/**
 * Interfață compatibilă cu Cloudflare Workers D1 Database API
 */
export interface D1DatabaseLike {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null> | T | null;
      run(): Promise<{ success: boolean }> | { success: boolean };
      all<T = unknown>(): Promise<{ results: T[] }> | { results: T[] };
    };
  };
  exec(sql: string): Promise<unknown> | unknown;
}

/**
 * Adapter pentru Cloudflare D1 (Serverless SQLite la margine).
 * Menține un snapshot de sincronizare pentru compatibilitate cu interfața StorageAdapter,
 * aplicând modificările tranzacțional în D1.
 */
export class CloudflareD1StorageAdapter implements StorageAdapter {
  private inMemoryCache: MemoryStorageAdapter;

  constructor(public readonly d1?: D1DatabaseLike) {
    this.inMemoryCache = new MemoryStorageAdapter();
    if (this.d1) {
      this.initSchema();
    }
  }

  private initSchema(): void {
    if (!this.d1) return;
    this.d1.exec(`
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
      CREATE TABLE IF NOT EXISTS auth_sessions (
        token TEXT PRIMARY KEY,
        actor_id TEXT NOT NULL,
        identity_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS auth_users (
        actor_id TEXT PRIMARY KEY,
        identity_json TEXT NOT NULL
      );
    `);
  }

  saveSession(token: string, actorId: string, identityJson: string, createdAt: number, expiresAt: number): void {
    this.inMemoryCache.saveSession(token, actorId, identityJson, createdAt, expiresAt);
    if (this.d1) {
      this.d1.prepare('INSERT OR REPLACE INTO auth_sessions (token, actor_id, identity_json, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
        .bind(token, actorId, identityJson, createdAt, expiresAt)
        .run();
    }
  }

  loadSession(token: string): { actorId: string; identityJson: string; createdAt: number; expiresAt: number } | null {
    return this.inMemoryCache.loadSession(token);
  }

  deleteSession(token: string): void {
    this.inMemoryCache.deleteSession(token);
    if (this.d1) {
      this.d1.prepare('DELETE FROM auth_sessions WHERE token = ?').bind(token).run();
    }
  }

  saveUser(actorId: string, identityJson: string): void {
    this.inMemoryCache.saveUser(actorId, identityJson);
    if (this.d1) {
      this.d1.prepare('INSERT OR REPLACE INTO auth_users (actor_id, identity_json) VALUES (?, ?)').bind(actorId, identityJson).run();
    }
  }

  loadUser(actorId: string): string | null {
    return this.inMemoryCache.loadUser(actorId);
  }

  loadState(): { json: string; version: number } | null {
    return this.inMemoryCache.loadState();
  }

  saveState(json: string, version: number): void {
    this.inMemoryCache.saveState(json, version);
    if (this.d1) {
      this.d1.prepare('INSERT OR REPLACE INTO state (id, json, version) VALUES (1, ?, ?)').bind(json, version).run();
    }
  }

  hasCommand(commandId: string): boolean {
    return this.inMemoryCache.hasCommand(commandId);
  }

  saveCommand(commandId: string, result: string, appliedAt: number): void {
    this.inMemoryCache.saveCommand(commandId, result, appliedAt);
    if (this.d1) {
      this.d1.prepare('INSERT INTO commands (command_id, result, applied_at) VALUES (?, ?, ?)').bind(commandId, result, appliedAt).run();
    }
  }

  appendEvent(tick: number, type: string, actor: string, payload: string, stateHash: string, at: number): void {
    this.inMemoryCache.appendEvent(tick, type, actor, payload, stateHash, at);
    if (this.d1) {
      this.d1.prepare('INSERT INTO events (tick, type, actor, payload, state_hash, at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(tick, type, actor, payload, stateHash, at)
        .run();
    }
  }

  getEventsSince(seq: number): EventRecord[] {
    return this.inMemoryCache.getEventsSince(seq);
  }

  transaction<T>(fn: () => T): T {
    return this.inMemoryCache.transaction(fn);
  }

  close(): void {
    this.inMemoryCache.close();
  }
}

/**
 * Interfață compatibilă cu Cloudflare Workers Durable Objects SQLite Storage API (ctx.storage.sql).
 */
export interface DurableObjectSqlStorageLike {
  exec(query: string, ...bindings: unknown[]): {
    toArray(): unknown[];
    one(): unknown;
    raw(): unknown[];
    [Symbol.iterator](): Iterator<unknown>;
  };
}

/**
 * Adapter pentru Cloudflare Durable Objects cu SQLite sincron (ctx.storage.sql).
 * Oferă persistență atomică la nivel de instanță DO pentru server autoritativ global.
 */
export class DurableObjectSqlStorageAdapter implements StorageAdapter {
  private inMemoryCache: MemoryStorageAdapter;

  constructor(public readonly sql?: DurableObjectSqlStorageLike) {
    this.inMemoryCache = new MemoryStorageAdapter();
    if (this.sql) {
      this.initSchema();
      this.loadInitialState();
    }
  }

  private initSchema(): void {
    if (!this.sql) return;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        json TEXT NOT NULL,
        version INTEGER NOT NULL
      );
    `);
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS commands (
        command_id TEXT PRIMARY KEY,
        result TEXT NOT NULL,
        applied_at INTEGER NOT NULL
      );
    `);
    this.sql.exec(`
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
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        token TEXT PRIMARY KEY,
        actor_id TEXT NOT NULL,
        identity_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
    `);
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS auth_users (
        actor_id TEXT PRIMARY KEY,
        identity_json TEXT NOT NULL
      );
    `);
  }

  private loadInitialState(): void {
    if (!this.sql) return;
    try {
      const cursor = this.sql.exec('SELECT json, version FROM state WHERE id = 1');
      const rows = typeof (cursor as any).toArray === 'function' ? (cursor as any).toArray() : Array.from(cursor);
      if (rows.length > 0 && rows[0]) {
        const row = rows[0] as { json: string; version: number };
        this.inMemoryCache.saveState(row.json, row.version);
      }
    } catch {
      // Ignoră dacă tabela e proaspăt creată și goală
    }
  }

  saveSession(token: string, actorId: string, identityJson: string, createdAt: number, expiresAt: number): void {
    this.inMemoryCache.saveSession(token, actorId, identityJson, createdAt, expiresAt);
    if (this.sql) {
      this.sql.exec(
        'INSERT OR REPLACE INTO auth_sessions (token, actor_id, identity_json, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
        token,
        actorId,
        identityJson,
        createdAt,
        expiresAt
      );
    }
  }

  loadSession(token: string): { actorId: string; identityJson: string; createdAt: number; expiresAt: number } | null {
    if (this.sql) {
      try {
        const cursor = this.sql.exec('SELECT actor_id, identity_json, created_at, expires_at FROM auth_sessions WHERE token = ?', token);
        const rows = typeof (cursor as any).toArray === 'function' ? (cursor as any).toArray() : Array.from(cursor);
        if (rows.length > 0 && rows[0]) {
          const row = rows[0] as { actor_id: string; identity_json: string; created_at: number; expires_at: number };
          const session = { actorId: row.actor_id, identityJson: row.identity_json, createdAt: row.created_at, expiresAt: row.expires_at };
          this.inMemoryCache.saveSession(token, session.actorId, session.identityJson, session.createdAt, session.expiresAt);
          return session;
        }
      } catch {
        // Fallback la cache
      }
    }
    return this.inMemoryCache.loadSession(token);
  }

  deleteSession(token: string): void {
    this.inMemoryCache.deleteSession(token);
    if (this.sql) {
      try {
        this.sql.exec('DELETE FROM auth_sessions WHERE token = ?', token);
      } catch {}
    }
  }

  saveUser(actorId: string, identityJson: string): void {
    this.inMemoryCache.saveUser(actorId, identityJson);
    if (this.sql) {
      this.sql.exec('INSERT OR REPLACE INTO auth_users (actor_id, identity_json) VALUES (?, ?)', actorId, identityJson);
    }
  }

  loadUser(actorId: string): string | null {
    if (this.sql) {
      try {
        const cursor = this.sql.exec('SELECT identity_json FROM auth_users WHERE actor_id = ?', actorId);
        const rows = typeof (cursor as any).toArray === 'function' ? (cursor as any).toArray() : Array.from(cursor);
        if (rows.length > 0 && rows[0]) {
          const val = (rows[0] as { identity_json: string }).identity_json;
          this.inMemoryCache.saveUser(actorId, val);
          return val;
        }
      } catch {}
    }
    return this.inMemoryCache.loadUser(actorId);
  }

  loadState(): { json: string; version: number } | null {
    return this.inMemoryCache.loadState();
  }

  saveState(json: string, version: number): void {
    this.inMemoryCache.saveState(json, version);
    if (this.sql) {
      this.sql.exec('INSERT OR REPLACE INTO state (id, json, version) VALUES (1, ?, ?)', json, version);
    }
  }

  hasCommand(commandId: string): boolean {
    if (this.sql) {
      try {
        const cursor = this.sql.exec('SELECT 1 FROM commands WHERE command_id = ?', commandId);
        const rows = typeof (cursor as any).toArray === 'function' ? (cursor as any).toArray() : Array.from(cursor);
        if (rows.length > 0) return true;
      } catch {
        // Fallback la cache-ul în memorie
      }
    }
    return this.inMemoryCache.hasCommand(commandId);
  }

  saveCommand(commandId: string, result: string, appliedAt: number): void {
    this.inMemoryCache.saveCommand(commandId, result, appliedAt);
    if (this.sql) {
      this.sql.exec('INSERT INTO commands (command_id, result, applied_at) VALUES (?, ?, ?)', commandId, result, appliedAt);
    }
  }

  appendEvent(tick: number, type: string, actor: string, payload: string, stateHash: string, at: number): void {
    this.inMemoryCache.appendEvent(tick, type, actor, payload, stateHash, at);
    if (this.sql) {
      this.sql.exec(
        'INSERT INTO events (tick, type, actor, payload, state_hash, at) VALUES (?, ?, ?, ?, ?, ?)',
        tick,
        type,
        actor,
        payload,
        stateHash,
        at
      );
    }
  }

  getEventsSince(seq: number): EventRecord[] {
    if (this.sql) {
      try {
        const cursor = this.sql.exec('SELECT * FROM events WHERE seq > ? ORDER BY seq ASC', seq);
        const rows = typeof (cursor as any).toArray === 'function' ? (cursor as any).toArray() : Array.from(cursor);
        return rows as unknown as EventRecord[];
      } catch {
        // Fallback la cache-ul în memorie
      }
    }
    return this.inMemoryCache.getEventsSince(seq);
  }

  transaction<T>(fn: () => T): T {
    return this.inMemoryCache.transaction(fn);
  }

  close(): void {
    this.inMemoryCache.close();
  }
}

