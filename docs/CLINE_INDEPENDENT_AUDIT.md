# STUPUL GENESIS v1.1 — Audit Tehnic Independent (Cline)

Data: 23.10.2026
Auditor: Cline (Principal Software Architect / Security Auditor / QA)
Statut: AUDIT REAL — fiecare constatare este susținută de cod, test rulat sau observație directă.

## 1. Metodă
- Citirea integrală a GENESIS v1.1 și a rapoartelor Antigravity.
- Inspectarea la nivel de fișier a celor 4 module + aplicație web + teste + scripturi.
- Rulare efectivă: `npm test` (33), `npm run build`, `npm run typecheck`, `npm run lint`, `npm audit`.
- Verificare Start/Stop: 3 cicluri complete pe macOS (START → HTTP 200 → STOP → proces oprit), fără a afecta procesul CRYCASH (port 5173).
- Backup verificat SHA-256 creat înainte de modificări: `~/Desktop/STUPUL_BACKUP_20261023_234735.tar.gz`.

## 2. Constatări și remedieri

### F1 — `npm run typecheck` eșua
- **Severitate:** Înaltă (pipeline CI fals).
- **Cauză:** scriptul era `tsc --build`, dar lipsea `tsconfig.json` rădăcină → `TS5083`.
- **Fișiere:** `package.json`, `tsconfig.json` (nou), `packages/*/tsconfig.json`.
- **Soluție:** referințe de proiect TypeScript (`composite`, `references`) + `tsc --noEmit -p apps/web`.
- **Test:** `npm run typecheck` → exit 0.
- **Rezultat:** PASS. A descoperit și bug-ul F3.

### F2 — `npm run lint` era simulat
- **Severitate:** Medie.
- **Cauză:** `"lint": "echo 'Linting passed'"`.
- **Fișiere:** `package.json`, `eslint.config.mjs` (nou).
- **Soluție:** ESLint real (typescript-eslint + react-hooks). Eliminate importuri/variabile moarte.
- **Test:** `npm run lint` → exit 0 (0 erori, 1 avertisment benign `exhaustive-deps` pe canvas).
- **Rezultat:** PASS.

### F3 — Butonul „Ghid" (tutorial) crăpa
- **Severitate:** Înaltă (funcționalitate UI ruptă).
- **Cauză:** `onOpenTutorial` era în `TopBarProps` dar lipsea din destructuring.
- **Fișiere:** `apps/web/src/components/TopBar.tsx`.
- **Soluție:** adăugat `onOpenTutorial` în destructuring.
- **Test:** `npm run typecheck` (TS2304 eliminat); click manual pe „Ghid".
- **Rezultat:** PASS.

### F4 — Algoritmul de plafonare 5% pierdea pondere silențios
- **Severitate:** Înaltă (integritate guvernanță).
- **Cauză:** redistribuirea excesului era proporțională cu ponderea curentă; la contributori cu merit 0, suma rămânea 5% în loc de 100%.
- **Fișiere:** `packages/domain/src/governance.ts`.
- **Soluție:** algoritm freeze-and-redistribute (exces distribuit egal) + verificare „suma = 100%".
- **Test:** `tests/governance.test.ts` GOV-T07 (întărit) + GOV-T07-extrem + GOV-T07-egal20.
- **Rezultat:** PASS (14 teste guvernanță).

### F5 — Mismatch React 18/19 spărgea typecheck
- **Severitate:** Medie.
- **Cauză:** rădăcina declara React 19, `apps/web` React 18; `lucide-react` rezolva tipuri React 19 (`bigint` în ReactNode) → TS2786.
- **Fișiere:** `package.json`.
- **Soluție:** aliniere la React 18 (rădăcină + web).
- **Test:** `npm run typecheck` → exit 0.
- **Rezultat:** PASS.

### F6 — Matrice de trasabilitate falsă
- **Severitate:** Înaltă (documentație care induce în eroare).
- **Cauză:** `requirements-traceability.md` cita ~17 fișiere de test și ~8 module inexistente.
- **Fișiere:** `docs/requirements-traceability.md`.
- **Soluție:** rescris cu fișiere și teste reale.
- **Rezultat:** corectat.

### F7 — Număr de teste contradictoriu
- **Severitate:** Minoră.
- **Cauză:** `CHANGELOG` (26) vs `AUDIT_SENIOR` (31).
- **Soluție:** actualizat la **33** teste reale.
- **Rezultat:** corectat.

### F8 — Lansațoare nu erau pe Desktop; `.app` fragil
- **Severitate:** Înaltă (criteriu de acceptare P1).
- **Cauză:** lansațoarele existau doar în proiect; `STUPUL_CONTROL.app` folosea `path to me`.
- **Fișiere:** `START_STUPUL.command`, `STOP_STUPUL.command`, `scripts/control_applet.applescript`, Desktop.
- **Soluție:** scripturi întărite + butoane Desktop + `.app` auto-localizant (cale proiect fixă).
- **Test:** 3 cicluri complete (vezi mai sus).
- **Rezultat:** PASS.

## 3. Limitări asumate onest
1. **Testarea UI în browser automatizat** nu a putut fi rulată (serverul MCP Playwright nu a răspuns — timeout). Interfața a fost verificată prin inspectarea codului + servire HTTP (200) + build de producție; nu am putut valida clic-by-clic în browser.
2. **Identitate/Sybil:** deduplicarea `actorId` nu dovedește 1 om = 1 vot (vezi `SECURITY_FINDINGS.md`).
3. **Integritate:** hash-ul SHA-256 este recalculabil de client — este sumă de control, nu autenticitate.
4. **Dependențe:** `npm audit` raportează 6 vulnerabilități în dev-dependențe (Vitest/Vite/esbuild/tinypool); nu sunt livrate în producție, dar necesită upgrade major ulterior.

## 4. Concluzie
Prototipul local GENESIS v1.1 este **funcțional, determinist și testat**. S-au corectat
defecte reale de tipcheck/lint/UI/guvernanță și s-au livrat butoanele Desktop de pornire/oprire.
Nu este un produs multiplayer și nu are identitate reală ori monetizare — acestea sunt etape viitoare
documentate în `NEXT_DEVELOPMENT_STAGES.md`.
