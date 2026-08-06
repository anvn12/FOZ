# Tasks: Social Login via Google and Facebook

**Input**: Design documents from `/specs/019-social-login/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/backend/`, `src/frontend/`, `src/shared/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared schemas

- [X] T001 [P] Create shared social auth Zod schemas in src/shared/schemas/social-auth.ts
- [X] T002 Export social auth schemas from src/shared/schemas/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Create Drizzle schema for user_social_links table in src/backend/db/schema/user-social-links.ts
- [X] T004 Export user_social_links schema from src/backend/db/schema/index.ts
- [X] T005 Create SQL migration for user_social_links in src/backend/db/migrations/0007_user_social_links.sql
- [X] T006 [P] Add Google and Facebook OAuth configuration variables in src/backend/env.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Single-Click Social Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to initiate Google and Facebook OAuth logins via brand buttons on the Login UI and establish authenticated sessions.

**Independent Test**: Click "Continue with Google" or "Continue with Facebook" on Login UI, complete provider authorization, and verify successful redirect/login into workspace.

### Tests for User Story 1

- [X] T007 [P] [US1] Integration test for social auth endpoints in src/backend/__tests__/integration/auth.social.test.ts

### Implementation for User Story 1

- [X] T008 [P] [US1] Implement social authentication service for OAuth token validation in src/backend/services/social-auth.service.ts
- [X] T009 [US1] Implement Google OAuth routes (/api/v1/auth/google) in src/backend/api/auth/google-auth.routes.ts
- [X] T010 [US1] Implement Facebook OAuth routes (/api/v1/auth/facebook) in src/backend/api/auth/facebook-auth.routes.ts
- [X] T011 [US1] Mount social auth routes on apiRouter in src/backend/api/auth/routes.ts
- [X] T012 [P] [US1] Create SocialLoginButtons UI component with brand icons and OR divider in src/frontend/src/components/SocialLoginButtons.tsx
- [X] T013 [US1] Integrate SocialLoginButtons above the email/password form in src/frontend/src/pages/LoginPage.tsx
- [X] T014 [US1] Implement hybrid pop-up (desktop) / redirect (mobile) auth handler in src/frontend/src/api/auth.ts

**Checkpoint**: User Story 1 is fully functional and testable independently as MVP.

---

## Phase 4: User Story 2 - Automated Account Link & Profile Initialization (Priority: P2)

**Goal**: Automatically link social logins to existing accounts by email address or initialize new user profiles cleanly.

**Independent Test**: Test social login with an existing email user to verify account linking, and with a new email to verify automatic profile creation with avatar/name.

### Tests for User Story 2

- [X] T015 [P] [US2] Integration test for account linking and auto-registration in src/backend/__tests__/integration/auth.social.test.ts

### Implementation for User Story 2

- [X] T016 [US2] Implement account lookup and linking logic by email in src/backend/services/social-auth.service.ts
- [X] T017 [US2] Implement auto-registration for new social users with provider profile details in src/backend/services/social-auth.service.ts
- [X] T018 [US2] Save provider link mapping into user_social_links table in src/backend/services/social-auth.service.ts

**Checkpoint**: User Story 2 account linking and registration functions independently.

---

## Phase 5: User Story 3 - Visual Feedback and Error Recovery (Priority: P3)

**Goal**: Provide visual progress loading indicators and clear, user-friendly error messages during cancelled or failed social authentication attempts.

**Independent Test**: Cancel social login dialog or trigger error response, and verify loading state resolves with friendly error toast/banner.

### Tests for User Story 3

- [X] T019 [P] [US3] Component test for social login loading and error states in src/frontend/src/pages/__tests__/SocialLogin.test.tsx

### Implementation for User Story 3

- [X] T020 [US3] Add loading spinner state to SocialLoginButtons component in src/frontend/src/components/SocialLoginButtons.tsx
- [X] T021 [US3] Add error handling toast notifications for cancelled or failed OAuth flows in src/frontend/src/pages/LoginPage.tsx

**Checkpoint**: All user stories independently testable and complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility validation, security hardening, and documentation updates

- [X] T022 [P] Verify WCAG 2.1 Level AA keyboard navigation and screen-reader ARIA attributes for SocialLoginButtons in src/frontend/src/components/SocialLoginButtons.tsx
- [X] T023 Run full Vitest backend and frontend test suite to ensure zero regressions
- [X] T024 Validate setup and environment variables against specs/019-social-login/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational (Phase 2) - No story dependencies
- **User Story 2 (P2)**: Starts after Foundational (Phase 2) - Integrates with US1
- **User Story 3 (P3)**: Starts after Foundational (Phase 2) - UI polish on US1/US2

### Parallel Opportunities

- T001 and T003 can be built in parallel.
- T007 (backend test) and T012 (frontend UI component) can be built in parallel.
- T015 (linking test) and T019 (UI error test) can run in parallel within their respective phases.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Schema & DB Migration)
3. Complete Phase 3: User Story 1 (Google & Facebook login buttons & OAuth authentication)
4. **STOP and VALIDATE**: Test User Story 1 independently.

### Incremental Delivery

1. Setup + Foundational → Database schema & Zod types ready
2. User Story 1 → Single-click social authentication MVP
3. User Story 2 → Automated account linking & registration
4. User Story 3 → UX loading states & error recovery toasts
