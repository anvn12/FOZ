# FOZ

## Authentication

This repo includes a complete authentication slice (Phase 002) for the
forum application.

### Endpoints

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | guest | `{ email, password }` | `201` + `AuthResponse` + refresh cookie |
| `POST` | `/api/v1/auth/login` | guest | `{ email, password }` | `200` + `AuthResponse` + refresh cookie |
| `POST` | `/api/v1/auth/refresh` | none (uses refresh cookie) | — | `200` + `RefreshResponse` + rotated cookie |
| `POST` | `/api/v1/auth/logout` | Bearer access | — | `200` + cleared cookie |
| `PATCH` | `/api/v1/auth/password` | Bearer access | `{ currentPassword, newPassword }` | `200` |

### First-time setup

Prerequisites: Node v24 (see `.nvmrc`; use `nvm use` / `fnm use`) and Docker.

1. Install dependencies:
   ```sh
   npm i
   ```

2. Create `.env` from the template and change `JWT_ACCESS_SECRET`:
   ```sh
   cp .env.example .env
   # edit .env: set JWT_ACCESS_SECRET to a random string of >= 16 chars
   ```
   For tests, `.env.test` is used and `DATABASE_URL` is forced to the test
   database via `TEST_DATABASE_URL`.

3. Start the local Postgres:

   *Disable the postgres service on your host if it's running, then run:*
   
   ```sh
   docker compose up -d db
   ```

4. Apply the schema to the dev DB (one-time per fresh DB):
   ```sh
   for f in src/backend/db/migrations/*.sql; do
     docker exec -i foz_db psql -U foz -d foz_dev < "$f"
   done
   ```

5. (Optional, for `npx vitest run`) Create and migrate the test DB:
   ```sh
   docker exec -i foz_db psql -U foz -d postgres -c "CREATE DATABASE foz_test;"
   for f in src/backend/db/migrations/*.sql; do
     docker exec -i foz_db psql -U foz -d foz_test < "$f"
   done
   ```

> If `npm run dev:be` prints `Invalid environment configuration` and exits
> instead of `foz api listening on :4000`, your `.env` is missing or has an
> invalid value (most often a `JWT_ACCESS_SECRET` shorter than 16 chars).

### Running locally

```sh
npm run dev:be    # backend on :4000 (prints "foz api listening on :4000")
npm run dev:fe    # frontend on :5173 (proxies /api/v1/auth to the backend)
```

### Adding a new API route

All API endpoints live under `/api/v1`. This prefix is applied once in
`src/backend/index.ts` via an `apiRouter` mounted with
`app.use("/api/v1", apiRouter)`. To add a new resource:

1. Create `src/backend/api/<resource>/routes.ts` exporting a `Router()`.
2. Mount it on `apiRouter` in `src/backend/index.ts` **without** the prefix:
   ```ts
   import { userRouter } from "#backend/api/users/routes.js";
   apiRouter.use("/users", userRouter);   // → /api/v1/users
   ```

Do not write `/api/v1` manually on sub-routers — it's inherited. Routes that
must not be versioned (e.g. `/health`) are mounted directly on `app`.

### Running tests

```sh
docker compose up -d db
npx tsc --noEmit
npx vitest run
```

The DB schema is applied via the SQL files in `src/backend/db/migrations/`
(0001_initial + 0002_refresh_sessions). Apply them with:

```sh
for f in src/backend/db/migrations/*.sql; do
  docker exec -i foz_db psql -U foz -d foz_dev < "$f"
done
```

### Notes

- JWT access tokens live in client memory only (zustand); the refresh token
  is an http-only `SameSite=Lax` cookie on `Path=/api/v1/auth`.
- The `rate-limit` middleware is a no-op when `NODE_ENV=test` so the test
  suite isn't capped at 10 attempts/15min.
- Email verification and forgotten-password reset are **out of scope** for
  v1 — see `specs/002-user-auth/spec.md` (FR-016).

## Working with the database

The local Postgres runs in Docker as the `foz_db` container. Two databases
are created in it: `foz_dev` (for the app) and `foz_test` (for the test
suite). Migrations live as raw SQL files under `src/backend/db/migrations/`
and are applied manually (no auto-apply on `docker compose up`).

### Start the DB

```sh
docker compose up -d db
```

That's it. The DB is reachable on `localhost:5432` with the credentials
from `.env` (`foz` / `foz` / `foz_dev`).

### Apply the schema (one-time per fresh DB)

```sh
# Dev DB
for f in src/backend/db/migrations/*.sql; do
  docker exec -i foz_db psql -U foz -d foz_dev < "$f"
done

# Test DB (used by `npx vitest run`)
docker exec -i foz_db psql -U foz -d postgres -c "CREATE DATABASE foz_test;"
for f in src/backend/db/migrations/*.sql; do
  docker exec -i foz_db psql -U foz -d foz_test < "$f"
done
```

### Option A — Drizzle Studio (web GUI)

The repo ships with a `drizzle.config.ts` that's already wired up to read
`DATABASE_URL` from `.env`. To browse the data in a web UI:

```sh
# 1. in one terminal, start the local Drizzle Kit server
npx drizzle-kit studio

# 2. in your browser, open the URL it prints
#    (usually https://local.drizzle.studio/ — same address works)
```

The browser connects to the local server on `localhost:4983`, which queries
the DB via the URL in `.env`. You'll see all 10 tables (`user_accounts`,
`profiles`, `posts`, `comments`, `reactions`, `role_history`, `reports`,
`moderation_reviews`, `post_summaries`, `refresh_sessions`) with row
counts, schema, and inline edit support.

**Troubleshooting**

| Symptom | Fix |
|---|---|
| "Invalid input: Please specify a 'dbCredentials' param in config" | `drizzle.config.ts` is missing the block — verify the file is the version committed in `fix(drizzle): add dbCredentials to drizzle.config.ts`. |
| "Connecting to the Drizzle Kit on localhost:4983" hangs | You didn't start the local server in step 1. |
| "Drizzle Kit: failed to connect to database" | DB isn't running. `docker compose up -d db`, then verify with `docker exec -i foz_db pg_isready -U foz`. |
| Port 4983 already in use | `npx drizzle-kit studio --port 4984`. |

### Option B — psql (CLI)

For ad-hoc queries, the CLI is faster than opening a browser tab. The
container has psql installed; exec into it:

```sh
# interactive shell
docker exec -it foz_db psql -U foz -d foz_dev

# one-off query
docker exec -i foz_db psql -U foz -d foz_dev -c "SELECT * FROM user_accounts;"
```

Useful queries:

```sql
-- list tables
\dt

-- describe a table
\d user_accounts

-- pretty-print wide rows
\x

-- see all users (without the password hash)
SELECT id, email, role, status, created_at
FROM user_accounts
ORDER BY created_at DESC LIMIT 20;

-- see all active refresh sessions
SELECT rs.id, u.email, substring(rs.token_hash, 1, 12) AS hash_prefix,
       rs.expires_at, rs.revoked_at
FROM refresh_sessions rs
JOIN user_accounts u ON u.id = rs.user_account_id
ORDER BY rs.created_at DESC;

-- flip a user to suspended (test the mid-session status re-check on /auth/refresh)
UPDATE user_accounts
SET status = 'suspended', updated_at = now()
WHERE email = '[email protected]';

-- factory reset
TRUNCATE TABLE refresh_sessions, profiles, user_accounts RESTART IDENTITY CASCADE;
```

If you have psql installed locally and prefer not to go through Docker:

```sh
PGPASSWORD=foz psql -h localhost -U foz -d foz_dev
```

### Schema migrations

Migrations are plain SQL files in `src/backend/db/migrations/`, applied
manually. The Drizzle TypeScript schema (`src/backend/db/schema/*.ts`) is
the source of truth for queries; the SQL is the source of truth for table
layout. When you change a table, edit both — add a new `000N_*.sql` file
for the migration, and update the matching `pgTable` in TS. The two
`.specify/scripts/bash/setup-*.sh` scripts are unrelated; they don't apply
migrations automatically.

## Introduction

This project is a web-based forum application focused on fundamental community discussions. Its value lies in providing a simple, intuitive platform where users can easily ask questions, share knowledge, and connect over shared interests without navigating overly complex interfaces.

## Target users and environments

The target audience is general **web** users seeking online community spaces. They will use the application exclusively through standard web browsers on any internet-connected device, including desktop computers, laptops, and smartphones.

## Key features

**Post Creation:** Users can easily create text-based posts to initiate new discussion threads on topics they care about. This feature allows users to share their thoughts, ask questions, and start conversations with the community.

**Feed Generation:** The application will generate a feed of posts based on current trends, calculated by recent engagement metrics like comment velocity and like counts. This ensures that users see content that is relevant to them, enhancing their overall experience on the platform.

**User Interactions:** Members can browse existing threads, read ongoing discussions, and interact by leaving their own comments or likes. This fosters engagement and allows users to contribute to the community dialogue.

**Search & Discovery:** Users can search for specific topics, posts, or other users to find relevant content. This feature helps users discover desired discussions and enhance their overall experience.

**Administration & Moderation:** The application includes a robust reporting system that allows users to report inappropriate content. Moderators can review these reports and forwarding them to administrators for further review or removing offending content. This helps maintain a safe and respectful community environment.

### AI feature

**Post Summarize (TL;DR):** The application utilizes an AI engine to generate brief on-demand overviews of lengthy discussion posts. This feature helps users quickly understand the main points of a conversation without having to read through every comment, making it easier to stay informed and engaged with the community discussions.

### User Roles

| Role | Description |
| --- | --- |
| Guest (Unauthenticated User) | Can view profiles, read posts, and see comments. Cannot post, like, report. Any interaction attempt should trigger the authentication flow. |
| Standard User (Authenticated User) | Can create posts, like, comment, report, and delete their own content. Can manage their own profile. |
| Moderator | Inherits all Standard User abilities. Can review reports from Standard Users, then forward to Administrator if needed. Cannot delete users or posts from the database or alter system-wide configurations. |
| Administrator | This is the highest level of access. Complete access over all database records. Can permanently remove users account, instantly delete any content, assign Moderator roles. |

### Functional Groups

| Group Name | Functions |
| --- | --- |
| Authentication | Sign up, log in, log out |
| Profile management | Edit profile info, change password, change avatar |
| Post Creation | Creating a new post, deleting posts (restricted by the post owner check) |
| Feed Generation | Post recommendation |
| User Interactions | Comment to the post, like/unlike a post or comment. |
| Search & Discovery | User profile or post search |
| Administration & Moderation | User reporting system (Standard User can report posts), Moderator reporting system (review the reports from users and forward to admin), Admin reporting system (post removal and user removal. Assign Moderator) |
| Post Summarize | On-demand summarization inside a post. |

## File Structure

```Plaintext
FOZ/
├── src/                            # Source code
│   ├── frontend/                   # Vite + React
│   ├── backend/                    # Express + Drizzle
│   └── shared/                     # Zod schemas + shared enums (source of truth)
├── docs/                           # Documentation
│   ├── PA/                         # Project Assignments
│   ├── Techstack/                  # Tech stack rationale (FE + BE)
│   ├── meeting-minutes/
│   ├── references/                 # Reference apps/sites the team studied
│   ├── ui-designs/                 # Visual design references (Figma exports, etc.)
│   ├── ideas/                      # Design notes / drafts
│   └── *.md                        # General docs (project proposal, team contract, etc.)
├── specs/                          # SpecKit specs (one dir per feature)
├── ai-logs/                        # AI usage logs (one file per team member)
├── tests/                          # Test plan, test cases, test reports
├── .env.example                    # Template for environment variables
└── README.md                       # Project documentation
```

## Team AI Usage Logging

This project tracks AI-assisted code changes to maintain transparency across the team.

- **Pi users:** The `ai-usage-log` skill auto-logs your sessions to `ai-logs/<your-name>.md`.
- **Copilot Chat users (VS Code):** Git hooks prompt you to paste your Copilot prompt when committing. If you delete the line, nothing is logged.

### One-time setup for Copilot Chat users

After cloning, run:

```bash
git config core.hooksPath .githooks
```

This enables the commit-message hooks that handle logging. No further action needed.
