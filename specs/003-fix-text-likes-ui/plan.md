# Implementation Plan: Fix Thread Text Overflow, Per-User Likes, and Like Count Display

**Branch**: `003-fix-text-likes-ui` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-fix-text-likes-ui/spec.md`

## Summary

Three post-MVP bugs: long thread text overflows horizontally; like hearts appear
shared across all five test accounts; like totals do not visibly increase on
like.

**Root causes (code review)**:

1. **Shared likes across accounts**: TanStack Query feed cache uses key `["feed"]`
   with no session user id. `likedByMe` written by user A stays in cache when
   user B signs in without refetch. `useSession.selectUser` does not invalidate
   feed data.
2. **Like count stuck**: Optimistic update increments count, then idempotent server
   response (duplicate like / stale `likedByMe`) returns the **current** aggregate
   count without a +1, overwriting optimistic state. Compounded when cache shows
   wrong `likedByMe` from issue #1.
3. **Text overflow**: `ThreadCard` has `whitespace-pre-wrap` but lacks
   `break-words` / `overflow-wrap` for long unbroken strings; `ReplyCard` lacks
   pre-wrap and break utilities; flex children may need `min-w-0` to allow shrink.

**Technical approach**: Centralize `feedQueryKey(userId)`; scope all feed cache
reads/writes; invalidate or remove feed queries on session change; reconcile like
toggle with server count without clobbering optimistic +1 when already liked;
add shared text body CSS classes for thread and reply content.

## Technical Context

**Language/Version**: TypeScript 5.x (client-focused; server unchanged unless like
emit ordering reviewed)

**Primary Dependencies**: React 18, TanStack Query v5, Tailwind CSS 3 (existing
MVP stack)

**Storage**: MS SQL Server / Prisma — per-user likes already modeled correctly
on server; bug is client cache isolation

**Testing**: Manual verification per quickstart; client `tsc` + build

**Target Platform**: Web browser

**Project Type**: Web application (`client/` primary, `server/` verify only)

**Performance Goals**: Account switch shows correct feed state on first paint
after navigation (SC-003)

**Constraints**: Keep aggregate `likeCount` global; only `likedByMe` is
per-session user; no auth redesign

**Scale/Scope**: ~8–10 client files; optional small shared helper module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Modular Client-Server Architecture | ✅ PASS | Server like model unchanged; client cache contract fixed |
| II. Enforced Folder Structure | ✅ PASS | Helper under `client/src/lib/` or `hooks/` |
| III. Clean Code & Reusability | ✅ PASS | Single `feedQueryKey()` + `messageBodyClass` reused |
| IV. Security at Every Layer | ✅ PASS | Session still drives server `likedByMe`; client must not leak prior session |
| V. AI Service Abstraction | ✅ N/A | |
| VI. Consistency Over Cleverness | ✅ PASS | Same query-key pattern everywhere |

**Gate result**: Pass. No Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-text-likes-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── client-feed-cache.md
│   └── ui-message-body.md
└── tasks.md             # /speckit-tasks
```

### Source Code (files to change)

```text
client/src/
├── lib/feedQuery.ts              # NEW — feedQueryKey(userId | undefined)
├── hooks/useFeed.ts              # scoped queryKey
├── hooks/useLike.ts              # scoped setQueriesData + reconcile logic
├── hooks/useSocketFeedSync.ts    # scoped cache updates
├── hooks/useFollow.ts            # scoped cache updates
├── hooks/useSession.ts           # invalidate/remove feed on select/clear
├── pages/FeedPage.tsx            # scoped setQueryData on thread create
├── components/feed/FeedList.tsx  # scoped cache mutators
├── components/thread/ThreadCard.tsx
└── components/reply/ReplyCard.tsx
```

**Structure Decision**: Bug fix patch on existing MVP; no new packages.

## Implementation Phases (for /speckit-tasks)

### Phase A — Per-user feed cache (US1, FR-001/002)

1. Add `feedQueryKey(userId: string | undefined)` → `["feed", userId]`.
2. `useFeed(activeUserId)` — include user id in query key; disable query until
   user id known.
3. Replace all `{ queryKey: ["feed"] }` with `feedQueryKey` in hooks/components.
4. `useSession`: on `selectUser` and `clearSession`, call
   `queryClient.removeQueries({ queryKey: ["feed"] })` or invalidate scoped keys.
5. Verify Carlos → sign out → Maria: hearts not pre-filled from Carlos.

### Phase B — Like count display (US2, FR-003/004/007)

1. In `useLike.toggleLike`, after server response:
   - Always apply `serverCount` and final `likedByMe` from action outcome.
   - On idempotent already-liked path: set `likedByMe: true`, use `serverCount`
     (do not apply optimistic +1 if server count unchanged).
2. Review socket `like:updated` handler: update **only** `likeCount`, never
   `likedByMe`; use scoped query filter.
3. Optional: skip optimistic count bump when detecting duplicate-click; rely on
   server count after response.

### Phase C — Message wrapping (US3, FR-005/006)

1. Add shared class string e.g. `break-words overflow-wrap-anywhere whitespace-pre-wrap`
   (Tailwind: `break-words` + `whitespace-pre-wrap`).
2. Apply to `ThreadCard` content `<p>` and `ReplyCard` content `<p>`.
3. Ensure card layout uses `min-w-0` on flex text column (already on thread).

### Phase D — Verification

Run quickstart: 5-account like isolation, ±1 counts, 500-char + long URL thread.

## Complexity Tracking

> No constitution violations.
