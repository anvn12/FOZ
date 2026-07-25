# Review: 001-threads-schema (commit `07afb11`, branch `db-schema`)

**Reviewer**: authN owner (reviewing the DB layer as prerequisite)  
**Verdict**: **Changes Requested — blocked from merge.**   
The SQL design is
sound; the implementation does not satisfy the feature's own task wording or
the constitution's data-layer mandate.

This review is against `spec.md`, `data-model.md`, `tasks.md`, the
`checklists/requirements.md`, and the constitution v2.0.0.

---

## Blocking findings

### B1 — Schema is TypeScript interfaces, not Drizzle `pgTable` definitions

Every file under `src/backend/db/schema/*.ts` declares `interface XRecord`
(`UserAccountRecord`, `PostRecord`, …), not `drizzle.pgTable("...", {...})`.

- The constitution (Tech Stack → "Data layer: Drizzle (SQL-visible), migrations
  via `drizzle-kit`") and Principle V make real Drizzle definitions binding.
  Interfaces are not a Drizzle data layer.
- Task T002 ("Set up Drizzle database wiring") and T006 ("wire table
  registration in `0001_initial.sql`") imply `pgTable` → `drizzle-kit generate`
  owns the migration. Instead the migration was hand-written and the interfaces
  are already drifting from it (see B3, B4).
- Without `pgTable`, no feature (authN included) gets the Drizzle query
  builder/type inference this repo is supposed to provide. AuthN cannot start
  against `interface UserAccountRecord`.

**Required**: convert every `interface XRecord` to a `pgTable("x", {...})`
definition, then regenerate the migration with `drizzle-kit generate` so the
toolchain owns it. Delete the interfaces (or keep them only as the inferred
`typeof table.$inferSelect` types Drizzle produces for free).

### B2 — No database client in `db/index.ts`

`db/index.ts` only re-exports schema types and ships two string literals:

```ts
export const databaseDialect = "postgresql" as const;
export const databaseMigrationsPath = "src/backend/db/migrations" as const;
```

There is no `pg` Pool and no `drizzle(pool)` instance for any feature to
import. AuthN's service functions have nothing to call.

**Required**: add the client — `pg` Pool + `drizzle(pool, { schema })` exported
from `db/index.ts`. This is the single import every backend feature builds on.

### B3 — No `package.json`; nothing is installable or runnable

There is no `package.json` anywhere in `src/`. None of the constitution-mandated
deps (express, drizzle-orm, pg, bcrypt, jose/jsonwebtoken, zod, vitest,
drizzle-kit) are declared. T002 cannot be considered complete without it, and
no reviewer can verify "the DB layer works."

**Required**: a `package.json` (backend) declaring the stack above at the
version floors in `docs/Techstack/be.md`, plus an `.nvmrc` for Node LTS per the
constitution.

### B4 — Interface ↔ migration drift: `reactions` timestamps

`ReactionRecord extends BaseTimestamps`, so it requires `updatedAt`. The
migration table has only `created_at`:

```sql
CREATE TABLE reactions (
  ...
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (...)
);
```

Pick one: reactions is immutable (then `ReactionRecord` must drop
`BaseTimestamps` for a `createdAt`-only shape), or it carries `updated_at` (then
the migration must add it). This is the textbook drift
interfaces-without-`pgTable` produces — exactly why B1 matters.

**Required**: reconcile. Fixing B1 (generated migration) resolves this, but
the *decision* (immutable vs. mutable reactions) must be stated in
`data-model.md`.

---

## Non-blocking findings (fix before merge, not architecture-level)

### N1 — `data-model.md` ↔ implementation drift on audit timestamps

`data-model.md` declares fields that exist in neither the interfaces nor the
migration:

| Table | Documented in data-model | Present in code |
|---|---|---|
| `RoleHistory` | `changedAt` | only `createdAt`/`updatedAt` (BaseTimestamps) |
| `ModerationReview` | `reviewedAt`, `escalatedAt` | only `createdAt`/`updatedAt` |
| `PostSummary` | `refreshedAt` | only `createdAt`/`updatedAt` (state uses `SummaryState` enum incl. `refreshed`) |

Either the fields belong (add columns) or the data-model is wrong (remove the
claims). `data-model.md` is the design contract; shipping an implementation
that silently diverges from it is a consistency defect (Principle V). Decide
per table and update one side.

### N2 — Terminology drift: `reactionType` vs. `reactionKind`

`data-model.md` says `reactionType`; the enum, interface, and migration all use
`reactionKind`. Not a bug, but the contract doc should match the code. Update
`data-model.md`.

### N3 — Dead code / speculative abstractions in `_shared.ts`

The constitution explicitly forbids dead code on `main`. In `_shared.ts`:

- `OwnershipFields` — defined, used by **no** table.
- `LifecycleFields` — defined, used by **no** table.
- `AuditFields` — defined, used by **no** table.
- `makeRecordKey(prefix, id)` — defined, used **nowhere**.

YAGNI: add these when a table actually needs them. Delete for now, or — if
T020's "refactor repeated helpers" intent was to land them — wire at least one
real usage. Don't ship unused abstractions.

### N4 — Enum columns are unconstrained `text`

`role`, `status`, `lifecycle_state`, `visibility_state`, `reaction_kind`,
`report_status`, `moderation_outcome`, `escalation_state`, `summary_state` are
all `text NOT NULL` with **no** `CHECK` and **no** Postgres enum type. The DB
will accept any string; validation lives only in the app (Zod).

This is a defensible tradeoff (app validates, cheaper to evolve enums), and I'm
fine with it as a *decision* — but it's not recorded anywhere in `research.md` or
`data-model.md`. Per Principle V, a non-obvious choice needs written
justification. Add a one-line note in `research.md` Decision 4 (or a new
decision) stating the tradeoff and that app-layer Zod is the enforcement point.

### N5 — Index coverage for the feed path is underspecified

Spec FR-010 + SC-004 call out feed ranking / discovery at scale, and the
success criteria name 1M posts / 10M comments / 100M reactions. Current
indexes cover ownership and parent lookups but **not** the public-feed read
path. A feed query is roughly `WHERE deleted_at IS NULL AND visibility_state =
'public' ORDER BY created_at DESC`. Consider a partial index, e.g.
`CREATE INDEX idx_posts_feed ON posts(created_at DESC) WHERE deleted_at IS
NULL AND visibility_state = 'public';` Not strictly required to merge (the
entity model supports the scale per SC-004), but it's the cheapest place to
honor FR-010. Leave a `ponytail:`-style note or add the index; your call.

---

## Forward notes (NOT this PR's job — do not block on)

- **No `refresh_tokens` table.** This is correctly out of scope for 001
  (core-content schema). It is an `002-auth` decision: stateful rotation vs.
  stateless signed refresh. Flagging only so it's not "discovered" later.
- **Polymorphic `target_id` (reactions, reports) has no DB-enforceable FK.**
  This is inherent to the `target_type`/`target_id` pattern and fine; app-layer
  validation must cover it. No action needed in 001, but `research.md` should
  acknowledge it as a known tradeoff of the chosen model (one-line).

---

## What's good (keep on merge)

- `user_accounts` has everything authN needs: unique `email`, `password_hash`,
  `role`, `status`, timestamps. The shape is correct.
- FK semantics are well-chosen: `author_id … ON DELETE RESTRICT` preserves
  authorship history; content `… ON DELETE CASCADE` cleans engagement; profile
  cascades with its account.
- The `reactions` uniqueness constraint
  `(user_account_id, target_type, target_id, reaction_kind)` directly satisfies
  FR-004 and the "user likes same post more than once" edge case.
- Soft-delete only on `posts`/`comments` (not accounts) + `status` enum for
  ban/suspend is the right call and matches the moderation audit intent.
- Separation of `user_accounts` (identity) from `profiles` (public) satisfies
  FR-001 and Principle IV (sensitive data isolation).
- Spec → plan → tasks → checklist are internally complete; the checklist is
  honestly self-verified. The *process* is SDD-clean; the *implementation* just
  stopped one rung early.

---

## Minimum to unblock authN

Fix B1 + B2 + B3 + the `reactions` decision in B4. Everything else can be a
follow-up on the same branch or a fast-tracked `001-followup` PR. AuthN cannot
start against interface-only schema with no client and no installed deps —
those three are hard prerequisites.