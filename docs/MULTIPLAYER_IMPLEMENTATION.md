# STUPUL GENESIS v2.0 — Implementarea Multiplayer

Data: 24.10.2026 · Auditor: Cline

## 1. Arhitectura (autoritativă, cost minim)
Browserul trimite **intenția**, serverul validează, aplică prin motorul determinist și comunică
starea. Browserul NU stabilește solduri/proprietăți/recompense.

```
Browser (React) ── POST /api/command {commandId, actorId, command} ──► Server (Node)
                                                                        │  @stupul/engine reduce()
                                                                        ▼
                                                                   SQLite (node:sqlite)
                                                                   state / commands / events
```

## 2. Componente (`packages/server`)
| Fișier | Rol |
|---|---|
| `db.ts` | SQLite (node:sqlite) — starea v1, `commands` (UNIQUE command_id), `events` (append-only) |
| `authority.ts` | starea autoritativă unică; `applyCommand()` idempotent + atomic |
| `httpServer.ts` | HTTP API + rate limiting (token bucket) + write-disable |
| `index.ts` | entry-point (`npm start`) |

## 3. API
- `GET /api/state` → `{version, state}`
- `POST /api/command` → `{commandId, actorId, command}` → `{applied, version, state, events}`
- `GET /api/events?since=` → evenimente incrementale
- `GET /api/health` → `{writeDisabled, version, tick}`
- `POST /api/admin/write-mode` → comutator de dezactivare sigură a scrierilor

## 4. Garanții implementate
1. Stare comunitară persistentă unică (SQLite).
2. ID-uri unice comandă → **idempotență** (retrimiterea nu dublează).
3. Validare server-side (reducer).
4. Tranzacții atomice (BEGIN/COMMIT: stare+comandă+evenimente, toate sau nimic).
5. Anti-double-spend (resurse deduse atomic; respins dacă insuficiente).
6. Anti-double-claim (prima revendicare câștigă).
7. Control concurență (single-threaded + SQLite).
8. Versionare stare (version++ per comandă).
9. Jurnal evenimente verificabil (seq + state_hash).
10. Reconectare fără corupere (stare restaurată din DB).
11. Backup/restore (fișier SQLite).
12. Rate limiting (token bucket per IP).
13. Write-disable (dezactivare sigură a scrierilor).

## 5. Teste reale executate (9/9 PASS)
- idempotență (aceeași comandă o dată)
- anti-double-claim
- anti-double-spend
- persistență/reconectare
- write-disable
- falsificare sold (MINT respins)
- **100 clienți concurenți pe aceeași parcelă → exact 1 succes**
- rate limiting (429)
- health + evenimente

## 6. Pregătit, dar NU implementat în cloud (BLOCAT INFRASTRUCTURĂ)
- Deploy Cloudflare Workers + D1 necesită cont real — **nu a fost efectuat** (fără cont/operator).
- Adapterul conceptual este pregătit (serverul e izolat de transport), dar codul Worker/D1 real
  nu este livrat ca funcțional — este marcat ca etapă viitoare.

## 7. Concluzie onestă
Multiplayer-ul **local** este implementat și testat real (inclusiv concurență de 100 clienți).
Nu este „complet" în sensul unui serviciu public: lipsesc deploy-ul Cloudflare, identitatea reală
și operatorul responsabil.
