# Implementation Plan: Homepage UI

**Branch**: `009-homepage-ui` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-homepage-ui/spec.md`

## Summary

The goal of this feature is to replace the simple placeholder `Home` component in `src/frontend/src/App.tsx` with a fully responsive, pixel-perfect Homepage UI according to the updated specification. 

We will modify `HomePage.tsx` to support a 2-column desktop layout (with Left Sidebar and Centered Feed). The Right Sidebar (reserved for notifications & trends) is removed entirely, and the main posts feed is centered on the screen. The "Create" button on the navigation will display a toast notification `"Post creation coming soon"` instead of opening a modal.

## Technical Context

**Language/Version**: TypeScript 5.x / ESNext

**Primary Dependencies**: React 18, React Router DOM v6, Tailwind CSS v4, Zustand, `react-hot-toast`

**Storage**: Local state and Zustand auth store integration (`useAuthStore`).

**Testing**: Vitest + React Testing Library (RTL) for rendering, interactions, and responsive rendering states.

**Target Platform**: Responsive Web browsers (Chrome, Safari, Firefox, Edge) supporting layout rendering down to 320px.

**Project Type**: Web application page & components.

**Performance Goals**: Layout loads and interactive menus/toast animations trigger instantly (under 100ms latency). Transitions run at 60fps.

**Constraints**: Strict adherence to the `DESIGN.md` spacing (4px rhythm), color palette (monochrome high-contrast), and typography (Inter).

**Scale/Scope**: 1 modified page component (`HomePage.tsx`), modifications to `App.tsx`, and test file `HomePage.test.tsx`. No compose modal component is needed.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Client-Server Architecture**: Passed. Frontend layout code is isolated to `src/frontend/`. Backend posts database schemas are unaffected by this layout-focused feature.
- **Principle II: Enforced Folder Structure**: Passed. Source folders conform to `src/frontend/src/pages/` and `src/frontend/src/components/`.
- **Principle III: Clean Code & Reusability**: Passed. Reuses the existing `LogoutDialog.tsx` for confirmation rather than duplicate sign-out dialogs.
- **Principle IV: Security at Every Layer**: Passed. Route validation and gating checks are performed on navigation clicks; guest users are redirected to `/login` when clicking protected actions (like "Profile"), while "Create" is un-gated to show the "coming soon" toast directly.
- **Principle V: Consistency Over Cleverness**: Passed. Restyles using Tailwind v4 classes and utilities defined in `index.css`, without installing any extra UI component libraries.

## Project Structure

### Documentation (this feature)

```text
specs/009-homepage-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/frontend/src/
├── components/
│   └── LogoutDialog.tsx     # [Reused] Existing logout confirmation modal
├── pages/
│   └── HomePage.tsx         # [MODIFY] Responsive 2-column feed/layout page component
├── App.tsx                  # [MODIFY] Mount HomePage and remove inline Home component
└── index.css                # [Reused] Contains style tokens
```

## Complexity Tracking

*No violations detected.*

## Proposed Changes

### Frontend Components

#### [MODIFY] [HomePage.tsx](file:///d:/FOZ/src/frontend/src/pages/HomePage.tsx)
- Unified layout implementing:
  - **Desktop (>=1024px)**: Left Sidebar navigation with brand FOZ, links (Home, Search, Create, Profile), and a "More" bottom button toggling a menu dropdown (Settings, Report a problem, Log out). Centered Main Feed (max-width 600px) with border outline on both left and right sides. Right Sidebar is removed entirely.
  - **Mobile (<768px)**: Fixed Top App Bar with hamburger menu button (left), FOZ (center), and "Log in" button (right; hidden when authenticated). Persistent Bottom Navigation (Home, Search, Create, Profile).
  - **Mobile Drawer**: Slide-up sheet overlay triggered by the menu button in the Top App Bar, containing Settings, Report a problem, and "Log out" (red text for authenticated users).
  - **Feed Content**: Centers a feed of threads containing user avatars, names, relative timestamps, content bodies, and reaction button rows.
  - **Create Action**: In `handleCreateClick`, display a toast notification `"Post creation coming soon"` directly for all users. Remove `ComposeModal` integration and references.

#### [MODIFY] [App.tsx](file:///d:/FOZ/src/frontend/src/App.tsx)
- Remove the inline `Home` component definition.
- Import `HomePage` and mount it as the root path `/` element:
  `<Route path="/" element={<HomePage />} />`

## Verification Plan

### Automated Tests
- Modify `src/frontend/src/pages/__tests__/HomePage.test.tsx`:
  - Mock `react-hot-toast` and spy on calls to `toast`.
  - Test that guest users see "Log in" button.
  - Test that authenticated users do not see "Log in" button but see "Log out" in menus.
  - Test that clicking "Create" as any user triggers `toast("Post creation coming soon")` and does not open a modal.
  - Test mobile responsive breakpoints by adjusting screen width.
- Run tests: `npx vitest run HomePage.test.tsx`

### Manual Verification
- Start local development server via `./start.bat`.
- Verify that the posts feed column is centered on the screen and has borders on both the left and right sides on desktop.
- Click the "Create" button on either the Left Sidebar or Bottom Navigation (mobile view) and verify that the toast notification `"Post creation coming soon"` appears.
