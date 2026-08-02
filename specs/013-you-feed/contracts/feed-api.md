# API Contract: Feed Endpoint

**Feature**: 013-you-feed | **Date**: 2026-08-02

## GET /api/v1/posts

Returns posts with optional feed-type ranking.

### Query Parameters

| Parameter | Type   | Required | Default    | Description                              |
|-----------|--------|----------|------------|------------------------------------------|
| `type`    | string | No       | `latest`   | Feed type: `for-you` or `latest`         |
| `authorId`| string | No       | —          | Filter by author UUID                    |
| `cursor`  | string | No       | —          | ISO timestamp cursor for pagination      |
| `limit`   | number | No       | `20`       | Items per page (max 50)                  |

### Authentication

- `optionalAuth` middleware — JWT token optional
- If authenticated + `type=for-you`: personalized feed
- If not authenticated + `type=for-you`: falls back to popularity feed
- `type=latest`: same behavior regardless of auth

### Request

```http
GET /api/v1/posts?type=for-you&limit=20 HTTP/1.1
Authorization: Bearer <jwt>
```

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "authorId": "uuid",
      "content": "Post text...",
      "parentId": null,
      "repostOfId": null,
      "visibilityState": "public",
      "lifecycleState": "active",
      "createdAt": "2026-08-02T12:00:00Z",
      "likeCount": 5,
      "commentCount": 3,
      "liked": true,
      "reposted": false,
      "attachments": []
    }
  ],
  "nextCursor": "2026-08-01T08:00:00Z"
}
```

### Response 400 (Invalid type)

```json
{
  "error": {
    "code": "INVALID_FEED_TYPE",
    "message": "Feed type must be 'for-you' or 'latest'"
  }
}
```

### Response 500 (Personalization failure — graceful degradation)

```json
{
  "items": [...],
  "nextCursor": "...",
  "degraded": true
}
```

The `degraded` flag indicates the system fell back to chronological order due to a ranking error. The feed still loads — no error shown to user.

## Behavior Matrix

| Auth State | `type=for-you` | `type=latest` |
|------------|----------------|---------------|
| Guest      | Popularity feed (engagement + recency) | Chronological |
| Logged in  | Personalized (affinity + engagement + recency) | Chronological |
