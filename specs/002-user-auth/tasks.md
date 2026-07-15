# Tasks: User Authentication

**Input**: Design documents from `/specs/002-user-auth/`
- plan.md, spec.md, research.md, data-model.md, contracts/auth-api.md, quickstart.md

**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/

**Tests**: Vitest — tier-1 (pure unit) and tier-2 (integration, DB-backed) per
the constitution; auth integration MUST stay under the 500ms NFR. The
constitution binds these, so test tasks are included (not "optional TDD").

**Organization**: Tasks are grouped by user story. Each user story is an
independently testable increment on top of a shared foundational layer
(Drizzle query layer + auth utilities + shared DTOs).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label for traceability (US1..US5)
- Include exact file paths in descriptions

## Path Conventions

- **Web app** per constitution: `src/backend/`, `src/frontend/`, `src/shared/`
- Schema baseline migration stays in place at `backend/db/migrations/0001_initial.sql` (the imported baseline)
- New Drizzle migrations emit under `src/backend/db/migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the `src/` tree, Node toolchain, container, and path
aliases. The constitution mandates `src/frontend/`, `src/backend/`,
`src/shared/`; this phase creates them.

- [x] T001 Create the canonical folder tree `src/frontend/`, `src/backend/`, `src/shared/`, and the backend sub-folders `src/backend/db/`, `src/backend/db/schema/`, `src/backend/db/repositories/`, `src/backend/db/migrations/`, `src/backend/api/auth/`, `src/backend/lib/`
- [x] T002 Add `package.json` (root, ESM, `type: "module"`), `.nvmrc` pinning the current Node LTS, and `.gitignore` entries for `node_modules/`, `dist/`, `.env`, `coverage/`
- [x] T003 Add `tsconfig.json` (Node + bundler dual) with path aliases `#shared/*`, `#backend/*`, `#frontend/*`; `module: "ESNext"`, `moduleResolution: "bundler"`, `noEmit: true`, `strict: true`
- [x] T004 [P] Configure Vitest (`vitest.config.ts` with the same path aliases) and add ESLint + Prettier with the constitution-bound minimal config
- [x] T005 [P] Add `docker-compose.yml` provisioning PostgreSQL 16 (database `foz_dev`, port 5432, env wired to a `.env.example`)
- [x] T006 [P] Add backend deps: `express`, `drizzle-orm`, `postgres`, `zod`, `bcrypt`, `jsonwebtoken`, `cookie-parser`, `express-rate-limit`, `cors`, `dotenv`; dev deps: `vitest`, `supertest`, `@types/*`, `drizzle-kit`, `typescript`, `eslint`, `prettier`, `tsx`
- [x] T007 [P] Add frontend deps (in a workspace-ish layout if you keep one `package.json`, or a separate `src/frontend/package.json`): `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `react-hot-toast`, `socket.io-client`; dev deps: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `typescript`, `eslint`, `prettier`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the Drizzle query layer, the auth lib utilities, the shared
DTOs, and the auth shell (router + service skeleton + middleware). **No
user story can be tested until this phase is done** because all endpoints,
the data layer, and the shared contracts live here.

**⚠️ CRITICAL**: User story work cannot begin until this phase completes.

- [ ] T008 [P] Create `src/backend/env.ts` exporting a Zod-validated `env` object (DATABASE_URL, JWT_ACCESS_SECRET, JWT_ACCESS_TTL_MIN, REFRESH_TTL_DAYS, BCRYPT_COST, COOKIE_SECURE, NODE_ENV, CORS_ORIGIN); fail-fast at startup; import via `#backend/env`
- [ ] T009 [P] Create `src/backend/lib/password.ts` exporting `hashPassword(plain)` and `verifyPassword(plain, hash)` via bcrypt; cost read from `env.BCRYPT_COST`; **never log the hash or plaintext**
- [ ] T010 [P] Create `src/backend/lib/jwt.ts` exporting `signAccessToken({ sub, role, status })` and `verifyAccessToken(token)`; reads `env.JWT_ACCESS_SECRET` and `env.JWT_ACCESS_TTL_MIN`; throws on invalid/expired
- [ ] T011 [P] Create `src/backend/lib/rate-limit.ts` exporting a configured `authRateLimiter` (express-rate-limit, default 5 attempts / 15 min / IP+email composite key for login/register/refresh)
- [ ] T012 Create `src/backend/db/client.ts` exporting the `drizzle()` instance bound to a `postgres(env.DATABASE_URL)` client; expose the raw `db` and the `pg` client for transactions
- [ ] T013 Create `src/backend/db/schema/users.ts` as real Drizzle `pgTable` objects for `user_accounts` and `profiles` (moved from the old `backend/db/schema/users.ts` and converted from interfaces to typed tables; column names mirror `backend/db/migrations/0001_initial.sql`)
- [ ] T014 Create `src/backend/db/schema/refresh-sessions.ts` as a Drizzle `pgTable` for `refresh_sessions` with `id`, `userAccountId` (FK→`user_accounts.id` ON DELETE CASCADE, indexed), `tokenHash` (indexed), `expiresAt`, `revokedAt`, `createdAt`, `updatedAt` (see `data-model.md`)
- [ ] T015 Create `src/backend/db/schema/index.ts` re-exporting `users` and `refresh-sessions`; update `drizzle.config.ts` to point at `./src/backend/db/schema/index.ts` and out to `./src/backend/db/migrations`
- [ ] T016 Seed the Drizzle migration snapshot so `0001_initial.sql` is the imported baseline (add a `meta/_journal.json` entry + `meta/0001_snapshot.json` matching the current schema), then run `npx drizzle-kit generate` to emit **only** `0002_refresh_sessions.sql` (and its `meta/0002_*.json`); apply both `0001` and `0002` to the dev DB
- [ ] T017 Create `src/shared/schemas/auth.ts` exporting Zod schemas: `RegisterRequest`, `LoginRequest`, `ChangePasswordRequest`, `AuthResponse` (user + accessToken), `RefreshResponse` (`accessToken`), `ErrorEnvelope`, and a reusable `passwordSchema` (min length, configurable; rejects equal to currentPassword via a refinement in `ChangePasswordRequest`)
- [ ] T018 Create `src/backend/api/auth/middleware.ts` exporting `requireAuth` (Bearer access JWT → attaches `req.user = { id, role, status }` re-read from DB) and `requireGuest` (rejects if a valid access token is present); also a `validateBody(schema)` middleware factory
- [ ] T019 Create `src/backend/db/repositories/users.ts` exporting pure functions on the Drizzle `db`: `findUserByEmail(email)`, `getUserById(id)`, `createUserWithProfile({ email, passwordHash, displayName })` (single tx), `updatePasswordHash(id, hash)`, `createRefreshSession(userId, tokenHash, expiresAt)`, `findValidRefreshSession(id, tokenHash)`, `revokeRefreshSession(id)`; all return Drizzle inferred types, never raw password fields unless requested
- [ ] T020 Create `src/backend/api/auth/auth.service.ts` exporting the orchestration functions: `register(input)` (hash → create user+profile+session → sign access → return AuthResponse + refresh cookie payload), `login(input)` (lookup → verifyPassword → status check → create session → sign), `refresh(refreshCookie)` (verify session → revoke + rotate → sign), `logout(refreshCookie)` (revoke session), `changePassword(userId, currentPassword, newPassword)` (verify current → hash new → update)
- [ ] T021 Create `src/backend/api/auth/routes.ts` mounting the auth router at `/auth` with the five endpoints (`POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, `PATCH /password`), each with Zod validation, the rate limiter, the right middleware (`requireGuest` for register/login, `requireAuth` for logout/password, none for refresh), and the correct cookie behavior (see `contracts/auth-api.md`)
- [ ] T022 Create `src/backend/index.ts` (Express app): `cookieParser()`, `express.json()`, `cors(env.CORS_ORIGIN)`, mount `/auth` router, a `/health` 200, and the central error-handling middleware that maps the auth errors (`InvalidCredentialsError`, `AccountNotActiveError`, `InvalidRefreshError`) to the standard error envelope (422/401/403/409)
- [ ] T023 [P] Create `src/frontend/src/stores/auth.ts` (zustand) holding `{ accessToken, user, status }` and actions `setSession({ user, accessToken })`, `clearSession()`, `silentRefresh()` (calls `/auth/refresh` once on app load)
- [ ] T024 [P] Create `src/frontend/src/api/auth.ts` exporting `register(input)`, `login(input)`, `logout()`, `refresh()` fetch wrappers + `useRegister()`, `useLogin()`, `useLogout()` `@tanstack/react-query` mutations
- [ ] T025 [P] Create the Vite/React shell: `src/frontend/index.html`, `src/frontend/src/main.tsx`, `src/frontend/src/App.tsx` (router with `/login`, `/register`, `/` placeholder), `src/frontend/vite.config.ts` (path aliases), `src/frontend/tailwind.config.js` + `src/frontend/postcss.config.js`
- [ ] T026 [P] Add Vitest test scaffolding: `src/backend/__tests__/setup.ts` (loads `dotenv` test env, sets up a transactional test DB helper that truncates between tests), `src/backend/__tests__/fixtures/users.ts` (factory), and a `vitest.config.ts` test path pattern
- [ ] T027 Tier-1 unit tests (no DB): `src/backend/lib/password.test.ts` (hash/verify round-trip; wrong password rejected; constant-time compare holds), `src/backend/lib/jwt.test.ts` (sign/verify round-trip; tampered token rejected; expired token rejected), `src/shared/schemas/auth.test.ts` (each Zod DTO accepts valid + rejects invalid cases; `ChangePasswordRequest` rejects `newPassword === currentPassword`)
- [ ] T028 Tier-2 integration test fixture: `src/backend/__tests__/integration/auth.setup.ts` boots the Express `app` from `src/backend/index.ts` via `supertest` against the test DB; helper `clearDb()` truncates `refresh_sessions`, `profiles`, `user_accounts` in FK-safe order between tests; helper `expectFastResponse(res, maxMs = 500)` for SC-005; companion `src/backend/__tests__/integration/auth.gating.test.ts` asserts that every member-only endpoint (`POST /auth/logout`, `PATCH /auth/password`) returns 401 with no access token, that `POST /auth/refresh` returns 401 with no cookie, and that `POST /auth/refresh` returns 403 + clears the cookie for a `banned` user with a valid cookie (SC-006)
- [ ] T029 Confirm `tsc --noEmit` is clean across the workspace and Vitest tier-1 (`npm test -- --run --project=unit`) is green; each tier-2 auth test MUST also assert response time < 500ms via `expectFastResponse(res)` (SC-005); this is the foundation checkpoint before any user story work

**Checkpoint**: Foundation ready — Drizzle query layer exists, shared DTOs
exist, auth lib utilities are unit-tested, and the Express app boots with
`/health` 200 and `/auth` mounted.

---

## Phase 3: User Story 1 - Register an Account (Priority: P1) 🎯 MVP

**Goal**: A new visitor can register, creating a `UserAccount` + default
`Profile` atomically, and is signed in immediately with an access token in
the response body and a refresh cookie set.

**Independent Test**: From a clean DB, POST `/auth/register` with a valid
email and password returns 201 with an `AuthResponse` and a
`refresh_token` cookie; the same email returns 409; a weak password returns
422; a follow-up `GET /health` does not require auth (guests allowed).

### Tests for User Story 1 ⚠️

> Write tests FIRST; ensure they FAIL before implementation.

- [ ] T030 [P] [US1] Tier-2 integration test in `src/backend/__tests__/integration/auth.register.test.ts`: happy path (201, body, cookie, DB row counts, response time under 2000ms for SC-001), duplicate email (409), weak password (422), invalid email (422), generic error envelope shape, and `Set-Cookie` attributes (`httpOnly`, `sameSite: 'lax'`, `path: '/auth'`, `secure` only when `NODE_ENV === 'production'`)
- [ ] T031 [P] [US1] Tier-1 test in `src/backend/api/auth/auth.service.test.ts` (mocked repo): `register()` returns AuthResponse, issues a refresh session, throws on duplicate email

### Implementation for User Story 1

- [ ] T032 [US1] Implement `register()` in `src/backend/api/auth/auth.service.ts` (depends on T020 skeleton): hash password, call `createUserWithProfile`, create refresh session, sign access, return `AuthResponse` + refresh cookie payload; surfaces a `DuplicateEmailError` mapped to 409 by the central error handler
- [ ] T033 [US1] Wire `POST /auth/register` in `src/backend/api/auth/routes.ts` (depends on T021, T032): `requireGuest`, `authRateLimiter`, `validateBody(RegisterRequest)`, delegate to `auth.service.register()`, set the `refresh_token` cookie (http-only, `SameSite=Lax`, `Path=/auth`, `Secure` per env)
- [ ] T034 [P] [US1] Build `src/frontend/src/pages/RegisterPage.tsx` with `react-hook-form` + `zodResolver(RegisterRequest)`; on success call `useRegister` and `setSession`; toast on error
- [ ] T035 [US1] Add `src/frontend/src/router.tsx` (or extend App.tsx) so the `/register` route renders `RegisterPage` and the successful register navigates to `/` (gated placeholder)

**Checkpoint**: At this point, User Story 1 is fully functional: a brand-new
visitor can register, receive a session, and the FE shows them as signed in.
This is the MVP slice.

---

## Phase 4: User Story 2 - Sign In (Priority: P1)

**Goal**: A returning member can sign in with email + password and receive
the same `AuthResponse` + refresh cookie as registration.

**Independent Test**: Seed an `active` user; POST `/auth/login` returns
200 + cookie; wrong password returns 401 with a single generic message; a
`suspended` user returns 403 with "account not currently available"; an
unknown email returns the same 401 as wrong password (no enumeration).

### Tests for User Story 2 ⚠️

- [ ] T036 [P] [US2] Tier-2 integration test in `src/backend/__tests__/integration/auth.login.test.ts`: happy path (response time under 2000ms for SC-002), wrong password (401 + generic message), unknown email (401 + same message), `suspended` status (403), `banned` status (403), `pending` status treated as not-active (403), and `Set-Cookie` attributes match register
- [ ] T037 [P] [US2] Tier-1 test in `src/backend/api/auth/auth.service.test.ts`: `login()` throws `InvalidCredentialsError` for both wrong-password and unknown-email; throws `AccountNotActiveError` for non-`active`; success path issues a refresh session and access token

### Implementation for User Story 2

- [ ] T038 [US2] Implement `login()` in `src/backend/api/auth/auth.service.ts`: lookup by email, `verifyPassword`, status check (only `active` allowed), create refresh session, sign access, return `AuthResponse` + refresh cookie payload; both lookup-fail and verifyPassword-fail throw the **same** `InvalidCredentialsError` (no enumeration)
- [ ] T039 [US2] Wire `POST /auth/login` in `src/backend/api/auth/routes.ts`: `requireGuest`, `authRateLimiter`, `validateBody(LoginRequest)`, delegate to `auth.service.login()`, set the `refresh_token` cookie
- [ ] T040 [P] [US2] Build `src/frontend/src/pages/LoginPage.tsx` mirroring `RegisterPage.tsx` with `LoginRequest`; on success `setSession` and route to `/`

**Checkpoint**: At this point, User Stories 1 AND 2 both work; a returning
member with no session can sign in, and a brand-new visitor can register.
This is the full P1 MVP.

---

## Phase 5: User Story 3 - Sign Out (Priority: P1)

**Goal**: A signed-in member can end their session on the current device by
revoking the refresh session and clearing the cookie.

**Independent Test**: Sign in (sets cookie); POST `/auth/logout` with a
valid access token returns 200 + clears the cookie; a subsequent
`POST /auth/refresh` with the (now-revoked) old cookie returns 401.

### Tests for User Story 3 ⚠️

- [ ] T041 [P] [US3] Tier-2 integration test in `src/backend/__tests__/integration/auth.logout.test.ts`: signed-in logout returns 200 + `Set-Cookie` carries clear directives (`Max-Age=0` or expired `Expires`); a refresh attempt with the revoked cookie returns 401; logout without `requireAuth` returns 401
- [ ] T042 [P] [US3] Tier-1 test in `src/backend/api/auth/auth.service.test.ts`: `logout()` revokes the session; no-op for missing/expired cookie

### Implementation for User Story 3

- [ ] T043 [US3] Implement `logout()` in `src/backend/api/auth/auth.service.ts`: read refresh cookie, look up + revoke the matching `refresh_sessions` row (if any), return `{ ok: true }`
- [ ] T044 [US3] Wire `POST /auth/logout` in `src/backend/api/auth/routes.ts`: `requireAuth`, light rate limit, delegate to `auth.service.logout()`, clear the `refresh_token` cookie
- [ ] T045 [P] [US3] Add `useLogout()` mutation in `src/frontend/src/api/auth.ts`; in `App.tsx`/a header component, render a "Sign out" button visible when the auth store has a `user`, which calls `useLogout`, awaits the response, then `clearSession()` + route to `/login`

**Checkpoint**: P1 lifecycle complete — register, sign in, sign out all
work end-to-end and revoke the refresh session server-side.

---

## Phase 6: User Story 4 - Stay Signed In Across Sessions (Priority: P2)

**Goal**: A returning visitor with a still-valid refresh cookie is silently
recognized on next visit via `/auth/refresh`, which issues a new access
token and rotates the refresh credential.

**Independent Test**: Sign in; close-and-reopen the app (simulated by
calling `/auth/refresh` with the cookie); receive a new access token and a
new cookie value. After `/auth/logout` (US3), `/auth/refresh` returns 401.
A tampered cookie value returns 401 with no session restore.

### Tests for User Story 4 ⚠️

- [ ] T046 [P] [US4] Tier-2 integration test in `src/backend/__tests__/integration/auth.refresh.test.ts`: happy path (200, new access token, new cookie with the same attributes as login, old session revoked), expired cookie (401), revoked cookie (401), tampered cookie value (401), account now `suspended` (403, cookie cleared)
- [ ] T047 [P] [US4] Tier-1 test in `src/backend/api/auth/auth.service.test.ts`: `refresh()` rotates (old session `revokedAt` set, new session row inserted), fails closed on any error

### Implementation for User Story 4

- [ ] T048 [US4] Implement `refresh()` in `src/backend/api/auth/auth.service.ts`: read cookie, hash the secret part, `findValidRefreshSession(id, tokenHash)`, re-check `user.status === 'active'` (re-reads `UserAccount`), revoke old session, create new session, sign access, return `RefreshResponse` + new cookie payload; any failure clears the cookie and throws `InvalidRefreshError` (401) or `AccountNotActiveError` (403)
- [ ] T049 [US4] Wire `POST /auth/refresh` in `src/backend/api/auth/routes.ts`: `authRateLimiter`, read cookie, delegate to `auth.service.refresh()`, set the rotated `refresh_token` cookie; on error clear the cookie
- [ ] T050 [US4] Implement `silentRefresh()` in `src/frontend/src/stores/auth.ts` and call it once on app load in `src/frontend/src/main.tsx` via a `react-query` `useQuery` keyed on auth status; on success `setSession`, on 401 `clearSession` (so guests land on `/login`)

**Checkpoint**: P2 complete — refresh works; the FE silently restores
sessions on return visits while invalid/expired/revoked cookies are
rejected.

---

## Phase 7: User Story 5 - Change My Password While Signed In (Priority: P3)

**Goal**: A signed-in member can change their password by providing the
current password and a new strong password; the new password is hashed and
persisted, and the next sign-in works with the new password.

**Independent Test**: Sign in; `PATCH /auth/password` with correct current +
new password returns 200; subsequent `POST /auth/login` succeeds with the
new password and fails with the old. Wrong current password returns 401;
new password equal to current returns 422; new password too weak returns
422.

### Tests for User Story 5 ⚠️

- [ ] T051 [P] [US5] Tier-2 integration test in `src/backend/__tests__/integration/auth.password.test.ts`: happy path, wrong current (401), new = current (422), new too weak (422), missing access token (401); subsequent login uses the new password
- [ ] T052 [P] [US5] Tier-1 test in `src/backend/api/auth/auth.service.test.ts`: `changePassword()` verifies current, hashes + updates, throws the right errors

### Implementation for User Story 5

- [ ] T053 [US5] Implement `changePassword()` in `src/backend/api/auth/auth.service.ts`: `verifyPassword(currentPassword, user.passwordHash)`, hash the new password, `updatePasswordHash(userId, newHash)`; throw `InvalidCredentialsError` (401) on mismatch; surface Zod errors (422) for new-password validation
- [ ] T054 [US5] Wire `PATCH /auth/password` in `src/backend/api/auth/routes.ts`: `requireAuth`, `authRateLimiter`, `validateBody(ChangePasswordRequest)`, delegate to `auth.service.changePassword()`
- [ ] T055 [P] [US5] Build `src/frontend/src/pages/ChangePasswordPage.tsx` (or a settings section): form with `currentPassword` + `newPassword` + confirm, Zod resolver, `useMutation` calling `PATCH /auth/password`; on success show a toast and (optional) prompt the user to sign in again

**Checkpoint**: All five user stories are independently functional;
tier-1 + tier-2 tests pass and stay under the 500ms NFR.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Tighten anything that touches every user story, fill gaps the
constitution expects, and run the quickstart validation flow.

- [ ] T056 [P] Central error-handler review in `src/backend/index.ts`: every `throw new ZodError` becomes 422 with `fields`; every `InvalidCredentialsError` is 401 with the single generic message; every `AccountNotActiveError` is 403 with the "not currently available" message; `DuplicateEmailError` is 409; `InvalidRefreshError` is 401. Confirm no error leaks a password hash, an access token, or a refresh token.
- [ ] T057 [P] Security pass: confirm the `refresh_token` cookie is `httpOnly`, `SameSite=Lax`, `Path=/auth`, `Secure` in production; confirm the access token is never written to `localStorage`; confirm `Authorization: Bearer` is the only header carrying the access token; confirm `CORS_ORIGIN` is set to the FE origin and credentials are allowed only where needed
- [ ] T058 [P] Rate-limit audit: `authRateLimiter` applied to register/login/refresh; ensure the limiter is keyed by IP + email (where applicable) and that it does not block legit users but does slow brute-force; document the threshold in a code comment (not a config — keep the standard middleware)
- [ ] T059 [P] Logging audit: confirm access tokens, refresh tokens, password hashes, and passwords are **never** logged at any level; add a smoke test that POSTing register/login/logout/refresh/password produces no secret-bearing log lines
- [ ] T060 [P] Accessibility pass on `RegisterPage.tsx`, `LoginPage.tsx`, and the sign-out button: labels associated to inputs, focus management on submit errors, keyboard-only navigation, color contrast on form errors; meets WCAG 2.1 AA per the constitution
- [ ] T061 [P] Documentation updates: ensure `README.md` (or a new `docs/auth.md`) documents the auth flow at a high level, the env vars in `.env.example` carry inline comments, and `quickstart.md` (in this feature folder) still matches the actual run flow
- [ ] T062 Run `quickstart.md` end-to-end against the dev DB; confirm tsc is clean, ESLint + Prettier pass, Vitest tier-1 + tier-2 pass under 500ms, and the FE can register + login + refresh + logout + change password

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1). **BLOCKS all user stories.**
- **User Stories (Phase 3+)**: All depend on Foundational (Phase 2) completion.
  - US1, US2, US3 share the same service / routes skeleton (T020, T021) — implement T032/T033/T038/T039/T043/T044 in any order, but tests for each should pass before moving to the next story.
  - US4 (Refresh) and US5 (Change Password) depend on the same service / routes skeleton plus US1 (Refresh needs the user+session created at register/login to test against).
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1, Register)**: Can start after Foundational. No dependency on other stories. **MVP.**
- **US2 (P1, Sign In)**: Can start after Foundational. Independent of US1 in code (login does not call register), but US1 is the natural source of a user to sign in with during local testing.
- **US3 (P1, Sign Out)**: Can start after Foundational. Independent in code; needs a signed-in user from US1/US2 to test.
- **US4 (P2, Refresh)**: Can start after Foundational + US1 (or US2) to test against a real session. Independent in code.
- **US5 (P3, Change Password)**: Can start after Foundational + US1/US2 to test against a real user. Independent in code.

### Within Each User Story

- Tier-1 + tier-2 tests FIRST; they MUST fail before implementation.
- Service function → route → frontend (per story).
- Story complete (tests green) before moving to the next priority.

### Parallel Opportunities

- Phase 1 tasks T004/T005/T006/T007 are [P] and can run in parallel.
- Phase 2 tasks T008/T009/T010/T011 are [P] (different files). T013/T014 are [P] (different files). T017/T018/T019/T020/T021 form a dependency chain; T022/T023/T024/T025 are [P] after that. T026/T027 are [P] after T008–T025.
- Within each user story, the two test tasks are [P] (different files).
- Frontend pages and FE api wrappers are [P] where they touch different files.

---

## Parallel Example: User Story 1

```bash
# Launch the two US1 test tasks in parallel (different files):
Task: "Tier-2 integration test in src/backend/__tests__/integration/auth.register.test.ts"
Task: "Tier-1 test in src/backend/api/auth/auth.service.test.ts"

# Then run the US1 implementation in order:
# T032 (service) → T033 (route) → T034 (FE page) → T035 (router)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational. (Heavy — the query layer lives here.)
3. Complete Phase 3: User Story 1 (Register).
4. **STOP and VALIDATE**: run tier-1 + tier-2 tests; demo the FE registration flow end-to-end.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 (Register) → tests green → demo.
3. US2 (Sign In) → tests green → demo. (P1 complete; usable auth lifecycle.)
4. US3 (Sign Out) → tests green → demo. (P1 lifecycle now closed.)
5. US4 (Refresh) → tests green → demo. (Sessions survive reloads.)
6. US5 (Change Password) → tests green → demo.
7. Polish (Phase 8) → quickstart passes.

### Parallel Team Strategy

With multiple developers, after the Foundational checkpoint:
- Developer A: US1 (Register) → US2 (Sign In) → US3 (Sign Out)
- Developer B: US4 (Refresh) — can start as soon as the service skeleton (T020) is done, even before US1/US2 land, but tests will need a real session (so test against a fixture)
- Developer C: US5 (Change Password) + Polish

---

## Notes

- The `refresh_token` cookie MUST be http-only and `SameSite=Lax`; the access
  token MUST live in client memory (zustand) only.
- Email verification and forgotten-password / email-based reset are
  **out of scope** for v1 (per spec FR-016 and research.md Decision 8).
- Refresh-rotation is the minimal theft mitigation in v1; reuse-detection
  across the rotation family is a future upgrade (a `ponytail:` note
  belongs in `auth.service.ts` at the rotate site).
- The Drizzle snapshot at `0001` is the imported baseline — do **not**
  regenerate it; only `drizzle-kit generate` is run for the new
  `refresh_sessions` table in T016.
- `ponytail:` notes in the code are expected at the deliberate simplifications:
  bcrypt cost (recalibrate on real hardware), rate-limit thresholds (raise
  if abuse appears), refresh-reuse detection (add when needed), per-account
  lockout (add when abuse appears).
