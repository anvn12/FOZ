# Tasks: Post Summarize (TL;DR)

**Input**: Design documents from `/specs/011-post-summarize/`

**Prerequisites**: [plan.md](file:///d:/FOZ/specs/011-post-summarize/plan.md), [spec.md](file:///d:/FOZ/specs/011-post-summarize/spec.md), [data-model.md](file:///d:/FOZ/specs/011-post-summarize/data-model.md), [contracts/post-summary-api.yaml](file:///d:/FOZ/specs/011-post-summarize/contracts/post-summary-api.yaml), [quickstart.md](file:///d:/FOZ/specs/011-post-summarize/quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared Zod DTO schema definitions accessible to frontend and backend.

- [x] T001 [P] Create Zod DTO schemas for post summary requests and responses in `src/shared/schemas/post-summary.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema and service interfaces that MUST be complete before user stories can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Add `post_summaries` table schema to Drizzle interactions in `src/backend/db/schema/interactions.ts`
- [x] T003 Generate and apply DB migration for `post_summaries` table using Drizzle Kit in `src/backend/db/migrations/`
- [x] T004 [P] Implement `AISummarizerProvider` interface and REST API client in `src/backend/services/ai-summarizer.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - On-Demand Post & Comment Summary (Priority: P1) 🎯 MVP

**Goal**: Allow users to trigger an AI-generated TL;DR summary of a post and its top comments, caching results in PostgreSQL for instant load on subsequent views.

**Independent Test**: Trigger `GET /api/v1/posts/:postId/summary` on a post with 10+ comments and verify that a structured summary (snapshot, key highlights, sentiment) is returned and cached.

### Implementation & Tests for User Story 1

- [x] T005 [P] [US1] Create unit test for AI summarizer provider in `src/backend/__tests__/ai-summarizer.test.ts`
- [x] T006 [P] [US1] Create unit test for comment sampling repository in `src/backend/__tests__/post-summary-repository.test.ts`
- [x] T007 [US1] Implement comment sampling repository function `getSampledCommentsForSummary` and DB operations in `src/backend/db/repositories/post-summary.repository.ts`
- [x] T008 [US1] Implement Express route handlers for `GET /api/v1/posts/:postId/summary` in `src/backend/api/posts/summary.routes.ts`
- [x] T009 [US1] Mount post summary routes under `/api/v1/posts` in `src/backend/index.ts`
- [x] T010 [US1] Implement React component `PostSummaryCard.tsx` with "Generate TL;DR" button in `src/frontend/components/PostSummaryCard.tsx`
- [x] T011 [US1] Integrate `PostSummaryCard` into post detail view in `src/frontend/pages/PostDetailPage.tsx`

**Checkpoint**: User Story 1 MVP fully functional and testable independently.

---

## Phase 4: User Story 2 - Representative Comment Selection Strategy (Priority: P2)

**Goal**: Ensure comment sampling strictly respects the 4:3:3 ratio (4 Most Liked, 3 Most Replied by 1st-level child count, 3 Most Recent) with deduplication across buckets.

**Independent Test**: Query a post with known reaction counts, child reply counts, and timestamps; verify that exactly 10 unique comments are selected according to the ratio without duplicate IDs.

### Implementation & Tests for User Story 2

- [x] T012 [P] [US2] Create integration test for comment sampling deduplication logic in `src/backend/__tests__/comment-sampling-dedup.test.ts`
- [x] T013 [US2] Enhance `post-summary.repository.ts` to compute 1st-level direct child reply counts and apply multi-bucket deduplication in `src/backend/db/repositories/post-summary.repository.ts`

**Checkpoint**: User Stories 1 AND 2 work together seamlessly with verified sampling accuracy.

---

## Phase 5: User Story 3 - Handling Short Threads & Fallback Summaries (Priority: P3)

**Goal**: Handle low-activity posts (0 to 9 comments) and AI service downtime gracefully, and enable manual summary refreshes.

**Independent Test**: Test summary requests on 0-comment posts and verify fallback text; simulate LLM API failure and verify user-friendly toast/fallback; test manual refresh endpoint `POST /api/v1/posts/:postId/summary/refresh`.

### Implementation & Tests for User Story 3

- [x] T014 [P] [US3] Create unit tests for short threads and AI failure fallbacks in `src/backend/__tests__/post-summary-fallbacks.test.ts`
- [x] T015 [US3] Add fallback logic for posts with 0-9 comments and API error handling in `src/backend/services/ai-summarizer.ts`
- [x] T016 [US3] Implement manual "Refresh Summary" route `POST /api/v1/posts/:postId/summary/refresh` in `src/backend/api/posts/summary.routes.ts`
- [x] T017 [US3] Add UI "Refresh Summary" button and error toast notifications in `src/frontend/components/PostSummaryCard.tsx`

**Checkpoint**: All user stories functional, robust, and edge-case tested.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening, rate limiting, and end-to-end quickstart validation.

- [x] T018 [P] Configure rate-limiting middleware for summary generation endpoints in `src/backend/api/posts/summary.routes.ts`
- [x] T019 Run full quickstart verification suite per `specs/011-post-summarize/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion (MVP).
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion and US1 repository setup.
- **User Story 3 (Phase 5)**: Depends on US1 service and UI setup.
- **Polish (Phase 6)**: Depends on US1, US2, US3 completion.

### Parallel Opportunities
- `T001` (Shared Zod schema) and `T004` (AI Summarizer provider) can be implemented in parallel.
- `T005` (AI test) and `T006` (Repository test) can be written in parallel.
- `T010` (Frontend UI component) can be built in parallel with `T008` (Backend route handler).
- `T012` (Dedup test) and `T014` (Fallback test) can be developed in parallel.
