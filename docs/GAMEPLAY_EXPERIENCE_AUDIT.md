# Auditul Calității Experienței de Joc (Gameplay & Mechanics Audit) — STUPUL v3.2

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **AUDITAT PE COD, TESTAT E2E CU BROWSER REAL**  

---

## 1. Harta Urbană și Randarea Izometrică (Canvas Engine)

Componenta `apps/web/src/components/CityCanvas.tsx` utilizează un motor Canvas 2D ultra-optimizat:
- **Grilă Izometrică 16x16 parcele**: Fiecare celulă are dimensiunile de 64x32 pixeli în proiecție diamant;
- **Paletă Vizuală "Frontier / Epocă Suverană"**: Culori calde de piatră, lemn masiv, sol fertil, cursuri de apă animate și accente de chihlimbar;
- **Clădiri Distincte Randate Procedural**:
  - `house`: Locuințe cu niveluri vizuale 1, 2, 3 (adaugă capacitate pentru 25 cetățeni per nivel);
  - `farm`: Terenuri agricole cu lanuri de grâu aurii (produc 35 hrană/tick);
  - `well`: Fântâni din piatră ce asigură satisfacția de apă a cetățenilor;
  - `workshop`: Ateliere meșteșugărești ce generează 25 materiale/tick;
  - `school`: Clădiri educaționale ce cresc rata de alfabetizare și civism;
  - `clinic`: Posturi sanitare ce previn epidemiile și susțin creșterea demografică;
  - `guard_post`: Posturi de veghe ce asigură siguranța publică;
  - `town_hall`: Centrul administrativ al orașului.

---

## 2. Puzzle-ul de Infrastructură Hidraulică (Apeductul Văii)

Pentru a rupe monotonia unui simplu joc de management pasiv, STUPUL include un minigame de inginerie hidraulică (`PuzzleModal.tsx`):
- **Grilă 4x4 de conducte și jgheaburi rotative**: Jucătorul rotește segmentele de apeduct pentru a conecta sursa de apă de la munte cu rezervorul central al așezării;
- **Verificare Topologică în Reducer**: Reducerul calculează conectivitatea grafului de conducte în mod deterministic;
- **Recompensă Economică**: Conectarea apeductului acordă o primă civică de 50 credite virtuale, 30 materiale și oferă un **bonus permanent de 30%** la producția tuturor fermelor din oraș.

---

## 3. Sistemul de Sarcini Civice (Muncă Publică Comunitară)

Jucătorii noi sau cei care rămân fără fonduri pot contribui direct la bunurile comune prin `CivicTasksModal.tsx`:
- **Muncă la Ferma Comunitară**: +15 hrană, +8 credite virtuale;
- **Exploatare Forestieră**: +15 materiale de construcție, +8 credite virtuale;
- **Carieră de Piatră**: +20 materiale, +10 credite virtuale;
- **Serviciu Public / Pazilă**: +12 credite virtuale.

---

## 4. Bilingvism Complet și Schimbare Instantanee (RO / EN)

- Toate denumirile, descrierile, etapele de dezvoltare (Tabără -> Sat -> Târg -> Oraș -> Cetate -> Civilizație), misiunile curente și notificările toast sunt localizate 100% în Română și Engleză în `translations.ts`;
- Schimbarea limbii se realizează printr-un singur clic pe butonul `RO / EN` din TopBar, fără reîncărcarea paginii și fără pierderea progresului sau a stării de joc.
