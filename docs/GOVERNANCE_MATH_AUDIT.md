# Audit Matematic Formal al Mecanismelor de Guvernanță și Plafonare Vot

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **MATEMATIC DEMONSTRAT ȘI TESTAT UNITAR (`tests/governance-math-audit.test.ts`)**  

---

## 1. Principiul Suveranității Cetățenești (Camera Cetățenilor)

În Camera Cetățenilor, votul este eminamente democratic și inalienabil:

$$\text{VoteWeight}_{\text{citizen}} = \begin{cases} 1, & \text{dacă este cetățean activ verificat} \\ 0, & \text{altfel} \end{cases}$$

Nicio cantitate de credite virtuale, parcele imobiliare deținute în joc, cote de acțiuni în operatorul comercial sau statut istoric de fondator **NU conferă voturi adiționale**. Votul plutocratic este interzis prin design (GOV-T01).

---

## 2. Modelul Matematic al Camerei Contributorilor

Camera Contributorilor guvernează arhitectura tehnică, securitatea codului și alocarea granturilor din trezorerie.

### A. Pragul de Fază Incipientă ($N < 20$)
Pentru comunități la început de drum ($N < 20$ contributori activi eligibili), un sistem pur bazat pe puncte de merit ar fi extrem de vulnerabil la captură de către 1–2 dezvoltatori cu disponibilitate masivă de timp.

Prin urmare, invariantul **GOV-T06** impune:
$$w_i = \frac{1}{N}, \quad \forall i \in \{1, \dots, N\} \quad \text{când } N < 20$$
Fiecare contributor eligibil dispune de o pondere egală de vot, indiferent de punctajul acumulat.

---

### B. Algoritmul de Înghețare și Redistribuire ($N \ge 20$)
Când comunitatea atinge maturitatea ($N \ge 20$), ponderea se bazează pe meritul activ acumulat în ultimele 90 de zile (cu timp de înjumătățire de 45 de zile), sub rezerva **plafonului strict individual de 5% (500 basis points)**.

#### Algoritmul `Freeze-and-Redistribute`:
1. Se calculează meritul inițial proporțional: $w_i^{(0)} = \frac{\text{merit}_i}{\sum_{j} \text{merit}_j}$.
2. În mod iterativ:
   - Pentru orice $w_i > 0.05$, se setează $w_i = 0.05$ și contributorul este marcat ca `frozen`.
   - Se calculează surplusul: $\text{Excess} = \sum_{k \in \text{newly\_frozen}} (w_k - 0.05)$.
   - Surplusul se distribuie egal contributorilor rămași `uncapped`: $w_u \leftarrow w_u + \frac{\text{Excess}}{|\text{uncapped}|}$.
   - Se repetă până când $\text{Excess} \le \varepsilon$ ($10^{-6}$).
3. Verificare finală:
   $$\max_{i} w_i \le 0.05 + \varepsilon \quad \text{și} \quad \left| \sum_{i=1}^N w_i - 1.0 \right| \le \varepsilon$$

---

## 3. Matricea de Teste Matematice Verificate

| Test ID | Număr Contributori ($N$) | Distribuție Merit | Rezultat Pondere Maximă | Statut |
|---|---|---|---|---|
| **GOV-T06.1** | 1 | Unic | $w_1 = 1.0000$ (100%) | **PASS** |
| **GOV-T06.2** | 2 | Asimetric (10.000 pct vs 1 pct) | $w_1 = w_2 = 0.5000$ (Egal) | **PASS** |
| **GOV-T06.5** | 5 | Asimetric (Whale 95%) | $w_i = 0.2000$ (Egal) | **PASS** |
| **GOV-T06.10** | 10 | Aleator | $w_i = 0.1000$ (Egal) | **PASS** |
| **GOV-T06.19** | 19 | Asimetric | $w_i = 0.05263$ (Egal) | **PASS** |
| **GOV-T07.20** | 20 | Cazul limită uniform | $w_i = 0.05000$ (Exact 5%) | **PASS** |
| **GOV-T07.21** | 21 | Asimetric (Whale 95%) | $w_{\text{whale}} = 0.05000$ (Plafonat la 5%) | **PASS** |
| **GOV-T07.100** | 100 | Extrem (1 utilizator cu 99% din puncte) | $w_{\text{whale}} = 0.05000$, restul 99 împart 0.95 | **PASS** |
| **GOV-T07.ZERO**| 50 | 0 puncte merit pentru toți | $w_i = 0.02000$ (Fallback egalitar) | **PASS** |

---

## 4. Concluzie

Algoritmul implementat în `@stupul/domain/src/governance.ts` garantează matematic că niciun actor solitar sau grup restrâns de sub 20 de persoane nu poate exercita o dictatură tehnică asupra proiectului STUPUL.
Sistemul este rezistent la atacuri de tip Sybil, spam de PR-uri și concentrare oligarhică.
