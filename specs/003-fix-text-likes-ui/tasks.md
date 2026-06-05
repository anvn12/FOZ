# Tasks: Fix Thread Text Overflow, Per-User Likes, and Like Count Display

**Input**: Design documents from `/specs/003-fix-text-likes-ui/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Branch**: `003-fix-text-likes-ui` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Tests**: Not requested — manual verification per [quickstart.md](./quickstart.md).

**Organization**: Tasks grouped by user story (US1 → US2 → US3). Foundational feed-cache key blocks all stories.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared helper for scoped feed cache keys

- [x] T001 Create `feedQueryKey(userId)` helper in `client/src/lib/feedQuery.ts` per `contracts/client-feed-cache.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Feed query and session lifecycle MUST be user-scoped before any story

**⚠️ CRITICAL**: No user story work until this phase is complete

- [x] T002 Update `client/src/hooks/useFeed.ts` to use `feedQueryKey(activeUserId)`, enable query only when user id is defined
- [x] T003 Update `client/src/hooks/useSession.ts` to `removeQueries({ queryKey: ["feed"] })` on `selectUser` and `clearSession` via `useQueryClient`

**Checkpoint**: New sign-in fetches fresh feed; old `likedByMe` not reused across users

---

## Phase 3: User Story 1 — Per-User Like State (Priority: P1) 🎯 MVP

**Goal**: Each account sees only its own liked hearts; account switch without browser refresh shows correct state

**Independent Test**: Carlos likes 3 threads → sign out → Maria sees none liked → Carlos back sees his 3 likes

### Implementation

- [x] T004 [US1] Scope `setQueriesData` in `client/src/hooks/useLike.ts` to `feedQueryKey` for current user (pass `userId` into hook or read from store)
- [x] T005 [P] [US1] Scope cache updates in `client/src/components/feed/FeedList.tsx` to `feedQueryKey`
- [x] T006 [P] [US1] Scope `setQueryData` in `client/src/pages/FeedPage.tsx` `onThreadCreated` to `feedQueryKey`
- [x] T007 [P] [US1] Scope cache updates in `client/src/hooks/useFollow.ts` to `feedQueryKey`
- [x] T008 [P] [US1] Scope socket handlers in `client/src/hooks/useSocketFeedSync.ts` to `feedQueryKey` for active session user
- [x] T009 [US1] Pass `activeUser.id` from `client/src/pages/FeedPage.tsx` into `useFeed` and ensure `FeedList` only renders after user is loaded

**Checkpoint**: SC-001 / SC-003 — five-account like isolation spot check

---

## Phase 4: User Story 2 — Accurate Like Count on Toggle (Priority: P1)

**Goal**: Like count increments/decrements by 1 on toggle and matches server after refresh

**Independent Test**: Thread at count N → like → N+1 → unlike → N → reload unchanged

### Implementation

- [x] T010 [US2] Fix `toggleLike` reconcile in `client/src/hooks/useLike.ts`: apply server `likeCount` after response; on idempotent already-liked set `likedByMe: true` without erroneous rollback
- [x] T011 [US2] Verify `client/src/hooks/useSocketFeedSync.ts` `like:updated` handler updates only `likeCount`, never `likedByMe`

**Checkpoint**: SC-002 — 10 like/unlike toggles on threads and replies

---

## Phase 5: User Story 3 — Readable Long Thread and Reply Text (Priority: P2)

**Goal**: Long and unbroken text wraps inside cards without horizontal overflow

**Independent Test**: 500-char post + long URL visible in card width, no horizontal scroll on message body

### Implementation

- [x] T012 [P] [US3] Add shared message body classes in `client/src/lib/messageBody.ts` per `contracts/ui-message-body.md`
- [x] T013 [P] [US3] Apply wrap classes to thread content in `client/src/components/thread/ThreadCard.tsx` (`break-words`, `whitespace-pre-wrap`, confirm `min-w-0`)
- [x] T014 [P] [US3] Apply wrap classes to reply content in `client/src/components/reply/ReplyCard.tsx`

**Checkpoint**: SC-004 — max-length and long URL threads/replies render without overflow

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build validation and regression

- [x] T015 Run `npm run build` in `client/` and confirm zero TypeScript errors
- [x] T016 Execute manual steps in `specs/003-fix-text-likes-ui/quickstart.md` (all sections)

---

## Dependencies & Execution Order

```text
Phase 1 (T001)
    ↓
Phase 2 (T002–T003) BLOCKS all user stories
    ↓
Phase 3 US1 (T004–T009) — MVP 🎯
    ↓
Phase 4 US2 (T010–T011) — depends on US1 cache scoping
    ↓
Phase 5 US3 (T012–T014) — independent of US1/US2 (can parallel after Phase 2)
    ↓
Phase 6 (T015–T016)
```

### User Story Dependencies

| Story | Depends on | Can start after |
|-------|------------|-----------------|
| US1 | Phase 2 | T003 complete |
| US2 | US1 (scoped cache) | T009 complete |
| US3 | Phase 2 only | T003 complete (parallel with US1/US2) |

---

## Parallel Example: User Story 1

After T004 starts (useLike scoped), run in parallel:

```text
T005 FeedList.tsx
T006 FeedPage.tsx
T007 useFollow.ts
T008 useSocketFeedSync.ts
```

---

## Parallel Example: User Story 3

```text
T013 ThreadCard.tsx
T014 ReplyCard.tsx
```

(T012 messageBody.ts first or inline same classes in both)

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1–2 (T001–T003)
2. Complete Phase 3 (T004–T009)
3. **STOP and VALIDATE** — Carlos/Maria sign-in test
4. Deploy/demo if isolation passes

### Incremental Delivery

1. Foundation + US1 → per-user hearts fixed  
2. US2 → counts visible on toggle  
3. US3 → text wrapping  
4. Polish → build + quickstart

### Suggested MVP Scope

**User Story 1** (Phase 1–3, T001–T009) — fixes shared likes across accounts, unblocks trustworthy testing of likes.

---

## Task Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 16 |
| **US1** | 6 (T004–T009) |
| **US2** | 2 (T010–T011) |
| **US3** | 3 (T012–T014) |
| **Setup + Foundational** | 3 (T001–T003) |
| **Polish** | 2 (T015–T016) |
| **Parallel opportunities** | T005–T008, T012–T014 |
