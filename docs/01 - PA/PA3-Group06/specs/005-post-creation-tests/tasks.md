# Tasks: Post Creation Test Cases

**Input**: Design documents from `/specs/005-post-creation-tests/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This task list structures the creation of test case definitions (Vitest `test.todo()`) mapping directly to the feature spec. No implementation code is created.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/backend/`, `src/frontend/`, `src/shared/`
- Paths below assume web app structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure and verify that Vitest is configured at the workspace level

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Setup the test file structure for post creation integration tests in `src/backend/__tests__/integration/post.test.ts`

---

## Phase 3: User Story 1 - Create a Simple Text Post (Priority: P1) 🎯 MVP

**Goal**: Define test cases for standard users creating text posts and guests being blocked.

**Independent Test**: Verify that the corresponding `test.todo` definitions compile and register in Vitest.

### Implementation for User Story 1

- [x] T003 [US1] Define Simple Text Post integration test definitions (`test.todo`) in `src/backend/__tests__/integration/post.test.ts`

---

## Phase 4: User Story 2 - Delete My Post (Priority: P1)

**Goal**: Define test cases for owners and administrators deleting posts, and guests/moderators being blocked.

**Independent Test**: Verify that the corresponding `test.todo` definitions compile and register in Vitest.

### Implementation for User Story 2

- [x] T004 [US2] Define post deletion integration test definitions (`test.todo`) in `src/backend/__tests__/integration/post.test.ts`

---

## Phase 5: User Story 3 - Add Media Attachments (Priority: P2)

**Goal**: Define test cases for image uploads, file preview removals, file size validation limits, and image count limits.

**Independent Test**: Verify that the corresponding `test.todo` definitions compile and register in Vitest.

### Implementation for User Story 3

- [x] T005 [US3] Define media attachment integration test definitions (`test.todo`) in `src/backend/__tests__/integration/post.test.ts`

---

## Phase 6: User Story 4 - Create a Chained Thread ("Add to FOZ") (Priority: P2)

**Goal**: Define test cases for adding textareas, submitting multiple posts, and removing textareas.

**Independent Test**: Verify that the corresponding `test.todo` definitions compile and register in Vitest.

### Implementation for User Story 4

- [x] T006 [US4] Define chained thread integration test definitions (`test.todo`) in `src/backend/__tests__/integration/post.test.ts`

---

## Phase 7: Edge Cases

**Goal**: Define test cases for boundary character limits, concurrent deletion, and media limit edge cases.

**Independent Test**: Verify that the corresponding `test.todo` definitions compile and register in Vitest.

### Implementation for Edge Cases

- [x] T007 Define Edge Case integration test definitions (`test.todo`) in `src/backend/__tests__/integration/post.test.ts`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T008 Compile and run the Vitest suite to ensure zero errors and that all 22 todo test cases register correctly in `src/backend/__tests__/integration/post.test.ts`
- [x] T009 Run quickstart.md validation steps to ensure setup is fully clean

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel or sequentially (US1 → US2 → US3 → US4 → Edge Cases)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- Since all test cases reside in the same file `src/backend/__tests__/integration/post.test.ts`, they can be written together sequentially or in parallel chunks.

---

## Parallel Example: User Story 1

```bash
# Verify the registration of the test cases:
npx vitest run src/backend/__tests__/integration/post.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. **STOP and VALIDATE**: Verify registered test cases compile and run.
