# Feature Specification: Administrator Dashboard

**Feature Branch**: `012-admin-dashboard`

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "Based on docs/00 - Old-PA-docs/1B. Project Proposal.md and docs/ui-designs/admin, create Administrator dashboard. This is the highest level of access. Complete access over all database records. Can permanently remove users account, instantly delete any content, assign Moderator roles. Manage forum categories, modify global system settings, and view full audit logs (track all Moderator actions)."

## Clarifications

### Session 2026-08-02
- Q: How should historical posts and comments be handled when a user account is permanently deleted by an Administrator? → A: Anonymize user profile data and reattribute all existing posts and comments to `[Deleted User]`, maintaining thread structure and preventing broken reply chains.
- Q: How should threads be handled when deleting or archiving a forum category? → A: Require the Administrator to explicitly select a target destination category for all existing threads before category deletion or archival can proceed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System Oversight & Full Audit Logging (Priority: P1)

As an Administrator, I want to view a centralized control dashboard and filter/search full audit logs of all Moderator and Admin actions, so that I can maintain operational oversight and hold moderators accountable.

**Why this priority**: Oversight is essential for platform integrity and governance. Without centralized visibility and audit logs, administrators cannot monitor moderator decisions or maintain accountability.

**Independent Test**: Administrator logs into the dashboard, views platform metrics, searches audit logs by Moderator ID or action type, and verifies exact timestamped moderation records.

**Acceptance Scenarios**:

1. **Given** an authenticated Administrator, **When** navigating to the Admin Control Center (`/admin`), **Then** key platform metrics (Total Users, Active Moderators, Pending Escalations, Content Removal Stats, AI Service Health) and recent system audit events are displayed clearly.
2. **Given** an Administrator viewing Audit Logs (`/admin/audit-logs`), **When** filtering by Moderator ID, Action Type (e.g. Flagged, Escalated, Dismissed, Content Deleted, Role Changed), or Date Range, **Then** matching action records are returned displaying timestamp, actor name/role, target user/content ID, action details, and rationale.

---

### User Story 2 - User Management & Moderator Assignment (Priority: P1)

As an Administrator, I want to search and manage user accounts, assign or revoke Moderator roles, and permanently delete offending user accounts when required.

**Why this priority**: Managing user privileges and removing malicious accounts is a fundamental administrative responsibility for keeping the platform safe.

**Independent Test**: Administrator searches for a user account, promotes the user to Moderator role, or permanently deletes a user account after a critical violation, with instant database enforcement.

**Acceptance Scenarios**:

1. **Given** an Administrator in User Management (`/admin/users`), **When** searching for a Standard User and selecting "Assign Moderator Role", **Then** the user's role is updated to Moderator instantly across both UI and API authorization layers.
2. **Given** an Administrator viewing a user account, **When** selecting "Permanently Remove User" and confirming via security prompt, **Then** the user account credentials/profile are purged, active tokens invalidated immediately, historical posts/comments reattributed to `[Deleted User]`, and an audit event logged.

---

### User Story 3 - Instant Content Removal & Escalated Report Resolution (Priority: P2)

As an Administrator, I want to review moderator-escalated content reports and instantly delete any violating posts or comments, so that harmful content is removed without delay.

**Why this priority**: Moderation escalation resolution ensures that content flagged as severe or disputed by moderators can be conclusively handled by administrators with highest authority.

**Independent Test**: Administrator views the Reported Content queue, selects an escalated thread, triggers Instant Delete, and confirms the content is immediately removed from all public community feeds.

**Acceptance Scenarios**:

1. **Given** an Administrator reviewing reported content (`/admin/reports`), **When** selecting a report escalated by a Moderator, **Then** the original content snippet, reporter notes, and moderator assessment/history are presented in a split-view container.
2. **Given** an Administrator reviewing offending content, **When** clicking "Instant Delete Content", **Then** the post/comment is deleted across all client feeds and database records, and an audit log entry is recorded.

---

### User Story 4 - Forum Category Management (Priority: P2)

As an Administrator, I want to create, modify, reorder, and archive forum categories, so that community discussion topics remain organized and appropriately governed.

**Why this priority**: Discussion categories structure the entire forum; administrators need full control to adapt topic taxonomies as the community grows.

**Independent Test**: Administrator creates a new category "Technology & AI", sets description and posting permissions, reorders it in the category management table, and verifies it appears in public forum navigation.

**Acceptance Scenarios**:

1. **Given** an Administrator in Category Management (`/admin/categories`), **When** creating a new category with name, slug, description, and display order, **Then** the new category becomes available for post creation immediately.
2. **Given** an Administrator editing an existing category, **When** updating posting permissions, archiving, or deleting a category, **Then** the Administrator is prompted to select a destination category to reassign all existing threads before the change takes effect.

---

### User Story 5 - Global System Settings & AI Controls (Priority: P3)

As an Administrator, I want to modify global system settings, toggle user registration, configure rate limits, and manage AI summarization (TL;DR) parameters, so that platform security, performance, and features remain under control.

**Why this priority**: System settings allow fine-tuning platform-wide operational behavior without code deployments.

**Independent Test**: Administrator opens Global System Settings, toggles user registration or updates AI rate limits, saves changes, and verifies the updated rules are enforced system-wide.

**Acceptance Scenarios**:

1. **Given** an Administrator in System Settings (`/admin/settings`), **When** updating AI summarization rate limits or fallback provider order, **Then** new configuration values are applied immediately to API boundaries.
2. **Given** an Administrator toggling site registration status, **When** saving global configuration, Then new user registration attempts comply with the updated setting.

---

### Edge Cases

- **Sole Administrator Self-Demotion or Deletion**: System MUST block an Administrator from revoking their own Admin role or deleting their account if they are the last active Administrator on the platform.
- **Concurrent Moderation Actions**: If an Administrator performs an action (e.g. Instant Delete or User Removal) on content simultaneously being reviewed by a Moderator, the Administrator's action takes immediate precedence, and the Moderator's stale UI view updates gracefully via toast notification.
- **Category Archival & Thread Association**: Deleting or archiving a category containing active threads MUST require an Administrator to select a destination category to reassign all existing threads, ensuring zero orphaned threads.
- **High-Volume Audit Log Performance**: Filtering and searching audit logs MUST remain performant (< 500ms query time) even with 100,000+ historical audit entries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST restrict access to all Administrator dashboard views (`/admin/*`) and API endpoints (`/api/v1/admin/*`) strictly to users with `role === 'administrator'`. Non-administrators MUST receive an explicit HTTP 403 Forbidden response.
- **FR-002**: System MUST provide an Admin Control Center dashboard displaying real-time metrics (Total Users, Active Moderators, Pending Escalations, Content Removal Volume, AI Service Health).
- **FR-003**: System MUST allow Administrators to search, filter, and paginate all registered user accounts by username, email, role (`Guest`, `Standard User`, `Moderator`, `Administrator`), and account status (`Active`, `Warned`, `Suspended`, `Banned`).
- **FR-004**: System MUST allow Administrators to assign Moderator roles to Standard Users and revoke Moderator roles back to Standard Users.
- **FR-005**: System MUST allow Administrators to permanently delete user accounts. Account credentials and personal profile information MUST be purged, active session tokens invalidated immediately, and all historical posts and comments authored by the user reattributed to `[Deleted User]` to preserve thread continuity.
- **FR-006**: System MUST allow Administrators to view reported content lists (filterable by Pending Admin Review, Moderator Reviewed, Escalated) and detailed report cards with reporter notes and moderator recommendations.
- **FR-007**: System MUST allow Administrators to instantly delete any post or comment across the platform, bypassing standard moderation escalation steps when necessary.
- **FR-008**: System MUST automatically record an immutable audit log entry for every Moderator action (reports reviewed, content flagged/dismissed) and Administrator action (user deletion, role assignment, content instant deletion, system setting modification).
- **FR-009**: System MUST allow Administrators to search, filter, and paginate audit logs by date range, actor ID/name, action type, and target entity ID.
- **FR-010**: System MUST allow Administrators to manage forum categories (create new categories, edit name/description/slug, reorder display sequence, toggle posting permissions, and delete/archive categories). Deleting or archiving a category MUST require the Administrator to select a target active category to reassign all existing threads.
- **FR-011**: System MUST allow Administrators to modify global system settings (user registration toggle, global rate limits, maintenance banner text, AI summarization provider order/quotas).

### Key Entities

- **AdminAuditLog**: Immutable record of moderation and administrative actions. Attributes: `id`, `actorId`, `actorName`, `actorRole`, `actionType` (ROLE_ASSIGN, USER_DELETE, CONTENT_DELETE, REPORT_FORWARD, REPORT_DISMISS, SETTING_UPDATE), `targetType` (USER, POST, COMMENT, CATEGORY, SYSTEM_SETTING), `targetId`, `rationale`, `createdAt`.
- **UserRoleManagement**: User account extension representing privilege level (`Guest`, `Standard User`, `Moderator`, `Administrator`) and penalty state (`Active`, `Warned`, `Suspended`, `Banned`).
- **ForumCategory**: Discussion forum category metadata. Attributes: `id`, `name`, `slug`, `description`, `displayOrder`, `isArchived`, `allowNewPosts`, `createdAt`, `updatedAt`.
- **SystemConfiguration**: Global system key-value parameter store. Attributes: `key`, `value`, `dataType`, `description`, `lastUpdatedBy`, `updatedAt`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can search and find any user account or reported item in the dashboard in under 3 seconds.
- **SC-002**: Role promotion/demotion and permanent user deletion actions execute and enforce access changes across API boundaries in under 500ms.
- **SC-003**: 100% of moderator actions and administrative interventions generate complete, unalterable audit log records without data omission.
- **SC-004**: Audit log queries with combined filters (actor, action type, date) render results in under 500ms across datasets of up to 100,000 log entries.
- **SC-005**: 100% of unauthorized access attempts to `/admin` routes or `/api/v1/admin/*` endpoints by non-admin users are blocked with HTTP 403 Forbidden.

## Assumptions

- Authenticated JWT contains the user's role claim (`administrator`) checked by Express server-side middleware on all `/api/v1/admin/*` endpoints.
- Database index strategy supports efficient querying of audit logs by `actorId`, `actionType`, and `createdAt`.
- Permanent deletion of a user account retains compliance audit log references while removing sensitive personal profile data.
- System settings updates persist in PostgreSQL and update server memory cache without requiring application reboots.
