# Implementation Plan: Sign Up UI Redesign

**Feature Branch**: `021-signup-ui-redesign`
**Specification**: `./spec.md`

## Architecture Design

### Components
1. **Frontend: RegisterPage.tsx**: Redesigned page to mimic `LoginPage.tsx` with a dual-pane layout (carousel + form).
2. **Frontend: OnboardingAvatarPage.tsx**: A new post-registration screen.
3. **Backend/Shared**: Extend `RegisterRequest` and update `users.ts` schema to support `username`, `displayName`, `location`, `website`.
4. **Database**: Generate new Drizzle migration.

### Database Changes
- Add `username` to `profiles` table as a unique text column.

## Implementation Phases

### Phase 1: Foundation (Backend & Database)
- Update `RegisterRequest` in `shared/schemas/auth.ts`
- Update `profiles` schema in `backend/db/schema/users.ts`
- Generate drizzle migration.
- Update `auth.service.ts` to insert these fields when creating `profiles`.

### Phase 2: Frontend API
- Update `auth.ts` API hook (`useRegister`) to store the session and authenticate the user directly.

### Phase 3: Frontend UI Redesign
- Redesign `RegisterPage.tsx`.
- Include the fields for `username`, `displayName`, `location`, `website`.
- Redesign using `glass-panel` UI.

### Phase 4: Onboarding Screen
- Create `/onboarding/avatar` page (`OnboardingAvatarPage.tsx`).
- Update `App.tsx` routing.

## Constitution Check
- **Component Design**: Yes.
- **State Management**: Using standard React Query / Zustand as per other auth modules.
- **Routing**: Client-side protected routing.
- **Database Schema**: Follows Drizzle patterns.
- **Security**: Validated via Zod schemas at API boundary.
