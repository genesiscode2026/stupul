# STUPUL GENESIS v1.1 — Matrice de Trasabilitate a Cerințelor

Data: 23.10.2026
Autor: Antigravity (Principal Software Architect & Lead Engineer)

Această matrice mapează fiecare cerință normativă din documentația GENESIS v1.1 (`STP-*`, `GOV-*`, `LEG-*`) la codul sursă, testele automate și artefactele de livrare.

---

## 1. Cerințe Funcționale de Joc (STP)

| ID Cerință | Descriere Cerință | Pachet / Modul Sursă | Test Automat | Statut |
|---|---|---|---|---|
| **STP-001** | Hartă 2D/izometrică 16×16, zoom, pan, selecție celule, legendă, suport tastatură | `apps/web/src/renderer`, `packages/engine/src/grid` | `tests/grid.test.ts`, E2E | Implementat |
| **STP-002** | Resurse întregi (hrană, materiale, credit virtual); fără flotanți financiari | `packages/engine/src/economy` | `tests/economy.test.ts` | Implementat |
| **STP-003** | Populație simulată agregat: 100 NPC inițiali; nevoi de hrană, adăpost, muncă, sănătate, educație | `packages/engine/src/population` | `tests/population.test.ts` | Implementat |
| **STP-004** | Clădiri: casă, fermă, depozit, puț, primărie, școală, drumuri; cost construcție și întreținere | `packages/engine/src/buildings` | `tests/buildings.test.ts` | Implementat |
| **STP-005** | Mini-puzzle de infrastructură (apă/energie) cu validare topologică și recompensă virtuală | `packages/engine/src/puzzle` | `tests/puzzle.test.ts` | Implementat |
| **STP-006** | Politici și legi versionate: impozit virtual, rații hrană, educație, infrastructură | `packages/engine/src/policies` | `tests/policies.test.ts` | Implementat |
| **STP-007** | Istoric evenimente append-only, snapshot periodic, replay determinist (seed fix) | `packages/engine/src/history`, `packages/engine/src/reducer` | `tests/determinism.test.ts` | Implementat |
| **STP-008** | Parcele și proprietăți doar în joc; fără drept real; verificare eligibilitate | `packages/engine/src/parcels` | `tests/parcels.test.ts` | Implementat |
| **STP-009** | Alegeri, primar, consiliu civic, mandate limitate (30 zile), protecție multi-cont | `packages/domain/src/governance` | `tests/governance.test.ts` | Implementat |
| **STP-010** | Registru contribuții (bounties, review independent, CLA, impact, fără bani reali) | `packages/domain/src/contributions` | `tests/contributions.test.ts` | Implementat |
| **STP-011** | Filmul evoluției orașului (time-lapse replay, jurnal de evenimente) | `apps/web/src/components/TimelineModal.tsx`, `packages/engine` | `tests/replay.test.ts` | Implementat |
| **STP-012** | Simulator scenarii alternative / proiecții decizionale fără manipulare vot | `packages/engine/src/simulation` | `tests/simulation.test.ts` | Implementat |
| **STP-013** | Protecție împotriva controlului absolut: separarea puterilor, fără vot pe bază de avere | `packages/domain/src/governance` | `tests/governance.test.ts` (GOV-T01..T03) | Implementat |
| **STP-014** | Funcționare fallback 100% offline pentru modul local | `packages/shared/src/storage`, `apps/web` | `tests/offline.test.ts` | Implementat |
| **STP-015** | Mod anonim fără profilare comportamentală și fără cont obligatoriu | `apps/web/src/auth` | `tests/guest.test.ts` | Implementat |

---

## 2. Cerințe de Guvernanță și Merit (GOV)

| ID Cerință | Descriere Cerință | Pachet / Modul Sursă | Test Automat | Statut |
|---|---|---|---|---|
| **GOV-001** | Invariant: nicio putere permanentă cumpărată (avere/terenuri/acțiuni = 0 voturi în plus) | `packages/domain/src/governance` | `GOV-T01`, `GOV-T02`, `GOV-T03` | Implementat |
| **GOV-010** | Reputație și Merit doar pentru contribuții validate; decay cu half-life 45 zile, expirare 90 zile | `packages/domain/src/merit` | `GOV-T04`, `GOV-T05`, `GOV-T11` | Implementat |
| **GOV-020** | Bicameralism (Cetățeni + Contribuitori); egalitate < 20 contributori; max 5% pondere la >= 20 | `packages/domain/src/bicameral` | `GOV-T06`, `GOV-T07`, `GOV-T08` | Implementat |
| **GOV-030** | Mandat primar 30 zile, max 2 consecutive; coordonator dezvoltare 60 zile; revocare la inactivitate 30z | `packages/domain/src/roles` | `GOV-T09` | Implementat |
| **GOV-040** | Control tehnic separat: chei release, bază date, backup; fără un singur admin omnipotent | `packages/domain/src/security` | `GOV-T10` | Implementat |
| **GOV-050** | Drepturi și remedii: drept de contestație, decizii motivate, protecție anti-Sybil echitabilă | `packages/domain/src/appeals` | `GOV-T12` | Implementat |

---

## 3. Cerințe Juridice și Economice (LEG)

| ID Cerință | Descriere Cerință | Pachet / Modul Sursă | Test Automat | Statut |
|---|---|---|---|---|
| **LEG-001** | Redevență 5% din încasările nete eligibile (gross - taxe - refunds - chargebacks - processor fees) | `packages/domain/src/royalties` | `LEG-T01`, `LEG-T02` | Implementat |
| **LEG-002** | Protecție anti-deturnare (produse derivate, afiliați, bunuri asociate) | `packages/domain/src/royalties` | `LEG-T03` | Implementat |
| **LEG-003** | Reimplementare independentă fără IP licențiat => zero creanță de 5% | `packages/domain/src/royalties` | `LEG-T04` | Implementat |
| **LEG-004** | Legal Gates obligatorii: FĂRĂ MONETIZARE fără operator verificat, IP inventory, licență, aviz avocat | `packages/domain/src/legalGates` | `LEG-T05` | Implementat |
| **LEG-005** | Gestiune destinație plată / Exodus fără chei private în cod; audit la schimbare adresă | `packages/domain/src/custody` | `LEG-T06` | Implementat |
| **LEG-006** | Separare strictă fondator pasiv vs. admin operațional | `packages/domain/src/custody` | `LEG-T07` | Implementat |

---

## 4. Teste de Integritate și Tehnică (STP-T)

| ID Test | Criteriu de Validare | Fișier Test |
|---|---|---|
| **STP-T01** | Replay cu același seed + comenzi => același hash SHA-256 pe 1000 ticks | `tests/engine-determinism.test.ts` |
| **STP-T02** | 1000 acțiuni concurente pe aceeași parcelă => exact o achiziție reușită | `tests/parcels-concurrency.test.ts` |
| **STP-T03** | Funcționare 100% offline când backend-ul nu este disponibil | `tests/offline-fallback.test.ts` |
| **STP-T04** | Fără API plăți/crypto/monedă convertibilă în modul de bază | `tests/security-audit.test.ts` |
| **STP-T05** | Rollback și reconstrucție completă a stării din snapshot + event log | `tests/rollback.test.ts` |
| **STP-T06** | Rol politic / utilizator nu poate invoca operațiuni neautorizate | `tests/rbac-security.test.ts` |
