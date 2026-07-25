# User Interactions API Contract

All routes are mounted under `/api/v1` via the shared API router.

The interaction feature uses three route groups:

- `/api/v1/posts` for post creation, listing, deletion, and post reactions
- `/api/v1/posts/:postId/comments` for comment creation and thread retrieval
- `/api/v1/comments/:commentId` for comment edits and deletions

## `POST /api/v1/posts`

Create a new text post.

- **Auth**: Required.
- **Request body** (`CreatePostRequest`):
  - `body: string` — required, non-empty after trimming
- **201 Created** body (`PostResponse`):
  - `id: string`
  - `authorId: string`
  - `body: string`
  - `createdAt: string`
  - `visibilityState: "public" | "hidden"`
  - `lifecycleState: string`
  - `likeCount: number`
- **Errors**:
  - `401 Unauthorized` — guest user or invalid session
  - `422 Unprocessable Entity` — empty or invalid body text

## `DELETE /api/v1/posts/:postId`

Delete a post owned by the current user.

- **Auth**: Required.
- **Request parameters**:
  - `postId: string`
- **200 OK** body:
  - `{ ok: true }`
- **Errors**:
  - `401 Unauthorized` — guest user or invalid session
  - `403 Forbidden` — user does not own the post
  - `404 Not Found` — post does not exist

## `POST /api/v1/posts/:postId/comments`

Create a comment or reply on a post.

- **Auth**: Required.
- **Request body** (`CreateCommentRequest`):
  - `body: string` — required, non-empty after trimming
  - `parentCommentId?: string` — optional reply target; when present it must belong to the same post
- **201 Created** body (`CommentResponse`):
  - `id: string`
  - `postId: string`
  - `parentCommentId: string | null`
  - `authorId: string`
  - `body: string`
  - `createdAt: string`
  - `likeCount: number`
- **Errors**:
  - `401 Unauthorized` — guest user or invalid session
  - `404 Not Found` — post or parent comment does not exist
  - `422 Unprocessable Entity` — empty body or invalid reply target

## `PATCH /api/v1/comments/:commentId`

Edit an existing comment authored by the current user.

- **Auth**: Required.
- **Request body** (`UpdateCommentRequest`):
  - `body: string` — required, non-empty after trimming
- **200 OK** body (`CommentResponse`)
- **Errors**:
  - `401 Unauthorized` — guest user or invalid session
  - `403 Forbidden` — user does not own the comment
  - `404 Not Found` — comment does not exist
  - `422 Unprocessable Entity` — empty body text

## `DELETE /api/v1/comments/:commentId`

Delete a comment authored by the current user.

- **Auth**: Required.
- **Request parameters**:
  - `commentId: string`
- **200 OK** body:
  - `{ ok: true }`
- **Errors**:
  - `401 Unauthorized` — guest user or invalid session
  - `403 Forbidden` — user does not own the comment
  - `404 Not Found` — comment does not exist

## `POST /api/v1/posts/:postId/reaction`

Like a post.

- **Auth**: Required.
- **Request body**: none required
- **200 OK** body (`ReactionResponse`):
  - `active: true`
  - `targetType: "post"`
  - `targetId: string`
  - `likeCount: number`
- **Errors**:
  - `401 Unauthorized` — guest user or invalid session
  - `404 Not Found` — post does not exist

## `DELETE /api/v1/posts/:postId/reaction`

Unlike a post.

- **Auth**: Required.
- **Request body**: none required
- **200 OK** body (`ReactionResponse`):
  - `active: false`
  - `targetType: "post"`
  - `targetId: string`
  - `likeCount: number`

## `POST /api/v1/comments/:commentId/reaction`

Like a comment.

- **Auth**: Required.
- **Request body**: none required
- **200 OK** body (`ReactionResponse`)

## `DELETE /api/v1/comments/:commentId/reaction`

Unlike a comment.

- **Auth**: Required.
- **Request body**: none required
- **200 OK** body (`ReactionResponse`)

## Common Notes

- Empty or whitespace-only text is rejected at validation time.
- A user can only edit or delete content they own.
- Deleted posts and comments remain absent from visible threads and cannot receive further interactions.

## Shared Error Shape

All error responses use the centralized envelope:

```json
{
  "error": {
    "code": "VALIDATION | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | INTERNAL",
    "message": "string",
    "fields": { "field": "message" }
  }
}
```