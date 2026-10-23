# Ghid de Utilizare — Pornire și Oprire STUPUL (macOS)

Proiectul STUPUL (GENESIS v1.1) include instrumente automate de lansare și oprire fără comenzi manuale în terminal.

---

## 1. Opțiunea A — Aplicația Grafică Nativă macOS (Recomandat)

În directorul principal al proiectului (`~/Documents/STUPUL`), găsiți aplicația:
**`STUPUL_CONTROL.app`**

1. Faceți **dublu clic** pe `STUPUL_CONTROL.app`.
2. Panoul afișează starea curentă a serverului (Pornit / Oprit).
3. Puteți alege:
   - **Pornește Jocul**: Lansează automat serverul local Vite în fundal și deschide jocul în browser.
   - **Deschide în Browser**: Redeschide adresa locală dacă jocul rulează deja.
   - **Oprește Server**: Oprește exclusiv procesul STUPUL, fără a afecta alte aplicații sau procese Node.js.

---

## 2. Opțiunea B — Scripturile cu Dublu Clic din Finder

În directorul `~/Documents/STUPUL` aveți cele două comenzi executabile:

### `START_STUPUL.command`
- **Cum funcționează:**
  1. Detectează automat calea proiectului și mediul Node.js / npm.
  2. Verifică disponibilitatea portului 5173; dacă este ocupat de un alt proiect (ex: CRYCASH), alocă automat următorul port liber (5174, 5175, etc.) fără conflicte.
  3. Previne instanțele multiple: dacă STUPUL rulează deja, deschide direct browserul și nu creează proces duplicat.
  4. Pornește serverul Vite legat **exclusiv la 127.0.0.1** (interfața de rețea locală nu este expusă în rețea/LAN).
  5. Așteaptă confirmarea HTTP 200 înainte de a lansa automat browserul web.
  6. Salvează PID-ul și jurnalul în directorul `runtime/stupul.pid` și `runtime/stupul.log`.

### `STOP_STUPUL.command`
- **Cum funcționează:**
  1. Citește PID-ul din `runtime/stupul.pid`.
  2. **Verifică identitatea procesului** înainte de orice oprire (`ps -p PID -o command`). Nu execută niciodată `killall node` sau `pkill node`.
  3. Trimite un semnal politicos `SIGTERM` și așteaptă eliberarea portului.
  4. Șterge fișierele de stare runtime și confirmă eliberarea resurselor.
  5. **Salveză integral datele**: salvările locale și progresul nu sunt atinse.

---

## 3. Verificare Tehnică a Siguranței

| Verificare | Comportament Asigurat |
|---|---|
| Izolare Port | Dacă portul 5173 este utilizat de alt proiect, STUPUL trece automat pe 5174+ fără a interfera. |
| Securitate Rețea | Serverul este legat strict la `127.0.0.1` (localhost). Nu expune porturi pe Wi-Fi sau LAN. |
| Integritate Procese | Oprește strict procesul alocat STUPUL; Antigravity, alte unelte de dezvoltare sau servere Node rămân neatinse. |
| Persistență Salvări | Baza de date locală, snapshot-urile și fișierele de joc nu sunt modificate la oprire. |
