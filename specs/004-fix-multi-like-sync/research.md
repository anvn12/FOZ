# Research: Fix Multi-Like Persistence and Count Revert

**Phase**: 0 | **Date**: 2026-06-04 | **Plan**: [plan.md](./plan.md)

---

## Decision 1: Why only the first like persists

**Decision**: MS SQL Server unique constraint on `(userId, replyId)` treats
multiple `replyId = NULL` rows as duplicates.

**Evidence**:

- `Like` schema: `@@unique([userId, threadId])` and `@@unique([userId, replyId])`.
- Thread likes created with `{ userId, threadId }` only — `replyId` is NULL.
- Second thread like for same user → `P2002` on insert.
- `likeService.likeTarget` catches `P2002`, returns **current** `likeCount` without
  creating row or emitting socket increment.
- Matches user report: first like survives refresh; later likes do not.

**Rationale**: SQL Server UNIQUE allows only one NULL-combination per composite
index (NULLs compare equal in unique index). Prisma docs warn about nullable
unique fields on SQL Server.

**Alternatives considered**:

- Client-only reconcile — cannot fix missing DB rows on refresh.
- Remove unique and enforce in app — race-prone; rejected.

---

## Decision 2: Schema fix strategy

**Decision**: Add **filtered unique indexes** via SQL migration; drop blanket
`@@unique([userId, replyId])` / adjust Prisma schema to avoid re-creating bad
indexes on `migrate dev`.

**Rationale**: Minimal data model change; preserves nullable FK design from MVP.
Matches MSSQL best practice for optional relations.

**Alternatives considered**:

- `targetType` + `targetId` single unique — cleaner but more migration churn.
- Sentinel non-null placeholder for unused FK — hack; rejected.

---

## Decision 3: Client count flicker

**Decision**: Monotonic count merge in client when `likedByMe` is true; optional
pending-target socket suppression.

**Evidence**:

- Optimistic `likeCount + 1` then API returns unchanged count on failed create
  (idempotent path) → UI drops instantly.
- After server fix, API returns true increment; client guards remain defense
  against socket races.

**Rationale**: FR-004 / SC-002; belt-and-suspenders with DB fix.

**Alternatives considered**:

- Remove optimistic updates — worse UX; rejected.
- Disable socket like events entirely — breaks multi-tab; rejected.

---

## Decision 4: Reply likes

**Decision**: Same NULL issue applies in reverse: reply likes have `threadId = NULL`.
Filtered index on `(userId, threadId) WHERE threadId IS NOT NULL` required too.

**Rationale**: Symmetric schema; both constraints need filtering.
