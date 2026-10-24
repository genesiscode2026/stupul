# ANALIZA ADVERSARIALĂ A CELOR 14 SCENARII DE RISC PENTRU REDEVENȚA DE 5%
## Fortificarea Tehnică & Remedii Juridice — P1 (GENESIS v3.1)
**Versiune:** 3.1.0  
**Data:** 24 Octombrie 2026  
**Fișier de Teste Corespondent:** `tests/adversarial-14-scenarios.test.ts` (14/14 PASS)

---

> [!NOTE]
> **PREMISĂ DE REALISM INGINERESC ȘI JURIDIC:**  
> Niciun hash, nicio semnătură criptografică și niciun test CI nu poate împiedica în mod absolut un atacator suveran pe propriul său server să șteargă cod sau un terț nelegat contractual să acționeze ilegal.  
> Obiectivul arhitecturii GENESIS v3.1 este **maximizarea protecției executabile**, crearea de **probe preconstituite irefutabile**, **detecția instantanee a fraudei** și activarea **remediilor contractuale și procesuale depline**.

---

## Matricea celor 14 Scenarii Adversariale

---

### SCENARIUL 1: Dezvoltatorul elimină sau reduce procentul de 5%
- **Descriere:** Un dezvoltator sau administrator modifică constanta în cod (ex: `ROYALTY_RATE = 0` sau `royaltyRateBasisPoints = 200`).
- **PREVENȚIE:** Fișierul `packages/genesis-integrity/src/royaltyConstants.ts` definește constanta înghețată, iar scriptul de CI `scripts/royalty_guard.cjs` rulează la fiecare build și blochează automat integrarea dacă procentul este diferit de 0.05 / 500 puncte de bază.
- **DETECȚIE:** `verifyManifest()` verifică direct dacă `manifest.content.royaltyRateBasisPoints === 500`. Orice deviație generează eroare: `"invalid royaltyRateBasisPoints; must be exactly 500 (5%)"`.
- **DOVADĂ:** Snapshot-ul git și istoricul manifestului semnat criptografic atestă modificarea neautorizată.
- **REMEDIU:** Build-ul eșuează; commit-ul este respins în pipeline; în caz de deploy neautorizat, licența de exploatare este revocată automat conform clauzei rezolutorii.
- **LIMITĂ JURIDICĂ:** Instanța judecătorească sancționează modificarea unilaterală ca o încălcare culpabilă a contractului de cesiune.
- **LIMITĂ TEHNICĂ:** Un dezvoltator care rulează pe un server privat fără CI poate rula cod modificat local; protecția tehnică acționează la nivel de repo și de rețea autorizată.

---

### SCENARIUL 2: Operatorul modifică formula de calcul (deduce cheltuieli nepermise)
- **Descriere:** Operatorul introduce deduceri pentru salarii, chirii, marketing, servere sau bonusuri de management pentru a micșora artificial baza de calcul.
- **PREVENȚIE:** Modulul `reconcileTransaction()` din `@stupul/genesis-integrity` acceptă exclusiv deducerile prevăzute strict în formula G-002: taxe indirecte, refund-uri, chargeback-uri și comisioane directe de procesare.
- **DETECȚIE:** Reconcilierea automată compară datele brute cu cele raportate. Câmpurile arbitrare sunt ignorate, iar parametrii non-numerici (NaN, negativi) declanșează excepții imediate.
- **DOVADĂ:** Jurnalul tranzacțiilor și fișierul de audit financiar generat automat demonstrează discrepanța dintre încasările reale din PSP și sumele declarate.
- **REMEDIU:** Recalcularea automată a bazei la valoarea corectă; penalități contractuale de 0.1% pe zi de întârziere pentru sumele nedeclarate.
- **LIMITĂ JURIDICĂ:** Necesită acces la datele reale de la procesatorul de plăți (Stripe/bancă) prin dreptul de audit contractual.
- **LIMITĂ TEHNICĂ:** Dacă operatorul falsifică extrasele bancare offline, frauda este detectată abia la auditul contabil independent.

---

### SCENARIUL 3: Administratorul modifică manifestul fără semnătură sau resemnează unilateral
- **Descriere:** Administratorul încearcă să modifice regulile constituționale sau hash-urile documentelor fără a obține semnăturile necesare.
- **PREVENȚIE:** Manifestul este protejat prin semnături asimetrice Ed25519; orice modificare a conținutului invalidează hash-ul `contentHash(manifest.content)`.
- **DETECȚIE:** `verifyManifest()` recalculează hash-ul și verifică semnăturile. Dacă hash-ul diferă de cel semnat, returnează `valid: false, reason: "insufficient valid signatures"`.
- **DOVADĂ:** Semnătura matematică nu mai corespunde conținutului nou; cheia publică a atacatorului (dacă semnează singur) nu se regăsește în setul de chei autorizate cu prag multi-sig (2 din 2).
- **REMEDIU:** Respingerea manifestului de către nodurile de rețea și clienții web; revenirea la ultimul snapshot valid semnat.
- **LIMITĂ JURIDICĂ:** Semnătura electronică calificată conferă valoare probatorie deplină conform Regulamentului eIDAS / Legii 455/2001.
- **LIMITĂ TEHNICĂ:** Dacă un atacator obține acces la toate cheile private din schemă, sistemul tehnic nu mai poate distinge o semnare legitimă de una compromisă (de aceea se folosesc chei distincte fizic).

---

### SCENARIUL 4: Atacatorul încearcă să schimbe adresa de plată Exodus
- **Descriere:** Un atacator compromite un cont de admin și introduce propria adresă crypto pentru a devia redevențele.
- **PREVENȚIE:** `packages/genesis-integrity/src/beneficiary.ts` impune politica `evaluateApprovals` cu minim 2 aprobări independente din roluri distincte (`custodian` + `commercialOperator`), cu interdicția strictă a auto-aprobării (`initiator !== approver`).
- **DETECȚIE:** Orice tentativă de schimbare fără cvorumul complet sau cu format invalid de adresă regex (`^0x[0-9a-fA-F]{40}$`) aruncă eroare `payout address change rejected`.
- **DOVADĂ:** Istoricul `addressHistory` este append-only și păstrează timestamp-ul, vechea adresă, noua adresă propusă și ID-urile aprobatorilor.
- **REMEDIU:** Tranzacția este blocată înainte de orice virament; notificarea automată a Fondatorului și Custodelui.
- **LIMITĂ JURIDICĂ:** Plățile efectuate către o adresă malițioasă constituie infracțiunea de fraudă informatică (art. 249 Cod Penal).
- **LIMITĂ TEHNICĂ:** Timelock-ul de 72h este necesar în implementarea on-chain pentru a permite intervenția umană în caz de coluziune extremă.

---

### SCENARIUL 5: Operatorul mută încasările către o filială sau o companie afiliată
- **Descriere:** Operatorul facturează utilizatorii printr-o companie satelit (offshore sau afiliată) susținând că STUPUL SRL nu a avut încasări.
- **PREVENȚIE:** Definiția contractuală extinsă a Încasărilor Eligibile include obligatoriu `affiliatedReceipts` și `relatedPartyRevenue` (anti-diversion).
- **DETECȚIE:** `reconcileTransaction()` adună automat veniturile raportate ale afiliaților în `totalCollected`.
- **DOVADĂ:** Contractele de prestări servicii dintre afiliați, datele de trafic web din telemetrie și tranzacțiile de licențiere.
- **REMEDIU:** Atragerea răspunderii solidare a societății-mamă și a afiliaților; aplicarea clauzei penale pentru deturnare de fonduri.
- **LIMITĂ JURIDICĂ:** Necesită acțiune judiciară pentru ridicarea vălului corporativ (*piercing the corporate veil*) conform art. 193 alin. (2) Cod Civil.
- **LIMITĂ TEHNICĂ:** Codul nu poate ști automat ce sume au intrat într-un cont bancar extern neconectat la API; depinde de auditul fiscal și accesul la gateway-ul comercial.

---

### SCENARIUL 6: Operatorul vinde proiectul către o altă companie
- **Descriere:** Operatorul inițial transferă toate activele către un terț cumpărător.
- **PREVENȚIE:** Contractul de cesiune (Art. 5) interzice transferul fără semnarea prealabilă a Acordului de Aderare (Deed of Adherence) de către noul cumpărător.
- **DETECȚIE:** Jurnalul de audit și registrul de transfer GENESIS detectează schimbarea operatorului; dacă nu există certificat semnat de Custode, transferul este marcat „NEAUTORIZAT”.
- **DOVADĂ:** Înscrisurile de la Registrul Comerțului / contractul de vânzare de active (asset purchase agreement).
- **REMEDIU:** Operatorul inițial rămâne garant solidar pentru toate datoriile cumpărătorului; Fondatorul poate cere executarea silită a oricăreia dintre părți.
- **LIMITĂ JURIDICĂ:** Cumpărătorul care utilizează activul fără a adera la contract poate fi acționat direct în contrafacere de drept de autor.
- **LIMITĂ TEHNICĂ:** Transferul corporativ are loc în lumea fizică/juridică; sistemul tehnic reflectă starea prin emiterea sau refuzul certificatului digital de transfer.

---

### SCENARIUL 7: Noul cumpărător refuză plata redevenței
- **Descriere:** Cumpărătorul afirmă: „Eu am cumpărat de la Operatorul 1, nu am niciun contract semnat cu Fondatorul, deci nu plătesc nimic”.
- **PREVENȚIE:** Cesiunea inițială include condiția rezolutorie: neplata redevenței atrage desființarea de plin drept a drepturilor de exploatare.
- **DETECȚIE:** Funcția `assessProductRoyaltyObligation()` din `@stupul/domain` clasifică exploatarea: fără contract valabil și fără respectarea redevenței, utilizarea codului și a mărcii este „PROPRIETARY ASSETS UNLICENSED USE”.
- **DOVADĂ:** Lipsa plății în registrul Exodus / lipsa Acordului de Aderare corelată cu distribuirea publică continuă a jocului.
- **REMEDIU:** Ordonanță președințială de interzicere a comercializării (art. 139 Legea 8/1996), poprire asigurătorie pe conturile din platformele de distribuție (Steam, App Store) și daune-interese.
- **LIMITĂ JURIDICĂ:** Durata procedurilor judiciare până la obținerea unei hotărâri executorii (atenuată prin procedura ordonanței președințiale).
- **LIMITĂ TEHNICĂ:** Notificarea platformelor de hosting / CDN (Cloudflare, GitHub) prin cerere DMCA de retragere pentru lipsă de licență valabilă.

---

### SCENARIUL 8: Operatorul comercializează o versiune derivată fără licență
- **Descriere:** Operatorul redenumește jocul, schimbă grafica și susține că este un joc complet nou, pentru a nu plăti 5%.
- **PREVENȚIE:** Contractul de cesiune acoperă expres toate versiunile derivate, adaptările și extensiile care încorporează elemente din codul sursă sau arhitectura STUPUL.
- **DETECȚIE:** Compararea codului sursă determinist (`@stupul/engine`, algoritmii apeductului, reducerul matematic) și analiza structurală a bazei de date.
- **DOVADĂ:** Raport de expertiză tehnică informatică care demonstrează derivarea directă din codul original STUPUL.
- **REMEDIU:** Includerea automată a tuturor încasărilor versiunii derivate în baza de calcul a redevenței, plus daune morale și materiale.
- **LIMITĂ JURIDICĂ:** Dreptul de autor nu protejează ideile pure sau genul de joc, ci expresia concretă (cod, structură originală, text, grafică).
- **LIMITĂ TEHNICĂ:** Dacă jocul este rescris 100% de la zero (clean-room reimplementation) fără a utiliza nicio linie de cod sau marcă STUPUL, conform regulii LEG-T04 acesta nu datorează redevență.

---

### SCENARIUL 9: Operatorul încalcă obligația de raportare (date corupte sau absente)
- **Descriere:** Operatorul refuză să trimită rapoartele lunare sau transmite fișiere trunchiate cu valori negative/NaN.
- **PREVENȚIE:** Modulul de reconciliere validează fiecare intrare; dacă parametrii nu sunt numere finite pozitive, aruncă eroare imediată (fail-closed).
- **DETECȚIE:** Monitorul de reconciliere semnalează absența raportului la împlinirea scadenței lunare (termen: data de 15 a fiecărei luni).
- **DOVADĂ:** Lipsa intrărilor semnate în `AppendOnlyAuditLog` pentru luna respectivă.
- **REMEDIU:** Notificare formală cu termen de remediere de 15 zile; calcularea din oficiu a unei redevențe prezumate egale cu media ultimelor 3 luni de exploatare, până la auditul complet.
- **LIMITĂ JURIDICĂ:** Instanța poate ordona prezentarea silită a documentelor contabile sub sancțiunea amenzilor cominatorii.
- **LIMITĂ TEHNICĂ:** Sistemul nu poate forța un server oprit să trimită pachete; reacționează prin marcarea stării ca „NEVERIFICAT / BLOCAT”.

---

### SCENARIUL 10: Operatorul închide serviciul brusc
- **Descriere:** Operatorul abandonează infrastructura și închide serverele.
- **PREVENȚIE:** Baza de date a orașului este portabilă (SQLite/D1), iar starea este stocată în mod autoritativ și versionat.
- **DETECȚIE:** Verificatorul HTTP `/api/health` raportează lipsa conexiunii.
- **DOVADĂ:** Ultimul snapshot valid descărcat și jurnalul de evenimente salvat local.
- **REMEDIU:** Custodele Independent sau Comunitatea activează procedura de preluare (*step-in rights*); se restaurează ultimul snapshot pe o infrastructură nouă; redevențele datorate pentru perioada activă rămân creanțe certe.
- **LIMITĂ JURIDICĂ:** Dacă societatea comercială a fost dizolvată fără active, recuperarea fondurilor restante poate fi dificilă în absența unei garanții personale.
- **LIMITĂ TEHNICĂ:** Dacă nu există un backup recent în afara serverului operatorului, se pierde starea recentă; de aceea se recomandă replicarea automată a snapshot-urilor către Custode.

---

### SCENARIUL 11: Operatorul este în insolvență
- **Descriere:** Operatorul intră în procedură de reorganizare judiciară sau faliment.
- **PREVENȚIE:** Contractul stipulează că sumele colectate pentru redevență sunt deținute în mandat fiduciar / escrow comercial separat de fondurile generale de operare.
- **DETECȚIE:** Înscrierea operatorului în Buletinul Procedurilor de Insolvență (BPI).
- **DOVADĂ:** Înscrisurile din registrul de audit și evidența reconcilierilor lunare atestă creanța certă, lichidă și exigibilă.
- **REMEDIU:** Declararea creanței la masa credală; dacă administratorul judiciar nu confirmă continuarea contractului, drepturile de exploatare revin Custodelui pentru a fi transmise unui nou operator capabil de plată.
- **LIMITĂ JURIDICĂ:** Legea insolvenței (85/2014) suspendă acțiunile individuale de executare silită; protecția constă în oprirea transmiterii licenței și recuperarea activului IP.
- **LIMITĂ TEHNICĂ:** Sistemul informatic nu controlează distribuția masei credale de către judecătorul sindic.

---

### SCENARIUL 12: Cheia de semnare este compromisă
- **Descriere:** Cheia privată a unui semnatar al manifestului este sustrasă sau expusă public.
- **PREVENȚIE:** Nu se stochează chei private în repository; scriptul `royalty_guard.cjs` blochează orice fișier care conține headere PEM de chei private.
- **DETECȚIE:** Detectarea utilizării cheii în semnături anormale sau raportarea compromiterii de către deținător.
- **DOVADĂ:** Notificare semnată de revocare a cheii publice respective.
- **REMEDIU:** Procedura de rotire a cheilor: manifestul nou este semnat cu noua pereche de chei, iar vechea cheie este înscrisă în lista de revocare (`revokedKeys`). Verificatorul acceptă doar cheile valide actualizate.
- **LIMITĂ JURIDICĂ:** Actele semnate anterior compromiterii își păstrează valabilitatea dacă poartă marcă temporală calificată (*timestamping*).
- **LIMITĂ TEHNICĂ:** Cheile noi trebuie distribuite clienților prin update software sau prin intermediul unui canal securizat de încredere (DNSSEC/HTTPS).

---

### SCENARIUL 13: Administratorul controlează simultan mai multe roluri (coluziune internă)
- **Descriere:** Aceeași persoană controlează simultan contul de Custode și pe cel de Operator Comercial, încercând să aprobe modificări netransparente.
- **PREVENȚIE:** Algoritmul `evaluateApprovals` impune cerința de independență (`independenceRequired: true`) și verifică explicit ca ID-urile semnatarilor să fie distincte și rolurile să nu se suprapună.
- **DETECȚIE:** Sistemul respinge aprobarea dacă detectează același `actorId` sau roluri incompatibile, returnând eroare de conflict de interese.
- **DOVADĂ:** Jurnalul de audit append-only înregistrează identitățile utilizate în încercarea de aprobare.
- **REMEDIU:** Invalidarea tranzacției; blocarea dreptului de vot al conturilor implicate până la clarificarea identității reale.
- **LIMITĂ JURIDICĂ:** În cazul persoanelor fizice interpuse (oameni de paie), coluziunea se probează prin analiza legăturilor de familie, asocieri de afaceri sau transferuri bancare.
- **LIMITĂ TEHNICĂ:** Un sistem criptografic nu poate detecta dacă două chei private distincte sunt deținute fizic de aceeași persoană în absența unui proces KYC sau a unei verificări umane.

---

### SCENARIUL 14: Contractele și versiunile au date incompatibile (atac cronologic / rollback)
- **Descriere:** Un operator încearcă să impună o versiune veche a manifestului (cu alte condiții) sau furnizează date financiare din trecut pentru a crea confuzie.
- **PREVENȚIE:** Manifestul utilizează secvențiere strict monotonică (`seq: number` incrementat strict la fiecare pas) și legare prin hash a versiunii anterioare (`contentHashBefore === prevHash`).
- **DETECȚIE:** `appendManifestChange()` verifică continuitatea hash-urilor. O versiune cu secvență inferioară sau cu hash anterior necorespunzător este respinsă de clienți.
- **DOVADĂ:** Discrepanța din lanțul criptografic al jurnalului de modificări.
- **REMEDIU:** Respingerea stării modificate; solicitarea explicită a versiunii de la nodul cu cel mai mare număr de secvență validat.
- **LIMITĂ JURIDICĂ:** Principiul *lex posterior derogat priori* (actul ulterior valabil înlocuiește actul anterior).
- **LIMITĂ TEHNICĂ:** Sincronizarea ceasurilor de rețea (NTP) este necesară pentru a preveni abaterile minore de timestamp între servere diferite.

---

## Concluzie Generală a Analizei

Sistemul de securitate GENESIS v3.1 asigură că orice încercare de eludare a redevenței de 5%:
1. **Este detectată instantaneu** de mecanismele software deterministe;
2. **Lasă o urmă nestergibilă** în jurnalele de audit append-only;
3. **Activează pârghiile juridice depline**: răspundere contractuală solidară, clauze penale, acțiune în contrafacere și pact comisoriu de desființare a licenței.
