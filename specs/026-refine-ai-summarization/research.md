# Research Findings: Refine AI Summarization Test Suite

## Decision 1: Decoupling Comment Sampling into a Pure Function
- **Decision**: Extract the 4:3:3 priority sorting (4 Most Liked, 3 Most Replied, 3 Most Recent) and deduplication algorithm into a pure helper function `sampleCommentsForSummary` in `src/backend/services/post-summary.service.ts` or `src/backend/lib/comment-sampling.ts`.
- **Rationale**: 
  - Allows pure, deterministic, millisecond-fast Tier-1 unit testing with synthetic fixture arrays without mocking or connecting to the PostgreSQL database.
  - The DB repository function `getSampledCommentsForSummary` simply delegates SQL query results (`activeComments`, `likeMap`, `replyMap`) to this pure function.
  - Fixes the flawed test in `comment-sampling-dedup.test.ts` where test code duplicated its own sorting loop instead of calling production logic.
- **Alternatives Considered**:
  - *Testing solely via DB queries*: Slows down unit test runs and mixes SQL syntax validation with algorithmic deduplication checks.
  - *Exporting repository private helpers*: Breaks clean module encapsulation; repositories should handle data access, while pure logic belongs in services/utilities.

## Decision 2: Upstream LLM Mocking and Failover Testing Strategy
- **Decision**: Use Vitest `vi.spyOn(globalThis, 'fetch')` to mock LLM API responses in `ai-summarizer.test.ts`.
- **Rationale**:
  - External network calls to Google Gemini or OpenAI are non-deterministic, cost credits, fail offline, and violate Tier-1 unit test principles.
  - Mocking `fetch` allows verifying:
    1. HTTP 503 or 429 status failover through the model chain (`gemini-2.5-flash` → `gemini-1.5-flash` → `gemini-2.0-flash`).
    2. Graceful fallback to heuristic text summaries when all models fail.
    3. Safe recovery when the LLM returns invalid/malformed JSON strings.
- **Alternatives Considered**:
  - *Mock Service Worker (MSW)*: More complex setup than necessary for simple single-endpoint fetch interception in Vitest.
  - *Skipping LLM tests in test environment*: Leaves provider failover and JSON parsing logic completely untested (the current anti-pattern).

## Decision 3: Guest Access and Authentication Policy
- **Decision**: Strictly require authentication (`requireAuth`) for both `GET /api/v1/posts/:postId/summary` and `POST /api/v1/posts/:postId/summary/refresh`, returning `401 UNAUTHENTICATED` when called without a valid JWT session.
- **Rationale**:
  - Directly enforces Project Constitution Principle VI: *"AI features MUST require authentication; guests MUST NOT trigger AI calls."*
  - Aligns with system security standards and protects costly LLM compute from guest bot abuse.
- **Alternatives Considered**:
  - *Optional authentication allowing guests to read cache*: Creates an edge case where a guest request for an unsummarized post either triggers an unauthorized AI run or returns an awkward partial state. Requiring login is cleaner and constitutionally compliant.

## Decision 4: Rate Limiter Testing Approach
- **Decision**: Test rate limiting in `summary-routes.test.ts` by toggling `process.env.NODE_ENV = "production"` specifically within the rate-limiting test block and restoring `process.env.NODE_ENV = "test"` immediately in cleanup.
- **Rationale**:
  - In `src/backend/lib/rate-limit.ts`, `summaryRateLimiter` is bypassed in `NODE_ENV === "test"` so general test suites are not slowed down.
  - Scoped environment switching verifies that Express returns HTTP 429 `{ error: { code: "RATE_LIMITED", ... } }` after 10 requests/minute without polluting other tests.
- **Alternatives Considered**:
  - *Running all tests under production rate limits*: Causes false test failures and rate-limit cross-contamination between test files.
  - *Mocking the middleware handler with `vi.fn()`*: Only tests that a dummy mock was called, not that Express rate-limiting actually blocks the HTTP request.
