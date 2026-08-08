# Implementation Plan: Post Summarize (TL;DR)

**Branch**: `011-post-summarize` | **Date**: 2026-07-31 | **Spec**: [spec.md](file:///d:/FOZ/specs/011-post-summarize/spec.md)

**Input**: Feature specification from `/specs/011-post-summarize/spec.md`

## Summary

The Post Summarize (TL;DR) feature generates on-demand AI overviews of long discussion posts and key community comments. It samples up to 10 representative comments per thread using a balanced 4:3:3 ratio (4 Most Liked, 3 Most Replied by 1st-level direct child count, 3 Most Recent) with deduplication. Summaries are cached in PostgreSQL via Drizzle ORM to allow instant sub-300ms retrieval on repeated views, and can be manually refreshed by users on demand.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js LTS (ESM)  
**Primary Dependencies**: Express.js, Zod, Drizzle ORM, TanStack Query (React Query)  
**Storage**: PostgreSQL 16 (`post_summaries` table via Drizzle)  
**Testing**: Vitest (Tier-1 repository & unit tests, Tier-2 API route integration tests)  
**Target Platform**: Web application (Desktop & Mobile web browsers)  
**Project Type**: Full-stack Web Application (`src/frontend/`, `src/backend/`, `src/shared/`)  
**Performance Goals**: On-demand summary generation < 3s; cached summary load < 300ms  
**Constraints**: FOZ Constitution Principle VI (AI Service Isolation), rate-limited endpoints, graceful degradation if AI service is unavailable  
**Scale/Scope**: Threads up to 1,000+ comments; comment sample capped at 10 unique items per post  

---

## Constitution Check

*GATE: Passed*

1. **Principle I: Modular Client-Server Architecture**: Shared Zod schemas in `src/shared/schemas/post-summary.ts` are the single source of truth for DTOs and API envelopes. No duplication across frontend/backend.
2. **Principle II: Enforced Folder Structure**: Core logic sits in `src/backend/services/ai-summarizer.ts`, `src/backend/db/repositories/post-summary.repository.ts`, `src/backend/api/posts/summary.routes.ts`, and `src/frontend/components/PostSummaryCard.tsx`.
3. **Principle III: Clean Code & Reusability**: Backend errors handled centrally via Express error middleware; UI gracefully handles failures via toast notifications without breaking post rendering.
4. **Principle IV: Security at Every Layer**: Rate limiting applied to summary endpoints; input validated via Zod schemas at API boundary `/api/v1/posts/:postId/summary`.
5. **Principle VI: AI Service Boundaries**: AI summarizer decoupled behind `AISummarizerProvider` interface. Swappable LLM provider; AI failure degrades gracefully without breaking post view.

---

## Project Structure

### Documentation (this feature)

```text
specs/011-post-summarize/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── post-summary-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── schemas/
│       └── post-summary.ts         # Shared Zod DTO schemas
├── backend/
│   ├── db/
│   │   ├── schema/
│   │   │   └── interactions.ts     # Added post_summaries Drizzle table definition
│   │   └── repositories/
│   │       └── post-summary.repository.ts # Comment sampling (4:3:3) & DB operations
│   ├── services/
│   │   └── ai-summarizer.ts        # AI provider interface & REST client call
│   └── api/
│       └── posts/
│           └── summary.routes.ts   # Express routes (/api/v1/posts/:postId/summary)
└── frontend/
    └── components/
        └── PostSummaryCard.tsx     # React component for TL;DR summary display
```

**Structure Decision**: Standard 3-tier architecture conforming to FOZ Constitution layout (`src/frontend`, `src/backend`, `src/shared`).

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | Fully complies with FOZ Constitution |
