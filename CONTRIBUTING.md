# Ghid de Contribuție Comunitară — STUPUL (GENESIS v3.2)

Vă mulțumim pentru interesul de a contribui la civilizația digitală persistentă **STUPUL**.
Acest proiect îmbină simularea deterministică, suveranitatea civică, economia transparentă și protecția drepturilor de autor.

---

## 1. Principiile Arhitecturale Fundamentale (Invarianți)

Orice contribuție acceptată în repository trebuie să respecte cu strictețe cei 6 invarianți:

1. **P1: Determinism Matematic & Replayability**:
   Starea lumii este o funcție pură a stării anterioare și a comenzii autoritative: `S' = reduce(S, command)`.
   Orice calcul cu numere în virgulă mobilă trebuie verificat împotriva driftului (`Math.round` sau reprezentare în întregi/cenți).
2. **P2: Autoritate Unică & Persistență Tranzacțională**:
   Serverul autoritativ gestionează comenzile concurente prin SQLite / Cloudflare D1. Conflictele de concurență returnează `HTTP 409 Conflict` fără alterarea stării locale.
3. **P3: Protecția Redevenței de Creație de 5% (500 basis points)**:
   Dreptul contractual de 5% al fondatorului asupra veniturilor comerciale eligibile este intangibil. Nicio modificare nu poate diminua sau eluda această prevedere (`scripts/royalty_guard.cjs` rulează la fiecare PR).
4. **P4: Plafonarea Democratică a Puterii de Vot (Anti-Monopol)**:
   - Sub 20 de contributori eligibili: toți contributorii au vot **strict egal** (1/N).
   - La 20 sau peste 20 de contributori: votul se bazează pe merit activ, dar **niciun contributor nu poate depăși 5%** din puterea de vot a Camerei Contributorilor. Surplusul este redistribuit iterativ celorlalți membri.
5. **P5: Anti-Self-Reward (Fără Auto-Recompensare)**:
   Niciun autor nu își poate aproba sau evalua propria contribuție. Evaluarea de merit necesită cel puțin 2 recenzenți independenți fără conflicte de interese.
6. **P6: Anonimitate și Zero-PII**:
   Nu se stochează nume reale, email-uri, numere de telefon sau date biometrice. Autentificarea se realizează exclusiv prin Passkeys (WebAuthn) asimetrice sau sesiuni Guest.

---

## 2. Fluxul de Lucru pentru Contributori

### Pasul 1: Clonare și Pregătire Mediu
```bash
git clone <repo-url>
cd STUPUL
npm install
```

### Pasul 2: Creare Branch de Lucru
```bash
git checkout -b feature/nume-propunere
# sau
git checkout -b fix/descriere-bug
```

### Pasul 3: Implementare și Validare Locală Riguroasă
Înainte de trimiterea oricărui Pull Request, executați suita completă de verificări:
```bash
# 1. Verificare tipuri TypeScript (toate pachetele)
npm run typecheck

# 2. Verificare stil de cod și bune practici
npm run lint

# 3. Rulare teste unitare și de integrare
npm test

# 4. Rulare test End-to-End browser și benchmark de concurență
npm run test:multiplayer

# 5. Verificare automată a gărzilor de integritate
node scripts/royalty_guard.cjs
```
Toate comenzile trebuie să returneze `PASS` (cod de ieșire 0) fără nicio excepție.

---

## 3. Evaluarea Contribuțiilor & Calculul Meritului

Meritul civic nu este un jeton speculativ, ci o pondere de guvernanță efemeră:
- **Rubrică de Evaluare**: `0 .. 100` puncte (conformitate, calitate, teste, documentație).
- **Pondere de Impact**:
  - `1x`: Modificări minore, corecții de text, documentație, remedieri mici de bug-uri.
  - `2x`: Funcționalități noi, componente UI, optimizări de performanță.
  - `3x`: Arhitectură de sistem, audituri de securitate, rezolvare incidente critice.
- **Half-Life (Înjumătățire la 45 de zile)**: Punctele își pierd jumătate din valoare la fiecare 45 de zile și ajung la 0 după 90 de zile de inactivitate.

---

## 4. Declarația DCO (Developer Certificate of Origin v1.1)

Fiecare commit trimis către STUPUL trebuie semnat (`git commit -s`) confirmând următorul angajament:

```
Developer Certificate of Origin
Version 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

---

## 5. Ghid de Stil & Cerințe Bilingve (RO / EN)

- Toate textele afișate în interfața de utilizator trebuie declarate simultan în fișierul `apps/web/src/i18n/translations.ts` (atât cheia în limba Română cât și în limba Engleză).
- Nu includeți șiruri de caractere hardcodate în componentele React.
- Denumirile identificatorilor tehnici, fișierelor și variabilelor rămân în limba engleză (ex: `actorId`, `gameState`, `calculateRoyalties`).

---

## 6. Guvernanță Comunitară & Licențiere Comercială

- **Administrarea Comunitară**: Pentru regulile constituționale de alegere a Consiliului Comunitar, procesul de decizie RFC și administrarea descentralizată fără chei unice, consultați [Acordul de Administrare Comunitară](file:///Users/severmarcus/Documents/STUPUL/docs/COMMUNITY_OPERATING_AGREEMENT.md).
- **Operatori Comerciali & Succesiune**: Orice entitate care monetizează jocul sau preia exploatarea comercială aderă automat la obligațiile de decontare a redevenței de 5% (500 bps) pe BASE USDC prin [Actul de Aderare (Deed of Adherence)](file:///Users/severmarcus/Documents/STUPUL/docs/DEED_OF_ADHERENCE.md).

