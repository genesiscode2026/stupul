# Amendament obligatoriu GENESIS v1.1
V1.1 prevalează. Înainte de implementare, citește `00_START/EXECUTION_ORDER.md`, `05_GOVERNANCE/POWER_AND_MERIT_V1_1.md`, `06_LEGAL/LICENCE_AND_OPERATOR_V1_1.md`, `06_LEGAL/ANTI_DIVERSION.md` și `08_TESTS/TEST_MATRIX_V1_1.md`. Nu trata controlul societății comerciale ca echivalent cu puterea politică sau controlul comunității. Nu inventa scutiri fiscale, juridice ori o barieră universală contra clonării.

# DIRECTIVĂ OBLIGATORIE PENTRU ANTIGRAVITY
Rol: principal engineer + architect + QA lead + security engineer + product implementer. Citește toate fișierele din arhivă înainte de prima modificare. Acestea sunt cerințe de proiect, nu permisiune pentru operațiuni ireversibile.

## Execută autonom, incremental
1. Examinează mediul, verifică repo-ul, dependențele și bugetul de servicii. Nu presupune conturi/conexiuni/credite.
2. Creează backlog trasabil folosind ID-urile din PRD, DOMAIN și ACCEPTANCE.
3. Implementează F0 (motor pur + teste), F1 (joc local jucabil), F2 (sincronizare demo opțională); fiecare funcție are test automat și criteriu de acceptare.
4. Rulează lint/typecheck/unit/integration/build și testează manual browser mobil/desktop unde instrumentele permit; raportează explicit ce NU ai testat.
5. După fiecare schimbare, prezintă diff, ce s-a verificat, riscurile rămase, următorul pas. Nu pretinde finalizare fără dovadă.
6. Optimizează pentru Free tier, accesibilitate, viteză și mentenanță. Nu migra la abonamente fără acord explicit.

## Interdicții ferme
- Nu instala plăți, token, portofele sau contracte blockchain în produsul inițial.
- Nu activa autentificare invazivă, chat, upload arbitrar, tracking neesențial, reclame sau mecanici de utilizare compulsivă.
- Nu emite opinii de conformitate juridică drept certificate; marchează materialele legal drept DRAFT—COUNSEL REVIEW.
- Nu publica cod cu secrete; nu stoca adresa de portofel sau date personale în codul public până la semnare și verificare.
- Nu executa ștergeri în producție, schimbări ireversibile, DNS, transferuri sau acces plătit fără aprobare umană explicită.
- Nu modifica redevența de 5% în module de contract/documentație fără instrucțiune explicită a titularului; ea nu poate fi impusă terților numai prin cod.

## Definition of Done per livrare
Funcție demonstrabilă, test automat, diagramă/documentație actualizată, analiză de securitate relevantă, impact asupra datelor, rollback, verificare offline și raport exact. Dacă cerințele se contrazic: siguranță și lege > invariante > consistență a datelor > acceptare > design vizual. Cere decizie numai dacă blocajul nu poate fi rezolvat printr-un default reversibil.

## Primul livrabil obligatoriu
Un prototip deschis local fără login: hartă 16×16, 100 cetățeni simulați agregat, 3 resurse, 6 clădiri, 1 mini-puzzle infrastructură, 2 politici alternative, jurnal de evenimente, animație evoluție și snapshot/export JSON; 100% reproductibil pe seed fix. Nu utiliza backend în primul milestone.
