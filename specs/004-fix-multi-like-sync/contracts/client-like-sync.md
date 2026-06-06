# Contract: Client Like Count Sync

**Date**: 2026-06-04

## Sources of truth (priority)

1. Feed refresh / `GET /threads` — authoritative for `likedByMe` + `likeCount`
2. Like API response — authoritative after successful toggle
3. Optimistic update — temporary until (2) arrives
4. Socket `like:updated` — aggregate count hint; **must not** clear `likedByMe`

## Monotonic merge rule

When updating cache for target X:

```text
if likedByMe === true for X:
  likeCount = max(currentLikeCount, incomingLikeCount)
else:
  likeCount = incomingLikeCount  // from API or socket
```

## Socket handler

| Field | Update |
|---|---|
| `likeCount` | Apply merge rule above |
| `likedByMe` | Never modified by socket |

## Pending toggle (optional)

While `useLike` has `targetId` in pending set, socket events for that target
may be ignored or merged with monotonic rule.

## Multi-like session

Liking targets A, B, C in sequence:

- After each action, A and B remain `likedByMe: true` when liking C.
- Counts for A/B unchanged unless unlike or external socket increment.
