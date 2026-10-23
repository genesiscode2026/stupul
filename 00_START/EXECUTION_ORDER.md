# Ordin de execuție pentru Antigravity — GENESIS V1.1

## P0 — audit înainte de cod
- Listează repo-ul curent și confirmă că ai citit V1.0 + V1.1; identifică și reconciliază contradicții. Nu inventa credite sau integrări existente.
- Deschide `05_GOVERNANCE/POWER_AND_MERIT_V1_1.md`, `05_GOVERNANCE/DECISION_RIGHTS.md`, `06_LEGAL/LICENCE_AND_OPERATOR_V1_1.md`, `06_LEGAL/ANTI_DIVERSION.md`.
- Creează `docs/requirements-traceability.md` mapând toate ID-urile `STP-*` și `GOV-*` la cod/test/artefact.
- Verifică dacă numele STUPUL și grafica pot fi folosite; **nu declara marca disponibilă** fără verificare efectivă.

## P1 — implementare fără costuri
- Construiește offline în TypeScript pur motorul determinist 16×16, 100 NPC agregat, clădiri, terenuri, resurse, profesii, mini-puzzle, 2 politici, snapshots și replay.
- Adaugă exclusiv bani virtuali neconvertibili; nicio funcție monetară reală, nicio legătură către portofel în gameplay.
- Construiește contribuții reale fictive în sandbox pentru testul guvernanței: quality gate, independent reviewer, conflict check, decizie bicamerală și expirare scor.

## P2 — verificare
- Typecheck, teste unitare, property-based sau fuzz pentru invarianta scorului, teste de scenarii de fraudă, build de producție local, mobil + desktop; prezintă ieșirile și limitele testării.
- Pentru proiectul public, API read-only până la gate-ul legal L1 și teste de securitate relevante.

## P3 — livrabile finale ale fiecărei iterații
`CHANGELOG.md`, diffs, teste rulate, raport de securitate, buget măsurat, ce este neimplementat, plan de rollback. Nicio migrare distructivă automată, fără încasări, fără promovare cu promisiuni financiare.

## Reguli de rezolvare a contradicțiilor
Lege aplicabilă > siguranță utilizator/date > GENESIS v1.1 > GENESIS v1.0 > design propus AI. Dacă o condiție legală impune aprobarea titularului, nu o eluda doar ca să păstrezi cerința lipsei consimțământului ulterior.
