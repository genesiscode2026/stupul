# STUPUL GENESIS v1.1 — Test al Călătoriei Utilizatorului (User Journey Test)

Data: 24.10.2026 · Auditor: Cline · Instrument: Chrome real + Puppeteer-core

## Fluxul complet al primei sesiuni (cele 10 etape)

| Pas | Acțiune utilizator | Rezultat observat | Statut |
|---|---|---|---|
| 1 | Intră în așezarea inițială | Orașul se desenează (canvas cu pixeli), resurse vizibile | ✅ |
| 2 | Primește misiunea | Banner „🎯 Misiune — AJUTĂ AȘEZAREA SĂ CREASCĂ" | ✅ |
| 3 | Colectează lemn (Muncă → „Tăiere Lemne") | +15 materiale, +8 V-Credits reale în economie | ✅ |
| 4 | Selectează o parcelă liberă | Clic pe parcelă → selecție | ✅ |
| 5 | Construiește o clădire | „Casă" pe parcela (4,4): -30 materiale, -20 V-Credits | ✅ |
| 6 | Clădirea apare vizual | `grid[4][4].building === 'house'` (redesenată pe hartă) | ✅ |
| 7 | Clădirea influențează simularea | TICK recalculează producție/populație/satisfacție | ✅ |
| 8 | Feedback vizibil | Toast de succes + misiunea avansează | ✅ |
| 9 | Continuă: câștigă, cumpără parcelă | „Ia Parcelă" (5,5): -50 V-Credits, proprietar înregistrat | ✅ |
| 10 | Progresul se salvează | Reîncărcare pagină → tick/clădiri/proprietăți păstrate | ✅ |

## Scenarii automate (rezultate reale)

- **TEST A** (resurse → construcție → clădire vizibilă): **PASS**
  `materialsGained=15, houseBuilt=true, materialsSpent=30`
- **TEST B** (cumpără parcelă → sold scade → proprietar → dublă respinsă): **PASS**
  `ownerSet=true, creditsSpent=50, duplicateRejected=true`
- **TEST C** (10 tick-uri → evoluție → pauză → stabil): **PASS**
  `ticksAdvanced=10, stableAfterPause=true`
- **TEST D** (salvare → reîncărcare → stare recuperată): **PASS**
  `tick=12 (was 12), house=house, owner=cetatean_local`
- **TEST E** (tutorial → 5 pași → „Începe Jocul" → joc continuă): **PASS**
  `startClicked=true, tick=1, tutorialGone=true`
- **TEST F** (Start/Stop prin lansatoare Desktop): **PASS** (4 cicluri verificate; CRYCASH pe 5173 neafectat)
- **TEST G** (rezoluții): **PASS** desktop `1280×663` canvas + mobil `360×524` canvas, 23 butoane, pixeli desenați

## Erori de consolă
**0 erori** pe toată durata testelor (după adăugarea favicon-ului).

## Comenzi de reproducere
```bash
# 1. pornește jocul (sau dublu-clic STUPUL_START.command)
npm run dev --workspace=apps/web -- --host 127.0.0.1 --port 5174
# 2. rulează E2E real (necesită Chrome instalat)
STUPUL_URL=http://127.0.0.1:5174/ npm run test:e2e
```

## Capturi
`docs/screenshots/` — `01_start`, `02_initial_city`, `03_first_building`, `04_evolved_city`, `05_desktop`, `05_mobile360`.

## Concluzie
Criteriul final de acceptare este **îndeplinit**: un utilizator fără cunoștințe tehnice poate intra,
apăsa „Începe Jocul", obține resurse, construi, vedea efectul asupra orașului și salva progresul,
fără comenzi în Terminal.
