# STUPUL GENESIS v1.1 — Etape Următoare de Dezvoltare

Data: 23.10.2026 · Auditor: Cline

Acest document delimitează ce **este** implementat de ce **lipsește** pentru o comunitate online reală.
Se bazează pe milestone-urile GENESIS (M0–M6) și pe `docs/ROADMAP_TO_MULTIPLAYER.md`.

## Stadiul actual (M1–M4 parțial, local)
- M1 (simulare offline): **complet** — hartă 16×16, resurse, clădiri, 100 NPC, puzzle, snapshot/replay.
- M2 (experiență guest + micro-provocare): **parțial** — mod guest + puzzle + tutorial; lipsesc link public/partajare.
- M3 (propuneri/vot/jurnal fără bani): **parțial** — logica bicamerală există, dar fără conturi reale.
- M4 (dezvoltare deschisă, CLA, bicameral): **parțial** — logica există, dar fără CLA real, fără review real.

## Ce lipsește pentru o comunitate online reală

### 1. Identitate și eligibilitate (anti-Sybil real) — BLOCAT
- WebAuthn/passkeys sau alt mecanism de identitate.
- Constrângere UNIQUE `(proposal_id, actor_id)` în baza de date.
- Până atunci, deduplicarea `actorId` **nu** garantează 1 om = 1 vot.

### 2. Server autoritativ (Cloudflare Worker) — BLOCAT (necesită cont/serviciu cloud)
- Clientul este considerat nesigur; serverul execută `@stupul/engine` ca singurul adevăr.
- Comenzi asincrone + persistență tranzacțională (D1) + broadcast (SSE/WebSocket).

### 3. Operator juridic + custodie independent — BLOCAT (necesită entitate juridică)
- Separarea reală a celor 4 puteri (lume virtuală / dezvoltare / operator comercial / custode).
- Marcă/domeniu/licență cu aviz juridic (Legal Gate L1).

### 4. Monetizare — BLOCAT (Legal Gate fail-closed)
- Doar după operator verificat + IP inventory + licență + aviz avocat + conformitate fiscală/GDPR.
- Redevența de 5% rămâne contractuală; software-ul singur nu impune plăți terților.

## Îmbunătățiri locale realizabile fără costuri (prioritate imediată)
1. Validare vizuală completă în browser (desktop + mobil 360px) — Playwright indisponibil în această rundă.
2. `prefers-reduced-motion` pentru animația canvas.
3. Toast-uri în loc de `alert()`.
4. Butoane de salt în tutorial (puzzle/guvernanță).
5. Replay time-lapse al snapshots (STP-011 complet).
6. Upgrade Vitest/Vite (elimină 6 vulnerabilități de dev).

## Criterii de gata pentru lansare publică (per GENESIS)
Fără ownership operativ clar, backup restaurabil, limitare abuz, terms/privacy, test de concurență
și Legal Gate — **nu** se lansează online și **nu** se activează comerțul.
