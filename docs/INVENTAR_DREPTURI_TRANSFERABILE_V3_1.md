# INVENTARUL DREPTURILOR TRANSFERABILE ȘI REGISTRUL ACTIVELOR STUPUL
## Documentație de Conformitate & Due Diligence — P2 (GENESIS v3.1)
**Versiune:** 3.1.0  
**Data:** 24 Octombrie 2026  
**Document:** `docs/INVENTAR_DREPTURI_TRANSFERABILE_V3_1.md`  
**Statut:** DRAFT — PENTRU VERIFICARE JURIDICĂ (COUNSEL REVIEW ONLY)

---

## 1. Principiul de Realism în Clasificarea Drepturilor

În conformitate cu Directiva Master GENESIS v3.1:
1. **Fără ficțiuni juridice:** Nu se afirmă proprietatea automată asupra unor concepte generice de joc sau asupra unor opere care nu îndeplinesc condiția de originalitate.
2. **Transferabilitate patrimonială:** Fondatorul nu dorește să păstreze proprietatea patrimonială, ci pregătește transferul tuturor drepturilor patrimoniale eligibile către Operator sau Custode.
3. **Tratamentul drepturilor morale:** Drepturile morale de autor (paternitatea operei, dreptul la nume) sunt inalienabile conform art. 10 din Legea nr. 8/1996 și Convenției de la Berna; acestea rămân recunoscute în persoana autorului, dar sunt complet degrevate de orice atribuție operațională, administrativă sau decizională.
4. **Delimitarea contribuțiilor AI vs Umane:** Recunoașterea distincției juridice conform ghidurilor US Copyright Office și practicii europene (AI Act / CJUE): codul generat exclusiv prin promptare fără intervenție umană creativă substanțială poate avea statut incert de copyright; selecția, arhitectura, structura modulară și combinarea originală realizată de om beneficiază de protecție ca operă colectivă/compilată.

---

## 2. Registrul Detaliat al Activelor STUPUL

| Categorie Activ | Descriere & Componente | Proveniență | Titular Cunoscut | Drepturi Transferabile | Restricții / Dependențe | Licență Propusă | Dovezi Tehnice | Nivel Incertitudine |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Cod Sursă Motor (`@stupul/engine`)** | Reducer determinist, simulare tick-uri, logică 16x16, puzzle apeduct. | Dezvoltat în proiect de Fondator cu asistență de inginerie software AI. | Fondator (drepturi inițiale). | **DA — Transferabile integral.** Cesiune patrimonială exclusivă. | Fără dependențe externe restrictive; rulează pur TS. | Cesiune comercială cu redevență 5% (G-001/G-002). | Git commit history, SHA-256 commit baseline, teste determinism. | Scăzută |
| **Cod Sursă Guvernanță (`@stupul/domain`)** | Modele de date civice, 1 om = 1 vot, dedublare buletine, contestații, redevențe. | Dezvoltat în proiect de Fondator cu asistență AI. | Fondator (drepturi inițiale). | **DA — Transferabile integral.** | Nicio restricție terță. | Cesiune comercială cu redevență 5%. | Commit baseline, teste unitare vitest. | Scăzută |
| **Modul Integritate (`@stupul/genesis-integrity`)** | Manifest semnat Ed25519, verificare 5%, jurnal append-only, registru beneficiar. | Creat ca fortificare de securitate contractuală. | Fondator / Proiect. | **DA — Transferabile integral.** | Imutabilitate funcțională a constantei de 5%. | Cesiune comercială cu redevență 5%. | Semnături Ed25519, teste CI `royalty_guard.cjs`. | Scăzută |
| **Server Autoritativ (`@stupul/server`)** | Server node:sqlite, idempotență, tranzacții atomice, rate-limiter, sincronizare. | Dezvoltat în proiect. | Fondator / Proiect. | **DA — Transferabile integral.** | Utilizează modulul standard `node:sqlite`. | Cesiune comercială cu redevență 5%. | Teste de anduranță concurentă 100 clienți. | Scăzută |
| **Interfață Utilizator (`apps/web`)** | Componente React 18, dashboard civic, modale tutorial, panouri de construcție. | Dezvoltat în proiect. | Fondator / Proiect. | **DA — Transferabile integral.** | Dependențe standard npm (React, Tailwind). | Cesiune comercială cu redevență 5%. | Build Vite curat, 0 erori consolă. | Scăzută |
| **Canvas & Grafică Procedurală** | Rendering 2D izometric pe canvas HTML5, pietoni simulați, texturi clădiri. | Grafică generată procedural direct din cod Canvas 2D fără fișiere binare externe. | Fondator / Proiect. | **DA — Transferabile integral.** | Nu folosește asset-uri grafice externe cu drepturi rezervate. | Cesiune comercială cu redevență 5%. | `CityCanvas.tsx`, capturi Puppeteer. | Scăzută |
| **Texte & Documentație** | Constituția, PRD, Ghidul Pionierului, manualele tehnice, jurnalele narative. | Redactate în cadrul proiectului. | Fondator. | **DA — Transferabile integral.** | Dreptul moral de paternitate rămâne recunoscut. | Cesiune comercială cu redevență 5%. | Fișiere markdown în `00_START` și `docs/`. | Scăzută |
| **Denumirea „STUPUL”** | Numele comercial și conceptul de branding al jocului. | Creație originală în cadrul proiectului. | Fondator (drept comun). | **DA — Transferabil.** Poate fi înregistrat ca marcă de către Operator. | Nu este încă înregistrat ca marcă oficială la OSIM/EUIPO. | Cesionabil odată cu proiectul. | Utilizare publică anterioară ca titlu de operă. | Medie (necesită depunere marcă) |
| **Iconițe (`lucide-react`)** | Pachet de iconițe vectoriale UI. | Proiect open-source comunitar. | Titularii Lucide Icons. | **NU se cesionează proprietatea** (se transferă doar dreptul de utilizare open-source). | Licență ISC (permite utilizare comercială, distribuție, sublicențiere). | Licență ISC (inclusă în `node_modules`). | `package.json` | Nulă (drept cert de utilizare) |
| **Fonturi (Inter, Cinzel)** | Tipografie interfață și titluri clasice. | Google Fonts / Creatorii fonturilor. | Google / Creatorii independenți. | **NU se cesionează proprietatea** (se utilizează sub licență). | SIL Open Font License (OFL) 1.1. Permite utilizare comercială gratuită. | SIL Open Font License (OFL). | Referințe CDN în `index.html`. | Nulă |
| **Framework-uri & Dependențe Open-Source** | React 18, Vite 8, Vitest 5, Tailwind 4. | Comunitățile open-source globale. | Autorii respectivelor proiecte. | **NU se cesionează proprietatea.** | Licențe permisive standard: MIT / BSD-3-Clause / Apache 2.0. | MIT / BSD / Apache. | `package.json`, `package-lock.json`, `npm audit` (0 vulnerabilități). | Nulă |
| **Contribuții Umane Viitoare (Comunitate)** | Modificări, corecții de cod, traduceri, extensii trimise de jucători/dezvoltatori. | Membrii comunității STUPUL. | Fiecare contributor individual. | **Licențiate / Cesionate către Operator** prin Acordul de Contribuție (CLA/DCO). | Operatorul nu preia automat proprietatea fără acord de contribuție semnat. | CLA / DCO Community Workshop (P3). | Jurnalul de propuneri și aprobări din Atelierul Comunității. | Scăzută (gestionată prin CLA) |
| **Componente Generate cu Asistență AI** | Porțiuni de cod generate în procesul de dezvoltare asistată (Antigravity/Cline). | Asistent AI sub instrucțiuni și prompturi umane creative. | Statut legal: domeniu public sau parte a operei derivate/compilate a autorului uman. | **Transferabile în măsura maximă permisă de lege.** | Legislația nu recunoaște AI ca titular de drepturi de autor. | Inclus în pachetul de cesiune către Operator. | Transcripturile de dezvoltare, istoricul de promptare și commit-uri. | Medie (delimitată prin selecție umană) |

---

## 3. Recomandări de Acțiune pentru Viitorul Operator Comercial

1. **Depunerea Mărcii Individuale:**  
   Operatorul Comercial care preia exploatarea va depune cererea de înregistrare a mărcii verbale și figurative „STUPUL” la OSIM (pentru România) și EUIPO (pentru Uniunea Europeană) pe clasele NISA 9 (software de jocuri), 41 (jocuri online) și 42 (servicii software).
2. **Semnarea Formală a Contractului de Cesiune:**  
   La data transferului, se va semna contractul redactat conform proiectului `docs/CONTRACT_CESIUNE_DREPTURI_PATRIMONIALE_V3_1.md`.
3. **Preluarea Drepturilor de la Contributori:**  
   Niciun cod creat de comunitate nu va fi integrat în branch-ul principal de producție fără semnarea digitală a Developer Certificate of Origin (DCO) sau a Contributor License Agreement (CLA).
