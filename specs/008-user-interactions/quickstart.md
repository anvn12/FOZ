# Quickstart: User Interactions

## Prerequisites

- Node.js 24 or newer
- Docker with the local PostgreSQL service available

## Local Setup

```bash
docker compose up -d db
npm install
```

## Run the App

```bash
npm run dev:be
npm run dev:fe
```

Backend runs on `http://localhost:4000` and the frontend runs on `http://localhost:5173`.

## Validate the Feature Slice

```bash
npm run typecheck
npm run test
```

## Implementation Order

1. Add shared interaction schemas in `src/shared/schemas/interactions.ts`.
2. Add backend routers for posts, comments, and reactions under `src/backend/api/`.
3. Wire frontend feed and post-detail interaction components to the new endpoints.
4. Extend integration tests under `src/backend/__tests__/integration/post.test.ts` or adjacent resource-specific tests.
5. Verify ownership checks, empty-content validation, and like/unlike toggling.

## Final Route Map

- `GET /api/v1/posts` loads the feed.
- `POST /api/v1/posts` creates a post.
- `DELETE /api/v1/posts/:postId` deletes an owned post.
- `GET /api/v1/posts/:postId/comments` loads the thread comments.
- `POST /api/v1/posts/:postId/comments` creates a comment or reply.
- `PATCH /api/v1/comments/:commentId` edits an owned comment.
- `DELETE /api/v1/comments/:commentId` deletes an owned comment.
- `POST /api/v1/posts/:postId/reaction` likes a post.
- `DELETE /api/v1/posts/:postId/reaction` unlikes a post.
- `POST /api/v1/comments/:commentId/reaction` likes a comment.
- `DELETE /api/v1/comments/:commentId/reaction` unlikes a comment.