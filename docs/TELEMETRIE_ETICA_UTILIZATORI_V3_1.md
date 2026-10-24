# TELEMETRIE ETICĂ ȘI MĂSURAREA PRIMILOR 100 DE UTILIZATORI
## Confidențialitate Nativă, Minimizarea Datelor & Creștere Organică — P9 (GENESIS v3.1)
**Versiune:** 3.1.0  
**Data:** 24 Octombrie 2026  
**Document:** `docs/TELEMETRIE_ETICA_UTILIZATORI_V3_1.md`

---

## 1. Principiile Telemetriei Etice STUPUL

STUPUL respinge supravegherea digitală, cookie-urile invazive de urmărire între site-uri (third-party tracking) și colectarea de date cu caracter personal (PII):
1. **Fără Cookie-uri de Urmărire:** Nu se folosește Google Analytics, Meta Pixel sau alte scripturi externe de profiling.
2. **Anonimizare la Sursă:** Adresele IP nu sunt niciodată stocate în baze de date; se calculează un hash volatil de 24h:  
   `SessionToken = SHA256(IP + UserAgent + SaltZilnic)` (saltul se șterge la miezul nopții).
3. **Separarea Riguroasă a Testelor Automate:** Traficul generat de suitele de teste (Puppeteer, vitest, CI) trimite antetul `X-Stupul-Test-Agent: automated` și este exclus complet din statisticile de audiență civică.

---

## 2. Pâlnia Civic-Comunitară (The Pioneer Journey)

Pentru a valida atractivitatea și retenția organică a așezării, sistemul măsoară următoarele etape fără a identifica utilizatorii nominal:

```
[VIZITATOR NOU (DEMO)] ──▶ [PRIMA ACȚIUNE CIVICĂ (MUNCĂ)] ──▶ [PRIMA CONSTRUCȚIE]
           │                                                        │
           ▼                                                        ▼
[EXPLORARE GHID / TUTORIAL]                                 [REVENDICARE PARCELĂ]
           │                                                        │
           ▼                                                        ▼
[CREARE CONT CIVIC (PASSKEY)] ───────────────▶ [CONTRIBUȚIE ATELIER / PROIECT]
```

---

## 3. Metrici Esențiale Urmărite

| Metrică | Mod de Calculare | Semnificație pentru Proiect |
| :--- | :--- | :--- |
| **Vizitatori Unici (24h)** | Număr de hash-uri zilnice unice | Interesul public inițial pentru așezare. |
| **Rata de Conversie Tutorial** | Utilizatori care finalizează cei 5 pași din ghid | Eficiența educațională a onboarding-ului. |
| **Prima Construcție (TTC)** | Timpul median până la plasarea primei Case | Claritatea interfeței de construire și a resurselor. |
| **Adoptarea Monedei Virtuale** | Numărul de activități „Muncă” executate | Angajamentul în economia internă non-speculativă. |
| **Retenția Organică (D1 & D7)** | Reîntoarcerea voluntară a cetățeanului la simulare | Factorul de atracție al evoluției așezării pe termen lung. |
| **Partajare Voluntară (Viralitate)** | Clicuri pe butonul „Partajează Așezarea” | Dorința organică a cetățenilor de a invita alți pionieri. |
| **Stabilitate Tehnică** | Raportul de erori JS raportate anonim | Fiabilitatea clientului pe diverse browsere și rezoluții. |

---

## 4. Viralitate Sănătoasă (Fără Mecanici Compulsive)

- **Fără Dark Patterns:** Progresul în joc nu este condiționat de trimiterea de invitații forțate sau partajare pe rețele sociale.
- **Linkuri Civice Descriptive:** Butonul de partajare generează un URL curat cu coordonatele orașului (`?visit=1&tick=12`), permițând prietenilor să vadă aceeași așezare în timp real fără a fi bombardați cu reclame.
