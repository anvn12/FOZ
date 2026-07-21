# Tasks: Homepage UI

**Input**: Design documents from `/specs/009-homepage-ui/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create baseline empty files for Homepage UI in `src/frontend/src/pages/HomePage.tsx` and `src/frontend/src/components/ComposeModal.tsx`
- [x] T002 Verify layout styles and material symbols fonts are imported in `src/frontend/src/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Import `HomePage` and define the route mapping in `src/frontend/src/App.tsx`
- [x] T004 Confirm accessibility to Zustand `useAuthStore` and existing `LogoutDialog` in `src/frontend/src/pages/HomePage.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Desktop / Unified Layout (Priority: P1) 🎯 MVP

**Goal**: Implement responsive three-column desktop feed with left sidebar navigation, main feed list, and right sidebar layout.

**Independent Test**: Navigate to `/` on a desktop viewport width >= 1024px. Verify Left Sidebar, centered Main Feed (max-width 600px), and Right Sidebar columns render correctly.

### Implementation for User Story 1

- [x] T005 [P] [US1] Define mock thread items feed list array in `src/frontend/src/pages/HomePage.tsx`
- [x] T006 [US1] Build Desktop Left Sidebar navigation component layout (FOZ wordmark, icons, bottom "More" toggle) in `src/frontend/src/pages/HomePage.tsx`
- [x] T007 [US1] Build Desktop centered Main Feed layout rendering post cards (author name, timestamp, body text, attachment images) in `src/frontend/src/pages/HomePage.tsx`
- [x] T008 [US1] Build Desktop Right Sidebar layout showing unauthenticated login promo card in `src/frontend/src/pages/HomePage.tsx`
- [x] T009 [US1] Implement Desktop floating dropdown menu toggle above the "More" button in `src/frontend/src/pages/HomePage.tsx`
- [x] T010 [US1] Add desktop "Log in" button navigation to `/login` for unauthenticated guests in `src/frontend/src/pages/HomePage.tsx`

**Checkpoint**: User Story 1 is functional on desktop viewports.

---

## Phase 4: User Story 2 - Mobile Layout & Responsiveness (Priority: P1)

**Goal**: Adapt homepage UI responsive breakpoints to mobile viewports including Top App Bar, Bottom Nav Bar, and slide-up Bottom Drawer.

**Independent Test**: Resize browser window to < 768px. Verify that Left/Right Sidebars are hidden, and fixed Top App Bar + Bottom Nav render correctly. Tap menu button and verify bottom sheet slides up.

### Implementation for User Story 2

- [x] T011 [P] [US2] Apply responsive classes (`hidden md:block`, `md:hidden`, etc.) to control columns visibility in `src/frontend/src/pages/HomePage.tsx`
- [x] T012 [US2] Build Mobile Top App Bar (Hamburger menu button, brand FOZ, Log in button) in `src/frontend/src/pages/HomePage.tsx`
- [x] T013 [US2] Build Mobile Bottom Navigation bar (Home, Search, Create, Profile links) in `src/frontend/src/pages/HomePage.tsx`
- [x] T014 [US2] Build Mobile slide-up Bottom Navigation Drawer overlay container in `src/frontend/src/pages/HomePage.tsx`
- [x] T015 [US2] Implement Mobile drawer slide transition animations and overlay dismissal in `src/frontend/src/pages/HomePage.tsx`

**Checkpoint**: User Story 2 is functional and responsive on mobile viewports.

---

## Phase 5: User Story 3 - Authentication State Adjustments (Priority: P1)

**Goal**: Adjust options dynamically when authenticated: remove Log in buttons, add red Log out button, and implement post compose modal overlay.

**Independent Test**: Sign in and verify Log in buttons are gone. Tapping Log out triggers `LogoutDialog`. Tapping Create opens compose modal overlay.

### Implementation for User Story 3

- [x] T016 [P] [US3] Add `useAuthStore` user status gates to hide public "Log in" buttons and redirect guests on protected clicks in `src/frontend/src/pages/HomePage.tsx`
- [x] T017 [US3] Implement "Log out" menu button (red text) in desktop dropdown and mobile bottom drawer in `src/frontend/src/pages/HomePage.tsx`
- [x] T018 [US3] Wire up Log out button click handler to trigger the existing `LogoutDialog` in `src/frontend/src/pages/HomePage.tsx`
- [x] T019 [US3] Implement the Create button compose modal trigger handler in `src/frontend/src/pages/HomePage.tsx`
- [x] T020 [P] [US3] Build the compose modal overlay component with textarea input, character length counter, and action buttons in `src/frontend/src/components/ComposeModal.tsx`

**Checkpoint**: User Story 3 is complete, and all layout interactions reflect authentication states.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: General optimizations, styling audits, and testing.

- [x] T021 [P] Write integration tests for homepage layouts, responsiveness, auth-state rendering, and navigation gating in `src/frontend/src/pages/__tests__/HomePage.test.tsx`
- [x] T022 Conduct WCAG accessibility color contrast and keyboard tab navigation audit on responsive layout
- [x] T023 Run typecheck and full test suites to verify zero regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user story layout work.
- **User Stories (Phases 3-5)**: All depend on Foundational completion.
  - Phase 3 (US1) must complete basic layout before Phase 4 (US2) adds mobile overrides.
  - Phase 5 (US3) depends on layouts being fully functional to attach dynamic buttons.
- **Polish (Phase 6)**: Depends on all user story tasks being completed.

### Parallel Opportunities

- Setup tasks T001 and T002 can run in parallel.
- Foundational task T003 can be done in parallel with T004.
- In Phase 3, mock data definition (T005) can run in parallel with building container structures (T006).
- Mobile layout components (T011) can be prepared in parallel with Top App Bar design.
- Compose modal component layout (T020) can be developed in parallel with main page wiring (T018/T019).
- Test suite preparation (T021) can run in parallel with polish styling checks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2 Setup/Foundation.
2. Complete Phase 3 (Desktop layout, feed, and dropdown).
3. Verify that homepage works cleanly on desktop.

### Incremental Delivery

1. Deliver Desktop layout (Phase 3).
2. Deliver Mobile Responsive breakpoint layout (Phase 4).
3. Deliver Authentication state conditional buttons and post compose modal (Phase 5).
4. Run comprehensive test checks (Phase 6).
