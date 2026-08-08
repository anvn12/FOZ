# Technical Research: Display Name Separate from Username

**Feature**: `021-display-name` | **Date**: 2026-08-06

## Research Topics & Decisions

### 1. Database Schema & Indexing Strategy

- **Decision**: Add `username` column to `user_accounts` table as `text("username").notNull()` with a unique case-insensitive index `uniqueIndex("user_accounts_username_lower_idx").on(lower(t.username))`.
- **Rationale**: `user_accounts` is the canonical authentication and identity table in FOZ (`src/backend/db/schema/users.ts`). `profiles` contains public profile metadata (`displayName`, `bio`, `avatarUrl`, `location`, `website`). Username is an identity credential and URL handle, making `user_accounts` its natural domain.
- **Alternatives Considered**: 
  - *Storing `username` in `profiles`*: Evaluated, but discarded because `user_accounts` handles auth (login, registration, credentials), and `username` is an immutable identity handle tightly coupled with authentication and account registration.

### 2. Database Migration & Existing User Backfill

- **Decision**: Create a multi-step Drizzle migration:
  1. Add nullable `username` column to `user_accounts`.
  2. Run backfill logic to set `username = LOWER(SPLIT_PART(email, '@', 1))` for existing accounts.
  3. Clean non-allowed characters (replace any character outside `[a-z0-9._]` with `_`). Ensure minimum length 3 (pad with `_` if shorter).
  4. Iterate through collisions to append numeric suffixes (`john`, `john1`, `john2`...).
  5. Set `username` column to `NOT NULL` and create `user_accounts_username_lower_idx`.
- **Rationale**: Ensures 100% of existing accounts possess valid, unique usernames without requiring user intervention.
- **Alternatives Considered**:
  - *Prompting existing users on next login*: Rejected because unmigrated accounts would break public profile URLs and `@username` resolution.

### 3. Shared Zod Schemas & Validation Rules

- **Decision**: 
  - Define `usernameSchema` in `src/shared/schemas/auth.ts`:
    ```ts
    export const usernameSchema = z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-z0-9._]+$/, "Username can only contain lowercase letters, numbers, underscores, and periods")
      .refine((val) => !RESERVED_USERNAMES.includes(val), "This username is reserved");
    ```
  - Define `RESERVED_USERNAMES` array in `src/shared/schemas/auth.ts`: `["admin", "administrator", "moderator", "mod", "api", "support", "root", "null", "undefined", "foz", "system", "help", "about", "settings", "terms", "privacy"]`.
  - Add `username` to `RegisterRequest` and update `AuthResponse`/`me` DTOs.
- **Rationale**: Single source of truth in `src/shared/` shared between frontend and backend per Constitution Principle I.

### 4. API Endpoint & URL Routing Architecture

- **Decision**:
  - **Availability Check**: `GET /api/v1/auth/check-username?username=<val>` returns `{ available: boolean, reason?: string }`. Applied with `authRateLimiter`.
  - **Profile Fetching**: Support `GET /api/v1/profiles/by-username/:username` to fetch profile by handle.
  - **Legacy Profile Route**: Maintain `GET /api/v1/profiles/:userAccountId`. Frontend handles `/profiles/@:username` directly. For legacy URL requests to `/profiles/:userId`, frontend fetches user info and performs a client-side redirect (`navigate("/profiles/@" + username, { replace: true })`).
- **Rationale**: Fulfills FR-006 and user clarification decision (Option A).

### 5. Google OAuth Username Auto-Generation

- **Decision**: During Google OAuth callback in `src/backend/services/social-auth.service.ts`:
  1. Derive base username from Google email local part or profile name (`baseName = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '_')`).
  2. Enforce length constraints (min 3, max 25 to leave room for numeric suffix).
  3. Query `user_accounts` for availability.
  4. If taken or reserved, append incrementing counter (`baseName1`, `baseName2`...) until an available username is found.
- **Rationale**: Automates registration for OAuth users without breaking OAuth flow simplicity.
