# Data Model: Fix Multi-Like Persistence and Count Revert

**Phase**: 1 | **Date**: 2026-06-04

## Problem

Current `Like` uniqueness on MS SQL Server prevents more than one thread like
per user (all thread rows share `replyId = NULL`).

## Target invariants

| Rule | Description |
|---|---|
| One like per user per thread | At most one `Like` where `threadId = T` for user U |
| One like per user per reply | At most one `Like` where `replyId = R` for user U |
| Many likes per user | User may like many different threads and replies |
| XOR target | Exactly one of `threadId` or `replyId` set per row |

## Schema change (Like)

**Before**: Prisma `@@unique([userId, threadId])` + `@@unique([userId, replyId])`
(unfiltered — broken on MSSQL with NULLs).

**After**: Database-level filtered unique indexes:

```sql
-- Conceptual (see migration for exact names)
CREATE UNIQUE INDEX ... ON Like(userId, threadId) WHERE threadId IS NOT NULL;
CREATE UNIQUE INDEX ... ON Like(userId, replyId) WHERE replyId IS NOT NULL;
```

Prisma schema may drop `@@unique` on nullable pairs and document indexes in
`schema.prisma` comments + manual migration SQL.

## Like row lifecycle (unchanged semantics)

```text
create Like(user, thread)  → thread.likeCount++, emit like:updated
create Like(user, reply)   → reply.likeCount++, emit like:updated
delete Like                → count--, emit like:updated
```

## Client cache (supplemental)

| Field | Rule after fix |
|---|---|
| `likedByMe` | Set true only on successful like for that target |
| `likeCount` | Must not decrease on same-target like while `likedByMe` true unless unlike |

## Migration notes

- Existing valid likes preserved.
- No duplicate cleanup expected if only one thread like per user existed.
- Re-run seed optional; manual verification with 10+ likes per user.
