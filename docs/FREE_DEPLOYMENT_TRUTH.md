# Adevărul Despre Găzduirea Gratuită: Demo Static vs. Multiplayer Real

Data: 24 Octombrie 2026  
Statut: **CLARIFICARE ARHITECTURALĂ TRANSPARENTĂ (NO FAKE CLAIMS)**  

---

## 1. Iluzia "Multiplayer-ului Gratuit din Fișiere Statice"

Există adesea confuzia că un fișier `index.html` și un bundle JavaScript compilat cu Vite pot oferi multiplayer în timp real dacă sunt urcate pe servicii de găzduire statică gratuite precum GitHub Pages, GitLab Pages sau Vercel Static.

> [!CAUTION]
> **O pagină web statică NU poate menține o bază de date partajată și nu poate serializa comenzi concurente între doi jucători distanți fără un server autoritativ activ.**
>
> Dacă utilizatorul A deschide un site static pe telefonul său, iar utilizatorul B deschide același site pe laptopul său:
> - Fiecare browser rulează propria sa copie izolată a jocului în memorie / `localStorage`;
> - Când A construiește o casă, B **NU o va vedea niciodată**, deoarece nu există un nod central care să transmită evenimentele între ei;
> - Ambii pot cumpăra aceeași parcelă (5, 5) fără să știe unul de celălalt.

---

## 2. Distincția Onestă: Două Moduri de Funcționare în STUPUL

Codul STUPUL a fost proiectat cu o arhitectură hibridă inteligentă (`multiplayerClient.ts`):

### Modul A: Demo Static Portabil (Solo / Offline PWA)
- **Unde poate fi găzduit**: GitHub Pages, Cloudflare Pages, Netlify, un simplu stick USB.
- **Cost**: **0 USD / lună (Complet Gratuit)**.
- **Ce oferă**:
  - Simularea urbană completă pe 16x16 parcele;
  - Puzzle-ul de infrastructură hidraulică conectabil;
  - Politici publice și colectare taxe virtuale;
  - Salvare locală automată în `localStorage` și export snapshot JSON;
  - Schimbare limbă bilingvă RO / EN.
- **Limitare**: Experiență pur single-player (fiecare utilizator are propria civilizație privată).

---

### Modul B: Multiplayer Autoritativ în Timp Real (Persistent Shared World)
- **Cum funcționează**:
  - Se conectează la un server autoritativ prin Server-Sent Events (`/api/stream`) și comenzi tranzacționale (`POST /api/command`);
  - Serializare strictă a comenzilor concurente pe o bază unică SQLite / Cloudflare D1;
  - Când Jucătorul A revendică o parcelă, Jucătorul B primește evenimentul live fără refresh;
  - Dacă ambii încearcă simultan să revendice aceeași parcelă, serverul respinge al doilea jucător cu `HTTP 409 Conflict`.
- **Unde poate fi găzduit la cost zero**:
  - **Local pe macOS**: Dublu-clic pe `START_STUPUL.command` (pornește backend-ul pe portul 8787 și Vite pe 5174);
  - **În Cloud gratuit**: **Cloudflare Workers + Cloudflare D1 Database** (Tier-ul gratuit Cloudflare permite 100.000 cereri/zi și 5GB stocare SQLite la margine fără niciun cost bancar sau card necesar).

---

## 3. Matricea de Transparență pentru Comunitate

| Caracteristică | GitHub Pages (Static) | Local / LAN (`START_STUPUL`) | Cloudflare Workers + D1 |
|---|---|---|---|
| Cost lunar | 0 USD | 0 USD | 0 USD (în limita free tier) |
| Simulare și Reguli | DA | DA | DA |
| Accesibil de oricine | DA (URL public) | Doar pe rețeaua locală | DA (URL global public) |
| Sincronizare live între 2 jucători | **NU (Mod Solo)** | **DA (Pe aceeași mașină/rețea)** | **DA (Global pe internet)** |
| Bază de date partajată persistentă | **NU (`localStorage` local)** | **DA (SQLite fișier)** | **DA (Cloudflare D1 SQLite)** |
| Prevenire concurență 409 | **NU** | **DA** | **DA** |
