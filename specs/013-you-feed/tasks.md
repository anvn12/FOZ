# Tasks: You Feed

**Input**: Design documents from `/specs/013-you-feed/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core feed infrastructure — scoring engine and optimized queries. Must complete before any user story.

- [ ] T001 Create feed ranking pure function with affinity/engagement/recency scoring in `src/backend/services/interactions/feed-ranking.ts`
- [ ] T002 [P] Add feed ranking unit tests (cold start, affinity boost, recency decay, edge cases) in `src/backend/__tests__/unit/feed-ranking.test.ts`
- [ ] T003 Add batch query helpers to fetch posts with engagement counts in single query (fix N+1) in `src/backend/db/repositories/interactions.ts`
- [ ] T004 Add `listPosts` ORDER BY `createdAt DESC` so newest posts appear first (fixes new-post-at-bottom bug) in `src/backend/db/repositories/interactions.ts`
- [ ] T005 Add feed query Zod schema (`type` enum: `for-you` | `latest`, `cursor`, `limit`) in `src/shared/schemas/interactions.ts`

**Checkpoint**: Foundation ready — scoring function tested, queries optimized, ordering fixed

---

## Phase 2: User Story 1 — Personalized Feed Discovery (Priority: P1) 🎯 MVP

**Goal**: Logged-in users see a "For You" feed ranked by interaction affinity, engagement, and recency

**Independent Test**: Log in as user with interactions → `GET /api/v1/posts?type=for-you` returns posts ranked by relevance, not chronological

### Implementation

- [ ] T006 [US1] Implement `listForYouFeed(viewerId, limit?, cursor?)` service function that fetches posts, batch-fetches viewer interactions, scores, sorts, and paginates in `src/backend/services/interactions/posts.ts`
- [ ] T007 [US1] Implement `listPopularFeed(limit?, cursor?)` service function for guest/cold-start fallback (engagement + recency only) in `src/backend/services/interactions/posts.ts`
- [ ] T008 [US1] Add `type` query param handling to `GET /api/v1/posts` route — dispatch to `listForYouFeed` or `listPopularFeed` or chronological based on `type` and auth state in `src/backend/api/posts/routes.ts`
- [ ] T009 [US1] Add graceful degradation: wrap personalization in try/catch, fall back to chronological with `degraded: true` flag in response in `src/backend/api/posts/routes.ts`
- [ ] T010 [P] [US1] Add feed endpoint integration tests (personalized, cold-start, degraded fallback, <500ms NFR) in `src/backend/__tests__/integration/feed.test.ts`

**Checkpoint**: Backend feed API complete — `GET /api/v1/posts?type=for-you` works for authenticated users

---

## Phase 3: User Story 2 — Feed Tab Switching (Priority: P2)

**Goal**: Logged-in users can switch between "For You" and "Latest" tabs, with preference persisted

**Independent Test**: Toggle tabs → feed content changes → refresh page → previously selected tab remembered

### Implementation

- [ ] T011 [P] [US2] Create zustand feed store with `persist` middleware for tab preference (`for-you` | `latest`) in `src/frontend/src/stores/feed.ts`
- [ ] T012 [US2] Add `listFeed(type: 'for-you' | 'latest')` API function that calls `GET /api/v1/posts?type=...` in `src/frontend/src/api/interactions.ts`
- [ ] T013 [US2] Add tab switcher UI ("For You" / "Latest") to `Feed` component with ARIA labels, keyboard nav in `src/frontend/src/pages/feed/FeedPage.tsx`
- [ ] T014 [US2] Wire tab switcher to zustand store and react-query — switch tab → invalidate query → fetch new feed type in `src/frontend/src/pages/feed/FeedPage.tsx`
- [ ] T015 [US2] Show loading state while feed switches, handle empty state per tab in `src/frontend/src/pages/feed/FeedPage.tsx`

**Checkpoint**: Tab switching works end-to-end for logged-in users

---

## Phase 4: User Story 3 — Guest Feed Experience (Priority: P3)

**Goal**: Guest users see a popularity-based feed; "For You" tab hidden or prompts login

**Independent Test**: Open site without logging in → feed shows popular recent posts → no "For You" tab visible

### Implementation

- [ ] T016 [US3] Hide "For You" tab for guest users or show it with login prompt in `src/frontend/src/pages/feed/FeedPage.tsx`
- [ ] T017 [US3] Ensure guest feed defaults to `type=latest` (chronological) in `src/frontend/src/pages/feed/FeedPage.tsx`
- [ ] T018 [P] [US3] Add guest feed integration test — `GET /api/v1/posts?type=for-you` without auth returns popularity feed in `src/backend/__tests__/integration/feed.test.ts`

**Checkpoint**: Guest experience complete — usable feed without login

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple stories

- [ ] T019 Ensure new post created via `POST /api/v1/posts` appears at top of both feed types (verify T004 fix works end-to-end) in `src/backend/services/interactions/posts.ts`
- [ ] T020 Add feed pagination support (`cursor` param) to frontend — infinite scroll or "Load more" in `src/frontend/src/pages/feed/FeedPage.tsx`
- [ ] T021 Verify WCAG 2.1 Level AA: tab switcher keyboard nav, color contrast, screen-reader labels in `src/frontend/src/pages/feed/FeedPage.tsx`
- [ ] T022 Run quickstart.md validation — manual test all 5 scenarios in `specs/013-you-feed/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 completion
- **Phase 3 (US2)**: Depends on Phase 2 (needs the feed API)
- **Phase 4 (US3)**: Depends on Phase 2 (needs the feed API)
- **Phase 5 (Polish)**: Depends on Phases 2–4

### User Story Dependencies

- **US1 (P1)**: After Phase 1 — no other story dependencies
- **US2 (P2)**: After Phase 1 — integrates with US1 API but independently testable
- **US3 (P3)**: After Phase 1 — shares backend with US1, frontend changes are independent

### Parallel Opportunities

- T001 + T003 + T005 can run in parallel (different files)
- T002 runs after T001 (tests the scoring function)
- T010 + T011 can run in parallel (backend test vs frontend store)
- T016 + T018 can run in parallel (frontend vs backend test)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Scoring function + query optimization + ordering fix
2. Complete Phase 2: Backend feed API with personalized ranking
3. **STOP and VALIDATE**: `GET /api/v1/posts?type=for-you` returns ranked posts
4. New posts appear at top ← guaranteed by T004

### Incremental Delivery

1. Phase 1 → Foundation (includes new-post-at-top fix)
2. Phase 2 → Backend API complete (MVP!)
3. Phase 3 → Frontend tab switching
4. Phase 4 → Guest experience
5. Phase 5 → Polish

---

## Notes

- T004 fixes the "new post at bottom" bug globally — `ORDER BY createdAt DESC` on `listPosts`
- T019 is a verification task to confirm the fix works end-to-end after feed changes
- No new database tables — all ranking is computed at query time
- 500ms NFR enforced by single-query approach (no N+1)
