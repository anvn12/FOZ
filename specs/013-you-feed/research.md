# Research: You Feed

**Feature**: 013-you-feed | **Date**: 2026-08-02

## R1: Feed Ranking Algorithm

**Decision**: Weighted scoring formula with interaction affinity, engagement, and recency decay.

**Rationale**: 
- Simple, deterministic, no external dependencies
- Runs in-memory after fetching candidate posts — no complex SQL joins
- Tunable weights allow iteration without schema changes

**Formula**:
```
score = (affinity * W_AFFINITY) + (engagement * W_ENGAGEMENT) + (recency * W_RECENCY)

Where:
- affinity = count of viewer's interactions with post author (likes + comments + reposts)
- engagement = total likes + total comments + total reposts on the post
- recency = 1 / (1 + hours_since_post / HALF_LIFE_HOURS)
- W_AFFINITY = 0.5, W_ENGAGEMENT = 0.3, W_RECENCY = 0.2
- HALF_LIFE_HOURS = 48 (post loses half relevance every 2 days)
```

**Cold start**: If viewer has zero interactions, affinity = 0 for all posts → score = engagement * 0.5 + recency * 0.5 (popularity-based).

**Alternatives considered**:
- **Cosine similarity on content vectors**: Rejected — requires NLP/embedding service, violates "no AI for v1" assumption.
- **Collaborative filtering**: Rejected — requires user-item matrix, too complex for <10k posts.
- **Pre-computed feed cache**: Rejected — adds background job infrastructure; real-time scoring is fast enough at current scale.

## R2: Query Strategy

**Decision**: Single query to fetch candidate posts with engagement counts, then score in-memory.

**Rationale**:
- Avoids N+1 problem (current `listPostFeed` has this — each post triggers separate count queries)
- Drizzle supports aggregate subqueries via `sql` template literals
- Keeps the 500ms NFR achievable

**Query approach**:
1. Fetch all active, public posts (not deleted, not hidden) with:
   - LEFT JOIN on reactions → `likeCount`
   - LEFT JOIN on comments → `commentCount`
   - Include `repostOfId` handling as current code does
2. If viewer is authenticated, batch-fetch their reaction/comment history in one query
3. Score all posts in-memory, sort, return top N with offset pagination

**Alternatives considered**:
- **Database-side scoring (SQL CASE expressions)**: Viable but harder to tune weights; rejected for v1 simplicity.
- **Cursor-based pagination**: Adopted — `createdAt` cursor for stable pagination; offset for simplicity in v1.

## R3: Frontend Tab Persistence

**Decision**: Zustand store with `persist` middleware (localStorage).

**Rationale**:
- Already using zustand for auth state (constitution-approved pattern)
- localStorage survives page refresh, no server call needed
- Trivial to implement: one store, one field

**Alternatives considered**:
- **URL query param (`?feed=for-you`)**: Rejected — pollutes URL, harder to share/bookmark.
- **Server-side preference**: Rejected — adds API endpoint and DB column for a single boolean.

## R4: Feed Type Routing

**Decision**: Add `type` query param to existing `GET /api/v1/posts` endpoint.

**Rationale**:
- Extends the existing endpoint rather than creating a new one
- `type=latest` (default) preserves backward compatibility
- `type=for-you` triggers personalized ranking

**Alternatives considered**:
- **Separate endpoint `/api/v1/posts/for-you`**: Rejected — duplicates route logic; query param is simpler.
- **Header-based routing**: Rejected — non-standard, harder to test.
