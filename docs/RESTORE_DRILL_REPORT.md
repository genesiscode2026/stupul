# STUPUL GENESIS v3.4 — Disaster Recovery & Restore Drill Report

**Dată:** 24 Octombrie 2026  
**Status:** VALIDAT CU SUCCES (RTO: 4 ms, RPO: 0)  
**Autoritate:** Database Reliability Engineer & Chief Security Architect  

---

## 1. Obiectivul Exercițiului de Restaurare

Simularea unui incident critic de integritate în care instanța de stocare principală a orașului comun suferă o corupere a datelor (pană de curent la nivel de nod, tranzacție parțială, eroare de scriere sau atac malițios de corupere JSON în tabela `state`).

Exercițiul a validat capacitatea sistemului de a recupera starea orașului fără intervenție manuală speculativă, folosind jurnalul de evenimente auditate (`events` table) și motorul de simulare deterministic.

---

## 2. Metodologia de Testare (`scripts/restore_drill.cjs`)

1. **Stare Inițială & Operațiuni Civice**:
   - Orașul inițializează seed-ul fix 42.
   - Sunt executate succesiv comenzi autoritative de revendicare parcelă (`CLAIM_PARCEL`), construcție casă (`CONSTRUCT_BUILDING`), muncă civică (`WORK_CIVIC_TASK`) și ajustare politică de impozitare (`SET_POLICY`).
   - Starea atinge versiunea 5, tick 0, hash SHA-256 `47a2defc7152f492f2b488377f59701c238f525837660690f1d9367b1a894717`.
2. **Injectare Defect Catastrofal**:
   - Conexiunea la server este întreruptă.
   - Înregistrarea unică din tabela `state` este coruptă direct prin SQL: `{"corrupt_payload": true, "truncated": [CORRUPT_EOF`.
3. **Procedura de Reconstrucție (Event Sourcing Replay)**:
   - Rutina de recuperare detectează coruperea JSON.
   - Se extrage jurnalul secvențial ordonat după `seq` din tabela `events`.
   - Motorul deterministic `@stupul/engine` re-rulează istoricul comenzilor pornind de la starea de bază.
   - Starea curată reconstruită este salvată în SQLite.
4. **Verificare Post-Restaurare**:
   - Repornirea clasei `Authority` pe baza restaurată.
   - Compararea bi-univocă a versiunii, parcelelor, resurselor și hash-ului SHA-256.

---

## 3. Metrici de Reziliență Obținute

| Metrică | Valoare Țintă | Valoare Realizată în Drill | Status |
| :--- | :--- | :--- | :--- |
| **RTO (Recovery Time Objective)** | `< 5.000 ms` | **4 ms** | **EXCELENT** |
| **RPO (Recovery Point Objective)** | `0 pierderi (Zero Data Loss)` | **0 tranzacții pierdute** | **EXCELENT** |
| **Identitate Hash Matematic** | Potrivire 100% | `47a2defc...` == `47a2defc...` | **CONFIRMAT** |
| **Integritate Proprietăți** | Parcela (1, 1) intactă | `building: house, owner: cetatean_drill_1` | **CONFIRMAT** |
| **Integritate Politici Publice** | TaxRate 15% intact | `policies.taxRatePercent: 15` | **CONFIRMAT** |

---

## 4. Ghid Operațional pentru Administratorii Comunitari (Runbook)

În eventualitatea unei defecțiuni hardware pe un nod comunitate sau pe Cloudflare DO:
1. Rulați comanda de diagnostic:
   ```bash
   node scripts/restore_drill.cjs
   ```
2. Pentru restaurarea unei baze de producție corupte:
   - Păstrați fișierul SQLite original ca backup de siguranță (`cp state.sqlite state.backup.sqlite`).
   - Executați scriptul de replay pe jurnalul de evenimente pentru a re-genera snapshot-ul stării.
   - Reporniți procesul server STUPUL (`./START_STUPUL.command` sau `wrangler dev`).
