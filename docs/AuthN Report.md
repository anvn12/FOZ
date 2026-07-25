# AuthN Report

*Work performed by: Võ An Phú | Reviewed by: Nguyễn Tuấn An*

## 1. Overview

The Authentication (AuthN) functional group handles user identity and session management for the FOZ platform. It covers three layers: a React frontend for the user interface, an Express backend for API logic and security, and a PostgreSQL database for persistent storage. The system supports registration, login, logout, password change, and automatic session restoration.

## 2. UI Layer

The frontend provides four pages — Login, Register, Change Password, and a Logout dialog. All pages share a common layout component (`AuthShell`) and a reusable password input with a visibility toggle. Forms are validated client-side using Zod schemas shared with the backend, and errors are displayed inline or via toast notifications. The UI is fully responsive, adapting from mobile to desktop with Material Design 3 styling.

## 3. API & Logic Layer

The backend exposes five endpoints under `/api/v1/auth`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register` | Create account and auto-login |
| POST | `/login` | Authenticate with email and password |
| POST | `/refresh` | Rotate tokens using the refresh cookie |
| POST | `/logout` | Revoke the current session |
| PATCH | `/password` | Change password (requires current password) |

Each route is protected by middleware for rate limiting (10 requests per 15 minutes), input validation (shared Zod schemas), and authentication guards (`requireAuth` or `requireGuest`).

## 4. Token Strategy

The system uses a dual-token approach:

- **Access Token (JWT)** — stored in JavaScript memory (Zustand), sent as a `Bearer` header on every request, expires in 15 minutes. Contains the user's ID, role, and status.
- **Refresh Token** — stored in an `httpOnly` cookie, expires in 7 days. Only sent to the `/api/v1/auth/refresh` endpoint. Its secret is never stored — only a SHA-256 hash is kept in the database.

On each refresh, the old token is revoked and a new one is issued (token rotation). The `requireAuth` middleware re-reads the user from the database on every request to honor mid-session status changes such as bans or suspensions.

## 5. Data Persistence

Three tables support the AuthN system:

- **`user_accounts`** — stores user identity (id, email, bcrypt password hash, role, status). Email has a unique index on the lowercased value to prevent case-variant duplicates.
- **`refresh_sessions`** — tracks active login sessions (token hash, expiry, revocation timestamp). Uses soft deletes via `revoked_at` for auditability.
- **`profiles`** — created atomically with the user account inside a transaction. Stores display name, avatar, and other profile fields.

## 6. Auth Flow Diagram

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend<br/>(React/Zustand)
    participant BE as Backend<br/>(Express)
    participant DB as Database<br/>(PostgreSQL)

    Note over User, DB: ── LOGIN ──

    User->>FE: Enter email + password, click "Log in"
    FE->>FE: Validate with Zod (shared schema)
    FE->>BE: POST /api/v1/auth/login<br/>{ email, password }
    BE->>BE: validateBody(LoginRequest)
    BE->>DB: findUserByEmail(email)
    DB-->>BE: user row (id, email, password_hash, role, status)
    BE->>BE: bcrypt.compare(password, password_hash)
    BE->>BE: Check user.status === "active"
    BE->>BE: Generate JWT access token (15 min)<br/>Generate refresh token (random UUID + secret)
    BE->>DB: INSERT refresh_sessions<br/>(id, user_id, token_hash, expires_at)
    BE-->>FE: 200 { user, accessToken }<br/>+ Set-Cookie: refresh_token (httpOnly)
    FE->>FE: Store accessToken in Zustand (memory)
    FE->>FE: Navigate to home

    Note over User, DB: ── AUTHENTICATED REQUEST ──

    User->>FE: Click "Like" on a post
    FE->>BE: POST /api/v1/reactions<br/>Authorization: Bearer <accessToken>
    BE->>BE: requireAuth middleware:<br/>verify JWT, read user from DB
    BE->>DB: getUserById(payload.sub)
    DB-->>BE: user row (check status still active)
    BE->>BE: Process the like
    BE-->>FE: 200 { ok: true }

    Note over User, DB: ── TOKEN REFRESH (after 15 min) ──

    FE->>BE: POST /api/v1/auth/refresh<br/>Cookie: refresh_token=<id.secret>
    BE->>BE: Parse cookie → { id, secret }
    BE->>BE: SHA-256(secret) → token_hash
    BE->>DB: Find session WHERE id AND token_hash<br/>AND revoked_at IS NULL AND expires_at > now()
    DB-->>BE: refresh session row
    BE->>DB: UPDATE revoked_at = now() (old session)
    BE->>DB: INSERT new refresh_sessions row
    BE->>BE: Sign new JWT access token
    BE-->>FE: 200 { user, accessToken }<br/>+ Set-Cookie: new refresh_token
    FE->>FE: Update accessToken in Zustand

    Note over User, DB: ── LOGOUT ──

    User->>FE: Click "Log out"
    FE->>BE: POST /api/v1/auth/logout<br/>Authorization: Bearer <accessToken><br/>Cookie: refresh_token=<id.secret>
    BE->>DB: Find session, SET revoked_at = now()
    BE-->>FE: 200 { ok: true }<br/>+ Clear-Cookie: refresh_token
    FE->>FE: Clear Zustand store (user + accessToken)
    FE->>FE: Navigate to login page
```

## 7. Token Storage Diagram

```mermaid
flowchart LR
    subgraph Browser
        Memory["JS Memory (Zustand)<br/>───<br/>Access Token (JWT)<br/>15 min TTL"]
        Cookie["httpOnly Cookie<br/>───<br/>Refresh Token<br/>7 day TTL"]
    end

    subgraph Server
        JWT["JWT Library<br/>───<br/>Verifies access token<br/>with JWT_ACCESS_SECRET"]
        DB[("PostgreSQL<br/>───<br/>refresh_sessions table<br/>stores SHA-256 of secret")]
    end

    Memory -->|"Authorization: Bearer"| JWT
    Cookie -->|"Cookie: refresh_token"| JWT
    JWT --> DB
```
