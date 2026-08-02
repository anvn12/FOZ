# Moderator UI Implementation Plan

## Architecture & Structure
This feature adds the moderation UI layer on top of the existing `reports` database schema in `src/backend/db/schema/interactions.ts`.
- **Frontend**: React components placed in `src/frontend/src/pages/moderator/` and `src/frontend/src/components/layout/`.
- **Backend**: Express router in `src/backend/api/moderation/routes.ts`.
- **Shared**: Zod schemas in `src/shared/schemas/interactions.ts`.

## Backend Components
1. **Middleware `requireRole`**: Located in `src/backend/middleware/auth.ts`. Will verify if the authenticated user has an acceptable role (e.g., `moderator`, `administrator`).
2. **Moderation Router**: 
   - `GET /api/v1/moderation/reports`: Fetches reports with basic details.
   - `PATCH /api/v1/moderation/reports/:id/status`: Updates `status` (to `dismissed` or `escalated`).
   - `GET /api/v1/moderation/metrics`: Aggregates counts (e.g., total reports, pending review).

## Frontend Components
1. **RequireRole Route Guard**: A wrapper component ensuring only authorized users can access the nested routes.
2. **ModeratorLayout**: A shared side-nav and top-bar for moderation views.
3. **ModeratorDashboardPage**: The landing page displaying metrics.
4. **ReportsQueuePage**: The list view for managing reports.

## Constitution Check
- **Client-Server Separation**: Enforced. Logic stays on backend, UI on frontend.
- **Shared Zod Schemas**: Used for API validation and requests.
- **Security & RBAC**: The new `requireRole` middleware implements strict access control.
- **Accessibility**: UI will be semantic and adhere to WCAG 2.1 AA.
