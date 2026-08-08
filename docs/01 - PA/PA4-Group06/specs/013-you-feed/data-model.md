# Data Model: You Feed

**Feature**: 013-you-feed | **Date**: 2026-08-02

## Entities Used (No New Tables)

All entities are existing; no schema changes required.

### Post (existing)
- **Table**: `posts`
- **Used fields**: `id`, `authorId`, `content`, `repostOfId`, `visibilityState`, `lifecycleState`, `deletedAt`, `createdAt`
- **Feed relevance**: Primary entity being ranked

### Reaction (existing)
- **Table**: `reactions`
- **Used fields**: `userAccountId`, `targetType`, `targetId`, `reactionKind`
- **Feed relevance**: 
  - Engagement signal: count per post → `likeCount`
  - Affinity signal: viewer's reactions to post author's content

### Comment (existing)
- **Table**: `comments`
- **Used fields**: `id`, `postId`, `authorId`, `visibilityState`, `lifecycleState`, `deletedAt`
- **Feed relevance**:
  - Engagement signal: count per post → `commentCount`
  - Affinity signal: viewer's comments on post author's content

### User Account (existing)
- **Table**: `userAccounts`
- **Used fields**: `id`
- **Feed relevance**: Viewer identity for affinity calculation

## Computed Values (Not Persisted)

### Feed Ranking Score
```
score = (affinity * 0.5) + (engagement * 0.3) + (recency * 0.2)

affinity = Σ(viewer_interactions_with_author) across all posts by that author
engagement = likeCount + commentCount + repostCount
recency = 1 / (1 + hoursSincePost / 48)
```

### Feed Response Shape
```typescript
{
  items: PostWithScore[];
  nextCursor: string | null;  // createdAt of last item, null if no more
}

type PostWithScore = PostResponse & {
  likeCount: number;
  commentCount: number;
  liked: boolean;
  reposted: boolean;
  score: number;  // ranking score (debug visibility optional)
}
```

## Data Flow

```
GET /api/v1/posts?type=for-you
  ↓
optionalAuth middleware → extracts viewerId if authenticated
  ↓
listForYouFeed(viewerId, authorId?, cursor?, limit?)
  ↓
┌─ Fetch candidate posts + engagement counts (single query)
├─ If viewerId: batch-fetch viewer's interaction history (single query)
└─ Score in-memory, sort, paginate
  ↓
Return { items, nextCursor }
```

## Filters Applied

- `visibilityState = 'public'`
- `lifecycleState = 'active'`
- `deletedAt IS NULL`
- Suspended/banned authors excluded (join on user status)
