# STUPUL GENESIS v1.1 — Audit de Jucabilitate (Playability Audit)

Data: 24.10.2026 · Auditor: Cline (Principal Game Engineer / QA Automation)

## 1. Metodă
- Pornirea jocului prin lansatorul Desktop (`STUPUL_START.command`) pe `http://127.0.0.1:5174`.
- Inspectarea DOM/CSS/console cu **Chrome real** (headless) și **Puppeteer-core** (interacțiune efectivă).
- Capturi de ecran reale: `docs/screenshots/*.png`.

## 2. Cauza principală a problemei raportate
**„Se deschide o pagină, dar nu se poate juca"** era cauzată de lipsa totală a
**Tailwind CSS**, deși întreaga interfață (`flex`, `w-screen`, `h-screen`, `fixed inset-0`,
culori `bg-*`/`text-*`, `sm:inline` etc.) se baza pe el.

Dovezi:
- `index.css` conținea directivele `@tailwind base/components/utilities`.
- **Nu exista** `tailwind.config.*` și **nu exista** `postcss.config.*`.
- **Nu exista** pachetul `tailwindcss` în `package.json`.
- CSS-ul de build (`dist/assets/*.css`) conținea literal textul `@tailwind base;...` neexpandat.

Consecințe: fără Tailwind, toate clasele utilitare erau no-op → layout prăbușit,
canvas mic/deplasat (clientHeight ≈ 0 fără `h-full`), tutorialul apărea inline (nu overlay),
butoanele erau butoane HTML default nestilizate. De aici impresia de „pagină", nu de „joc".

## 3. Verificare DUPĂ reparație (măsurători reale Puppeteer)
| Măsurătoare | Înainte | După |
|---|---|---|
| CSS compilat | 1.41 kB (raw @tailwind) | 24.5 kB (utilități reale) |
| Canvas (1280×800) | — | **1280×663**, pixeli desenați: da |
| Canvas (360×740 mobil) | — | **360×524**, pixeli desenați: da |
| Butoane interactive | nestilizate | 23 butoane stilizate și funcționale |
| Erori consolă | 1 (404 favicon) | **0** |

## 4. Concluzie
Jocul este **vizibil, interactiv și efectiv jucabil**. Fluxul complet (resurse → construcție →
parcelă → simulare → salvare) a fost validat end-to-end în browser real (7/7 teste PASS).

Capturi reale livrate:
- `01_start.png` — ecranul de început (tutorial)
- `02_initial_city.png` — orașul inițial
- `03_first_building.png` — prima construcție finalizată
- `04_evolved_city.png` — orașul după 10+ tick-uri de simulare
- `05_desktop.png`, `05_mobile360.png` — rezoluții desktop și mobil
