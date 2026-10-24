import { GameState, createInitialState, reduce, EngineCommand } from '@stupul/engine';
import { StateDB } from './db.js';

export interface ApplyResult {
  applied: boolean;
  idempotentReplay: boolean;
  version: number;
  state: GameState;
  events: string[];
  error?: string;
}

export type StateChangeListener = (state: GameState, version: number, events: string[]) => void;

/**
 * Autoritatea centrală a orașului comun.
 * Clientul trimite intenția; serverul validează, aplică prin reducer-ul
 * determinist și persistă atomic. Browserul NU stabilește solduri/proprietăți.
 */
export class Authority {
  private state: GameState;
  private version: number;
  private writeDisabled = false;
  private readonly db: StateDB;
  private readonly listeners = new Set<StateChangeListener>();

  constructor(db: StateDB, seed = 42) {
    this.db = db;
    const saved = db.loadState();
    if (saved) {
      this.state = JSON.parse(saved.json) as GameState;
      this.version = saved.version;
    } else {
      this.state = createInitialState(seed);
      this.version = 1;
      db.saveState(JSON.stringify(this.state), this.version);
      db.appendEvent(0, 'INIT', 'system', '{}', this.state.stateHash, Date.now());
    }
  }

  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): GameState {
    return this.state;
  }

  getVersion(): number {
    return this.version;
  }

  setWriteDisabled(v: boolean): void {
    this.writeDisabled = v;
  }

  isWriteDisabled(): boolean {
    return this.writeDisabled;
  }

  getDB(): StateDB {
    return this.db;
  }

  applyCommand(command: EngineCommand, commandId: string, actorId: string): ApplyResult {
    // Idempotență: aceeași comandă (commandId) nu se aplică de două ori.
    if (this.db.hasCommand(commandId)) {
      return { applied: false, idempotentReplay: true, version: this.version, state: this.state, events: [] };
    }
    if (this.writeDisabled) {
      return { applied: false, idempotentReplay: false, version: this.version, state: this.state, events: [], error: 'writes disabled' };
    }

    // Validare + execuție prin motorul determinist (singurul adevăr al stării).
    const res = reduce(this.state, command);
    if (!res.success) {
      return { applied: false, idempotentReplay: false, version: this.version, state: this.state, events: [], error: res.error ?? 'invalid command' };
    }

    const nextState = res.nextState;
    const newVersion = this.version + 1;

    // Persistență atomică: stare + comandă + evenimente, toate sau nimic.
    this.db.transaction(() => {
      this.db.saveState(JSON.stringify(nextState), newVersion);
      this.db.saveCommand(commandId, JSON.stringify({ ok: true, version: newVersion }), Date.now());
      for (const ev of res.eventsEmitted) {
        this.db.appendEvent(nextState.tick, 'EVENT', actorId, ev, nextState.stateHash, Date.now());
      }
    });

    this.state = nextState;
    this.version = newVersion;

    // Notificare abonați în timp real (ex: conexiuni SSE ale altor jucători)
    for (const listener of this.listeners) {
      try {
        listener(this.state, this.version, res.eventsEmitted);
      } catch (err) {
        console.error('StateChangeListener error:', err);
      }
    }

    return { applied: true, idempotentReplay: false, version: this.version, state: this.state, events: res.eventsEmitted };
  }

  getEventsSince(seq: number) {
    return this.db.getEventsSince(seq);
  }
}
