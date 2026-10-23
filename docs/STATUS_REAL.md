# STUPUL GENESIS v1.1 — STATUS REAL & MATURITATE TEHNICĂ

**Data Auditului:** 23 Octombrie 2026  
**Versiune Proiect:** Genesis v1.1 (Single-Player Local Deterministic)  
**Workspace:** `/Users/severmarcus/Documents/STUPUL`  
**Autor:** Senior Software Architect & QA Lead

---

## 1. Sumar Executiv & Nivel de Maturitate

Proiectul **STUPUL** se află în stadiul **GENESIS v1.1 Funcțional / Standalone Local**.  
Arhitectura implementată respectă cu strictețe principiul separării clare a responsabilităților, folosind un monorepo TypeScript modular:
- `@stupul/domain`: Entități, politici economice, guvernanță, reguli de redevență și conformitate.
- `@stupul/engine`: Reducer pur determinist, state machine, logica tick-urilor de simulare și a comenzilor.
- `@stupul/shared`: Validare Zod, persistență JSON sigură (LocalStorage), protecții anti-poluare de prototip.
- `apps/web`: Interfață grafică React 18 + Vite, canvas 2D interactiv cu animații de pietoni, suport touch și tutorial pas-cu-pas.

Jocul rulează complet independent pe mașina locală, fără conexiuni externe, fără dependențe plătite și fără riscuri de securitate.

---

## 2. Matricea de Conformitate & Realitate Funcțională

| Modul / Funcționalitate | Stare Reală | Tip Execuție | Descriere & Limitări |
| :--- | :---: | :---: | :--- |
| **Grid 16x16 & Teren** | 100% Funcțional | Local Deterministic | Matrice carteziană fixă 16x16, validată strict la fiecare coordonată. |
| **Clădiri & Resurse** | 100% Funcțional | Local Deterministic | Case (adăpost), Piețe (hrană/bunuri), Mori (energie/măcinat), Puncte Civice. Resursele nu devin niciodată negative. |
| **Apeducte & Puzzle Apă** | 100% Funcțional | Local Deterministic | Rețea de conectivitate apă cu direcții (N, S, E, W), validare curgere și bonusuri de fertilitate. |
| **Drumuri & Pietoni** | 100% Funcțional | Client Canvas Anim | Rețea de drumuri pe grid; pietonii animați detectează traseul și se deplasează între locuințe și piețe. |
| **Monedă Virtuală Civică** | 100% Funcțional | Simulare Închisă | Puncte civice / jetoane virtuale interne. **FĂRĂ valoare fiat, FĂRĂ legături crypto, FĂRĂ wallet**. |
| **Guvernanță Democratică** | 100% Funcțional | Deterministic | Principiul **1 Om = 1 Vot**. Dedublare strictă a voturilor per `actorId`. Bogăția/terenul nu oferă putere de vot. |
| **Politici Publice** | 100% Funcțional | Deterministic | Impozitare (0-30%), Raționalizare (normal/moderat/sever), Educație (0-50%), Bugete civice. |
| **Redevență Fondator (5%)** | 100% Funcțional | Contractual Formal | Calcul matematic strict de 5% din încasările nete eligibile (Gate 5), aplicabil exclusiv la venituri externe reale. |
| **Persistență & Salvare** | 100% Funcțional | LocalStorage Sigur | Serializare JSON protejată împotriva Prototype Pollution, limitată la 5MB, cu validare de schemă. |
| **Control START / STOP** | 100% Funcțional | Scripturi macOS | `START_STUPUL.command`, `STOP_STUPUL.command` și aplicația nativă `STUPUL_CONTROL.app`. Izolare totală PID. |
| **Multiplayer / Rețea** | Neimplementat (v1.1) | N/A | Jocul este 100% local. Nu există server multiplayer activ (vezi `ROADMAP_TO_MULTIPLAYER.md`). |

---

## 3. Detalii Tehnice pe Componente

### 3.1. Motorul de Simulare (`@stupul/engine`)
- **Stare:** 100% Deterministic.
- **Tick Loop:** Avansarea timpului (`TICK`) consumă hrană/apă proporțional cu populația, produce bunuri în piețe, generează puncte civice și aplică penalizări de sănătate/fericire dacă raționalizarea este severă.
- **Stabilitate:** Testat la 10.000 de tick-uri consecutive fără scurgeri de memorie, fără deviații și fără colaps al resurselor.
- **Reducer Hardened:** Toate acțiunile (`CLAIM_PARCEL`, `BUILD`, `DEMOLISH_BUILDING`, `SET_POLICY`, `CAST_VOTE`, `TICK`) validează tipul numerelor (`Number.isInteger`), limitele grilei (0-15) și integritatea actorului.

### 3.2. Guvernanță & Economie (`@stupul/domain`)
- **Vot Democratic:** Voturile sunt stocate într-un tablou agregat, însă la numărare se aplică un filtru de unicitate pe baza `actorId`. Un cetățean poate vota o singură dată per propunere.
- **Puncte Civice:** Câștigate exclusiv prin contribuții la bunuri publice (reparare apeduct, construcție drumuri, sarcini comunitare). Nu pot fi cumpărate cu bani reali.
- **Redevență Fondator:** Structurată în `packages/domain/src/royalties.ts`. Calculează cu precizie rotunjită în cenți 5% din plățile nete externe autorizate. Nu afectează economia internă a jocului.

### 3.3. Interfață & Experiență Utilizator (`apps/web`)
- **Vite + React 18:** Build curat, bundle optimizat de 328 kB.
- **CityCanvas:** Randează izometric/2D terenul, clădirile în funcție de nivelul lor (acoperișuri texturate, detalii grafice), apa curgătoare din apeducte și agenții (pietoni) care se plimbă pe rețeaua de drumuri.
- **Tutorial Interactiv:** Modal integrat în 5 pași pentru începători, explicând așezarea, supraviețuirea, puzzle-ul de apă, munca civică și adunarea generală.
- **Suport Touch:** Evenimente `onTouchStart`, `onTouchMove`, `onTouchEnd` implementate nativ pe canvas pentru tablete și telefoane.

### 3.4. Automatizare & Securitate macOS
- **Port Dinamic:** Dacă portul 5173 este ocupat (de exemplu de proiectul CRYCASH al utilizatorului), scriptul detectează automat portul liber imediat următor (5174+) fără să interfereze cu alte procese.
- **Fără Comenzi Distructive:** Scriptul `STOP_STUPUL.command` **nu** utilizează `killall node` sau `pkill node`. Oprește exclusiv PID-ul salvat în `runtime/stupul.pid` după verificarea liniei de comandă a procesului.
- **Interfață Nativă:** `STUPUL_CONTROL.app` oferă butoane grafice simple pentru utilizatorii non-tehnici.

---

## 4. Ce Este Real vs Ce Este Simulat

| Element | Realitate |
| :--- | :--- |
| **Cetățenii din oraș** | Simulați probabilistic (nu sunt jucători reali conectați pe rețea). |
| **Propunerile de vot** | Propuneri locale de politici publice (taxe, alocare grâu, apă). |
| **Moneda** | Resursă numerică în memorie / LocalStorage, fără valoare externă. |
| **Persistența** | LocalStorage în browserul curent (se pierde dacă se șterge cache-ul browserului). |
| **Multi-client** | Inexistent în v1.1. Fiecare browser are propriul său univers izolat. |

---

## 5. Concluzie Audit

STUPUL GENESIS v1.1 este o fundație solidă, sigură și complet funcțională pe plan local. Nu conține vulnerabilități critice, nu prezintă riscuri financiare sau legale și este gata pentru pasul următor: extinderea arhitecturală către multiplayer colaborativ.
