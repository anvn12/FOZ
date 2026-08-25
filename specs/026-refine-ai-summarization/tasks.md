# Tasks: Refine AI Summarization Test Suite

**Input**: Design documents from `/specs/026-refine-ai-summarization/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3], [US4])

---

## Phase 1: Setup & Foundational Implementation

**Purpose**: Extract pure algorithm helpers and enforce route auth before refining test suites

- [x] T001 Extract pure `sampleCommentsForSummary` helper function in `src/backend/services/post-summary.service.ts`
- [x] T002 [P] Update `src/backend/db/repositories/post-summary.repository.ts` to delegate sampled comments sorting to `sampleCommentsForSummary`
- [x] T003 [P] Update `src/backend/api/posts/routes.ts` to enforce `requireAuth` on `/posts/:postId/summary` and `/posts/:postId/summary/refresh` per Constitution Principle VI

---

## Phase 2: User Story 1 - AI Summarizer Fallbacks & Resilience Tests (Priority: P1)

**Goal**: Refactor `ai-summarizer.test.ts` to thoroughly test fallback heuristics, upstream model chain failover, malformed JSON recovery, and text truncation without external network dependencies.

- [x] T004 [US1] Refactor `src/backend/api/posts/__tests__/ai-summarizer.test.ts` with comprehensive unit tests for fallback outputs, mock LLM failover (`vi.spyOn(globalThis, "fetch")`), malformed JSON recovery, and text truncation
- [x] T005 [P] [US1] Delete redundant test file `src/backend/api/posts/__tests__/post-summary-fallbacks.test.ts`

---

## Phase 3: User Story 2 - Pure 4:3:3 Comment Sampling & Deduplication Tests (Priority: P1)

**Goal**: Replace the local copy-pasted sorting loops in `comment-sampling-dedup.test.ts` with direct unit tests of the production `sampleCommentsForSummary` function.

- [x] T006 [US2] Refactor `src/backend/api/posts/__tests__/comment-sampling-dedup.test.ts` to test production `sampleCommentsForSummary` against 4:3:3 priority buckets, deduplication, 0 engagement fallback, and <10 comments threads

---

## Phase 4: User Story 3 - API Summary Routes & Caching Lifecycle Tests (Priority: P2)

**Goal**: Expand `summary-routes.test.ts` to verify full response envelopes, caching lifecycles, guest authentication gates, and rate limiting.

- [x] T007 [US3] Refactor `src/backend/api/posts/__tests__/summary-routes.test.ts` to test 200 OK (`cached: false` vs `cached: true`), `POST /refresh`, 401 UNAUTHENTICATED for guest users, 404 NOT_FOUND, and scoped 429 RATE_LIMITED protection

---

## Phase 5: User Story 4 - Database Repository Query Filters & Upsert Tests (Priority: P2)

**Goal**: Replace the trivial `typeof === 'function'` test in `post-summary-repository.test.ts` with real tests for SQL filters and upsert persistence.

- [x] T008 [US4] Refactor `src/backend/api/posts/__tests__/post-summary-repository.test.ts` to test SQL comment filtering (excluding `deletedAt != null` and `visibilityState = 'hidden'`) and upsert behavior

---

## Phase 6: Polish & Verification

**Purpose**: Execute full test suite and verify coverage and performance

- [x] T009 Run complete post summary test suite via `npm test -- src/backend/api/posts/__tests__/` and verify zero errors in <2.0s
