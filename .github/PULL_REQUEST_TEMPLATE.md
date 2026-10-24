# Descriere Pull Request

## Rezumatul Modificărilor
Explicați concis scopul tehnic și motivele arhitecturale ale modificării.

## Lista Verificărilor Obligatorii (Invarianți STUPUL)
- [ ] **Zero PII**: Nu sunt stocate sau transmise date personale (nume reale, email, telefon, IP).
- [ ] **Determinism**: Motorul de simulare produce același `stateHash` pentru același seed.
- [ ] **Protecția Redevenței**: Nu sunt modificate ratele de 5% (500 bp) sau regulile de eligibilitate.
- [ ] **Securitate Guvernanță**: Niciun contributor nu poate depăși plafonul individual strict de 5% din vot.
- [ ] **Fără Auto-Recompensare**: Recenzarea trebuie efectuată de cel puțin 2 membri independenți.
- [ ] **Bilingvism**: Modificările din UI conțin traduceri complete RO și EN în fișierele de i18n.

## Comenzi de Validare Executate Local
- [ ] `npm run typecheck` (0 erori)
- [ ] `npm run lint` (0 avertismente)
- [ ] `npm test` (toate suitele trecute)
- [ ] `npm run test:e2e` / `npm run test:multiplayer` (teste reale de browser)
- [ ] `node scripts/royalty_guard.cjs` (PASS)

## Declarație DCO (Developer Certificate of Origin)
Prin trimiterea acestui Pull Request, certific că am dreptul de a trimite codul sub licența proiectului și că sunt de acord cu termenii de participare deschisă și protecție a proprietății intelectuale prevăzuți în `CONTRIBUTING.md`.
