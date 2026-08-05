# Implementation Plan: Search Discovery Widgets & Input Fixes

**Branch**: `017-fix-search-widgets` | **Date**: 2026-08-05 | **Spec**: [spec.md](file:///d:/FOZ/specs/017-fix-search-widgets/spec.md)

**Input**: Feature specification from `/specs/017-fix-search-widgets/spec.md`

## Summary

This feature resolves three critical issues on the search page:
1. **Dynamic Search Discovery Widgets**: Replaces mock static content for Trending Topics, Suggested Creators, and Trending Discussions with live dynamic backend data from `GET /api/v1/search/discovery`.
2. **Functional "View all" Suggested Creators**: Enables both header link and card "View all" triggers to initiate a profile search query and list creators directly on the Search page.
3. **Conditional Search Submit Arrow**: Ensures the search submit right arrow button renders conditionally—only visible when non-empty text input is present in the search input field.

---

## Technical Context

**Language/Version**: TypeScript 5.x ESM (Node.js LTS backend, Vite + React frontend)

**Primary Dependencies**: Express, Drizzle ORM, Zod, React, `@tanstack/react-query`, react-router-dom

**Storage**: PostgreSQL 16 (Drizzle ORM for querying `profiles`, `posts`, `interactions`)

**Testing**: Vitest (integration & frontend component unit tests)

**Target Platform**: Web Browsers (Responsive desktop & mobile layouts)

**Project Type**: Full-stack Web Application (`src/frontend` + `src/backend` + `src/shared`)

**Performance Goals**: Discovery widgets load in <300ms; submit button visibility updates in <50ms

**Constraints**: WCAG 2.1 Level AA accessibility; zero console errors; central Express error handling

**Scale/Scope**: 1 search page, 1 backend discovery endpoint, shared Zod schemas

---

## Constitution Check

*GATE: Passed prior to Phase 0 research & Phase 1 design.*

- **Principle I: Modular Client-Server Architecture**: Shared Zod schemas live in `src/shared/schemas/search.ts` as the single source of truth. Endpoints mounted at `/api/v1/search` per convention.
- **Principle II: Enforced Folder Structure**: Code placed strictly in `src/frontend`, `src/backend`, and `src/shared`.
- **Principle III: Clean Code & Reusability**: Centralized error middleware on backend; React Query for client state management.
- **Principle IV: Security at Every Layer**: Input validation via Zod schemas at API boundary.
- **Principle VII: Accessibility**: Keyboard navigable controls (`Enter` key submit, clear button), screen reader ARIA labels on search submit & clear actions.

---

## Project Structure

### Documentation (this feature)

```text
specs/017-fix-search-widgets/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 technical research
├── data-model.md        # Phase 1 DTOs and Zod validation schemas
├── quickstart.md        # Phase 1 verification steps
├── contracts/           # Phase 1 OpenAPI specifications
│   └── search-api.yaml
└── checklists/          # Specification quality checklist
    └── requirements.md
```

### Source Code Layout

```text
src/
├── shared/
│   └── schemas/
│       ├── search.ts    # Zod schemas & DTO types for discovery & search
│       └── index.ts
├── backend/
│   └── api/
│       └── search/
│           ├── routes.ts # Search & GET /api/v1/search/discovery handler
│           └── __tests__/
│               └── discovery.test.ts
└── frontend/
    └── src/
        ├── api/
        │   └── search.ts # React Query hooks (useSearchDiscovery, searchProfiles)
        └── pages/
            ├── SearchPage.tsx # Search input arrow conditional rendering & widget integration
            └── __tests__/
                └── SearchPage.test.tsx
```

**Structure Decision**: Web Application structure using single repository layout (`src/frontend`, `src/backend`, `src/shared`).

---

## Complexity Tracking

*No constitution violations. Standard Express + Drizzle + React + React Query architecture.*
