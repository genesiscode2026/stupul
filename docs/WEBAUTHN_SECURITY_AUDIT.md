# Raport de Audit de Securitate — Autentificare WebAuthn și Sesiuni Anonime

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **AUDITAT ȘI VALIDAT PE CODUL EXECUTABIL (`tests/auth-webauthn.test.ts`)**  

---

## 1. Arhitectura Criptografică WebAuthn

Modulul de autentificare implementat în `packages/server/src/auth.ts` respectă standardul W3C Web Authentication (WebAuthn Level 2/3) și principiul **Zero-PII** (Principiul P6):

1. **Fără Parole Stocate**: Serverul nu stochează niciodată parole sau hash-uri de parole pasibile de scurgere de date.
2. **Criptografie Asimetrică**: Autentificarea se bazează exclusiv pe perechi de chei publice/private generate în hardware-ul securizat al utilizatorului (TouchID, FaceID, YubiKey). Serverul stochează doar cheia publică (`passkeyPublicKeyPem`).
3. **Minimizarea Datelor**: Nu se solicită adrese de email, numere de telefon sau date de identitate civilă.

---

## 2. Analiza Mecanismelor de Apărare

### A. Prevenirea Atacurilor de Rejucare (Anti-Replay Protection)
- Fiecărei cereri de înregistrare sau autentificare îi este alocat un `challenge` criptografic unic de 32 octeți (`crypto.randomBytes(32)`).
- La validare, serverul verifică prezența challenge-ului în registrul activ și îl **șterge instantaneu** din memorie (`this.challenges.delete(...)`).
- Orice încercare a unui atacator de a retransmite același pachet interceptat pe rețea este respinsă cu eroarea: `Invalid or unknown challenge`.

### B. Protecție la Expirare (Time-To-Live)
- Challenge-urile au o durată strictă de valabilitate de **5 minute (300.000 ms)**.
- O sesiune întârziată este invalidată automat pentru a preveni colectarea challenge-urilor inactive.

### C. Gestiunea Sesiunilor (Session Tokens)
- La autentificarea cu succes, se generează un token de sesiune de 256 de biți (64 caractere hex).
- Sesiunile au o valabilitate de **24 de ore**, cu actualizarea automată a câmpului `lastActiveMs`.
- Endpoint-ul `POST /api/auth/logout` revocă instantaneu tokenul din memorie.

---

## 3. Modul Oaspete (Guest Sessions — Zero Friction)

Pentru a asigura accesibilitatea universală fără bariere de intrare:
- Orice vizitator poate iniția o sesiune de Oaspete (`POST /api/auth/guest`).
- Identitatea generată (`mode: 'guest'`) primește un identificator efemer (ex. `oaspete_4821`).
- Oaspetele poate explora jocul, inspecta parcelele și experimenta mecanicile economice fără a fi constrâns să își creeze un cont permanent.
- Dacă dorește să își păstreze proprietatea parcelelor în mod permanent, își poate atașa ulterior un Passkey WebAuthn.
