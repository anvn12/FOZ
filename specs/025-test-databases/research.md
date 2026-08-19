# Technical Research: Test Databases and Fixture Datasets

**Feature Branch**: `025-test-databases`
**Date**: 2026-08-17
**Spec**: [spec.md](./spec.md)

## 1. Database Provisioning & Multi-DB Isolation on Local PostgreSQL

### Decision
Provision two dedicated logical databases (`foz_test_empty` and `foz_test_populated`) inside the existing Docker PostgreSQL container (`postgres:16`) on port `5432`. A provisioning helper connects to the administrative `postgres` / `foz_dev` database and executes `CREATE DATABASE IF NOT EXISTS` commands.

### Rationale
- **Zero Overhead**: Does not require running multiple Docker containers or opening separate TCP ports.
- **Total Data Isolation**: Tests targeting `foz_test_empty` or `foz_test_populated` can never corrupt or drop tables from `foz_dev`.
- **Instant Switching**: Switching between empty and populated states is as simple as pointing `DATABASE_URL` or `TEST_DATABASE_URL` to the desired database URI.
- **Migration Parity**: Running Drizzle migrations against each database ensures identical schema fidelity to `foz_dev`.

### Alternatives Considered
- *Separate Docker Compose services with separate ports (e.g. 5433, 5434)*: Rejected due to unnecessary memory/CPU overhead and port management complexity on developer machines.
- *Dynamic single test DB (`foz_test`) wiped before every test*: Rejected because concurrent test suites or manual exploratory testing would constantly overwrite each other's state, preventing simultaneous empty vs populated testing.

---

## 2. Fast Deterministic Password Hashing for Test Fixtures

### Decision
Generate bcrypt password hashes using an explicit test cost factor of `BCRYPT_COST=4` (or precomputed static hash strings) for all synthetic accounts (`admin@admin.foz`, `mod@mod.foz`, `user1@foz.test`...`user50@foz.test`).

### Rationale
- Bcrypt at `cost=10` or higher would introduce significant latency when hashing 52 accounts during seed execution (taking 5-10 seconds just on hashing).
- With `cost=4`, 52 password hashes compute in <50ms while remaining 100% compliant with standard bcrypt validation in `src/backend/api/auth/`.
- Precomputed hash strings for standard test passwords (`admin@admin.foz`, `mod@mod.foz`, `password123`) can also be reused for near-instantaneous bulk insertion.

### Alternatives Considered
- *Plaintext mock passwords*: Rejected because the authentication service and middleware enforce bcrypt verification; bypassing bcrypt would require changing application code.
- *Random passwords per run*: Rejected because deterministic passwords (`password123`) allow automated tests and manual testers to log in without reading generated credential files.

---

## 3. Relational Interaction Graph & Deterministic Seeding

### Decision
Implement a deterministic seed engine in `src/backend/db/seeds/` using a topological sequence to guarantee referential integrity and avoid foreign key constraint violations:
1. Truncate all tables using `TRUNCATE ... CASCADE` (or drop & recreate tables via migrations).
2. Insert Admin (`admin@admin.foz`, role `admin`) and Moderator (`mod@mod.foz`, role `moderator`) with profile records.
3. In populated mode, insert 50 User Accounts (`user1@foz.test` - `user50@foz.test`) with associated Profiles (`profiles`).
4. Insert 100 Posts (`posts`) authored by users, with created timestamps distributed pseudo-randomly over the preceding 30 days.
5. Insert Hashtags (`hashtags`) and Post-Hashtag associations (`post_hashtags`).
6. Insert threaded Comments (`comments`) including parent-level comments and nested replies (`parentCommentId`).
7. Insert Reposts (`posts` with `repostOfId` referencing original post IDs).
8. Insert Reactions (`reactions`) linking users to posts and comments.
9. Insert Moderation Reports (`reports`) linked to posts and users for moderation queue testing.

### Rationale
- Strictly obeys PostgreSQL foreign key constraints by inserting parents before children.
- A deterministic pseudo-random generator (with a fixed seed) guarantees that every seed run produces identical UUIDs and thread trees, making Vitest assertions 100% reproducible.

### Alternatives Considered
- *SQL dump file restore (`.sql` files)*: Harder to maintain when schema evolves via Drizzle migrations. Programmatic TypeScript seeding with Drizzle schemas ensures type safety and automatic schema alignment.

---

## 4. Safety Guardrails Against Development / Production Contamination

### Decision
Implement an assertion guard in the seed execution script:
```typescript
function assertIsTestDatabase(dbUrl: string): void {
  const parsed = new URL(dbUrl);
  const dbName = parsed.pathname.replace(/^\//, "");
  const allowedTestDbs = ["foz_test_empty", "foz_test_populated", "foz_test"];
  
  if (!allowedTestDbs.includes(dbName) || !dbName.includes("test")) {
    throw new Error(
      `CRITICAL SAFETY ERROR: Refusing to run destructive test seed on non-test database "${dbName}". Target must be one of: ${allowedTestDbs.join(", ")}`
    );
  }
}
```

### Rationale
- Completely eliminates the risk of accidentally running `npm run db:test:empty:reset` or `npm run db:test:populated:reset` against `foz_dev` or a remote production PostgreSQL instance.

---

## 5. NPM Script Tooling & Vitest Integration

### Decision
Expose clean, discoverable scripts in `package.json`:
- `npm run db:test:setup` — Ensures databases exist, applies migrations to both, seeds both.
- `npm run db:test:empty:reset` — Migrates and resets `foz_test_empty` (0 posts, admin + mod).
- `npm run db:test:populated:reset` — Migrates and resets `foz_test_populated` (50 users, 100 posts, interactions).
- `npm run db:test:migrate` — Runs pending migrations across both test databases.

### Rationale
- Cross-platform compatible across Windows (pwsh/cmd), macOS, and Linux.
- Easily invoked in CI workflows before running integration tests.
