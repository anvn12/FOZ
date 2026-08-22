# Quickstart Guide: AI Summarization Test Suite

This guide explains how to run, debug, and verify the refined AI Summarization test suite in Vitest.

---

## 1. Running the AI Summarization Test Suite

Execute all post-summary test files using Vitest:

```bash
npm run test -- src/backend/api/posts/__tests__/
```

Or run individual test files:

```bash
# 1. AI Summarizer & Fallback Chain Unit Tests
npm run test -- src/backend/api/posts/__tests__/ai-summarizer.test.ts

# 2. Pure Comment Sampling & Deduplication Unit Tests
npm run test -- src/backend/api/posts/__tests__/comment-sampling-dedup.test.ts

# 3. API Summary Routes Integration Tests
npm run test -- src/backend/api/posts/__tests__/summary-routes.test.ts

# 4. Post Summary Repository DB Integration Tests
npm run test -- src/backend/api/posts/__tests__/post-summary-repository.test.ts
```

---

## 2. Test File Breakdown

| Test File | Test Type | What It Validates |
| :--- | :--- | :--- |
| [`ai-summarizer.test.ts`](file:///d:/FOZ/src/backend/api/posts/__tests__/ai-summarizer.test.ts) | Pure Unit | LLM structured outputs, retry chain failover on 503/timeout, malformed JSON recovery, text truncation (150/100 chars), and empty comments fallback. |
| [`comment-sampling-dedup.test.ts`](file:///d:/FOZ/src/backend/api/posts/__tests__/comment-sampling-dedup.test.ts) | Pure Unit | Pure `sampleCommentsForSummary` utility: 4:3:3 priority ratio, deduplication across like/reply buckets, 0 engagement handling, and <10 comments threads. |
| [`summary-routes.test.ts`](file:///d:/FOZ/src/backend/api/posts/__tests__/summary-routes.test.ts) | API Integration | `GET` and `POST /refresh` endpoints: HTTP 200 OK, `cached: false` vs `cached: true`, 401 UNAUTHENTICATED for guests, 404 NOT_FOUND, and HTTP 429 rate limiting. |
| [`post-summary-repository.test.ts`](file:///d:/FOZ/src/backend/api/posts/__tests__/post-summary-repository.test.ts) | DB Integration | SQL filters: exclusion of soft-deleted (`deletedAt != null`) and hidden (`visibilityState = 'hidden'`) comments; upsert persistence (insert vs update). |

---

## 3. Coverage Verification

Check code coverage across all post summary modules:

```bash
npm run test:coverage -- src/backend/services/ai-summarizer.ts src/backend/services/post-summary.service.ts src/backend/db/repositories/post-summary.repository.ts
```

Target: >90% branch and statement coverage with zero external network dependencies.
