# STUPUL GENESIS v2.0 — Guvernanță Comunitară

Data: 24.10.2026 · Auditor: Cline

## 1. Mecanisme implementate și testate
- **Mandate limitate** (primar 30z, max 2 consecutive) — `roles.ts` (GOV-T09).
- **Revocare** la inactivitate 30z + remediere 7z — `roles.ts`.
- **Contribuții verificate** (fără auto-aprobare, COI) — `contributions.ts` (GOV-T04/T11/T12).
- **Merit activ** (half-life 45z, 90z) — `contributions.ts` (GOV-T05).
- **Camere separate** (cetățeni + contribuitori) — `governance.ts` (GOV-T06/T07/T08).
- **Plafon 5%** — corectat cu redistribuire egală + verificare „suma = 100%" (GOV-T07 + edge cases).
- **Integritate jurnal** — `security.ts` (GOV-T10).
- **Apel/contestații** — **`appeals.ts` (NOU, 7 teste)**: motiv scris, termen, independență,
  conflict de interese, decizie motivată, reversibilitate, audit.

## 2. Anti-monopol
Averea virtuală, proprietățile și acțiunile societății **nu** adaugă voturi (`citizenVoteWeight`).
Plafonul de 5% se aplică și când numărul contributorilor activi e insuficient: sub 20 → vot egal;
la exact 20 → 5% egal forțat; distribuții extreme (unul cu tot meritul) → redistribuire corectă.

## 3. Interfețe pentru comunitatea de dezvoltatori (pregătite, fără plăți reale)
Propunere → Evaluare → Testare → Acceptare → Atribuire → Recompensare viitoare → Audit.
(`contributions.ts`, `approvals.ts`, `appeals.ts`; plățile reale rămân blocate de Legal Gate.)

## 4. Limite
Voturile sunt **beta** până la anti-Sybil real (1 om = 1 vot nu e garantat de conturi).
