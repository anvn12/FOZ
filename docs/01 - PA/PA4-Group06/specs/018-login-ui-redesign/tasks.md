# Tasks: Login UI Redesign (White Mode Lumina Glassmorphism)

**Input**: Design documents from `/specs/018-login-ui-redesign/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- File paths: Absolute or relative to repository root (`src/frontend/`)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Design system typography and CSS glassmorphism token setup

- [x] T001 Configure Lumina Google Fonts (`Montserrat`, `Plus Jakarta Sans`, `JetBrains Mono`) in `src/frontend/index.html`
- [x] T002 Add Lumina Glassmorphism CSS design system tokens and utility classes (`.glass-panel`, `.input-glass`, `.btn-gradient`, `.btn-glass`) in `src/frontend/src/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API mutation & state prerequisites

- [x] T003 [P] Verify existing auth mutation (`useLogin()`) and Zod schema bindings in `src/frontend/src/pages/LoginPage.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Glassmorphic Authentication & Form Submission (Priority: P1) 🎯 MVP

**Goal**: Deliver complete light-mode Lumina glassmorphic login form with validation, focus effects, gradient submit button, and navigation links.

**Independent Test**: Navigate to `/login`, submit empty credentials to verify Zod validation error feedback, and submit valid credentials to test authentication API mutation loading state and redirect to `/`.

### Tests for User Story 1

- [x] T004 [P] [US1] Create unit & integration tests for glassmorphic login page rendering and authentication form submission in `src/frontend/src/pages/__tests__/LoginPage.test.tsx`

### Implementation for User Story 1

- [x] T005 [US1] Implement glassmorphic login form card structure with title, email/mobile input field (`input-glass`), password field with visibility toggle, linear gradient submit button (`btn-gradient`), forgotten password link, and create account button in `src/frontend/src/pages/LoginPage.tsx`
- [x] T006 [US1] Connect form submission to `useLogin()` mutation with loading indicator state and toast error notifications in `src/frontend/src/pages/LoginPage.tsx`

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently (MVP ready!)

---

## Phase 4: User Story 2 - Responsive Split-Screen & Mobile Stack Layout (Priority: P2)

**Goal**: Provide seamless responsive layout switching between desktop (50/50 split view) and mobile (single-column centered card view).

**Independent Test**: Resize viewport width below and above 768px (`md:` breakpoint) to verify desktop 50/50 split and mobile centered layout with top FOZ navigation bar.

### Tests for User Story 2

- [x] T007 [P] [US2] Add responsive layout tests for desktop split-screen and mobile stack view in `src/frontend/src/pages/__tests__/LoginPage.test.tsx`

### Implementation for User Story 2

- [x] T008 [US2] Implement responsive page layout container (desktop 50/50 split-screen container vs. mobile centered stack view with top brand header) in `src/frontend/src/pages/LoginPage.tsx`

**Checkpoint**: User Stories 1 AND 2 work independently across all screen sizes

---

## Phase 5: User Story 3 - Interactive Trending Carousel (Priority: P3)

**Goal**: Display auto-advancing 3-card trending topics carousel in desktop brand hero section with manual navigation arrow controls.

**Independent Test**: View desktop login hero panel and verify automatic slide transition every 5 seconds, as well as manual prev/next arrow button navigation.

### Tests for User Story 3

- [x] T009 [P] [US3] Add unit tests for trending carousel slide transitions and navigation controls in `src/frontend/src/pages/__tests__/LoginPage.test.tsx`

### Implementation for User Story 3

- [x] T010 [US3] Build interactive `TrendingCarousel` component with 5s auto-play timer and previous/next arrow button controls in `src/frontend/src/pages/LoginPage.tsx`

**Checkpoint**: All user stories independently functional and complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements, accessibility checks, and full verification

- [x] T011 [P] Verify WCAG 2.1 Level AA keyboard navigation, contrast ratios, and screen-reader accessibility attributes across `/login`
- [x] T012 Run quickstart verification matrix and execute frontend test suite (`npm run test` in `src/frontend`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Sequential priority order: P1 (Form) → P2 (Responsive Layout) → P3 (Carousel)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) & US1 form layout
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) & US2 hero layout

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Fonts & CSS utilities)
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Glassmorphic login form)
4. **STOP and VALIDATE**: Test User Story 1 independently on `/login`
5. Proceed to Phase 4 (Responsive Layout) and Phase 5 (Carousel)
