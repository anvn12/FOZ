# Contract: Like Uniqueness (MS SQL Server)

**Date**: 2026-06-04

## Persistence rules

| Action | Precondition | Postcondition |
|---|---|---|
| Like thread T as user U | No row with U+T | Row exists; `thread.likeCount` +1 |
| Like reply R as user U | No row with U+R | Row exists; `reply.likeCount` +1 |
| Like thread T2 after T1 as U | T1 like exists | **Both** rows exist (regression fix) |
| Duplicate like | Row exists | Idempotent: return current count, no duplicate row |

## Database constraints

- **MUST NOT** use unfiltered `UNIQUE(userId, replyId)` when `replyId` is NULL
  for thread likes on MS SQL Server.
- **MUST** enforce per-target uniqueness via filtered indexes or equivalent.

## API behavior (unchanged surface)

| Endpoint | Success body |
|---|---|
| `POST .../likes` | `{ data: { likeCount: number } }` — incremented on new like |
| `DELETE .../likes` | `{ data: { likeCount: number } }` — decremented on unlike |

After fix: second `POST` on different thread **MUST** increment that thread's
`likeCount` and persist `likedByMe` for session user on feed refresh.
