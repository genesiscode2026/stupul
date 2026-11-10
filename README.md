# STUPUL — Persistent Democratic Civilisation Game (GENESIS v3.5)

[![STUPUL CI](https://github.com/genesiscode2026/stupul/actions/workflows/ci.yml/badge.svg)](https://github.com/genesiscode2026/stupul/actions)
[![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare_Workers-f38020)](wrangler.toml)
[![Tests](https://img.shields.io/badge/Vitest-169%20Passed-brightgreen)](tests/)
[![Zero-PII](https://img.shields.io/badge/Privacy-Zero--PII%20Passkeys-blue)](packages/domain/src/identity.ts)
[![License](https://img.shields.io/badge/License-Source--Available-amber)](LICENSE.md)

[🇷🇴 Română](#română) • [🇬🇧 English](#english)

---

## <a name="română"></a>🇷🇴 Română

### 🌐 Rulare & Deploy pe Cloudflare Edge
Proiectul este pregătit pentru rulare locală și deploy pe infrastructura Cloudflare Edge (`npx wrangler deploy` sub contul autorizat `chitara.trading@proton.me`). Endpoint-ul legacy de test a fost dezafectat; pentru rulare locală imediată folosiți `npm run dev`.

### Despre STUPUL
**STUPUL** este o simulare civică și urbană persistentă, multiplayer în timp real, construită pe un motor deterministic și o arhitectură distribuită democratică. Jucătorii colaborează pentru a dezvolta o așezare de frontieră („Avanpostul Văii”), gestionând resurse (hrană, materiale, credite virtuale), rezolvând infrastructura de apă (minijocul Apeductului) și votând legi civice prin vot pătratic.

### Moduri de Joc: Oaspete vs Cetățean
- **Mod Oaspete (Demo / Zero Bariere):**
  - Explorare vizuală a întregii hărți în timp real prin Server-Sent Events (SSE).
  - Tutorial interactiv pas-cu-pas.
  - Sarcini civice de muncă (agricultură, tăiat lemne, zidărie) și rezolvarea apeductului.
  - Simulări și teste de construcție locale.
  - *Protecție:* Oaspeții nu pot revendica sau epuiza parcelele persistente ale orașului comun.
- **Mod Cetățean (Persistent & Guvernanță):**
  - Înregistrare gratuită 1-click cu Zero-PII (fără colectare de email, telefon sau date private) sau WebAuthn / Passkey asimetric.
  - Revendicarea parcelelor și construirea clădirilor persistente în orașul comun.
  - Modernizarea și demolarea propriilor proprietăți.
  - Participare la Sfatul Civic, votarea politicilor și alegeri.

### Structura Monorepo
- `apps/web/`: Interfață React 18 + Tailwind CSS + Vite (Desktop & Mobile).
- `packages/domain/`: Modele de domeniu, roluri (11 roluri civice), incompatibilități anti-captură și matrici de permisiuni.
- `packages/engine/`: Motor deterministic de simulare pe tick-uri cu hash de stare criptografic (SHA-256).
- `packages/server/`: Server autoritativ WebSocket / SSE / HTTP și Cloudflare Durable Objects cu persistență SQLite pe edge.
- `packages/shared/`: Utilitare comune și persistență IndexedDB / LocalStorage.
- `packages/genesis-integrity/`: Verificare matematică a invariantelor de securitate și integritate.

### Ghid Rapid de Dezvoltare
```bash
# Instalare dependențe
npm install

# Rulare frontend în mod dezvoltare
npm run dev

# Rulare teste unitare și de securitate (169 teste Vitest)
npm test

# Compilare completă
npm run build
```

---

## <a name="english"></a>🇬🇧 English

### 🌐 Run Locally & Deploy to Cloudflare Edge
The project runs locally and deploys cleanly to Cloudflare Workers Edge (`npx wrangler deploy` under authorized contact `chitara.trading@proton.me`). Legacy test worker endpoint has been decommissioned; use `npm run dev` for immediate local testing.

### About STUPUL
**STUPUL** is a real-time persistent civic civilization game built on a deterministic tick engine and democratic state-machine architecture. Citizens co-create a frontier settlement ("Valley Outpost"), balancing food, construction materials, virtual credits, infrastructure puzzle minigames, and passing community policies through quadratic voting.

### Access Modes: Guest vs Citizen
- **Guest Mode (Instant Demo / Zero Barriers):**
  - Instant exploration of the shared world via SSE without registration.
  - Full interactive tutorial.
  - Civic tasks (farming, forestry, masonry) and aqueduct puzzle minigame.
  - *Integrity Guarantee:* Anonymous visitors cannot deplete or claim persistent parcels in the shared global city.
- **Citizen Mode (Persistent & Democratic):**
  - 1-click zero-PII onboarding (no personal email, phone, or identity tracked) or WebAuthn Passkeys.
  - Persistent parcel claiming and construction in the shared multiplayer city.
  - Building upgrades and property management.
  - Voting on city tax rates, education subsidies, and civic policies.

### Developer Setup
```bash
# Install dependencies
npm install

# Run local dev environment
npm run dev

# Run Vitest test suite (169 tests)
npm test

# Production build
npm run build
```

### Commercial Invariant & Royalties
Commercial hosting, monetized services, or derivatives are governed by the [Source-Available License](LICENSE.md) and require a 5% passive net royalty payable in native USDC on the Base blockchain to:
`0xC6F86e170411182114FcCdb28793dC76B5e8D144`.
