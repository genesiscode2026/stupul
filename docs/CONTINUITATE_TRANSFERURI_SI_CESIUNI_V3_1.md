# CONTINUITATEA OBLIGAȚIEI DE REDEVENȚĂ LA FIECARE TRANSFER
## Arhitectură Contractuală și Mecanisme Juridice — G-003
**Versiune:** GENESIS v3.1  
**Data:** 24 Octombrie 2026  
**Document:** `docs/CONTINUITATE_TRANSFERURI_SI_CESIUNI_V3_1.md`  
**Rol:** Senior Legal & Systems Architect Review

---

## 1. Obiectivul Prioritar & Provocarea Juridică

Fondatorul dorește să transmită integral drepturile patrimoniale și exploatarea proiectului STUPUL către operatori independenți, păstrând **exclusiv un drept economic pasiv de 5%** din încasările nete eligibile.

**Problema juridică cheie:**  
Potrivit principiului relativității efectelor contractului (*res inter alios acta, aliis neque nocet neque prodest* — art. 1280 Cod Civil român / principiu universal de drept civil și common law), un contract încheiat între Fondator și Operatorul 1 nu îl obligă automat pe un terț (Cumpărătorul / Operatorul 2) care achiziționează activele sau codul, în absența unui mecanism juridic expres de preluare de datorie, stipulație sau acord de aderare.

Simpla publicare a unui manifest tehnic (sau a fișierului GENESIS) pe GitHub/internet **NU creează automat o servitute reală sau o obligație opozabilă *erga omnes*** împotriva oricărui terț din lume.

Prin urmare, protecția maximă executabilă juridic și tehnic se obține printr-un **lanț contractual neîntrerupt de asumare și garanții încrucișate**.

---

## 2. Cele 17 Puncte de Investigație & Proiectare Arhitecturală

### 1. Cesiune patrimonială cu remunerație procentuală
- Cesiunea drepturilor de autor se structurează nu cu preț forfetar unic, ci cu remunerație proporțională cu încasările din exploatare (art. 43 din Legea 8/1996).
- Acest caracter proporțional leagă remunerația direct de fluxul economic al operei, indiferent de volumul vânzărilor.

### 2. Clauză obligatorie de preluare a obligațiilor (Assumption Clause)
- În orice contract de transfer, vânzare de active, aport la capital sau cesiune încheiat de Operatorul curent, este obligatorie inserarea următoarei clauze:  
  *„Dobânditorul ia act de existența obligației contractuale de remunerație pasivă de 5% datorată Fondatorului inițial STUPUL și își asumă în mod expres, direct și necondiționat executarea acesteia conform termenilor GENESIS v3.1.”*

### 3. Acorduri de aderare ale dobânditorilor (Deed of Adherence)
- Finalizarea oricărui transfer de acțiuni, active sau drepturi de exploatare este condiționată suspensiv de semnarea de către dobânditor a unui **Acord de Aderare** direct cu Beneficiarul redevenței / Custodele independent.

### 4. Stipulație pentru altul (art. 1284-1288 Cod Civil)
- Contractul dintre Operatorul 1 și Operatorul 2 este redactat expres ca o stipulație pentru altul în favoarea Fondatorului/Beneficiarului.
- Fondatorul dobândește un drept propriu și direct de a pretinde plata direct de la Operatorul 2 de la data încheierii transferului.

### 5. Obligații directe către beneficiarul redevenței
- Prin acceptarea stipulației sau prin Acordul de Aderare, Operatorul 2 se obligă direct și nemijlocit față de Fondator, eliminând necesitatea intermedierii de către Operatorul 1.

### 6. Sublicențiere condiționată
- Orice licență sau sublicență acordată de Operator partenerilor comerciali include clauza că redevența de 5% se calculează și se virează din sumele colectate de sublicențiat sau de Operator de la sublicențiat, fără sustragere prin societăți afiliate.

### 7. Garanții pentru plata redevențelor
- Posibilitatea stipulării unor garanții reale mobiliare (gaj pe veniturile din conturile de încasare PSP) sau garanții corporative de la societatea-mamă a dobânditorului.

### 8. Custodie contractuală independentă
- Un terț de încredere (societate de administrare drepturi, casă de avocatură, escrow agent profesional) este mandatat să țină evidența contractelor și să certifice fiecare transfer.

### 9. Escrow financiar
- În cazul încasărilor mari sau a vânzării proiectului către un investitor, prețul de vânzare este parcat într-un cont escrow până la confirmarea calculului și a virării cotei de 5% cuvenite Fondatorului.

### 10. Raportare financiară independentă
- Obligația operatorului de a oferi acces în citire la panoul procesatorului de plăți (Stripe/PayPal/App Store read-only dashboard) sau rapoarte contabile certificate trimestrial.

### 11. Audit și drepturi de verificare
- Dreptul Fondatorului sau al unui auditor financiar de a inspecta registrele financiare ale proiectului cu un preaviz de 15 zile, costul auditului fiind suportat de Operator dacă se constată discrepanțe mai mari de 3%.

### 12. Mecanisme de despăgubire (Indemnification)
- Operatorul care transferă proiectul fără a obține acordul de preluare al dobânditorului este obligat la despăgubiri integrale, evaluate minim la valoarea estimată a redevențelor pe următorii 5 ani de exploatare.

### 13. Răspunderea contractuală a cedentului pentru transferuri neconforme
- Dacă Operatorul 1 „vinde” pe ascuns codul sau activele către Operatorul 2 fără clauza de preluare:
  - **Operatorul 1 rămâne debitor direct și garant solidar** pentru toate redevențele datorate;
  - Fondatorul are împotriva Operatorului 1 o acțiune contractuală pentru neexecutare culpabilă, daune-interese și atragerea răspunderii delictuale solidare a administratorilor Operatorului 1.

### 14. Mecanisme de remediere și recuperare
- Termen de grație de 15 zile pentru corectarea rapoartelor eronate sau a întârzierilor de plată, urmat de penalități de întârziere contractuale egale cu dobânda legală penalizatoare + 5% pe an.

### 15. Tratarea insolvenței
- În caz de insolvență a Operatorului, dreptul la redevență este o creanță legată de exploatarea continuă; contractul stipulează că drepturile de exploatare încetează sau se transferă către Custode dacă administratorul judiciar nu execută contractul conform art. 123 din Legea 85/2014 privind insolvența.

### 16. Tratarea fuziunilor și reorganizărilor
- În caz de fuziune, divizare sau reorganizare judiciară, datoriile și contractele se transmit universal sau cu titlu universal către societatea absorbantă / beneficiară (art. 236 și urm. Legea societăților 31/1990).

### 17. Încetarea ori rezilierea pentru neplată
- Dacă un operator refuză plata redevenței și nu remediază în termenul de notificare, contractul de cesiune/licență se desființează de plin drept prin pact comisoriu de gradul IV (fără punere în întârziere și fără intervenția instanței), orice utilizare ulterioară a codului și mărcii devenind contrafacere ilicită conform Legii 8/1996.

---

## 3. Certificatul Intern de Transfer Conform GENESIS

În sistemul tehnic STUPUL, orice schimbare de operator înregistrată în contract este reflectată într-un certificat digital:

```json
{
  "transferCertificateId": "STP-TRF-20261024-001",
  "version": "genesis-v3.1",
  "timestampIso": "2026-10-24T12:00:00Z",
  "transferorOperatorId": "operator-initial-srl",
  "transfereeOperatorId": "operator-succesor-ltd",
  "adherenceAgreementHash": "sha256-deed-of-adherence-executed-pdf-hash",
  "royaltyObligationAcknowledged": true,
  "royaltyRateBasisPoints": 500,
  "custodianSignatures": ["ed25519-sig-custodian"],
  "beneficiaryNotificationAcknowledged": true
}
```

> [!WARNING]
> **DELIMITARE JURIDICĂ FORMALĂ:**  
> Certificatul intern de transfer reprezintă o **dovadă tehnică de conformitate** stocată în jurnalul de audit append-only (`packages/genesis-integrity`).  
> El **NU înlocuiește contractul civil/comercial scris** semnat între părți, dar servește drept probă preconstituită irefutabilă în instanță că dobânditorul a cunoscut și a acceptat cadrul tehnic și financiar STUPUL.

---

## 4. Ce Creanțe Rămân dacă Operatorul Încalcă Regulile de Transfer?

Dacă un operator încearcă să vândă proiectul „fără redevență”:
1. **Creanță contractuală directă** împotriva operatorului vânzător pentru încălcarea obligației esențiale de a impune clauza de preluare.
2. **Răspundere solidară personală** a administratorilor operatorului pentru fraudă contractuală.
3. **Acțiune în contrafacere de drept de autor** împotriva noului cumpărător: deoarece cesiunea către cumpărător s-a făcut cu încălcarea condiției rezolutorii, cumpărătorul nu deține un titlu legal valid de exploatare, iar distribuirea jocului devine o încălcare a drepturilor patrimoniale.
4. **Acțiune pauliană (revocatorie)** conform art. 1562 Cod Civil pentru desființarea transferului fraudulos de active destinat sustragerii bazei de calcul a redevenței.

---

## 5. Concluzie

Prin îmbinarea celor 17 mecanisme, Fondatorul obține o plasă de siguranță multi-strat:
- **Tehnică:** Jurnal append-only, manifest Ed25519, rate de 5% ancorate în cod.
- **Contractuală:** Clauză de preluare, stipulație pentru altul, Acord de Aderare.
- **Procesuală:** Răspundere solidară a cedentului, clauze penale și pact comisoriu.
Fondatorul rămâne complet pasiv, nefiind obligat să semneze fiecare transfer ulterior dacă procedura de aderare este respectată.
