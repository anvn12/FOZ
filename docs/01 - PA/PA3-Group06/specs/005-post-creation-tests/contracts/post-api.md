# Post API Contract

All routes are prefixed with `/api/v1/posts` (mounted via the global API router). Request/response validation is performed using Zod schemas. Centralized error envelopes are used for all error responses.

## `POST /api/v1/posts`

Create a new post or a chained thread of posts.

- **Auth**: Required (`requireAuth`).
- **Rate-limited**: Yes.
- **Request body** (`CreatePostRequest`):
  - Single Post mode:
    - `content?: string` (up to 5,000 characters)
    - `parentId?: string` (uuid, optional, links to a parent post)
    - `attachments?: Array<{ fileUrl: string, fileType: string, fileSize: number }>` (optional, up to 4 attachments)
  - Thread (Chained) mode:
    - `posts: Array<{ content?: string, attachments?: Array<{ fileUrl: string, fileType: string, fileSize: number }> }>` (array of 1 to 10 chained posts)
- **201 Created** body (`PostResponse` or `Array<PostResponse>`):
  - Single Post:
    - `id: string` (uuid)
    - `authorId: string` (uuid)
    - `content: string | null`
    - `parentId: string | null`
    - `createdAt: string` (ISO date-time)
    - `attachments: Array<{ id, fileUrl, fileType, fileSize }>`
  - Chained thread:
    - Array of `PostResponse` in creation order.
- **Errors**:
  - `401 Unauthorized` — Missing or invalid authentication token.
  - `400 Bad Request` — Validation failure (e.g. both content and attachments are missing, content exceeds 5,000 chars, or attachments exceed 4 files or 5MB limit).
  - `404 Not Found` — The specified `parentId` does not exist.

## `DELETE /api/v1/posts/:id`

Delete a post by its ID. If the post has comments or subsequent chained posts, a cascade delete is performed.

- **Auth**: Required (`requireAuth`).
- **Request parameters**:
  - `id: string` (uuid, required)
- **200 OK** body:
  - `{ ok: true, deletedCount: number }`
- **Errors**:
  - `401 Unauthorized` — Missing or invalid authentication token.
  - `403 Forbidden` — The user is not the author of the post AND does not have the `administrator` role.
  - `404 Not Found` — Post with the specified ID does not exist.
