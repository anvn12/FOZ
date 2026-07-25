# Auth API Contract

All routes are prefixed with `/auth`. Request/response DTOs are defined as
Zod schemas in `src/shared/schemas/auth.ts` (single source of truth, imported
by both sides). All errors use the project's central error envelope. All
responses are JSON unless noted.

## `POST /auth/register`

Create a new account + default profile and sign the user in.

- **Auth**: guest-only (no valid access token).
- **Rate-limited**: yes.
- **Request body** (`RegisterRequest`):
  - `email: string` (valid email)
  - `password: string` (≥ strength floor)
- **201 Created** body (`AuthResponse`):
  - `user: { id, email, role, status }`
  - `accessToken: string` (JWT, 15min exp)
- **Side effects**: sets the `refresh_token` http-only `SameSite=Lax`
  cookie (7-day `Max-Age`, `Secure` in production, `Path=/auth`).
- **Errors**:
  - `409 Conflict` — email already registered. Generic body that does not
    leak which field (message: "An account with this email already exists").
  - `422 Unprocessable Entity` — Zod validation failure (per-field messages
    for *form* validity only, never about whether an account exists).

## `POST /auth/login`

Sign in an existing user.

- **Auth**: guest-only.
- **Rate-limited**: yes.
- **Request body** (`LoginRequest`): `email: string`, `password: string`.
- **200 OK** body (`AuthResponse`): `user` + `accessToken`.
- **Side effects**: sets `refresh_token` cookie.
- **Errors**:
  - `401 Unauthorized` — invalid credentials. **Single** message
    "Invalid email or password" (never reveals which field).
  - `403 Forbidden` — `status ∈ {suspended, banned}`:
    "Your account is not currently available."
  - `422` — Zod validation failure.

## `POST /auth/refresh`

Exchange a valid refresh cookie for a new access token (and a rotated
refresh cookie). Called automatically by the frontend auth layer on
401 / on app load when no access token is present.

- **Auth**: none (uses the refresh cookie, not the access token).
- **Rate-limited**: yes.
- **Request body**: none. Reads the `refresh_token` cookie.
- **200 OK** body (`RefreshResponse`): `{ accessToken: string, user: { id, email, role, status } }`.
- **Side effects**: rotates the refresh cookie (old session revoked, new
  session row created).
- **Errors**:
  - `401 Unauthorized` — missing/expired/revoked/tampered cookie. Clears the
    `refresh_token` cookie. No session restore.
  - `403 Forbidden` — account `status` no longer `active` (re-checked on
    refresh). Clears cookie.

## `POST /auth/logout`

Revoke the refresh session and clear the cookie. Auth-required so a logged-in
user can sign out; if access is expired the client refreshes first.

- **Auth**: `requireAuth` (valid access token). Rate-limited: light.
- **Request body**: none.
- **200 OK** body: `{ ok: true }`.
- **Side effects**: `UPDATE refresh_sessions SET revoked_at = now()` for the
  cookie's session; clears `refresh_token` cookie.
- **Errors**: `401` (invalid/expired access — client should refresh then
  retry, or treat as already signed out).

## `PATCH /auth/password`

Change the signed-in user's password.

- **Auth**: `requireAuth`. Rate-limited: yes.
- **Request body** (`ChangePasswordRequest`):
  - `currentPassword: string`
  - `newPassword: string` (same strength floor as registration, ≠ current)
- **200 OK** body: `{ ok: true }`. New access token MAY be issued on success
  (planning detail); refresh cookie is unaffected.
- **Errors**:
  - `401 Unauthorized` — `currentPassword` does not match.
  - `422 Unprocessable Entity` — `newPassword` fails strength / equals
    current / validation.
- **Side effects**: `UPDATE user_accounts SET password_hash = ?`,
  `updated_at = now()`. Logged-in user is NOT force-signed-out on v1
  (`ponytail:` note: optional "sign out everywhere" defer).

## Auth middleware (shared contract)

- `requireAuth`: verifies the `Authorization: Bearer <accessToken>` header
  via the JWT verifier; on success attaches `req.user = { id, role, status }`
  (re-read from DB on refresh-useful boundaries, see data-model state notes).
  On failure → 401 (client attempts `/auth/refresh`, then retries).
- `requireGuest`: rejects when a valid access token is present (used on
  register/login so an already-signed-in client is told to sign out first).

## Error envelope (existing project contract)

All auth errors use the central error handler's standard shape:

```
{ "error": { "code": "<MACHINE_CODE>", "message": "<human message>", "fields"? : { "<field>": "<msg>" } } }
```

- Zod validation failures → `422` with `fields`.
- Credential failures → `401` with a single `message`, no `fields`.
- Account-state failures → `403` with a single `message`.