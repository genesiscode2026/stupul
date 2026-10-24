# STUPUL GENESIS v2.0 — Auditul Securității Redevenței de 5%

Data: 24.10.2026 · Auditor: Cline

## 1. Invarianta contractuală (implementată tehnic)
`packages/genesis-integrity/src/royaltyConstants.ts` ancorează:
- `ROYALTY_RATE = 0.05`, `ROYALTY_RATE_BASIS_POINTS = 500`, `ROYALTY_FORMULA_ID = 'stupul-founder-royalty-v1'`.
- Formula P1-H: `eligibleReceipts = gross − indirectTaxes − refunds − chargebacks − permittedDirectProcessorFees`;
  `founderRoyalty = eligibleReceipts * 0.05`. Cheltuielile generale/salarii/marketing NU reduc baza.

**Atenție (onestitate):** o constantă în cod NU creează un drept opozabil terților. Protecția software
dublează licențe/contracte valabile — nu le înlocuiește.

## 2. Componente implementate și testate (17 teste)
| Componentă | Fișier | Ce garantează |
|---|---|---|
| Manifest GENESIS versionat | `manifest.ts` | id constituție, versiune, hash-uri doc, formulă, licențe, istoric |
| Semnare Ed25519 | `sign.ts` | cheie DEV locală; cheia reală NU se inventează/NU se comite |
| Verificare | `verify.ts` | 5%, formulă, semnături, lanț istoric |
| Jurnal append-only | `auditLog.ts` | lanț hash verificabil, detecția falsificării |
| Aprobări multiple | `approvals.ts` | 2 din 2, independență, roluri permise |
| Beneficiar | `beneficiary.ts` | schimbare adresă publică doar prin aprobări independente |
| Reconciliere | `reconciliation.ts` | deduceri, anti-dublare, anti-deturnare afiliați/sublicențe |
| CI guard | `scripts/royalty_guard.cjs` | detectează eliminarea/5%/formula/legal-gate/chei |

## 3. Threat model (P1-K)

| Scenariu | Prevenție | Detecție | Dovadă | Remediu | Limitări |
|---|---|---|---|---|---|
| Hacker modifică sursele | git + revizuire | royalty_guard (CI) | diff + guard FAIL | revert | — |
| Admin modifică buildul | separare release | verificare manifest la release | manifest invalid | rebuild din sursă semnată | admin root poate ocoli |
| Admin schimbă baza de date | privilegii minime | jurnal append-only + hash | lanț hash rupt | restore din backup | admin DB poate șterge tot |
| Operator deturnează plățile | contract + cont separat | reconciliere periodică | raport vs procesator | executare contractuală | software nu poate forța plata |
| Operator nu mai raportează | clauză raportare | reconciliere lipsă | jurnal gol | executare contractuală | nu e detectabil automat complet |
| Operator mută spre firmă afiliată | anti-deturnare | `affiliatedReceipts` inclus | reconciliere | executare contractuală | probele pot fi ascunse |
| Dev elimină redevența | royalty_guard | verificare manifest | guard FAIL | revert | dev cu acces la CI poate modifica guard |
| Compromiterea cheilor de semnare | chei dedicate + rotație | semnătură invalidă | verificare eșuează | revocare + re-semnare | necesită procedură umană |
| Schimbare adresă fără autorizare | multi-aprobare | `beneficiary.ts` respinge | istoric adrese | corectare | actorii pot conlucra fraudulos |

**Delimitare:** software-ul DETECTEAZĂ modificări de cod/formulă și împiedică acțiuni unilaterale în
modulul de integritate. El NU poate garanta încasarea de la terți și NU poate înlocui executarea
contractuală ori răspunderea juridică.

## 4. Rezultat
- 17/17 teste P1 PASS; `royalty_guard.cjs` = ALL ROYALTY INVARIANTS OK; 0 chei private în repo.
- 0 vulnerabilități `npm audit`.
