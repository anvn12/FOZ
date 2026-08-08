# Tasks: Administrator Dashboard

**Input**: Design documents from `/specs/012-admin-dashboard/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [data-model.md](./data-model.md), [contracts/admin-api.yaml](./contracts/admin-api.yaml), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared Zod validation schemas for Admin DTOs and API boundary payloads

- [x] T001 Create shared Zod schemas for Admin DTOs in `src/shared/schemas/admin.ts`
- [x] T002 Re-export admin Zod schemas from `src/shared/schemas/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, migrations, authorization middleware, and admin repository layer that MUST be complete before any user story work begins

- [x] T003 Create Drizzle database schema for `admin_audit_logs`, `forum_categories`, and `system_settings` in `src/backend/db/schema/admin.ts`
- [x] T004 Export admin database schema tables from `src/backend/db/schema/index.ts`
- [x] T005 Generate SQL database migration for admin tables in `src/backend/db/migrations/0006_admin_dashboard.sql`
- [x] T006 Implement `requireAdminRole` Express authorization middleware in `src/backend/api/admin/middleware.ts`
- [x] T007 Implement database query functions for admin operations in `src/backend/db/repositories/admin.ts`
- [x] T008 Implement business logic and audit logging helpers in `src/backend/services/admin.service.ts`
- [x] T009 Setup Express sub-router for admin endpoints in `src/backend/api/admin/routes.ts`
- [x] T010 Mount admin router onto `apiRouter` at `/admin` prefix in `src/backend/index.ts`

**Checkpoint**: Foundation ready — backend authorization and database layers ready for user story execution

---

## Phase 3: User Story 1 - System Oversight & Full Audit Logging (Priority: P1) 🎯 MVP

**Goal**: Centralized Control Center overview displaying platform metrics and searchable, filterable audit logs of all moderator/admin actions.

**Independent Test**: Login as Administrator, view `/admin` Control Center metrics, query `/admin/audit-logs` with filters (actor, action type, date range), and verify accurate timestamped audit records.

- [x] T011 [P] [US1] Implement `GET /api/v1/admin/metrics` Control Center endpoint in `src/backend/api/admin/routes.ts`
- [x] T012 [P] [US1] Implement `GET /api/v1/admin/audit-logs` filter and pagination endpoint in `src/backend/api/admin/routes.ts`
- [x] T013 [P] [US1] Add API client functions for metrics and audit log endpoints in `src/frontend/src/api/admin.ts`
- [x] T014 [P] [US1] Create paginated `AuditLogTable` component with filter controls in `src/frontend/src/components/admin/AuditLogTable.tsx`
- [x] T015 [US1] Build Admin Control Center overview page (`/admin`) in `src/frontend/src/pages/admin/AdminDashboardPage.tsx`
- [x] T016 [US1] Build Audit Logs page (`/admin/audit-logs`) with search and filter controls in `src/frontend/src/pages/admin/AdminAuditLogsPage.tsx`

**Checkpoint**: User Story 1 (MVP) functional and independently testable

---

## Phase 4: User Story 2 - User Management & Moderator Assignment (Priority: P1)

**Goal**: Manage user account roles (assign/revoke Moderator) and permanently remove offending user accounts with content reattribution to `[Deleted User]`.

**Independent Test**: Search user in `/admin/users`, assign Moderator role, or trigger account deletion and confirm active tokens are invalidated and past posts are reattributed to `[Deleted User]`.

- [x] T017 [P] [US2] Implement `GET /api/v1/admin/users` search and filter endpoint in `src/backend/api/admin/routes.ts`
- [x] T018 [P] [US2] Implement `PUT /api/v1/admin/users/:userId/role` for Moderator assignment/revocation in `src/backend/api/admin/routes.ts`
- [x] T019 [US2] Implement `DELETE /api/v1/admin/users/:userId` account deletion with `[Deleted User]` reattribution in `src/backend/api/admin/routes.ts`
- [x] T020 [P] [US2] Add API client methods for user search, role update, and account deletion in `src/frontend/src/api/admin.ts`
- [x] T021 [P] [US2] Create `UserActionModal` for confirming role changes and user deletion in `src/frontend/src/components/admin/UserActionModal.tsx`
- [x] T022 [US2] Build User Management page (`/admin/users`) with role/status filters in `src/frontend/src/pages/admin/AdminUsersPage.tsx`

**Checkpoint**: User Stories 1 AND 2 functional and independently testable

---

## Phase 5: User Story 3 - Instant Content Removal & Escalated Report Resolution (Priority: P2)

**Goal**: Review moderator-escalated reports and instantly delete violating posts or comments.

**Independent Test**: Navigate to `/admin/reports`, view escalated report details, click "Instant Delete Content", and verify item is removed from public feeds and logged in audit trails.

- [x] T023 [P] [US3] Implement `GET /api/v1/admin/reports` endpoint for escalated reports in `src/backend/api/admin/routes.ts`
- [x] T024 [US3] Implement `DELETE /api/v1/admin/content/:type/:id` for instant content deletion in `src/backend/api/admin/routes.ts`
- [x] T025 [P] [US3] Add API client methods for report listing and instant content removal in `src/frontend/src/api/admin.ts`
- [x] T026 [US3] Build Admin Reported Content page (`/admin/reports`) with split-view card details in `src/frontend/src/pages/admin/AdminReportsPage.tsx`

**Checkpoint**: User Story 3 functional and independently testable

---

## Phase 6: User Story 4 - Forum Category Management (Priority: P2)

**Goal**: Full category management (create, edit, reorder, archive) with mandatory thread reassignment when deleting/archiving a category.

**Independent Test**: Create category in `/admin/categories`, reorder display sequence, edit properties, and delete category while reassigning all threads to a target destination category.

- [x] T027 [P] [US4] Implement `POST /api/v1/admin/categories` and `PUT /api/v1/admin/categories/:id` endpoints in `src/backend/api/admin/routes.ts`
- [x] T028 [US4] Implement `DELETE /api/v1/admin/categories/:id` with mandatory `targetCategoryId` reassignment in `src/backend/api/admin/routes.ts`
- [x] T029 [P] [US4] Add API client methods for category CRUD and thread reassignment in `src/frontend/src/api/admin.ts`
- [x] T030 [P] [US4] Create `CategoryModal` for category editing and deletion reassignment in `src/frontend/src/components/admin/CategoryModal.tsx`
- [x] T031 [US4] Build Forum Category Management page (`/admin/categories`) in `src/frontend/src/pages/admin/AdminCategoriesPage.tsx`

**Checkpoint**: User Story 4 functional and independently testable

---

## Phase 7: User Story 5 - Global System Settings & AI Controls (Priority: P3)

**Goal**: Configure global site settings (registration toggle, rate limits, maintenance text, AI summarizer provider chain).

**Independent Test**: Modify setting in `/admin/settings`, save changes, and verify updated configuration is applied to API boundaries without server reboot.

- [x] T032 [P] [US5] Implement `GET /api/v1/admin/settings` and `PUT /api/v1/admin/settings` endpoints in `src/backend/api/admin/routes.ts`
- [x] T033 [P] [US5] Add API client methods for system configuration in `src/frontend/src/api/admin.ts`
- [x] T034 [US5] Build Global System Settings page (`/admin/settings`) in `src/frontend/src/pages/admin/AdminSettingsPage.tsx`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Client routing integration, security regression testing, and end-to-end quickstart validation

- [x] T035 [P] Register `/admin/*` routes with admin role route guards in `src/frontend/src/App.tsx`
- [x] T036 [P] Add Vitest integration tests for admin route authorization gating (HTTP 403 checks) in `src/backend/api/admin/admin.test.ts`
- [x] T037 Execute quickstart verification steps to validate end-to-end admin flows per `specs/012-admin-dashboard/quickstart.md`
