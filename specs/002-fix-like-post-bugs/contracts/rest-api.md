# REST API Contract Delta: Fix Like & Post Bugs

**Base**: [001-threads-platform/contracts/rest-api.md](../../001-threads-platform/contracts/rest-api.md)

**Date**: 2026-06-04

Only changed or clarified endpoints are documented below. All other endpoints
remain as in MVP.

---

## POST /threads — Response alignment (CHANGED)

**Response 201** MUST return the same thread object shape as a single item in
`GET /threads` `data.threads[]`:

```json
{
  "data": {
    "id": "string",
    "content": "string",
    "imageUrl": "string | null",
    "likeCount": 0,
    "replyCount": 0,
    "createdAt": "ISO8601",
    "author": {
      "id": "string",
      "name": "string",
      "avatarUrl": "string"
    },
    "replies": [],
    "likedByMe": false,
    "followingAuthor": false
  }
}
```

**Notes**:

- `replies` is always an empty array on create.
- `likedByMe` is always `false` for the new thread.
- `followingAuthor` reflects whether the active session user follows the
  thread author (typically `false` when posting as self).

---

## POST /threads/:id/likes — Idempotent behavior (CLARIFIED)

**Preferred behavior** (implementation choice):

| Condition | Status | Body |
|---|---|---|
| Like created | 201 | `{ "data": { "likeCount": number } }` |
| Already liked (duplicate) | 200 | `{ "data": { "likeCount": number } }` — current count, no error |

**Legacy behavior** (current MVP): `409 ALREADY_LIKED` — client MUST reconcile
if server not updated.

---

## DELETE /threads/:id/likes — Idempotent behavior (CLARIFIED)

| Condition | Status | Body |
|---|---|---|
| Like removed | 200 | `{ "data": { "likeCount": number } }` |
| Not liked | 200 | `{ "data": { "likeCount": number } }` — current count |

**Legacy**: `404 NOT_LIKED` — client MUST reconcile to `likedByMe: false`.

---

## POST /replies/:id/likes & DELETE /replies/:id/likes

Same idempotency rules as thread likes.
