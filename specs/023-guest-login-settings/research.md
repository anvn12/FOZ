# Phase 0 Research: Guest Login & Settings Navigation Menu Fix

## Technical Context & Findings

### 1. Navigation Menu Component Architecture
- **File**: `src/frontend/src/components/NavBar.tsx`
- **Current State**:
  - `NavBar.tsx` handles desktop left sidebar, desktop top-right fixed login button, desktop hamburger popup menu, mobile top bar header, and mobile dropdown menu.
  - Currently, `Settings` option in the dropdown menu is wrapped in `{user && ...}`, hiding it completely from guest visitors.
  - The hamburger dropdown menu (both desktop and mobile) lacks a "Log in" action for guest users when `!user`.
- **Target Changes**:
  - Un-gate `Settings` in the dropdown menu so both guests and logged-in users can click it.
  - Add a "Log in" action item inside the hamburger dropdown menu when `!user`.
  - Retain the top-right fixed "Log in" button for desktop unauthenticated visitors.

### 2. State & Session Handling
- **Store**: `useAuthStore` (`src/frontend/src/stores/auth.ts`)
- **Routing**: `react-router-dom` (`useNavigate`, `Link`)
- **Behavior**:
  - `user` is `null` for guests (`!user`).
  - Clicking "Log in" in the menu triggers `navigate("/login")`.
  - Clicking "Settings" triggers `navigate("/settings")`.

### 3. Decisions & Rationale

- **Decision 1**: Display "Settings" menu item unconditionally in both desktop and mobile dropdown menus.
  - **Rationale**: Meets requirement FR-003 and clarification Q1. Guest users can access client preferences (e.g. dark mode) and view an auth prompt on the Settings page.
- **Decision 2**: Add a "Log in" action item to the top of the dropdown menu when `!user`.
  - **Rationale**: Fulfills FR-001 and FR-002 for guests opening the hamburger menu on both desktop and mobile screens.
- **Decision 3**: No changes to backend APIs or database schemas required.
  - **Rationale**: Navigation menu state is purely frontend UI logic driven by `useAuthStore.user`.

## Alternatives Considered

- **Alternative 1**: Hide Settings for guests.
  - **Rejected**: Disapproved during `/03-speckit.clarify` session (Option A selected).
- **Alternative 2**: Trigger login modal directly on Settings click for guests.
  - **Rejected**: Users expect Settings link to go to settings view rather than blocking modal interrupt.
