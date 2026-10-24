# STUPUL GENESIS v2.0 — Pregătirea Lansării Beta

Data: 24.10.2026 · Auditor: Cline

## 1. Cele două produse
- **A. STUPUL PUBLIC DEMO** — build static gratuit (`apps/web/dist`), salvare locală, fără monetizare,
  fără pretenția unui oraș comun. **Pregătit** (build funcțional, E2E 7/7).
- **B. STUPUL COMMUNITY BETA** — multiplayer persistent cu operator identificat, autentificare,
  backend autoritativ. **Serverul local e implementat și testat; publicarea este BLOCATĂ.**

## 2. Checklist de publicare (Cloudflare Pages, gratuit)
| Element | Stare |
|---|---|
| Plan gratuit + limite | de verificat la crearea contului 🏗️ |
| Subdomeniu gratuit (`*.pages.dev`) | de verificat disponibilitatea 🏗️ |
| Nume/marcă disponibil | neverificat (OSIM/EUIPO) ⚖️ |
| DNS | n/a pentru subdomeniu gratuit |
| Separare staging/prod | pregătită (DEMO static vs BETA) |
| Config de mediu | pregătită (env-uri fără secrete) |
| Fără secrete în client/repo | ✅ (guard verifică) |
| Politică de confidențialitate | draft în `PRIVACY_AND_OPERATOR_GATES.md` ⚖️ |
| Termeni de utilizare | draft ⚖️ |
| Operator juridic responsabil | **LIPSEȘTE** ⚖️ |
| Raportare probleme | de adăugat |
| Backup | ✅ local; offsite 🏗️ |
| Rollback | ✅ git + build static |
| Costuri/alerte | de configurat la cont 🏗️ |

## 3. Decizie onestă
**Publicarea accesibilă publicului este BLOCKED LEGAL GATE**: lipsesc operatorul responsabil,
terms/privacy aprobate, domeniu/marcă și avizul juridic. Nu atribui automat fondatorului calitatea
de operator. Deploymentul este pregătit local; NU a fost efectuată nicio publicare reală.

## 4. Plan pentru primii 100 de testeri (fără publicitate plătită)
- Invitații directe, link de provocare (share), comunități de dezvoltatori.
- Măsurare minimă (vezi `USER_GROWTH_METRICS.md`), fără date false.
