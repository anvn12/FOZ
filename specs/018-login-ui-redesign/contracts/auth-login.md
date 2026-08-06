# API Contract: Login Authentication

## Request Endpoint
- **POST** `/api/v1/auth/login`
- **Content-Type**: `application/json`

## Request Payload (`LoginRequest`)
```json
{
  "email": "user@example.com",
  "password": "SecretPassword123"
}
```

## Response Envelopes

### Success Response (`200 OK`)
```json
{
  "data": {
    "user": {
      "id": "usr_123456",
      "username": "johndoe",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Validation Error (`400 Bad Request`)
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid email or password format",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

### Unauthorized (`401 Unauthorized`)
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```
