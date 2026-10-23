# Runbook și control buget
## Procedura zilnică minimă
Verifică erorile critice, spațiu D1, reads/writes, număr API, rate-limit events, backup și contribuții raportate. Dacă sistemul intră în degradare: dezactivează scrierile globale, păstrează explorarea locală și semnalează eroarea; NU activa automat un plan plătit.
## Release
Branch -> CI -> QA -> review -> snapshot -> publicare -> smoke test -> rollback pregătit. Schimbările economice/instituționale necesită migrare, replay test, changelog.
## Backups
Export periodic în JSON/SQL, stocare sigură cu minimizare PII; test restaurare lunar în mediu izolat. Nu conserva date personale mai mult decât este necesar.
## Chei și acces
2FA pentru furnizori, least privilege, secret manager, niciodată wallet seed phrase. La transferul operatorului: revocă accesul administratorilor vechi, semnează proces-verbal, actualizează privacy notice și acorduri procesare.
## Metrici
TTI, FPS mobil, crash rate, replay hash mismatch, requests/DAU, rows_read/DAU, cost, retention D1/D7 (când colectarea e legală), % puzzle completat, share voluntar. Raportează valori brute și eșantion, fără procente inventate.
