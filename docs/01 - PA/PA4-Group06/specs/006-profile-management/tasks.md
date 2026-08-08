# Tasks: Profile Management

**Input**: Design documents from `/specs/006-profile-management/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/profile-api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define the common validation models and schemas used by both frontend and backend.

- [x] T001 Create profile validation schemas in `src/shared/schemas/profile.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data layer, service handlers, routing entry points, and client-side API configurations.

- [x] T002 Create database operations in `src/backend/db/repositories/profiles.ts`
- [x] T003 Mount the profile routes in `src/backend/index.ts`
- [x] T004 Create frontend API hooks in `src/frontend/src/api/profile.ts`

**Checkpoint**: Foundational layer complete. User story implementation can now begin.

---

## Phase 3: User Story 1 - Public Profile View (Priority: P1) 🎯 MVP

**Goal**: Guests and authenticated users can view a public profile page showing fields, counts, and threads.

**Independent Test**: Navigate to `/profiles/:userId` as a guest or standard user and verify all fields (displayName, bio, location, website) and tabs render correctly.

### Tests for User Story 1
- [x] T005 [P] [US1] Create integration test file `src/backend/api/profile/profile.test.ts` with test cases for GET `/profiles/:userId`
- [x] T006 [P] [US1] Create frontend integration test file `src/frontend/src/pages/__tests__/ProfilePage.test.tsx` verifying public details render correctly

### Implementation for User Story 1
- [x] T007 [P] [US1] Implement `getProfileByUserId` service in `src/backend/api/profile/profile.service.ts`
- [x] T008 [US1] Implement GET `/api/v1/profiles/:userId` route handler in `src/backend/api/profile/routes.ts`
- [x] T009 [US1] Create frontend page component `src/frontend/src/pages/ProfilePage.tsx` rendering layout, stats, and tabs
- [x] T010 [US1] Register route `/profiles/:userId` in `src/frontend/src/App.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Profile Edit Form and Persistence (Priority: P1)

**Goal**: Profile owners can edit their display name, bio, location, and website details.

**Independent Test**: Log in, click "Edit Profile" on own profile, edit textual fields, click save, and verify page content updates.

### Tests for User Story 2
- [x] T011 [P] [US2] Add integration test cases for `PATCH /profiles/me` in `src/backend/api/profile/profile.test.ts`
- [x] T012 [P] [US2] Create form component test file `src/frontend/src/components/__tests__/ProfileEditModal.test.tsx`

### Implementation for User Story 2
- [x] T013 [US2] Implement `updateProfile` service in `src/backend/api/profile/profile.service.ts`
- [x] T014 [US2] Implement PATCH `/api/v1/profiles/me` route handler in `src/backend/api/profile/routes.ts`
- [x] T015 [US2] Create form modal component `src/frontend/src/components/ProfileEditModal.tsx` utilizing react-hook-form
- [x] T016 [US2] Integrate `ProfileEditModal` into `src/frontend/src/pages/ProfilePage.tsx` with modal triggering

**Checkpoint**: Textual profile editing is fully operational and verified.

---

## Phase 5: User Story 3 - Avatar Upload and Persistence (Priority: P1)

**Goal**: Authenticated users can upload and save custom avatar images as Base64 strings.

**Independent Test**: Choose a file in the edit modal, verify client-side preview changes, click save, and check the updated avatar on the page.

### Tests for User Story 3
- [x] T017 [P] [US3] Add integration test cases for `POST /profiles/me/avatar` in `src/backend/api/profile/profile.test.ts`

### Implementation for User Story 3
- [x] T018 [US3] Implement `POST /api/v1/profiles/me/avatar` route handler in `src/backend/api/profile/routes.ts`
- [x] T019 [US3] Implement file selection, size checks, and Base64 conversion logic in `src/frontend/src/components/ProfileEditModal.tsx`
- [x] T020 [US3] Render image preview in `src/frontend/src/components/ProfileEditModal.tsx` during selection

**Checkpoint**: Avatar uploading and database persistence are fully operational.

---

## Phase 6: User Story 4 - Access Control and Security Boundaries (Priority: P1)

**Goal**: Ensure profile modifications are restricted strictly to authorized owners.

**Independent Test**: Attempt profile edits as a guest and as a different user, verifying `401` and `403` error responses.

### Tests for User Story 4
- [x] T021 [P] [US4] Add unauthorized and forbidden test cases in `src/backend/api/profile/profile.test.ts`

### Implementation for User Story 4
- [x] T022 [US4] Enforce JWT authentication and ownership check middlewares on `PATCH /profiles/me` and `POST /profiles/me/avatar` in `src/backend/api/profile/routes.ts`
- [x] T023 [US4] Hide the "Edit Profile" control in `src/frontend/src/pages/ProfilePage.tsx` for non-owners

**Checkpoint**: Security boundaries are fully verified.

---

## Phase 7: User Story 5 - Form Validation and Limits (Priority: P2)

**Goal**: Gate profile inputs on character limits, URL patterns, and 2MB file limits.

**Independent Test**: Enter invalid fields or upload large files, verifying validation errors are shown and submissions are blocked.

### Tests for User Story 5
- [x] T024 [P] [US5] Add schema validation unit tests in `src/shared/schemas/profile.test.ts`

### Implementation for User Story 5
- [x] T025 [US5] Define exact validation schemas (displayName max 50, bio max 160, website regex) in `src/shared/schemas/profile.ts`
- [x] T026 [US5] Integrate Zod schemas into `src/backend/api/profile/routes.ts` and enforce size limits on Base64 payloads

**Checkpoint**: Input validations are fully active on both client and server boundaries.

---

## Phase 8: User Story 6 - Mobile Responsiveness (Priority: P2)

**Goal**: Support vertical stacking layouts on mobile viewports.

**Independent Test**: Load profile page at 390px width and verify layout matches Pixel 7 wireframes with no horizontal scrollbars.

### Implementation for User Story 6
- [x] T027 [US6] Apply responsive Tailwind utilities (flex-col, stacking) to `src/frontend/src/pages/ProfilePage.tsx`
- [x] T028 [US6] Ensure form input groups in `src/frontend/src/components/ProfileEditModal.tsx` stack vertically on small screens

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, codebase cleanliness, and verification against constitution specs.

- [x] T029 Run all vitest workspace tests (`npm run test`) to ensure no regressions
- [x] T030 Perform manual verification of flow transitions, toasts, and responsiveness

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all User Stories.
- **User Stories (Phases 3 to 8)**: Depends on Foundational (Phase 2).
  - Can run in parallel once foundation is ready, or sequentially: US1 (MVP) → US2 → US3 → US4 → US5 → US6.
- **Polish (Phase 9)**: Depends on completion of all implementation phases.

### Parallel Opportunities
- T005 and T006 can run in parallel (Backend vs Frontend tests for US1).
- T011 and T012 can run in parallel (Backend vs Frontend tests for US2).
- Once Phase 2 completes, work on US1 (View), US2 (Edit text), and US3 (Avatar) can proceed concurrently if multiple developers are assigned.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup (Phase 1).
2. Complete Foundational (Phase 2).
3. Complete User Story 1 (Phase 3).
4. Run integration tests for User Story 1.

### Incremental Delivery
- Increment 1: Foundational layer complete.
- Increment 2 (MVP): Profile view renders correctly (US1).
- Increment 3: Profile edit forms operational (US2).
- Increment 4: Profile avatar upload operational (US3).
- Increment 5: Security and validations hardened (US4, US5).
- Increment 6: Responsive layout finalized (US6).
