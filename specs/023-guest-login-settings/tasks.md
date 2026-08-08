# Tasks: Guest Login & Settings Navigation Menu Fix

**Input**: Design documents from `/specs/023-guest-login-settings/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/menu-navigation.yaml, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Includes exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project environment and feature workspace validation

- [x] T001 Verify workspace feature branch `023-guest-login-settings` and frontend setup in `src/frontend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core navigation state inspection prior to menu modifications

- [x] T002 Inspect `useAuthStore` session hooks and state in `src/frontend/src/components/NavBar.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Guest User Log In Access from Navigation Menu (Priority: P1) 🎯 MVP

**Goal**: Allow guest visitors to view and click a "Log in" action button within the navigation menu dropdown (both desktop and mobile viewports).

**Independent Test**: Open navigation menu as an unauthenticated guest visitor, click the "Log in" item, and verify navigation to `/login`.

### Implementation for User Story 1

- [x] T003 [US1] Add "Log in" dropdown menu action for guest users (`!user`) in desktop More menu in `src/frontend/src/components/NavBar.tsx`
- [x] T004 [US1] Add "Log in" dropdown menu action for guest users (`!user`) in mobile drawer menu in `src/frontend/src/components/NavBar.tsx`
- [x] T005 [US1] Ensure desktop top-right fixed "Log in" button styling and visibility in `src/frontend/src/components/NavBar.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently (MVP)

---

## Phase 4: User Story 2 - User Settings Access in Menu (Priority: P2)

**Goal**: Provide direct access to the Settings page from the navigation dropdown menu for both authenticated users and guest visitors.

**Independent Test**: Open navigation menu as a logged-in user or guest, select "Settings", and confirm navigation to `/settings`.

### Implementation for User Story 2

- [x] T006 [US2] Un-gate "Settings" menu item in desktop More dropdown to display unconditionally in `src/frontend/src/components/NavBar.tsx`
- [x] T007 [US2] Un-gate "Settings" menu item in mobile top app bar dropdown to display unconditionally in `src/frontend/src/components/NavBar.tsx`

**Checkpoint**: User Stories 1 and 2 are both independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Automated component testing and validation

- [x] T008 [P] Add component tests for guest Log in menu button and un-gated Settings option in `src/frontend/src/components/__tests__/NavBar.test.tsx`
- [x] T009 Run quickstart manual and automated validation per `specs/023-guest-login-settings/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational phase (T002) - No dependencies on US2
- **User Story 2 (Phase 4)**: Depends on Foundational phase (T002) - Independent of US1
- **Polish (Phase 5)**: Depends on completion of User Stories 1 & 2

### Parallel Opportunities

- T003 and T004 (within US1) touch desktop vs mobile drawer sections in `NavBar.tsx`
- T006 and T007 (within US2) un-gate desktop vs mobile dropdown menus
- T008 (Polish) unit tests can be written in parallel with manual verification

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2
2. Complete Phase 3 (User Story 1 - Guest Log in menu button)
3. **STOP and VALIDATE**: Verify guest user login access via menu
4. Complete Phase 4 (User Story 2 - Settings access)
5. Complete Phase 5 (Tests and Quickstart verification)
