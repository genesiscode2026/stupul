# Strategia de Creștere Organică și Măsurarea Tracțiunii cu Zero-PII

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **IMPLEMENTAT ȘI ALINIAT CU PRINCIPIUL ETIC P6**  

---

## 1. Principiul Creșterii Fără Bugete de Marketing

STUPUL a fost conceput ca o civilizație persistentă condusă de comunitate, nu ca un produs speculativ promovat prin campanii agresive de reclame plătite.
În conformitate cu Invariantul **LEG-T03**, bugetele de publicitate plătită nu pot fi deduse din veniturile brute eligibile pentru redevență.

Creșterea se bazează exclusiv pe trei pârghii organice:
1. **Atractivitatea Mecanicilor de Joc (Gameplay-first)**: Simularea urbană dinamică, satisfacția cetățenilor, puzzle-ul de inginerie hidraulică și dezvoltarea vizuală a orașului oferă o experiență de joc captivantă;
2. **Distribuție prin Partajare Suverană (Share Link)**: Funcționalitatea din TopBar permite oricărui primar să copieze un link direct cu progresul orașului (`/?visit=1&tick=140&stage=oras`) pentru a invita prieteni sau membri ai comunității;
3. **Preluare Comunitară Deschisă**: Ghidul `CONTRIBUTING.md` și șabloanele GitHub permit oricărui dezvoltator sau artist să adauge conținut, obținând recunoaștere și vot de merit în Camera Contributorilor.

---

## 2. Telemetrie Etică cu Zero-PII (Privacy-Preserving Telemetry)

Proiectul refuză utilizarea scripturilor terțe invazive (Google Analytics, Meta Pixel, Hotjar sau amprentare de dispozitiv / fingerprinting).

Măsurarea tracțiunii se realizează exclusiv prin indicatori anonimi de utilizare agregați:

| Metrică Etică | Semnificație pentru Produs | Cum se Măsoară |
|---|---|---|
| **Evoluția Pașilor de Simulare (Ticks)** | Măsoară timpul efectiv petrecut în simulare | Contor intern determinist `state.tick` |
| **Densitate Urbană (Clădiri Construite)** | Măsoară implicarea în planificarea orașului | Număr parcele cu `building !== null` |
| **Rată de Rezolvare Puzzle Apeduct** | Măsoară interesul pentru provocările logice | Contor `infrastructurePuzzle.timesSolved` |
| **Participare Democratică** | Măsoară interesul pentru auto-guvernare | Număr voturi înregistrate pe propuneri |
| **Stabilitate Tehnică (Zero Erori 500)** | Calitatea experienței multiplayer | Jurnale HTTP autoritative |

Toate aceste date sunt publice, transparente și inspectabile direct de comunitate prin apeluri la `/api/state` și `/api/events`.
