# Implementation Plan: Login UI Redesign (White Mode Lumina Glassmorphism)

**Branch**: `018-login-ui-redesign` | **Date**: 2026-08-06 | **Spec**: [spec.md](file:///d:/FOZ/specs/018-login-ui-redesign/spec.md)

**Input**: Feature specification from `/specs/018-login-ui-redesign/spec.md`

## Summary

Redesign the current FOZ login page (`src/frontend/src/pages/LoginPage.tsx`) to match the Lumina light-mode glassmorphic design specification (`docs/03 - UI-designs/white mode/login`). The design incorporates a light background (`#f9f9ff`), glassmorphic containers (`backdrop-filter: blur(20px)`), neon glow input focus states, gradient action buttons (`#2E7DFF` to `#9D3BFF`), custom fonts (Montserrat, Plus Jakarta Sans, JetBrains Mono), responsive 50/50 split desktop layout, and an auto-advancing 3-slide trending topic carousel.

## Technical Context

**Language/Version**: TypeScript 5, React 18 (Vite ESM)  
**Primary Dependencies**: Tailwind CSS, react-hook-form, zod, react-hot-toast, react-router-dom  
**Storage**: N/A (Frontend UI page component)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Desktop & Mobile Web Browsers (Responsive across <768px and >=768px)  
**Project Type**: Web application (Frontend UI overhaul)  
**Performance Goals**: UI render < 100ms, carousel transition 60fps  
**Constraints**: WCAG 2.1 Level AA compliant semantic structure, 0 horizontal scrollbar, 100% fidelity with reference code (`docs/03 - UI-designs/white mode/login/code.html`)  
**Scale/Scope**: Scope focused on `LoginPage.tsx`, supporting glass CSS styles in `index.css`, font loading in `index.html`, and carousel subcomponent.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Modular Client-Server Architecture**: PASS. Pure client frontend refactor in `src/frontend/`; no server changes or duplicate schemas created.
- **Enforced Folder Structure**: PASS. Code lives cleanly in `src/frontend/src/pages/LoginPage.tsx` and modular components.
- **Clean Code & Reusability**: PASS. Uses central `react-hook-form` validation and central error toast notifications.
- **Security at Every Layer**: PASS. Preserves existing JWT login auth mutation (`useLogin()`) and input validation with Zod.
- **Accessibility**: PASS. WCAG 2.1 Level AA semantic HTML structure, proper labels (`aria-label`, `htmlFor`), screen-reader friendly buttons, and full keyboard accessibility.

## Project Structure

### Documentation (this feature)

```text
specs/018-login-ui-redesign/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research findings
├── data-model.md        # Form & UI state specification
├── quickstart.md        # Local testing & verification guide
├── contracts/           # API contract documentation
│   └── auth-login.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
└── frontend/
    ├── index.html                           # Add Google Fonts (Montserrat, Plus Jakarta Sans, JetBrains Mono)
    └── src/
        ├── index.css                        # Glassmorphism utility classes & responsive tokens
        └── pages/
            ├── LoginPage.tsx                # Redesigned Lumina glassmorphic login page with Carousel & Form
            └── __tests__/
                └── LoginPage.test.tsx       # Unit & integration tests for redesigned login page
```

**Structure Decision**: Web application frontend option. Scoped to `src/frontend/` without touching backend routes or API schemas.

## Complexity Tracking

> No constitution violations detected. Standard React + Tailwind CSS implementation.
