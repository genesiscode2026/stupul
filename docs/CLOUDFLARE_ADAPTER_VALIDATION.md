# Validarea Adaptoarelor de Stocare: Node.js SQLite vs. Cloudflare D1 vs. Memory

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **IMPLEMENTAT ȘI VALIDAT ÎN `@stupul/server`**  

---

## 1. Arhitectura Interfeței Comune `StorageAdapter`

Pentru a permite jocului să ruleze identic atât pe un laptop macOS local, cât și pe o infrastructură serverless globală de tip Cloudflare Workers, pachetul `@stupul/server` definește o interfață contract de stocare uniformă:

```typescript
export interface StorageAdapter {
  loadState(): { json: string; version: number } | null;
  saveState(json: string, version: number): void;
  hasCommand(commandId: string): boolean;
  saveCommand(commandId: string, result: string, appliedAt: number): void;
  appendEvent(tick: number, type: string, actor: string, payload: string, stateHash: string, at: number): void;
  getEventsSince(seq: number): EventRecord[];
  transaction<T>(fn: () => T): T;
  close(): void;
}
```

---

## 2. Comparație Tehnică între cele 3 Implementări

| Criteriu | `NodeSqliteStorageAdapter` | `CloudflareD1StorageAdapter` | `MemoryStorageAdapter` |
|---|---|---|---|
| **Mediu de Execuție** | Node.js v22+ (`node:sqlite`) | Cloudflare Workers / Pages Functions | Orice mediu JavaScript / V8 |
| **Persistență** | Fișier SQLite pe disk (`.sqlite`) | Bază de date distribuită Cloudflare D1 | Volatilă (în RAM) |
| **Cost Infrastructură** | 0 USD (pe mașina proprie) | 0 USD (pe Cloudflare Free Tier: 5GB D1) | 0 USD |
| **Tranzacționalitate** | `db.exec('BEGIN') / COMMIT` | Execuție atomică la nivel de statement / D1 batch | Snapshot rollback în caz de eroare |
| **Utilizare Recomandată** | Serverul de producție local (`START_STUPUL`) | Găzduire globală publică pe internet | Rulare rapidă teste automate Vitest |

---

## 3. Schema SQL Unificată

Atât `NodeSqliteStorageAdapter` cât și `CloudflareD1StorageAdapter` utilizează aceeași schemă relațională standardizată:

```sql
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
```

Această schemă garantează că o bază de date SQLite locală poate fi exportată și importată direct într-o instanță Cloudflare D1 la trecerea în producție fără nicio conversie de date.
