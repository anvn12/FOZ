# Tasks: Test Databases and Fixture Datasets

**Input**: Design documents from `/specs/025-test-databases/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/test-database-cli.md](./contracts/test-database-cli.md), [quickstart.md](./quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4])
- File paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, and shared seed utilities

- [x] T001 [P] Create seed helper modules and directory structure in `src/backend/db/seeds/seed-helpers.ts` and `src/backend/db/scripts/`
- [x] T002 [P] Add test database configuration constants and environment parsing in `src/backend/env.ts`

---

## Phase 2: Foundational (Safety Guardrails & Migration Utilities)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement safety assertion guard in `src/backend/db/scripts/test-db-guard.ts` to prevent execution against non-test databases
- [x] T004 [P] Implement multi-database creation and connection helper in `src/backend/db/scripts/test-db-provision.ts`
- [x] T005 [P] Implement test database migration utility in `src/backend/db/scripts/test-db-migrate.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Empty State Test Database Provisioning (Priority: P1) 🎯 MVP

**Goal**: Provision `foz_test_empty` with full schema, Admin (`admin@admin.foz`) and Moderator (`mod@mod.foz`) accounts, and 0 posts/interactions.

**Independent Test**: Execute `npm run db:test:empty:reset`, then query `foz_test_empty` to assert that admin and moderator accounts exist and post count is 0.

- [x] T006 [US1] Implement empty state seeder in `src/backend/db/seeds/empty-state.seed.ts` (Admin + Moderator creation, 0 posts)
- [x] T007 [US1] Implement empty test database reset script in `src/backend/db/scripts/test-db-empty-reset.ts`
- [x] T008 [US1] Add `db:test:empty:reset` script to `package.json`
- [x] T009 [US1] Implement integration test verifying `foz_test_empty` provisioning and record counts in `src/backend/db/scripts/__tests__/test-db-empty.test.ts`

**Checkpoint**: At this point, User Story 1 (`foz_test_empty`) is fully functional and testable independently.

---

## Phase 4: User Story 2 - Populated Interaction Test Database Provisioning (Priority: P1)

**Goal**: Provision `foz_test_populated` with 50 users, 100 posts (30-day timeline), threaded comments/replies, reposts, likes, hashtags, and moderation reports.

**Independent Test**: Execute `npm run db:test:populated:reset`, then query `foz_test_populated` to assert 50 user profiles, 100 posts, and connected interactions.

- [x] T010 [P] [US2] Implement synthetic user and profile generator in `src/backend/db/seeds/populated-users.seed.ts` (50 users with profiles)
- [x] T011 [P] [US2] Implement synthetic post, hashtag, and interaction generator in `src/backend/db/seeds/populated-interactions.seed.ts` (100 posts, comment trees, reposts, reactions, reports)
- [x] T012 [US2] Implement populated state seeder orchestrator in `src/backend/db/seeds/populated-state.seed.ts`
- [x] T013 [US2] Implement populated test database reset script in `src/backend/db/scripts/test-db-populated-reset.ts`
- [x] T014 [US2] Add `db:test:populated:reset` script to `package.json`
- [x] T015 [US2] Implement integration test verifying `foz_test_populated` dataset counts, foreign keys, and relations in `src/backend/db/scripts/__tests__/test-db-populated.test.ts`

**Checkpoint**: User Stories 1 AND 2 are both fully functional and testable independently.

---

## Phase 5: User Story 3 - Deterministic Test Authentication and Role Verification (Priority: P2)

**Goal**: Verify deterministic authentication and role claims for Admin, Moderator, and Standard test users across both test databases.

**Independent Test**: Authenticate via login endpoint or auth service using `mod@mod.foz` / `mod@mod.foz`, `admin@admin.foz` / `admin@admin.foz`, and `user1@foz.test` / `password123`.

- [x] T016 [P] [US3] Implement authentication verification test for `mod@mod.foz` and `admin@admin.foz` in `src/backend/db/scripts/__tests__/test-db-auth.test.ts`
- [x] T017 [US3] Implement standard user authentication batch verification for test users (`user1@foz.test`..`user50@foz.test`) in `src/backend/db/scripts/__tests__/test-db-auth.test.ts`

**Checkpoint**: Role authentication verification complete across both test databases.

---

## Phase 6: User Story 4 - Environment Isolation & Master Orchestrator (Priority: P3)

**Goal**: Orchestrate unified test DB setup and enforce strict safety isolation preventing `foz_dev` corruption.

**Independent Test**: Execute `npm run db:test:setup`, verify both test DBs are prepared, and run guardrail negative tests to ensure non-test targets are rejected.

- [x] T018 [US4] Implement master test database setup script in `src/backend/db/scripts/test-db-setup.ts` to provision and seed both test DBs
- [x] T019 [US4] Add `db:test:setup` and `db:test:migrate` commands to `package.json`
- [x] T020 [US4] Implement safety guardrail negative tests in `src/backend/db/scripts/__tests__/test-db-guard.test.ts` asserting non-test DB targets are rejected

**Checkpoint**: All user stories and guardrails are complete and functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and developer workflows

- [x] T021 [P] Update backend test setup hook in `src/backend/__tests__/setup.ts` to support targeting test databases
- [x] T022 [P] Update `README.md` and documentation with test database commands and quickstart instructions
- [x] T023 Run end-to-end quickstart validation and type check (`npm run typecheck && npm run db:test:setup && npm test`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories.
- **User Story 1 (Phase 3 - P1)**: Depends on Phase 2. Can be implemented and verified as MVP.
- **User Story 2 (Phase 4 - P1)**: Depends on Phase 2. Can be implemented in parallel with or after US1.
- **User Story 3 (Phase 5 - P2)**: Depends on US1 and US2 seed engines.
- **User Story 4 (Phase 6 - P3)**: Depends on US1 and US2 reset scripts.
- **Polish (Phase 7)**: Depends on all user stories being complete.

---

## Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel.
- **Phase 2**: T004 and T005 can run in parallel.
- **Phase 4**: T010 (users seed) and T011 (interactions seed) can be developed in parallel.
- **Phase 7**: T021 and T022 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - `foz_test_empty`).
3. Validate `npm run db:test:empty:reset` independently.

### Incremental Delivery
1. Add User Story 2 (`foz_test_populated`) → Validate `npm run db:test:populated:reset`.
2. Add User Story 3 (Auth verification) → Validate login against test accounts.
3. Add User Story 4 (Master setup & Guardrail tests) → Validate `npm run db:test:setup`.
4. Polish and documentation.
