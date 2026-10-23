import { GameState, EngineCommand } from './types.js';
import { reduce } from './reducer.js';
import { createInitialState } from './initialState.js';

export interface RecordedCommand {
  seq: number;
  command: EngineCommand;
  stateHashAfter: string;
}

export class SimulationHistory {
  private initialSeed: number;
  private recordedCommands: RecordedCommand[] = [];

  constructor(initialSeed: number) {
    this.initialSeed = initialSeed;
  }

  record(command: EngineCommand, stateHashAfter: string): void {
    this.recordedCommands.push({
      seq: this.recordedCommands.length + 1,
      command,
      stateHashAfter
    });
  }

  getCommands(): RecordedCommand[] {
    return [...this.recordedCommands];
  }

  /**
   * Replays entire simulation from seed.
   * Verifies invariant STP-T01, T-001: identical seed + identical commands = identical stateHash.
   */
  replay(): { finalState: GameState; valid: boolean; mismatchedSeq?: number } {
    let state = createInitialState(this.initialSeed);

    for (const item of this.recordedCommands) {
      const res = reduce(state, item.command);
      if (!res.success) {
        return { finalState: state, valid: false, mismatchedSeq: item.seq };
      }
      state = res.nextState;
      if (state.stateHash !== item.stateHashAfter) {
        return { finalState: state, valid: false, mismatchedSeq: item.seq };
      }
    }

    return { finalState: state, valid: true };
  }
}
