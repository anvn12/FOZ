# AuthN Automated Test Suite Review & Refinement

**Feature area:** Authentication (AuthN)   
**Scope of this document:** Complete inventory of every automated test covering the Authentication domain, with the **input** (request / setup / mock) and the **expected output** (HTTP status, response body, cookie, DB state) of each test.   
**Test suites reviewed:** `src/backend/__tests__/integration/auth.*.test.ts`, `src/backend/api/auth/auth.service.test.ts`, `src/backend/lib/{jwt,password,rate-limit}.test.ts`, `src/shared/schemas/auth.test.ts`   
**Constitution alignment:** Principle IV (Security at Every Layer), Principle VII (WCAG/UX not affected), Quality Standards (auth/feed integration tests < 500ms NFR).  
**Date:** 2026-08-23 | **Execution result:** 13 test files, **78 tests, 0 failures**   

**How to read this document:** §1 reviews the test suite by category (what exists, one line per test case) and calls out quality issues found. §2 is the refinement applied per category, what was fixed or added and why. §3–§4 are the full, current test case reference with complete input/output detail. §5–§7 are supporting notes.

---

## 1. Review

### Category 1: Registration - `auth.register.test.ts`
- **REG-001:** Happy path - 201, cookie flags, `accessToken`, DB row created.
- **REG-002:** Duplicate username - 409 `USERNAME_TAKEN`.
- **REG-003:** Username pre-check endpoint - availability toggles before/after registering.
- **REG-004:** Weak password - 422 with `error.fields.password`.
- **REG-005:** Invalid email format - 422 with `error.fields.email`.
- **REG-006:** Duplicate email at route level - 409 `EMAIL_TAKEN`.
- **REG-007:** `requireGuest` gating - 409 `ALREADY_SIGNED_IN` when already-authenticated.

### Category 2: Login - `auth.login.test.ts`
- **LOG-001:** Happy path - 200, cookie flags, `accessToken`.
- **LOG-002:** Wrong password - 401 `INVALID_CREDENTIALS`, no `fields` key.
- **LOG-003:** Unknown email - identical 401 payload to LOG-002 (no user enumeration).
- **LOG-004:** Non-active account (`suspended`/`banned`/`pending`) - 403 `ACCOUNT_NOT_ACTIVE`.

### Category 3: Logout & Session Gating - `auth.logout.test.ts`, `auth.gating.test.ts`
- **LOGOUT-001:** Happy path - 200, cookie cleared, refresh session revoked server-side.
- **LOGOUT-002:** Replay revoked cookie via `/refresh` - 401, proves server-side revocation.
- **LOGOUT-003:** No token, no cookie - 200 idempotent no-op.
- **GATE-001:** `POST /logout` with no token - 200 idempotent no-op.
- **GATE-002:** `PATCH /password` with no token - 401 `UNAUTHENTICATED`.
- **GATE-003:** `POST /refresh` with no cookie - 401 `INVALID_REFRESH`.

### Category 4: Refresh / Session Rotation - `auth.refresh.test.ts`
- **REF-001:** Happy path - new cookie issued (rotation), old session revoked in DB.
- **REF-002:** Expired cookie - 401, cookie cleared.
- **REF-003:** Revoked cookie - 401 `INVALID_REFRESH`.
- **REF-004:** Tampered cookie value - 401 (secret hash mismatch).
- **REF-005:** Suspended user mid-session - 403, cookie cleared.

### Category 5: Password Change - `auth.password.test.ts`
- **PWD-001:** Happy path - old password stops working, new password works.
- **PWD-002:** Wrong current password - 401 `INCORRECT_CURRENT_PASSWORD`.
- **PWD-003:** New password same as current - 422 `error.fields.newPassword`.
- **PWD-004:** New password too weak - 422 `error.fields.newPassword`.
- **PWD-005:** No `Authorization` header - 401.

### Category 6: Social Auth (Google OAuth) - `auth.social.test.ts`
- **SOC-001:** `GET /google?mode=popup` - 302 to callback or provider.
- **SOC-002:** Callback, new user - 200 HTML, `isNewUser:true`, DB rows created.
- **SOC-003:** Callback, same email again - `isNewUser:false`, no duplicate account.
- **SOC-004:** Callback, redirect mode - 302 with `token`/`new=1` in the redirect URL.
- **SOC-005:** `GET /` server root - 200 health payload.

### Category 7: GET /me (OAuth Redirect Helper) - `auth.me.test.ts`
- **ME-001:** Happy path - 200, full user object, `accessToken` not echoed back.
- **ME-002:** No `Authorization` header - 401 `UNAUTHENTICATED`.
- **ME-003:** Malformed/non-JWT token - 401 `UNAUTHENTICATED`.
- **ME-004:** Token's user deleted after issuance - 401 `UNAUTHENTICATED`.
- **ME-005:** Suspended account - 403 `ACCOUNT_NOT_ACTIVE`.

### Category 8: Guard Rails on Non-Auth Routes - `admin.test.ts`, `admin-metrics.test.ts`, `profile.test.ts`, `summary-routes.test.ts`
- Admin endpoints (`/metrics`, `/audit-logs`, `/users`, `/reports`, `/categories`, `/settings`) without a token - 401.
- Profile endpoints without a valid token - 401.
- Summary endpoints (`/posts/:id/summary`, `/refresh`) without a token - 401.

### Category 9: Auth Service, Unit (mocked repo) - `auth.service.test.ts`
- **SV-REG-01/02:** `register()` happy path and duplicate email rejection.
- **SV-LOG-01..04:** `login()` happy path, unknown email, wrong password, non-active status.
- **SV-LOGOUT-01..03:** `logout()` happy path and no-op variants (null cookie, unknown session).
- **SV-REF-01..04:** `refresh()` happy path (rotation), null cookie, invalid session, suspended user.
- **SV-PWD-01..03:** `changePassword()` happy path, wrong current password, unknown user.

### Category 10: Lib Unit Tests (JWT, bcrypt, rate limiter) - `jwt.test.ts`, `password.test.ts`, `rate-limit.test.ts`
- **JWT-01..03:** Sign/verify round-trip, tampered signature rejected, expiry enforced (15-min TTL).
- **PWDH-01..03:** Hash/verify round-trip, wrong password rejected, distinct salts per hash.
- **RL-01..03:** 15-per-60s window enforced (429 + `Retry-After`), keyed per user vs. anonymous, no-op under `NODE_ENV=test`.

### Category 11: Shared Schema Validation - `src/shared/schemas/auth.test.ts`
- **SH-01..05:** `usernameSchema` - valid formats, too short/long, invalid characters, reserved names.
- **SH-06..09:** `RegisterRequest` - happy path, invalid email, weak password, email normalization.
- **SH-10..12:** `LoginRequest` / `ChangePasswordRequest` - required fields, same-password rejection, happy path.

---

### Overall Quality Analysis

- **Incorrect Assertions (contradicted production behavior):**
  - GATE-001 and LOGOUT-003 asserted **401** for a tokenless `POST /logout`, but logout is deliberately idempotent (`200 { ok: true }` no-op) so guests can always complete a logout.
  - SV-PWD-02 asserted the wrong error class (`InvalidCredentialsError`) instead of the actual `InvalidCurrentPasswordError` / `INCORRECT_CURRENT_PASSWORD` the service throws.
  - => Both fixed this review, see **2. Refine**.

- **Loose Assertions:**
  - SOC-004 matched the OAuth redirect `Location` header with a whole-string regex (`/\/\?token=/`) instead of parsing it, coupling the test to `FRONTEND_URL`'s current format rather than its actual contents.
  - => Fixed this review, see **2. Refine**.

- **Coverage Gaps:**
  - `GET /api/v1/auth/me` (Category 7) had **zero** tests before this review, only exercised indirectly by other flows.
  - `requireGuest` (409 `ALREADY_SIGNED_IN`) had no test anywhere in the suite.
  - `EMAIL_TAKEN` was only asserted at the service tier (SV-REG-02); nothing proved the HTTP layer surfaced it correctly through `handleAuthError`.
  - => All closed this review, see **2. Refine**.
  - The `<500ms` NFR check (`expectFastResponse`, used in REG-001/LOG-001) reads an `x-response-time` header that **no production code actually sets**, so it silently no-ops on every real run instead of measuring anything. => Still open, requires a production code change out of this review's scope.

- **Accepted Design Choice, No Issue:**
  - `auth.login.test.ts` (Category 2) seeds users via `POST /register` rather than direct DB inserts, coupling login tests to register. Reviewed and kept: it exercises a real, already-tested code path instead of risking DB rows that drift from the real schema/hashing logic.

- **Good Error Boundaries & Coverage:**
  - No user enumeration: LOG-002/LOG-003 return an identical error payload for wrong password vs. unknown email.
  - Refresh token rotation and revocation are enforced server-side and proven end-to-end (REF-001, LOGOUT-002).
  - The session cookie contract (`HttpOnly` + `SameSite=Lax` + `Path=/api/v1/auth` + clear on logout/expiry) is asserted on every route that sets one.
  - Mid-session account status changes (suspended/banned) are re-checked on every authenticated request, covered on both `/refresh` (REF-005) and `/me` (ME-005).

---

## 2. Refine

### Category 1: Registration
- **Add Missing Edge Cases:**
  1. *Duplicate email at route level (REG-006):* `POST /register` with an already-registered email now asserts **409 `EMAIL_TAKEN`** end-to-end through `handleAuthError`, not just at the service tier.
  2. *`requireGuest` gating (REG-007):* `POST /register` with an existing Bearer token now asserts **409 `ALREADY_SIGNED_IN`**.

### Category 2: Login
- **Reviewed, no change:** seeding via `POST /register` (see Overall Quality Analysis) was evaluated and kept as-is - it's the more realistic integration-test pattern here, not a defect.

### Category 3: Logout & Session Gating
- **Fix Incorrect Assertions (GATE-001, LOGOUT-003):** Both expected 401 for a tokenless `POST /logout`; replaced with the documented, security-correct contract, `200 { ok: true }`, idempotent no-op, with an explanatory comment so a future contributor doesn't "fix" it back to 401.

### Category 5: Password Change
- **Fix Incorrect Assertion (SV-PWD-02):** Changed from asserting the internal `InvalidCredentialsError` class to asserting the observable contract: `rejects.toMatchObject({ code: "INCORRECT_CURRENT_PASSWORD", status: 401 })`.

### Category 6: Social Auth (Google OAuth)
- **Fix Loose Assertion (SOC-004):** Replaced the whole-string regex match on `Location` with `new URL(...)` parsing, asserting `pathname === "/"` and `searchParams.get("token")`/`get("new")` directly, precise and independent of `FRONTEND_URL`'s exact format.

### Category 7: GET /me (OAuth Redirect Helper)
- **Add Missing Test Cases (new file `auth.me.test.ts`):** This route had no coverage at all before this review. Added ME-001 through ME-005: happy path with a valid token, no token, malformed token, token for a deleted user, and token for a suspended account. Full detail in §3.9.

### Still Open (out of scope for this review)
- **`<500ms` NFR check never actually measures anything:** `expectFastResponse` reads an `x-response-time` header that no production code sets. Fixing this requires adding a real timing header in production code (`src/backend/index.ts`), which is outside this review's test-only scope. Left as a recommendation for a future change that includes production code.

No changes were needed in Categories 4 (Refresh), 8 (Guard Rails), 9 (Auth Service unit), 10 (Lib unit), or 11 (Schema validation), reviewed and confirmed correct.

**Net result:** 3 incorrect assertions fixed, 7 tests added (2 route-level, 5 in a new file), 1 loose assertion tightened, 1 gap reviewed and intentionally left unchanged, 1 gap left explicitly open pending a production code change. 12 → 13 files, 71 → 78 tests, all passing, zero production code touched.

---

## 3. Full Test Case Reference, Route / Integration Tests (Tier-2)

Legend, **Setup** = preconditions/DB seeds; **Input** = request; **Output** = expected response (status, body, headers, DB state). Rows tagged *(new, N#)* or *(refined, D#)* are covered in §2.

### 3.1 POST /api/v1/auth/register (US1) - `auth.register.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| REG-001 | `clearDb()` | `POST /api/v1/auth/register`<br>`{ email: "user_<hex>@test.local", username: "testuser_<hex>", password: "P@ssw0rd_<hex>" }` | **201**; `body.user` = `{ role: "standard", status: "active", username: <uname> }`; `accessToken` non-empty string; elapsed < 2000ms; `Set-Cookie` contains `refresh_token=…` with `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth`. |
| REG-002 | - | Register `email1` + username `same_handle` → 201; then register `email2` + username `same_handle` | Second call **409**; `error.code = "USERNAME_TAKEN"`; `error.message` matches `/already taken/i`. |
| REG-003 | - | `GET /api/v1/auth/check-username?username=<uname>` before and after registering `<uname>` | Before: **200** `{ available: true }`. After: **200** `{ available: false }`. |
| REG-004 | - | Register with password `"short"` (5 chars) | **422**; `error.code = "VALIDATION"`; `error.fields.password` defined. |
| REG-005 | - | Register with email `"not-an-email"` | **422**; `error.code = "VALIDATION"`; `error.fields.email` defined. |
| REG-006 *(new, N1)* | - | Register `email` + `uname1` → 201; then register the **same** `email` with `uname2` | Second call **409**; `error.code = "EMAIL_TAKEN"`; `error.message` matches `/already exists/i`. |
| REG-007 *(new, N2)* | - | `POST /api/v1/auth/register` with `Authorization: Bearer invalid-token-xyz` set (any Bearer value - `requireGuest` only checks header presence) | **409**; `error.code = "ALREADY_SIGNED_IN"`; `error.message` matches `/already signed in/i`. |

### 3.2 POST /api/v1/auth/login (US2) - `auth.login.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| LOG-001 | Register active user | `POST /api/v1/auth/login`<br>`{ email, password }` | **200**; `body.user` = `{ role: "standard", status: "active", email }`; non-empty `accessToken`; elapsed < 2000ms; `refresh_token` cookie with `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth`. |
| LOG-002 | Register active user | Login with **wrong password** | **401**; `error.code = "INVALID_CREDENTIALS"`; `error.message = "Invalid email or password"`; **no `fields` key** (no field disclosure). |
| LOG-003 | - | Login with unknown email `nobody_<ts>@nowhere.io` | **401**; identical generic `INVALID_CREDENTIALS` payload as LOG-002 (no enumeration). |
| LOG-004 | User seeded with status `suspended` / `banned` / `pending` (via `UPDATE user_accounts`) | Login with correct credentials (each status) | **403**; `error.code = "ACCOUNT_NOT_ACTIVE"`; `error.message = "Your account is not currently available"`. |

### 3.3 POST /api/v1/auth/logout (US3) - `auth.logout.test.ts`, `auth.gating.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| LOGOUT-001 | Register; capture `accessToken` + `refreshCookie` | `POST /api/v1/auth/logout` with `Authorization: Bearer <token>` and `Cookie: <refreshCookie>` | **200**; `body = { ok: true }`; `Set-Cookie` clears `refresh_token` (`Max-Age=0`/`Expires=Thu, 01 Jan 1970`); refresh session revoked server-side. |
| LOGOUT-002 | From LOGOUT-001 | `POST /api/v1/auth/refresh` reusing the (now revoked) cookie | **401** - proves server-side revocation. |
| LOGOUT-003 *(refined, D2)* | No token, no cookie | `POST /api/v1/auth/logout` with empty body | **200**; `body = { ok: true }` - idempotent no-op by design. |

### 3.4 POST /api/v1/auth/refresh (US4) - `auth.refresh.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| REF-001 | Register; capture `refreshCookie` | `POST /api/v1/auth/refresh` with `Cookie: <refreshCookie>` | **200**; non-empty `accessToken`; `body.user` = `{ role: "standard", status: "active" }` with email; response sets a **new** `refresh_token` cookie (rotation), value ≠ old cookie; old refresh session revoked in DB. |
| REF-002 | Register; then `UPDATE refresh_sessions SET expires_at = now() - interval '1 day'` | Refresh with the expired cookie | **401**; `Set-Cookie` clears the cookie (`Max-Age=0`/`1970`). |
| REF-003 | Register; then `UPDATE refresh_sessions SET revoked_at = now()` | Refresh with the revoked cookie | **401**; `error.code = "INVALID_REFRESH"`, message `"Session expired"`. |
| REF-004 | Register; tamper last char of cookie value | Refresh with tampered cookie | **401** (secret hash mismatch). |
| REF-005 | Register; then `UPDATE user_accounts SET status='suspended'` where email | Refresh with still-valid cookie | **403**; `Set-Cookie` clears the cookie. |

### 3.5 PATCH /api/v1/auth/password (US5) - `auth.password.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| PWD-001 | Register; capture `accessToken`, old `password` | `PATCH /api/v1/auth/password` with `Authorization: Bearer <token>`<br>`{ currentPassword: <old>, newPassword: <new> }` | **200**; `body = { ok: true }`. Then `POST /login` with **new** password → **200**; with **old** password → **401**. |
| PWD-002 | Register; token | Wrong current password: `currentPassword: "wrongoldpwd1"` | **401**; `error.code = "INCORRECT_CURRENT_PASSWORD"`; `error.message = "Incorrect current password"`. |
| PWD-003 | Register; token | `newPassword` = current password | **422**; `error.code = "VALIDATION"`; `error.fields.newPassword` defined. |
| PWD-004 | Register; token | Same with `newPassword: "short"` | **422**; `error.fields.newPassword` defined. |
| PWD-005 | - | `PATCH /api/v1/auth/password` with **no** `Authorization` header | **401** `<missing token>`. |

### 3.6 Social auth, Google OAuth (US social) - `auth.social.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| SOC-001 | Empty DB | `GET /api/v1/auth/google?mode=popup` | **302** to `…/auth/google/callback?…` or `google.com`. |
| SOC-002 | Empty DB | `GET /api/v1/auth/google/callback?code=mock_google_code&state=popup&mock_email=testgoogle@example.com&mock_name=GoogleTester` | **200** HTML containing `SOCIAL_AUTH_SUCCESS` and `"isNewUser":true`; sets `refresh_token` cookie; DB row in `user_accounts` (email `testgoogle@example.com`) and `user_social_links` (provider `google`) created. |
| SOC-003 | From SOC-002 (same email called twice) | Second callback reusing the same `mock_email` | First call: `"isNewUser":true`; second call with the same email: **200** `"isNewUser":false` (returning user, link reused, no duplicate account). |
| SOC-004 *(refined, gap #1)* | - | `GET /api/v1/auth/google/callback?code=mock_google_code&state=redirect&mock_email=redirectgoogle@example.com` | **302**; parsed `Location` has `pathname === "/"`, a truthy `token` query param, and `new=1` (access token passed to frontend). |
| SOC-005 | - | `GET /` (server root) | **200** `{ ok: true, message: "FOZ API Backend" }`. |

### 3.7 Auth gating (SC-006) - `auth.gating.test.ts`

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| GATE-001 *(refined, D1)* | No token | `POST /api/v1/auth/logout` | **200** `{ ok: true }` - idempotent. |
| GATE-002 | No token | `PATCH /api/v1/auth/password` `{ currentPassword: "anything", newPassword: "newpassword1" }` | **401** `UNAUTHENTICATED`. |
| GATE-003 | No cookie | `POST /api/v1/auth/refresh` | **401** `INVALID_REFRESH` (message `"Session expired"`). |

### 3.8 AuthN gating on non-auth resources (guard rails)

*These aren't `auth.*` test cases with their own TC ids - they're gating checks that live inside other domains' test files (`admin.test.ts`, `admin-metrics.test.ts`, `profile.test.ts`, `summary-routes.test.ts`), listed here because they exercise the same `requireAuth`/`requireAdminRole` middleware.*

| Input | Expected output |
| :--- | :--- |
| `GET /api/v1/admin/metrics` (no token) | **401** `UNAUTHENTICATED` |
| `GET /api/v1/admin/audit-logs` (no token) | **401** |
| `GET /api/v1/admin/users` (no token) | **401** |
| `GET /api/v1/admin/reports` (no token) | **401** |
| `GET /api/v1/admin/categories` (no token) | **401** |
| `GET /api/v1/admin/settings` (no token) | **401** |
| Profile endpoints without a valid token | **401** (admin `-metrics` suite, profile suite) |
| Summary endpoints `/api/v1/posts/:id/summary` + `/refresh` without token | **401** (Constitution Principle VI, guests never trigger AI; covered in `summary-routes.test.ts`) |

### 3.9 GET /api/v1/auth/me (OAuth redirect helper) - `auth.me.test.ts`

*New file, added this review, see §2, Category 7.*

| TC | Setup | Input | Expected output |
| :--- | :--- | :--- | :--- |
| ME-001 *(new, N3)* | Register active user; capture `accessToken` | `GET /api/v1/auth/me` with `Authorization: Bearer <token>` | **200**; `body.user` = `{ role: "standard", status: "active" }` with `id`/`email`/`username` present; `body.accessToken` **undefined** (no secrets echoed back). |
| ME-002 *(new, N4)* | - | `GET /api/v1/auth/me` with no `Authorization` header | **401**; `error.code = "UNAUTHENTICATED"`. |
| ME-003 *(new, N5)* | - | `GET /api/v1/auth/me` with `Authorization: Bearer not-a-jwt` | **401**; `error.code = "UNAUTHENTICATED"`. |
| ME-004 *(new, N6)* | Register active user; capture `accessToken`; then `DELETE FROM user_accounts WHERE email = <email>` | `GET /api/v1/auth/me` with the now-orphaned `accessToken` | **401**; `error.code = "UNAUTHENTICATED"` (proves the user row is re-checked per-request, not just the JWT signature). |
| ME-005 *(new, N7)* | Register active user; capture `accessToken`; then `UPDATE user_accounts SET status='suspended'` | `GET /api/v1/auth/me` with the still-valid `accessToken` | **403**; `error.code = "ACCOUNT_NOT_ACTIVE"`; `error.message = "Your account is not currently available"`. |

---

## 4. Full Test Case Reference, Unit Tests (Tier-1)

### 4.1 `auth.service.ts` (mocked repos) - `auth.service.test.ts`

| TC | Mocks / Setup | Input | Expected result |
| :--- | :--- | :--- | :--- |
| SV-REG-01 | `findUserByEmail`→`undefined`, `findUserByUsername`→`undefined`, `createUserWithProfile`→user `u1`; `issueRefreshToken`→`{id:"id-123",secret:"secret-456",expiresAt:2030}`; `signAccessToken`→`"access-token-mock"` | `register({ email, password:"abcdefgh", username:"u1", displayName:"User 1", location:"Loc", website:"https://foz.dev" })` | `auth.user.id="u1"`, `auth.user.username="testuser"`, `auth.accessToken="access-token-mock"`; `cookie.name="refresh_token"`, `cookie.value="id-123.secret-456"`, `httpOnly=true`, `sameSite="lax"`, `path="/api/v1/auth"`. |
| SV-REG-02 | `findUserByEmail`→existing row | `register({ email:"…@…", password:"abcdefgh", username:"u1", … })` | **rejects** `DuplicateEmailError` (409 `EMAIL_TAKEN`). |
| SV-LOG-01 | `findUserByEmail`→active `u1`; `verifyPassword`→`true`; refresh issued as `id-xyz/secret-abc` | `login({ email:"alice@example.com", password:"abcdefgh" })` | `auth.user.id="u1"`, `auth.accessToken="access-token-mock"`, `cookie.value="id-xyz.secret-abc"`. |
| SV-LOG-02 | `findUserByEmail`→`undefined` | `login({ email:"nobody@nowhere.io", password:"abcdefgh" })` | **rejects** `InvalidCredentialsError`; `verifyPassword` **never called**. |
| SV-LOG-03 | `findUserByEmail`→active `u1`; `verifyPassword`→`false` | `login({ email, password:"wrong-password" })` | **rejects** `InvalidCredentialsError`. |
| SV-LOG-04 | `findUserByEmail`→`u1` with status `suspended`/`banned`/`pending`; `verifyPassword`→`true` | `login(...)` per status | **rejects** `AccountNotActiveError` (403). |
| SV-LOGOUT-01 | `findValidRefreshSession`→matching session; `revokeRefreshSession`→`{}` | `logout({ id:"session-id", secret:"raw-secret" })` | `{ ok:true }`; `findValidRefreshSession("session-id","hashed-secret")` and `revokeRefreshSession("session-id")` called. |
| SV-LOGOUT-02 | - | `logout(null)` | `{ ok:true }`; repo **not** called (no-op). |
| SV-LOGOUT-03 | `findValidRefreshSession`→`undefined` | `logout({ id, secret })` | `{ ok:true }`; `revokeRefreshSession` not called (no-op). |
| SV-REF-01 | `findValidRefreshSession`→valid session; `getUserById`→active; new refresh issued (`new-session-id/new-secret`); `revokeRefreshSession` | `refresh({ id:"session-id", secret:"raw-secret" })` | `auth.accessToken="access-token-mock"`; `cookie.value="new-session-id.new-secret"`; **old session revoked**; new session created. |
| SV-REF-02 | - | `refresh(null)` | **rejects** `InvalidRefreshError`. |
| SV-REF-03 | `findValidRefreshSession`→`undefined` | `refresh({ id, secret })` | **rejects** `InvalidRefreshError`. |
| SV-REF-04 | valid session; `getUserById`→user status `banned` | `refresh({ id, secret })` | **rejects** `AccountNotActiveError`. |
| SV-PWD-01 | `getUserById`→`u1`; `verifyPassword`→`true`; `hashPassword`→`"new-hash"` | `changePassword({ userId:"u1", currentPassword:"oldpass1234", newPassword:"newpass1234" })` | `{ ok:true }`; `hashPassword("newpass1234")` and `updatePasswordHash("u1","new-hash")` called. |
| SV-PWD-02 *(refined, D3)* | `getUserById`→`u1`; `verifyPassword`→`false` | `changePassword({ userId:"u1", currentPassword:"wrongoldpwd1", newPassword:"newpass1234" })` | **rejects** `{ code:"INCORRECT_CURRENT_PASSWORD", status:401 }`; `updatePasswordHash` **not** called. |
| SV-PWD-03 | `getUserById`→`undefined` | `changePassword({ userId:"missing", … })` | **rejects** `InvalidCredentialsError`. |

### 4.2 `lib/jwt.ts` - `jwt.test.ts`

| TC | Setup | Input | Expected result |
| :--- | :--- | :--- | :--- |
| JWT-01 | `vi.setSystemTime(2026-01-01T00:00:00Z)` | `signAccessToken({ sub:"u1", role:"standard", status:"active" })` → `verifyAccessToken(token)` | decrypts to `{ sub:"u1", role:"standard", status:"active" }`. |
| JWT-02 | fresh token | `verifyAccessToken(token.slice(0,-2)+"ZZ")` | **throws** (tampered signature). |
| JWT-03 | sign at `2026-01-01T00:00:00Z`; advance clock +20 min (15-min TTL) | `verifyAccessToken(token)` | **throws** (expired). |

### 4.3 `lib/password.ts` (bcrypt) - `password.test.ts`

| TC | Input | Expected result |
| :--- | :--- | :--- |
| PWDH-01 | `hashPassword("correct horse battery staple")` | hash ≠ plaintext; length > 20; `verifyPassword(same, hash)` → `true`. |
| PWDH-02 | hash of the passphrase; `verifyPassword("wrong", hash)` | `false`. |
| PWDH-03 | `hashPassword("same")` twice | hashes differ (random salt). |

### 4.4 `lib/rate-limit.ts` - `rate-limit.test.ts` (production `NODE_ENV` reloaded)

| TC | Setup | Input | Expected result |
| :--- | :--- | :--- | :--- |
| RL-01 | `process.env.NODE_ENV="production"`; reload module | 15 × `POST /test` → then 16th `POST /test` (rolling 60s window, limit 15) | First 15: **200**. 16th: **429** `{ error: { code:"RATE_LIMITED", message:"Too many actions, …" } }`; `Retry-After` between 50 and 60. |
| RL-02 | same, but limiter keys by authed user id | 15 × `POST /test` as `user-123` → 16th as same user; then 1st as anonymous (IP key) | 16th as user: **429**. Anonymous request (different key): **200**. |
| RL-03 | `NODE_ENV="test"`; reload module | 30 × `POST /test` through the limiter | All **200** (limiter is a no-op in test to keep integration tests fast). |

### 4.5 `src/shared/schemas/auth.ts` - `auth.test.ts`

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

## 5. Implementation Notes for the Automated Suite

- **No production code was modified in this review.** The three incorrect-assertion fixes (§2, Categories 3 and 5) corrected test expectations to match documented, security-correct behavior; the seven additions (§2, Categories 1 and 7) are new coverage for routes/middleware that already behaved correctly but had no test; the loose assertion in Category 6 was tightened. The `<500ms` NFR check (§2, "Still Open") remains unaddressed because closing it would require a production code change, out of scope here.
- **Session cookie contract asserted everywhere:** `HttpOnly` + `SameSite=Lax` + `Path=/api/v1/auth` + `Max-Age=0` on clear.
- **No user enumeration:** unknown email and wrong password resolve to the identical `INVALID_CREDENTIALS` payload; asserted at both route (LOG-002/LOG-003) and service (SV-LOG-02/SV-LOG-03) level.
- **Refresh token rotation is enforced server-side:** every successful refresh revokes the previous session and creates a new one; replay of the old cookie returns 401.
- **Rate limiting for auth** is intentionally production-only (`noop` under test) to keep the integration suite under the 500ms per-test NFR; the limiter itself is exercised in isolation with the module reloaded under `NODE_ENV=production`.

---

## 6. HTTP Status Code Reference

Codes that show up throughout §3 and §4, in plain terms:

| Code | Meaning |
| :--- | :--- |
| `200` / `201` | Success (`201` specifically means "a new thing was created," used for register). |
| `401` | "I don't know who you are" - missing, invalid, or expired credentials. |
| `403` | "I know who you are, but you're not allowed" - e.g. account suspended. |
| `409` | Conflict - e.g. username already taken, or you're already logged in and tried to register again. |
| `422` | Your request data itself is invalid - e.g. password too short. This is what `error.fields.password` refers to: which field failed. |

---

## 7. How to Run

```bash
# Full AuthN suite (tier-1 + tier-2) - requires a running Postgres test DB
npx vitest run \
  src/backend/__tests__/integration/auth.register.test.ts \
  src/backend/__tests__/integration/auth.login.test.ts \
  src/backend/__tests__/integration/auth.logout.test.ts \
  src/backend/__tests__/integration/auth.refresh.test.ts \
  src/backend/__tests__/integration/auth.password.test.ts \
  src/backend/__tests__/integration/auth.social.test.ts \
  src/backend/__tests__/integration/auth.gating.test.ts \
  src/backend/__tests__/integration/auth.me.test.ts \
  src/backend/api/auth/auth.service.test.ts \
  src/backend/lib/jwt.test.ts \
  src/backend/lib/password.test.ts \
  src/backend/lib/rate-limit.test.ts \
  src/shared/schemas/auth.test.ts
```

Current result: **13 files, 78 tests, all passing** (`2026-08-23`).
