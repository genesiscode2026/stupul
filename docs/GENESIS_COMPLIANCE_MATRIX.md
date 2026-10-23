# STUPUL GENESIS v1.1 — Matrice de Conformitate (Clasificare)

Data: 23.10.2026 · Autor: Cline (audit independent)

Legendă:
- **IMPLEMENTAT ȘI VERIFICAT** — funcționalitate reală, test automat trecut.
- **IMPLEMENTAT PARȚIAL** — logică prezentă, dar incompletă față de cerință.
- **SIMULAT / MOCK** — există doar ca tip/structură demonstrativă, fără efect real.
- **NEIMPLEMENTAT** — lipsă.
- **BLOCAT EXTERN** — necesită entitate juridică, operator, cont real, servicii cloud sau aviz juridic.

## Rezumat executiv
Proiectul STUPUL este un **prototip local single-player determinist funcțional**, NU un joc online multiplayer.
Motorul, guvernanța și economia sunt reale și testate (33 teste). Multiplayer, identitatea reală și
monetizarea sunt **etape viitoare**, nu sunt implementate.

## Clasificare pe cerințe

### Joc (STP)
| ID | Clasificare | Dovadă |
|---|---|---|
| STP-001 Hartă 16×16 | IMPLEMENTAT ȘI VERIFICAT | `CityCanvas.tsx` + determinism |
| STP-002 Resurse întregi | IMPLEMENTAT ȘI VERIFICAT | reducer + stres 10k |
| STP-003 Populație 100 NPC | IMPLEMENTAT ȘI VERIFICAT | initialState + TICK |
| STP-004 Clădiri | IMPLEMENTAT ȘI VERIFICAT | constants + reducer + T-003/T-004 |
| STP-005 Puzzle apeduct | IMPLEMENTAT ȘI VERIFICAT | puzzle.ts + STP-005 |
| STP-006 Politici | IMPLEMENTAT ȘI VERIFICAT | SET_POLICY + SEC-FRAUD-CMD |
| STP-007 Istoric/replay | IMPLEMENTAT ȘI VERIFICAT (local) | history.ts + STP-T05 |
| STP-008 Proprietăți virtuale | IMPLEMENTAT ȘI VERIFICAT | CLAIM_PARCEL + STP-T02 |
| STP-009 Alegeri/mandate | IMPLEMENTAT PARȚIAL | logică pură, fără conturi reale |
| STP-010 Atelier creatori | IMPLEMENTAT PARȚIAL | logică, fără CLA real/plăți |
| STP-011 Film evoluție | IMPLEMENTAT PARȚIAL | doar listă evenimente (TimelineModal) |
| STP-012 Viitoruri alternative | NEIMPLEMENTAT | — |
| STP-013 Protecție control absolut | IMPLEMENTAT ȘI VERIFICAT | GOV-T01..T03 + STP-T06 |
| STP-014 Fallback offline | IMPLEMENTAT ȘI VERIFICAT | OfflineStorage + T-006 |
| STP-015 Mod anonim | IMPLEMENTAT ȘI VERIFICAT | fără auth |

### Guvernanță (GOV)
| ID | Clasificare | Dovadă |
|---|---|---|
| GOV-001 Zero voturi pt. avere | IMPLEMENTAT ȘI VERIFICAT | GOV-T01..T03 |
| GOV-010 Merit validat | IMPLEMENTAT ȘI VERIFICAT | GOV-T04/T05/T11/T12 |
| GOV-020 Bicameral + 5% | IMPLEMENTAT ȘI VERIFICAT | GOV-T06/T07 + edge cases |
| GOV-030 Mandate/revocare | IMPLEMENTAT ȘI VERIFICAT | GOV-T09 |
| GOV-040 Control tehnic separat | IMPLEMENTAT PARȚIAL | logică locală; fără infra/credentiale reale |
| GOV-050 Drepturi/apel | NEIMPLEMENTAT | nu există modul appeals |
| 1 om = 1 vot (anti-Sybil real) | **BLOCAT EXTERN** | necesită identitate/eligibilitate reală |

### Juridic/Economic (LEG)
| ID | Clasificare | Dovadă |
|---|---|---|
| LEG-001 Redevență 5% | IMPLEMENTAT ȘI VERIFICAT | LEG-T01/T02 |
| LEG-002 Anti-deturnare | IMPLEMENTAT ȘI VERIFICAT | LEG-T03 |
| LEG-003 Reimplementare=0 | IMPLEMENTAT ȘI VERIFICAT | LEG-T04 |
| LEG-004 Legal Gates | IMPLEMENTAT ȘI VERIFICAT | LEG-T05 |
| LEG-005 Custodie multi-sig | IMPLEMENTAT ȘI VERIFICAT | LEG-T06 |
| LEG-006 Fondator pasiv | IMPLEMENTAT ȘI VERIFICAT | LEG-T07 |
| Monetizare reală | **BLOCAT EXTERN** | Legal Gate fail-closed |

## Diferențe față de declarațiile Antigravity (corectate)
1. `requirements-traceability.md` vechi cita ~17 fișiere de test și ~8 module inexistente — corectat.
2. „31 teste" (AUDIT_SENIOR) vs „26 teste" (CHANGELOG) — realitatea este acum **33 teste**.
3. „Sybil eliminat prin deduplicarea actorId" — **fals**: este deduplicare de identificator, nu dovadă 1 om = 1 vot.
4. Hash SHA-256 recalculabil de client prezentat drept „integritate criptografică" — este doar sumă de control, nu autenticitate.
5. `npm run lint` era `echo 'Linting passed'` — înlocuit cu ESLint real.
6. `npm run typecheck` eșua (lipsă `tsconfig.json`) — reparat.
