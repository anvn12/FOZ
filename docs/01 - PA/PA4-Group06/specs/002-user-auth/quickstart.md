# Quickstart: User Authentication

1. Open [spec.md](./spec.md) and confirm the auth scope (register / sign in /
   sign out / refresh / change password) and the out-of-scope items
   (email verification, forgotten-password reset).
2. Read [plan.md](./plan.md) for the Technical Context, Constitution Check,
   and the folder layout for `src/shared/`, `src/backend/`, and `src/frontend/`.
3. Read [research.md](./research.md) for the rationale behind Drizzle query
   layer introduction, refresh-session storage, JWT split, bcrypt, and
   rate limiting.
4. Inspect the data model in [data-model.md](./data-model.md), especially
   the new `RefreshSession` entity and the reused `UserAccount` / `Profile`.
5. Review the HTTP contract in [contracts/auth-api.md](./contracts/auth-api.md)
   and note the Zod DTOs that MUST live in `src/shared/schemas/auth.ts`.
6. Look at the schema baseline and the new migration under
   `src/backend/db/migrations/`.
7. Start the DB and apply the schema:

   ```sh
   docker compose up -d db
   for f in src/backend/db/migrations/*.sql; do
     docker exec -i foz_db psql -U foz -d foz_dev < "$f"
   done
   # Test database (used by Vitest)
   docker exec -i foz_db psql -U foz -d postgres -c "CREATE DATABASE foz_test;"
   for f in src/backend/db/migrations/*.sql; do
     docker exec -i foz_db psql -U foz -d foz_test < "$f"
   done
   ```

8. Run the validation flow:

   ```sh
   npx tsc --noEmit
   npx vitest run
   ```

   Expected: `tsc` clean, 58/58 tests pass.
