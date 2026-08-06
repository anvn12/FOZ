# Tasks: Display Name Separate from Username

**Input**: Design documents from `/specs/021-display-name/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- File paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verification of workspace and prerequisite structure

- [X] T001 Verify feature branch `021-display-name` and `.specify/feature.json` configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema, migrations, and shared validation rules that MUST be complete before user stories can be implemented

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

- [X] T002 [P] Update `userAccounts` schema in `src/backend/db/schema/users.ts` to add `username` column and `user_accounts_username_lower_idx` index
- [X] T003 Generate Drizzle SQL migration and backfill logic in `src/backend/db/migrations/` to assign unique usernames (`email` prefix + numeric suffix collision resolution) to existing user accounts
- [X] T004 [P] Define `usernameSchema`, `RESERVED_USERNAMES`, `RegisterRequest`, and `AuthResponse` in `src/shared/schemas/auth.ts`
- [X] T005 [P] Implement `getUserByUsername` and `checkUsernameAvailable` repository functions in `src/backend/db/repositories/users.ts`
- [X] T006 Implement `GET /api/v1/auth/check-username` endpoint with `authRateLimiter` rate limiting in `src/backend/api/auth/routes.ts`

**Checkpoint**: Database schema, shared Zod schemas, and basic repository endpoints ready — user story implementation can begin

---

## Phase 3: User Story 1 - Choose a Unique Username at Registration (Priority: P1) 🎯 MVP

**Goal**: Allow new users to choose a unique `@username` handle during registration, with real-time validation and error messages.

**Independent Test**: Register a new user with email, password, and chosen username. Confirm user account is created with username, and duplicate or invalid usernames are rejected with clear error messages.

- [X] T007 [P] [US1] Add schema validation unit tests for `usernameSchema` and `RegisterRequest` in `src/shared/schemas/auth.test.ts`
- [X] T008 [US1] Update `register` auth service in `src/backend/api/auth/auth.service.ts` to validate and persist `username` on registration
- [X] T009 [US1] Add `checkUsernameAvailability` API client method in `src/frontend/src/api/auth.ts`
- [X] T010 [US1] Add username input field with on-blur/real-time availability indicator to registration tab in `src/frontend/src/pages/LoginPage.tsx`
- [X] T011 [US1] Integration tests for registration with username in `src/backend/__tests__/integration/auth.social.test.ts`

**Checkpoint**: User Story 1 MVP fully functional and testable independently

---

## Phase 4: User Story 2 - View Profile via @Username URL (Priority: P1)

**Goal**: Enable visitors to access user profiles using `/profiles/@<username>` URLs, with automatic redirection from legacy `/profiles/:userId` routes.

**Independent Test**: Navigate to `/profiles/@johndoe` in browser to view profile. Navigate to `/profiles/<uuid>` and confirm browser URL redirects to `/profiles/@johndoe`.

- [X] T012 [P] [US2] Implement `getProfileByUsername` repository query in `src/backend/db/repositories/profiles.ts`
- [X] T013 [US2] Implement `GET /api/v1/profiles/by-username/:username` endpoint in `src/backend/api/profile/routes.ts`
- [X] T014 [US2] Add `getProfileByUsername` client API function in `src/frontend/src/api/profile.ts`
- [X] T015 [US2] Configure React Router routes in `src/frontend/src/App.tsx` for `/profiles/@:username` and legacy `/profiles/:userId` redirect handler
- [X] T016 [US2] Update `src/frontend/src/pages/ProfilePage.tsx` to resolve user by `@username` handle parameter and render 404 page for missing handles
- [X] T017 [US2] Add component and route tests for `@username` routing and redirection in `src/frontend/src/pages/__tests__/ProfilePage.test.tsx`

**Checkpoint**: User Story 2 profile URL routing complete and testable independently

---

## Phase 5: User Story 3 - Display Name and Username Shown Separately in UI (Priority: P1)

**Goal**: Display both the user's `displayName` and their `@username` handle as visually distinct elements across all app UI surfaces.

**Independent Test**: View profile header, feed posts, comment sections, and search results. Confirm both `displayName` and `@username` appear clearly.

- [X] T018 [P] [US3] Update profile header in `src/frontend/src/pages/ProfilePage.tsx` to render `displayName` prominently and `@username` underneath
- [X] T019 [P] [US3] Update author line in `src/frontend/src/components/FeedPostItem.tsx` to display `displayName` and `@username`
- [X] T020 [P] [US3] Update comment author line in `src/frontend/src/pages/PostPage.tsx` to render `displayName` and `@username`
- [X] T021 [P] [US3] Update creator search cards in `src/frontend/src/pages/SearchPage.tsx` to render `displayName` and `@username`
- [X] T022 [US3] Add visual display unit tests in `src/frontend/src/components/__tests__/FeedPostItem.test.tsx` and `src/frontend/src/pages/__tests__/SearchPage.test.tsx`

**Checkpoint**: User Story 3 dual-identity UI elements fully integrated

---

## Phase 6: User Story 4 - Change Display Name in Profile Settings (Priority: P2)

**Goal**: Allow users to edit their public `displayName` in profile settings without modifying their permanent `@username`.

**Independent Test**: Open profile edit modal, change display name, and save. Verify display name updates on profile while handle remains unchanged.

- [X] T023 [US4] Update `src/frontend/src/components/ProfileEditModal.tsx` to allow editing `displayName` while displaying `@username` as read-only/disabled
- [X] T024 [US4] Add component tests in `src/frontend/src/components/__tests__/ProfileEditModal.test.tsx` verifying display name updates do not affect username handle

**Checkpoint**: User Story 4 display name mutability verified

---

## Phase 7: User Story 5 - Social Login Assigns Username Automatically (Priority: P2)

**Goal**: Auto-generate a unique `@username` handle during Google OAuth registration without user manual intervention.

**Independent Test**: Complete Google OAuth sign-in as a new user. Verify account is created with an auto-generated unique username handle.

- [X] T025 [US5] Add `generateUniqueUsername` helper in `src/backend/services/social-auth.service.ts` (extracting base from email/name + appending numeric suffix on collision)
- [X] T026 [US5] Update Google OAuth callback route in `src/backend/api/auth/google-auth.routes.ts` to assign generated username to new social accounts
- [X] T027 [US5] Integration test for Google OAuth auto-username assignment in `src/backend/__tests__/integration/auth.social.test.ts`

**Checkpoint**: User Story 5 social login username auto-generation verified

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validation, type checking, and quality assurance

- [X] T028 [P] Run `tsc --noEmit` on frontend and backend projects to verify zero TypeScript errors
- [X] T029 Execute full test suite `npm run test` to verify zero regressions
- [X] T030 Perform manual verification steps documented in `specs/021-display-name/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Registration), US2 (URL Routing), US3 (UI Display) can proceed in parallel once Phase 2 is complete
  - US4 (Display Name Settings) depends on US3 UI components
  - US5 (Social Login) depends on Phase 2 auth foundation
- **Polish (Phase 8)**: Depends on all user stories being complete

### Parallel Opportunities

- T002, T004, T005 in Foundational Phase can be completed in parallel
- T007 (US1 Schema Tests), T012 (US2 Query), T018-T021 (US3 UI Components) can be developed in parallel

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1 & Phase 2 (Foundational DB schema & migration)
2. Complete Phase 3 (User Story 1 - Registration with Username)
3. Complete Phase 4 (User Story 2 - Profile @username URL Routing)
4. **STOP and VALIDATE**: Test registration & profile view independently
