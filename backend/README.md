# backend

This is the backend that mediates between the technician mobile app and ePrzeglądy: it receives synced completion records from the app, queues them, and forwards them to ePrzeglądy with retry and alerting. It is not yet deployed; the contract test surface that pins the wire shape between app and backend lives at `app/tests/contracts/`.
