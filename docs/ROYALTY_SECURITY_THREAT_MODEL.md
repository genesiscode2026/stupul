# Modelul de Amenințări de Securitate și Sinteza celor 26 de Scenarii Adversariale (A - Z)

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **TESTE ADVERSARIALE VERIFICATE (26/26 PASS ÎN `tests/adversarial-26-scenarios.test.ts`)**  

---

## 1. Vectori de Atac și Nivele de Risc

Securitatea civilizației digitale STUPUL este concepută pe principiul apărării în profunzime (*Defense in Depth*) împotriva a trei categorii majore de atacatori:

1. **Operatori Economici Ostili**: Încercări de eludare a redevenței de 5% prin entități afiliate, tokeni fictivi sau deduceri mascate.
2. **Actori Politici Manipulatori**: Încercări de captură a guvernării prin atacuri Sybil, spam de PR-uri sau acumulare de terenuri virtuale.
3. **Atacatori Tehnici**: Încercări de corupere a stării, atacuri de rejucare (replay), dublă cheltuire a resurselor sau injectare de cod.

---

## 2. Sinteza Matriceală a celor 26 de Scenarii Adversariale (Scenariile A - Z)

| Scenariu | Tip Atac | Metodă de Eludare Testată | Răspuns de Securitate STUPUL | Rezultat Test |
|---|---|---|---|---|
| **A** | Economic | Fork de cod și ștergere fișier `royalties.ts` | Obligația e contractuală, detectată la auditul de conformitate | **PASS** |
| **B** | Economic | OpCo/IPCo Split (direcționare fonduri la firmă subsidiară) | Veniturile entităților afiliate sunt adăugate forțat în calcul | **PASS** |
| **C** | Economic | Rebranding (schimbare denumire, păstrare cod/IP) | Folosirea IP-ului original păstrează datoria contractuală | **PASS** |
| **D** | Economic | Deducere salarii, chirii birou și bonusuri directori | Regula anti-deturnare `LEG-T03` blochează calculul cu eroare | **PASS** |
| **E** | Economic | Mascare bani prin vânzare de monede virtuale (Gems) | Încasările reale din vânzarea jetoanelor sunt venit brut | **PASS** |
| **F** | Economic | Donații sau "tips" declarate drept non-comerciale | Donațiile primite de operator sunt incluse în baza eligibilă | **PASS** |
| **G** | Guvernanță | Spammer trimite sute de PR-uri automate | PR-urile fără teste sau recenzare primesc automat 0 puncte merit | **PASS** |
| **H** | Guvernanță | Self-Review (recenzentul își aprobă propriul PR) | Conflictul de interese este detectat; acordă 0 puncte merit | **PASS** |
| **I** | Guvernanță | Contributor inactiv încearcă să voteze cu puncte vechi | Punctele mai vechi de 90 de zile expiră complet (half-life 45z) | **PASS** |
| **J** | Guvernanță | Oligarh cumpără 1.000 de parcele pentru control politic | Votul cetățenesc rămâne strict 1 om = 1 vot (0 voturi din parcele) | **PASS** |
| **K** | Guvernanță | Monopol contributor cu 99.9% din punctele de merit | Plafonat strict la max 5% vot prin `freeze-and-redistribute` | **PASS** |
| **L** | Criptografie | Replay Attack pe challenge WebAuthn | Challenge-ul este consumat atomic; a 2-a încercare e respinsă | **PASS** |
| **M** | Criptografie | Utilizare challenge WebAuthn expirat | Respins automat conform TTL de 5 minute | **PASS** |
| **N** | Identitate | Înregistrare cu username scurt (<3 caractere) sau gol | Respins înainte de generarea challenge-ului criptografic | **PASS** |
| **O** | Securitate | Prototype Pollution în `SET_POLICY` (`__proto__`) | Detectat și blocat de reducer cu eroare de securitate | **PASS** |
| **P** | Simulare | Rată de impozit negativă sau peste 30% | Respinsă de reducer (valori permise doar între 0 și 30%) | **PASS** |
| **Q** | Concurrency | Dublă construire pe aceeași parcelă ocupată | Respinsă de invariantul `T-003` | **PASS** |
| **R** | Concurrency | Revendicare parcelă deja deținută de alt cetățean | Respinsă atomic de server cu `HTTP 409 Conflict` (`STP-T02`) | **PASS** |
| **S** | Resurse | Construcție fără credite virtuale suficiente | Respinsă de invariantul `T-004` (Fonduri insuficiente) | **PASS** |
| **T** | Geografie | Construire clădire pe apă (fără a fi fântână/apeduct) | Respinsă cu eroarea `Nu se poate construi pe apă` | **PASS** |
| **U** | Evoluție | Forțare modernizare clădire peste nivelul 3 | Respinsă cu eroarea `Nivel maxim atins` | **PASS** |
| **V** | Constituție | Modificare constituțională fără deliberare de 7 zile | Vot validat dar marcat ca `executable: false` | **PASS** |
| **W** | Constituție | Modificare constituțională fără timelock de 72 ore | Execuție blocată până la expirarea ferestrei de timelock | **PASS** |
| **X** | Constituție | Amendament fără 2/3 în Camera Cetățenilor | Respins (`passed: false`) pentru neîndeplinire supermajoritate | **PASS** |
| **Y** | Constituție | Amendament fără 2/3 în Camera Contributorilor | Respins (`passed: false`) pentru neîndeplinire supermajoritate | **PASS** |
| **Z** | Integritate | Import de snapshot JSON cu valori modificate manual | Respins pentru neconcordanță `stateHash` SHA-256 | **PASS** |
