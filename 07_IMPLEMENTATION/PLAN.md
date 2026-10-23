# Plan incremental și bugete de risc
## F0 — 0€ local, fără internet obligatoriu
Scaffold; engine determinist; tick, resurse, hartă, clădiri, scenarii, jurnal, export/import, teste de replay. STOP dacă sim engine nu este stabil.
## F1 — 0€ local / găzduire statică posibil gratuită
Interfață responsive cu prima provocare; evoluție vizibilă; 2 politici simulate; accesibilitate; offline first; fără conturi.
## F2 — demo online sincronizat, fără monetizare
API Cloudflare opțional, D1 snapshots/events, circuit breaker, rate limiting, read-only degradation, anon privacy; teste 100 cereri concurente; dashboard usage/quota. STOP dacă free-tier nu ajunge; proiectul rămâne jucabil local.
## F3 — comunitate și economie ludică
Conturi opționale, proprietăți virtuale, instituții, alegeri, câștiguri în joc, contestare, audit, sybil protections; nici o plată reală; numai după evaluare juridică pentru public.
## F4 — Atelierul civilizației
GitHub contributions, reviews, CLA valid, roluri distincte, sandbox de extensii numai declarative; donații/plăți contributorilor dezactivate până la L4.
## F5 — Operator comercial independent
Predare efectivă către entitate constituită; licență semnată/acceptată verificabil; recunoașterea veniturilor, taxare, procesare, condiții consumatori și calcul redevență de 5%; niciun flux de bani înainte de Legal Gate L4.

## Gate-uri
G0 engine replay deterministic; G1 100 testeri, core loop demonstrat; G2 robustețe API; G3 alegeri verificate și fără admin absolut; G4 documente legale și operator transferat; G5 numai apoi monetizare.

## Evaluare resurse
Laptop pentru cod/build/test; client browser pentru gameplay; cloud doar API+DB. Nu pretinde costuri viitoare zero sau funcționare permanentă garantată. Măsurăm număr solicitări per utilizator, rânduri D1, stocare, latență, accesibilitate, retenție, erori și feedback.
