# Research: Profile Page Navigation Bar

**Feature**: `010-profile-nav-bar`
**Date**: 2026-07-21
**Status**: Complete — no NEEDS CLARIFICATION items remain

---

## Decision 1: Shared NavBar Component vs. Duplication

**Decision**: Extract the nav bar from `HomePage.tsx` into a new shared React component (`src/frontend/src/components/NavBar.tsx`).

**Rationale**: The nav bar is now needed in at least two pages (`HomePage`, `ProfilePage`). Constitution Principle III ("Reuse before duplicate") directly mandates this. A shared component means bug fixes and future additions apply everywhere automatically.

**Alternatives considered**:
- Copy/paste nav bar JSX into `ProfilePage.tsx` directly — rejected because it creates two sources of truth, violating Principle III and making maintenance harder.

---

## Decision 2: Active Icon State on Profile Page

**Decision**: The **Profile icon** is highlighted/active when on any `/profiles/:userId` route. All other icons (Home, Search, Create) remain in their default inactive style.

**Rationale**: Matches conventions used in Threads, Instagram, and similar apps where the active nav icon reflects the current page category. Confirmed by user in clarification Q2.

**Alternatives considered**:
- Keep Home highlighted — rejected; semantically incorrect and inconsistent with industry convention.
- No icon highlighted — rejected; would leave users without a location indicator.

---

## Decision 3: Active Icon Detection Strategy

**Decision**: Pass an `activePage` prop (or use `useLocation()` inside the shared `NavBar` component) to determine which icon to highlight. Using `useLocation()` internally keeps the call-site clean — callers don't need to pass any prop.

**Rationale**: `react-router-dom`'s `useLocation()` hook is already available in the project (confirmed in `HomePage.tsx` imports). Using it inside `NavBar` means the component self-determines its active state, which is the standard React Router pattern.

**Alternatives considered**:
- `activePage` string prop — works, but leaks routing logic to the parent; `useLocation` is cleaner and already used in the project.

---

## Decision 4: Mobile State Management in Shared NavBar

**Decision**: The `NavBar` component manages its own local state for `isMoreMenuOpen`, `isMobileDrawerOpen`, and `isLogoutOpen`. The `LogoutDialog` is rendered inside `NavBar`.

**Rationale**: All three state items are purely UI/nav concerns with no need for parent awareness. Encapsulating them inside `NavBar` keeps parents clean and the component self-contained.

**Alternatives considered**:
- Lift state to parent pages — unnecessary complexity; these states have no cross-page effects.

---

## Decision 5: `ProfileNavBarAvatar` Helper

**Decision**: Move the `ProfileNavBarAvatar` helper component from `HomePage.tsx` into `NavBar.tsx` (or into its own small file if it grows).

**Rationale**: This component is only used by the nav bar. Co-locating it with `NavBar.tsx` avoids dead code in `HomePage.tsx` after the nav bar is extracted.

---

## Research Summary

| Area | Finding |
|---|---|
| Implementation strategy | Extract to shared `NavBar.tsx` |
| Active state detection | `useLocation()` inside `NavBar` |
| State scope | NavBar self-manages all local UI state |
| Backend changes | None required |
| Data model changes | None required |
| API contract changes | None required |
| Test impact | `ProfilePage.test.tsx` needs updating; new `NavBar.test.tsx` recommended |
