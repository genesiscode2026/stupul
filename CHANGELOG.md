# STUPUL — Jurnal de Schimbări (CHANGELOG)

## [1.1.0-genesis] — 23.10.2026

### Arhitectură & Infrastructură Locală (Zero-Cost / Free-Tier)
- Inițializat monorepo modular TypeScript (`@stupul/domain`, `@stupul/engine`, `@stupul/shared`, `@stupul/web`).
- Creat `docs/requirements-traceability.md` cu maparea completă a tuturor cerințelor `STP-*`, `GOV-*`, `LEG-*`.
- Creat `docs/contradictions.md` cu analiza și reconcilierea exhaustivă a contradicțiilor v1.0/v1.1 conform ierarhiei normative.
- Pregătită structura portabilă pentru deployment static pe Cloudflare Pages și Workers fără dependențe de servicii terțe plătite.

### Motorul de Simulare & Joc Deterministic (`@stupul/engine`)
- **STP-001**: Hartă izometrică 2D (16x16 parcele) cu suport zoom, pan, selecție celule, tooltip informativ și redare adaptivă Retina / DPR.
- **STP-002**: Sistem de resurse întregi (fără flotanți financiari): Hrană, Materiale de construcție și Credite Virtuale (V-Credits).
- **STP-003**: Populație inițială simulată agregat (100 NPC), calcul compozit de satisfacție (hrană, adăpost, apă, siguranță, educație), dinamică de imigrări/nașteri și prevenire a mortalității.
- **STP-004**: Catalog complet de clădiri de frontieră: Casă de Lemn, Fermă Comunitară, Puț cu Ciutură, Hambar & Depozit, Școală Publică, Primărie, Atelier Meșteșugăresc, Dispensar Medical, Post de Pază, Drumuri Pietruite.
- **STP-005**: Mini-puzzle interactiv de apeduct (4x4) cu validare topologică BFS și bonus de producție agricolă (+30%) la conectare.
- **STP-006**: Politici și legi versionate: impozit virtual (0-30%), regim de rații alimentare (auster/standard/abundent), subvenție pentru școli, buget de mentenanță a infrastructurii.
- **STP-007 & STP-T01**: Reducător pur determinist `reduce(state, command)`, generator pseudo-aleator Mulberry32 cu seed fix și calcul sincron al sumei canonice SHA-256 (testat determinism identic pe 1000 de pași).
- **STP-008 & STP-T02**: Parcele și proprietăți pur virtuale în joc; prevenire automată a dublei alocări sau dublei construcții.
- **STP-014 & STP-T03**: Funcționare completă offline; salvare automată locală și export/import snapshot JSON securizat.
- **STP-015**: Mod oaspete nativ (fără cont obligatoriu, fără colectare de date personale).

### Guvernanță & Meritocrație (`@stupul/domain`)
- **GOV-001 & GOV-T01..T03**: Invarianta egalității civice: averea în monede virtuale, parcelele și cota de acțiuni în firma comercială conferă **0 voturi suplimentare** (1 cetățean eligibil = 1 vot).
- **GOV-010 & GOV-T04..T05**: Reputație și Merit acordate strict pe contribuții validate independent cu CLA acceptat; atenuare temporală cu half-life de 45 de zile și anulare completă după 90 de zile.
- **GOV-020 & GOV-T06..T08**: Sistem bicameral: egalitate de vot sub 20 de contributori; plafon strict de maximum 5% din greutate per contributor la >= 20; supermajoritate de 2/3 în ambele camere pentru schimbări constituționale (cu 7 zile deliberare și 72h timelock).
- **GOV-030 & GOV-T09**: Mandate limitate pentru primar (30 de zile, maximum 2 mandate consecutive); procedură protejată de revocare la 30 zile inactivitate + 7 zile termen de remediere.
- **GOV-040 & GOV-T10**: Jurnal de evenimente append-only cu verificarea integrității secvențiale și a lanțului de hash-uri.
- **GOV-T11..T12**: Zero puncte pentru commit-uri fără teste/merge sau trafic artificial/spam.

### Drepturile Fondatorului & Separare Economică
- **LEG-001 & LEG-T01..T02**: Redevență contractuală fixă de 5% calculată exclusiv din încasările nete eligibile (fără deducerea salariilor, marketingului sau a cheltuielilor generale de regie).
- **LEG-002 & LEG-T03**: Clauze anti-deturnare aplicabile veniturilor din entități afiliate și produse asociate acoperite.
- **LEG-004 & LEG-T05**: Legal Gates fail-closed: monetizarea rămâne blocată până la semnarea documentelor de către toate părțile și avizul juridic formal.
- **LEG-006 & LEG-T06**: Procedură de custodie multi-semnătură pentru destinația de plată (Exodus pe rețeaua Base / USDC), fără expunerea cheilor private în cod.
- **LEG-007 & LEG-T07**: Excluderea automată a fondatorului pasiv din rolurile operaționale de administrare a firmei.

### Testare & Verificare
- 26 de teste automate unitare și de integrare rulate cu Vitest: **26 trecute, 0 eșuate**.
- Verificare build de producție Vite: **1.23s, 0 erori**.
