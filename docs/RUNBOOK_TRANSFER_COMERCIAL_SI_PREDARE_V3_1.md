# RUNBOOK DE PREDARE ȘI TRANSFER COMERCIAL AL PROIECTULUI STUPUL
## Procedură Operațională de Succesiune & Transferabilitate Totală — P10 (GENESIS v3.1)
**Versiune:** 3.1.0  
**Data:** 24 Octombrie 2026  
**Document:** `docs/RUNBOOK_TRANSFER_COMERCIAL_SI_PREDARE_V3_1.md`

---

## 1. Premisa de Independență a Fondatorului

În temeiul Directivei Master GENESIS v3.1:
- Fondatorul **nu dorește** să rămână legat de operarea zilnică a proiectului, nu este administrator, nu deține acțiuni obligatorii și nu oferă mentenanță tehnică continuă.
- Prezentul runbook asigură că orice operator comercial, investitor sau colectiv comunitar poate **prelua, menține, dezvolta și comercializa proiectul în deplină autonomie**.
- Singura condiție imperativă de transmitere este asumarea contractuală certă a **dreptului economic pasiv de 5%** din încasările nete eligibile (G-002, G-003).

---

## 2. Inventarul Elementelor Predate (Pachetul de Predare)

```
┌─────────────────────────────────────────────────────────────┐
│                    PACHETUL DE PREDARE STUPUL               │
├──────────────────────────────┬──────────────────────────────┤
│ 1. Codul Sursă & Arhitectură │ Repozitoriu Git complet      │
│ 2. Baza de Date & Snapshot   │ SQLite / D1 export + Events  │
│ 3. Infrastructură & Cloud    │ Wrangler config + Pages      │
│ 4. Domenii & Branding        │ Autorizare transfer registrar│
│ 5. Documentație & Licențe    │ PRD, Constituție, DCO, CLA   │
│ 6. Integritate & Redevență   │ Registru Beneficiar Exodus   │
│ 7. Garanție Contractuală     │ Acord de Aderare (Adherence) │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 3. Procedura Pas-cu-Pas a Transferului

### ETAPA 1 — Pregătirea Juridică & Semnarea Acordului de Aderare
1. Dobânditorul (Operatorul Succesor) semnează **Contractul de Cesiune** (`docs/CONTRACT_CESIUNE_DREPTURI_PATRIMONIALE_V3_1.md`) sau **Acordul de Aderare** (`docs/CONTINUITATE_TRANSFERURI_SI_CESIUNI_V3_1.md`).
2. Se confirmă în scris preluarea obligației de virare automată a redevenței de 5% către adresa publică Exodus a Fondatorului.
3. Custodele Independent verifică legalitatea documentelor și emite **Certificatul Intern de Transfer conform GENESIS**.

### ETAPA 2 — Transferul Infrastructurii & Serviciilor Tehnice
1. **GitHub Repozitoriu:** Transferul drepturilor de proprietate asupra organizației GitHub sau acordarea rolului de `Owner` către echipa noului operator.
2. **Cloudflare Account:** Transferul contului Cloudflare (Pages, Workers, D1, KV, DNS) către contul corporativ al noului operator.
3. **Rotirea Cheilor de Semnare:**
   - Operatorul generează propria pereche de chei Ed25519;
   - Manifestul este actualizat cu noul operator prin `appendManifestChange()`;
   - Se menține constanta neschimbată: `royaltyRateBasisPoints: 500`.

### ETAPA 3 — Predarea Bazei de Date & Integritatea Orașului
1. Exportul bazei de date active din Cloudflare D1 / SQLite:
   ```bash
   npx wrangler d1 export stupul-db-production --output=./runtime/backup-pre-transfer.sql
   ```
2. Verificarea integrității hash-ului de stare (`computeStateHash()`) pe ultimul tick.
3. Importul și verificarea restaurării pe infrastructura noului operator.

### ETAPA 4 — Activarea Gateway-ului Comercial & Reconciliere
1. Noul operator configurează propriul cont Stripe / Merchant PSP pentru încasarea fondurilor fiat.
2. Conectează adresa publică Exodus a Fondatorului în sistemul de payout automat (Stripe Crypto Payouts sau scriptul lunar de reconciliere batch).
3. Testarea unui ciclu complet de decontare cu sumă minimă pentru validarea fluxului de plată.

---

## 4. Declarația de Eliberare de Răspundere a Fondatorului

Odată semnat actul de cesiune și finalizată predarea:
- Fondatorul este **complet degrevat** de orice răspundere contractuală, delictuală, fiscală sau tehnică privind funcționarea jocului, disponibilitatea serverelor, pierderile de date ale jucătorilor sau disputele comerciale;
- Răspunderea integrală aparține exclusiv Operatorului Comercial activ;
- Dreptul economic de 5% rămâne neatins și independent de orice reorganizare viitoare a operatorului.
