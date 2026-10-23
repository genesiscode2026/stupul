# STUPUL GENESIS v1.1 — Corecturi de Gameplay (Gameplay Fixes)

Data: 24.10.2026 · Auditor: Cline

## F1 — Tailwind CSS lipsea (BLOCANT)
- **Severitate:** Critică (jocul nu se randa ca joc).
- **Cauză:** directive `@tailwind` fără plugin/config/pachet.
- **Fișiere:** `apps/web/src/index.css`, `package.json`, `apps/web/tailwind.config.cjs` (nou), `apps/web/postcss.config.cjs` (nou).
- **Soluție:** instalat `tailwindcss@3.4` + `postcss` + `autoprefixer`; config content `./index.html` + `./src/**/*.{ts,tsx}`.
- **Verificare:** `npm run build` → CSS 24.5 kB cu utilități reale; `npm run typecheck`/`lint` trec.

## F2 — Clicul pe parcelă depindea de un `hoveredCoord` învechit
- **Severitate:** Înaltă (construcția/selecția putea să nu se întâmple fără hover prealabil).
- **Cauză:** `handleMouseUp` folosea `hoveredCoord` (setat doar la hover), nu coordonatele clicului.
- **Fișier:** `apps/web/src/components/CityCanvas.tsx`.
- **Soluție:** `handleMouseUp` calculează acum poziția grilei direct din `screenToGrid(mouseX, mouseY, zoom, offset)`.
- **Verificare:** TEST A (construcție Casă) și TEST B (parcelă) trec în browser real.

## F3 — Butonul „Începe Jocul!" doar închidea tutorialul
- **Severitate:** Medie (nu pornea experiența).
- **Cauză:** `TutorialModal` apela doar `onClose`.
- **Fișiere:** `apps/web/src/components/TutorialModal.tsx`, `apps/web/src/App.tsx`.
- **Soluție:** adăugat `onStart` → setează `isPlaying=true` și afișează un toast de pornire.
- **Verificare:** TEST E — după „Începe Jocul", tick-ul crește (simularea pornește).

## F4 — Lipsa unui obiectiv vizibil
- **Severitate:** Medie (utilizatorul nu știa ce să facă).
- **Fișier:** `apps/web/src/App.tsx`.
- **Soluție:** banner de misiune persistent „🎯 Misiune — AJUTĂ AȘEZAREA SĂ CREASCĂ", derivat din starea reală (case/farme/apeduct).
- **Verificare:** vizibil în DOM și capturi; se actualizează la progres.

## F5 — Feedback blocant cu `alert()`
- **Severitate:** Minoră.
- **Fișier:** `apps/web/src/App.tsx`.
- **Soluție:** sistem de toast-uri non-blocante (succes/eroare) + dispatch fără efecte secundare în updater (ref) — elimină și duplicarea evenimentelor în StrictMode.
- **Verificare:** TEST A/B afișează toast-uri; 0 erori consolă.

## F6 — 404 favicon
- **Severitate:** Minoră.
- **Fișier:** `apps/web/index.html`.
- **Soluție:** favicon SVG inline (data URI).
- **Verificare:** 0 erori consolă.

## F7 — Suită E2E reală adăugată
- **Fișiere:** `scripts/e2e_gameplay.cjs`, `scripts/playability_check.cjs`, `package.json` (`test:e2e`).
- **Verificare:** 7/7 scenarii PASS în Chrome real (vezi `USER_JOURNEY_TEST.md`).

## Notă
Motorul determinist, economia virtuală, regulile comunității, redevența 5% și dezactivarea
monetizării reale **nu au fost modificate**.
