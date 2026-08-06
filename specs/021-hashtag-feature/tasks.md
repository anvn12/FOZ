# Tasks: Hashtag Feature

**Input**: Design documents from `/specs/021-hashtag-feature/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared schemas and contract DTO definitions

- [x] T001 Define Zod schemas and DTO types in `src/shared/schemas/hashtags.ts`
- [x] T002 Re-export hashtag schemas in `src/shared/schemas/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, Drizzle migration, and core extraction helper

- [x] T003 Create Drizzle database schema for `hashtags` and `post_hashtags` in `src/backend/db/schema/hashtags.ts`
- [x] T004 Re-export hashtag schema in `src/backend/db/schema/index.ts`
- [x] T005 Create database migration SQL `src/backend/db/migrations/0008_hashtags.sql`
- [x] T006 Implement hashtag extraction repository helper (`extractHashtagsAndSync`) in `src/backend/db/repositories/hashtags.ts`

**Checkpoint**: Core data layer ready for user stories.

---

## Phase 3: User Story 1 - Create and Render Hashtags in Forum Content (Priority: P1) 🎯 MVP

**Goal**: Automatically extract hashtags upon post creation and render clickable hashtag links in post content across feeds and details.

**Independent Test**: Publish a post containing `#foz` and verify `#foz` is extracted into DB and rendered as an interactive link.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create `<HashtagText />` parser component in `src/frontend/src/components/HashtagText.tsx`
- [x] T008 [US1] Update post creation endpoint in `src/backend/api/posts/routes.ts` to trigger `extractHashtagsAndSync` on new posts
- [x] T009 [US1] Update `FeedPostItem` in `src/frontend/src/components/FeedPostItem.tsx` to render post body using `<HashtagText />`

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Explore Hashtag Feed with Live Data (Priority: P2)

**Goal**: View a dedicated live post feed filtered by hashtag at `/hashtags/:tag`.

**Independent Test**: Navigate to `/hashtags/foz` and verify it fetches live database posts containing `#foz`.

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement `getPostsByHashtag` repository function in `src/backend/db/repositories/hashtags.ts`
- [x] T011 [US2] Implement API route `GET /api/v1/hashtags/:tag/posts` in `src/backend/api/hashtags/routes.ts`
- [x] T012 [US2] Mount hashtags sub-router in `src/backend/index.ts` under `/api/v1/hashtags`
- [x] T013 [P] [US2] Create API client function `listPostsByHashtag` in `src/frontend/src/api/hashtags.ts`
- [x] T014 [US2] Implement `HashtagFeedPage` view in `src/frontend/src/pages/HashtagFeedPage.tsx`
- [x] T015 [US2] Register route `/hashtags/:tag` in `src/frontend/src/App.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 work independently.

---

## Phase 5: User Story 3 - Discover Live Trending Hashtags (Priority: P3)

**Goal**: Display top 10 trending hashtags from the last 7 days in the homepage sidebar widget.

**Independent Test**: View sidebar and verify live trending hashtags render with post count badges.

### Implementation for User Story 3

- [x] T016 [P] [US3] Implement 7-day rolling window `getTrendingHashtags` repository query in `src/backend/db/repositories/hashtags.ts`
- [x] T017 [US3] Implement API route `GET /api/v1/hashtags/trending` in `src/backend/api/hashtags/routes.ts`
- [x] T018 [P] [US3] Create API client hook `useTrendingHashtags` in `src/frontend/src/api/hashtags.ts`
- [x] T019 [US3] Create `TrendingHashtagsWidget` component in `src/frontend/src/components/TrendingHashtagsWidget.tsx`
- [x] T020 [US3] Embed `TrendingHashtagsWidget` into homepage sidebar layout

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Automated integration tests and validation

- [x] T021 [P] Write integration tests for hashtag extraction and queries in `src/backend/api/hashtags/__tests__/hashtags.test.ts`
- [x] T022 Validate typecheck (`npx tsc --noEmit`) and production build (`npm run build`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2.
- **User Story 2 (Phase 4)**: Depends on Phase 2.
- **User Story 3 (Phase 5)**: Depends on Phase 2.
- **Polish (Phase 6)**: Depends on completion of User Stories.

---

## Parallel Execution Opportunities

- T007 [P] (HashtagText component) can be built in parallel with T008 (backend creation route update).
- T010 [P] (getPostsByHashtag repository) and T013 [P] (API client function) can run in parallel.
- T016 [P] (getTrendingHashtags repository) and T018 [P] (useTrendingHashtags hook) can run in parallel.
