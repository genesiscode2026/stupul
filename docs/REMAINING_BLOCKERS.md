# Riscuri Reziduale și Limite Externe — STUPUL v3.2

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **ANALIZĂ TRANSPARENTĂ A RISCURILOR POST-IMPLEMENTARE**  

---

## 1. Blocaje Tehnice în Cod

**ZERO BLOCAJE TEHNICE.**  
Toate funcționalitățile solicitate în directiva GENESIS v3.2 (motor deterministic, server autoritativ, multiplayer live prin SSE, persistență SQLite, adaptor Cloudflare D1, autentificare WebAuthn, matematică de guvernanță cu plafonare la 5%, calcul redevență în basis points, pipeline comunitar și bilingvism RO/EN) sunt implementate și validate 100% prin teste automate.

---

## 2. Limite Externe și Riscuri Non-Tehnice

1. **Executabilitatea Juridică a Contractelor cu Operatori Terți**:
   - Software-ul verifică matematic încasările și emite facturi automate în Registrul de Arierate;
   - Cu toate acestea, obligarea unei companii din altă țară să plătească 5% în cazul în care aceasta refuză cooperarea amiabilă necesită deschiderea unei acțiuni în justiție pe baza dreptului de autor și a contractului bilateral semnat.
2. **Dependența de Infrastructură pentru Multiplayer Global Public**:
   - Pe mașina locală a utilizatorului, multiplayer-ul funcționează perfect out-of-the-box prin `START_STUPUL.command`;
   - Pentru ca doi jucători aflați în orașe sau țări diferite să joace pe aceeași lume fără a fi pe aceeași rețea locală, codul serverului trebuie instalat pe un server VPS sau déployat pe Cloudflare Workers + D1 (ambele opțiuni fiind complet suportate de codul existent).
3. **Păstrarea Disciplinei în Comunitate**:
   - Respectarea regulilor anti-self-reward necesită ca membrii comunității să își mențină integritatea civică și să asigure cel puțin 2 recenzenți independenți pentru fiecare contribuție nouă.
