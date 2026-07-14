# Tasks: Threads-Style Community Database Schema

**Input**: Design documents from `/specs/001-threads-schema/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks were requested in the specification, so this task list focuses on implementation and documentation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the schema workspace and database wiring that every story will use.

- [X] T001 [P] Create the schema workspace folders for backend and shared code in `src/backend/db/schema/`, `src/backend/db/migrations/`, and `src/shared/`
- [X] T002 Set up Drizzle database wiring and migration config in `drizzle.config.ts` and `src/backend/db/index.ts`
- [X] T003 [P] Add shared schema entrypoint and enum helper files in `src/shared/index.ts` and `src/shared/schema-enums.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the reusable domain primitives and shared schema helpers that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define canonical domain enums for account role, account status, content lifecycle, report status, moderation outcome, escalation state, and summary state in `src/shared/schema-enums.ts`
- [X] T005 [P] Add common schema helpers for UUID primary keys, timestamps, soft-delete markers, and ownership fields in `src/backend/db/schema/_shared.ts`
- [X] T006 [P] Create the schema export barrel and migration bootstrap in `src/backend/db/schema/index.ts` and `src/backend/db/migrations/0001_initial.sql`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core Community Data (Priority: P1) 🎯 MVP

**Goal**: Store the core identity, profile, post, comment, and reaction records that power the main discussion experience.

**Independent Test**: A reviewer can create one user, one profile, one post, one comment, and one reaction, then confirm every record links back to the correct owner and parent content.

### Implementation for User Story 1

- [X] T007 [P] [US1] Implement the user account table with unique login identity, current role, and account status in `src/backend/db/schema/users.ts`
- [X] T008 [P] [US1] Implement the public profile table linked one-to-one to user accounts in `src/backend/db/schema/users.ts`
- [X] T009 [P] [US1] Implement the post table with author, body, visibility, lifecycle, and timestamps in `src/backend/db/schema/content.ts`
- [X] T010 [P] [US1] Implement the comment table with parent-post and optional parent-comment support in `src/backend/db/schema/content.ts`
- [X] T011 [P] [US1] Implement the reaction table with duplicate-prevention uniqueness on user, target, and reaction type in `src/backend/db/schema/reactions.ts`
- [X] T012 [US1] Export the core community schema from `src/backend/db/schema/index.ts` and wire table registration in `src/backend/db/migrations/0001_initial.sql`

**Checkpoint**: At this point, User Story 1 should be fully functional and independently reviewable.

---

## Phase 4: User Story 2 - Roles and Ownership Rules (Priority: P2)

**Goal**: Preserve current roles, role changes, and ownership history so permissions can be enforced consistently.

**Independent Test**: Change a user from Standard User to Moderator, then verify the account retains its original content ownership while reflecting the updated role state.

### Implementation for User Story 2

- [X] T013 [P] [US2] Implement the role history table for account role transitions in `src/backend/db/schema/roles.ts`
- [X] T014 [US2] Add ownership-preserving foreign keys and current-role fields to `src/backend/db/schema/users.ts` and `src/backend/db/schema/content.ts`
- [X] T015 [US2] Add role-related indexes and audit columns for moderator and administrator workflows in `src/backend/db/schema/roles.ts` and `src/backend/db/schema/index.ts`

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Reporting and AI Support Data (Priority: P3)

**Goal**: Store reports, moderation review history, and AI-generated post summaries with clear state information.

**Independent Test**: Create a report for a post and attach a summary record to the same post, then verify both records remain available with their current state and history.

### Implementation for User Story 3

- [X] T016 [P] [US3] Implement the report table with reporter, subject, reason, and status in `src/backend/db/schema/moderation.ts`
- [X] T017 [P] [US3] Implement the moderation review table with review outcome, escalation, and reviewer fields in `src/backend/db/schema/moderation.ts`
- [X] T018 [P] [US3] Implement the post summary table with summary text, provider, and availability state in `src/backend/db/schema/summaries.ts`
- [X] T019 [US3] Add moderation and summary exports plus lifecycle indexes in `src/backend/db/schema/index.ts` and `src/backend/db/migrations/0001_initial.sql`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Clean up shared definitions and document the final schema conventions.

- [X] T020 [P] Refactor repeated schema helpers into `src/backend/db/schema/_shared.ts` and verify all table files use the shared helpers consistently
- [X] T021 Update the schema review steps and lifecycle notes in `specs/001-threads-schema/quickstart.md` and `specs/001-threads-schema/data-model.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel if staffing allows
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on the schema stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational and may reuse User Story 1 tables, but remains independently reviewable
- **User Story 3 (P3)**: Can start after Foundational and may reuse core content tables, but remains independently reviewable

### Within Each User Story

- Reusable helpers before table-specific definitions
- Core table definitions before export wiring
- Schema constraints before lifecycle/index tuning
- Story completion before moving to the next priority

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational helper tasks marked [P] can run in parallel
- Within User Story 1, the user, profile, post, comment, and reaction table tasks can be split across files and run in parallel
- Within User Story 2, the role history and ownership/index tasks can be split across files and run in parallel
- Within User Story 3, the report, moderation review, and summary tasks can be split across files and run in parallel

## Parallel Example: User Story 1

```text
Task: "Implement the user account table with unique login identity, current role, and account status in src/backend/db/schema/users.ts"
Task: "Implement the public profile table linked one-to-one to user accounts in src/backend/db/schema/users.ts"
Task: "Implement the post table with author, body, visibility, lifecycle, and timestamps in src/backend/db/schema/content.ts"
Task: "Implement the comment table with parent-post and optional parent-comment support in src/backend/db/schema/content.ts"
Task: "Implement the reaction table with duplicate-prevention uniqueness on user, target, and reaction type in src/backend/db/schema/reactions.ts"
```

## Parallel Example: User Story 2

```text
Task: "Implement the role history table for account role transitions in src/backend/db/schema/roles.ts"
Task: "Add ownership-preserving foreign keys and current-role fields to src/backend/db/schema/users.ts and src/backend/db/schema/content.ts"
Task: "Add role-related indexes and audit columns for moderator and administrator workflows in src/backend/db/schema/roles.ts and src/backend/db/schema/index.ts"
```

## Parallel Example: User Story 3

```text
Task: "Implement the report table with reporter, subject, reason, and status in src/backend/db/schema/moderation.ts"
Task: "Implement the moderation review table with review outcome, escalation, and reviewer fields in src/backend/db/schema/moderation.ts"
Task: "Implement the post summary table with summary text, provider, and availability state in src/backend/db/schema/summaries.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate the core community schema before adding moderation or AI support records

### Incremental Delivery

1. Complete Setup + Foundational to establish the shared schema primitives
2. Add User Story 1 to deliver the core social data model
3. Add User Story 2 to preserve roles and ownership history
4. Add User Story 3 to layer in moderation and AI summary persistence
5. Finish with polish tasks that normalize helpers and document the final schema rules

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once foundational helpers exist:
   - Developer A: User Story 1 table definitions
   - Developer B: User Story 2 role and ownership persistence
   - Developer C: User Story 3 moderation and summary persistence
3. Merge the story-specific schema exports and finalize the shared migration ordering

## Notes

- [P] tasks can run in parallel when they touch different files and do not depend on incomplete work
- Each user story is intentionally scoped so the schema can be reviewed incrementally
- This feature did not request automated test tasks, so the checklist focuses on implementation and documentation
- Keep the schema aligned with the validated `src/backend/` and `src/shared/` structure from the plan
