import { NodeSqliteStorageAdapter, type StorageAdapter, type EventRecord } from './storageAdapter.js';

/**
 * Persistență pentru starea autoritativă a orașului comun STUPUL.
 * Suportă atât SQLite nativ (node:sqlite) pentru servere locale/Node,
 * cât și adaptoare portabile în memorie sau Cloudflare D1.
 */
export class StateDB {
  private readonly adapter: StorageAdapter;

  constructor(target: string | StorageAdapter) {
    if (typeof target === 'string') {
      this.adapter = new NodeSqliteStorageAdapter(target);
    } else {
      this.adapter = target;
    }
  }

  loadState(): { json: string; version: number } | null {
    return this.adapter.loadState();
  }

  saveState(json: string, version: number): void {
    this.adapter.saveState(json, version);
  }

  hasCommand(commandId: string): boolean {
    return this.adapter.hasCommand(commandId);
  }

  saveCommand(commandId: string, result: string, appliedAt: number): void {
    this.adapter.saveCommand(commandId, result, appliedAt);
  }

  appendEvent(tick: number, type: string, actor: string, payload: string, stateHash: string, at: number): void {
    this.adapter.appendEvent(tick, type, actor, payload, stateHash, at);
  }

  getEventsSince(seq: number): EventRecord[] {
    return this.adapter.getEventsSince(seq);
  }

  transaction<T>(fn: () => T): T {
    return this.adapter.transaction(fn);
  }

  close(): void {
    this.adapter.close();
  }
}
