# Tasks: User Interactions

**Input**: Design documents from `/specs/008-user-interactions/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are not included because the feature request did not explicitly ask for TDD or a test-only deliverable.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the shared feature scaffolding and file entry points used by all stories.

**Independent Test**: The shared schema module, API route files, and frontend interaction component entry points exist and are ready to be filled in by later phases.

- [X] T001 Create the shared interaction schema module in src/shared/schemas/interactions.ts and export it from src/shared/schemas/index.ts
- [X] T002 [P] Create the backend interaction route entry files in src/backend/api/posts/routes.ts, src/backend/api/comments/routes.ts, and src/backend/api/reactions/routes.ts
- [X] T003 [P] Create the frontend interaction entry points in src/frontend/src/components/post/PostComposer.tsx, src/frontend/src/components/post/PostCard.tsx, src/frontend/src/components/comment/CommentThread.tsx, src/frontend/src/components/comment/CommentItem.tsx, src/frontend/src/components/reaction/ReactionButton.tsx, and src/frontend/src/api/interactions.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared data, service, and routing layer that every user story depends on.

**Independent Test**: The backend has interaction tables, repositories, services, and router mounting ready so each user story can be completed without reworking infrastructure.

- [X] T004 Add the interaction database schema and migration in src/backend/db/schema/interactions.ts and src/backend/db/migrations/0003_user_interactions.sql
- [X] T005 Register the interaction tables and repository helpers in src/backend/db/schema/index.ts and src/backend/db/repositories/interactions.ts
- [X] T006 Implement the core interaction service primitives, ownership guards, and shared validators in src/backend/services/interactions/posts.ts, src/backend/services/interactions/comments.ts, and src/backend/services/interactions/reactions.ts
- [X] T007 Wire the new routers into src/backend/index.ts and attach request validation and authorization middleware in src/backend/api/posts/routes.ts, src/backend/api/comments/routes.ts, and src/backend/api/reactions/routes.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Engage With Posts and Comments (Priority: P1)

**Goal**: Let authenticated users like and unlike posts and comments, add comments, and reply within the same thread.

**Independent Test**: A single authenticated user can open a post, toggle a like, create a comment, and reply to that comment while the thread updates correctly.

- [X] T008 [P] [US1] Implement the post and comment reaction mutation handlers in src/backend/api/reactions/routes.ts and src/backend/services/interactions/reactions.ts
- [X] T009 [P] [US1] Implement comment creation and reply handlers in src/backend/api/comments/routes.ts and src/backend/services/interactions/comments.ts
- [X] T010 [P] [US1] Build the post detail engagement UI for liking, unliking, commenting, and replying in src/frontend/src/components/post/PostCard.tsx, src/frontend/src/components/post/PostInteractions.tsx, src/frontend/src/components/comment/CommentThread.tsx, and src/frontend/src/components/comment/CommentComposer.tsx
- [X] T011 [US1] Connect engagement mutations and optimistic invalidation in src/frontend/src/api/interactions.ts and src/frontend/src/pages/feed/FeedPage.tsx

**Checkpoint**: User Story 1 should now be independently functional.

---

## Phase 4: User Story 2 - Create and Remove Own Posts (Priority: P1)

**Goal**: Let authenticated users create new posts and delete only the posts they own.

**Independent Test**: A user can create a post, see it in the feed, and then delete that same post as the owner while other users do not see a delete control.

- [X] T012 [P] [US2] Implement post creation and ownership-checked deletion handlers in src/backend/api/posts/routes.ts and src/backend/services/interactions/posts.ts
- [X] T013 [P] [US2] Persist post lifecycle changes and cascade interaction cleanup in src/backend/db/repositories/interactions.ts and src/backend/db/schema/interactions.ts
- [X] T014 [P] [US2] Build the post composer and owner-only delete controls in src/frontend/src/components/post/PostComposer.tsx and src/frontend/src/components/post/PostCard.tsx
- [X] T015 [US2] Wire post create and delete mutations into src/frontend/src/pages/feed/FeedPage.tsx and src/frontend/src/api/interactions.ts

**Checkpoint**: User Stories 1 and 2 should now both work independently.

---

## Phase 5: User Story 3 - Manage Own Comments (Priority: P2)

**Goal**: Let authenticated users edit or delete only their own comments without affecting other users’ discussion content.

**Independent Test**: A user can edit and delete their own comment, while attempts to change another user’s comment are blocked.

- [X] T016 [P] [US3] Implement comment edit and delete handlers in src/backend/api/comments/routes.ts and src/backend/services/interactions/comments.ts
- [X] T017 [P] [US3] Add comment ownership persistence rules and reply-tree cleanup in src/backend/db/repositories/interactions.ts and src/backend/db/schema/interactions.ts
- [X] T018 [P] [US3] Build the comment edit and delete controls plus the inline editor in src/frontend/src/components/comment/CommentItem.tsx and src/frontend/src/components/comment/CommentEditor.tsx
- [X] T019 [US3] Wire comment update and removal mutations into src/frontend/src/components/comment/CommentThread.tsx and src/frontend/src/api/interactions.ts

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish shared consistency work and tighten the interaction slice across layers.

- [X] T020 [P] Normalize the interaction exports and routing references in src/shared/schemas/interactions.ts, src/shared/schemas/index.ts, and src/backend/index.ts
- [X] T021 Tighten empty-content, deleted-content, and ownership edge states in src/frontend/src/components/post/PostComposer.tsx, src/frontend/src/components/comment/CommentEditor.tsx, and src/frontend/src/components/reaction/ReactionButton.tsx
- [X] T022 Review the interaction contract and quickstart docs for final route and field naming in specs/008-user-interactions/contracts/user-interactions-api.md and specs/008-user-interactions/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on the user stories that are being delivered.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational completion and does not depend on the other stories.
- **User Story 2 (P1)**: Can start after Foundational completion and does not depend on User Story 1.
- **User Story 3 (P2)**: Can start after Foundational completion and reuses the same comment infrastructure as User Story 1, but remains independently testable.

### Within Each User Story

- Shared backend service work before route wiring.
- Backend implementation before frontend wiring.
- Ownership and validation checks before UI polish.
- Complete a story before moving to the next priority when working sequentially.

### Parallel Opportunities

- T002 and T003 can run in parallel because they touch different file groups.
- T008 through T010 can run in parallel because they split backend mutation handlers, backend comment handlers, and frontend UI work.
- T012 through T014 can run in parallel because they split backend post logic, repository cleanup, and frontend post UI work.
- T016 through T018 can run in parallel because they split backend comment logic, repository cleanup, and frontend comment UI work.

---

## Parallel Example: User Story 1

```bash
Task: "Implement the post and comment reaction mutation handlers in src/backend/api/reactions/routes.ts and src/backend/services/interactions/reactions.ts"
Task: "Implement comment creation and reply handlers in src/backend/api/comments/routes.ts and src/backend/services/interactions/comments.ts"
Task: "Build the post detail engagement UI for liking, unliking, commenting, and replying in src/frontend/src/components/post/PostCard.tsx, src/frontend/src/components/post/PostInteractions.tsx, src/frontend/src/components/comment/CommentThread.tsx, and src/frontend/src/components/comment/CommentComposer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate the engagement flow independently.

### Incremental Delivery

1. Finish Setup + Foundational so the backend and frontend share the same contract layer.
2. Deliver User Story 1 as the first user-visible engagement slice.
3. Add User Story 2 so users can create and remove their own posts.
4. Add User Story 3 so users can manage their own comments.
5. Finish with Polish to keep the interaction slice consistent across the app.

### Parallel Team Strategy

1. One developer can own backend routing and service work while another builds the matching frontend components.
2. After the foundational layer is complete, User Story 2 and User Story 3 can be developed in parallel because they share infrastructure but do not block each other.
