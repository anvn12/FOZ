# Implementation Plan: Profile Management

**Branch**: `006-profile-management` | **Date**: 2026-07-20 | **Spec**: [/specs/006-profile-management/spec.md](file:///d:/FOZ/specs/006-profile-management/spec.md)

## Summary
Implement full-stack profile management capabilities. Standard users can view any member's profile page and manage their own profile details (display name, bio, location, website) and user avatar. User avatars are stored directly in the database as Base64-encoded strings (data URLs) to maintain a completely stateless backend server.

---

## Technical Context

**Language/Version**: Node.js LTS (ESM), TypeScript 5.x
**Primary Dependencies**: Express, Drizzle ORM, Zod, React 18, @tanstack/react-query, react-hook-form, Tailwind CSS, react-hot-toast
**Storage**: PostgreSQL 16 (Drizzle `profiles` table)
**Testing**: Vitest (Tier-1 Unit tests, Tier-2 Integration tests)
**Target Platform**: Modern Web Browsers, Express API Server
**Project Type**: Full-stack Web Application
**Performance Goals**: API response under 300ms, client-side validation response under 50ms.
**Constraints**:
- Ephemeral static files (avatars MUST be stored directly in PG database as Base64 text string in the `avatar_url` field).
- Max avatar size is 2MB (approx 2,728,000 characters in Base64).
- Only profile owners are allowed to edit their own profile (`PATCH` and `POST` avatar endpoints gate via session userId).
- Central Express error handler for validation error serialization.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Modular Client-Server Separation**: **PASS**. Backend routes/controllers in `src/backend/api/profile/`, frontend pages in `src/frontend/src/pages/ProfilePage.tsx`. Common contract schema defined in `src/shared/schemas/profile.ts`.
- **Enforced Folder Structure**: **PASS**. All source files will reside in appropriate, predictable directory paths (`api/`, `pages/`, `components/`, `schemas/`).
- **Clean Code & Centralized Error Handling**: **PASS**. Backend errors map to centralized middleware responses; frontend errors leverage standard react-hot-toast bounds.
- **Security at Every Layer**: **PASS**. All write endpoints (`PATCH /me`, `POST /me/avatar`) require user authentication (`requireAuth`) and check that updates only apply to the current active session user. Request data validated at trust boundary via Zod schema parsing.
- **Consistency Over Cleverness**: **PASS**. Reuses established API design conventions from `auth` modules, standard Vitest structures, and React Query conventions.

---

## Project Structure

### Documentation (this feature)
```text
specs/006-profile-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 data design
├── quickstart.md        # Phase 1 quickstart
├── contracts/
│   └── profile-api.md   # Phase 1 HTTP endpoint contract
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)
```text
src/
├── shared/
│   └── schemas/
│       └── profile.ts          # Zod request validation schemas
├── backend/
│   ├── api/
│   │   └── profile/
│   │       ├── routes.ts       # Profile API router
│   │       ├── profile.test.ts # Integration & API tests
│   │       └── profile.service.ts # Profile retrieval & update logic
│   ├── db/
│   │   └── repositories/
│   │       └── profiles.ts     # Drizzle operations for profiles
│   └── index.ts                # Mount profile router
└── frontend/
    └── src/
        ├── api/
        │   └── profile.ts      # React Query query/mutation hooks
        ├── components/
        │   └── ProfileEditModal.tsx # Edit profile UI & validation
        ├── pages/
        │   └── ProfilePage.tsx # Public Profile main page & tabs layout
        └── App.tsx             # Register profile routes (/profiles/:userId)
```

**Structure Decision**: Full-stack structure where contract schemas live in `src/shared/`, backend logic is in `src/backend/api/profile/`, and React views live in `src/frontend/src/pages/`.

---

## Complexity Tracking

*No principles violated. The Base64 database storage decision has been explicitly approved in clarifications to preserve a stateless server setup.*
