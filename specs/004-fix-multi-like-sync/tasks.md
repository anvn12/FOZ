# Tasks: Fix Multi-Like Persistence and Count Revert

**Input**: Design documents from `/specs/004-fix-multi-like-sync/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Branch**: `004-fix-multi-like-sync` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Tests**: Not requested — manual verification per [quickstart.md](./quickstart.md).

**Organization**: US1 (DB persistence) blocks refresh truth; US2 (client sync) fixes flicker; both P1.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare schema and migration scaffolding

- [x] T001 Document current `Like` unique constraints in `server/prisma/schema.prisma` comments per `contracts/like-uniqueness.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix MSSQL NULL unique-index bug — **MUST complete before user stories**

**⚠️ CRITICAL**: Without this phase, only one thread like per user can persist in DB

- [x] T002 Remove unfiltered `@@unique([userId, threadId])` and `@@unique([userId, replyId])` from `server/prisma/schema.prisma` (replace with index strategy compatible with MSSQL NULL semantics)
- [x] T003 Add Prisma migration under `server/prisma/migrations/` with raw SQL: drop existing Like unique constraints; create filtered unique indexes `ON Like(userId, threadId) WHERE threadId IS NOT NULL` and `ON Like(userId, replyId) WHERE replyId IS NOT NULL`
- [x] T004 Run `npx prisma migrate dev` in `server/` and verify migration applies cleanly against MS SQL Server

**Checkpoint**: Manual or SQL insert — same user can like 3+ distinct threads and 2+ replies

---

## Phase 3: User Story 1 — Multiple Likes Persist (Priority: P1) 🎯 MVP

**Goal**: Every like action persists; refresh and re-login show all liked items

**Independent Test**: Like 5 threads + 3 replies → refresh → all 8 still liked

### Implementation

- [x] T005 [US1] Update `server/src/services/likeService.ts` — on `P2002`, verify like row exists for that specific target before idempotent return; rethrow unexpected constraint failures
- [x] T006 [US1] Confirm `POST` like routes in `server/src/routes/likes.ts` return incremented `likeCount` for second+ distinct targets (smoke via API or quickstart §3)

**Checkpoint**: SC-001, SC-003, SC-005 — multi-like survives refresh and re-sign-in

---

## Phase 4: User Story 2 — Stable Like Count (Priority: P1)

**Goal**: Count does not drop immediately after like; no flicker within 5 seconds

**Independent Test**: Like 3 threads in sequence — each count stays at N+1 after click

### Implementation

- [x] T007 [US2] Add `mergeLikeCount(current, incoming, likedByMe)` helper in `client/src/lib/likeCountMerge.ts` per `contracts/client-like-sync.md`
- [x] T008 [US2] Apply monotonic merge in `client/src/hooks/useLike.ts` when applying API response and optimistic rollback paths
- [x] T009 [P] [US2] Apply monotonic merge in `client/src/hooks/useSocketFeedSync.ts` `like:updated` handler (never mutate `likedByMe`)
- [x] T010 [P] [US2] Optional: skip or defer socket `like:updated` for targets in `useLike` pending set via shared pending registry in `client/src/hooks/useLike.ts`

**Checkpoint**: SC-002, SC-004 — no instant count drop; unlike only affects target

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Build validation and regression

- [x] T011 Run `npm run build` in `server/` and `client/` — zero TypeScript errors
- [x] T012 Execute full manual test plan in `specs/004-fix-multi-like-sync/quickstart.md` (§3–§6)
- [x] T013 [P] Regression: per-user like isolation from `specs/003-fix-text-likes-ui/quickstart.md` §2 still passes

---

## Dependencies & Execution Order

```text
Phase 1 (T001)
    ↓
Phase 2 (T002–T004) BLOCKS all user stories — DB fix
    ↓
Phase 3 US1 (T005–T006) — server correctness
    ↓
Phase 4 US2 (T007–T010) — client sync (can start after T004 if server verified)
    ↓
Phase 5 (T011–T013)
```

### User Story Dependencies

| Story | Depends on | Can start after |
|-------|------------|-----------------|
| US1 | Phase 2 migration | T004 applied |
| US2 | US1 recommended (true server counts) | T004; fully validated after T006 |

---

## Parallel Example: User Story 2

After T007 (merge helper) completes:

```text
T009 useSocketFeedSync.ts
T010 pending socket guard in useLike.ts
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1–2: migration (T001–T004)
2. Phase 3: likeService (T005–T006)
3. **STOP and VALIDATE** — quickstart §3 refresh test
4. Then Phase 4 for count flicker

### Incremental Delivery

1. DB migration + US1 → likes persist on refresh  
2. US2 → counts stable in UI  
3. Polish → build + full quickstart + regression

### Suggested MVP Scope

**Phase 2 + US1** (T001–T006) — fixes “only first like survives refresh”

---

## Task Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 13 |
| **US1** | 2 (T005–T006) |
| **US2** | 4 (T007–T010) |
| **Setup + Foundational** | 4 (T001–T004) |
| **Polish** | 3 (T011–T013) |
| **Parallel opportunities** | T009–T010, T013 |
