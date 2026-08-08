# Moderator UI Tasks

## Phase 1: Shared Contracts
- [ ] Add `GetReportsQuerySchema` in `src/shared/schemas/interactions.ts`
- [ ] Add `UpdateReportStatusSchema` in `src/shared/schemas/interactions.ts`

## Phase 2: Backend Implementation
- [ ] Implement `requireRole(roles: string[])` middleware in `src/backend/middleware/auth.ts`
- [ ] Create `src/backend/api/moderation/routes.ts` with `GET /reports`, `PATCH /reports/:id/status`, and `GET /metrics` endpoints
- [ ] Mount `moderationRouter` in `src/backend/index.ts`

## Phase 3: Frontend Layout and Routing
- [ ] Create `RequireRole` route guard component in `src/frontend/src/components/auth/RequireRole.tsx`
- [ ] Create `ModeratorLayout` component in `src/frontend/src/components/layout/ModeratorLayout.tsx`
- [ ] Add routing configuration in `src/frontend/src/App.tsx`

## Phase 4: Frontend Pages
- [ ] Build `ModeratorDashboardPage` in `src/frontend/src/pages/moderator/ModeratorDashboard.tsx`
- [ ] Build `ReportsQueuePage` in `src/frontend/src/pages/moderator/ReportsQueue.tsx`

## Phase 5: Testing & Validation
- [ ] Test API endpoints with valid/invalid roles
- [ ] Log AI usage into `ai-logs/`
