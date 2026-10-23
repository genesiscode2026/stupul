# AUDIT TEHNIC INDEPENDENT — PROIECTUL STUPUL GENESIS v1.1

Data: 23.10.2026
Auditor: Principal Software Architect & Lead Security Reviewer
Statut: AUDIT COMPLET — PROBLEME IDENTIFICATE ȘI CORECTATE

---

## 1. Sinteză Executivă

Acest audit a fost efectuat în conformitate cu Directiva Master P0, fără a accepta presupuneri anterioare. Codul din toate cele 4 module (`packages/domain`, `packages/engine`, `packages/shared`, `apps/web`) a fost inspectat la nivel de instrucțiune, supus testelor de stres (inclusiv rulare neîntreruptă pe 10.000 de pași de simulare), testelor de securitate pe intrări malițioase și analizei de concurență.

---

## 2. Probleme Tehnice Identificate și Corectate în Cadrul Auditului

### Problema 1: Vulnerabilitate la Vot Multiplu (Spam / Sybil) în Tally
- **Severitate:** Înaltă (Securitate Guvernanță)
- **Cauza tehnică:** În funcția `evaluateBicameralDecision` din `packages/domain/src/governance.ts`, voturile erau adunate iterând direct prin array-ul de buletine (`citizenBallots`), permițând unui client rău-intenționat să trimită zeci de buletine cu același `actorId` și să denatureze rezultatul votului.
- **Fișier afectat:** `packages/domain/src/governance.ts`
- **Corecția aplicată:** Implementat mecanism strict de deduplicare prin `Map<ActorId, Ballot>`, garantând că fiecare cetățean are exact 1 vot (ultimul buletin valid înainte de deadline).
- **Test adăugat:** `tests/stress-and-security.test.ts` (`SEC-VOTE-DEDUP`) — 50 de voturi trimise de același atacator sunt deduplicate matematic la exact 1 vot.
- **Rezultat:** PASS.

### Problema 2: Vulnerabilitate la Coordonate Ne-Întregi (Floats / NaN) în Reducător
- **Severitate:** Medie (Stabilitate & Crash Denial of Service)
- **Cauza tehnică:** Comenzile `CLAIM_PARCEL`, `CONSTRUCT_BUILDING`, `UPGRADE_BUILDING`, `DEMOLISH_BUILDING` verificau doar `x < 0 || x >= 16`, permițând coordonate fracționare (ex: `x = 2.5`), ceea ce returna `grid[2.5] = undefined` și cauza excepție neprinsă la citirea proprietăților.
- **Fișier afectat:** `packages/engine/src/reducer.ts`
- **Corecția aplicată:** Adăugată validarea strictă `Number.isInteger(x) && Number.isInteger(y)` și verificarea existenței `actorId`.
- **Test adăugat:** `tests/stress-and-security.test.ts` (`SEC-FRAUD-CMD`).
- **Rezultat:** PASS.

### Problema 3: Lipsa Verificării Coordonatelor în `DEMOLISH_BUILDING`
- **Severitate:** Medie
- **Cauza tehnică:** Comanda `DEMOLISH_BUILDING` accesa direct `state.grid[y][x]` fără verificarea prealabilă a limitelor `0..15`, generând `TypeError: Cannot read properties of undefined` la valori negative sau în afara grilei.
- **Fișier afectat:** `packages/engine/src/reducer.ts`
- **Corecția aplicată:** Adăugate limitele de interval și validarea de număr întreg.
- **Rezultat:** PASS.

### Problema 4: Risc de Prototype Pollution și Valori Ilegale în Politici Publice
- **Severitate:** Înaltă (Integritate Simulare)
- **Cauza tehnică:** `SET_POLICY` permitea orice cheie și valoare fără validare de tip, interval sau filtrare a cheilor speciale (`__proto__`, `constructor`, `prototype`). Un atacator putea seta rate de impozit negative (`-50%`) pentru a genera monedă virtuală infinită.
- **Fișier afectat:** `packages/engine/src/reducer.ts`
- **Corecția aplicată:** Adăugat blocaj de securitate pentru chei de prototip și validare strictă pe intervale pentru fiecare politică (`taxRatePercent` 0..30%, `foodRationing` moduri permise, `educationSubsidyPercent` 0..50%, `infrastructureBudgetCredits` 0..100).
- **Test adăugat:** `SEC-FRAUD-CMD` în `tests/stress-and-security.test.ts`.
- **Rezultat:** PASS.

### Problema 5: Vulnerabilitate la Payload-uri Masive și Prototype Injection în Importul Snapshot
- **Severitate:** Înaltă (Securitate Client & Persistență)
- **Cauza tehnică:** `validateAndImportSnapshot` din `packages/shared/src/persistence.ts` făcea `JSON.parse()` fără limită de dimensiune și fără verificare structurală a dimensiunilor grilei (putea importa o grilă coruptă cu mai puține rânduri).
- **Fișier afectat:** `packages/shared/src/persistence.ts`
- **Corecția aplicată:** Limitare la maximum 5MB, respingerea cheilor `__proto__`/`constructor`, validarea strictă a matricii de 16x16 și a valorilor numerice nenegative ale resurselor.
- **Test adăugat:** `SEC-JSON-INJECT` în `tests/stress-and-security.test.ts`.
- **Rezultat:** PASS.

### Problema 6: Închiderea Serverului Vite pe TTY Detached în Fundal
- **Severitate:** Operațională (macOS)
- **Cauza tehnică:** Când `START_STUPUL.command` rula Vite în fundal fără redirecționarea intrării standard (`< /dev/null`), procesul Node.js detecta închiderea terminalului/TTY și trimitea semnal de oprire.
- **Fișiere afectate:** `START_STUPUL.command`, `STOP_STUPUL.command`
- **Corecția aplicată:** Lansare prin `nohup node ... < /dev/null >> stupul.log 2>&1 &` urmat de `disown`, salvarea PID-ului exact și verificare la oprire fără comenzi agresive de tip `killall node`.
- **Rezultat:** PASS (3 cicluri complete de Start/Stop validate).

---

## 3. Matricea de Testare Executată și Rezultate

| Suită de Teste | Fișier | Număr Teste | Rezultat Real |
|---|---|---|---|
| Guvernanță & Egalitate Civică | `tests/governance.test.ts` | 12 teste | **PASS (100%)** |
| Drepturile Fondatorului & Redevențe 5% | `tests/royalties.test.ts` | 7 teste | **PASS (100%)** |
| Simulare, Grid & Determinizare | `tests/simulation.test.ts` | 7 teste | **PASS (100%)** |
| Securitate, Stres 10k & Concurență | `tests/stress-and-security.test.ts` | 5 teste | **PASS (100%)** |
| **TOTAL GENERAL** | — | **31 teste** | **PASS (31/31)** |

### Detalii Stres 10.000 de Pași:
- 10.000 de pași au fost rulați pe două instanțe complet independente cu seed-ul `7777`.
- Hash-ul SHA-256 canonic la pasul 10.000 a fost **perfect identic** pe ambele instanțe.
- Nicio valoare de resursă sau populație nu a devenit `NaN`, infinită sau negativă.

---

## 4. Riscuri Rămase și Limite Asumate Onest

1. **Integritatea Salivărilor Locale (Mod Single-Player):**
   - *Risc:* În mediul de browser local, suma de control SHA-256 protejează împotriva coruperii accidentale și a modificărilor manuale naive, însă un utilizator avansat poate modifica codul JavaScript din DevTools pentru a genera hash-uri valide pentru resurse modificate.
   - *Atenuare pentru viitor:* Pentru viitoarea versiune online (F2/M2 multiplayer), nicio stare completă a clientului nu este acceptată ca adevăr. Serverul va fi singura autoritate care execută reducătorul `reduce()`.
2. **Dependența de Rețea a Măsurării Timpului la Vot:**
   - *Risc:* Timpul deliberării (7 zile) și al timelock-ului (72h) este măsurat în milisecunde de sistem. În modul offline local, schimbarea ceasului local al mașinii ar putea scurta artificial deliberarea.
   - *Atenuare:* În producția multiplayer, `serverAcceptedAtMs` din Workers D1 va fi sursa autoritativă de timp.
