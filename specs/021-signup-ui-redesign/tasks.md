# Implementation Tasks: Sign Up UI Redesign

**Feature Branch**: `021-signup-ui-redesign`
**Specification**: `./spec.md`
**Plan**: `./plan.md`

## Phase 1: Foundation (Backend & Database)
- [ ] Task 1.1: Update `auth.ts` shared schema for `RegisterRequest` with `username`, `displayName`, `location`, `website`.
- [ ] Task 1.2: Add `username` to `userAccounts` schema or `profiles` schema (`backend/db/schema/users.ts`).
- [ ] Task 1.3: Run `npx drizzle-kit generate` to create the migration.
- [ ] Task 1.4: Update `auth.service.ts` to populate profile data on register.

## Phase 2: Frontend API
- [ ] Task 2.1: Update `api/auth.ts` -> `useRegister` to set user session upon success.

## Phase 3: Frontend UI Redesign
- [ ] Task 3.1: Redesign `RegisterPage.tsx` using new auth form structure and carousel components.

## Phase 4: Onboarding Screen
- [ ] Task 4.1: Create `OnboardingAvatarPage.tsx`.
- [ ] Task 4.2: Register route `/onboarding/avatar` in `App.tsx`.
