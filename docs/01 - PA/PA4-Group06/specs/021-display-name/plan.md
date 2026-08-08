# Implementation Plan: Display Name Separate from Username

**Branch**: `021-display-name` | **Date**: 2026-08-06 | **Spec**: [specs/021-display-name/spec.md](file:///d:/FOZ/specs/021-display-name/spec.md)

**Input**: Feature specification from `/specs/021-display-name/spec.md`

## Summary

Decouple user handles (`@username`) from public display names (`displayName`). `username` is added as a permanent, unique, lowercase, URL-safe handle stored on `user_accounts` (e.g. `@john_doe`). `displayName` remains a mutable public name on `profiles`. The plan includes database schema migration with backfill for existing users, shared Zod schema validation in `src/shared/`, real-time username availability endpoint, `/profiles/@<username>` routing with legacy `/profiles/:userId` redirection, Google OAuth auto-username assignment, and UI display updates across profile, feed, comments, and search.

## Technical Context

**Language/Version**: TypeScript 5.x ESM (Node.js LTS)

**Primary Dependencies**: React 18, Vite, Express, Drizzle ORM, Zod, TanStack React Query, React Router DOM

**Storage**: PostgreSQL 16 (`user_accounts` and `profiles` tables)

**Testing**: Vitest (shared schema tests, backend integration tests, React component tests)

**Target Platform**: Web Browsers (Responsive Desktop & Mobile)

**Project Type**: Full-stack Web Application (`src/frontend/`, `src/backend/`, `src/shared/`)

**Performance Goals**: `<500ms` username availability check response time; `<2s` profile page render response time.

**Constraints**: Case-insensitive uniqueness for usernames; Zod validation at trust boundaries; no breaking changes to legacy profile links.

**Scale/Scope**: All registered user accounts and profile views; 1 database migration.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Client-Server Architecture** → PASS. Shared `usernameSchema`, registration DTOs, and profile response types live in `src/shared/schemas/`.
- **Principle II: Enforced Folder Structure** → PASS. Backend code in `src/backend/`, frontend in `src/frontend/`, shared in `src/shared/`.
- **Principle III: Clean Code & Reusability** → PASS. Handled through Express central error middleware and shared UI components.
- **Principle IV: Security at Every Layer** → PASS. Input validation via Zod at API boundaries; rate limiter applied to `/api/v1/auth/check-username`.
- **Principle V: Consistency Over Cleverness** → PASS. Uses Drizzle migration, standard Express routes, and React Router routes.
- **Principle VII: Accessibility** → PASS. Accessible input labels for registration handle field; semantic ARIA labels for handle vs. display name in profile headers.

## Project Structure

### Documentation (this feature)

```text
specs/021-display-name/
├── plan.md              # Implementation plan
├── research.md          # Technical research & decision records
├── data-model.md        # Database schema & entity models
├── quickstart.md        # Manual & automated testing instructions
├── contracts/           # API specification (OpenAPI)
│   └── api-contracts.yaml
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── schemas/
│       ├── auth.ts              # Add usernameSchema, RESERVED_USERNAMES, RegisterRequest
│       ├── social-auth.ts       # Ensure username in social auth response
│       └── profile.ts           # Update Profile types
├── backend/
│   ├── db/
│   │   ├── schema/
│   │   │   └── users.ts         # Add username column & unique index to userAccounts
│   │   ├── repositories/
│   │   │   └── users.ts         # Add getUserByUsername, checkUsernameAvailable
│   │   └── migrations/          # Drizzle migration for username column + backfill
│   ├── services/
│   │   ├── auth.service.ts      # Handle username registration & availability
│   │   └── social-auth.service.ts # Handle auto-generating username for Google OAuth
│   └── api/
│       ├── auth/
│       │   └── routes.ts        # Add GET /api/v1/auth/check-username
│       └── profile/
│           └── routes.ts        # Add GET /api/v1/profiles/by-username/:username
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── auth.ts          # API call for check-username
    │   │   └── profile.ts       # API call for profile by username
    │   ├── pages/
    │   │   ├── LoginPage.tsx    # Add username input field to registration tab
    │   │   ├── ProfilePage.tsx  # Display @username handle, handle /profiles/@:username route
    │   │   ├── SearchPage.tsx   # Display @username in creator results
    │   │   └── PostPage.tsx     # Display @username on post author and comments
    │   └── components/
    │       ├── FeedPostItem.tsx # Display @username alongside displayName
    │       └── NavBar.tsx       # Links & navigation using @username
    └── App.tsx                  # Register /profiles/@:username and legacy /profiles/:userId redirect route
```

**Structure Decision**: Web application structure following existing modular full-stack architecture (`src/frontend/`, `src/backend/`, `src/shared/`).

## Complexity Tracking

> No constitution violations detected. Standard schema extension and routing update.
