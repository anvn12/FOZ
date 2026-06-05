# Client Feed Cache Contract

**Applies to**: TanStack Query infinite query `["feed"]`

**Date**: 2026-06-04

---

## Cache shape

```typescript
{
  pages: FeedPage[];      // { threads: Thread[]; nextCursor: string | null }
  pageParams: unknown[];
}
```

## Thread invariant

Every `Thread` in `pages[*].threads[*]` MUST satisfy:

```typescript
{
  replies: Reply[];           // never undefined
  likedByMe: boolean;         // never undefined
  followingAuthor: boolean;   // never undefined
}
```

## Write operations

| Operation | Handler | Rule |
|---|---|---|
| Create thread | `FeedPage.onThreadCreated` | Normalize before prepend to `pages[0].threads` |
| Toggle like | `useLike.updateCaches` | Update matching thread or nested reply; set both `likeCount` and `likedByMe` |
| Socket like | `useSocketFeedSync` | Update `likeCount` only; MUST NOT remove `likedByMe` |
| Append reply | `FeedList.appendReply` | Set `likedByMe: false` on new reply |

## Helper

`normalizeThreadForFeed(partial, options?)` is the single entry point for
partial → full `Thread` conversion.

---

## Error handling

| Scenario | Behavior |
|---|---|
| API error on like | Roll back optimistic update; optional inline message |
| API error on post | Keep compose form; inline error in `ThreadCompose` |
| Render error | ErrorBoundary (unexpected only) |
