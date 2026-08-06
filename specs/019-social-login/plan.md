# Implementation Plan: Social Login via Google and Facebook

**Branch**: `019-social-login` | **Date**: 2026-08-06 | **Spec**: [spec.md](file:///d:/FOZ/specs/019-social-login/spec.md)

**Input**: Feature specification from `/specs/019-social-login/spec.md`

## Summary

Add Google and Facebook social authentication options to the FOZ Login UI. The implementation introduces full-width stacked brand buttons ("Continue with Google", "Continue with Facebook") above an "OR" divider on the login card, supporting a hybrid authorization flow (pop-up dialog on desktop, full-page redirect on mobile). Backend services handle OAuth code exchange, verify identity tokens, link existing accounts by email or create new profiles, and manage database mappings via `user_social_links`.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js LTS, ESM)
**Primary Dependencies**: Express, React, Vite, Tailwind CSS, Zod, Drizzle ORM, google-auth-library
**Storage**: PostgreSQL 16 (`user_social_links` table)
**Testing**: Vitest (Backend integration tests & Frontend component tests)
**Target Platform**: Modern Web Browsers (Desktop & Mobile)
**Project Type**: Full-stack Web Application (`src/frontend/`, `src/backend/`, `src/shared/`)
**Performance Goals**: <5 seconds total auth completion, <200ms API callback processing time
**Constraints**: WCAG 2.1 Level AA accessibility, JWT access token + HTTP-only refresh cookie session
**Scale/Scope**: Web UI login card integration, REST OAuth endpoints under `/api/v1/auth`

## Constitution Check

*GATE: Passed*

- **I. Modular Client-Server**: Shared Zod schemas in `src/shared/schemas/social-auth.ts`. Frontend in `src/frontend/`, backend in `src/backend/`.
- **II. Enforced Folder Structure**: Complies with standard repo structure.
- **III. Clean Code & Reusability**: Centralized error middleware handling for OAuth callback failures.
- **IV. Security at Every Layer**: Zod validation at ingestion, server-side OAuth token verification, secure JWT session cookies.
- **V. Consistency Over Cleverness**: Standard REST endpoints under `/api/v1/auth/google` and `/api/v1/auth/facebook`.
- **VII. Accessibility**: Full WCAG 2.1 Level AA compliance (aria-labels, keyboard focusable social login buttons).

## Project Structure

### Documentation (this feature)

```text
specs/019-social-login/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 data schema
├── quickstart.md        # Phase 1 setup guide
├── contracts/           # Phase 1 API schemas
│   └── social-auth-api.yaml
└── checklists/
    └── requirements.md
```

### Source Code Layout

```text
src/
├── shared/
│   └── schemas/
│       └── social-auth.ts            # Shared Zod schemas & types for social auth
├── backend/
│   ├── db/
│   │   ├── schema/
│   │   │   └── user-social-links.ts   # Drizzle schema for user_social_links
│   │   └── migrations/               # SQL migration files
│   ├── services/
│   │   └── social-auth.service.ts    # OAuth token verification & account linking
│   └── api/
│       └── auth/
│           ├── google-auth.routes.ts # /api/v1/auth/google routes
│           └── facebook-auth.routes.ts # /api/v1/auth/facebook routes
└── frontend/
    └── src/
        ├── components/
        │   └── SocialLoginButtons.tsx # Brand stacked buttons component
        └── pages/
            └── LoginPage.tsx          # Updated login card UI with social options
```

**Structure Decision**: Web application structure separating `src/frontend/`, `src/backend/`, and `src/shared/` per Constitution Principle I & II.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | Fully compliant with project constitution |
