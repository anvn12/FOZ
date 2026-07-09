# Backend Tech Stack — Ideas

Status: Validated through brainstorming. Ready to feed into a spec / implementation.
Author: brainstorming session, to be owned by backend lead (Trọng).

This is an ideas file, not a spec. It records the validated decisions and the
reasoning behind each, so the backend lead can turn it into a formal spec or
scaffold without re-litigating choices. Companion to
`docs/frontend/techstack.md`.

> The governing decision: **TypeScript on both sides.** The two features that
> could have pulled toward Python (AI TL;DR, trending recommendation) are both
> non-ML — one is an outbound HTTP call to an LLM provider, the other is a SQL
> scoring query. Python's AI/ML ecosystem is real but irrelevant to our scope.
> TS-for-both wins on: matching `socket.io-client` with the reference socket.io
> server, shared types across `src/frontend` and `src/backend`, one toolchain
> for a 4-person team on a deadline.

## Stack at a glance

| Layer | Choice |
| --- | --- |
| Runtime | Node.js (current LTS), ESM, `.nvmrc` pin |
| Web framework | Express + hand-wired Zod validation middleware + central error handler |
| Database | PostgreSQL 16, via `docker-compose.yml` |
| ORM / query layer | Drizzle (SQL-visible), `drizzle-kit` for migrations |
| Realtime | socket.io server on Express's `httpServer`, 3 events, inline emits |
| Auth | JWT access (15min, client memory) + refresh (7day, http-only `SameSite=Lax` cookie); bcrypt; `role` column + hardcoded permission matrix |
| AI / TL;DR | One file, `for` loop over `fetch`-based OpenAI/Gemini providers, pure-function prompt, no cache/streaming in v1 |
| Trending / feed | SQL scoring `(likes×1 + comments×1.5 + velocity×3) × EXP(-age_hours/48)`, 30s in-process single-flight cache, 2 indexes |
| Shared types | `src/shared/` Zod schemas as source of truth, path aliases (no workspace package), no codegen/tRPC |
| Validation | Zod at inbound trust boundaries only |
| Config | Zod-validated env, fail-fast at startup |
| Tests | Vitest — tier-1 pure unit tests (the self-checks), tier-2 integration for auth + feed <500ms NFR, no E2E |

---

## 1. Runtime + web framework

- **Node.js LTS, ESM.** Matches the frontend's ESM story; one module system
  across the repo. Pin the actual LTS version in `.nvmrc` so all four dev
  machines agree.
- **Express, not Fastify or NestJS.**
  - Express is the safe, familiar call — everyone knows it, no framework
    learning ramp for a team on a deadline.
  - Fastify was the alternative — faster, batteries-included (validation,
    logging) — but Express familiarity wins for this team.
  - NestJS explicitly rejected: DI containers, module decorators, providers,
    pipes are ceremony that pays off in a 15-engineer long-lived service, not
    a 4-person course project. A `createPost` controller is ~10 lines in
    Express vs a controller + DTO class + service + module in NestJS.
- **The cost of Express, accepted:** Express gives nothing for
  validation/error-handling, so we wire it ourselves — a Zod validation
  middleware (~15 lines) + a central error handler (~15 lines). ~30 lines of
  one-time glue, folded into Section 8.
- **socket.io attaches to Express's `httpServer` in one line** —
  `new Server(createServer(app))`. Same friction as Fastify, no wrapper needed.

## 2. Database + ORM

- **PostgreSQL 16, not SQLite.** Two load-bearing reasons:
  1. **The forum is write-concurrent.** Every like and comment is a write.
     SQLite serializes all writes through one lock; under modest demo
     concurrency you get `SQLITE_BUSY` errors. Postgres's row-level locking
     makes this a non-issue.
  2. **The trending query is Postgres-shaped.** Uses `EXTRACT(EPOCH FROM ...)`,
     `EXP()`, `INTERVAL '24 hours'` — all native. SQLite's date functions are
     string-based and the decay math gets awkward.
  - Run via `docker-compose.yml` (`postgres:16` service + volume) so every dev
    gets an identical DB with `docker compose up`. App reads `DATABASE_URL`.
- **Drizzle, not Prisma.** Decisive factor: the team knows raw SQL and is
  being graded partly on SQL/database competence (Project Plan: backend lead
  "designs the database schema, establishes API architectures, leads
  server-side performance strategies").
  - Prisma hides SQL behind a DSL — a productivity win *if* you already
    understand relational modeling and want to skip queries, but a trap for a
    team *learning databases*: when Prisma generates a slow N+1 or a relation
    doesn't load, you can't reason about why because you never saw the SQL.
  - Drizzle meets the team where they are: `select().from(posts).innerJoin(...)`
    is SQL you can see, the grader can read, and you can explain next month.
  - The trending query (the one complex query) is native to Drizzle's SQL-ish
    API; in Prisma it'd be an `$queryRawTyped` escape hatch back to SQL.
- **Schema in `src/backend/db/schema.ts`**; `drizzle-kit` generates versioned
  migrations. Two indexes (see Section 6) declared via `pgIndexes`.

## 3. Realtime (socket.io server)

- **One process, one port.** socket.io attaches to Express's `httpServer`;
  Express handles REST, socket.io multiplexes on the same server via upgrade.
  No separate realtime service.
- **The governing rule (from `docs/frontend/techstack.md`): socket.io carries
  signals, not payloads.** Server emits `thread:created` /
  `comment:created` / `like:updated`; the client reacts with react-query
  invalidations. We do not stream full objects over the socket. One source of
  truth (the REST cache), realtime still instant.
- **The whole event list — build no more than these three:**
  - `thread:created` (no payload) → invalidate `['posts','feed']`
  - `comment:created` (`{ postId }`) → invalidate `['post',postId,'comments']`
  - `like:updated` (`{ targetId, type }`) → invalidate the like-count query
  - If someone proposes a fourth: name the README feature it serves.
    Moderation/reporting does *not* need realtime.
- **Emit from the route handler that performed the mutation**, right after the
  DB write succeeds — one `io.emit` line inline. Not an event bus, not an
  abstraction. Three call sites does not justify a pub/sub layer (interface
  with one implementation = YAGNI). Extract a helper the day there are ten emit
  sites *and* cross-service fanout.
- **Auth on the socket is mandatory** — sockets are a trust boundary. Use
  socket.io's `auth` middleware to verify the JWT on connect:
  `io.use((socket, next) => { verify(socket.handshake.auth.token); ... })`.
  Same JWT as REST (Section 4). Guests can connect read-only (receive
  `thread:created`) but never emit — sockets are server→client only in our
  design, so this is naturally enforced.
- **No socket rooms/namespaces in v1.** Naive `io.emit` broadcasts to every
  connected client — fine at demo scale (tens of clients, three events).
  Per-post rooms (`socket.join('post:42')` + emit to room) are the upgrade
  path if we ever need "only notify clients viewing *this* post." Not now.
  `ponytail:` comment names the ceiling and the upgrade.

## 4. Auth

### Token strategy — JWT access + refresh, http-only cookie for refresh

- **Access token (15 min TTL)** lives in client memory (zustand `sessionStore`),
  sent as `Authorization: Bearer <token>`. Short-lived so role changes and
  revocations take effect within 15 minutes.
- **Refresh token (7 day TTL)** lives in an **http-only `SameSite=Lax` cookie**.
  JS can't read it (XSS-proof), browser auto-sends it only to
  `/api/auth/refresh`. This is the token that survives page reloads; the
  access token is re-minted on reload via the refresh endpoint.
- **Why http-only cookie for the refresh token (not sessionStorage):**
  - A forum's defining feature is users posting text rendered to other users —
    an XSS factory if output encoding ever slips. The Vision Doc (line 271)
    treats XSS as a primary risk.
  - **XSS + sessionStorage refresh token:** the injected script reads the
    token and exfiltrates it → persistent account takeover until the victim
    changes their password. Worst-case breach.
  - **XSS + http-only cookie:** the script *cannot read the cookie*. It can
    ride along on requests while the victim is on the page, but the moment the
    victim leaves or the session is revoked server-side, it's over. No token
    theft, no persistent takeover.
  - For a forum (XSS-dominant threat), the cookie is the stronger choice.
- **The two counter-concerns, both mitigated:**
  - CSRF (cookies auto-send): mitigated by `SameSite=Lax` (browser default in
    Chrome/Firefox/Safari) — cross-site form POSTs don't carry the cookie.
  - Cross-origin friction in dev (Vite `:5173`, Express `:3000`): solved by a
    Vite proxy in `vite.config.ts` that forwards `/api` to Express, making the
    frontend same-origin in dev. ~5 lines, one-time.
- **Refresh tokens are stored server-side in a `refresh_tokens` table**
  (hashed, never plaintext), keyed by `userId`. This is required — not
  optional — because we committed to revocation for logout, account deletion,
  and role demotion. A stateless refresh JWT (no DB) couldn't be revoked.
  - On `/api/auth/refresh`: verify the token's hash exists in the table →
    mint a new access token (and rotate the refresh token: delete old row,
    insert new one, set new cookie). Rotation limits replay windows.
  - On logout: delete the row → the cookie is now useless.
  - On role demotion / account deletion: delete all rows for that `userId`.
  - The access token stays stateless (15 min); only the refresh token is
    checked against the DB on each refresh. So the hot path (every API
    request) is still a stateless JWT verify, and only the rare refresh call
    hits the DB.
- The access token expires on its own in ≤15 min.
- **`fetch` wrapper in the frontend** handles the silent refresh: on any 401,
  call `/api/auth/refresh` using the cookie, store the new access token, retry
  the original request. One wrapper, every request benefits.
- **Accepted alternative (not chosen):** access + refresh both in
  sessionStorage (friend's recommendation). Simpler, zero CSRF, but
  XSS-exfiltratable — knowingly accepting "a single XSS = persistent account
  takeover." Rejected for a forum where XSS is the dominant threat.

### Role model — four tiers, one column, a permission matrix

- **`users.role` column holds `'standard' | 'moderator' | 'admin'`.** Guest is
  *not* a stored role — it's "no session" (guests have no account row).
  Storing `guest` in the DB would be nonsense.
- **Permissions are derived in code, not stored per-user.** A hardcoded matrix:
  - `standard`: `post:create`, `post:deleteOwn`, `post:summarize`,
    `comment:create`, `like:toggle`, `report:create`
    (`post:summarize` = the TL;DR feature; on-demand AI cost is an
    interaction, so guests cannot trigger it — they can *read* posts and
    comments per the README, but an on-demand summarize is in the same
    interaction class as posting/liking/reporting and requires auth.)
  - `moderator`: inherits standard + `report:review`, `report:escalate`
  - `admin`: inherits moderator + `report:close`, `user:delete`,
    `user:assignRole`, `post:deleteAny`
- **Enforcement is one middleware:** `requirePerm('post:deleteOwn')` checks
  `PERMISSIONS[req.user.role].includes(perm)`, returns 403 otherwise.
- **Owner checks are separate from role checks.** `post:deleteOwn` requires
  `post.authorId === req.user.id` (enforced in the handler); `post:deleteAny`
  is admin-only (the middleware). Two layers, both in the route. Don't
  collapse them into a rule engine.
- **Why a code matrix, not DB-stored permissions:** three roles, ~12
  permissions, they change only when a *feature* changes (not at runtime), and
  the grader can read the matrix and understand the whole authz model in 10
  seconds. DB-stored per-user permissions would be a premature abstraction.

### Other auth decisions

- **Password hashing: bcrypt** (cost factor 12). Not argon2 — argon2 is better
  but needs a native binding that's painful on student machines. bcrypt is the
  boring, universally-supported lazy-senior pick.
- **No OAuth (Google/GitHub login) in v1.** README lists only "Sign up, log in,
  log out" with email+password. OAuth is a separate feature; YAGNI.
- **No email verification in v1.** Not in the README. A `users.emailVerified`
  column can be added later; don't build the email-sending infra today.
- **Self-check (tier-1 test):** assert mod inherits standard's `post:create`,
  admin inherits mod's `report:review`, standard lacks `report:close`. Three
  assertions, fails if the matrix breaks.

## 5. AI / TL;DR module

- **One file: `src/backend/ai/summarize.ts`.** The whole feature is ~40 lines.
- **Fallback chain = a `for` loop over an array of provider functions:**
  `[openAIProvider, geminiProvider]`. Try each in order; on throw, log and
  continue; if all fail, throw. This implements the Vision Doc's "fallback
  provider chain" (line 114) as a `for` loop — not a strategy-pattern class
  hierarchy, not a registry/factory, not a plugin system. An `AIStrategy`
  interface with two impls is an interface-with-two-implementations where two
  functions would do. YAGNI.
- **Each provider is a plain `fetch` call, no SDK.** No `openai` npm package —
  the OpenAI SDK would be ~one less line but adds a dependency that hides the
  HTTP. Plain `fetch` is readable, debuggable, dependency-free, and
  educational (the team sees what an API call *is*).
- **The route:** `GET /api/posts/:id/summary` → load post + top ~10 comments
  (one Drizzle query, ordered by likes, limited to ~10 to bound token cost) →
  build prompt via pure function `buildPrompt(post) => string` → call
  `summarize()` → return `{ summary }`.
- **Top-comments selection is a SQL query, not an LLM judgment.** The backend
  curates (by like count, ~10 comments); the LLM summarizes. Bounded tokens =
  bounded cost = no surprise billing. Deterministic behavior.
- **The prompt is a constant, not a per-request template engine.** One system
  prompt string + one user message with post+comments. Don't build a
  prompt-template system with variables/partials — that's LangChain-shaped
  over-engineering for a single feature. Extract only if a second AI feature
  with a different prompt appears.
- **No cache in v1.** Recompute each request. The seam is clean — if
  cost/latency becomes a problem, add a `post_summaries` table keyed by
  `postId`, invalidated on new comment. `ponytail:` comment names the upgrade.
- **No streaming in v1.** A 3-sentence summary generates in ~1-2s; SSE
  streaming adds complexity (SSE endpoint, frontend event handling) for a
  sub-2s response. Plain JSON request/response. Add streaming the day a
  summary takes 5+ seconds.
- **No LangChain / LlamaIndex.** One `fetch`, one prompt, one response.
- **No local model.** TL;DR uses hosted providers per the Vision Doc. Local
  models are a different project with GPU/ops requirements we don't have.
- **No token-counting / cost-tracking infra.** The provider bills us; set a
  monthly budget cap in the provider dashboard and move on.
- **Keys / config:** `.env` gets `OPENAI_API_KEY` and `GEMINI_API_KEY`, both
  *optional*. A missing key filters that provider out of the `providers`
  array at startup — a missing key is not a crash, it's "that provider is
  unavailable." A teammate with only an OpenAI key still runs the app.
- **Self-checks (tier-1 tests):** `buildPrompt` purity (output contains post
  title + top comment text for a fake post, 2 assertions); `summarize` fallback
  (first provider throws → second's result returned, first error swallowed,
  2 assertions). No network in tests; providers injected/mocked.

## 6. Trending / Feed

### Scoring formula

```
score = (like_count × 1.0 + comment_count × 1.5 + comment_velocity × 3.0)
        × EXP(-age_hours / 48)
```

- **Three signals, one decay:**
  - `like_count`, `comment_count` — cumulative engagement from the `posts` table.
  - `comment_velocity` — comments in the last 24 hours. The "hotting up right
    now" signal that distinguishes a 2-hour-old post with 15 new comments
    from a 3-day-old post with 100 comments.
  - `decay(age) = EXP(-age_hours / 48)` — time penalty. Half-life 48h: a
    2-day-old post is worth half a fresh one, 4-day-old a quarter.
- **Weights are constants in `src/backend/feed/weights.ts`:**
  ```ts
  export const WEIGHTS = { like: 1.0, comment: 1.5, velocity: 3.0 } as const
  export const HALF_LIFE_HOURS = 48
  ```
  A comment is worth more than a like (someone wrote something); velocity is
  3× because it's the "hotting up now" signal. **These are starting heuristics
  that need tuning against real engagement.** The formula is stable; the
  numbers are the calibration knob. `ponytail:` comment names it.

### Serving — the feed lives in SQL, not the app layer

- **Scoring happens in Postgres**, not in TS. The feed endpoint issues one
  query; Postgres does the math and returns 50 rows. The backend is a thin
  pass-through.
  - One round-trip (not N rows into Node + sort in JS + 50 back).
  - Postgres is built for `EXP`/`EXTRACT`/`INTERVAL` + ordered `LIMIT` —
    milliseconds with the right indexes.
  - The grader can read and you can explain the SQL (ties to the Drizzle choice).
- **Use raw SQL via Drizzle's `sql` tag**, not the query builder. The formula
  is mathematical; forcing it into the builder obscures it without adding type
  safety that matters. Conceptual shape:
  ```sql
  SELECT p.*, (
    p.like_count * 1.0 + p.comment_count * 1.5 + COALESCE(v.recent, 0) * 3.0
  ) * EXP(-EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 / 48) AS score
  FROM posts p
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS recent
    FROM comments WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY post_id
  ) v ON v.post_id = p.id
  ORDER BY score DESC LIMIT 50
  ```

### Caching — in-process, 30s TTL, single-flight

- **In-process cache, 30s TTL.** Not Redis, not a cache layer. The feed is
  high-traffic and the most expensive query, but it changes slowly relative to
  read frequency — a new comment doesn't meaningfully change the top-50 in the
  5 seconds after it's posted. 30s staleness is invisible to a human scrolling.
  - `ponytail:` comment: "in-process cache, single Node process; add Redis
    when we scale to multiple instances."
- **Single-flight guard** prevents thundering herd: if 10 users hit the feed
  the second the cache expires, one fetch runs and the other 9 await it
  instead of starting 10 concurrent scoring queries. ~one-line guard.
- **No explicit invalidation on writes.** The 30s TTL is the invalidation
  strategy. Wiring `io.emit`-style hooks into every mutation route just for
  cache is complexity the TTL removes. `ponytail:` comment: "TTL-only
  invalidation; explicit busts when a 30s lag becomes unacceptable."
- **No DB-level materialized view** in v1. `REFRESH MATERIALIZED VIEW`
  scheduling is harder to reason about than a TS-level TTL. The in-process
  cache is simpler and sufficient at demo scale.

### Indexes (make the <500ms NFR real)

- `posts(created_at DESC)` — supports the time-decay sort and age extraction.
- `comments(post_id, created_at)` — supports the velocity subquery's
  `WHERE created_at > NOW() - INTERVAL '24 hours'` grouped by post.
- Without these, full table scans. With them, index-range scan + join.
  Declare via Drizzle's `pgIndexes` next to the table in schema.

### Scope cuts

- **No personalization in v1.** README says "based on current trends" — global,
  not personalized. Personalization is a different system (user-feature
  vectors, similarity). YAGNI.
- **No "hot/new/top" tabs.** One feed, one ranking. A "new" tab is a trivial
  separate `ORDER BY created_at DESC` query if the UI later wants it — not a
  re-architecture. Don't pre-build it.
- **Offset pagination (`LIMIT 50 OFFSET 50`)** if "load more" is needed. Cursor
  pagination is for high-write tables where offsets skip rows — overkill here.
  `ponytail:` comment names the ceiling.

### Self-checks

- **Tier-1 pure test:** given a post with fixed likes/comments/velocity/age,
  assert the score is within epsilon of the hand-computed value. Catches
  weight or decay-formula regressions.
- **Tier-2 NFR test:** a one-off timing script in `tests/` runs the query
  against a seeded DB and asserts `duration < 500ms` — directly verifies the
  Vision Doc NFR (line 261).

## 7. Shared types

- **Two layers with a deliberate boundary:**
  - **DB type** (Drizzle-inferred) — `Post` with `authorId: number`,
    `createdAt: Date`. Backend-only.
  - **API DTO** (the contract) — `PostDTO` with `author: UserDTO`,
    `likeCount: number`. Shared, used by frontend + backend.
  - The DB stores a flat row; the API returns a shaped object. **Never share
    the Drizzle type directly with the frontend** — it leaks DB internals
    (foreign keys, pivot columns, internal timestamps) and couples the
    frontend to schema migrations even when the API didn't change.
- **Where shared types live:** a `src/shared/` directory, not a workspace
  package. Both tsconfigs get a path alias:
  ```jsonc
  { "compilerOptions": { "paths": { "@shared/*": ["../shared/*"] } } }
  ```
  Vite resolves via `bundler` moduleResolution (pinned in
  `docs/frontend/techstack.md`); the backend runner resolves via its tsconfig.
  **No npm/pnpm workspace, no `packages/shared` package.json, no build step** —
  a workspace for one shared directory of TS files is ceremony.
  `ponytail:` comment: "shared dir + path aliases; extract to a real package
  if we publish it or split repos."
- **Zod schemas are the single source of truth; TS types are inferred.** One
  declaration gives both runtime validation and a compile-time type:
  ```ts
  export const PostDTO = z.object({
    id: z.number(), title: z.string(), body: z.string(),
    createdAt: z.string().iso_datetime(),
    author: UserDTO, likeCount: z.number(), commentCount: z.number(),
  })
  export type Post = z.infer<typeof PostDTO>
  ```
  - Frontend imports the *types* (`import type { Post } from '@shared/types'`)
    → react-query infers `Post` from the `queryFn` return.
  - Backend imports the *schemas* → validates request bodies and shapes
    responses.
- **DB → DTO mapping happens in the Drizzle query projection**, not in a TS
  transform. Drizzle's `select({...})` projects exactly the DTO fields with
  joins for nested author — no intermediate flat object. The DB type never
  crosses the boundary.
- **The role type ties in here:** `z.enum(['standard','moderator','admin'])`
  in `UserDTO` *is* the shared role type. The permission matrix lives in the
  backend (server-side enforcement), but the role *type* is shared so the
  frontend can render role-gated UI without re-declaring the enum. Adding a
  role means updating the `z.enum` in one place — the frontend's UI gating
  breaks at compile time if it forgets a case.
- **No OpenAPI codegen.** For ~10 resources and a 4-person team, hand-written
  Zod schemas are faster to set up, easier to read, and don't require a
  codegen pipeline someone has to remember to run. Codegen pays off at 50+
  endpoints with separate teams. `ponytail:` comment.
- **No `tRPC`.** It replaces our REST design with tRPC's own call protocol and
  doesn't play as cleanly with the socket.io invalidation pattern from
  Section 3. REST + shared Zod is the simpler shape.
- **DTOs are hand-written, not auto-derived from Drizzle** — deriving would
  re-couple the frontend to the schema, the thing we're avoiding.
- **Self-check:** compile-time. The frontend's `useQuery` return type for the
  feed must be `Post[]` (inferred from `queryFn: () => api.getFeed()` where
  `getFeed` returns `Promise<Post[]>` from `@shared`). If someone changes
  `PostDTO` and forgets a consumer, `tsc` fails. The type system *is* the test.

## 8. Validation, config, and testing

### Validation — Zod at inbound trust boundaries only

- **Validate on the way in, trust on the way out.**
- **Trust boundaries that get validation:**
  1. **Request bodies** — every `POST`/`PATCH`/`PUT` route parses its body
     against a Zod schema before the handler runs. A shared middleware:
     ```ts
     export const validate = (schema: ZodSchema) => (req, _res, next) => {
       const r = schema.safeParse(req.body)
       if (!r.success) return next(new ValidationError(r.error.flatten()))
       req.body = r.data; next()
     }
     app.post('/api/posts', validate(PostCreate), handler)
     ```
     `PostCreate` is a Zod schema in `src/shared` (the *input* shape — no
     `id`/`createdAt`/`author` since those are server-assigned). The handler
     receives `req.body` already-typed as `z.infer<typeof PostCreate>`.
  2. **Path/query params** — same pattern, `z.object({ id: z.coerce.number().int() })`.
  3. **Env vars** — see config below.
- **What we don't validate:** outgoing responses (the backend wrote them;
  compile-time shared types catch drift in dev; runtime outbound re-validation
  is YAGNI) and internal function-to-function calls (you wrote both sides).
  `ponytail:` comment: "inbound-only validation; add outbound if a contract
  drift slips to prod."
- **Error shape:** `ValidationError` → caught by a central Express error
  handler → `{ error: 'validation', fields: {...} }` with 400. One error
  handler in `app.ts`, registered *after* all routes. This is the ~30 lines of
  glue Express costs us (Section 1).

### Config — typed env, fail fast at startup

- **Zod-validated env, parsed at import time:**
  ```ts
  const env = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL: z.string().default('7d'),
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  }).parse(process.env)
  export const config = env
  ```
  If a required var is missing/malformed, the app crashes at startup with a
  clear message — not at 2am when a route touches it. `JWT_SECRET.min(32)`
  enforces a real security floor; don't relax it.
- `.env.example` documents every var; real `.env` is gitignored.
- **Missing optional keys agree with Section 5:** `OPENAI_API_KEY`/
  `GEMINI_API_KEY` optional → AI module filters out providers whose key is
  absent. Missing key ≠ crash, missing key = that provider off.
- Frontend's `VITE_API_URL` lives in the frontend's `.env` (Vite prefixes
  client-exposed vars with `VITE_`).

### Testing — Vitest, three tiers, honest about what matters

Same Vitest as the frontend (one runner, one TS pipeline).

- **Tier 1 — pure-logic unit tests (write all of these).** The self-checks
  from every section. Cheap, no DB, no network, milliseconds:
  | Test | Asserts | Section |
  | --- | --- | --- |
  | `permissions.test.ts` | Mod inherits `post:create`; Admin inherits `report:review`; Standard lacks `report:close` | §4 |
  | `buildPrompt.test.ts` | Prompt contains post title + top comment text | §5 |
  | `summarize.fallback.test.ts` | First provider throws → second's result returned; first error swallowed | §5 |
  | `scoring.test.ts` | Hand-computed score within epsilon for fixed inputs | §6 |
  Five files, ~3 assertions each. The load-bearing suite.
- **Tier 2 — integration tests against a real Postgres (write a few).**
  `tests/` spins against the Docker Postgres (or a disposable test DB), runs
  Drizzle migrations, exercises routes via `supertest`. Two worth writing:
  - **Auth flow:** signup → login → refresh → protected route with token →
    401 without. Catches the JWT/refresh/cookie wiring (Section 4).
  - **Feed query timing:** the <500ms NFR (Section 6) against a seeded DB.
    Directly verifies a Vision Doc NFR — gold for grading.
  - We do *not* write an integration test per route. 30 integration tests for
    30 CRUD endpoints is slow, flaky, and catches less than the pure tests.
- **Tier 3 — E2E (skip entirely).** No Playwright/Cypress. The frontend doc
  covers UI via component tests. A full browser E2E suite is a multi-day
  investment with flaky payoff for a course project. `ponytail:` comment:
  "no E2E; add Playwright if the demo needs a recorded click-through."
- **Test DB strategy:** don't run tests against the dev DB. A
  `TEST_DATABASE_URL` points at a separate `foz_test` DB; `beforeAll` runs
  `drizzle-kit push`, `beforeEach` truncates tables. ~20 lines in
  `tests/setup.ts`. No test-containers, no Docker-in-Docker.
- **No mocking the DB in unit tests.** Tier-1 tests don't touch the DB by
  design; Tier-2 use a real Postgres. Mocking Drizzle/Postgres is the
  worst-of-both-worlds: tests the mock not the query, hides the SQL bugs that
  are the whole point of using Drizzle.
- **No coverage thresholds.** Chasing a % leads to tests for getters. The
  tiered approach covers what matters; coverage is a side-effect, not a target.

---

## Open items (confirm before wiring)

1. **socket.io backend contract** — confirm with the backend lead (Trọng) that
   a socket.io server is on the plan and on the three events
   (`thread:created`, `comment:created`, `like:updated`). If not, Section 3's
   fallback is polling; the invalidation-based architecture is unchanged.
2. **AI provider keys** — which teammates have OpenAI vs Gemini keys, and the
   monthly budget cap set in each provider dashboard. Affects which providers
   are active at startup (Section 5).
3. **`JWT_SECRET` generation** — needs a ≥32-char secret for dev. Document in
   `.env.example` how to generate one (`openssl rand -base64 32`).
4. **Test DB setup** — confirm `foz_test` database creation is part of the
   docker-compose or a one-time `createdb` step in the setup README.
