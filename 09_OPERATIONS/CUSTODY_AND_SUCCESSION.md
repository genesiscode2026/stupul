# Administrare, continuitate și predare

## Starea inițială
Fondatorul controlează, în fapt, repo și infrastructura; nu pretinde independență operațională ori imunitate juridică până la predare. În faza publică identificați clar operatorul efectiv.

## Starea-țintă contractată
- Custode independent deține/administrează valid marca (dacă înregistrată), domeniul canonic și licența identității de proiect.
- Operatorul comercial deține propria firmă/active, produce venit, răspunde legal, operează aplicația sub licență.
- Contribuitorii participă la dezvoltare și beneficiază de recompense contractate; camera meritocratică nu este registru de acțiuni sau creanțe.
- Fondatorul nu este admin/reprezentant și nu aprobă fiecare operațiune; primește 5% pe baza contractelor, cu fiscalitatea aplicabilă.

## Secret management
Separare identități pentru repo, deploy, DB, backup, procesator, licență și contabilitate. 2FA + minim privilegii. Nu hardcoda chei sau wallet în repo. Operațiunile de registru sunt jurnalizate și revizuite independent. Custodele nu stochează seed-ul Exodus.

## Continuitate și migrare
Snapshots zilnice sau în funcție de trafic, verificare restore trimestrial, export date numai legal, semnare releases, jurnal append-only, procedură incident publică. Dacă operatorul abandonează proiectul, custodele activează remediile și poate licenția alt operator **doar cu drepturi/chei/date asupra cărora are titlu legitim**. Nu încălca drepturile utilizatorilor sau furnizorilor.

## Cost-control
Zero buget lunar implicit; free-tier monitorizat; no auto upgrade. La limite read-only și amânare a contribuțiilor; monetizarea și plățile implică costuri legale/financiare imposibil de garantat 0€.
