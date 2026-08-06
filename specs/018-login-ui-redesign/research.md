# Technical Research: Login UI Redesign (White Mode Lumina Glassmorphism)

## Overview
This document consolidates architectural decisions, design system integration, and responsive layout patterns required to replace the existing login UI with the Lumina Light Mode Glassmorphic interface (`docs/03 - UI-designs/white mode/login`).

## Key Decisions & Rationale

### 1. Design System & Glassmorphism Utility Integration
- **Decision**: Define Lumina Glassmorphism CSS utility classes (`.glass-panel`, `.input-glass`, `.btn-gradient`, `.btn-glass`) within `src/frontend/src/index.css` or component-level Tailwind classes, scoped to avoid breaking monochrome forum themes on other pages.
- **Rationale**: Keeps styling modular and reusable for the login screen without side effects on main application pages like `HomePage` or `ProfilePage`.
- **Alternatives Considered**: Modifying global `--color-surface` theme tokens across the whole app. Rejected because other pages rely on existing monochrome theme parameters.

### 2. Font Loader & Typography Hierarchy
- **Decision**: Import Google Fonts (`Montserrat`, `Plus Jakarta Sans`, `JetBrains Mono`) in `src/frontend/index.html` alongside `Inter`.
- **Rationale**: Fully fulfills Lumina typography specifications (Montserrat for Display headlines, Plus Jakarta Sans for body, JetBrains Mono for badges).
- **Alternatives Considered**: Using standard system sans-serif font fallbacks. Rejected because high-fidelity visual alignment requires exact font definitions.

### 3. Responsive Layout Strategy
- **Decision**: Use Tailwind CSS breakpoint classes (`md:flex-row`, `hidden md:flex`, `w-full md:w-1/2`, `px-margin-mobile md:px-margin-desktop`) for 50/50 split desktop view vs. single-column mobile view.
- **Rationale**: Native Tailwind responsive utilities deliver zero-latency layout adjustments on window resize or device orientation change without JS resize event listeners.

### 4. Interactive Trending Carousel State Management
- **Decision**: Implement a lightweight local state hook inside `LoginPage.tsx` or a dedicated `<TrendingCarousel />` component using `useState` and `useEffect` with `setInterval(5000)`.
- **Rationale**: Minimal JS overhead; auto-advances every 5 seconds and pauses/resets timer when user manually clicks prev/next navigation arrow controls.

### 5. Form Validation & Authentication Flow
- **Decision**: Retain existing `react-hook-form` + `zodResolver(LoginRequest)` and `useLogin()` API mutation hook inside `LoginPage.tsx`.
- **Rationale**: Preserves 100% backend API compatibility, validation messaging, error toast notifications (`react-hot-toast`), and automatic redirect on login success to home (`/`).
