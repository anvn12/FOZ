# Quickstart: You Feed

**Feature**: 013-you-feed | **Date**: 2026-08-02

## Prerequisites

1. Docker running with PostgreSQL container:
   ```bash
   docker compose up -d db
   ```

2. Environment configured:
   ```bash
   cp .env.example .env
   # Ensure DATABASE_URL points to foz_dev
   ```

3. Migrations applied:
   ```bash
   npx drizzle-kit migrate
   ```

## Running the Feature

### Backend

```bash
# From repo root
npm run dev:backend
# or
npx tsx --import tsconfig-paths/register src/backend/index.ts
```

### Frontend

```bash
npm run dev:frontend
# or
cd src/frontend && npm run dev
```

### Tests

```bash
# Unit tests (scoring function)
npx vitest run src/backend/__tests__/unit/feed-ranking.test.ts

# Integration tests (feed endpoint)
npx vitest run src/backend/__tests__/integration/feed.test.ts

# All tests
npx vitest run
```

## Manual Testing

1. **Create test data**:
   - Register 3 users (A, B, C)
   - User A creates 5 posts
   - User B likes 3 of A's posts, comments on 2
   - User C has no interactions

2. **Test personalized feed** (as User B):
   ```
   GET /api/v1/posts?type=for-you
   ```
   - A's posts should rank highest (affinity)

3. **Test cold start** (as User C):
   ```
   GET /api/v1/posts?type=for-you
   ```
   - Posts ranked by engagement (popularity fallback)

4. **Test chronological**:
   ```
   GET /api/v1/posts?type=latest
   ```
   - Posts in reverse chronological order regardless of user

5. **Test guest**:
   ```
   GET /api/v1/posts?type=for-you
   ```
   - No auth header → popularity feed

## Verifying 500ms NFR

```bash
# Load test with 1000 posts
npx vitest run src/backend/__tests__/integration/feed.test.ts --reporter=verbose
# Check that the performance test asserts < 500ms
```
