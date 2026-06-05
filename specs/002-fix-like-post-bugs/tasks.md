# Tasks: Fix Like Button Inconsistency and Post Error Screen

**Branch**: `002-fix-like-post-bugs` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1 — Post error screen (US2)

- [x] T001 [US2] Add `client/src/utils/normalizeThread.ts` — feed `Thread` shape helper
- [x] T002 [US2] Enrich `server/src/services/threadService.ts` `createThread` DTO (`replies`, `likedByMe`, `followingAuthor`)
- [x] T003 [US2] Normalize thread in `client/src/pages/FeedPage.tsx` `onThreadCreated`
- [x] T004 [US2] Guard `client/src/components/reply/ReplyList.tsx` with `replies ?? []`

## Phase 2 — Like reliability (US1)

- [x] T005 [US1] Idempotent like/unlike in `server/src/services/likeService.ts`
- [x] T006 [US1] Refactor `client/src/hooks/useLike.ts` — optimistic updates, per-target pending, rollback
- [x] T007 [US1] Wire per-target pending in `client/src/components/feed/FeedList.tsx` and cards

## Phase 3 — Verification

- [x] T008 Run client/server TypeScript build check
