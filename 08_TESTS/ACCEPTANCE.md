# Matricea atomică de acceptare
- T-001 seed fix + aceleași comenzi -> stateHash identic în 100 rulari.
- T-002 `expectedVersion` invalid -> 409 fără side effects.
- T-003 două construcții pe aceeași parcelă -> exact una acceptată.
- T-004 insuficiență materiale -> comandă respinsă și treasury neschimbată.
- T-005 eveniment idempotent retrimis -> o singură mutație.
- T-006 import corupt -> mesaj clar, fără distrugerea savegame.
- T-007 absență server -> jocul local funcționează / scrierile remote sunt oprite explicit.
- T-008 propunere nepermisă -> respinsă (niciodată cod JS din vot).
- T-009 fondator/primar/proprietar bogat -> niciun vot suplimentar prin rol/avere.
- T-010 un moderator nu poate încasa/plăti/autovalida contribuția proprie.
- T-011 snapshot + replay -> aceeași stare ca aplicarea integrală a jurnalului.
- T-012 server nu acceptă scoruri declarate din client fără verificare.
- T-013 mobile 360px navigabil; keyboard focus; contrast/labels; prefers-reduced-motion.
- T-014 un vizitator anonim vede oraș, rezolvă puzzle, înțelege efectul și distribuie link valid.
- T-015 nu se transmite IP/identitate în analytics proprii fără analiză GDPR.
- T-016 fără API de plăți/transfer, fără wallet, fără cashout în F0–F4.
- T-017 `royaltyRate == 0.05` doar în draftul financiar; rutinele reale sunt inactive până la L4.
- T-018 un contributor fără CLA valabil nu este integrat în distribuția comercială.
- T-019 `ownerAccountId` nu se confundă cu drept de proprietate civilă asupra terenului.
- T-020 ștergerea/migrarea unui event verifică checksum/backup și nu se face fără aprobări.

## Script de verificare locală (când repo există)
`npm ci && npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e` — adaugă scripturile reale, nu marca teste inexistente drept trecute.

## Criterii stop
Nu livra lansare online fără ownership operativ clar, backup restaurabil, limitare abuz, terms/privacy adecvate, test concurență. Nu livra comerț fără Legal Gate.
