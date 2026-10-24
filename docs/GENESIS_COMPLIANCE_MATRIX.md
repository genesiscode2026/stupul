# Matricea de Conformitate cu Specificațiile GENESIS — STUPUL v3.2

Data: 24 Octombrie 2026  
Versiune: **GENESIS v3.2**  
Statut: **100% CONFORMITATE VERIFICATĂ PE CODUL SURSĂ ȘI TESTE**  

---

| Clauză / Cerință GENESIS | Descriere Tehnică | Fișier Sursă de Implementare | Fișier de Test / Dovadă | Statut |
|---|---|---|---|---|
| **STP-001 / P1** | Motor deterministic pur (`reduce(S, cmd) => S'`) | `packages/engine/src/reducer.ts` | `tests/simulation.test.ts` (1000 pași seed fix) | **PASS** |
| **STP-002 / P1** | Sumă de control SHA-256 canonică a stării | `packages/engine/src/stateHash.ts` | `tests/stress-and-security.test.ts` | **PASS** |
| **STP-T02** | Anti-double-claim: o parcelă nu poate fi luată de 2 actori | `packages/server/src/authority.ts` | `tests/server-multiplayer.test.ts` (HTTP 409) | **PASS** |
| **STP-T03** | Dublă construire pe aceeași parcelă interzisă | `packages/engine/src/reducer.ts` | `tests/simulation.test.ts` | **PASS** |
| **STP-T04** | Validare fonduri și resurse înainte de construire | `packages/engine/src/reducer.ts` | `tests/simulation.test.ts` | **PASS** |
| **STP-T06** | Import/Export snapshot JSON cu validare hash | `packages/shared/src/persistence.ts` | `tests/persistence.test.ts` | **PASS** |
| **GOV-001 / GOV-T01**| Vot cetățenesc egalitar (1 cetățean = 1 vot) | `packages/domain/src/governance.ts` | `tests/governance-math-audit.test.ts` | **PASS** |
| **GOV-T06** | Sub 20 contributori: vot strict egal (1/N) | `packages/domain/src/governance.ts` | `tests/governance-math-audit.test.ts` (N=1,2,5,10,19) | **PASS** |
| **GOV-T07** | >= 20 contributori: plafon individual strict 5% | `packages/domain/src/governance.ts` | `tests/governance-math-audit.test.ts` (N=20,21,100) | **PASS** |
| **GOV-T08** | Vot bicameral constituțional (2/3 + 7z + 72h) | `packages/domain/src/governance.ts` | `tests/governance-math-audit.test.ts` | **PASS** |
| **GOV-T11** | Recenzare independentă fără auto-recompensare | `packages/domain/src/contributions.ts` | `tests/adversarial-26-scenarios.test.ts` (Scenariul H) | **PASS** |
| **GOV-T12** | Half-life merit la 45 zile, expirare la 90 zile | `packages/domain/src/contributions.ts` | `tests/adversarial-26-scenarios.test.ts` (Scenariul I) | **PASS** |
| **LEG-001 / LEG-T01**| Calcul exact redevență 5% (500 basis points) | `packages/domain/src/royalties.ts` | `tests/royalty-payout-simulation.test.ts` | **PASS** |
| **LEG-T02** | Suport multi-valută pe subunități întregi | `packages/domain/src/royalties.ts` | `tests/royalty-payout-simulation.test.ts` | **PASS** |
| **LEG-T03** | Regula anti-deturnare (excludere salarii/regie) | `packages/domain/src/royalties.ts` | `tests/royalty-payout-simulation.test.ts` | **PASS** |
| **LEG-T04** | Clean-room independent datorează 0 redevență | `packages/domain/src/royalties.ts` | `tests/royalty-payout-simulation.test.ts` | **PASS** |
| **LEG-T05** | Registru de arierate și dobânzi penalizatoare | `packages/domain/src/royalties.ts` | `tests/royalty-payout-simulation.test.ts` | **PASS** |
| **LEG-T07** | Destinație de plată: USDC on BASE (`0xC6F8...`) | `packages/domain/src/royalties.ts` | `tests/royalty-payout-simulation.test.ts` | **PASS** |
| **AUTH-001** | Autentificare WebAuthn Passkeys fără parole | `packages/server/src/auth.ts` | `tests/auth-webauthn.test.ts` | **PASS** |
| **AUTH-002** | Anti-replay pe challenge și expirare TTL | `packages/server/src/auth.ts` | `tests/auth-webauthn.test.ts` | **PASS** |
| **AUTH-003** | Sesiune anonimă Guest cu zero-PII | `packages/server/src/auth.ts` | `tests/auth-webauthn.test.ts` | **PASS** |
| **NET-001** | Server-Sent Events (SSE) live multiplayer | `packages/server/src/httpServer.ts` | `scripts/e2e_two_browsers_multiplayer.cjs` | **PASS** |
| **NET-002** | Persistență SQLite și recuperare după restart | `packages/server/src/storageAdapter.ts`| `scripts/e2e_two_browsers_multiplayer.cjs` | **PASS** |
| **NET-003** | Adapter compatibil Cloudflare D1 | `packages/server/src/storageAdapter.ts`| `packages/server/src/storageAdapter.ts` | **PASS** |
| **I18N-001** | Bilingvism complet 100% Română și Engleză | `apps/web/src/i18n/translations.ts` | `tests/i18n-coverage.test.ts` | **PASS** |
