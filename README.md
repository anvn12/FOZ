# FOZ — Threads-style Community Forum

FOZ is a web-based forum application focused on fundamental community discussions. Its value lies in providing a simple, intuitive platform where users can easily ask questions, share knowledge, and connect over shared interests without navigating overly complex interfaces.

---

## 📖 Introduction & Overview

This project is built to showcase a clean community platform. Below are details outlining target users, key features, functional groups, and roles, derived from the [1B. Project Proposal.md](file:///d:/FOZ/docs/1B.%20Project%20Proposal.md).

### Target Users and Environments

The target audience is general **web** users seeking online community spaces. They will use the application exclusively through standard web browsers on any internet-connected device, including desktop computers, laptops, and smartphones.

### Key Features

- **Post Creation:** Users can easily create text-based posts to initiate new discussion threads on topics they care about. This feature allows users to share their thoughts, ask questions, and start conversations with the community.
- **Feed Generation:** The application will generate a feed of posts based on current trends, calculated by recent engagement metrics like comment velocity and like counts. This ensures that users see content that is relevant to them, enhancing their overall experience on the platform.
- **User Interactions:** Members can browse existing threads, read ongoing discussions, and interact by leaving their own comments or likes. This fosters engagement and allows users to contribute to the community dialogue.
- **Search & Discovery:** Users can search for specific topics, posts, or other users to find relevant content. This feature helps users discover desired discussions and enhance their overall experience.
- **Administration & Moderation:** The application includes a robust reporting system that allows users to report inappropriate content. Moderators can review these reports and forward them to administrators for further review or remove offending content. This helps maintain a safe and respectful community environment.
- **Post Summarize (TL;DR) [AI Feature]:** The application utilizes an AI engine to generate brief on-demand overviews of lengthy discussion posts. This feature helps users quickly understand the main points of a conversation without having to read through every comment, making it easier to stay informed and engaged with community discussions.

### User Roles & Permissions

| Role                                   | Description                                                                                                                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Guest (Unauthenticated User)**       | Can view profiles, read posts, and see comments. Cannot post, like, report. Any interaction attempt should trigger the authentication flow.                                                                |
| **Standard User (Authenticated User)** | Can create posts, like, comment, report, and delete their own content. Can manage their own profile.                                                                                                       |
| **Moderator**                          | Inherits all Standard User abilities. Can review reports from Standard Users, then forward to Administrator if needed. Cannot delete users or posts from the database or alter system-wide configurations. |
| **Administrator**                      | This is the highest level of access. Complete access over all database records. Can permanently remove user accounts, instantly delete any content, assign Moderator roles.                                |

### Functional Groups

| Group Name                      | Functions                                                                                                                                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**              | Sign up, log in, log out                                                                                                                                                                                          |
| **Profile management**          | Edit profile info, change password, change avatar                                                                                                                                                                 |
| **Post Creation**               | Creating a new post, deleting posts (restricted by the post owner check)                                                                                                                                          |
| **Feed Generation**             | Post recommendation                                                                                                                                                                                               |
| **User Interactions**           | Comment to the post, like/unlike a post or comment.                                                                                                                                                               |
| **Search & Discovery**          | User profile or post search                                                                                                                                                                                       |
| **Administration & Moderation** | User reporting system (Standard User can report posts), Moderator reporting system (review the reports from users and forward to admin), Admin reporting system (post removal and user removal. Assign Moderator) |
| **Post Summarize**              | On-demand summarization inside a post.                                                                                                                                                                            |

---

## 🛠️ Getting Started & Setup

### Prerequisites

- **Node.js**: version `24` or higher (refer to the [.nvmrc](file:///d:/FOZ/.nvmrc) file; consider using `nvm` or `fnm`).
- **Docker**: Required to run the local PostgreSQL database service.

---

### First-Time Setup

> [!IMPORTANT]
> Disable the postgres service on your host machine if it already uses port `5432`, then run:

#### Windows

Run the setup batch script in PowerShell:

```powershell
./setup.bat
```

#### Linux / macOS

Grant executable permission and run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

#### Post-setup Steps

Create and configure your [.env](file:///d:/FOZ/.env) file (copied from [.env.example](file:///d:/FOZ/.env.example)) and set `JWT_ACCESS_SECRET` to your preferred secret key of at least 16 characters.

---

### Running the System Locally

> [!IMPORTANT]
> Disable the postgres service on your host machine if it already uses port `5432`, then run:

#### Windows

```powershell
./start.bat
```

#### Linux / macOS

```bash
chmod +x start.sh
./start.sh
```

Once running, the application components will be available at:

- **Frontend Development Server**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:4000`

---

## 🗄️ Working with the Database

The local Postgres instance runs in Docker as the `foz_db` container. Two databases are created in it: `foz_dev` (for development) and `foz_test` (for the vitest test suite).

Database schema migrations live as raw SQL files under [migrations/](file:///d:/FOZ/src/backend/db/migrations/) and are applied manually.

### Applying Schema Migrations

```sh
# Apply schema to Dev DB (foz_dev)
for f in src/backend/db/migrations/*.sql; do
  docker exec -i foz_db psql -U foz -d foz_dev < "$f"
done

# Create and apply schema to Test DB (foz_test)
docker exec -i foz_db psql -U foz -d postgres -c "CREATE DATABASE foz_test;"
for f in src/backend/db/migrations/*.sql; do
  docker exec -i foz_db psql -U foz -d foz_test < "$f"
done
```

### Option A — Drizzle Studio (Web GUI)

The codebase includes a [drizzle.config.ts](file:///d:/FOZ/drizzle.config.ts) file wired up to read the `DATABASE_URL` from [.env](file:///d:/FOZ/.env). To view and manage data in a browser UI:

```sh
# 1. Start the Drizzle Kit Studio server
npx drizzle-kit studio

# 2. Open the URL printed in terminal (typically http://local.drizzle.studio)
```

Drizzle Studio displays all 10 tables (`user_accounts`, `profiles`, `posts`, `comments`, `reactions`, `role_history`, `reports`, `moderation_reviews`, `post_summaries`, `refresh_sessions`) with full row counts, schemas, and inline editing support.

### Option B — psql (CLI)

You can connect to the running database shell directly via the Docker container:

```sh
# Interactive shell session
docker exec -it foz_db psql -U foz -d foz_dev

# Run a one-off query command
docker exec -i foz_db psql -U foz -d foz_dev -c "SELECT * FROM user_accounts;"
```

Useful CLI queries:

```sql
-- List all tables
\dt

-- Describe user_accounts table schema
\d user_accounts

-- Pretty-print wide rows
\x

-- View recent users (excluding password hashes)
SELECT id, email, role, status, created_at
FROM user_accounts
ORDER BY created_at DESC LIMIT 20;

-- Reset database tables completely (use with caution)
TRUNCATE TABLE refresh_sessions, profiles, user_accounts RESTART IDENTITY CASCADE;
```

---

## 🧪 Testing

To run the Vitest test suite, compile the TypeScript code and execute tests:

```sh
# Start database container
docker compose up -d db

# Perform TypeScript compile check
npx tsc --noEmit

# Run tests
npx vitest run
```

_Note: The rate-limit middleware is disabled automatically when `NODE_ENV=test` to avoid rate-limiting test requests._

---

## 💻 Development & Architecture

### File Structure

```Plaintext
FOZ/
├── src/                            # Source code
│   ├── frontend/                   # Vite + React
│   ├── backend/                    # Express + Drizzle ORM
│   └── shared/                     # Zod schemas + shared types (source of truth)
├── docs/                           # Documentation (project planning, tech stack, etc.)
│   ├── PA/                         # Project Assignments
│   ├── Techstack/                  # Backend and frontend technology documents
│   ├── references/                 # Reference apps/sites the team studied
│   ├── ui-designs/                 # Visual design references (Figma exports)
│   └── ideas/                      # Design notes and drafts
├── specs/                          # SpecKit specifications (by feature)
├── ai-logs/                        # AI usage logs (by team member)
├── tests/                          # Test plan, test cases, and reports
├── .env.example                    # Template for environment variables
└── README.md                       # Project documentation
```

### API Routing Convention

All API endpoints live under the `/api/v1` prefix.

- This prefix is registered once in [index.ts](file:///d:/FOZ/src/backend/index.ts) via an `apiRouter` mounted with `app.use("/api/v1", apiRouter)`.
- To add a new API resource, create its `Router()` in the corresponding folder under [api/](file:///d:/FOZ/src/backend/api) (e.g. `src/backend/api/<resource>/routes.ts`) and mount it on `apiRouter` in [index.ts](file:///d:/FOZ/src/backend/index.ts) **without** the prefix:
  ```ts
  import { userRouter } from "#backend/api/users/routes.js";
  apiRouter.use("/users", userRouter); // Resolves to /api/v1/users
  ```
- Routes that must not be versioned (e.g., `/health`) are mounted directly on `app` (outside the `apiRouter`).

### Authentication API Endpoints

The application includes a complete authentication slice (Phase 002) with the following routes:

| Method  | Path                    | Auth Required      | Body Params                        | Returns                                    |
| :------ | :---------------------- | :----------------- | :--------------------------------- | :----------------------------------------- |
| `POST`  | `/api/v1/auth/register` | Guest              | `{ email, password }`              | `201` + `AuthResponse` + refresh cookie    |
| `POST`  | `/api/v1/auth/login`    | Guest              | `{ email, password }`              | `200` + `AuthResponse` + refresh cookie    |
| `POST`  | `/api/v1/auth/refresh`  | None (uses cookie) | —                                  | `200` + `RefreshResponse` + rotated cookie |
| `POST`  | `/api/v1/auth/logout`   | Bearer Token       | —                                  | `200` + cleared cookie                     |
| `PATCH` | `/api/v1/auth/password` | Bearer Token       | `{ currentPassword, newPassword }` | `200`                                      |

_Note: Access tokens live in client memory only (zustand); refresh tokens are sent via `httpOnly`, `SameSite=Lax` cookies on path `/api/v1/auth`._

---

## 🤖 Team AI Usage Logging

This project tracks AI-assisted code changes to maintain transparency across the development team.

- **Antigravity users:** The `ai-usage-log` skill automatically appends logging entries to `ai-logs/<your-username>.md`.
- **Copilot Chat users (VS Code):** Use git commit hooks to log Copilot prompts during commits. Run the following command once to set up:
  ```bash
  git config core.hooksPath .githooks
  ```
