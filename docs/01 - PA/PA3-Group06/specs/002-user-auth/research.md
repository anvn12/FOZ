# Research: User Authentication

## Decision 1: Promote the schema files to real Drizzle `pgTable` objects

- **Decision**: Convert `src/backend/db/schema/*.ts` from interface-only type
  files into Drizzle `pgTable` definitions that exactly match the existing
  `src/backend/db/migrations/0001_initial.sql`, then add the query layer on top.
- **Rationale**: The user noted "no query layer yet." The schema files
  today are TS interfaces; they describe the shape but cannot be queried.
  Drizzle is the binding ORM, so the right move is to make the schema files
  the Drizzle source of truth and add `db/client.ts` (`drizzle()` instance)
  plus a repository module. This unlocks auth and every future feature.
- **Alternatives considered**:
  - Keep interfaces and hand-write SQL strings — rejected: bypasses the
    binding ORM, loses type-safe queries, and is the kind of clever
    shortcut the constitution rejects (Principle V).
  - Regenerate migration 0001 with `drizzle-kit` — rejected: 0001 already
    ran as the baseline; we treat it as an imported snapshot and only emit
    a **new** migration for `refresh_sessions`, avoiding destructive churn.

## Decision 2: Add a `refresh_sessions` table for revocable refresh tokens

- **Decision**: Persist refresh tokens server-side in a new
  `refresh_sessions` table keyed by an opaque token id, scoped to a user,
  with `expiresAt` and `revokedAt` columns.
- **Rationale**: Story 3 (sign out) and Story 4 (stay signed in) require a
  credential the server can revoke. A server-side row (vs. a stateless
  signed refresh JWT) lets sign-out actually invalidate the session and
  leaves a clean upgrade path to "revoke everywhere" later without redesign.
  This is a stored credential hash, not a secret-bearing JWT; only an
  opaque lookup id + a hash of the token lives in the row.
- **Alternatives considered**:
  - Pure stateless refresh JWT with no DB row — rejected: sign-out can only
    rely on client-side cookie deletion, which does not protect a stolen
    refresh token. Revocation requires a server-side record.

## Decision 3: JWT access (15min, client memory) + refresh (7day, http-only `SameSite=Lax` cookie)

- **Decision**: Access token is a short-lived JWT held in client memory
  (zustand store) and sent as a `Bearer` header; refresh token is a 7-day
  opaque credential in an http-only `SameSite=Lax` cookie, rotated on each
  refresh.
- **Rationale**: Directly from the validated backend tech stack and
  constitution Principle IV. http-only + `SameSite=Lax` mitigates XSS
  exfiltration and most CSRF; the access token never touches `localStorage`
  longer than its 15min lifetime.
- **Alternatives considered**:
  - Store the access token in `localStorage` — rejected: longer XSS exposure
    window and visible to any third-party script.
  - Single long-lived session cookie — rejected: the constitution mandates
    the access/refresh split; a single cookie can't be both short-lived and
    seamless across browser restarts.

## Decision 4: bcrypt for password hashing

- **Decision**: Hash all passwords with bcrypt at a standard cost (e.g. 12
  rounds, configurable via Zod-validated env); store only the hash; compare
  via `bcrypt.compare`; never log or return the hash or plaintext.
- **Rationale**: Binding per the constitution and tech stack. Bcrypt is
  purpose-built for password storage and provides a tunable cost knob that
  hardware calibration can raise later (the constitution's "leave the
  calibration knob" principle).
- **Alternatives considered**: argon2 — rejected: not the validated choice
  and out of scope for v1 (constitution Amendment process is heavier than
  this feature warrants).

## Decision 5: Shared Zod DTOs are the single source of truth for auth requests/responses

- **Decision**: Define register/sign-in/change-password/refresh request and
  response shapes in `src/shared/schemas/auth.ts`; the backend reuses them
  in its Zod validation middleware, and the frontend reuses them via the
  path alias (e.g. in `react-hook-form` Zod resolvers).
- **Rationale**: Constitution Principle I — `src/shared/` Zod schemas are
  the single source of truth; duplicating types across client and server is
  a defect.
- **Alternatives considered**: Define validation only on the backend and
  mirror types by hand in the frontend — explicitly rejected by the
  constitution.

## Decision 6: Generic "invalid email or password" + deny non-`active` accounts

- **Decision**: Failed sign-in returns a single generic message that does
  not reveal which field was wrong. Sign-in for `status ∈ {suspended, banned}`
  is rejected with an "account not currently available" message. `pending`
  is not assigned by v1 auth (deferred email-verification state).
- **Rationale**: Spec FR-005 / FR-006 (avoid user enumeration) and
  constitutional "Security at Every Layer" + "do not leak account state
  to attackers." A banned/suspended user must be told *why* (account
  unavailable) but a wrong-email attempt must not be distinguished from a
  wrong-password attempt.
- **Alternatives considered**: Distinct per-field error messages — rejected:
  enables account enumeration.

## Decision 7: Rate-limit auth endpoints at the API boundary

- **Decision**: Apply standard rate limiting to `POST /register`,
  `POST /login`, `POST /refresh`, and `PATCH /password` (keyed by IP and/or
  email) to slow credential-guessing and registration abuse.
- **Rationale**: Constitution Principle IV — rate limiting MUST be applied
  to costly/abuse-prone endpoints.
- **Alternatives considered**: A full lockout/throttle account-state model —
  rejected for v1 as over-engineering; standard fixed-window/rolling rate
  limit middleware is the boring, sufficient choice. A `ponytail:` comment
  will note the upgrade path to per-account lockout if abuse appears.

## Decision 8: Out-of-scope explicitly deferred

- **Decision**: Email verification and forgotten-password / email-based
  reset are **out of scope** for v1 (documented in spec Assumptions and
  FR-016). Password change is available only while signed in (Story 5).
- **Rationale**: No outbound email integration exists in the project yet.
  Adding one is its own feature and a security-sensitive scope decision.
- **Alternatives considered**: Building a reset flow now — rejected: it
  would require an email provider dependency and token-delivery surface
  that the constitution/tech-stack docs do not yet validate.