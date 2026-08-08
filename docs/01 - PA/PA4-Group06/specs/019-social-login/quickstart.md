# Quickstart: Social Login via Google and Facebook

**Feature Branch**: `019-social-login`
**Date**: 2026-08-06

## Environment Configuration

Add the following provider credentials to `.env`:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

# Facebook OAuth Credentials
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/v1/auth/facebook/callback
```

## Running Database Migrations

Apply the migration for `user_social_links`:

```bash
npx drizzle-kit generate
npm run db:migrate
```

## Running Tests

Execute backend integration tests for social auth:

```bash
npm run test:backend -- src/backend/api/auth/__tests__/social-auth.test.ts
```

Execute frontend UI tests for Social Login buttons:

```bash
npm run test:frontend -- src/frontend/src/pages/__tests__/LoginPage.test.tsx
```
