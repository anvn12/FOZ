# Research: Fix Thread Text Overflow, Per-User Likes, and Like Count Display

**Phase**: 0 | **Date**: 2026-06-04 | **Plan**: [plan.md](./plan.md)

---

## Decision 1: Cross-account liked hearts

**Decision**: Scope TanStack Query feed cache by active `userId` and purge feed
cache on session change.

**Evidence**:

- `useFeed` uses `queryKey: ["feed"]` only.
- `useLike`, `FeedList`, `FeedPage`, `useSocketFeedSync`, `useFollow` mutate/read
  the same unscoped key.
- `useSession.selectUser` navigates to feed without `invalidateQueries`.

**Rationale**: `likedByMe` is per-user data stored inside a global cache entry;
switching accounts reuses stale `likedByMe` flags — matches “Carlos liked → all
accounts show liked.”

**Alternatives considered**:

- Full page reload on sign-in — works but poor UX; rejected.
- Store liked state only in component state — rejected; breaks infinite scroll cache.

---

## Decision 2: Like count not increasing

**Decision**: Fix cache isolation first; then reconcile optimistic updates with
server `likeCount` on idempotent duplicate-like responses.

**Evidence**:

- Optimistic path: `likeCount + 1` then `api.post` returns `serverCount`.
- Server `likeService` on `P2002` returns **current** count without new increment.
- If UI had wrong `likedByMe: false` while DB already liked, optimistic +1 then
  server returns pre-increment aggregate → UI reverts or stays flat.

**Rationale**: Count bug is often a symptom of wrong `likedByMe` + idempotent
server behavior, not a broken increment on fresh likes.

**Alternatives considered**:

- Remove optimistic updates — slower UX; keep with better reconcile.
- Always increment client-side — rejected; diverges from aggregate truth.

---

## Decision 3: Long text overflow

**Decision**: Use `whitespace-pre-wrap` + `break-words` (and `min-w-0` on flex
children) on thread and reply body elements.

**Evidence**:

- `ThreadCard` has `whitespace-pre-wrap` only — long unbroken tokens overflow.
- `ReplyCard` uses plain `text-sm` without wrap/break classes.

**Rationale**: CSS `word-break` / `overflow-wrap` is standard for URL-heavy
social text within fixed-width cards.

**Alternatives considered**:

- Truncate with ellipsis — rejected; spec requires full readable text.
- `overflow-x-auto` on message — rejected; spec forbids horizontal overflow.

---

## Decision 4: Server changes

**Decision**: No server schema or API changes required for this feature.

**Rationale**: `getPaginatedFeed` already computes `likedByMe` from session
`userId`; likes are per-user in DB. Bugs are client cache and presentation.

**Alternatives considered**:

- New endpoint per user feed — unnecessary.
