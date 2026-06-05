# Data Model: Fix Thread Text Overflow, Per-User Likes, and Like Count Display

**Phase**: 1 | **Date**: 2026-06-04

No database migration. Documents **client cache** and **presentation** invariants.

---

## Server (unchanged)

| Concept | Scope | Source |
|---|---|---|
| Like record | One per (`userId`, `threadId`) or (`userId`, `replyId`) | Prisma `Like` |
| `likeCount` on Thread/Reply | Aggregate all users | Denormalized counter |
| `likedByMe` in feed API | Current session `userId` only | `threadService.getPaginatedFeed` |

---

## Client feed cache

| Field | Scope | Rule |
|---|---|---|
| Query key | Per `activeUser.id` | `["feed", userId]` — never `["feed"]` alone |
| `likedByMe` in cached threads | Same as query key user | Must reset when user changes |
| `likeCount` in cached threads | Global aggregate | May update via API response or socket |

**Session transition**:

```text
selectUser(B) → remove/invalidate all ["feed", *] → fetch ["feed", B]
clearSession  → remove all ["feed", *]
```

---

## UI presentation

| Element | Required classes / layout |
|---|---|
| Thread body | pre-wrap + word break within card width |
| Reply body | same as thread body |
| Flex text column | `min-w-0` to allow wrapping in flex row |

---

## Like toggle reconcile

| Step | `likeCount` | `likedByMe` |
|---|---|---|
| Optimistic (optional) | ±1 from prior display | flipped |
| Server success | `serverCount` | true (like) / false (unlike) |
| Idempotent already liked | `serverCount` | true (no false −1 revert) |
| Error rollback | pre-click values | pre-click values |

Socket `like:updated`: update `likeCount` only; never mutate `likedByMe`.
