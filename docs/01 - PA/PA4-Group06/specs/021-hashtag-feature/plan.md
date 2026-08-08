# Implementation Plan: Hashtag Feature

**Branch**: `021-hashtag-feature` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/021-hashtag-feature/spec.md`

## Summary

Implement native hashtag support for FOZ forum posts and comments. The feature extracts hashtags (e.g. `#foz`) upon post creation, normalizes them in PostgreSQL (`hashtags` and `post_hashtags` tables), renders interactive clickable hashtag badges in post feeds, provides a dedicated live hashtag feed page (`/hashtags/:tag`), and renders a dynamic 7-day Trending Hashtags widget on the homepage sidebar.

## Technical Context

**Language/Version**: Node.js 20+ LTS, TypeScript ESM
**Primary Dependencies**: Express, Drizzle ORM, React, @tanstack/react-query, Tailwind CSS, Zod
**Storage**: PostgreSQL 16 (`hashtags` & `post_hashtags` junction table)
**Testing**: Vitest (Unit & Integration tests)
**Target Platform**: Web browsers (Desktop & Mobile)
**Project Type**: Full-stack Web Application (Express API backend + Vite React frontend)
**Performance Goals**: Hashtag feed query < 500ms NFR, hashtag parsing regex < 5ms
**Constraints**: Pure SQL/Drizzle relational queries, Zod validation in `src/shared/`
**Scale/Scope**: Live forum post aggregation, 7-day rolling telemetry for trending tags

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Client-Server Separation & Shared Schemas**: Passed. All hashtag DTOs and query params defined in `src/shared/schemas/hashtags.ts`.
- **Principle II: Enforced Folder Structure**: Passed. Backend logic in `src/backend/api/hashtags/`, frontend components in `src/frontend/src/`.
- **Principle III: Clean Code & Reusability**: Passed. Reusable `HashtagText` component for rendering text with hashtag links.
- **Principle IV: Security & Validation**: Passed. Zod input validation on API boundary; read access public.
- **Principle V: Consistency**: Passed. Uses Drizzle ORM, TanStack Query, and standard Express router patterns.
- **Principle VII: Accessibility**: Passed. Semantic HTML links with ARIA labels for hashtag navigation.

## Project Structure

### Documentation (this feature)

```text
specs/021-hashtag-feature/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── hashtags-api.yaml
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── schemas/
│       └── hashtags.ts           # Zod schemas & DTO contracts
├── backend/
│   ├── db/
│   │   ├── schema/
│   │   │   └── hashtags.ts       # Drizzle schema for hashtags & post_hashtags
│   │   ├── repositories/
│   │   │   └── hashtags.ts       # DB access logic (extraction, 7-day trending, feed filtering)
│   │   └── migrations/
│   │       └── 0007_hashtags.sql # Drizzle SQL migration
│   └── api/
│       └── hashtags/
│           └── routes.ts         # Express routes for /api/v1/hashtags
└── frontend/
    └── src/
        ├── api/
        │   └── hashtags.ts       # TanStack Query hooks for hashtags API
        ├── components/
        │   ├── HashtagText.tsx   # Parses and renders text with interactive #hashtag links
        │   └── TrendingHashtagsWidget.tsx # Sidebar widget for 7-day trending tags
        └── pages/
            └── HashtagFeedPage.tsx # Live hashtag feed (/hashtags/:tag)
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | Standard Drizzle relational tables used |
