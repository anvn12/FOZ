# REST API Contract: Threads Platform — Core MVP

**Base URL**: `http://localhost:3000/api`
**Content-Type**: `application/json` (except image upload: `multipart/form-data`)
**Session**: Managed server-side via `express-session` cookie.

---

## Conventions

- All successful responses return `{ data: <payload> }`.
- All error responses return `{ error: { message: string, code: string } }`.
- Timestamps are ISO 8601 strings.
- IDs are cuid strings.
- Pagination uses cursor-based approach: `?cursor=<lastThreadId>&limit=<n>` (default limit: 20).

---

## Session

### POST /session
Select the active user for this session.

**Request body**:
```json
{ "userId": "string" }
```

**Response 200**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "avatarUrl": "string"
  }
}
```

**Errors**:
- `400 BAD_REQUEST` — userId missing
- `404 NOT_FOUND` — userId does not match any predefined user

---

### GET /session
Get the currently active user.

**Response 200**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "avatarUrl": "string"
  }
}
```

**Errors**:
- `401 NO_SESSION` — no active user selected

---

### DELETE /session
Clear the current session (return to user selection screen).

**Response 200**:
```json
{ "data": { "ok": true } }
```

---

## Users

### GET /users
List all five predefined users.

**Response 200**:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "avatarUrl": "string"
    }
  ]
}
```

---

### GET /users/:id/follow-status
Check whether the active session user follows the target user.
Requires active session.

**Response 200**:
```json
{ "data": { "following": true } }
```

**Errors**:
- `401 NO_SESSION`
- `404 NOT_FOUND`

---

### POST /users/:id/follow
Follow the target user. Requires active session.

**Request body**: empty

**Response 201**:
```json
{ "data": { "ok": true } }
```

**Errors**:
- `401 NO_SESSION`
- `404 NOT_FOUND` — target user not found
- `409 ALREADY_FOLLOWING`

---

### DELETE /users/:id/follow
Unfollow the target user. Requires active session.

**Response 200**:
```json
{ "data": { "ok": true } }
```

**Errors**:
- `401 NO_SESSION`
- `404 NOT_FOLLOWING`

---

## Threads

### GET /threads
Paginated feed of all threads in reverse chronological order.
Optionally includes replies for each thread.

**Query params**:
| Param | Type | Default | Description |
|---|---|---|---|
| cursor | string | — | ID of last thread seen (for next page) |
| limit | int | 20 | Number of threads per page (max 50) |

**Response 200**:
```json
{
  "data": {
    "threads": [
      {
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
        "replies": [
          {
            "id": "string",
            "content": "string",
            "likeCount": 0,
            "createdAt": "ISO8601",
            "author": {
              "id": "string",
              "name": "string",
              "avatarUrl": "string"
            },
            "likedByMe": false
          }
        ],
        "likedByMe": false,
        "followingAuthor": false
      }
    ],
    "nextCursor": "string | null"
  }
}
```

**Notes**:
- `likedByMe` and `followingAuthor` require an active session. If no session,
  both default to `false`.
- Replies are included inline (all replies for the threads on this page).
- `nextCursor` is null when no more threads exist.

---

### POST /threads
Create a new thread. Requires active session.

**Request**: `multipart/form-data`
| Field | Type | Required | Constraints |
|---|---|---|---|
| content | string | Yes* | 1–500 characters |
| image | file | No | JPEG/PNG/GIF/WebP, max 5 MB |

*At least one of `content` (non-empty) or `image` must be present.

**Response 201**:
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
    }
  }
}
```

**Errors**:
- `401 NO_SESSION`
- `400 CONTENT_TOO_LONG` — content exceeds 500 characters
- `400 EMPTY_THREAD` — both content and image absent
- `400 INVALID_IMAGE_TYPE` — unsupported file format
- `400 IMAGE_TOO_LARGE` — file exceeds 5 MB

---

### DELETE /threads/:id
Delete a thread authored by the active user. Cascades to replies and likes.
Requires active session.

**Response 200**:
```json
{ "data": { "ok": true } }
```

**Errors**:
- `401 NO_SESSION`
- `403 NOT_OWNER` — thread belongs to another user
- `404 NOT_FOUND`

---

## Replies

### POST /threads/:threadId/replies
Add a reply to a thread. Requires active session.

**Request body**:
```json
{ "content": "string" }
```

**Response 201**:
```json
{
  "data": {
    "id": "string",
    "threadId": "string",
    "content": "string",
    "likeCount": 0,
    "createdAt": "ISO8601",
    "author": {
      "id": "string",
      "name": "string",
      "avatarUrl": "string"
    }
  }
}
```

**Errors**:
- `401 NO_SESSION`
- `400 CONTENT_REQUIRED`
- `400 CONTENT_TOO_LONG`
- `404 THREAD_NOT_FOUND`

**Side effects**: Thread.replyCount incremented; Socket.io `reply:count-updated` emitted.

---

### DELETE /replies/:id
Delete a reply authored by the active user. Requires active session.

**Response 200**:
```json
{ "data": { "ok": true } }
```

**Errors**:
- `401 NO_SESSION`
- `403 NOT_OWNER`
- `404 NOT_FOUND`

**Side effects**: Thread.replyCount decremented; Socket.io `reply:count-updated` emitted.

---

## Likes

### POST /threads/:id/likes
Like a thread. Self-likes allowed. Requires active session.

**Request body**: empty

**Response 201**:
```json
{ "data": { "likeCount": 5 } }
```

**Errors**:
- `401 NO_SESSION`
- `404 NOT_FOUND`
- `409 ALREADY_LIKED`

**Side effects**: Thread.likeCount incremented; Socket.io `like:updated` emitted.

---

### DELETE /threads/:id/likes
Unlike a thread. Requires active session.

**Response 200**:
```json
{ "data": { "likeCount": 4 } }
```

**Errors**:
- `401 NO_SESSION`
- `404 NOT_LIKED`

**Side effects**: Thread.likeCount decremented; Socket.io `like:updated` emitted.

---

### POST /replies/:id/likes
Like a reply. Requires active session.

**Request body**: empty

**Response 201**:
```json
{ "data": { "likeCount": 2 } }
```

**Errors**:
- `401 NO_SESSION`
- `404 NOT_FOUND`
- `409 ALREADY_LIKED`

**Side effects**: Reply.likeCount incremented; Socket.io `like:updated` emitted.

---

### DELETE /replies/:id/likes
Unlike a reply. Requires active session.

**Response 200**:
```json
{ "data": { "likeCount": 1 } }
```

**Errors**:
- `401 NO_SESSION`
- `404 NOT_LIKED`

**Side effects**: Reply.likeCount decremented; Socket.io `like:updated` emitted.
