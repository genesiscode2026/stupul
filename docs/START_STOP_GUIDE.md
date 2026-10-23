# Ghid de Utilizare — Pornire și Oprire STUPUL (macOS)

Proiectul STUPUL (GENESIS v1.1) include instrumente de lansare/oprire **fără comenzi manuale**.

---

## 1. Butoanele de pe Desktop (recomandat)

Pe Desktop găsiți trei elemente:

| Element | Acțiune |
|---|---|
| **`STUPUL_START.command`** | Pornește jocul (server local + browser) — dublu clic |
| **`STUPUL_STOP.command`** | Oprește doar procesul STUPUL — dublu clic |
| **`STUPUL_CONTROL.app`** | Panou grafic cu 3 butoane: Pornește / Deschide / Oprește |

### `STUPUL_CONTROL.app`
Dublu clic pe aplicație → apare dialogul cu starea serverului și trei acțiuni:
- **Pornește Jocul** — lansează serverul local Vite în fundal și deschide browserul.
- **Deschide Jocul** — redeschide adresa locală (pornește dacă e oprit).
- **Oprește Jocul** — oprește exclusiv procesul STUPUL, păstrând salvările.

---

## 2. Ce face `START` (automat)
1. Detectează automat calea proiectului și mediul Node.js / npm.
2. Verifică portul 5173; dacă e ocupat de alt proiect (ex: CRYCASH), trece automat pe următorul port liber (5174+).
3. Previne instanțele duplicate: dacă STUPUL rulează deja, deschide doar browserul.
4. Pornește Vite legat **exclusiv la 127.0.0.1** (fără expunere LAN).
5. Așteaptă confirmarea HTTP 200 înainte de a deschide browserul.
6. Salvează PID-ul în `runtime/stupul.pid` și jurnalul în `runtime/stupul.log`.

## 3. Ce face `STOP` (sigur)
1. Citește PID-ul și **verifică identitatea procesului** (comanda trebuie să referă proiectul STUPUL).
2. Trimite `SIGTERM` doar acelui proces; NU folosește `killall node` / `pkill node`.
3. Confirmă eliberarea portului și șterge fișierele de stare runtime.
4. **Nu atinge salvările** (localStorage) și nu afectează alte proiecte.

---

## 4. Verificare de siguranță (testat în acest audit)
- 3 cicluri complete START → HTTP 200 → STOP → proces oprit: **PASS**.
- Procesul CRYCASH (port 5173) a rămas neafectat pe toată durata: **PASS**.
- Detecția pornirii repetate (nu creează proces duplicat): **PASS**.

---

## 5. Notă macOS
Aplicația `.app` și scripturile `.command` sunt create local (fără atribut de carantină). Dacă macOS
afișează un avertisment la prima rulare, folosiți „Deschide" din meniul contextual (clic dreapta),
fără a dezactiva Gatekeeper global.
