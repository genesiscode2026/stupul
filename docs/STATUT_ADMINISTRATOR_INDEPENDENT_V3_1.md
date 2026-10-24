# STATUTUL ADMINISTRATORULUI CONTRACTUAL INDEPENDENT (CUSTODELE GENESIS)
## Arhitectură Fiduciară și Guvernanță Neutră — G-005
**Versiune:** GENESIS v3.1  
**Data:** 24 Octombrie 2026  
**Document:** `docs/STATUT_ADMINISTRATOR_INDEPENDENT_V3_1.md`

---

## 1. Misiunea și Necesitatea unui Administrator Independent

Pentru ca Fondatorul să poată rămâne **complet pasiv**, fără a fi nevoit să investigheze lunar rapoartele contabile ale operatorilor, să urmărească tranzacțiile financiare, să aprobe transferuri corporative sau să intenteze acțiuni în justiție la fiecare neconcordanță, este instituită figura **Administratorului Contractual Independent (Custodele)**.

> [!IMPORTANT]
> **DELIMITARE DE FAPT ȘI DE DREPT:**  
> - Administratorul Independent **NU este Fondatorul** și nu este controlat de Fondator.  
> - În prezentul stadiu de dezvoltare tehnică (Genesis v3.1), **nu pretindem că o astfel de entitate este deja numită** sau activă în fapt.  
> - Prezentul statut definește atribuțiile, criteriile de eligibilitate și contractul-cadru pentru ca o entitate reală (casă de avocatură, societate fiduciară, agent de escrow sau asociație non-profit de administrare a drepturilor de autor) să poată prelua acest mandat prin contract valabil la momentul primei cesiuni comerciale.

---

## 2. Atribuțiile Custodelui Independent

1. **Evidența Contractelor și a Succesiunii:**  
   Păstrează arhiva securizată a tuturor contractelor de cesiune, acordurilor de aderare (Deeds of Adherence) și a certificatelor interne de transfer conform GENESIS.
2. **Registrul Operatorilor:**  
   Menține lista publică actualizată a operatorilor comerciali autorizați să exploateze STUPUL.
3. **Registrul Beneficiarului & Protecția Payout:**  
   Păstrează datele de identificare și adresa publică de plată Exodus a Fondatorului, avizând orice cerere de modificare doar după verificarea asimetrică a identității solicitantului.
4. **Auditul Financiar & Reconcilierea Redevențelor:**  
   Primește lunar rapoartele de încasări brute și deduceri transmise de Operator; execută verificarea deterministică prin modulul `reconcileBatch()` din `@stupul/genesis-integrity`.
5. **Evidența Creanțelor Restante & Notificări:**  
   Dacă un operator întârzie plata peste scadența de 30 de zile, Custodele emite notificarea formală de conformare și calculează penalitățile contractuale.
6. **Administrarea Garanțiilor & Proceduri de Recuperare:**  
   În caz de neplată sau insolvență a operatorului, Custodele execută garanțiile constituite sau transferă exploatarea către un operator succesor agreat de comunitate.
7. **Verificarea Integrității Tehnice:**  
   Semnează cryptographic (Ed25519) manifestul versiunilor oficiale ale jocului și validează respectarea invarianților constitutionali.

---

## 3. Criterii de Eligibilitate & Incompatibilități

Pentru a garanta neutralitatea absolută, Custodele:
- **NU poate fi Operatorul Comercial** al jocului sau o filială a acestuia;
- **NU poate fi Primarul sau un membru al Consiliului Civic** din cadrul guvernanței de joc;
- **NU poate deține acțiuni sau interese patrimoniale directe** în societatea care exploatează jocul;
- **NU poate fi Fondatorul** (pentru a respecta decizia fermă a acestuia de neimixtiune în administrare).

---

## 4. Finanțarea Serviciilor de Custodie

Costurile rezonabile de administrare ale Custodelui Independent (onorarii profesionale de audit și evidență fiduciară):
- Sunt suportate de **Operatorul Comercial** ca o obligație contractuală de licențiere;
- **NU se deduc din redevența de 5%** a Fondatorului;
- În caz de litigiu generat de reaua-credință a unui operator, cheltuielile de recuperare și asistență juridică sunt imputate exclusiv operatorului în culpă.

---

## 5. Model de Numire a Custodelui

Numirea formală se realizează prin **Contractul Tripartit de Custodie și Monitorizare a Exploatării STUPUL**, semnat între:
1. **Fondator** (în calitate de autor inițial și beneficiar al redevenței de 5%);
2. **Operatorul Comercial** (în calitate de cesionar/exploatator obligat la plată);
3. **Custodele Desemnat** (în calitate de fiduciar și administrator de continuitate).
