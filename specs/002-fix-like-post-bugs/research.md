# Research: Fix Like Button Inconsistency and Post Error Screen

**Phase**: 0 | **Date**: 2026-06-04 | **Plan**: [plan.md](./plan.md)

All Technical Context items resolved via codebase inspection. No NEEDS CLARIFICATION
remains.

---

## Decision 1: Post error screen root cause

**Decision**: Incomplete `Thread` object inserted into feed cache after create.

**Evidence**:

- `server/src/services/threadService.ts` `createThread()` returns only
  `id`, `content`, `imageUrl`, counts, `createdAt`, `author` — no `replies`,
  `likedByMe`, `followingAuthor`.
- `client/src/pages/FeedPage.tsx` `onThreadCreated` prepends `body.data` directly.
- `client/src/components/reply/ReplyList.tsx` line 19:
  `if (replies.length === 0)` throws when `replies` is `undefined`.
- `client/src/components/common/ErrorBoundary.tsx` renders “Something went wrong”
  on any child render error — matches user report.

**Rationale**: Thread saves on server; refresh loads via `GET /threads` which
includes full shape — explains “refresh fixes it”.

**Alternatives considered**:

- Remove ErrorBoundary — rejected; hides real bugs.
- Only fix ReplyList guard — insufficient; other components may assume
  `followingAuthor` / `likedByMe`.

---

## Decision 2: Thread shape normalization strategy

**Decision**: Dual-layer normalization — server enriches `createThread` response
to match feed DTO; client uses `normalizeThreadForFeed()` before cache writes.

**Rationale**: Defense in depth; `ThreadCompose` uses raw `fetch` today and may
bypass typed `api` helpers.

**Alternatives considered**:

- Client-only normalize — acceptable minimum; server change reduces drift.
- Refetch entire feed after post — works but slower and flickers (violates SC-003).

---

## Decision 3: Like failure root cause

**Decision**: Combination of global mutation pending state, missing optimistic
updates, and non-idempotent 409 handling desynchronizing UI from server.

**Evidence**:

- `client/src/hooks/useLike.ts`: single `useMutation`; `isPending` shared;
  cache updates only after success; no `onError` rollback.
- `server/src/services/likeService.ts`: `P2002` → `409 ALREADY_LIKED`.
- `FeedList` passes `likePending` to every `LikeButton` — all disabled during
  one request.
- Rapid double-click or stale `likedByMe` in closure can trigger duplicate POST.

**Rationale**: Symptom “only 1–2 likes work” matches stuck state after 409 or
perceived freeze while all buttons disabled.

**Alternatives considered**:

- Server-only idempotent like — helps but UI still needs optimistic/per-target
  pending.
- Disable double-click only — insufficient without rollback and 409 recovery.

---

## Decision 4: Like UX fix pattern

**Decision**: Optimistic TanStack Query cache update + per-`targetId` in-flight
set + treat `409 ALREADY_LIKED` as success (sync `likedByMe: true`).

**Rationale**: Matches spec FR-001–FR-003 and edge cases (double-click, failed
mid-flight revert).

**Alternatives considered**:

- Refetch feed after each like — too heavy for prototype.
- Queue likes serially globally — still blocks UX; per-target pending is better.

---

## Decision 5: Error presentation

**Decision**: Catch API errors in like/post handlers; show inline message; never
rely on ErrorBoundary for expected failures.

**Rationale**: FR-006; ErrorBoundary reserved for unexpected render errors.

**Alternatives considered**:

- React Query `onError` toast globally — acceptable add-on; per-action message
  is minimum.
