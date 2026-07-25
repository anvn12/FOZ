# Implementation Plan: User Interactions

**Branch**: `008-user-interactions` | **Date**: 2026-07-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-user-interactions/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the core interaction slice for the forum: authenticated post creation, post deletion with ownership checks, comment/reply creation, comment edit/delete, and like/unlike toggles for both posts and comments. The implementation will use shared Zod contracts in `src/shared/`, resource routers under `src/backend/api/`, and interactive React components in `src/frontend/` so both the feed view and the post detail view stay aligned with the same source of truth.

## Technical Context

**Language/Version**: TypeScript 6.x (Node.js >=24, ESM)

**Primary Dependencies**: Express, Drizzle ORM, Zod, React 19, TanStack Query, react-hook-form, react-router-dom, react-hot-toast, socket.io-client

**Storage**: PostgreSQL 16 via `docker-compose.yml`

**Testing**: Vitest for backend integration/unit coverage and frontend component/unit coverage; `tsc --noEmit` for type validation

**Target Platform**: Web application on desktop and mobile browsers

**Project Type**: Full-stack web application

**Performance Goals**: Interaction mutations should surface in the visible thread within 3 seconds at normal local-dev scale; API mutations should remain lightweight enough to support fast Vitest-backed integration tests

**Constraints**: Ownership checks must be enforced at the API boundary and mirrored in the UI; request payloads must be validated with shared Zod schemas; all routes must remain under `/api/v1`; no codegen, no tRPC, and no UI component library

**Scale/Scope**: Single-feature forum slice covering feed view, post detail view, comment thread interactions, and the shared backend contracts needed for those flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Client-Server Architecture**: PASS. Shared request/response schemas belong in `src/shared/` and are imported by both frontend and backend.
- **Principle II: Enforced Folder Structure**: PASS. The feature is scoped to `src/frontend/`, `src/backend/`, and `src/shared/` with feature docs under `specs/008-user-interactions/`.
- **Principle III: Clean Code & Reusability**: PASS. Interaction flows will reuse centralized error handling, shared mutation helpers, and common reaction/comment components.
- **Principle IV: Security at Every Layer**: PASS. Guests are blocked from mutations, and ownership checks are required for edit/delete actions at the API boundary.
- **Principle V: Consistency Over Cleverness**: PASS. The design follows the existing Express + Drizzle + React Query stack and the repo’s `/api/v1` routing convention.

## Project Structure

### Documentation (this feature)

```text
specs/008-user-interactions/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── backend/
│   ├── api/
│   │   ├── posts/routes.ts
│   │   ├── comments/routes.ts
│   │   └── reactions/routes.ts
│   ├── services/
│   │   └── interactions/
│   └── __tests__/integration/post.test.ts
├── frontend/
│   ├── src/components/post/
│   ├── src/components/comment/
│   ├── src/components/reaction/
│   └── src/pages/feed/
└── shared/
    └── schemas/interactions.ts
```

**Structure Decision**: Full-stack web application slice. Backend resource routers will handle posts, comments, and reactions under the shared `/api/v1` prefix, while frontend components for the feed and post detail views will consume the same shared interaction schemas.

## Complexity Tracking

No constitution violations to justify.
