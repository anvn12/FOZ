# Implementation Plan: Mobile Login UI Redesign (White Mode Lumina)

**Branch**: `020-mobile-login-redesign` | **Date**: 2026-08-06 | **Spec**: [spec.md](file:///d:/FOZ/specs/020-mobile-login-redesign/spec.md)

**Input**: Feature specification from `/specs/020-mobile-login-redesign/spec.md`

## Summary

Redesign the FOZ login page to deliver a striking light-mode glassmorphic interface (Lumina design system) optimized for mobile devices (< 768px wide) while maintaining 100% token and visual alignment with the desktop version (`docs/03 - UI-designs/white mode/desktop/login`). The design features a centered mobile header with FOZ logo and gradient headline, frosted glass input card with blue/purple focus glow, password visibility toggle, gradient submit button, secondary "Create new account" button, and single full-width "Continue with Google" social login button. On desktop (≥ 768px), the view expands seamlessly into a 50/50 split layout with brand hero content and interactive trending carousel.

## Technical Context

**Language/Version**: TypeScript 5.x ESM (Node.js LTS, React 18)

**Primary Dependencies**: React 18, react-router-dom, Tailwind CSS, Material Symbols Outlined / lucide-react, @tanstack/react-query, zustand

**Storage**: N/A (Frontend UI component; consumes existing JWT authentication memory/cookie & React Query store)

**Testing**: Vitest + @testing-library/react

**Target Platform**: Web Browsers (Mobile < 768px, Desktop ≥ 768px responsive breakpoints)

**Project Type**: Web Application (`src/frontend/`)

**Performance Goals**: Page render < 100ms, touch interactive latency < 50ms, 60fps ambient background orb animation, 0 horizontal scrollbars

**Constraints**: Lumina white mode glassmorphism (`#f9f9ff` canvas, `backdrop-filter: blur(20px)`, specular border highlights), WCAG 2.1 Level AA (minimum 44px touch targets, color contrast, keyboard navigation)

**Scale/Scope**: `LoginPage.tsx`, `SocialLoginButtons.tsx`, mobile top navigation header, responsive layout utilities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Client-Server Architecture** → **PASS**. Frontend UI resides strictly in `src/frontend/`; backend API endpoints in `src/backend/` remain unchanged.
- **Principle II: Enforced Folder Structure** → **PASS**. All modified code lives in documented locations (`src/frontend/src/pages/LoginPage.tsx`, `src/frontend/src/components/SocialLoginButtons.tsx`).
- **Principle III: Clean Code & Reusability** → **PASS**. Shared glass utility classes and social login buttons are cleanly componentized.
- **Principle IV: Security at Every Layer** → **PASS**. Existing JWT authentication and Google OAuth flow remain fully protected and validated.
- **Principle V: Consistency Over Cleverness** → **PASS**. Uses project-standard React, Tailwind CSS, and Vite tooling.
- **Principle VI: AI Service Boundaries** → **PASS** (N/A for login UI).
- **Principle VII: Accessibility** → **PASS**. Complies with WCAG 2.1 Level AA (44px touch targets, high contrast text, screen reader labels, keyboard focus states).

## Project Structure

### Documentation (this feature)

```text
specs/020-mobile-login-redesign/
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 output: Glassmorphic performance, layout & touch research
├── data-model.md        # Phase 1 output: UI state models & sequence diagram
├── quickstart.md        # Phase 1 output: Local testing & verification guide
├── contracts/           # Phase 1 output: Component & API integration contracts
│   └── login-ui-contract.md
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/frontend/
├── src/
│   ├── components/
│   │   ├── SocialLoginButtons.tsx  # Updated full-width "Continue with Google" button
│   │   └── TrendingCarousel.tsx    # Desktop hero section carousel
│   ├── pages/
│   │   ├── LoginPage.tsx           # Responsive Lumina glassmorphic login page
│   │   └── __tests__/
│   │       └── LoginPage.test.tsx  # Vitest component tests
│   ├── index.css                   # Glassmorphism utility classes & shader orb keyframes
│   └── App.tsx                     # React Router route definition
```

**Structure Decision**: Standard web application layout (`src/frontend/`).

## Complexity Tracking

> **No violations**. All constitution gates passed cleanly.
