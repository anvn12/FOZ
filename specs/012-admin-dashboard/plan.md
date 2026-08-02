# Implementation Plan: Administrator Dashboard

**Branch**: `012-admin-dashboard` | **Date**: 2026-08-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-admin-dashboard/spec.md`

## Summary

The Administrator Dashboard delivers full administrative control over the FOZ platform, including real-time control center metrics, audit logging of all moderator/admin actions, user role management and permanent account deletion (with content reattribution to `[Deleted User]`), instant content removal for escalated reports, forum category management (with atomic thread reassignment), and global system settings. Backend enforcement uses Express middleware (`requireAdminRole`) mounted under `/api/v1/admin/*`, Drizzle ORM schema tables for audit logs (`admin_audit_logs`), categories (`forum_categories`), and system config (`system_settings`), and shared Zod schemas in `src/shared/schemas/admin.ts`.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js LTS (ESM)  
**Primary Dependencies**: Express, Drizzle ORM (`drizzle-kit`), Zod, React 18, Vite, `@tanstack/react-query`, `zustand`, `react-router-dom`, `react-hot-toast`  
**Storage**: PostgreSQL 16 (docker-compose)  
**Testing**: Vitest (Tier-1 Unit, Tier-2 Integration)  
**Target Platform**: Web Browser (Desktop / Mobile), Node.js Linux Server  
**Project Type**: Full-stack Web Application (`src/frontend` + `src/backend` + `src/shared`)  
**Performance Goals**: < 500ms API response time for admin queries, < 3s dashboard search, < 500ms audit log pagination over 100,000+ entries  
**Constraints**: Require `role === 'administrator'` for all `/api/v1/admin/*` endpoints; 100% audit log recording for moderation/admin actions  
**Scale/Scope**: ~10 admin API endpoints, 5 React admin pages (`/admin`, `/admin/users`, `/admin/audit-logs`, `/admin/categories`, `/admin/settings`)  

## Constitution Check

*GATE: Passed before Phase 0 research & re-checked post Phase 1 design.*

- **Principle I: Modular Client-Server Architecture**: `src/shared/schemas/admin.ts` provides Zod schemas for all request/response DTOs, shared between Express backend and React frontend.
- **Principle II: Enforced Folder Structure**: Follows canonical layout (`src/frontend/`, `src/backend/`, `src/shared/`).
- **Principle III: Clean Code & Reusability**: Centralized Express error handler for backend; centralized toast/error boundary for React frontend.
- **Principle IV: Security at Every Layer**: `requireAdminRole` Express middleware validates JWT and `role` column at `/api/v1/admin/*` boundary. HTTP 403 response for non-admin requests. Immutable audit logging for all moderation/admin actions.
- **Principle V: Consistency Over Cleverness**: Uses established technology stack (Drizzle, Express, React Query, Zustand).
- **Principle VI: AI Service Boundaries**: Dynamic AI parameters managed via system settings without breaking core post/feed functionality.

## Project Structure

### Documentation (this feature)

```text
specs/012-admin-dashboard/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical research & architectural decisions
├── data-model.md        # Entities, Drizzle schema & Zod definitions
├── quickstart.md        # Setup, seed, and test verification guide
├── contracts/           # API contracts
│   └── admin-api.yaml   # OpenAPI 3.0 specification for admin API
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── schemas/
│       └── admin.ts                  # Shared Zod schemas for Admin requests/responses
├── backend/
│   ├── api/
│   │   └── admin/
│   │       ├── middleware.ts         # requireAdminRole security middleware
│   │       ├── routes.ts             # Admin API sub-router (mounted at /api/v1/admin)
│   │       └── admin.test.ts         # Vitest Integration tests
│   ├── db/
│   │   ├── schema/
│   │   │   └── admin.ts              # Drizzle schema: admin_audit_logs, forum_categories, system_settings
│   │   └── repositories/
│   │       └── admin.ts              # Database queries for audit logs, users, categories, settings
│   └── services/
│       └── admin.service.ts          # Business logic for admin actions & content reattribution
└── frontend/
    └── src/
        ├── api/
        │   └── admin.ts              # Frontend API client using React Query
        ├── pages/
        │   └── admin/
        │       ├── AdminDashboardPage.tsx   # Control Center Overview (/admin)
        │       ├── AdminUsersPage.tsx       # User Management & Role Assignment (/admin/users)
        │       ├── AdminAuditLogsPage.tsx   # Searchable Audit Logs (/admin/audit-logs)
        │       ├── AdminCategoriesPage.tsx  # Forum Category CRUD & Reassignment (/admin/categories)
        │       └── AdminSettingsPage.tsx    # System Configuration & AI Controls (/admin/settings)
        └── components/
            └── admin/
                ├── UserActionModal.tsx      # Role change & account deletion confirmation modal
                ├── CategoryModal.tsx        # Category creation & deletion reassignment modal
                └── AuditLogTable.tsx        # Paginated audit log component
```

**Structure Decision**: Option 2 (Web application layout: `src/frontend`, `src/backend`, `src/shared`) with modular admin routes mounted at `/api/v1/admin` per API routing conventions.

## Complexity Tracking

*No constitution violations. Design fully aligns with constitution principles.*
