# ARHITECTURA DE DISTRIBUȚIE PUBLICĂ & DEPLOYMENT CLOUDFLARE WORKERS
## Infrastructură Zero-Cost, Rezistență la Încărcare & Protecție Anti-Bot — P8 (GENESIS v3.1)
**Versiune:** 3.1.0  
**Data:** 24 Octombrie 2026  
**Document:** `docs/DISTRIBUTIE_SI_CLOUD_WORKERS_V3_1.md`

---

## 1. Principiul Bugetar: Arhitectură 100% Free-Tier Native

Pentru a proteja proiectul de cheltuieli lunare recurente sau datorii de hosting înainte de existența unor încasări comerciale, sistemul STUPUL este conceput să funcționeze integral în limitele generoase ale planului gratuit (**Cloudflare Free Tier**):

| Serviciu Cloudflare | Limită Gratuită Inclusă | Utilizare STUPUL | Cost |
| :--- | :--- | :--- | :---: |
| **Cloudflare Pages** | Lățime de bandă nelimitată, 500 build-uri/lună | Găzduire bundle frontend (React + Vite, ~250 kB) | **\$0.00** |
| **Cloudflare Workers** | 100.000 cereri / zi (~3 milioane / lună) | Gateway API autoritativ & execuție reducer `@stupul/engine` | **\$0.00** |
| **Cloudflare D1 (SQLite)** | 5 milioane citiri / zi, 100.000 scrieri / zi | Bază de date persistentă a orașului comun & comenzi | **\$0.00** |
| **Cloudflare KV** | 100.000 citiri / zi, 1.000 scrieri / zi | Cache snapshot-uri globale & liste de revocare | **\$0.00** |
| **Certificat SSL/TLS & DDoS** | Inclus nelimitat (WAF bazat pe reputație IP) | Protecție DNS & filtrare automată atacuri volumetrice | **\$0.00** |

---

## 2. Cele Două Medii de Lansare

### A. DEMO PUBLIC GRATUIT (Guest Exploration)
- **Destinație:** Utilizatori noi, curioși, comunitate extinsă.
- **Caracteristici:** Rulare 100% client-side (SPA) cu stocare locală în `LocalStorage`.
- **Acces:** Instantaneu, fără login, fără cookies, fără permisiuni invazive.
- **Capacitate:** Nelimitată (servit direct prin CDN Cloudflare de la cel mai apropiat punct de prezență).

### B. COMMUNITY BETA MULTIPLAYER (Oraș Persistent Colaborativ)
- **Destinație:** Cetățeni înregistrați cu Passkeys (WebAuthn).
- **Caracteristici:** Sincronizare pe serverul autoritativ prin coada de comenzi deterministă.
- **Condiție Fail-Closed de Lansare Publică:**  
  *Nu se publică în producție deschisă cu tranzacții reale până când nu există un Operator Comercial real asumat juridic prin contract valabil de cesiune/licențiere (G-001/G-003).*

---

## 3. Strategia de Backup, Staging & Rollback

1. **Reproductibilitate prin IaC (Wrangler):**  
   Configurația `wrangler.toml` definește mediile `staging` și `production` cu separare strictă a bazelor de date D1 (`stupul-db-staging` vs `stupul-db-production`).
2. **Snapshot-uri Orară Automatizate:**  
   Un cron worker Cloudflare declanșează la fiecare oră un export JSON canonic al stării orașului (`computeStateHash()`), salvat în bucket-ul R2 (gratuit până la 10 GB).
3. **Rollback Deterministic Instantaneu:**  
   În caz de corupere logică, serverul autoritativ poate reveni la orice versiune anterioară reexecutând jurnalul de comenzi de la ultimul snapshot valid.

---

## 4. Securitate la Nivel de Edge & Protecție Anti-Bot

- **Rate Limiting Glisant:** 60 de comenzi / minut per adresă IP și per cont civic (implementat prin algoritmul Token Bucket din `packages/server/src/httpServer.ts`).
- **Proof-of-Work Ușor (Hashcash):** În caz de trafic suspect masiv, clientul calculează o provocare SHA-256 de 100 ms înainte de trimiterea comenzii.
- **Protecția Secretelor:** Variabilele de mediu sensibile și cheile de semnare nu se comit niciodată în git; sunt injectate la runtime prin `wrangler secret put`.
