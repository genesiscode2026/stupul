# STUPUL GENESIS v1.1 — Raport de Analiză și Reconciliere a Contradicțiilor

Data: 23.10.2026
Statut: RECONCILIAT ȘI FIXAT ÎN ARHITECTURĂ

## 1. Principiul Suprem de Reconciliere
Conform `00_START/EXECUTION_ORDER.md` și `00_START/ANTIGRAVITY_MASTER_DIRECTIVE.md`:
> **Ierarhia normativă:**
> Lege aplicabilă > Siguranță utilizator/date > GENESIS v1.1 > GENESIS v1.0 > Design propus de asistent AI.

---

## 2. Contradicții Identificate și Decizii Adoptate

### Contradicția 1: Drepturi de proprietate virtuală vs. Proprietate civilă reală
- **Tensiune detectată:** V1.0 menționa achiziția de „proprietăți” și „parcele”, ceea ce ar putea induce un utilizator în eroare că dobândește un bun imobiliar sau un titlu financiar recunoscut juridic.
- **Soluție adoptată (V1.1, STP-008 & T-019):** Toate parcelele și clădirile sunt active pur virtuale interne jocului (`inGameOnly: true`). Nu există niciun transfer imobiliar civil, niciun token comercial speculativ și nicio promisiune de convertibilitate în bani reali. Termenii sunt clar afișați în interfață („Parcelă Virtuală STUPUL”).

### Contradicția 2: Votul contributorilor la scară mică vs. Ponderea meritului ponderat
- **Tensiune detectată:** În formulele matematice, dacă există 3-5 contribuitori și se aplică ponderea de maxim 5%, suma ponderilor nu poate ajunge la 100%, blocând cvorumul sau favorizând voturi nule.
- **Soluție adoptată (V1.1, GOV-020 & GOV-T06, GOV-T07):**
  - Pentru număr de contribuitori eligibili `< 20`: vot egal (1 om = 1 vot în Camera Contributorilor).
  - Pentru număr de contribuitori eligibili `>= 20`: se activează calculul meritului activ cu plafonare strictă la maximum 5% per persoană, iar restul se redistribuie proporțional.
  - Dacă sub 7 contribuitori independenți există pe un proiect, camera devine consultativă pentru a preveni votul de grup/cartel.

### Contradicția 3: Baza de calcul a redevenței de 5%
- **Tensiune detectată:** Unele formulări informale din discuții vorbeau de „5% din profit”, în timp ce contractele stricte impun procent din venituri nete eligibile (pentru a evita mascarea profitului prin salarii, marketing exagerat sau cheltuieli de regie).
- **Soluție adoptată (V1.1, LEG-001, LEG-T01, LEG-T02):**
  - Formula contractuală este fermă: `EligibleReceipts = GrossCollected - Taxes - Refunds - Chargebacks - DirectProcessorFees`.
  - Cheltuielile generale, salariile, chiriile și marketingul **nu** reduc baza eligibilă.
  - Redevența fondatorului este: `EligibleReceipts * 0.05`.

### Contradicția 4: Suveranitatea societății comerciale vs. Guvernanța lumii virtuale
- **Tensiune detectată:** Un acționar care deține 100% din firma operatoare (SRL) ar putea pretinde controlul total asupra legilor din joc sau asupra rezultatului alegerilor primarului.
- **Soluție adoptată (V1.1, DEC-003, GOV-001, GOV-T02):**
  - Separarea strictă a celor patru puteri:
    1. Lumea virtuală și legile jocului (Cetățeni + Contribuitori).
    2. Dezvoltarea tehnică și calitatea codului (Contribuitori).
    3. Societatea comercială operatoare (administrează afacerea, răspunde legal și fiscal).
    4. Custodele independent (deține marca, domeniul și supraveghează licența).
  - Acțiunile din firma SRL conferă **0 voturi suplimentare** în consiliul din joc.

### Contradicția 5: Protecția anti-deturnare vs. Limitele dreptului de autor (CJUE C-406/10)
- **Tensiune detectată:** O intenție inițială ar fi putut presupune că oricine creează un joc similar pe internet ar datora automat 5% fondatorului.
- **Soluție adoptată (V1.1, DEC-006, LEG-T04, ANTI_DIVERSION.md):**
  - Dreptul de autor nu protejează ideea abstractă a unui oraș democratic sau mecanicile de joc pure fără active copiate (conform jurisprudenței CJUE C-406/10).
  - Redevența de 5% se aplică contractual exclusiv operatorilor autorizați, licențiaților și produselor derivate care utilizează activele originale protejate sau marca/domeniul concesionat.

### Contradicția 6: Verificarea disponibilității mărcii STUPUL
- **Tensiune detectată:** V1.0 folosea denumirea ca certă.
- **Soluție adoptată (V1.1, P0):** Numele STUPUL este utilizat în stadiu de dezvoltare și prototipare. Nu se declară marca comercială drept „înregistrată oficial” până la verificarea formală la OSIM/EUIPO și avizul juridic aferent la Legal Gate L1.
