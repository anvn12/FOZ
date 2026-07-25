# Implementation Plan: Profile Page Navigation Bar

**Branch**: `010-profile-nav-bar` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-profile-nav-bar/spec.md`

---

## Summary

The profile management page currently lacks the navigation bar that is present on the home page, and has a "Back to Home" button as a workaround for navigation. This plan:

1. Extracts the nav bar from `HomePage.tsx` into a new shared `NavBar` component.
2. Renders `NavBar` in both `HomePage` and `ProfilePage`, with the active icon determined by the current route.
3. Removes the "Back to Home" button from `ProfilePage`.
4. Adjusts `ProfilePage` layout to account for the fixed nav bar offset (consistent with home page).

No backend, database, or API changes are required.

---

## Technical Context

**Language/Version**: TypeScript (ESM), React 18, Node LTS (per `.nvmrc`)

**Primary Dependencies**:
- `react-router-dom` — routing + `useLocation()` for active state detection
- `react-hot-toast` — toast notifications (reused from home page)
- `zustand` — `useAuthStore` for auth state
- `@tanstack/react-query` — `useProfile` for avatar loading
- Tailwind CSS — styling (no UI library)

**Storage**: N/A — pure frontend UI change

**Testing**: Vitest + React Testing Library (existing test suite)

**Target Platform**: Web (desktop + mobile, `md:` breakpoint via Tailwind)

**Performance Goals**: No measurable performance regression; nav bar renders synchronously from existing auth store state.

**Constraints**: Must not regress any existing `ProfilePage` or `HomePage` behavior. No new npm packages required.

**Scale/Scope**: 2 files modified (`HomePage.tsx`, `ProfilePage.tsx`), 1 new file (`NavBar.tsx`), existing test files updated.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Modular Client-Server | ✅ Pass | Pure frontend change; no business logic crosses the boundary |
| II. Enforced Folder Structure | ✅ Pass | New file goes in `src/frontend/src/components/NavBar.tsx` per the established components convention |
| III. Clean Code & Reusability | ✅ Pass | Shared component chosen over duplication (FR-001, research Decision 1) |
| IV. Security at Every Layer | ✅ Pass | Nav bar respects auth state; unauthenticated users redirected to `/login` for protected actions |
| V. Consistency Over Cleverness | ✅ Pass | Uses existing `useLocation`, `useAuthStore`, `useProfile`, `LogoutDialog` — no novel patterns |
| VI. AI Service Boundaries | ✅ N/A | No AI feature involved |
| Quality Standards — WCAG 2.1 AA | ✅ Pass | Existing nav bar already has `aria-label` attributes on all icon buttons; preserved in extraction |

**Verdict: All gates pass. Proceed to Phase 1.**

---

## Project Structure

### Documentation (this feature)

```text
specs/010-profile-nav-bar/
├── spec.md              ✅ Created by /speckit.specify + /speckit.clarify
├── research.md          ✅ Created by /speckit.plan (Phase 0)
├── plan.md              ✅ This file
├── checklists/
│   └── requirements.md  ✅ Created by /speckit.specify
└── tasks.md             ⬜ Created by /speckit.tasks (next step)
```

### Source Code (repository root)

```text
src/frontend/src/
├── components/
│   ├── NavBar.tsx           [NEW] Shared nav bar component (extracted from HomePage.tsx)
│   ├── ProfileEditModal.tsx [UNCHANGED]
│   ├── LogoutDialog.tsx     [UNCHANGED — imported by NavBar]
│   └── __tests__/
│       └── NavBar.test.tsx  [NEW] Unit tests for the shared NavBar component
├── pages/
│   ├── HomePage.tsx         [MODIFY] Remove inline nav bar, import and render <NavBar />
│   ├── ProfilePage.tsx      [MODIFY] Remove "Back to Home" button, import and render <NavBar />, adjust layout offset
│   └── __tests__/
│       ├── HomePage.test.tsx    [MODIFY if exists] Update to reflect NavBar extraction
│       └── ProfilePage.test.tsx [MODIFY] Add nav bar presence assertions, remove "Back to Home" assertions
```

**Structure Decision**: Web application layout (`src/frontend/src/`). Single new component file in the established `components/` directory. No new directories needed.

---

## Phase 1: Design

### Component Design: `NavBar.tsx`

The `NavBar` component is a direct extraction of the navigation JSX currently in `HomePage.tsx`, with two additions:

1. **Route-aware active state** via `useLocation()`:
   - `/` → Home icon active
   - `/profiles/*` → Profile icon active
   - All other routes → no icon active

2. **Self-contained state**: manages `isMoreMenuOpen`, `isMobileDrawerOpen`, `isLogoutOpen` internally.

**Props**: None required. All data fetched from hooks internally.

```typescript
// Signature (illustrative — no implementation details in plan)
export function NavBar(): JSX.Element
```

**Internal hooks used**:
- `useAuthStore(s => s.user)` — auth state
- `useLocation()` — active icon detection
- `useNavigate()` — programmatic navigation
- `useProfile(userId)` — avatar image (via `ProfileNavBarAvatar` helper, moved into NavBar.tsx)

**Subcomponent**: `ProfileNavBarAvatar` — moved from `HomePage.tsx` into `NavBar.tsx` (unexported, internal helper).

---

### Layout Integration

#### `HomePage.tsx` after change
- Remove the desktop sidebar `<nav>`, mobile `<header>`, mobile drawer, bottom `<nav>`, and `ProfileNavBarAvatar` definitions.
- Remove state variables: `isMoreMenuOpen`, `isMobileDrawerOpen`, `isLogoutOpen`.
- Remove `LogoutDialog` render (moved into `NavBar`).
- Import and render `<NavBar />` at the top of the returned JSX (before the main container).
- Remove `handleProtectedClick` navigation helper (moves to NavBar) — **only if** it is not used elsewhere in HomePage. If used elsewhere, keep it or duplicate it inside NavBar.
- The `handleCreateClick` toast stays in `HomePage` (it's a feed-page action, not a nav action).

#### `ProfilePage.tsx` after change
- Remove the "Back to Home" `<div>` block (lines 52–58 of current file).
- Import and render `<NavBar />` at the top level, wrapping the existing content in the same layout pattern used by `HomePage`:
  - Outer div: `w-full min-h-screen bg-background flex justify-center`
  - Inner container: `w-full max-w-7xl flex relative justify-center`
  - Content div with left padding offset: `flex-1 w-full flex justify-center md:pl-24`
  - Main with top padding: `pt-[60px] md:pt-0` (accounts for mobile top bar)
- The existing profile content (`mx-auto max-w-2xl px-4 py-8`) moves inside the new content div.

---

### Active Icon State Logic

```text
route starts with /profiles/ → profileActive = true
route === /             → homeActive = true
otherwise              → no active icon
```

The desktop sidebar Profile icon and the mobile bottom nav Profile icon both read `profileActive` to apply the `text-primary` active class vs. `text-outline` default class.

---

## Verification Plan

### Automated Tests

```bash
# Run all frontend tests
npx vitest run --project frontend

# Run specific test files
npx vitest run src/frontend/src/components/__tests__/NavBar.test.tsx
npx vitest run src/frontend/src/pages/__tests__/ProfilePage.test.tsx
```

**New test cases for `NavBar.test.tsx`**:
- Renders desktop sidebar on `md+` viewport
- Renders mobile top bar and bottom nav on `sm` viewport
- Home icon has active style when at `/`
- Profile icon has active style when at `/profiles/123`
- No icon has active style on other routes
- Clicking Home navigates to `/`
- Profile icon redirects to login when unauthenticated

**Updated test cases for `ProfilePage.test.tsx`**:
- Nav bar is present (e.g., FOZ logo or nav landmark rendered)
- "Back to Home" link is NOT present
- Existing: profile header, bio, avatar, tabs, Edit Profile button all still render

### Manual Verification

1. Open `http://localhost:5173/profiles/:userId` — confirm nav bar renders identically to home page.
2. On desktop: click Home icon → lands on `/`. Click Profile icon → lands on own profile. Confirm Profile icon is highlighted.
3. On mobile: confirm top app bar (FOZ logo, avatar) and bottom nav bar are visible and fixed.
4. Open the More menu → Settings, Report a Problem, Log out all work.
5. Confirm "Back to Home" button is gone from the top of the profile content area.
6. Confirm all existing profile content (name, handle, bio, avatar, tabs, Edit Profile) renders correctly.
7. Open the Profile Edit Modal → confirm it still works.
8. Visit the profile page while logged out → nav bar renders with generic profile icon; clicking it redirects to `/login`.
