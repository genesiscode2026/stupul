# STUPUL GENESIS v2.0 — Audit de Securitate pentru Lansare

Data: 24.10.2026 · Auditor: Cline

## 1. Rezumat
- `npm audit`: **0 vulnerabilități** (după upgrade Vite 8 / Vitest 5 / Tailwind 4).
- **0 chei private/tokenuri/secrete** în cod și arhive (`royalty_guard.cjs` verifică).
- **0 erori consolă** în E2E browser.
- Fără XSS (`dangerouslySetInnerHTML`/`innerHTML`/`eval` absente), fără apeluri externe în client,
  localStorage doar pentru salvare locală + flag tutorial (fără PII).

## 2. Model de amenințări (OWASP + scenariile directivei)

| Amenințare | Stare | Măsură |
|---|---|---|
| Broken access control | ⚠️ beta | serverul validează comenzi; auth real lipsește (BLOCAT) |
| IDOR | ⚠️ | commandId/actorId se validează; fără obiecte per utilizator încă |
| Injection (SQL) | ✅ | `node:sqlite` cu prepared statements (parametri) |
| XSS | ✅ | React escapează implicit; fără innerHTML |
| CSRF | ⚠️ | API local fără cookies; la public necesită token/Origin check |
| Replay | ✅ | idempotență pe commandId (UNIQUE) |
| Race conditions | ✅ | single-threaded + tranzacții SQLite |
| Economic exploits | ✅ | reducer respinge resurse negative/NaN/coord fracționare; MINT respins |
| Auth bypass | ⚠️ | fără auth real (beta guest) |
| Manipulare voturi | ⚠️ | deduplicare actorId; anti-Sybil real BLOCAT |
| Escaladare privilegii | ✅ | `checkRolePermission` (logică); fără endpoint-uri sensibile active |
| Conturi automate | ✅ | rate limiting (token bucket) |
| Modificare manifest | ✅ | semnătură Ed25519 + verificare |
| Falsificare jurnal | ✅ | lanț hash append-only |
| Acces DB neautorizat | ⚠️ | DB local; la cloud necesită ACL D1 |
| Compromitere credențiale cloud | 🏗️ | nu există cloud încă |
| Supply-chain | ⚠️ | lockfile + `npm audit` = 0; fără verificare de semnături de pachete |
| Pierdere date | ⚠️ | backup SQLite + export; fără replicare offsite încă |
| Schimbare destinație redevență | ✅ | `beneficiary.ts` multi-aprobare |

## 3. Vulnerabilități npm (rezolvate)
Cele 6 inițiale + 3 din Tailwind au fost eliminate prin upgrade major:
`vite 5→8`, `vitest 2→5`, `tailwindcss 3→4`, `@vitejs/plugin-react 4→6`, `@tailwindcss/vite`.
Regresii: 66/66 unit + 7/7 E2E + build/typecheck/lint verzi.

## 4. Delimitare onestă
Securitatea motorului local este reală și testată. Securitatea unei lansări **publice** necesită
încă: autentificare (WebAuthn), Origin/CSRF, rate limiting distribuit, audit cloud, backup offsite
și un operator responsabil — toate BLOCATE de infrastructură/legal în acest stadiu.
