# Arhitectură tehnică — cost inițial zero
## Stack
TypeScript + Vite + Phaser (sau Canvas 2D fără dependențe grele); Vitest și Playwright; pachete `engine`, `client`, `api`, `shared`, `docs`. Separă logica pură de prezentare. Pentru demo offline: IndexedDB/localStorage doar pentru stări nesensibile; export/import JSON validat.

## Invariant determinist
`nextState = reduce(previousState, validatedCommand, rulesetVersion)` fără I/O, Date.now, Math.random, fetch sau dependență de ordinea obiectelor. RNG cu seed persistat și PRNG explicit. Un turn/tick produce un hash SHA-256 canonic. Niciun client nu stabilește unilateral starea partajată.

## Backend doar la F2
Cloudflare Pages static + Workers API + D1. API idempotent cu `commandId`, optimistic concurrency (`expectedVersion`) și transaction boundary; citiri paginate/indexate; rate limit; snapshot + event log. Nu revendica acuratețe de sistem distribuit dacă nu ai teste de concurență.

## Model write / read
`POST /v1/worlds/:id/commands` (autentificat, doar server validează); `GET /v1/worlds/:id/snapshot`; `GET /v1/worlds/:id/events?cursor=...`; `POST /v1/worlds/:id/simulate-scenario` limitat; `GET /health`. Clientul nu trimite direct stări complete acceptate ca adevăr.

## Cost discipline
Simulare discretă la evenimente/tick, nu 60 FPS pe server; randarea clientului la 60 FPS. Cache immutable pentru assets; compresie snapshot; D1 indexed queries; jurnal limitat/paginat; fără AI inference per user; fără servicii third-party obligatorii. Pragurile free sunt variabile în timp, deci instrumentare + mecanism circuit breaker; nu presupune gratuitate permanentă.

## Migrare și portabilitate
Schema SQL versionată, export JSON independent de Cloudflare, configurații prin env, adapter storage, rollback logic. Zero secrete în client. For each release: reproducible build, semver de savegame, changelog, backup și test restore.

## Schelet repo
`apps/web`, `apps/api`, `packages/engine`, `packages/domain`, `packages/ui`, `tests/e2e`, `docs`, `infra/migrations`.
