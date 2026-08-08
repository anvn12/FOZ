# Implementation Plan: Guest Login & Settings Navigation Menu Fix

**Branch**: `023-guest-login-settings` | **Date**: 2026-08-08 | **Spec**: [spec.md](file:///d:/FOZ/specs/023-guest-login-settings/spec.md)

**Input**: Feature specification from `/specs/023-guest-login-settings/spec.md`

## Summary

Update `NavBar.tsx` navigation menu components (desktop More menu dropdown and mobile top-bar drawer dropdown) to display a **Log in** button when the user is unauthenticated (guest mode) and render the **Settings** option unconditionally for both guests and authenticated users.

## Technical Context

**Language/Version**: TypeScript 5.x (ESM, Node LTS)  
**Primary Dependencies**: React 18, React Router DOM v6, Tailwind CSS, Lucide / Inline SVG icons, Zustand (`useAuthStore`)  
**Storage**: N/A (Frontend component state)  
**Testing**: Vitest + React Testing Library (`src/frontend/src/components/__tests__/NavBar.test.tsx`)  
**Target Platform**: Web Browsers (Desktop & Mobile viewports)  
**Project Type**: Web Application Frontend Component (`src/frontend/src/components/NavBar.tsx`)  
**Performance Goals**: Instant menu toggle (<16ms frame), state transition <300ms  
**Constraints**: WCAG 2.1 Level AA compliant keyboard navigation and semantic button structures; no visual regressions  
**Scale/Scope**: 1 primary component (`NavBar.tsx`), 1 test suite (`NavBar.test.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Modular Client-Server Architecture**: All UI logic remains cleanly encapsulated in `src/frontend/src/components/NavBar.tsx`.
- [x] **II. Enforced Folder Structure**: File layout matches canonical `src/frontend/` layout.
- [x] **III. Clean Code & Reusability**: Reuses existing `useAuthStore` session state and icon SVG patterns.
- [x] **IV. Security at Every Layer**: Navigation links do not bypass protected route client/server checks.
- [x] **V. Consistency Over Cleverness**: Follows established `NavBar` dropdown toggle and navigation patterns.
- [x] **VI. AI Service Boundaries**: N/A (Feature does not invoke AI services).
- [x] **VII. Accessibility**: `button` elements have accessible labels (`aria-label`) and full keyboard focus/navigation support.

## Project Structure

### Documentation (this feature)

```text
specs/023-guest-login-settings/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 state model
├── quickstart.md        # Phase 1 manual verification guide
├── contracts/           # Phase 1 UI contract specifications
│   └── menu-navigation.yaml
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
└── frontend/
    └── src/
        ├── components/
        │   ├── NavBar.tsx
        │   └── __tests__/
        │       └── NavBar.test.tsx
        └── stores/
            └── auth.ts
```

**Structure Decision**: Standard web application layout using `src/frontend/src/components/NavBar.tsx` and existing Vitest unit test location.

## Complexity Tracking

> No constitution violations detected. Standard UI feature update.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
