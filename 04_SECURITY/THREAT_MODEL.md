# Amenințări, control și limite
## Threats
Sybil/conturi multiple, roboți, replay requests, race conditions, injection în payload și SQL, acces neautorizat, exfiltrare, supply-chain compromise, privilege escalation, fraudă la remunerații, dominarea instituțiilor, DDoS, cost exhaustion, furt chei, exploatare a vulnerabilităților.
## Controls
Schema strictă (Zod/JSON schema), parameterized SQL, auth session HttpOnly SameSite Secure, CSRF protections unde se aplică, CSP, no eval, dependency scan, sec secrets, WAF/rate-limit, idempotency keys, atomic DB writes, control rol server, two-person review for privileged changes, branch protection, logs fără PII.
## Resurse și incidente
Contor de cereri, citiri/scrieri D1, alarmare manuală/externă opțională, rate cap, degrade read-only, export/restore verificat; plan de response 24/48h ca țintă internă fără promisiune de uptime 24/7.
## Interdicție absolută în MVP
Conturi cu rol ADMIN public, SQL din client, cod JS executabil din contribuții comunitare, upload executabile, tokenuri real-money, plăți, leaderboard cu recompense, chat liber.
## Teste adversariale obligatorii
100 comenzi concurente pe aceeași parcelă -> un singur câștigător; replay aceeași comandă -> un singur event; input supradimensionat respins; sold negativ imposibil; actor neautorizat respins; diff hash replay determinist; blocarea câștigurilor din contoare alterate în client.
