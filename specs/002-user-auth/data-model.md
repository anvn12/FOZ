# Data Model: User Authentication

This feature reuses the existing entities defined in
`backend/db/schema/users.ts` / `roles.ts` and the shared enums in
`shared/schema-enums.ts`, and introduces **one new entity**: `RefreshSession`.
Existing column names follow `0001_initial.sql` (snake_case DB columns mapped
to the Drizzle schema).

## Reused Entities (no schema change)

### UserAccount — table `user_accounts`
- **Purpose**: Authentication identity, password hash, role, and account status.
- **Key fields**: `id` (uuid), `email` (unique, NOT NULL), `password_hash`
  (NOT NULL), `role` (`guest` | `standard` | `moderator` | `administrator`),
  `status` (`active` | `suspended` | `banned` | `pending`),
  `created_at`, `updated_at`.
- **Relationships**: Owns one Profile (1:1). Owns many RefreshSessions.
  Owns many Posts/Comments/Reactions/Reports/RoleHistory (future features).
- **Auth usage**: Looked up by `email` at sign-in; `status` must be `active`
  to authenticate. `password_hash` compared via bcrypt, never returned.

### Profile — table `profiles`
- **Purpose**: Public-facing user details.
- **Key fields**: `id` (uuid), `user_account_id` (unique FK → `user_accounts.id`,
  ON DELETE CASCADE), `display_name` (NOT NULL), `bio`, `avatar_url`,
  `location`, `website`, `created_at`, `updated_at`.
- **Relationships**: Belongs to exactly one UserAccount.
- **Auth usage**: Created with a default `display_name` at registration
  (empty/placeholder bio, avatar, location, website). The `display_name`
  default is a planning-detail value (e.g. derived from the email handle or
  a placeholder like `new_user_<shortId>`); uniqueness is not required by the
  schema.

### RoleHistory — table `role_history`
- **Purpose**: Durable record of every role transition for a user.
- **Key fields**: `id`, `user_account_id` (FK), `previous_role`, `new_role`,
  `changed_by` (FK → `user_accounts.id`), `reason`, `created_at`,
  `updated_at`.
- **Auth usage**: v1 registration assigns `role = standard` as the initial
  role; a `RoleHistory` row is NOT required at registration (no prior role
  to transition from). RoleHistory becomes relevant in a later RBAC feature.

## New Entity

### RefreshSession — table `refresh_sessions` (NEW migration)
- **Purpose**: A revocable, long-lived refresh credential issued at sign-in
  and on each refresh, supporting Story 3 (sign out) and Story 4 (stay
  signed in across sessions).
- **Key fields**:
  - `id` (uuid, PK) — opaque refresh-token id embedded in the cookie token.
  - `user_account_id` (uuid, FK → `user_accounts.id`, ON DELETE CASCADE,
    indexed) — the session owner.
  - `token_hash` (text, NOT NULL, indexed) — bcrypt or SHA-256 hash of the
    opaque refresh secret sent to the client. The raw secret is never stored.
  - `expires_at` (timestamptz, NOT NULL) — 7 days from issue.
  - `revoked_at` (timestamptz, NULLABLE) — set at sign-out (and future
    "revoke everywhere"). NULL ⇒ still active.
  - `created_at` (timestamptz, NOT NULL, default `now()`).
  - `updated_at` (timestamptz, NOT NULL, default `now()`).
- **Relationships**: Belongs to one UserAccount (many sessions per user).
- **Validation / lifecycle rules**:
  - A refresh session is **valid** iff `revoked_at IS NULL` AND
    `expires_at > now()`.
  - Sign-out sets `revoked_at = now()` for the session matching the cookie.
  - Refresh rotation: the presented session is revoked and a new session row
    is created (rotation, not extension) — mitigates replay of stolen
    refresh tokens. `ponytail:` the rotation-reuse window is not detected in
    v1; add a "reuse-detection = revoke family" upgrade if theft appears.
  - Inserting a new session MUST happen in the same transaction as the auth
    state change (register/login/refresh) to avoid orphaned sessions.

## Relationships Summary

- `user_accounts` 1 ↔ 1 `profiles`
- `user_accounts` 1 ↔ many `refresh_sessions`
- `role_history` references `user_accounts` twice (subject + actor) — unchanged.

## Validation Rules (enforced at API boundary via Zod)

- **Register** (`POST /auth/register`):
  - `email`: valid email format, non-empty.
  - `password`: minimum length (configurable, e.g. ≥ 8), not in a common
    weak list; exact thresholds are a planning detail.
  - On success: `role = standard`, `status = active`, a default `Profile`
    is created atomically with the `UserAccount`. Returns the access token
    via the response body and sets the refresh cookie.
- **Sign in** (`POST /auth/login`):
  - `email` + `password` validated by Zod.
  - Lookup by email; if not found or `bcrypt.compare` fails → generic
    "invalid email or password" (HTTP 401).
  - If `status != active` → "account not currently available" (HTTP 403).
  - On success: issue access token + create `RefreshSession`, set refresh cookie.
- **Refresh** (`POST /auth/refresh`):
  - Reads refresh cookie; look up `RefreshSession` by id; verify `token_hash`,
    `revoked_at IS NULL`, `expires_at > now()`. Any failure → clear cookie,
    return 401 (no session restore).
  - On success: revoke old session, create new session, rotate cookie.
- **Change password** (`PATCH /auth/password`):
  - Requires `requireAuth` (valid access token).
  - `currentPassword` verified via `bcrypt.compare`; mismatch → 401.
  - `newPassword` validated against the same strength rule as registration;
    new != old; on success `UPDATE user_accounts.password_hash`.
- **Sign out** (`POST /auth/logout`):
  - Revokes the `RefreshSession` referenced by the refresh cookie (if any),
    clears the cookie. Access-token invalidation is client-side
    (the short 15min lifetime bounds stale access).

## State Notes

- Account `status` transitions relevant to auth: `active` ⟶
  `{suspended, banned}` (set by a future moderation feature) blocks new
  sign-ins and refresh; the token middleware MUST re-check `status` on
  refresh, not assume a once-issued credential stays valid forever.
- `pending` is reserved for future email-verification; v1 auth never sets it.
- RefreshSession lifecycle: `active` → `revoked` (sign-out/rotation) or
  `expired` (`expires_at` passed; eligible for a later cleanup job — out of
  scope v1, `ponytail:` note).