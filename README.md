# FOZ

## Authentication

This repo includes a complete authentication slice (Phase 002) for the
forum application.

### Endpoints

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| `POST` | `/auth/register` | guest | `{ email, password }` | `201` + `AuthResponse` + refresh cookie |
| `POST` | `/auth/login` | guest | `{ email, password }` | `200` + `AuthResponse` + refresh cookie |
| `POST` | `/auth/refresh` | none (uses refresh cookie) | — | `200` + `RefreshResponse` + rotated cookie |
| `POST` | `/auth/logout` | Bearer access | — | `200` + cleared cookie |
| `PATCH` | `/auth/password` | Bearer access | `{ currentPassword, newPassword }` | `200` |

### Environment

Copy `.env.example` to `.env` and fill in secrets. For tests, `.env.test` is
used and `DATABASE_URL` is forced to the test database.

### Running locally

```sh
docker compose up -d db
# in another terminal
npm run dev:be    # backend on :4000
npm run dev:fe    # frontend on :5173 (proxies /auth to the backend)
```

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
  is an http-only `SameSite=Lax` cookie on `Path=/auth`.
- The `rate-limit` middleware is a no-op when `NODE_ENV=test` so the test
  suite isn't capped at 10 attempts/15min.
- Email verification and forgotten-password reset are **out of scope** for
  v1 — see `specs/002-user-auth/spec.md` (FR-016).

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
│   ├── frontend/ 
│   └── backend/
├── docs/                           # Documentation
│   ├── meeting-minutes/
│   ├── .md                         # General documentation (e.g., project proposal, team contract)
│   ├── PA/                         # Project Assignments
│   │   └── PA1/
│   │       └── .md
|   └── references/                 # Reference materials (e.g., UI design inspirations)
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
