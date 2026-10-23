# STUPUL GENESIS v1.1 — Constatări de Securitate

Data: 23.10.2026 · Auditor: Cline

## 1. Delimitarea garanțiilor (esențial pentru onestitate)

### Garanții ale motorului local (reale, verificabile)
- Reducător pur determinist `reduce(state, command)` — nicio sursă de aleatoriu externă.
- Resursele nu pot deveni negative (verificări `>= 0`), coordonatele sunt validate `Number.isInteger` + limite 0..15.
- Politicile sunt validate pe intervale; cheile `__proto__`/`constructor`/`prototype` respinse.
- Snapshot import: limită 5MB, respingere chei interzise, validare grilă 16×16, verificare hash.
- Deduplicarea voturilor per `actorId` (ultimul buletin câștigă) — previne dubla numărare a aceluiași identificator.

### Garanții server-side
- **Nu există server multiplayer.** Toate garanțiile de mai sus sunt locale și pot fi ocolite de un
  utilizator avansat care modifică JavaScript-ul din DevTools sau localStorage.

### Proprietăți simulate
- `checkRolePermission`, `verifyEventLogIntegrity`, `mayMonetize`, `updatePayoutAddress` sunt **funcții pure**
  care modelează reguli; ele **nu** sunt aplicate de niciun server și nu conferă securitate reală.

### Protecții care lipsesc încă
- **Identitate/eligibilitate reală** (1 om = 1 vot) — nu există WebAuthn, KYC sau verificare de identitate.
- **Atomicitate tranzacțională distribuită** — testul local „100 comenzi concurente" nu dovedește nimic
  într-un sistem cu mai multe servere/clienți.
- **Autorizare aplicată** — rolurile sunt verificate doar ca funcții, nu există endpoint-uri reale de autorizat.
- **Autenticitatea stării** — hash-ul SHA-256 este recalculabil de client, deci nu este dovadă de autenticitate.

## 2. Verificări efectuate

| Verificare | Rezultat |
|---|---|
| `dangerouslySetInnerHTML` / `innerHTML` / `eval` / `new Function` | **Nu există** (XSS redus; React escapează implicit) |
| Apeluri de rețea externe (`fetch`, `axios`, `WebSocket`, `http(s)://`) în `apps/web/src` | **Nu există** (aplicație 100% locală) |
| Chei private / seed phrase / token / parole în cod | **Nu există** (doar numele câmpului `key` din localStorage) |
| `localStorage` | doar `stupul_game_save_v1_1` și `stupul_tutorial_seen` — fără PII |
| `npm audit` | 6 vulnerabilități în dev-dependențe (vezi mai jos) |
| Prototype Pollution (import snapshot + politici) | respins (testat SEC-JSON-INJECT / SEC-FRAUD-CMD) |
| Frauda economică (MINT_FREE_CREDITS etc.) | respins (SEC-FRAUD-CMD) |
| Vot multiplu (50 buletine același actorId) | deduplicat la 1 (SEC-VOTE-DEDUP) |

## 3. Vulnerabilități în dependențe (`npm audit`)
Toate cele 6 sunt în **dev-dependențe** (nu ajung în bundle-ul de producție `apps/web/dist`):
- `tinypool <=2.1.1` (critical) — Prototype Pollution/RCE în test runner (via Vitest).
- `@vitest/mocker` / `vitest <=4.1.10` (moderate) — path traversal/code injection în mock-uri.
- `esbuild <=0.24.2` / `vite <=6.4.3` (moderate) — dev server poate citi răspunsuri.
- **Remediere:** necesită upgrade major (`vitest@5`, `vite@8`) care poate schimba API-urile de test — amânat
  deliberat pentru a nu destabiliza suita; documentat ca etapă viitoare.

## 4. Recomandări (etape viitoare)
1. Server autoritativ (Cloudflare Worker) care execută `@stupul/engine` — singurul adevăr al stării.
2. Identitate: WebAuthn/passkeys + constrângere UNIQUE `(proposal_id, actor_id)` în DB.
3. Semnătură reală (nu hash recalculabil) pentru jurnalul de evenimente.
4. Upgrade Vitest/Vite pentru a elimina vulnerabilitățile de dev.
