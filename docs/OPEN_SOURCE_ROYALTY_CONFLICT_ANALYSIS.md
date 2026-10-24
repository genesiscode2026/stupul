# Analiză Comparativă: Conflictul Dintre Licențierea Open Source (OSI) și Redevența de 5%

Data: 24 Octombrie 2026  
Statut: **RECOMANDARE ARHITECTURALĂ ȘI STRATEGICĂ DE LICENȚIERE**  

---

## 1. Problema Structurală a Licențelor Open Source Pure (OSI)

Există o contradicție juridică directă și ireconciliabilă între definiția oficială Open Source (OSI - Open Source Initiative) și orice obligație de plată a unei redevențe de 5%:

> [!WARNING]
> **Criteriul 6 din Open Source Definition (OSD): "No Discrimination Against Fields of Endeavor"**  
> *"The license must not restrict anyone from making use of the program in a specific field of endeavor. For example, it may not restrict the program from being used in a business, or from being used for genetic research."*

Dacă un repository este publicat sub o licență aprobată OSI (cum ar fi **MIT, Apache 2.0 sau BSD-3-Clause**):
1. Oricine are dreptul legal deplin de a forka codul;
2. Poate comercializa jocul, vinde bunuri virtuale și percepe taxe de acces;
3. **Nu are nicio obligație legală de a plăti vreun procent (nici măcar 1 cent) către autorul inițial.**

Orice clauză suplimentară adăugată unei licențe MIT de tipul *"dar utilizatorii comerciali trebuie să plătească 5% către fondator"* transformă licența într-o licență non-OSI (non-open source în sens tehnic/juridic).

---

## 2. Compararea Celor Trei Modele de Licențiere

### Modelul A: Open Source Pur (OSI — MIT / Apache 2.0)
- **Cum funcționează**: Codul este 100% liber. Oricine îl poate descărca, modifica și vinde.
- **Avantaje**: Adopție maximă în comunitatea open-source tradițională, integrare fără fricțiuni în pachete npm publice.
- **Dezavantaje Majore**: **Redevența de 5% devine o simplă donație voluntară**. Nu există nicio pârghie legală împotriva unui operator care obține milioane de dolari din joc și refuză să plătească cei 5%.
- **Verdict**: **INCOMPATIBIL cu cerința de protecție obligatorie a redevenței fondatorului.**

---

### Modelul B: Licență cu Sursă Disponibilă (Source-Available / Fair Source)
- **Exemple din industrie**: Business Source License (BSL/MariaDB), Elastic License v2, Unreal Engine EULA.
- **Cum funcționează**:
  - Codul este 100% public și transparent pe GitHub;
  - Utilizarea necomercială, explorarea civică, serverele private gratuite și auditurile educaționale sunt complet gratuite;
  - Utilizarea comercială (monetizare > prag prestabilit, de ex. 10.000 USD/an) necesită **obligatoriu** semnarea Acordului de Licență Comercială STUPUL și plata a 500 basis points (5%) din încasările eligibile.
- **Avantaje**: Transparență totală a codului, protecție legală reală a redevenței, opozabilitate în instanță împotriva copierii comerciale nelicențiate.
- **Verdict**: **MODEL RECOMANDAT pentru protecția integrității proiectului STUPUL.**

---

### Modelul C: Licențiere Duală (Dual Licensing)
- **Cum funcționează**:
  - Motorul de calcul deterministic (`@stupul/engine`) este licențiat MIT (poate fi folosit ca bibliotecă de simulare de oricine);
  - Componentele de domeniu, logica de guvernanță, serverul autoritativ, activele artistice și marca "STUPUL" sunt licențiate sub Acordul Comercial de Redevență STUPUL.
- **Avantaje**: Oferă comunității un nucleu matematic complet liber, protejând în același timp jocul complet și canalul comercial.
- **Verdict**: **ALTERNATIVA VIABILĂ PENTRU MAXIMIZAREA ADOPȚIEI TEHNICE.**

---

## 3. Recomandarea Strategică a Echipei de Arhitectură

Recomandăm adoptarea **Modelului B (Source-Available Commercial Agreement)** sau **Modelului C**:
1. Menținerea codului complet deschis pentru audit public și verificare civică;
2. Stipularea clară în fișierul `LICENSE` că operarea comercială este guvernată de `COMMERCIAL_LICENSE_AGREEMENT.md`, incluzând obligația strictă de 5% (500 bp) redevență către fondator;
3. Păstrarea drepturilor exclusive asupra mărcilor, identității vizuale și a hărților de joc.
