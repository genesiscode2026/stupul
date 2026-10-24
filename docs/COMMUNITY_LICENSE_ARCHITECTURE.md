# STUPUL GENESIS v2.0 — Arhitectura Comunității și a Operatorilor

Data: 24.10.2026 · Auditor: Cline

## 1. Separarea puterilor (A–G)
| Rol | Competență | Nu poate |
|---|---|---|
| A. Fondator pasiv | IP inițial dovedit + redevență 5% | control operațional/veto politic |
| B. Operator comercial | exploatează economic, răspunde legal/fiscal | rescrie votul comunității |
| C. Comunitate jucători | vot civic, politici virtuale | plăți, date private |
| D. Comunitate dezvoltatori | cod, calitate, roadmap | auto-aprobare recompense |
| E. Custode independent | marcă, domeniu, chei release, licențe | administrarea firmei |
| F. Admini infrastructură | rulare, backup, uptime | schimbarea regulilor |
| G. Admini financiari | raportare/reconciliere | schimbarea destinației singuri |

Un acționar cu 100% din firma operatoare **nu** primește automat control asupra voturilor comunitare
(`citizenVoteWeight` = 1 indiferent de avere/acțiuni/fondator).

## 2. Mecanisme pregătite
- Transfer controlat al exploatării + schimbare operator (condiții contractuale).
- Continuitate conturi/progres (starea orașului e separată de operator — serverul e detașabil).
- Preluare de noi echipe (repo + manifest GENESIS versionat + licențe).
- Conservarea versiunilor istorice (git + jurnal append-only + snapshot-uri).
- Verificarea licențelor (manifest GENESIS `licenseVersionIds`).
- Remunerarea contributorilor (interfețe; fără plăți reale încă).
- Detectarea conflictelor de interese (`approvals.ts`, `contributionAward`, `assignReviewer`).
- Păstrarea drepturilor beneficiarului redevenței (registru + multi-aprobare).

## 3. Responsabilitate
Răspunderea urmează activitățile și competențele **reale**, nu etichetele din GENESIS. Fondatorul
nu are obligații operaționale ulterioare în raporturile contractuale proiectate.

## 4. Limită
Nu transferă efectiv proprietate, conturi sau drepturi fără acte valabile și autorizare (BLOCAT JURIDIC).
