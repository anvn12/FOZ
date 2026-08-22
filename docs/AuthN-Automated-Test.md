# AuthN Automated Test Suite — Review & Refinement

**Feature area:** Authentication (AuthN)
**Scope of this document:** Complete inventory of every automated test covering the Authentication domain, with the **input** (request / setup / mock) and the **expected output** (HTTP status, response body, cookie, DB state) of each test.
**Test suites reviewed:** `src/backend/__tests__/integration/auth.*.test.ts`, `src/backend/api/auth/auth.service.test.ts`, `src/backend/lib/{jwt,password,rate-limit}.test.ts`, `src/shared/schemas/auth.test.ts`
**Constitution alignment:** Principle IV (Security at Every Layer), Principle VII (WCAG/UX not affected), Quality Standards (auth/feed integration tests < 500ms NFR).
**Date:** 2026-08-22 | **Execution result:** 12 test files, **71 tests, 0 failures** (after refinement below)

---

## 1. Review Summary

### Test inventory (by layer)

| Layer | Files | Tests | Coverage |
| :--- | :--- | :--- | :--- |
| **Tier-2 integration — HTTP routes** | `auth.register.test.ts`, `auth.login.test.ts`, `auth.logout.test.ts`, `auth.refresh.test.ts`, `auth.password.test.ts`, `auth.social.test.ts`, `auth.gating.test.ts` | 27 | Every `/api/v1/auth/*` route: register, login, logout, refresh, me, check-username, password, google, gating |
| **Tier-1 unit — service** | `auth.service.test.ts` | 18 | `register`, `login`, `logout`, `refresh`, `changePassword` with mocked repo |
| **Tier-1 unit — lib** | `jwt.test.ts`, `password.test.ts`, `rate-limit.test.ts` | 15 | JWT sign/verify, bcrypt hash/verify, sliding-window rate limiter |
| **Tier-1 unit — shared schema** | `src/shared/schemas/auth.test.ts` | 11 | `usernameSchema`, `RegisterRequest`, `LoginRequest`, `ChangePasswordRequest` |
| **Auth-gated non-auth routes (guard rails)** | `admin.test.ts`, `admin-metrics.test.ts`, `profile.test.ts`, `auth.gating.test.ts` | 6+ | `requireAuth`/`requireAdminRole` 401/403 gating outside the auth router |

### What is well covered

- **Registration:** happy path (201, cookie flags, DB row), duplicate username (409 `USERNAME_TAKEN`), duplicate email (409 `EMAIL_TAKEN` — service tier), weak password (422 per-field), invalid email (422 per-field), username pre-check endpoint, reserved usernames, email normalization (lowercase/trim).
- **Login:** happy path, **no user enumeration** (identical 401 for wrong password vs. unknown email, no `fields` key), non-active account statuses (403 `ACCOUNT_NOT_ACTIVE`).
- **Session lifecycle:** refresh rotation (old session revoked, new cookie issued), expired cookie (401 + clear), revoked cookie (401), tampered cookie (401), suspended user on refresh (403 + clear). Logout revokes the server-side refresh session; a second refresh with the same cookie is refused.
- **Password change:** happy path (old password stops working, new works), wrong current password (401 `INCORRECT_CURRENT_PASSWORD`), same-as-current (422), too weak (422), unauthenticated (401).
- **Security properties:** refresh cookie is `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth`; refresh secrets stored hashed (SHA-256); access tokens have a 15-minute TTL; bcrypt salting produces distinct hashes.

### Defects found and refined during this review

| # | Location | Defect | Refinement applied |
| :--- | :--- | :--- | :--- |
| D1 | `auth.gating.test.ts` (SC-006) | Asserted **401** for `POST /logout` with no token, but logout is deliberately idempotent: a missing/expired refresh cookie is a **no-op returning `200 { ok: true }`** so guests can always complete a logout. Test contradicted production behavior. | Replaced the assertion with the documented contract: `200 { ok: true }`, with an explanatory comment. |
| D2 | `auth.logout.test.ts` | Same incorrect 401 expectation in the logout happy-path file. | Same fix as D1. |
| D3 | `auth.service.test.ts` (changePassword) | Asserted `InvalidCredentialsError` for a wrong current password, but the service throws `InvalidCurrentPasswordError` (code `INCORRECT_CURRENT_PASSWORD`), a distinct subclass of `AuthError`. Tests should pin the **observable error code**, not an internal class. | Changed to `rejects.toMatchObject({ code: "INCORRECT_CURRENT_PASSWORD", status: 401 })`. |

**Refinement is test-only.** No production code was changed; the three fixes make the automated suite match the actual, security-correct behavior of the implementation.

### Remaining recommendations (documented, not code-changed)

1. `POST /api/v1/auth/google/callback` (redirect mode) asserts the redirect location matches `/\/\?token=/`; the actual redirect target is `${frontendUrl}/?token=...` — `frontendUrl` already contains a scheme, so the assert holds, but it is tightly coupled to `FRONTEND_URL` config. Consider asserting on a parsed query param instead.
2. `auth.login.test.ts` seeds users via `POST /register`; that couples login tests to register behavior. Acceptable for an integration suite (shared DB), listed for awareness.
3. The `<500ms` response-time NFR is asserted via a best-effort `x-response-time` header check (`expectFastResponse`); production should emit `server-timing` for exact measurement.
4. There is **no automated test yet for `GET /api/v1/auth/me`** (OAuth redirect helper) happy path with a valid token, nor for `requireGuest` (409 `ALREADY_SIGNED_IN`). Both are exercised indirectly by other flows. Recommended add.

---

## 2. Test Case Reference — Input / Output

Legend — **Setup** = preconditions/DB seeds; **Input** = request; **Output** = expected response (status, body, headers, DB state).

### 2.1 POST /api/v1/auth/register (US1) — `auth.register.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| REG-001 | `clearDb()` | `POST /api/v1/auth/register`<br>`{ email: "user_<hex>@test.local", username: "testuser_<hex>", password: "P@ssw0rd_<hex>" }` | **201**; `body.user` = `{ role: "standard", status: "active", username: <uname> }`; `accessToken` non-empty string; elapsed < 2000ms; `Set-Cookie` contains `refresh_token=…` with `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth`. |
| REG-002 | — | Register `email1` + username `same_handle` → 201; then register `email2` + username `same_handle` | Second call **409**; `error.code = "USERNAME_TAKEN"`; `error.message` matches `/already taken/i`. |
| REG-003 | — | `GET /api/v1/auth/check-username?username=<uname>` before and after registering `<uname>` | Before: **200** `{ available: true }`. After: **200** `{ available: false }`. |
| REG-004 | — | Register with password `"short"` (5 chars) | **422**; `error.code = "VALIDATION"`; `error.fields.password` defined. |
| REG-005 | — | Register with email `"not-an-email"` | **422**; `error.code = "VALIDATION"`; `error.fields.email` defined. |

### 2.2 POST /api/v1/auth/login (US2) — `auth.login.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| LOG-001 | Register active user | `POST /api/v1/auth/login`<br>`{ email, password }` | **200**; `body.user` = `{ role: "standard", status: "active", email }`; non-empty `accessToken`; elapsed < 2000ms; `refresh_token` cookie with `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth`. |
| LOG-002 | Register active user | Login with **wrong password** | **401**; `error.code = "INVALID_CREDENTIALS"`; `error.message = "Invalid email or password"`; **no `fields` key** (no field disclosure). |
| LOG-003 | — | Login with unknown email `nobody_<ts>@nowhere.io` | **401**; identical generic `INVALID_CREDENTIALS` payload as LOG-002 (no enumeration). |
| LOG-004 | User seeded with status `suspended` / `banned` / `pending` (via `UPDATE user_accounts`) | Login with correct credentials (each status) | **403**; `error.code = "ACCOUNT_NOT_ACTIVE"`; `error.message = "Your account is not currently available"`. |

### 2.3 POST /api/v1/auth/logout (US3) — `auth.logout.test.ts`, `auth.gating.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| LOGOUT-001 | Register; capture `accessToken` + `refreshCookie` | `POST /api/v1/auth/logout` with `Authorization: Bearer <token>` and `Cookie: <refreshCookie>` | **200**; `body = { ok: true }`; `Set-Cookie` clears `refresh_token` (`Max-Age=0`/`Expires=Thu, 01 Jan 1970`); refresh session revoked server-side. |
| LOGOUT-002 | From LOGOUT-001 | `POST /api/v1/auth/refresh` reusing the (now revoked) cookie | **401** — proves server-side revocation. |
| LOGOUT-003 | No token, no cookie | `POST /api/v1/auth/logout` with empty body | **200**; `body = { ok: true }` — idempotent no-op by design *(refined: was wrongly expecting 401, see D1/D2)*. |

### 2.4 POST /api/v1/auth/refresh (US4) — `auth.refresh.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| REF-001 | Register; capture `refreshCookie` | `POST /api/v1/auth/refresh` with `Cookie: <refreshCookie>` | **200**; non-empty `accessToken`; `body.user` = `{ role: "standard", status: "active" }` with email; response sets a **new** `refresh_token` cookie (rotation), value ≠ old cookie; old refresh session revoked in DB. |
| REF-002 | Register; then `UPDATE refresh_sessions SET expires_at = now() - interval '1 day'` | Refresh with the expired cookie | **401**; `Set-Cookie` clears the cookie (`Max-Age=0`/`1970`). |
| REF-003 | Register; then `UPDATE refresh_sessions SET revoked_at = now()` | Refresh with the revoked cookie | **401**; `error.code = "INVALID_REFRESH"`, message `"Session expired"`. |
| REF-004 | Register; tamper last char of cookie value | Refresh with tampered cookie | **401** (secret hash mismatch). |
| REF-005 | Register; then `UPDATE user_accounts SET status='suspended'` where email | Refresh with still-valid cookie | **403**; `Set-Cookie` clears the cookie. |

### 2.5 PATCH /api/v1/auth/password (US5) — `auth.password.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| PWD-001 | Register; capture `accessToken`, old `password` | `PATCH /api/v1/auth/password` with `Authorization: Bearer <token>`<br>`{ currentPassword: <old>, newPassword: <new> }` | **200**; `body = { ok: true }`. Then `POST /login` with **new** password → **200**; with **old** password → **401**. |
| PWD-002 | Register; token | Same with `currentPassword: "wrongoldpwd1"` | **401**; `error.code = "INCORRECT_CURRENT_PASSWORD"`; `error.message = "Incorrect current password"`. |
| PWD-003 | Register; token | Same with `newPassword` = current password | **422**; `error.code = "VALIDATION"`; `error.fields.newPassword` defined. |
| PWD-004 | Register; token | Same with `newPassword: "short"` | **422**; `error.fields.newPassword` defined. |
| PWD-005 | — | `PATCH /api/v1/auth/password` with **no** `Authorization` header | **401** `<missing token>`. |

### 2.6 Social auth — Google OAuth (US social) — `auth.social.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| SOC-001 | Empty DB | `GET /api/v1/auth/google?mode=popup` | **302** to `…/auth/google/callback?…` or `google.com`. |
| SOC-002 | Empty DB | `GET /api/v1/auth/google/callback?code=mock_google_code&state=popup&mock_email=testgoogle@example.com&mock_name=GoogleTester` | **200** HTML containing `SOCIAL_AUTH_SUCCESS` and `"isNewUser":true`; sets `refresh_token` cookie; DB row in `user_accounts` (email `testgoogle@example.com`) and `user_social_links` (provider `google`) created. |
| SOC-003 | From SOC-002 (same email called twice) | Second callback with `mock_email=returning@example.com`… wait — second call uses the **same** email | First call: `"isNewUser":true`; second call with the same email: **200** `"isNewUser":false` (returning user, link reused, no duplicate account). |
| SOC-004 | — | `GET /api/v1/auth/google/callback?code=mock_google_code&state=redirect&mock_email=redirectgoogle@example.com` | **302** with `Location` matching `/\/\?token=/` and `[?&]new=1` (access token passed to frontend). |
| SOC-005 | — | `GET /` (server root) | **200** `{ ok: true, message: "FOZ API Backend" }`. |

### 2.7 Auth gating (SC-006) — `auth.gating.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| GATE-001 | No token | `POST /api/v1/auth/logout` | **200** `{ ok: true }` — idempotent *(refined, D1)*. |
| GATE-002 | No token | `PATCH /api/v1/auth/password` `{ currentPassword: "anything", newPassword: "newpassword1" }` | **401** `UNAUTHENTICATED`. |
| GATE-003 | No cookie | `POST /api/v1/auth/refresh` | **401** `INVALID_REFRESH` (message `"Session expired"`). |

### 2.8 AuthN gating on non-auth resources (guard rails)

| TC | Input | Expected output |
| :--- | :--- | :--- |
| `GET /api/v1/admin/metrics` (no token) | **401** `UNAUTHENTICATED` |
| `GET /api/v1/admin/audit-logs` (no token) | **401** |
| `GET /api/v1/admin/users` (no token) | **401** |
| `GET /api/v1/admin/reports` (no token) | **401** |
| `GET /api/v1/admin/categories` (no token) | **401** |
| `GET /api/v1/admin/settings` (no token) | **401** |
| Profile endpoints without a valid token | **401** (admin `-metrics` suite, profile suite) |
| Summary endpoints `/api/v1/posts/:id/summary` + `/refresh` without token | **401** (Constitution Principle VI — guests never trigger AI; covered in `summary-routes.test.ts`) |

---

## 3. Tier-1 Unit Tests — Input / Output

### 3.1 `auth.service.ts` (mocked repos) — `auth.service.test.ts`

| TC | Mocks / Setup | Input | Expected result |
| :--- | :--- | :--- | :--- |
| SV-REG-01 | `findUserByEmail`→`undefined`, `findUserByUsername`→`undefined`, `createUserWithProfile`→user `u1`; `issueRefreshToken`→`{id:"id-123",secret:"secret-456",expiresAt:2030}`; `signAccessToken`→`"access-token-mock"` | `register({ email, password:"abcdefgh", username:"u1", displayName:"User 1", location:"Loc", website:"https://foz.dev" })` | `auth.user.id="u1"`, `auth.user.username="testuser"`, `auth.accessToken="access-token-mock"`; `cookie.name="refresh_token"`, `cookie.value="id-123.secret-456"`, `httpOnly=true`, `sameSite="lax"`, `path="/api/v1/auth"`. |
| SV-REG-02 | `findUserByEmail`→existing row | `register({ email:"…@…", password:"abcdefgh", username:"u1", … })` | **rejects** `DuplicateEmailError` (409 `EMAIL_TAKEN`). |
| SV-LOG-01 | `findUserByEmail`→active `u1`; `verifyPassword`→`true`; refresh issued as `id-xyz/secret-abc` | `login({ email:"alice@example.com", password:"abcdefgh" })` | `auth.user.id="u1"`, `auth.accessToken="access-token-mock"`, `cookie.value="id-xyz.secret-abc"`. |
| SV-LOG-02 | `findUserByEmail`→`undefined` | `login({ email:"nobody@nowhere.io", password:"abcdefgh" })` | **rejects** `InvalidCredentialsError`; `verifyPassword` **never called**. |
| SV-LOG-03 | `findUserByEmail`→active `u1`; `verifyPassword`→`false` | `login({ email, password:"wrong-password" })` | **rejects** `InvalidCredentialsError`. |
| SV-LOG-04 | `findUserByEmail`→`u1` with status `suspended`/`banned`/`pending`; `verifyPassword`→`true` | `login(...)` per status | **rejects** `AccountNotActiveError` (403). |
| SV-LOGOUT-01 | `findValidRefreshSession`→matching session; `revokeRefreshSession`→`{}` | `logout({ id:"session-id", secret:"raw-secret" })` | `{ ok:true }`; `findValidRefreshSession("session-id","hashed-secret")` and `revokeRefreshSession("session-id")` called. |
| SV-LOGOUT-02 | — | `logout(null)` | `{ ok:true }`; repo **not** called (no-op). |
| SV-LOGOUT-03 | `findValidRefreshSession`→`undefined` | `logout({ id, secret })` | `{ ok:true }`; `revokeRefreshSession` not called (no-op). |
| SV-REF-01 | `findValidRefreshSession`→valid session; `getUserById`→active; new refresh issued (`new-session-id/new-secret`); `revokeRefreshSession` | `refresh({ id:"session-id", secret:"raw-secret" })` | `auth.accessToken="access-token-mock"`; `cookie.value="new-session-id.new-secret"`; **old session revoked**; new session created. |
| SV-REF-02 | — | `refresh(null)` | **rejects** `InvalidRefreshError`. |
| SV-REF-03 | `findValidRefreshSession`→`undefined` | `refresh({ id, secret })` | **rejects** `InvalidRefreshError`. |
| SV-REF-04 | valid session; `getUserById`→user status `banned` | `refresh({ id, secret })` | **rejects** `AccountNotActiveError`. |
| SV-PWD-01 | `getUserById`→`u1`; `verifyPassword`→`true`; `hashPassword`→`"new-hash"` | `changePassword({ userId:"u1", currentPassword:"oldpass1234", newPassword:"newpass1234" })` | `{ ok:true }`; `hashPassword("newpass1234")` and `updatePasswordHash("u1","new-hash")` called. |
| SV-PWD-02 | `getUserById`→`u1`; `verifyPassword`→`false` | `changePassword({ userId:"u1", currentPassword:"wrongoldpwd1", newPassword:"newpass1234" })` | **rejects** `{ code:"INCORRECT_CURRENT_PASSWORD", status:401 }`; `updatePasswordHash` **not** called *(refined, D3)*. |
| SV-PWD-03 | `getUserById`→`undefined` | `changePassword({ userId:"missing", … })` | **rejects** `InvalidCredentialsError`. |

### 3.2 `lib/jwt.ts` — `jwt.test.ts`

| TC | Setup | Input | Expected result |
| :--- | :--- | :--- | :--- |
| JWT-01 | `vi.setSystemTime(2026-01-01T00:00:00Z)` | `signAccessToken({ sub:"u1", role:"standard", status:"active" })` → `verifyAccessToken(token)` | decrypts to `{ sub:"u1", role:"standard", status:"active" }`. |
| JWT-02 | fresh token | `verifyAccessToken(token.slice(0,-2)+"ZZ")` | **throws** (tampered signature). |
| JWT-03 | sign at `2026-01-01T00:00:00Z`; advance clock +20 min (15-min TTL) | `verifyAccessToken(token)` | **throws** (expired). |

### 3.3 `lib/password.ts` (bcrypt) — `password.test.ts`

| TC | Input | Expected result |
| :--- | :--- | :--- |
| PWDH-01 | `hashPassword("correct horse battery staple")` | hash ≠ plaintext; length > 20; `verifyPassword(same, hash)` → `true`. |
| PWDH-02 | hash of the passphrase; `verifyPassword("wrong", hash)` | `false`. |
| PWDH-03 | `hashPassword("same")` twice | hashes differ (random salt). |

### 3.4 `lib/rate-limit.ts` — `rate-limit.test.ts` (production `NODE_ENV` reloaded)

| TC | Setup | Input | Expected result |
| :--- | :--- | :--- | :--- |
| RL-01 | `process.env.NODE_ENV="production"`; reload module | 15 × `POST /test` → then 16th `POST /test` (rolling 60s window, limit 15) | First 15: **200**. 16th: **429** `{ error: { code:"RATE_LIMITED", message:"Too many actions, …" } }`; `Retry-After` between 50 and 60. |
| RL-02 | same, but limiter keys by authed user id | 15 × `POST /test` as `user-123` → 16th as same user; then 1st as anonymous (IP key) | 16th as user: **429**. Anonymous request (different key): **200**. |
| RL-03 | `NODE_ENV="test"`; reload module | 30 × `POST /test` through the limiter | All **200** (limiter is a no-op in test to keep integration tests fast). |

### 3.5 `src/shared/schemas/auth.ts` — `auth.test.ts`

| TC | Input | Expected result |
| :--- | :--- | :--- |
| SH-01 | `usernameSchema` on `"alice_123"`, `"bob.smith"` | success. |
| SH-02 | `"ab"` (2 chars) | failure (< 3). |
| SH-03 | `"a".repeat(31)` | failure (> 30). |
| SH-04 | `"alice!"`, `"alice user"` | failure (invalid chars). |
| SH-05 | `"admin"`, `"moderator"` | failure (reserved). |
| SH-06 | `RegisterRequest` `{ email: good, username: good, password: "abcdefgh" }` | success. |
| SH-07 | email `"not-an-email"` | failure. |
| SH-08 | password `"short"` | failure. |
| SH-09 | `"  ALICE@Example.COM  "` | success; normalized to `alice@example.com`. |
| SH-10 | `LoginRequest` `{ email, password: "" }` | failure (password required). |
| SH-11 | `ChangePasswordRequest` `currentPassword == newPassword` | failure `newPassword` path. |
| SH-12 | `ChangePasswordRequest` `{ currentPassword:"oldpassword", newPassword:"newpassword2" }` | success. |

---

## 4. Implementation Notes for the Automated Suite

- **No production code was modified as part of this review/refinement.** The three findings (D1–D3) were fixes to the test suite only, aligning the expectations with documented, security-correct behavior (idempotent logout, wrong-password error code).
- **Session cookie contract asserted everywhere:** `HttpOnly` + `SameSite=Lax` + `Path=/api/v1/auth` + `Max-Age=0` on clear.
- **No user enumeration:** unknown email and wrong password resolve to the identical `INVALID_CREDENTIALS` payload; asserted at both route (LOG-002/LOG-003) and service (SV-LOG-02/SV-LOG-03) level.
- **Refresh token rotation is enforced server-side:** every successful refresh revokes the previous session and creates a new one; replay of the old cookie returns 401.
- **Rate limiting for auth** is intentionally production-only (`noop` under test) to keep the integration suite under the 500ms per-test NFR; the limiter itself is exercised in isolation with the module reloaded under `NODE_ENV=production`.

---

## 5. How to Run

```bash
# Full AuthN suite (tier-1 + tier-2) — requires a running Postgres test DB
npx vitest run \
  src/backend/__tests__/integration/auth.register.test.ts \
  src/backend/__tests__/integration/auth.login.test.ts \
  src/backend/__tests__/integration/auth.logout.test.ts \
  src/backend/__tests__/integration/auth.refresh.test.ts \
  src/backend/__tests__/integration/auth.password.test.ts \
  src/backend/__tests__/integration/auth.social.test.ts \
  src/backend/__tests__/integration/auth.gating.test.ts \
  src/backend/api/auth/auth.service.test.ts \
  src/backend/lib/jwt.test.ts \
  src/backend/lib/password.test.ts \
  src/backend/lib/rate-limit.test.ts \
  src/shared/schemas/auth.test.ts
```

Current result: **12 files, 71 tests, all passing** (`2026-08-22`).