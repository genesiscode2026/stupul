# ACORDUL DE ADMINISTRARE ȘI GUVERNANȚĂ COMUNITARĂ STUPUL
## COMMUNITY OPERATING AGREEMENT (COA) — GENESIS v3.3

**Versiune:** 3.3.0  
**Data:** 24 Octombrie 2026  
**Statut:** Cadru Autonom de Transfer, Guvernanță și Administrare  

---

### PREAMBUL

Prezentul document stabilește regulile constituționale prin care civilizația digitală **STUPUL** funcționează, este administrată, dezvoltată și comercializată în mod autonom de către comunitate și operatori independenți, fără a necesita intervenția directă a Fondatorului inițial.

---

### 1. SEPARAREA PUTERILOR ȘI STRUCTURA DE ROLURI

Pentru a preveni concentrarea puterii și riscurile de tip single-point-of-failure, sistemul instituie o separare strictă a 7 competențe distincte:

| Rol Constituțional | Competențe Exclusive | Restricții Absolute (Fail-Closed) |
|---|---|---|
| **A. Fondator Pasiv** | Drept de creație inițial recunoscut; Beneficiar al Redevenței Pasive de 5% (500 bps) pe rețeaua BASE în USDC. | ZERO drept de veto politic; ZERO control operațional asupra serverelor sau comunității. |
| **B. Operator Comercial** | Exploatare economică, hosting, conformitate fiscală, încasare venituri, plată redevență de 5%. | NU poate altera votul cetățenilor; NU poate reduce baza eligibilă prin cheltuieli de regie. |
| **C. Consiliul Comunitar** | Administrare strategică, mediere dispute civice, prioritizare roadmap și RFC-uri. | Deciziile necesită vot majoritar calificat; mandate limitate la 6 luni. |
| **D. Camera Contributorilor** | Dezvoltare software, securitate, audit de cod, aprobare pull request-uri. | Plafonare strictă la max 5% putere per membru; interzicerea auto-recompensării. |
| **E. Camera Cetățenilor** | Vot civic universal asupra politicilor orașului comun (1 om = 1 vot). | Nu are atribuții fiscale sau de decontare comercială. |
| **F. Custode de Integritate** | Păstrare domenii web, mărci, chei de semnare release și depozit Git. | Rol pur fiduciar; nu poate exploata comercial în nume propriu. |
| **G. Admini Financiari** | Reconciliere rapoarte Stripe/bancare și emitere tranzacții de decontare BASE USDC. | Nu pot schimba adresa de destinație blocată prin cod `0xC6F86e170411182114FcCdb28793dC76B5e8D144`. |

---

### 2. ALEGEREA ȘI FUNCȚIONAREA CONSILIULUI COMUNITAR

1. **Componență**: Consiliul Comunitar este compus din **5 membri** (minim 3, maxim 7).
2. **Durata Mandatului**: 6 luni calendaristice, cu eligibilitate pentru maxim 2 mandate consecutive.
3. **Procedura de Vot**:
   - Vot democratic direct pe baza identității verificate de cetățean (`role: citizen`).
   - Principiul fundamental: **1 Cetățean = 1 Vot** (`citizenVoteWeight = 1`).
   - Numărul de parcele deținute, soldul de credite virtuale sau acțiunile în firma operatoare conferă **0 (zero) voturi suplimentare**.
4. **Cvorum și Aprobare**:
   - Cvorum minim: 25% din cetățenii activi în ultimele 30 de zile.
   - Deciziile ordinare se adoptă cu majoritate simplă (50% + 1).
   - Deciziile constituționale (modificări regulament) necesită majoritate calificată de 66.7%.

---

### 3. PROCESUL DE PROPUNERI ȘI ÎMBUNĂTĂȚIRI (STUPUL RFC / PIP)

Orice modificare substanțială a jocului, a economiei sau a infrastructurii parcurge obligatoriu ciclul RFC (Request for Comments) în 3 etape:

```
[Etapa 1: DRAFT] -> [Etapa 2: COMMUNITY REVIEW (14 zile)] -> [Etapa 3: VOT BICAMERAL]
```

1. **Etapa 1: Draft RFC**: Redactat de orice cetățean sau contributor folosind șablonul standard din `docs/rfc/template.md`.
2. **Etapa 2: Revizuire Publică (14 zile)**: Discuție deschisă, evaluare tehnică și audit de securitate de către cel puțin 2 membri independenți ai Camerei Contributorilor.
3. **Etapa 3: Vot Bicameral**:
   - **Camera Cetățenilor**: Votează impactul asupra gameplay-ului și eticii civice (1 om = 1 vot).
   - **Camera Contributorilor**: Votează fezabilitatea tehnică (vot ponderat pe merit, plafonat la 5% per contributor).
   - O propunere devine activă doar dacă trece ambele camere.

---

### 4. ADMINISTRAREA INFRASTRUCTURII ȘI MANAGEMENTUL CHEILOR

1. **Fără Chei Unice (Zero Single Point of Failure)**:
   - Accesul la Cloudflare Workers, domenii DNS, servere autoritative și conturi de producție este securizat prin scheme **Multisig / Multi-Admin (minim 3 din 5 aprobări)**.
   - Nicio persoană fizică nu deține chei exclusive de ștergere sau blocare.
2. **Securitatea Repository-ului**:
   - Branch-ul `main` este strict protejat (Protected Branch).
   - Commit-urile necesită semnătură GPG/SSH și Developer Certificate of Origin (`git commit -s`).
   - Merge-ul necesită minimum 2 aprobări de la recenzenți ne-asociați și trecerea automată a suitei CI (`royalty_guard.cjs`, `vitest`, `typecheck`, `lint`).
3. **Persistența Datelor**:
   - Backup-uri automate zilnice ale bazei SQLite / Durable Objects stocate în două regiuni geografice independente.
   - Politică de retenție pe 90 de zile cu snapshot-uri criptografice.

---

### 5. MODELUL DE LICENȚIERE DUALĂ ȘI CONTINUITATEA REDEVENȚEI

1. **Pentru Comunitate, Educație și Rulare Non-Profit**:
   - Codul sursă este liber accesibil sub licență permissivă de dezvoltare și cercetare.
   - Orice grup comunitar poate rula un nod local sau privat fără plăți sau taxe, cât timp nu monetizează jocul.
2. **Pentru Exploatare Comercială și Operatori Publici**:
   - Oricine oferă jocul ca serviciu comercial cu plată, vinde produse virtuale, organizează ligi monetizate sau încasează venituri din STUPUL activează **Licența Comercială STUPUL**.
   - Operatorul semnează sau aderă de drept la **Deed of Adherence**, obligându-se la plata lunară a Redevenței Pasive de 5% din Încasările Eligibile către Fondator (`0xC6F86e170411182114FcCdb28793dC76B5e8D144`).
3. **Anti-Diversiune**:
   - Interzicerea strictă a reducerii bazei de calcul prin salarii de directori, chirii, marketing sau profituri ascunse în firme afiliate.
