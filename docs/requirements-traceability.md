# STUPUL GENESIS v1.1 — Matrice de Trasabilitate a Cerințelor (corectată)

Data: 23.10.2026
Autor: Cline (audit independent)

Această matrice mapează fiecare cerință normativă GENESIS (`STP-*`, `GOV-*`, `LEG-*`)
la fișierele de cod **efectiv existente** și la testele **efectiv rulate**.
Această versiune corectează varianta anterioară care cita module/teste inexistente
(ex: `packages/engine/src/grid`, `tests/grid.test.ts`).

## Fișierele reale (inventar verificat)

| Modul | Fișiere sursă |
|---|---|
| `packages/domain` | `types.ts`, `governance.ts`, `roles.ts`, `royalties.ts`, `contributions.ts`, `custody.ts`, `legalGates.ts`, `security.ts`, `index.ts` |
| `packages/engine` | `types.ts`, `constants.ts`, `prng.ts`, `hash.ts`, `puzzle.ts`, `initialState.ts`, `reducer.ts`, `history.ts`, `index.ts` |
| `packages/shared` | `index.ts`, `persistence.ts` |
| `apps/web` | `App.tsx`, `main.tsx`, `index.css`, `components/*.tsx` (10 componente) |
| `tests` | `governance.test.ts` (14), `royalties.test.ts` (7), `simulation.test.ts` (7), `stress-and-security.test.ts` (5) — total **33 teste** |

## 1. Cerințe de joc (STP)

| ID | Cerință | Sursă reală | Test real | Statut |
|---|---|---|---|---|
| STP-001 | Hartă 16×16, zoom, pan, selecție | `engine/src/initialState.ts`, `apps/web/src/components/CityCanvas.tsx` | `simulation.test.ts` (determinism) | Implementat |
| STP-002 | Resurse întregi (fără flotanți financiari) | `engine/src/types.ts` (Resources), `engine/src/reducer.ts` | `stress-and-security.test.ts` (fără NaN/negative) | Implementat |
| STP-003 | Populație agregată 100 NPC | `engine/src/initialState.ts`, `engine/src/reducer.ts` | `stress-and-security.test.ts` | Implementat |
| STP-004 | Clădiri (10 tipuri), costuri | `engine/src/constants.ts`, `engine/src/reducer.ts` | `simulation.test.ts` (T-003, T-004) | Implementat |
| STP-005 | Puzzle apeduct cu validare | `engine/src/puzzle.ts`, `engine/src/reducer.ts` | `simulation.test.ts` (STP-005) | Implementat |
| STP-006 | Politici versionate (4 politici) | `engine/src/reducer.ts` (SET_POLICY) | `stress-and-security.test.ts` (SEC-FRAUD-CMD) | Implementat |
| STP-007 | Istoric append-only, snapshot, replay | `engine/src/history.ts`, `domain/src/security.ts` | `simulation.test.ts` (STP-T05), `governance.test.ts` (GOV-T10) | Implementat (local) |
| STP-008 | Parcele virtuale (inGameOnly) | `engine/src/reducer.ts` (CLAIM_PARCEL) | `simulation.test.ts` (STP-T02) | Implementat |
| STP-009 | Alegeri/consiliu/mandate | `domain/src/governance.ts`, `domain/src/roles.ts` | `governance.test.ts` (GOV-T01..T09) | Implementat (logică, fără conturi reale) |
| STP-010 | Atelier creatori (bounties, CLA) | `domain/src/contributions.ts`, `domain/src/custody.ts`, `domain/src/legalGates.ts` | `governance.test.ts` (GOV-T04/T11/T12), `royalties.test.ts` (LEG-T06) | Parțial (doar logică; fără CLA real/plăți) |
| STP-011 | Film evoluție + istoric | `apps/web/src/components/TimelineModal.tsx` | — | Parțial (listă evenimente, fără time-lapse de snapshot-uri) |
| STP-012 | Vizualizator viitoruri alternative | — | — | Neimplementat |
| STP-013 | Protecție împotriva controlului absolut | `domain/src/governance.ts`, `domain/src/security.ts` | `governance.test.ts` (GOV-T01..T03), `simulation.test.ts` (STP-T06) | Implementat (logică) |
| STP-014 | Fallback offline | `shared/src/persistence.ts` (OfflineStorage), `apps/web/src/App.tsx` | `simulation.test.ts` (T-006) | Implementat |
| STP-015 | Mod anonim fără profilare | `apps/web` (fără auth; „Mod Oaspete") | — | Implementat |

## 2. Cerințe de guvernanță (GOV)

| ID | Cerință | Sursă reală | Test real | Statut |
|---|---|---|---|---|
| GOV-001 | Avere/acțiuni/fondator = 0 voturi suplimentare | `domain/src/governance.ts` (citizenVoteWeight) | `governance.test.ts` (GOV-T01..T03) | Implementat |
| GOV-010 | Merit doar pentru contribuții validate (half-life 45z, 90z) | `domain/src/contributions.ts` | `governance.test.ts` (GOV-T04/T05/T11/T12) | Implementat |
| GOV-020 | Bicameral + plafon 5% la >=20 contributori | `domain/src/governance.ts` | `governance.test.ts` (GOV-T06/T07 + edge cases) | Implementat (corectat) |
| GOV-030 | Mandate limitate + revocare | `domain/src/roles.ts` | `governance.test.ts` (GOV-T09) | Implementat |
| GOV-040 | Control tehnic separat / integritate jurnal | `domain/src/security.ts` | `governance.test.ts` (GOV-T10) | Implementat (logică locală; fără infra reală) |
| GOV-050 | Drepturi/contestații/apel | — (nu există modul `appeals`) | — | Neimplementat (parțial în `security.ts`) |

## 3. Cerințe juridice/economice (LEG)

| ID | Cerință | Sursă reală | Test real | Statut |
|---|---|---|---|---|
| LEG-001 | Redevență 5% din încasări nete eligibile | `domain/src/royalties.ts` | `royalties.test.ts` (LEG-T01/T02) | Implementat |
| LEG-002 | Anti-deturnare (afiliați) | `domain/src/royalties.ts` | `royalties.test.ts` (LEG-T03) | Implementat |
| LEG-003 | Reimplementare independentă = 0 | `domain/src/royalties.ts` | `royalties.test.ts` (LEG-T04) | Implementat |
| LEG-004 | Legal Gates fail-closed | `domain/src/legalGates.ts` | `royalties.test.ts` (LEG-T05) | Implementat |
| LEG-005 | Custodie multi-semnătură (Exodus) | `domain/src/custody.ts` | `royalties.test.ts` (LEG-T06) | Implementat |
| LEG-006 | Fondator pasiv exclus din admin | `domain/src/custody.ts` | `royalties.test.ts` (LEG-T07) | Implementat |

## Notă de onestitate
Această matrice confirmă implementarea **logicii deterministe locale**. Ea NU confirmă:
- identitate reală 1 om = 1 vot (nu există mecanism de identitate; deduplicarea `actorId` ≠ anti-Sybil);
- un server multiplayer autoritativ (vezi `NEXT_DEVELOPMENT_STAGES.md`);
- plăți reale sau monetizare (blocate de Legal Gate).
