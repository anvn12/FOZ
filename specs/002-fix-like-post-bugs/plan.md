# Implementation Plan: Fix Like Button Inconsistency and Post Error Screen

**Branch**: `002-fix-like-post-bugs` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-fix-like-post-bugs/spec.md`

## Summary

MVP testing found two regressions: likes stop working after a few actions, and
posting a thread triggers the full-screen ErrorBoundary (“Something went wrong”)
even though the thread is saved.

**Root causes (code review)**:

1. **Post → black screen**: `POST /api/threads` returns a slim thread object
   (no `replies`, `likedByMe`, `followingAuthor`). `FeedPage.onThreadCreated`
   prepends it to the TanStack Query feed cache. `ReplyList` calls
   `replies.length` on `undefined` → render throw → `ErrorBoundary`.
2. **Like inconsistency**: `useLike` uses one global `useMutation` with
   `isPending` disabling **all** like buttons; no optimistic update or error
   recovery; duplicate-like (`409 ALREADY_LIKED`) leaves UI out of sync with
   server; unhandled async errors on rapid clicks.

**Technical approach**: Normalize created threads to the feed `Thread` shape
before cache insert (server and/or client); harden `ReplyList` against missing
`replies`; refactor `useLike` with optimistic updates, per-target in-flight
tracking, and idempotent handling of 409; add inline error feedback (no
ErrorBoundary for expected API failures).

## Technical Context

**Language/Version**: TypeScript 5.x (client and server)

**Primary Dependencies**: React 18, Vite 5, TanStack Query v5, Express 4,
Prisma 5, Socket.io 4 (unchanged from MVP)

**Storage**: MS SQL Server via Prisma — no schema migration required unless
idempotent-like server change chooses upsert pattern

**Testing**: Manual browser verification per quickstart; optional Vitest unit
tests for `normalizeThread` / cache updaters

**Target Platform**: Web browser (existing MVP deployment)

**Project Type**: Web application — `client/` + `server/` bug-fix patch on
`001-threads-platform` codebase

**Performance Goals**: Like UI feedback &lt; 500 ms (SC-002); post visible
without refresh (SC-003)

**Constraints**: No new auth; preserve prototype trust model; minimal API
surface change; inline errors only (FR-006)

**Scale/Scope**: Fix two user flows; touch ~6–8 files in `client/`, optionally
1–2 in `server/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Modular Client-Server Architecture | ✅ PASS | Fixes stay in respective layers; shared shape documented in contracts |
| II. Enforced Folder Structure | ✅ PASS | Changes only in existing `client/src/hooks`, `components`, `server/src/services` |
| III. Clean Code & Reusability | ✅ PASS | Extract `normalizeThreadForFeed()` (client) to avoid duplicate shape logic |
| IV. Security at Every Layer | ✅ PASS | No change to session/ownership model |
| V. AI Service Abstraction | ✅ N/A | |
| VI. Consistency Over Cleverness | ✅ PASS | Align POST thread payload with GET feed thread shape |

**Gate result**: All applicable principles pass. No Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-like-post-bugs/
├── plan.md              # This file
├── research.md          # Phase 0 — root cause & fix decisions
├── data-model.md        # Phase 1 — entity invariants (no migration)
├── quickstart.md        # Phase 1 — verification steps
├── contracts/
│   ├── rest-api.md      # POST /threads response alignment
│   └── client-cache.md  # Feed cache thread shape contract
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (files to change)

```text
client/src/
├── hooks/useLike.ts              # optimistic like, per-target pending, 409 sync
├── hooks/useSocketFeedSync.ts    # optional: preserve likedByMe on socket updates
├── pages/FeedPage.tsx            # normalize thread on create
├── components/thread/ThreadCompose.tsx  # optional: use api helper + normalize
├── components/reply/ReplyList.tsx        # defensive replies ?? []
├── components/feed/FeedList.tsx          # try/catch or .catch on toggleLike
├── utils/normalizeThread.ts      # NEW — feed Thread shape helper
└── types/index.ts                # optional CreateThreadResponse type

server/src/
└── services/threadService.ts     # enrich createThread return to match feed DTO
```

**Structure Decision**: Web app split unchanged; bug fix is incremental on MVP
tree.

## Implementation Phases (for /speckit-tasks)

### Phase A — Post error screen (P1)

1. Add `normalizeThreadForFeed(partial, sessionUserId)` returning full `Thread`
   with `replies: []`, `likedByMe: false`, `followingAuthor` from follow status
   or `false` default.
2. Update `threadService.createThread` to return feed-aligned DTO (include
   `replies`, `likedByMe`, `followingAuthor`) **or** normalize only on client
   in `onThreadCreated` — prefer **both** for defense in depth.
3. Guard `ReplyList`: `const list = replies ?? []`.
4. Verify: post text-only and image thread → no ErrorBoundary; thread at top of
   feed.

### Phase B — Like reliability (P1)

1. Refactor `useLike`:
   - Optimistic cache update before API call; rollback on failure.
   - Track in-flight by `targetId` (not global `isPending`).
   - On `409 ALREADY_LIKED`: set `likedByMe: true` and refresh count from
     response or refetch single target — treat as success (idempotent UX).
   - On `404 NOT_LIKED` for unlike: set `likedByMe: false`.
2. `FeedList` / `LikeButton`: disable only the active target’s button.
3. Surface errors inline (toast or small message near card) — never throw to
   ErrorBoundary for API errors.
4. Optional server: change `likeTarget` duplicate to return current `likeCount`
   with 200 instead of 409 (true idempotency per spec FR entity note).

### Phase C — Verification

Run quickstart regression: 20+ likes, post 3+ threads across 2 accounts.

## Complexity Tracking

> No constitution violations.
