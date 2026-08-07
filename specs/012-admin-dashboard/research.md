# Research & Technical Decisions: Administrator Dashboard

**Feature**: `012-admin-dashboard`  
**Date**: 2026-08-02  

## 1. Administrator Authorization & API Boundary Protection

### Decision
Implement server-side Express middleware (`requireAdminRole`) mounted on all `/api/v1/admin/*` endpoints. Verify the authenticated user's JWT payload and database `role` column equals `'administrator'`. Non-administrator requests are aborted immediately with an HTTP 403 Forbidden error response before hitting any service or database handler.

### Rationale
- Enforces Principle IV (Security at Every Layer) of the project constitution.
- Role checks must happen at the backend API boundary, not relying on frontend UI visibility alone.
- Prevents unauthorized access or escalation attempts from Guests, Standard Users, or Moderators.

### Alternatives Considered
- *Client-side routing guards only*: Rejected because client-side routing can be bypassed via direct HTTP calls to API endpoints.
- *Scattered per-handler role checks*: Rejected because central middleware ensures consistent enforcement across all admin endpoints.

---

## 2. Immutable Audit Logging Architecture

### Decision
Create a dedicated `admin_audit_logs` Drizzle schema table in `src/backend/db/schema/admin.ts`. Every moderation and administrative action (role assignment, user deletion, instant content deletion, category modification, system config updates) writes an unalterable log record capturing `actorId`, `actorName`, `actorRole`, `actionType`, `targetType`, `targetId`, `rationale`, and `createdAt`.

### Rationale
- Complies with constitution requirements for auditing moderation actions.
- Keeps audit trails separate from application state tables for immutability and performance isolation.
- Supports indexing on `(actorId, createdAt)` and `(actionType, createdAt)` to guarantee sub-500ms query times over 100,000+ entries.

### Alternatives Considered
- *Application logger (Winston/Pino) text files*: Rejected because text log files cannot be queried, filtered, or paginated easily from the Admin Dashboard UI.
- *Overwriting entity updated_at columns*: Rejected because standard entity timestamps do not capture historical audit trails or actor identities.

---

## 3. Account Deletion & Content Reattribution

### Decision
When an Administrator deletes a user account (`DELETE /api/v1/admin/users/:userId`):
1. Invalidate active refresh tokens (`refresh_sessions`) for that user.
2. Reattribute all posts and comments created by that user to a system default anonymized identity (`[Deleted User]`).
3. Delete the user row from `users` (or purge PII fields and credentials).
4. Record an `ADMIN_USER_DELETE` audit log entry with the rationale.

### Rationale
- Resolves clarification decision A: preserves discussion thread structure and community knowledge without leaving orphan comments or broken UI trees.
- Purges PII and credentials for compliance while maintaining thread continuity.

### Alternatives Considered
- *Cascade deletion of all user content*: Rejected per clarification decision to avoid destroying community threads.
- *Soft-deleting user row without content reattribution*: Rejected because leaving personal profile references on posts violates privacy expectations.

---

## 4. Forum Category Management & Thread Reassignment

### Decision
Category deletion (`DELETE /api/v1/admin/categories/:id`) accepts a required parameter `targetCategoryId`. Before dropping or archiving category `:id`, an atomic SQL update reassigns all threads linked to category `:id` to `targetCategoryId`.

### Rationale
- Resolves clarification decision C: guarantees zero orphaned threads.
- Ensures valid foreign key references in the database schema.

### Alternatives Considered
- *Cascade thread deletion*: Rejected because deleting entire discussion categories with hundreds of user posts causes massive data loss.
- *Automatic fallback to 'General'*: Rejected per user clarification choice to give Administrators explicit control over thread destination.

---

## 5. Dynamic System Configuration Store

### Decision
Store key-value system configurations in a `system_settings` database table (`key`, `value`, `dataType`, `description`, `lastUpdatedBy`, `updatedAt`). The backend loads configurations into memory on startup and invalidates/refreshes the cache upon Admin updates (`PUT /api/v1/admin/settings`).

### Rationale
- Enables dynamic toggling of registration status, rate limits, and AI summarization parameters without requiring application server restarts.
- Centralized validation via Zod schemas in `src/shared/schemas/admin.ts`.

### Alternatives Considered
- *Environment variables (.env)*: Rejected because modifying `.env` requires restarting the server process and cannot be managed through the Admin UI dashboard.
