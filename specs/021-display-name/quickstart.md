# Quickstart & Verification Guide: Display Name Separate from Username

**Feature Branch**: `021-display-name` | **Date**: 2026-08-06

## Quick Setup & Local Testing

### 1. Database Migration

Run Drizzle schema migration to add the `username` column to `user_accounts` and execute the backfill script for existing users:

```bash
# Run migration
npm run db:migrate
```

### 2. Automated Testing

Execute Vitest test suites for auth schemas, profile schemas, backend routes, and frontend pages:

```bash
# Unit & schema tests
npx vitest run src/shared/schemas/auth.test.ts
npx vitest run src/shared/schemas/profile.test.ts

# Integration tests
npx vitest run src/backend/__tests__/integration/auth.social.test.ts
npx vitest run src/frontend/src/pages/__tests__/ProfilePage.test.tsx
```

### 3. Manual Verification Steps

1. **Sign Up with Username**:
   - Navigate to `/login` or registration form.
   - Enter email, password, and desired handle (e.g., `johndoe`).
   - Verify real-time availability check indicator (`Available` / `Taken`).
   - Click Register. Verify account creation succeeds.

2. **Check Profile Page Route**:
   - Navigate to `/profiles/@johndoe`.
   - Verify display name is shown in bold title and `@johndoe` handle is displayed underneath.
   - Edit display name in Profile Modal to `Johnathan Doe`.
   - Verify title updates to `Johnathan Doe` while handle stays `@johndoe`.

3. **Verify Legacy Route Redirection**:
   - Navigate to `/profiles/<user-uuid>` in browser.
   - Verify browser URL automatically updates to `/profiles/@johndoe`.

4. **Google OAuth Auto-Username**:
   - Log in with Google OAuth as a new user.
   - Verify username is automatically generated (e.g., `google_user` or derived from email) without prompting.
