# Implementation Plan: Refine AI Summarization Test Suite

**Branch**: `026-refine-ai-summarization` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/026-refine-ai-summarization/spec.md`

## Summary

This plan refines and expands the AI Summarization test suite (`src/backend/api/posts/__tests__/`) to address gaps identified during document review. It extracts the 4:3:3 comment sampling and deduplication logic into a pure helper function for isolated Tier-1 unit testing, consolidates duplicate fallback tests into `ai-summarizer.test.ts`, tests upstream LLM retry/failover chains using `fetch` mocks, validates strict authentication enforcement (HTTP 401 for guests per Constitution Principle VI), tests cache vs. refresh lifecycles, verifies rate-limiting (HTTP 429), and replaces the repository smoke test with genuine SQL filter and upsert integration tests.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js LTS (ESM)  
**Primary Dependencies**: Express.js, Drizzle ORM, Zod, Supertest  
**Storage**: PostgreSQL 16 (`post_summaries`, `comments`, `reactions` tables via Drizzle)  
**Testing Framework**: Vitest (Tier-1 Unit Tests, Tier-2 Integration Tests)  
**Target Platform**: Node.js Backend API  
**Project Type**: Web Application Backend Test Suite (`src/backend/`)  
**Performance Goals**: Full post-summary test suite executes in <2.0 seconds; 0 flaky tests  
**Constraints**: Project Constitution Principle VI (strict authentication on AI routes), zero external network calls during tests (`fetch` mocked), 100% deduplicated comment sampling  
**Scale/Scope**: 4 refined test files replacing 5 existing test files; branch coverage >90% on summarizer modules  

---

## Constitution Check

*GATE: Passed*

1. **Principle I: Modular Client-Server Architecture**: Contracts and DTOs live in `src/shared/schemas/post-summary.ts`. No hand-mirrored types.
2. **Principle II: Enforced Folder Structure**: Tests live in `src/backend/api/posts/__tests__/`. Decoupled sampling utility lives in `src/backend/services/post-summary.service.ts`.
3. **Principle III: Clean Code & Reusability**: Redundant test file (`post-summary-fallbacks.test.ts`) deleted; duplicate assertions removed. Pure logic separated from DB operations.
4. **Principle IV: Security at Every Layer**: Both `GET /summary` and `POST /summary/refresh` enforce `requireAuth` (401 for guests); rate limiting tested under production config (429).
5. **Principle VI: AI Service Boundaries**: Swappable provider interface with fallback chain verified; failure degrades gracefully to heuristic summary without throwing unhandled 500 errors.

---

## Project Structure

### Documentation (this feature)

```text
specs/026-refine-ai-summarization/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this document)
├── research.md          # Technical research & architectural decisions
├── data-model.md        # Entities, DTOs & test fixtures
├── quickstart.md        # How to run and verify tests
├── contracts/           # API request/response specifications
│   └── post-summary-api.yaml
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code & Test Files (repository root)

```text
src/backend/
├── api/
│   └── posts/
│       ├── routes.ts                              # Enforce requireAuth on summary routes
│       └── __tests__/
│           ├── ai-summarizer.test.ts              # Unit: fallback chain, mock LLM, malformed JSON, truncation
│           ├── comment-sampling-dedup.test.ts     # Unit: pure 4:3:3 sampling algorithm & deduplication
│           ├── post-summary-repository.test.ts    # Integration: DB query filters (deleted/hidden) & upsert
│           ├── summary-routes.test.ts             # Integration: 200 OK, cached, 401 unauth, 404, 429 rate limit
│           └── post-summary-fallbacks.test.ts     # [DELETE - merged into ai-summarizer.test.ts]
├── services/
│   ├── ai-summarizer.ts                           # AI summarizer provider with fallback chain
│   └── post-summary.service.ts                    # Extracted pure sampleCommentsForSummary utility
└── db/
    └── repositories/
        └── post-summary.repository.ts             # Delegates sampled comments to pure helper
```

**Structure Decision**: Refactor existing backend files in-place and consolidate test files without creating redundant directories.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | Fully complies with FOZ Constitution |
