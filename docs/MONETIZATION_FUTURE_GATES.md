# STUPUL GENESIS v2.0 — Porți pentru Monetizare Viitoare

Data: 24.10.2026 · Auditor: Cline

## 1. Stare actuală
Monetizarea reală este **dezactivată** (Legal Gate fail-closed: `DEFAULT_LOCKED_LEGAL_GATE`,
toate porțile `false`). Nu există plăți, token, wallet sau cashout în gameplay.

## 2. Porțile necesare (toate, nu oricare)
1. Operator juridic verificat.
2. Inventar IP revizuit și semnat.
3. Licență executată cu redevență 5%.
4. Avizul avocatului.
5. Revizuire fiscală.
6. Conformitate GDPR/consumator.

`mayMonetize(gate)` returnează `true` doar dacă TOATE sunt adevărate (testat LEG-T05).

## 3. Ce s-a pregătit (fără a activa plăți)
- Reconciliere `eligibleReceipts * 0.05` (testată, 17 teste).
- Registru beneficiar + schimbare adresă prin aprobări independente.
- Interfețe pentru procesatori autorizați (tipuri; fără serviciu financiar propriu).

## 4. Ce NU facem acum
- Nu activăm plăți reale, nu creăm propriul serviciu financiar nereglementat,
  nu stocăm chei private Exodus, nu inventăm o adresă de portofel.

## 5. Monetizare viitoare (după Legal Gate)
Cosmetice, instrumente de creație/vizualizare, orașe private prin operatori. Interzise: pay-to-win,
voturi plătite, loot boxes, randamente promise.
