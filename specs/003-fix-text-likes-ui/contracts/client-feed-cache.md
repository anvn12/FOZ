# Client Feed Cache Contract (v2)

**Replaces**: [002 client-feed-cache.md](../../002-fix-like-post-bugs/contracts/client-cache.md) for query-key rules

**Date**: 2026-06-04

---

## Query key

```typescript
function feedQueryKey(userId: string | undefined): readonly ["feed", string | undefined] {
  return ["feed", userId] as const;
}
```

- Feed query **enabled** only when `userId` is defined.
- All `setQueriesData` / `invalidateQueries` / `removeQueries` for feed MUST use
  this key (or prefix `["feed"]` only when intentionally clearing all users).

---

## Session lifecycle

| Event | Required client action |
|---|---|
| `POST /session` (select user) | Remove or invalidate previous feed queries; fetch with new `userId` |
| `DELETE /session` (sign out) | Remove all `["feed", *]` queries |
| Page load with existing session | `useFeed` runs with session user id from store |

---

## Socket `like:updated`

| Field | Update |
|---|---|
| `likeCount` | Set to payload value |
| `likedByMe` | **Do not change** |

Apply updates only to queries matching current session user’s `feedQueryKey`.

---

## Thread shape

Unchanged from 002: every cached `Thread` must include `replies: []` minimum and
boolean `likedByMe` / `followingAuthor`.
