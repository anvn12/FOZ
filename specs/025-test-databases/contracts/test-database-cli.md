# Tooling & Interface Contract: Test Database Scripts

**Feature Branch**: `025-test-databases`
**Date**: 2026-08-17
**Spec**: [spec.md](../spec.md)

## 1. NPM Scripts Specification

| Script Name | Command | Purpose |
|---|---|---|
| `db:test:setup` | `tsx src/backend/db/scripts/test-db-setup.ts` | Creates both `foz_test_empty` and `foz_test_populated` databases if missing, applies migrations to both, and seeds both to baseline states. |
| `db:test:empty:reset` | `tsx src/backend/db/scripts/test-db-empty-reset.ts` | Drops all data in `foz_test_empty`, applies latest migrations, and seeds admin + mod accounts (0 posts). |
| `db:test:populated:reset` | `tsx src/backend/db/scripts/test-db-populated-reset.ts` | Drops all data in `foz_test_populated`, applies latest migrations, and seeds full dataset (50 users, 100 posts, interactions). |
| `db:test:migrate` | `tsx src/backend/db/scripts/test-db-migrate.ts` | Applies pending Drizzle migrations to both `foz_test_empty` and `foz_test_populated`. |

---

## 2. Environment Variables Contract

| Variable Name | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgres://foz:foz@localhost:5432/foz_dev` | Main development database connection URI. (Protected from test resets). |
| `TEST_EMPTY_DATABASE_URL` | `postgres://foz:foz@localhost:5432/foz_test_empty` | Target connection URI for the empty state test database. |
| `TEST_POPULATED_DATABASE_URL` | `postgres://foz:foz@localhost:5432/foz_test_populated` | Target connection URI for the populated test database. |
| `BCRYPT_COST` | `4` | Cost factor for password hashing in testing environments (defaults to 4 for rapid execution). |

---

## 3. Exit Codes & Safety Guardrails

| Exit Code | Condition | Output Format |
|---|---|---|
| `0` | Success | `✅ [test-db] Successfully provisioned <database_name> in <N>ms.` |
| `1` | Safety Violation | `❌ CRITICAL SAFETY ERROR: Refusing to run destructive seed on non-test database "<target>".` |
| `1` | Connection / Migration Failure | `❌ Migration failed: <error_message>` |
