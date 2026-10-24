# FLUXURI DE PLATĂ CĂTRE PORTOFELUL EXODUS ȘI REGISTRUL BENEFICIARULUI
## Arhitectură Tehnică & Financiară — G-004
**Versiune:** GENESIS v3.1  
**Data:** 24 Octombrie 2026  
**Document:** `docs/FLUXURI_PLATA_EXODUS_SI_REGISTRU_BENEFICIAR_V3_1.md`

---

## 1. Principiul Călăuzitor: Fondator Pasiv & Securitate Maximă

Fondatorul nu participă la operațiunile zilnice, nu emite facturi manuale lunare și nu administrează infrastructura comercială.  
Redevența fixă de 5% din Încasările Nete Eligibile trebuie transferată **în mod automat sau asistat-automatizat** către adresa publică a portofelului Exodus desemnat valabil de către Fondator.

> [!CAUTION]
> **REGULĂ DE AUR PRIVIND SECURITATEA CRYPTO:**  
> - NICIODATĂ nu se solicită, nu se stochează și nu se introduce în cod seed phrase-ul (cele 12/24 de cuvinte) sau cheia privată a portofelului Exodus!  
> - Se utilizează **exclusiv adresa publică** de recepție (adresa publică 0x... pentru rețele EVM/Base sau adresa corespunzătoare blockchain-ului convenit).  
> - În mediul de dezvoltare nu se efectuează tranzacții reale pe bani reali.

---

## 2. Arhitectura celor Două Fluxuri Financiare

```
                              ┌─────────────────────────┐
                              │     SURSA VENITURILOR   │
                              └────────────┬────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
                    ▼                                             ▼
       ┌────────────────────────┐                    ┌────────────────────────┐
       │   FLUX A: ON-CHAIN     │                    │    FLUX B: FIAT / PSP  │
       │   (Web3 / Criptoactiv) │                    │   (Card / Bancar / App)│
       └────────────┬───────────┘                    └────────────┬───────────┘
                    │                                             │
                    ▼                                             ▼
       ┌────────────────────────┐                    ┌────────────────────────┐
       │ Smart Contract Splitter│                    │ Decontare Lunar PSP    │
       │ (0xSplits / Base L2)   │                    │ (Stripe / Steam / App) │
       └──────┬──────────┬──────┘                    └────────────┬───────────┘
              │          │                                        │
        5%    │          │ 95%                                    ▼
        Auto  │          │                               ┌────────────────────────┐
              ▼          ▼                               │ Reconciliere G-002     │
       ┌───────────┐ ┌──────────┐                        │ (genesis-integrity)    │
       │ EXODUS    │ │Trezorerie│                        └────────────┬───────────┘
       │ FONDATOR  │ │Comunitate│                                     │
       └───────────┘ └──────────┘                                     ▼
                                                         ┌────────────────────────┐
                                                         │ Payout USDC via Base / │
                                                         │ Virament Bancar Direct │
                                                         └────────────┬───────────┘
                                                                      │ 5% Net
                                                                      ▼
                                                         ┌────────────────────────┐
                                                         │    EXODUS FONDATOR     │
                                                         └────────────────────────┘
```

---

## 3. Detalierea Fluxurilor

### 3.1. FLUX A — Venituri On-Chain (Automatizare Nativă)
- **Caz de utilizare:** Dacă operatorul oferă servicii de bunuri virtuale sau abonamente decontate direct în stablecoin (USDC).
- **Mecanism:** Smart contract de tip **Payment Splitter** (standard auditat deschis, ex. contractul 0xSplits pe rețeaua Base L2 — comisioane de fracțiuni de cent).
- **Proporție fixă:**
  - `0.05 (5%)` direcționat instantaneu către adresa publică Exodus a Fondatorului.
  - `0.95 (95%)` direcționat către adresa Trezoreriei sau a Operatorului.
- **Avantaj:** Operatorul nu poate opri, redirecționa sau întârzia plata pentru tranzacțiile procesate prin acest contract.

### 3.2. FLUX B — Venituri Fiat (Card, Bănci, Magazine de Aplicații)
- **Caz de utilizare:** Încasări tradiționale prin Stripe, PayPal, Apple App Store, Google Play Store sau transferuri bancare directe.
- **Pasul 1 — Agregare & Deduplicare:** Încasările brute sunt centralizate la finele lunii calendaristice.
- **Pasul 2 — Reconciliere Deterministică:** Se rulează funcția `reconcileBatch()` din `@stupul/genesis-integrity`, aplicând formula strictă:
  $$\text{EligibleReceipts} = \text{Gross} - \text{Taxes} - \text{Refunds} - \text{Chargebacks} - \text{DirectFees}$$
  $$\text{FounderRoyalty} = \text{EligibleReceipts} \times 0.05$$
- **Pasul 3 — Decontare & Payout:**
  - Operatorul utilizează un serviciu autorizat de crypto-payout (ex. Stripe Crypto Payouts / Circle Corporate) pentru a converti suma exactă datorată în USDC și a o trimite pe rețeaua Base către adresa publică Exodus;
  - *Alternativă legală:* Dacă legislația fiscală locală sau restricțiile bancare impun decontare fiat clasică, Operatorul virează suma echivalentă în EUR/USD/RON prin transfer bancar SEPA/SWIFT în contul indicat de Fondator.
- **Garanție de creanță:** Dacă o plată eșuează din motive tehnice ale rețelei, creanța **NU se stinge**. Ea rămâne înregistrată în jurnalul de audit ca datorie exigibilă, purtătoare de penalități contractuale.

---

## 4. Registrul Beneficiarului & Protecția Anti-Deturnare

Pentru a garanta că niciun hacker, administrator corupt sau operator unic nu poate schimba adresa de destinație a redevenței, `packages/genesis-integrity/src/beneficiary.ts` impune politica **MULTI-SIG CU INDEPENDENȚĂ**:

```typescript
export interface BeneficiaryRecord {
  beneficiaryId: string;
  label: string;
  publicPayoutAddress: string; // Exclusiv adresă publică 0x...
  network: 'Base' | 'Ethereum' | 'Arbitrum';
  asset: 'USDC';
  verificationStatus: 'verified' | 'pending_verification';
  addressHistory: Array<{
    atIso: string;
    previousAddress: string;
    newAddress: string;
    approvalIds: string[];
    reason: string;
  }>;
}
```

### Reguli de Securitate pentru Schimbarea Adresei:
1. **Cererea expresă a Beneficiarului:** Numai Fondatorul (autentificat prin canal securizat / semnătură digitală asimetrică) poate propune o nouă adresă publică.
2. **Minim 2 aprobări independente:** Schimbarea este validată de Custodele Independent și de Operatorul Tehnic (fără ca aceeași entitate să cumuleze rolurile).
3. **Format validat strict:** Verificare de integritate regex (`^0x[0-9a-fA-F]{40}$`) și checksum EIP-55.
4. **Trasabilitate istorică completă:** Fiecare modificare este stocată în jurnalul audit append-only, prevenind ștergerea dovezilor.

---

## 5. Matricea de Răspundere și Conformare Fiscală

| Element | Responsabil | Garanție |
| :--- | :--- | :--- |
| Colectare TVA / Taxe indirecte | Operatorul Comercial | Se deduc conform legii din Gross Receipts. |
| Impozit pe venit / Reținere la sursă | Operator & Fondator | Reținere la sursă dacă legea aplicabilă impune, cu remiterea dovezii fiscale către Fondator. |
| Taxe de tranzacție blockchain (Gas) | Operatorul Comercial | Suportate integral de Operator la inițierea payout-ului. |
| Dovada de plată (Transaction Hash) | Operatorul Comercial | Se înscrie în raportul lunar de audit financiar. |
