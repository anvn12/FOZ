# Implementation Plan: User Authentication

**Branch**: `002-user-auth` | **Date**: 2026-07-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-user-auth/spec.md`

## Summary

Implement the full authentication lifecycle (register, sign in, sign out,
refresh, change password) on top of the existing `user_accounts` /
`profiles` schema. Because no query layer exists yet, this feature also
introduces the Drizzle runtime layer (Drizzle `pgTable` schema objects, a
`drizzle()` client, and a small users/accounts repository) and adds one new
`refresh_sessions` table to back the long-lived refresh credential. Auth
follows the constitution: JWT access token (short-lived, client memory) +
refresh token (long-lived, http-only `SameSite=Lax` cookie), bcrypt password
hashing, Zod-validated routes, and role/status gating at the API boundary.

## Technical Context

**Language/Version**: TypeScript ESM, Node.js LTS (pinned via `.nvmrc`).

**Primary Dependencies**: Express, Drizzle (+ `drizzle-kit`), `pg`/`postgres`
driver, Zod, `bcrypt`, `jsonwebtoken` (or equivalent JWT lib), `cookie-parser`,
rate-limit middleware (e.g. `express-rate-limit`), Vitest. Frontend auth state
via `zustand` + `@tanstack/react-query`; forms via `react-hook-form`; toasts
via `react-hot-toast`.

**Storage**: PostgreSQL 16 (existing schema in `backend/db/migrations/0001_initial.sql`
+ `backend/db/schema/*.ts`). New `refresh_sessions` table via a new Drizzle
migration.

**Testing**: Vitest — tier-1 pure unit tests (password hash/compare, token
sign/verify/refresh logic, Zod schema validation) + tier-2 integration tests
for the auth flow against a real Postgres; auth integration tests MUST stay
under the 500ms NFR per the constitution.

**Target Platform**: Web application (Express backend + Vite/React frontend).

**Project Type**: Web application (modular client/server, `src/frontend/` +
`src/backend/` + `src/shared/`).

**Performance Goals**: Auth endpoints comfortably within the <500ms tier-2
NFR; refresh-token verification fast enough to be transparent on page load.

**Constraints**: Constitution-binding — JWT access (15min) + refresh (7day,
http-only `SameSite=Lax` cookie), bcrypt, Zod at API boundary, central
Express error middleware, no plain-text passwords stored/logged, RBAC gauges
guest-vs-member at the API. No E2E tests.

**Scale/Scope**: Single-tenant community app; one refresh session per sign-in
(near a handful per user). Rate limiting on auth endpoints.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Modular Client-Server** — Auth contracts (request/response DTOs, the
  refresh-cookie name, error envelopes) live in `src/shared/` as Zod schemas,
  imported by both sides via path aliases. Business logic stays in
  `src/backend/`; the `src/frontend/` auth store only holds the access token
  and calls the API. ✅
- **II. Enforced Folder Structure** — All new files live under
  `src/backend/` (routes, services, repository, middleware), `src/shared/`
  (DTOs), and `src/frontend/` (auth store, pages). `backend/db/schema/*.ts`
  Drizzle objects replace the interface-only files in place. ✅
- **III. Clean Code & Reusability** — Backend errors flow through the central
  Express error middleware; no inline swallowing. Repository functions are
  reused across register/sign-in/change-password. ✅
- **IV. Security at Every Layer** — JWT access + refresh cookie, bcrypt,
  `role` + `status` gating at the API via middleware (not only in the UI).
  Zod validation at the API boundary. Secrets never logged. Rate limiting on
  sign-in/register/refresh. `status` ∈ {`active`} permitted for sign-in;
  `suspended`/`banned` blocked. ✅
- **V. Consistency Over Cleverness** — Uses the binding stack (Express +
  Drizzle + Zod + bcrypt + JWT), no novel auth scheme. ✅
- **VI. AI Service Boundaries** — Not applicable to this feature (no AI
  surface). ✅
- **Quality Standards** — `tsc --noEmit` clean, ESLint + Prettier, Vitest
  tier-1/tier-2; auth integration <500ms; Zod at trust boundaries; central
  errors; no dead code. ✅
- **Governance** — No constitution violation required for this feature. ✅

No Complexity Tracking entries needed — no justified violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-user-auth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── auth-api.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── schemas/
│       └── auth.ts              # Zod DTOs: register/sign-in/change-password req/resp, auth error envelope
├── backend/
│   ├── db/
│   │   ├── client.ts            # drizzle() instance (NEW — the query layer entry point)
│   │   ├── schema/
│   │   │   ├── users.ts         # convert interface-only → Drizzle pgTable objects (user_accounts, profiles)
│   │   │   └── refresh-sessions.ts  # NEW table (replaces/augments users.ts interface)
│   │   ├── migrations/          # drizzle-kit output; includes new refresh_sessions migration
│   │   └── repositories/
│   │       └── users.ts         # query functions: createUser, findUserByEmail, getUserById, updatePasswordHash, create/verify/revoke refresh session
│   ├── api/
│   │   └── auth/
│   │       ├── routes.ts        # POST /register /login /logout /refresh; PATCH /password
│   │       ├── middleware.ts    # requireAuth (verify access JWT), requireGuest, attachUser
│   │       └── auth.service.ts  # orchestrates: hash, compare, sign access, issue/verify refresh, rate-limit hooks
│   ├── lib/
│   │   ├── jwt.ts               # signAccess / verifyAccess
│   │   ├── password.ts         # hashPassword / verifyPassword (bcrypt)
│   │   └── rate-limit.ts        # auth rate-limiter config
│   └── env.ts                  # Zod-validated env (reseats JWT_SECRET, REFRESH_SECRET, bcrypt rounds, cookie ttl)
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── stores/
        │   └── auth.ts              # zustand store: accessToken, user; login/logout/refresh actions
        ├── api/
        │   └── auth.ts              # fetch wrappers calling the auth endpoints (react-query mutations)
        └── pages/
            ├── RegisterPage.tsx     # react-hook-form + Zod-resolver
            └── LoginPage.tsx
```

> Note: the existing repo currently has `backend/db/schema/*.ts` as TS
> interfaces and a hand-written `backend/db/migrations/0001_initial.sql`.
> This feature promotes the schema files to real Drizzle `pgTable` objects
> and uses `drizzle-kit` for the **new** `refresh_sessions` migration; the
> existing `0001_initial.sql` is treated as the baseline (imported as a
> snapshot) so we do not regenerate or rewrite it.

**Structure Decision**: Web-application layout per constitution Principle II.
The query layer (`db/client.ts` + `db/repositories/`) is the new substrate
this feature contributes; auth routes/services/middleware sit on the
`src/backend/api/` layer; shared Zod DTOs sit in `src/shared/schemas/`.

## Phase 0 Research

See [research.md](./research.md) for full findings. Key decisions:

- Promote `backend/db/schema/users.ts` from interface-only to real Drizzle
  `pgTable` objects aligned with `0001_initial.sql`, and add a new
  `refresh_sessions` table for revocable refresh tokens.
- JWT access (15min, client memory) + refresh (7day, http-only
  `SameSite=Lax` cookie), bcrypt password hashing — straight from the
  constitution tech stack.
- A thin repository module is the query layer (the user explicitly noted none
  exists yet); services compose repository + crypto + token helpers.
- Rate-limit sign-in / register / refresh; generic "invalid email or
  password" message; deny sign-in for non-`active` accounts.

All Technical Context entries above were resolved by the constitution and
the existing validated tech-stack docs — no `NEEDS CLARIFICATION` markers
remain.

## Phase 1 Design

### Data Model

See [data-model.md](./data-model.md) for entity definitions, fields,
relationships, and validation rules. The existing entities (UserAccount,
Profile, RoleHistory) are reused as-is; one new entity (RefreshSession) is
introduced.

### Contracts

See [contracts/auth-api.md](./contracts/auth-api.md) for the HTTP endpoints,
request/response DTOs, status codes, and cookie behavior exposed by this
feature. Zod schemas in `src/shared/schemas/auth.ts` are the single source
of truth for these DTOs.

### Quickstart

See [quickstart.md](./quickstart.md) for the lightweight review and local
validation flow.

## Re-check Constitution

- The query layer + auth design keeps the `src/frontend/` + `src/backend/` +
  `src/shared/` separation intact. ✅
- Refresh tokens are stored as revocable server-side rows, so sign-out and
  future "revoke everywhere" are possible — not over-engineered for v1, only
  `refresh_sessions` rows needed for the sign-out story. ✅
- Security at every layer: access + refresh credentials, bcrypt, Zod at API,
  role/status gating middleware, rate limiting, no secret logging. ✅
- No constitution violation introduced. No Complexity Tracking entries. ✅