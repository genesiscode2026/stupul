# Verificarea Fluxului de Plată a Redevenței Pasive de 5% și Registrul de Arierate

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **VERIFICAT ȘI DEMONSTRAT PRIN TESTE AUTOMATE**  

---

## 1. Formula Matematică Exactă (500 Basis Points)

Pentru a elimina erorile de rotunjire cauzate de standardul IEEE 754 (numere în virgulă mobilă), calculele de decontare financiară se realizează exclusiv pe unități întregi monetare (cenți, bani) folosind sistemul de **Basis Points (1 bp = 0.01%, 500 bp = 5.00%)**.

$$\text{EligibleCents} = \max\left(0, \text{GrossCents} + \text{AffiliatedCents} - \text{PermittedDeductionsCents}\right)$$

$$\text{RoyaltyGrossCents} = \left\lfloor \frac{\text{EligibleCents} \times 500}{10\,000} + 0.5 \right\rfloor$$

$$\text{NetPayableCents} = \text{RoyaltyGrossCents} - \text{WithholdingTaxCents}$$

---

## 2. Clasificarea Deducerilor

| Categorie | Permisă la Scădere? | Justificare Juridică |
|---|---|---|
| Taxa pe Valoarea Adăugată (TVA / Sales Tax) | **DA** | Sume colectate în numele statului, nu reprezintă venit al operatorului |
| Rambursări Clienți (Refunds) | **DA** | Tranzacții anulate din care operatorul nu a păstrat fonduri |
| Fraudă Card / Chargebacks | **DA** | Fonduri retrase forțat de băncile emitente |
| Comisioane Directe Procesator (ex. Stripe 2.9%) | **DA** | Cost tehnic direct și inerent colectării banilor |
| Venituri din Firme Afiliate (OpCo / IPCo) | **ADĂUGATE FORȚAT** | Previne ascunderea încasărilor prin subsidiare externe |
| Salarii Directori / Conducere | **INTERZISĂ STRICT** | Cheltuială operațională internă (LEG-T03) |
| Chirie Birouri / Spații Fizice | **INTERZISĂ STRICT** | Cheltuială de regie generală |
| Facturi Server Cloud (AWS / Vercel) | **INTERZISĂ STRICT** | Cost de infrastructură ce trebuie acoperit din marja operatorului (95%) |
| Bugete de Marketing / Reclame | **INTERZISĂ STRICT** | Decizie discreționară de creștere a operatorului |

---

## 3. Destinația Oficială de Decontare a Redevenței

În conformitate cu Invariantul din `VELQIRIS_PAYMENT_RAIL_LAW.md`, canalul autorizat pentru decontarea redevenței este:

- **Activ Monetar**: USDC (USD Coin)
- **Rețea Blockchain**: BASE (Layer 2 Ethereum)
- **Adresă Portofel Fondator**: `0xC6F86e170411182114FcCdb28793dC76B5e8D144`

Plățile pot fi de asemenea achitate în monedă fiduciară (USD, EUR, RON) în contul bancar comercial specificat în contractul bilateral bilateral asumat.

---

## 4. Ciclul de Viață al Arieratelor (Arrears Ledger Lifecycle)

Fiecare factură lunară parcurge următoarele etape automate conform implementării din `packages/domain/src/royalties.ts`:

1. **Emitere Factură (Ziua 0)**: Scadență la 30 de zile. Status: `pending`. Licență: `good_standing`.
2. **Plată Efectuată (Înainte de Ziua 30)**: Înregistrare chitanță/txHash. Status: `paid`. Licență: `good_standing`.
3. **Întârziere 1 - 15 zile (Grace Period)**: Notificare amiabilă. Status: `grace_period`. Dobândă penalizatoare: 0%.
4. **Întârziere 16 - 60 zile (Default Warning)**: Se acumulează dobândă legală penalizatoare de **50 bp pe lună (6% anual)**. Status: `default_warning`.
5. **Întârziere > 60 zile (License Suspended)**: Licența comercială de exploatare este **suspendată de drept**. Operatorul își pierde dreptul de a monetiza jocul STUPUL, iar litigiul este transmis instanțelor competente.
