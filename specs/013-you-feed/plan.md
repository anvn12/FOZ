# Implementation Plan: You Feed

**Branch**: `013-you-feed` | **Date**: 2026-08-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-you-feed/spec.md`

## Summary

Implement a personalized "For You" feed that ranks posts based on user interaction signals (likes, comments, reposts) and post engagement metrics with recency decay. The existing `listPostFeed` returns all posts chronologically; this feature adds a `GET /api/v1/posts/feed?type=for-you|latest` endpoint with a scoring algorithm, a frontend tab switcher, and graceful degradation to the current chronological feed when personalization fails.

## Technical Context

**Language/Version**: TypeScript ESM, Node.js LTS (`.nvmrc` pinned)

**Primary Dependencies**: Express, Drizzle ORM, PostgreSQL 16, React, @tanstack/react-query, zustand

**Storage**: PostgreSQL 16 via Drizzle — existing `posts`, `reactions`, `comments` tables; no new tables for v1

**Testing**: Vitest — tier-1 unit (scoring function), tier-2 integration (feed endpoint <500ms NFR)

**Target Platform**: Node.js backend, Vite + React frontend (responsive web)

**Project Type**: Web application (client/server per constitution)

**Performance Goals**: Feed endpoint <500ms p95 (constitution NFR for feed integration tests)

**Constraints**: 
- No new npm dependencies (constitution: binding tech stack)
- No new database tables (v1 assumption: existing interactions suffice)
- No AI/NLP — ranking is pure math on interaction counts
- Graceful degradation: personalization failure → chronological fallback, no user-facing error
- Guests always see popularity-based feed (no auth → no personalization)

**Scale/Scope**: ~10k posts expected; real-time scoring at query time is acceptable

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modular Client-Server Architecture | ✅ | Scoring logic in backend service; frontend only consumes API |
| II. Enforced Folder Structure | ✅ | New files go in existing `src/backend/`, `src/frontend/`, `src/shared/` per plan |
| III. Clean Code & Reusability | ✅ | Single scoring function, reused for both personalized and popularity feeds |
| IV. Security at Every Layer | ✅ | `optionalAuth` middleware on feed endpoint; personalization only runs for authenticated users |
| V. Consistency Over Cleverness | ✅ | Uses existing Drizzle query patterns; no novel abstractions |
| VI. AI Service Boundaries | ✅ N/A | No AI features in this spec |
| VII. Accessibility | ✅ | Tab switcher will use semantic HTML, keyboard nav, ARIA labels |
| Quality: 500ms NFR | ✅ | Scoring is in-memory math after a single query; no N+1 loops |
| Quality: Zod validation | ✅ | Query param `type` validated via Zod enum |
| Quality: Centralized error handling | ✅ | Errors propagate to Express error middleware |

## Project Structure

### Documentation (this feature)

```text
specs/013-you-feed/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── backend/
│   ├── api/
│   │   └── posts/
│   │       └── routes.ts           # Modified: add feed query param handling
│   ├── services/
│   │   └── interactions/
│   │       ├── posts.ts            # Modified: add listForYouFeed() function
│   │       └── feed-ranking.ts     # NEW: scoring algorithm (pure function)
│   ├── db/
│   │   └── repositories/
│   │       └── interactions.ts     # Modified: add batch query helpers
│   └── __tests__/
│       ├── unit/
│       │   └── feed-ranking.test.ts    # NEW: scoring function tests
│       └── integration/
│           └── feed.test.ts            # NEW: feed endpoint tests
├── frontend/
│   └── src/
│       ├── api/
│       │   └── interactions.ts     # Modified: add listFeed(type) function
│       ├── pages/
│       │   └── feed/
│       │       └── FeedPage.tsx    # Modified: add tab switcher
│       └── stores/
│           └── feed.ts             # NEW: zustand store for tab preference
└── shared/
    └── schemas/
        └── interactions.ts         # Modified: add feed query schema
```

**Structure Decision**: Existing project structure. All new code lands in established directories per constitution Principle II.

## Complexity Tracking

No constitution violations. No complexity justification needed.
