# Data Model: Fix Like Button Inconsistency and Post Error Screen

**Phase**: 1 | **Date**: 2026-06-04 | **Plan**: [plan.md](./plan.md)

No Prisma schema changes required. This document records **invariants** the
fix must preserve and **DTO alignment** between write and read paths.

---

## Entities (unchanged schema)

### Like

| Field | Notes |
|---|---|
| userId + threadId | Unique pair (`@@unique([userId, threadId])`) |
| userId + replyId | Unique pair (`@@unique([userId, replyId])`) |

**Invariant (FR / spec)**: Duplicate like for same user+target MUST NOT break
the client. Preferred behaviors (pick one in implementation):

1. Server returns `200` with current `likeCount` (idempotent), or
2. Server returns `409` and client reconciles to `likedByMe: true`.

**State transition**:

```text
not liked --[POST like]--> liked
liked     --[DELETE unlike]--> not liked
```

Invalid: POST when already liked → must not leave UI showing “not liked”.
Invalid: DELETE when not liked → must not leave UI showing “liked”.

### Thread (API DTO)

Feed and cache consumers require this **full** shape:

| Field | Type | Required in cache |
|---|---|---|
| id | string | yes |
| content | string | yes |
| imageUrl | string \| null | yes |
| likeCount | number | yes |
| replyCount | number | yes |
| createdAt | ISO string | yes |
| author | User | yes |
| replies | Reply[] | yes (empty array if none) |
| likedByMe | boolean | yes |
| followingAuthor | boolean | yes |

**Invariant**: Any code path that inserts a thread into the feed cache MUST
supply `replies: []` at minimum. `undefined` is forbidden.

### Reply (API DTO)

Unchanged from MVP. Nested under `Thread.replies`.

---

## Validation rules (behavioral)

| Rule | Layer |
|---|---|
| POST thread response matches feed thread DTO | server `createThread` + client normalize |
| `replies` defaults to `[]` when missing | client `ReplyList` + normalize helper |
| Like toggle updates `likedByMe` and `likeCount` atomically in cache | client `useLike` |
| Socket `like:updated` MUST NOT clear `likedByMe` for active user’s own action | client `useSocketFeedSync` (verify spread preserves fields) |

---

## Relationships

Unchanged from [001-threads-platform/data-model.md](../001-threads-platform/data-model.md).
