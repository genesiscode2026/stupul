# STUPUL — FOAIE DE PARCURS CĂTRE MULTIPLAYER (ROADMAP)
## Arhitectură Autoritativă Zero-Cost & Democratie Digitală Scalabilă

**Data:** 23 Octombrie 2026  
**Document:** `docs/ROADMAP_TO_MULTIPLAYER.md`  
**Autor:** Principal Software Architect & Systems Engineer

---

## 1. Viziune & Principii Arhitecturale Fundamentale

Trecerea jocului **STUPUL** de la versiunea Genesis v1.1 (Single-Player Local) la Multiplayer Persistent Colaborativ se realizează respectând următoarele principii nenegociabile:

1. **Zero-Cost Infrastructură (Free-Tier Native):** Utilizarea ecosistemului Cloudflare (Workers + D1 SQLite + Pages/KV) pe planul gratuit, eliminând complet costurile lunare de găzduire și mentenanță a serverelor dedicate.
2. **Autoritate Absolută pe Server (Authoritative Server):** Clientul (browserul) este considerat nesigur. Nicio resursă, parcelă sau vot nu este aprobat direct de client.
3. **Reutilizarea Motorului Existent:** Pachetul `@stupul/engine` este 100% TypeScript izolat și determinist; el va fi executat direct în Cloudflare Worker fără rescriere de cod.
4. **Fără Tehnologii Speculative / Fără Crypto în Gameplay:** Păstrarea strictă a valorilor din manifest: monedă virtuală civică fără valoare speculativă, guvernanță 1 om = 1 vot, fără portofele Web3 în joc.
5. **Fail-Closed & Reconciliere Optimistă:** Interfața client aplică modificări instantanee pentru experiență fluidă (Optimistic UI), dar revine la starea serverului (Rollback) în caz de reject la validare.

---

## 2. Arhitectura Tehnică a Sistemului

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (React + Vite)                 │
│  - Optimistic Command Dispatch                              │
│  - Canvas Rendering (Grid 16x16 / Chunks)                   │
│  - WebAuthn (Passkeys) / Session Token                      │
│  - SSE / WebSocket Event Consumer                           │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP POST /api/commands      │ SSE Stream / Long Poll
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                 CLOUDFLARE WORKER (Edge Gateway)            │
│  - Rate Limiting per IP & Actor                             │
│  - WebAuthn Signature Verification                          │
│  - Sequential Command Queue Processor                       │
│  - @stupul/engine (Deterministic Reducer)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 CLOUDFLARE D1 (SQLite Database)             │
│  - settlements (Metadata, Tick, Seed)                       │
│  - parcels (Grid State, Clădiri, Nivel)                     │
│  - actors (Cetățeni, Roluri, Puncte Civice)                │
│  - governance_ballots (Constrângere UNIQUE: 1 Om = 1 Vot)   │
│  - command_log (Jurnal de Audit Imutabil)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Schema Bazei de Date (Cloudflare D1 SQLite)

```sql
-- 1. Așezarea Comunitară
CREATE TABLE settlements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 16,
    height INTEGER NOT NULL DEFAULT 16,
    current_tick INTEGER NOT NULL DEFAULT 0,
    treasury_civic_points INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Actanți / Cetățeni
CREATE TABLE actors (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    passkey_credential_id TEXT UNIQUE,
    passkey_public_key BLOB,
    role TEXT NOT NULL DEFAULT 'CITIZEN',
    civic_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Parcele de Teren (Grid)
CREATE TABLE parcels (
    settlement_id TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    owner_actor_id TEXT,
    building_type TEXT,
    building_level INTEGER DEFAULT 0,
    aqueduct_directions TEXT, -- JSON array: ["N", "S"]
    aqueduct_has_water INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (settlement_id, x, y),
    FOREIGN KEY (settlement_id) REFERENCES settlements(id),
    FOREIGN KEY (owner_actor_id) REFERENCES actors(id)
);

-- 4. Coada și Jurnalul Imutabil de Comenzi
CREATE TABLE command_log (
    sequence_num INTEGER PRIMARY KEY AUTOINCREMENT,
    settlement_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    command_type TEXT NOT NULL,
    payload TEXT NOT NULL, -- JSON
    applied_tick INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (settlement_id) REFERENCES settlements(id),
    FOREIGN KEY (actor_id) REFERENCES actors(id)
);

-- 5. Buletine de Vot Democratic (1 Om = 1 Vot)
CREATE TABLE governance_ballots (
    proposal_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    choice TEXT NOT NULL, -- 'YES' / 'NO' / 'ABSTAIN'
    cast_tick INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (proposal_id, actor_id), -- GARANȚIE DEDISPUTATĂ ANTI-SYBIL
    FOREIGN KEY (actor_id) REFERENCES actors(id)
);
```

---

## 4. Fluxul de Execuție & Sincronizare

1. **Emiterea Comenzii:**  
   Jucătorul apasă „Construiește Piață” la coordonatele (4, 7). Clientul afișează clădirea imediat (Optimistic).
2. **Trimiterea către Edge:**  
   Cererea ajunge la Cloudflare Worker (`POST /api/commands`) semnată cu tokenul de sesiune.
3. **Validare & Execuție:**  
   Worker-ul încarcă starea parcelei și a actorului din D1, execută funcția `stupulReducer(state, action)` din `@stupul/engine`.
4. **Persistență Tranzacțională:**  
   Dacă acțiunea este validă, Worker-ul execută o tranzacție `batch` în D1:
   - Salvează noua stare a parcelei;
   - Scade resursele actorului;
   - Inserează comanda în `command_log`.
5. **Broadcasting către Clienți:**  
   Evenimentul este transmis celorlalți jucători prin SSE (Server-Sent Events) pe canalul `/api/settlements/:id/events`. Clienții își actualizează Canvas-ul în timp real.

---

## 5. Măsuri Anti-Bot & Anti-Sybil (Zero Cost)

1. **Autentificare fără Parolă prin WebAuthn / Passkeys:**
   - Nu se stochează parole sau chei private în joc.
   - Fiecare cont este legat de un hardware token sau TouchID/FaceID din browser.
   - Elimină complet crearea automată de conturi în masă de către scripturi bot simple.
2. **Proof-of-Work (PoW) Ușor la Crearea Contului:**
   - Un calcul Hashcash SHA-256 de 200 ms în browser înainte de înregistrarea contului, descurajând atacurile de tip flood.
3. **Constrângere Strictă la Vot în Baza de Date:**
   - Indexul unic `PRIMARY KEY (proposal_id, actor_id)` face imposibilă duplicarea voturilor, chiar și în condiții de concurență extremă.

---

## 6. Etapele de Implementare (Faze)

### Faza 1: Spectator Colaborativ (Read-Only Cloud)
- Deploy frontend pe Cloudflare Pages (gratuit, CDN global).
- Export periodic de snapshot JSON din orașul activ către un Cloudflare Worker / KV.
- Jucătorii externi pot vizualiza orașul în browser fără a putea construi.

### Faza 2: Comenzi Asincrone & Oraș Comun (Turn-Based Multiplayer)
- Integrarea Cloudflare D1.
- Endpoint-uri REST: `/api/claim`, `/api/build`, `/api/vote`.
- Reducerul `@stupul/engine` rulează pe server la fiecare comandă.
- Sincronizare prin Polling periodic la fiecare 3 secunde (`GET /api/settlements/:id/state`).

### Faza 3: Live Real-Time & Cursori Partajați
- Implementare Server-Sent Events (SSE) sau Cloudflare Durable Objects cu WebSockets.
- Afișarea cursorului celorlalți jucători activi direct pe `CityCanvas`.
- Chat civic local integrat fără servere terțe.
- Trecerea dincolo de gridul 16x16 prin alăturarea mai multor cartiere (Chunks 16x16) într-o federație regională.

---

## 7. Criterii de Succes & Validare
- Latență sub 100 ms pentru utilizatori din Europa (Cloudflare Edge).
- Cost lunar operațional: **0,00 USD** (se încadrează în cele 100.000 cereri/zi gratuite ale Cloudflare Workers și 5 milioane citiri/zi pe D1).
- 100% rezistență la comenzi frauduloase sau clonări de voturi.
