# Implementation Plan: Homepage UI

**Branch**: `009-homepage-ui` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-homepage-ui/spec.md`

## Summary

The goal of this feature is to replace the simple placeholder `Home` component in `src/frontend/src/App.tsx` with a fully responsive, pixel-perfect Homepage UI according to the design system in `docs/ui-designs/home/`. 

We will create a standalone `HomePage.tsx` page component and a reusable `ComposeModal.tsx` component. The homepage layout dynamically toggles between a 3-column desktop layout (with Left Sidebar, Centered Feed, and Right Sidebar) and a mobile layout (with Top App Bar, Bottom Navigation, and slide-up Drawer bottom-sheet). Authentication states are fully handled, showing/hiding login/logout buttons and compose modal options dynamically.

## Technical Context

**Language/Version**: TypeScript 5.x / ESNext

**Primary Dependencies**: React 18, React Router DOM v6, Tailwind CSS v4, Lucide/Material Symbols, Zustand, `@tanstack/react-query`

**Storage**: Local state and Zustand auth store integration (`useAuthStore`).

**Testing**: Vitest + React Testing Library (RTL) for rendering, interactions, and responsive rendering states.

**Target Platform**: Responsive Web browsers (Chrome, Safari, Firefox, Edge) supporting layout rendering down to 320px.

**Project Type**: Web application page & components.

**Performance Goals**: Layout loads and interactive menus/modal animations trigger instantly (under 100ms latency). Transitions/slides run at 60fps.

**Constraints**: Strict adherence to the `DESIGN.md` spacing (4px rhythm), color palette (monochrome high-contrast), and typography (Inter).

**Scale/Scope**: 1 new page component (`HomePage.tsx`), 1 new component (`ComposeModal.tsx`), modifications to `App.tsx`, and test file `HomePage.test.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Client-Server Architecture**: Passed. Frontend layout code is isolated to `src/frontend/`. Backend posts database schemas are unaffected by this layout-focused feature.
- **Principle II: Enforced Folder Structure**: Passed. Source folders conform to `src/frontend/src/pages/` and `src/frontend/src/components/`.
- **Principle III: Clean Code & Reusability**: Passed. Reuses the existing `LogoutDialog.tsx` for confirmation rather than duplicate sign-out dialogs.
- **Principle IV: Security at Every Layer**: Passed. Route validation and gating checks are performed on navigation clicks; guest users are redirected to `/login` when clicking protected actions ("Create", "Profile").
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
│   ├── ComposeModal.tsx     # [NEW] Composing posts modal overlay
│   └── LogoutDialog.tsx     # [Reused] Existing logout confirmation modal
├── pages/
│   └── HomePage.tsx         # [NEW] Responsive 3-column feed/layout page component
├── App.tsx                  # [MODIFY] Mount HomePage and remove inline Home component
└── index.css                # [Reused] Contains style tokens
```

## Complexity Tracking

*No violations detected.*

## Proposed Changes

### Frontend Components

#### [NEW] [ComposeModal.tsx](file:///d:/FOZ/src/frontend/src/components/ComposeModal.tsx)
- Create a modal overlay dialog that renders a textarea for composing a post.
- Includes character length validation (max 5,000 characters) and a submit button.
- Triggers a TanStack Mutation to submit the post, or shows a toast on completion.

#### [NEW] [HomePage.tsx](file:///d:/FOZ/src/frontend/src/pages/HomePage.tsx)
- Unified layout implementing:
  - **Desktop (>=1024px)**: Left Sidebar navigation with brand FOZ, links (Home, Search, Create, Profile), and a "More" bottom button toggling a menu dropdown (Settings, Report a problem, Log out). Right Sidebar column (blank placeholder when authenticated, empty block).
  - **Mobile (<768px)**: Fixed Top App Bar with hamburger menu button (left), FOZ (center), and "Log in" button (right; hidden when authenticated). Persistent Bottom Navigation (Home, Search, Create, Profile).
  - **Mobile Drawer**: Slide-up sheet overlay triggered by the menu button in the Top App Bar, containing Settings, Report a problem, and "Log out" (red text for authenticated users).
  - **Feed Feed Content**: Centers a feed of threads containing user avatars, names, relative timestamps, content bodies, and reaction button rows. Loads mock posts or calls database posts list.

#### [MODIFY] [App.tsx](file:///d:/FOZ/src/frontend/src/App.tsx)
- Remove the inline `Home` component definition.
- Import `HomePage` and mount it as the root path `/` element:
  `<Route path="/" element={<HomePage />} />`

## Verification Plan

### Automated Tests
- Create `src/frontend/src/pages/__tests__/HomePage.test.tsx`:
  - Test that guest users see "Log in" button.
  - Test that authenticated users do not see "Log in" button but see "Log out" in menus.
  - Test that clicking "Create" as guest redirects to `/login`.
  - Test that clicking "Create" as authenticated user opens the compose modal.
  - Test mobile responsive breakpoints by adjusting screen width.
- Run tests: `npx vitest run HomePage.test.tsx`

### Manual Verification
- Start local development server via `npm run dev`.
- Log in and verify that the "Log in" buttons are removed.
- Open the hamburger menu (desktop bottom-left or mobile top-left) and verify that the red "Log out" button is shown.
- Click "Log out" and verify the confirmation dialog appears and correctly signs out.
- Click "Create" and verify the compose modal opens.
