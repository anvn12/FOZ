# Implementation Plan: Fix Multi-Like Persistence and Count Revert

**Branch**: `004-fix-multi-like-sync` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-fix-multi-like-sync/spec.md`

## Summary

Users can like one thread or comment successfully, but additional likes flash
liked then the count drops; after refresh only the first like remains.

**Root cause (code + schema review)**:

1. **Server / DB (primary)**: `Like` model has `@@unique([userId, replyId])`.
   Thread likes set `replyId = NULL`. On **MS SQL Server**, multiple rows sharing
   `(userId, NULL)` violate that unique index — only the **first** thread like per
   user persists. Subsequent `like.create` hits `P2002`, caught as idempotent,
   returns unchanged `likeCount` without creating a row.
2. **Client (secondary)**: Optimistic UI shows +1, then API “success” applies
   unchanged `serverCount` → visible count drop. Socket `like:updated` may
   reinforce stale aggregate counts.

**Technical approach**: Fix Like uniqueness for SQL Server (filtered unique
indexes or schema reshape to non-nullable target key); harden client like sync
(ignore stale socket/API count when it would regress below optimistic liked
state; optional skip self-echo socket during in-flight toggle).

## Technical Context

**Language/Version**: TypeScript 5.x (client + server)

**Primary Dependencies**: React 18, TanStack Query v5, Express 4, Prisma 5,
Socket.io 4, MS SQL Server

**Storage**: MS SQL Server — **schema/migration required** for `Like` uniqueness

**Testing**: Manual quickstart; Prisma migration verify; optional server unit
test for multi-thread likes per user

**Target Platform**: Web browser + Node server

**Project Type**: Web application (`client/` + `server/`)

**Performance Goals**: Like feedback stable within 500 ms; no count flicker (SC-002)

**Constraints**: Preserve per-user per-target like semantics; no auth changes;
idempotent like API behavior kept

**Scale/Scope**: `Like` model + migration, `likeService.ts`, client `useLike.ts`
+ `useSocketFeedSync.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Modular Client-Server Architecture | ✅ PASS | DB fix server-side; display sync client-side |
| II. Enforced Folder Structure | ✅ PASS | Migration under `server/prisma/` |
| III. Clean Code & Reusability | ✅ PASS | Central like persistence + client merge helper |
| IV. Security at Every Layer | ✅ PASS | Session user unchanged |
| V. AI Service Abstraction | ✅ N/A | |
| VI. Consistency Over Cleverness | ✅ PASS | Standard MSSQL filtered unique index pattern |

**Gate result**: Pass. Schema change justified in Complexity Tracking.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| DB migration (filtered indexes or schema reshape) | MSSQL NULL uniqueness blocks multi thread likes | Client-only fix cannot persist likes server-side |

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-multi-like-sync/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── like-uniqueness.md
│   └── client-like-sync.md
└── tasks.md
```

### Source Code

```text
server/
├── prisma/schema.prisma          # Like constraints (if reshaped)
├── prisma/migrations/            # Filtered unique indexes for MSSQL
└── src/services/likeService.ts   # Error handling / logging on create

client/src/
├── hooks/useLike.ts              # Stale count merge, pending guard
└── hooks/useSocketFeedSync.ts    # Monotonic count / ignore self-echo
```

## Implementation Phases (for /speckit-tasks)

### Phase A — Server: Like persistence (P1, blocks refresh truth)

**Option 1 (preferred)**: Keep nullable FKs; replace Prisma `@@unique` on nullable
columns with raw SQL migration:

- `UNIQUE (userId, threadId) WHERE threadId IS NOT NULL`
- `UNIQUE (userId, replyId) WHERE replyId IS NOT NULL`

Drop existing unfiltered unique constraints Prisma created.

**Option 2**: Reshape `Like` to `targetType` + `targetId` with single
`@@unique([userId, targetType, targetId])` — larger migration, cleaner long-term.

After migration: verify user can insert 10+ thread likes + reply likes in DB.

### Phase B — Server: likeService clarity

- On successful create: emit socket + return incremented count (unchanged).
- On `P2002`: only when like **actually exists** for that target; log constraint
  name in dev if create fails unexpectedly.
- Ensure idempotent path does not mask wrong-constraint failures after fix.

### Phase C — Client: count stability (P1)

1. `useLike`: after API success, if `nextLiked && serverCount < optimisticCount`,
   prefer `optimisticCount` or refetch — **better**: trust server after DB fix;
   add guard so socket/API cannot set `likeCount` below cached value when
   `likedByMe === true` for that target (monotonic merge).
2. `useSocketFeedSync`: when applying `like:updated`, use
   `Math.max(local.likeCount, payload.likeCount)` if item is `likedByMe`, else
   payload count; never clear `likedByMe`.
3. Optional: suppress socket updates for `targetId` in `useLike` pending set.

### Phase D — Verification

Run quickstart: 10 threads + 10 replies liked, refresh, re-login — all persist.
