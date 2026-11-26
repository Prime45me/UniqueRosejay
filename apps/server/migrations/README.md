# Database migrations

Forward-only SQL files, applied in order by `npm run db:migrate -w apps/server`.

- Name files `NNNN_short_description.sql`, for example `0001_catalogue.sql`.
- Each file runs in its own transaction and is recorded in `schema_migrations` with a checksum.
- Never edit a migration that has been applied anywhere. Add a new one.
- Do not drop or recreate tables without explicit approval.

No business-schema migrations exist yet. The proposed schema is in `docs/PHASE_2A_ASSESSMENT.md`, awaiting review.
