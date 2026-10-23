# RAPORT DE EVALUARE A SECURITĂȚII — STUPUL GENESIS v1.1

Data: 23.10.2026
Clasificare: AUDIT DE SECURITATE TEHNICĂ ȘI MODEL DE AMENINȚĂRI

---

## 1. Analiza Modelului de Amenințări (STRIDE)

| Categorie | Amenințare Specifică în STUPUL | Mecanism de Atenuare Implementat | Statut |
|---|---|---|---|
| **Spoofing (Falsificare Identitate)** | Trimiterea de voturi în numele altui cetățean sau falsificarea rolului de evaluator la contribuții. | `contributionAward()` verifică independența evaluatorului și interzice autoevaluarea (`reviewerIds.includes(actorId) => 0`). Deduplicarea voturilor pe `actorId`. | Atenuat |
| **Tampering (Alterare Date)** | Modificarea stării orașului (creare de monede din nimic, modificarea proprietarului de parcelă). | Determinism pur: `nextState = reduce(prevState, command)`. Hash SHA-256 canonic recalculat sincron. Orice parcelă deja deținută respinge revendicarea (`STP-T02`). | Atenuat |
| **Repudiation (Repudiere)** | Negarea acțiunilor civice sau a rezultatelor votului. | Jurnal de evenimente append-only (`CityEvent`), legat prin lanț criptografic `stateHashBefore -> stateHashAfter` cu secvență strict crescătoare (`GOV-T10`). | Atenuat |
| **Information Disclosure (Scurgere Date)** | Expunerea de date personale, adrese IP, chei private sau seed phrases. | **Zero chei private în cod**. Fără wallet în gameplay. Mod oaspete nativ fără colectare de nume reale sau e-mailuri. Serverul de dezvoltare este legat exclusiv la `127.0.0.1`. | Atenuat |
| **Denial of Service (Blocare Serviciu)** | Trimiterea de coordonate float, fișiere snapshot de dimensiuni uriașe sau bucle infinite. | Limitare dimensiune snapshot la 5MB, validare strictă a numerelor întregi (`Number.isInteger`), timeout și protecție împotriva payload-urilor cu chei `__proto__`. | Atenuat |
| **Elevation of Privilege (Escaladare Privilegii)** | Un jucător bogat sau proprietarul firmei încearcă să obțină voturi suplimentare sau drepturi de administrare a fondurilor. | Regula supremă `citizenVoteWeight` (bogăția și cota de acțiuni dau 0 voturi în plus). `checkRolePermission` blochează accesul rolurilor din joc la acțiuni administrative sau plăți. | Atenuat |

---

## 2. Securitatea Dependențelor și Rețelei

1. **Izolare Rețea Locală:**
   - Serverul Vite este configurat în mod expres cu `host: '127.0.0.1'`.
   - Este interzisă expunerea pe `0.0.0.0` sau în rețeaua locală Wi-Fi/LAN în faza de dezvoltare.
2. **Dependențe Open-Source:**
   - Stack-ul folosește exclusiv pachete verificate: React 18/19, Vite, Lucide-React, TypeScript, Vitest.
   - Nicio dependență proprietară externă sau serviciu plătit nu este apelat.
3. **Legal Gates Fail-Closed:**
   - Monetizarea reală este controlată prin `mayMonetize(gate)`.
   - Valoarea implicită este `DEFAULT_LOCKED_LEGAL_GATE` (toate cele 6 porți sunt `false`). Fără aprobarea cumulativă semnată a operatorului, inventarului IP, licenței, avocatului și consultanței fiscale, este tehnic imposibil să se activeze fluxuri de plată.
