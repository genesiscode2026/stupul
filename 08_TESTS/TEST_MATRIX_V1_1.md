# MATRICE DE TESTARE ATOMICĂ — criterii de acceptare

### Guvernanță
- **GOV-T01**: utilizator cu 1.000.000 monede și 100 terenuri are EXACT aceeași greutate de vot în camera cetățenilor ca un utilizator eligibil fără bani.
- **GOV-T02**: deținătorul a 100% din operator are ZERO drepturi de vot adiționale în cameră.
- **GOV-T03**: fondatorul, prin 5% redevență, are ZERO drepturi de vot adiționale.
- **GOV-T04**: un contributor nu poate valida propria contribuție; conflict => awarded=0 până la reviewer independent.
- **GOV-T05**: contribuție acceptată în urmă cu 45 zile are jumătate din scorul rămas în urmă cu 0 zile; peste 90 zile nu contribuie la `activeMerit`.
- **GOV-T06**: sub 20 contributori eligibili, toate voturile contributorilor au greutate egală.
- **GOV-T07**: la >=20 contribuitori, nicio greutate finală nu depășește 5%; dacă algoritmul nu poate satisface, oprește decizia, nu falsează rezultatul.
- **GOV-T08**: schimbare fundamentală fără 2/3 din ambele camere => respinsă; fără 7 zile consultare sau 72 ore timelock => neexecutabilă.
- **GOV-T09**: primar inactiv fără livrabile/implicare => avertisment, termen de remediere și procedură de revocare; fără revocare arbitrară imediată.
- **GOV-T10**: admin D1 nu poate, prin UI/API, altera `voteResult` ori șterge event log; test de integritate și audit. Limita: proprietarul infrastructurii poate avea putere tehnică și în afara API-ului; necesară separare reală la M5.
- **GOV-T11**: contributorul care a produs 1000 de commit-uri fără merge și test nu obține puncte.
- **GOV-T12**: 100 invitații artificiale/spam nu se contabilizează ca rezultat de produs.

### Separare economică
- **LEG-T01**: revenue royalty calcul 100000 eligibile => 5000 către fondator contractual (brut înainte de reținere legală).
- **LEG-T02**: 100000 încasări, 10000 TVA, 2000 refunds, 1000 fee => 87000 bază, 4350 redevență brută; cheltuieli generale nu reduc baza.
- **LEG-T03**: venit afiliați atribuit exploatării acoperite se raportează conform regulii contractuale, nu dispare prin schimbarea denumirii produsului.
- **LEG-T04**: software independently reimplemented fără IP licențiat și fără contract => nu emite automat creanță de 5%.
- **LEG-T05**: fără operator și licență verificate => `monetizationEnabled=false`, inclusiv în env prod.
- **LEG-T06**: schimbarea adresei Exodus necesită autorizații valide și audit, nu admin unilateral anonim.
- **LEG-T07**: niciun cont al fondatorului în listele de admin operațional după predarea documentată.

### Joc, securitate și costuri
- **STP-T01**: replay cu același seed + event list produce același stateHash pe 1000 ticks.
- **STP-T02**: 1000 de acțiuni concurente pe aceeași parcelă nu pot produce dublă proprietate.
- **STP-T03**: joc offline/read-only funcționează când API/cloud respinge scrierile.
- **STP-T04**: niciun conținut arbitrar încărcat, monedă convertibilă, premii reale sau wallet în MVP.
- **STP-T05**: script rollback reface starea din snapshot + event log, fără pierdere silențioasă a istoricului.
- **STP-T06**: rol politic nu poate invoca endpoint-uri de plăți, deploy ori export date personale.

## Gate: niciun test juridic din cod nu înlocuiește verificarea juridică a contractelor semnate.
