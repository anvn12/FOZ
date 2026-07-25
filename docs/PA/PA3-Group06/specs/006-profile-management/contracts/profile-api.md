# API Contracts: Profile Management

All profile endpoints are registered under `/api/v1/profiles` in the Express application.

## 1. GET /api/v1/profiles/:userId

Retrieve a member's public profile page data.

### Request
- **Method**: `GET`
- **Path**: `/api/v1/profiles/:userId` (where `:userId` is the `userAccountId` UUID)
- **Headers**: None required (public route)

### Success Response (200 OK)
```json
{
  "profile": {
    "id": "b3e34b17-7489-4b68-b7eb-7f415053e1a0",
    "userAccountId": "39f0e132-7a71-4770-9831-29e211e405a1",
    "displayName": "Alice Johnson",
    "bio": "Open source contributor and developer.",
    "location": "San Francisco, CA",
    "website": "https://alicejohnson.dev",
    "avatarUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "createdAt": "2026-07-20T01:00:00.000Z",
    "updatedAt": "2026-07-20T01:30:00.000Z"
  }
}
```

### Error Responses
- **404 Not Found**: If no profile exists for the given `userId`.
  ```json
  {
    "error": {
      "code": "NOT_FOUND",
      "message": "Profile not found"
    }
  }
  ```

---

## 2. PATCH /api/v1/profiles/me

Update the current user's profile details.

### Request
- **Method**: `PATCH`
- **Path**: `/api/v1/profiles/me`
- **Headers**:
  - `Authorization: Bearer <valid_access_token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "displayName": "Alice J. (Updated)",
    "bio": "Senior developer",
    "location": "Oakland, CA",
    "website": "https://alicej.io"
  }
  ```

### Success Response (200 OK)
```json
{
  "profile": {
    "id": "b3e34b17-7489-4b68-b7eb-7f415053e1a0",
    "userAccountId": "39f0e132-7a71-4770-9831-29e211e405a1",
    "displayName": "Alice J. (Updated)",
    "bio": "Senior developer",
    "location": "Oakland, CA",
    "website": "https://alicej.io",
    "avatarUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "createdAt": "2026-07-20T01:00:00.000Z",
    "updatedAt": "2026-07-20T01:40:00.000Z"
  }
}
```

### Error Responses
- **401 Unauthorized**: If no valid auth token is provided.
  ```json
  {
    "error": {
      "code": "UNAUTHENTICATED",
      "message": "Authentication required"
    }
  }
  ```
- **422 Unprocessable Entity**: Input validation failure (Zod validation).
  ```json
  {
    "error": {
      "code": "VALIDATION",
      "message": "Invalid request",
      "fields": {
        "displayName": "String must contain at most 50 character(s)",
        "website": "Invalid url"
      }
    }
  }
  ```

---

## 3. POST /api/v1/profiles/me/avatar

Update user avatar using Base64 encoded payload.

### Request
- **Method**: `POST`
- **Path**: `/api/v1/profiles/me/avatar`
- **Headers**:
  - `Authorization: Bearer <valid_access_token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```

### Success Response (200 OK)
```json
{
  "avatarUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Error Responses
- **401 Unauthorized**: Unauthenticated request.
  ```json
  {
    "error": {
      "code": "UNAUTHENTICATED",
      "message": "Authentication required"
    }
  }
  ```
- **422 Unprocessable Entity**: Invalid file type or image size exceeding 2MB.
  ```json
  {
    "error": {
      "code": "VALIDATION",
      "message": "Invalid request",
      "fields": {
        "avatar": "File size exceeds 2MB limit or is not a supported image format"
      }
    }
  }
  ```
