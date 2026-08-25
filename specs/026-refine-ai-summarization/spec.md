# Feature Specification: Refine AI Summarization Test Suite

**Feature Branch**: `026-refine-ai-summarization`

**Created**: 2026-08-22

**Status**: Ready for Review

**Input**: User description: "refine the test cases for AI summarization based on my refine document @[d:\FOZ\docs\01 - PA\PA5-Group06\Review test case\AI summarization.md] @[d:\FOZ\src\backend\api\posts\__tests__]"

## Clarifications

### Session 2026-08-22
- Q: How should the comment sampling algorithm be structured to enable direct, isolated unit testing? → A: Option A - Extract the 4:3:3 sorting and deduplication logic into a pure service/utility function for pure Tier-1 unit testing, and test SQL queries separately in repository integration tests.
- Q: How should the API and tests enforce access control for guest (unauthenticated) users on the summary endpoints? → A: Strictly require authentication for all summary endpoints (return 401 UNAUTHENTICATED for any guest request).
- Q: How should the test suite verify the 429 RATE_LIMITED protection without slowing down the test runner? → A: Temporarily change process.env.NODE_ENV during the route test to trigger the real production limiter (10 requests/min).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI Summarizer Fallback & Resilience Verification (Priority: P1)

As a developer and system maintainer, I want automated unit tests to thoroughly verify the AI Summarizer provider's structured output generation, heuristic fallback rules, and upstream error recovery (e.g., timeouts, 503s, malformed JSON), so that the summarization service never crashes or throws unhandled exceptions during runtime.

**Why this priority**: Core service reliability. The AI summarizer handles untrusted third-party LLM responses and must degrade gracefully to heuristic rule-based summaries under all failure conditions without affecting user experience.

**Independent Test**: Can be tested independently via unit test runner by invoking the summarizer with various post/comment payloads, simulating upstream API failures and corrupted responses, and asserting exact structured output schemas.

**Acceptance Scenarios**:

1. **Given** standard post content and valid comments, **When** generating a summary, **Then** the service returns a valid structured summary containing `postSnapshot`, `keyHighlights` (array of strings), and `sentiment`.
2. **Given** a post with an empty comment list (`comments: []`), **When** generating a summary, **Then** the fallback returns exact placeholder highlights (`["No community comments provided yet."]`) and neutral sentiment (`"Neutral"`).
3. **Given** upstream AI API failure (503 Service Unavailable, timeout, or rate limit), **When** generating a summary, **Then** the provider catches the error and falls back seamlessly to rule-based heuristic extraction without throwing an unhandled error.
4. **Given** an LLM output returning malformed or invalid JSON, **When** parsing the response, **Then** the service catches the syntax error and safely provides a readable fallback summary.
5. **Given** lengthy post bodies (>150 characters) or comment bodies (>100 characters) in heuristic fallback mode, **When** formatting output, **Then** the texts are safely truncated with ellipsis (`...`).

---

### User Story 2 - Pure 4:3:3 Comment Sampling & Deduplication Verification (Priority: P1)

As a developer, I want isolated unit tests to verify the comment sampling algorithm against actual production logic to guarantee that selected comments strictly follow the 4:3:3 ratio (4 Most Liked, 3 Most Replied, 3 Most Recent) and eliminate all duplicate comment selections.

**Why this priority**: Algorithmic correctness. The existing test re-implemented sorting loops locally instead of testing production code. Testing the production algorithm ensures unbiased and deterministic comment selection.

**Independent Test**: Can be tested by feeding synthetic comment batches with varying likes, reply counts, and timestamps into the sampling function and asserting that exactly 10 unique comment IDs matching the distribution are returned.

**Acceptance Scenarios**:

1. **Given** a thread with more than 10 comments where top-liked comments are also top-replied, **When** sampling comments, **Then** the algorithm deduplicates candidates and selects exactly 10 distinct comment IDs according to the 4:3:3 priority buckets.
2. **Given** a thread with 0 engagement (0 likes and 0 replies across all comments), **When** sampling comments, **Then** the algorithm falls back gracefully to timestamp order (newest comments first) without crashing.
3. **Given** a thread with fewer than 10 comments (e.g., 2 or 3 comments), **When** sampling comments, **Then** the algorithm returns all available comments without index out-of-bounds or formatting errors.

---

### User Story 3 - API Endpoint & Caching Lifecycle Verification (Priority: P2)

As a QA engineer, I want integration tests for `GET /api/v1/posts/:postId/summary` and `POST /api/v1/posts/:postId/summary/refresh` to verify HTTP status codes, caching headers/payloads, and rate limiting enforcement.

**Why this priority**: API contract and performance guarantee. Verifies that clients receive standard JSON envelopes, that repeated requests utilize cached records, and that abusive traffic is throttled.

**Independent Test**: Can be tested via supertest HTTP assertions against the Express application testing 200 OK, cached responses, 404 NOT_FOUND, and 429 RATE_LIMITED.

**Acceptance Scenarios**:

1. **Given** an authenticated user and an existing post with comments, **When** requesting `GET /api/v1/posts/:postId/summary` for the first time, **Then** the API returns HTTP 200 with `{ success: true, cached: false, summary: { ... } }`.
2. **Given** an authenticated user and an existing generated summary, **When** requesting `GET /api/v1/posts/:postId/summary` a second time, **Then** the API returns HTTP 200 with `cached: true` immediately from storage.
3. **Given** an authenticated user and an existing post, **When** sending `POST /api/v1/posts/:postId/summary/refresh`, **Then** the API regenerates the summary and returns HTTP 200 with `cached: false` and updated timestamp.
4. **Given** a non-existent post ID, **When** an authenticated user requests summary generation or refresh, **Then** the API returns HTTP 404 with structured error envelope `{ error: { code: "NOT_FOUND", message: "Post not found" } }`.
5. **Given** excessive rapid summary requests exceeding the threshold, **When** requesting summaries, **Then** the server blocks requests with HTTP 429 Too Many Requests.
6. **Given** an unauthenticated (guest) user, **When** requesting `GET /api/v1/posts/:postId/summary` or `POST /api/v1/posts/:postId/summary/refresh`, **Then** the API returns HTTP 401 with `{ error: { code: "UNAUTHENTICATED", message: "Authentication required" } }`.

---

### User Story 4 - Repository Data Persistence & Moderation Filter Verification (Priority: P2)

As a backend engineer, I want repository integration tests to verify database query filters, ensuring deleted and hidden comments are excluded from sampling, and confirming upsert lifecycle persistence.

**Why this priority**: Data integrity and moderation compliance. Tests previously only checked `typeof === 'function'`, leaving critical SQL predicates and upsert mutations untested.

**Independent Test**: Can be tested by running repository queries against test database fixtures with mixed public, soft-deleted, and hidden comments.

**Acceptance Scenarios**:

1. **Given** a post containing active public comments, soft-deleted comments (`deletedAt != null`), and hidden comments (`visibilityState = 'hidden'`), **When** querying sampled comments for summary, **Then** only active, public comments are returned in the sample pool.
2. **Given** a new summary to persist, **When** saving via repository upsert, **Then** a new record is inserted into the database.
3. **Given** an already existing summary record for a post, **When** saving a refreshed summary, **Then** the existing record is updated in-place with new content and updated timestamp rather than creating duplicate rows.

---

### Edge Cases

- **Upstream AI Outage / Network Timeout**: Provider automatically steps through fallback model chain before falling back to local heuristic text summary.
- **Corrupted / Partial JSON LLM Output**: JSON parse errors are caught gracefully, logging a warning and returning readable heuristic output.
- **Empty Post Body & No Comments**: Handled with clean default descriptive text without runtime exceptions.
- **Zero Likes / Zero Replies on High Volume Thread**: Sampling defaults smoothly to newest comments without division-by-zero or undefined map lookups.
- **Thread with 100% Moderated/Hidden Comments**: Handled equivalently to a 0-comment thread, generating post-only summary.
- **Unauthenticated (Guest) Requests**: Handled with immediate 401 UNAUTHENTICATED error without querying DB or invoking AI summarizer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Test suite MUST eliminate duplicated test files and redundant test cases between `ai-summarizer.test.ts` and `post-summary-fallbacks.test.ts`.
- **FR-002**: Test suite MUST validate structured summary output (`postSnapshot`, `keyHighlights`, `sentiment`) with exact expected values for deterministic fallback cases.
- **FR-003**: Test suite MUST mock upstream AI network calls to test model fallback retry chains and JSON parse error handling without external network dependencies.
- **FR-004**: Test suite MUST import and execute the real production comment sampling algorithm directly (via an extracted pure sampling unit) to verify the 4:3:3 priority ratio and 100% uniqueness.
- **FR-005**: Test suite MUST verify sampling boundary conditions including 0 engagement threads and threads with fewer than 10 comments.
- **FR-006**: Test suite MUST test HTTP endpoints for full response envelope assertions on both success (200 OK, `cached: false` vs `cached: true`) and error paths (401 UNAUTHENTICATED for guests, 404 NOT_FOUND, 400 BAD_REQUEST).
- **FR-007**: Test suite MUST verify rate limiting protection on summary endpoints by temporarily enabling production rate limiting in the test context to trigger HTTP 429 after 10 requests/minute.
- **FR-008**: Test suite MUST test database repository operations against real or properly stubbed database queries, verifying SQL filter exclusion for deleted (`deletedAt IS NOT NULL`) and hidden (`visibilityState != 'public'`) comments.
- **FR-009**: Test suite MUST test upsert persistence behavior, ensuring idempotent updates for refreshed summaries.
- **FR-010**: All test case titles MUST follow clear, descriptive behavioral specifications adhering to BDD standards.

### Key Entities

- **Post Summary Output**: Structured summary object containing `postSnapshot` (string), `keyHighlights` (array of strings), and `sentiment` (string).
- **Sampled Comment Pool**: Array of up to 10 unique comment objects `{ id: string, body: string }` chosen via 4:3:3 priority rule.
- **Summary API Response**: Standard JSON envelope `{ success: boolean, cached: boolean, summary: PostSummary }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of redundant test cases and obsolete smoke tests (`typeof === 'function'`) are replaced with substantive unit and integration tests.
- **SC-002**: 100% of the AI Summarizer, Comment Sampling, Summary Service, and Summary Route test cases pass with zero flaky failures.
- **SC-003**: Automated test suite execution finishes within 2 seconds across all post-summary test files.
- **SC-004**: Code branch coverage for post summary services and sampling algorithms exceeds 90%.

## Assumptions

- **A-001**: Vitest is used as the test runner in accordance with the project constitution.
- **A-002**: External LLM API calls are intercepted using standard test spies/mocks (`vi.spyOn(globalThis, 'fetch')`) to ensure deterministic offline test runs.
- **A-003**: Database repository tests run using the project's established test database or mocked query layer without modifying production records.
- **A-004**: In accordance with Project Constitution Principle VI, summary generation and viewing strictly require authentication (`requireAuth`); unauthenticated requests receive 401 UNAUTHENTICATED.
- **A-005**: Rate limiting is tested by toggling `process.env.NODE_ENV = "production"` specifically within the rate limiting test block and restoring it to `"test"` in cleanup (`afterEach`/`afterAll`).
