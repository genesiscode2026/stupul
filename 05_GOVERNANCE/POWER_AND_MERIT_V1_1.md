# STUPUL — Constituția contribuției active (V1.1, norme de implementare propuse)

## Invarianta GOV-001: nicio putere permanentă cumpărată
- Un participant nu capătă vot suplimentar prin avere, proprietăți, donații, număr de acțiuni într-o firmă operatoare, achiziții premium sau popularitate pe rețele sociale.
- Fondatorul nu primește prin 5% drept de vot/veto suplimentar.
- Nicio singură persoană nu poate executa unilateral: modificări de constituție, transferul identității canonice, ștergerea jurnalului, plata recompenselor proprii, schimbări în rezultatul votului sau modificarea bazei redevenței.

## Domenii independente
A. **Cetățeni** decid priorități și politici ale lumii virtuale. Un cetățean eligibil = un vot, sub rezervă anti-Sybil și verificarea legală a datelor; NU pretindem verificare perfectă a identității.
B. **Contribuitori** decid agenda de produs și prioritizează lucrările tehnice, cu reputație bazată pe rezultate auditate în ultimele 90 zile.
C. **Operator comercial** deține și conduce activitatea economică a firmei sale potrivit actelor societare și legii, îndeplinește obligațiile reale. Nu poate rescrie rezultatul votului doar pentru că are 100% din acțiuni.
D. **Custode independent al proiectului**, când este constituit valabil, administrează marca, domeniul canonic, cheile release, catalogul de licențe și continuitatea. Are obligații fiduciare/contractuale conform formei juridice alese și nu poate fi revocat unilateral de operator.
E. **Fondator pasiv**: IP inițial dovedit + redevență 5% din exploatări licențiate; fără control din oficiu asupra A–D.

## GOV-010: reputație doar pentru lucrări validate
Contribuții eligible: cod integrat și testat; grafică originală licențiată; reducerea demonstrabilă a incidentelor; documentație acceptată; muncă civică/QA validată; creștere/retention atribuibilă prin metodologie onestă, nu număr brut de invitații. NU: linii de cod, număr de commit-uri, like-uri cumpărate, trafic brut, achiziții, autoaprobări.

La acceptarea unei contribuții: `awarded = min(100, max(0, rubricScore)) * impactWeight * independenceFactor`. impactWeight in {1,2,3}; independenceFactor 1 numai dacă reviewer este independent de contributor, altfel 0. Dovada tip, hash, semnătura evaluatorului, verificare teste și politică COI. Dacă 2 evaluatori sunt necesari, ambii independenți. Scorul nu reprezintă creanță bănească și NU determină automat remunerația.

Pentru ziua D: `activeMerit(D) = sum(awarded_i * 2 ^ (-ageDays_i / 45))`, doar pentru contribuții cu `ageDays <= 90`, non-revocate și auditate. Reducere la 50% la 45 zile; la 90 zile contorul încetează. Scorul de impact la venit NU înlocuiește testele de calitate și auditul.

## GOV-020: bicameralism și praguri
- Decizii obișnuite de gameplay: majoritate simplă în camera cetățenilor participanți, cvorum definit proporțional; decizii majore de gameplay: majoritate 60% în camera cetățenilor ȘI 60% în camera contributorilor; executarea e permisă doar dacă trec verificările de siguranță și legalitate.
- Amendamente constituționale: 2/3 în ambele camere, dezbatere >= 7 zile, timelock >= 72 ore, control independent pentru compatibilitatea cu contracte și lege; nu pot șterge dreptul contractual la 5%.
- Pentru camera contributorilor **în fază mică (<20 contribuitori eligibili) un contributor = un vot**. Pentru >=20 se poate activa merit ponderat, dar greutatea oricărui participant este maxim 5% din totalul camerei, folosind algoritm de redistribuire / cap iterativ; implementează teste care confirmă fezabilitatea plafonului. Fără activare la cohortă mică.
- Un vot delegat nu poate ocoli limita de 5%; delegările peste plafon se redistribuie sau se suspendă și rămân revocabile.
- Dacă sunt <7 contribuitori independenți sau <30 cetățeni eligibili, camera aferentă rămâne consultativă: nu se pot activa decizii comerciale sau amendamente fundamentale; folosește reguli inițiale transparente, revizuibile când există masă critică.
- Membrii cu conturi controlate de aceeași persoană nu trebuie să primească voturi multiplicate; analiza anti-Sybil poate introduce contestații și erori, astfel că deciziile importante necesită revizie.

## GOV-030: mandat prin performanță, nu popularitate permanentă
- Primar virtual: mandat 30 zile, maxim 2 consecutive; candidații trebuie să fi contribuit sau participat civic în ultimele 60 zile, cu criterii alternative accesibile persoanelor cu dizabilități. Nivelul averii este irelevant.
- Coordonator dezvoltare: mandat 60 zile, revizie la 30 zile, audit de livrabile. La inactivitate 30 zile fără justificare și fără livrabile: avertisment + fereastră de remediere 7 zile; apoi revocare prin procedură; mandatul nu se moștenește.
- Operator juridic comercial: managementul este decis potrivit legislației societare; comunitatea poate retrage statutul de *operator STUPUL autorizat* numai în condițiile contractului cu custodele, nu poate confisca acțiunile.
- Comisie electorală și revizori: mandate eșalonate, incompatibilități și rotație; membrii afectați de decizie nu votează cazul lor.

## GOV-040: control tehnic
Chei pentru release, plăți, domeniu, baza de date și backup rămân separate. La maturitate, transferul mărcii/domeniului și modificarea regulilor critice necesită aprobare de la custode + verificator tehnic independent + proces comunitar aplicabil; pragurile concrete trebuie transpuse în acte și gestionarea credentialelor; un singur admin de cloud nu poate pretinde descentralizare.

## GOV-050: drepturi și remedii
- Motive scrise pentru sancțiune, acces la dovezile permise, contestare, durată limitată, reversibilitate și audit.
- Nu sancționa automat lipsa viralei: algoritmul recomandării are zgomot, sezonalitate, cauzalitate dificilă; evaluează obiective controlabile (livrări, retenție măsurată, experimente oneste), cu drept de apel.
- Egalitate de șanse și accesibilitate: și contributorii non-tehnici pot construi reputație.
