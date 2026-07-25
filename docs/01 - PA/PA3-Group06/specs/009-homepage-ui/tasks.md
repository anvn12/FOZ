# Tasks: Homepage UI Refinement

**Input**: Design documents and feature specifications from `/specs/009-homepage-ui/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story / phase to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US4)
- Includes exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Review codebase and prepare workspace

- [x] T001 Verify active branch is `009-homepage-ui` and verify pre-existing frontend tests pass

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core cleanup before modifying layout and behavior

- [x] T002 Delete the decommitted compose modal component file `src/frontend/src/components/ComposeModal.tsx`

**Checkpoint**: Foundation ready - UI layout refinements and Create button behavior modifications can begin

---

## Phase 3: User Story 1 & 2 - Centered Layout & Sidebar Removal (Priority: P1)

**Goal**: Move main posts content feed into center and remove right sidebar entirely for desktop viewports.

**Independent Test**: Navigate to `/` on a desktop viewport. Verify that the Right Sidebar column is gone, and the main feed column is centered with left and right borders. Verify layout is correct on mobile devices.

### Implementation for User Story 1 & 2

- [x] T003 [US1] Remove the `<aside>` element representing the right sidebar in `src/frontend/src/pages/HomePage.tsx`
- [x] T004 [US1] Remove the `lg:mr-[360px]` right margin override from the `<main>` feed container in `src/frontend/src/pages/HomePage.tsx`
- [x] T005 [US1] Wrap the `<main>` container in a centered flex wrapper `div className="flex-1 w-full flex justify-center md:pl-24"` in `src/frontend/src/pages/HomePage.tsx`
- [x] T006 [US1] Update `<main>` border styles to `border-r md:border-x border-outline-variant` in `src/frontend/src/pages/HomePage.tsx`

**Checkpoint**: Centered layout is implemented and responsive without sidebar overlaps.

---

## Phase 4: User Story 4 - Create Button Toast Notification (Priority: P1)

**Goal**: Update the "Create" button click behavior to show a "Post creation coming soon" toast notification instead of the compose dialog.

**Independent Test**: Click the "Create" button on either desktop left sidebar or mobile bottom navigation. Verify a toast message appears saying "Post creation coming soon" and no dialog overlay is rendered.

### Implementation for User Story 4

- [x] T007 [US4] Modify `handleCreateClick` in `src/frontend/src/pages/HomePage.tsx` to trigger `toast("Post creation coming soon")` directly for all users (guests and authenticated)
- [x] T008 [US4] Remove the unused `isComposeOpen` state, `setIsComposeOpen`, and `<ComposeModal>` JSX tag in `src/frontend/src/pages/HomePage.tsx`

**Checkpoint**: The Create button triggers the placeholder toast notification for all users.

---

## Phase 5: Polish & Regression Testing

**Purpose**: Update tests and verify correct application builds.

- [x] T009 [P] Mock `react-hot-toast` and update the HomePage tests in `src/frontend/src/pages/__tests__/HomePage.test.tsx` to assert that clicking the Create button displays the toast notification rather than opening the compose dialog
- [x] T010 Run `npm run typecheck` and `npx vitest run src/frontend` to verify that all frontend tests pass successfully

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1.
- **User Story 1 & 2 (Phase 3)**: Depends on Phase 2.
- **User Story 4 (Phase 4)**: Can run in parallel with Phase 3 since they modify different parts of `HomePage.tsx`.
- **Polish & Test (Phase 5)**: Depends on Phase 3 and Phase 4 completion.

### Parallel Opportunities

- Task T009 (updating tests) can be drafted in parallel with the implementation tasks.
- Centered layout modifications (T003 - T006) and Create button click behavior (T007 - T008) can be done in parallel or sequentially within `HomePage.tsx`.

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational cleanup.
2. Implement layout centering and sidebar removal (Phase 3).
3. Implement Create button toast notification (Phase 4).
4. Update unit tests to match new behaviors and run verification (Phase 5).
