# Component & API Contracts: Mobile Login UI Redesign

## 1. Frontend Route & Component Contract

### Route Path
`/login`

### Component Entry Point
`src/frontend/src/pages/LoginPage.tsx`

### Shared Sub-Components
- `src/frontend/src/components/SocialLoginButtons.tsx`: Renders single full-width "Continue with Google" button.
- `src/frontend/src/components/TrendingCarousel.tsx`: Rendered on desktop viewports (≥ 768px) inside the left hero panel.

---

## 2. API Endpoint Integrations

### Endpoint: User Password Login
- **URL**: `POST /api/v1/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
- **Success Response (200 OK)**:
```json
{
  "user": {
    "id": "usr_12345",
    "email": "user@example.com",
    "username": "johndoe",
    "displayName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "accessToken": "eyJhbGciOiJIUzI1Ni..."
}
```
- **Error Response (401 Unauthorized)**:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### Endpoint: Google OAuth Social Login
- **URL**: `GET /api/v1/auth/google`
- **Trigger**: User taps "Continue with Google" button on mobile or desktop.
- **Behavior**: Redirects browser to Google OAuth consent screen, returning to `/api/v1/auth/google/callback`.

---

## 3. Form Validation & UX State Matrix

| State | Input Interactivity | Submit Button Visual | Secondary Actions | Feedback / Toast |
|-------|----------------------|----------------------|-------------------|------------------|
| **Idle** | Enabled | Vibrant gradient (`#2E7DFF` to `#9D3BFF`), enabled | Links active | None |
| **Focused Input** | Active cursor, neon glow border (`#2E7DFF`) | Vibrant gradient, enabled | Links active | None |
| **Password Visible** | Password text visible | Visibility icon active (eye off) | Links active | None |
| **Submitting** | Disabled | Loading spinner + opacity 0.8 | Links disabled | "Logging in..." state |
| **Success** | Disabled | Gradient | Disabled | Redirect to `/` |
| **Auth Error** | Enabled | Vibrant gradient | Enabled | Toast error alert |
