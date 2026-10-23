/**
 * Mulberry32 32-bit deterministic PRNG.
 * Ensures identical random number streams given the same numeric seed.
 */
export class PRNG {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  /** Returns floating number in [0, 1) */
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns integer in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns current seed/state integer */
  getState(): number {
    return this.s;
  }

  /** Restores state */
  setState(state: number): void {
    this.s = state >>> 0;
  }
}
