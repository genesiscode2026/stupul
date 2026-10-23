# Contracte de domeniu și economie virtuală
## Structuri obligatorii
`World{id,seed,rulesetVersion,tick,version,treasury,tiles[],population,policies,historyHash}`;
`Tile{x,y,terrain,ownerAccountId|null,buildingId|null,districtId}`;
`CitizenCohort{count,education,health,safety,employment}`;
`Building{id,type,level,upkeep,inputs,outputs,position}`;
`Command{id,actorId,worldId,expectedVersion,type,payload,createdAt}`;
`Event{id,worldId,version,actorId,type,data,prevHash,hash}`;
`Proposal{id,kind,author,parameters,createdTick,closesTick,eligibilitySnapshot,yes,no,abstain,status}`;
`Contribution{id,author,type,licenseRef,reviewerIds,status,linkedCommit}`.

## Resurse și calcul
`food`, `materials`, `credits` sunt numere întregi ne-negative; `credits` sunt unități fictive în joc, nerecuperabile, netranzacționabile în bani reali. Fără transfer către portofel, cashout, stablecoins, piață secundară sau promisiune de valoare.

## Reguli de construcție
O parcelă are maximum o clădire; nu se construiește pe teren imposibil; resurse atomice debit-before-credit; nu se acceptă sold negativ; mutările respinse nu produc evenimente economice; buget public și personal sunt separate.

## Proprietate virtuală
Termeni clari: licență/revendicare revocabilă conform regulilor, nu drept real imobiliar și nu activ garantat. Fără achiziții cu bani reali în MVP. Cont opțional numai când utilizatorul vrea persistență pe server; rate limits și procedură pentru cont pierdut.

## Politici și drepturi
Politicile sunt parametri dintr-un registru permis (`taxRate` 0..20%, `educationAllocation` 0..40%, `safetyAllocation` 0..40%); nu accepta cod executabil propus de utilizatori. Nicio politică nu poate altera invariantul siguranței ori accesul tehnic. Votul egal nu este garantabil numai prin conturi; înregistrăm limitele modelului.

## Exemplu simulare explicit ilustrativ
Tick: producție hrană din ferme; consum proporțional populației; deficit afectează bunăstarea agregată; școlile cresc lent educația; siguranța influențează comerțul. Formulele sunt versionate și testate; coeficienții sunt parametri de design, NU date economice reale.

## Evitarea manipulării prin multi-account
Fără premii reale pentru acțiuni de joc; limitare și întârziere eligibilitate la vot, unicitate probabilistică fără a pretinde persoană unică, instrumente apel și suspendare; nu colecta identitate civilă decât cu temei valid și necesitate demonstrată.
