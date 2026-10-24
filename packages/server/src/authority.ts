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
    return { applied: true, idempotentReplay: false, version: this.version, state: this.state, events: res.eventsEmitted };
  }

  getEventsSince(seq: number) {
    return this.db.getEventsSince(seq);
  }
}
