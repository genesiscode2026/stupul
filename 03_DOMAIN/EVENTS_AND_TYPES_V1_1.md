# Evenimente și structuri atomice normative

## GOV-100 Actor
`actorId` UUID pseudonim; `accountCreatedAt`; `eligibilityEvidenceRefs[]` interne și minimizate; `role`: `citizen|contributor|elected|reviewer|custodian|commercialOperator`; rolurile NU implică identitate reală unică; păstrează identitățile juridice în sistem separat criptat al operatorului.

## GOV-110 Contribution
`id`, `actorId`, `kind` (`code|visual|systems|qa|security|documentation|civic|growth`), `evidenceHash`, `licenseAcceptanceRef`, `rubricScore` 0..100, `impactWeight` 1..3, `reviewerIds[]`, `conflictsDeclared`, `testsPassed`, `acceptedAt`, `status`, `appealRef`. Refuză dacă evaluatorul = autor/beneficiar direct ori lipsesc dovezile.

## GOV-120 Decision
`proposalId`, `scope` (`city|roadmap|constitution|legal|commercial`), `versionHash`, `proposer`, `createdAt`, `snapshotId`, `deadline`, `citizenBallots`, `builderBallots`, `status` (`draft|deliberation|voting|passed|rejected|quarantined|timelocked|executed|rolledBack`), `reason`, `auditTrail` append-only. `legal|commercial` NU poate produce contract legal prin simplu vot.

## GOV-130 Vote
`ballotId`, `proposalId`, `actorId`, `choice`, `citizenEligibilityAtSnapshot`, `meritAtSnapshot`, `delegationRef`, `castAt`. Un vot per identitate validată pe propunere și cameră; reguli anti-Sybil și protecția confidențialității; nicio modificare după deadline.

## GOV-140 Entity stewardship
`licenseId`, `custodianLegalEntityId`, `operatorLegalEntityId`, `brandOwner`, `domainController`, `releaseKeyCustodians[]`, `lastContractCheck`, `legalGateStatus`. Date juridice păstrate într-un depozit securizat, nu într-un JSON public.

## GOV-150 Revenue record — GATED / NEVER MVP
`operatorId`, `period`, `channel`, `currency`, `grossCollected`, `taxCollected`, `refunds`, `chargebacksReturned`, `processorFees`, `eligibleReceipts`, `royaltyGross = eligibleReceipts * 0.05`, `withholdingTax`, `royaltyNetPayable`, `settlementRef`, `auditHash`, `relatedPartyRef`. Pentru fluxuri fiat/cripto trebuie aprobare fiscală și plăți reale prin procesator/operator autorizat.

## STP-100 City event
`seq`, `eventId`, `type`, `actorRef`, `payloadVersion`, `payload`, `stateHashBefore`, `stateHashAfter`, `serverAcceptedAt`, `signatureOrIntegrityProof`. Eveniment ireversibil din perspectiva jurnalului (append-only), efectul poate fi compensat printr-un eveniment nou. Nu rescrie istoria în tăcere.
