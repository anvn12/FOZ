# Phase 0 Research: Social Login via Google and Facebook

**Feature Branch**: `019-social-login`
**Date**: 2026-08-06

## Research Topics & Decisions

### 1. OAuth2 Server-Side Verification for Google & Facebook

- **Decision**: Validate social identity tokens server-side using provider authorization code exchange / ID token verification before session issuance.
- **Rationale**: Direct client-only authentication is vulnerable to token tampering. Server-side validation guarantees token authenticity directly against Google and Facebook identity endpoints.
- **Alternatives Considered**:
  - *Client-side token pass-through without server validation*: Rejected due to severe security vulnerabilities (forged identity assertions).
  - *Third-party auth wrapper (Passport.js)*: Rejected to adhere to Constitution Principle V (Consistency over cleverness with lightweight Express middleware + explicit provider services).

### 2. Account Linking & Identity Mapping Schema

- **Decision**: Introduce a `user_social_links` table mapping `user_id` (FK to `users.id`) to `provider` ('google' | 'facebook') and `provider_user_id`.
- **Rationale**: Allows a single user account to be associated with multiple social identity providers as well as traditional email/password credentials without schema bloat in `users` table.
- **Linking Rule**: When authenticating via Google/Facebook:
  1. Check if `(provider, provider_user_id)` exists in `user_social_links`. If found, log in target `user_id`.
  2. If not found, check if `email` exists in `users` table.
  3. If user exists by email, create `user_social_links` record referencing existing `users.id`.
  4. If user does not exist, create new `users` record and create `user_social_links` record.

### 3. Desktop Pop-up vs Mobile Full-Page Redirect Communication Pattern

- **Decision**:
  - **Desktop (Pop-up flow)**: Frontend launches provider OAuth endpoint in a secondary window. Upon completion, backend callback handles token exchange, sets HTTP-only refresh cookie, and returns an HTML script executing `window.opener.postMessage({ type: 'SOCIAL_AUTH_SUCCESS', accessToken })` and closes the pop-up.
  - **Mobile (Full-page redirect flow)**: Frontend navigates tab directly to backend OAuth entrypoint. Callback handler processes auth, sets HTTP-only refresh cookie, and performs a 302 redirect back to application frontend home page with access token.
- **Rationale**: Retains single-page application (SPA) state on desktop while complying with mobile browser pop-up blocking restrictions.
- **Alternatives Considered**:
  - *Pure Pop-up everywhere*: Rejected because mobile Safari and Chrome heavily suppress window pop-ups.
  - *Pure Redirect everywhere*: Rejected because full-page reloads on desktop degrade user experience and clear local transient state.
