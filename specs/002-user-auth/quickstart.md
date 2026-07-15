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
6. Look at the existing schema baseline:
   `backend/db/migrations/0001_initial.sql`, `backend/db/schema/users.ts`,
   `backend/db/schema/roles.ts`, and `shared/schema-enums.ts`.
7. Confirm with the team that the baseline migration is treated as an
   imported snapshot (not regenerated) and that `drizzle-kit` will emit only
   the new `refresh_sessions` migration.
8. Re-run the checklist in [checklists/requirements.md](./checklists/requirements.md)
   before moving to task generation (`/speckit.tasks`).