# Phase 0 Research: Mobile Login UI Redesign (White Mode Lumina)

## 1. Glassmorphic CSS Performance & Webkit Compatibility

### Decision
Use standard Tailwind CSS classes complemented by custom glassmorphism utility classes (`.glass-panel`, `.input-glass`, `.shader-bg`, `.shader-orb`) with explicit `-webkit-backdrop-filter` support and GPU-accelerated fixed background layers.

### Rationale
Mobile web browsers (iOS Safari, Android Chrome) can experience backdrop blur rendering artifacts or frame drops if backdrop blur is applied to overly complex nested containers. 
- Using `backdrop-filter: blur(20px)` and `-webkit-backdrop-filter: blur(20px)` on the primary login card container ensures translucent glass visuals work seamlessly across iOS and Android.
- Placing floating shader background orbs in a `fixed` container with `will-change: transform` or soft CSS `filter: blur(80px)` isolates animations to GPU layers, maintaining 60fps scrolling performance on mobile screens.

### Alternatives Considered
- *Pure inline styles*: Hard to maintain and re-use across components.
- *Heavy SVG blur filters*: Caused high GPU rendering overhead on low-end mobile hardware during testing.

---

## 2. Responsive Breakpoint Layout Architecture

### Decision
Implement a unified, mobile-first responsive layout in `src/frontend/src/pages/LoginPage.tsx` using Tailwind CSS breakpoints (`md: 768px`).

### Rationale
- **Mobile (< 768px)**: Single-column vertically centered layout with top navigation header (FOZ logo + brand text), mobile headline ("Focus on Zillions."), full-width frosted glass card with padding (`px-4 py-6` or `p-6`), and single full-width "Continue with Google" button.
- **Desktop (≥ 768px)**: Expands dynamically into a 50/50 split layout (`md:grid md:grid-cols-2` or `md:flex-row`), featuring the brand hero panel with interactive trending carousel on the left and the glassmorphic login card on the right.

### Alternatives Considered
- *Separate MobileLoginPage and DesktopLoginPage files*: Leads to code duplication for form validation, state management, and authentication handling. A single responsive component guarantees complete feature parity.

---

## 3. Mobile Touch Target & Safe Area Accessibility

### Decision
Enforce a minimum touch target height of 44px (`min-h-[44px]` / `py-3`) for all input fields, buttons, and links, along with safe-area padding (`pb-safe`) and viewport scrolling for virtual keyboard expansion.

### Rationale
WCAG 2.1 Level AA and mobile design guidelines require interactive elements to be easily tappable on small touchscreens.
- Input fields and buttons use `py-3` (48px height) to provide comfortable touch padding.
- Input focus states utilize high-contrast border highlights (`#2E7DFF`) with subtle outer neon glow (`box-shadow: 0 0 15px rgba(46, 125, 255, 0.1)`).
- The outer container uses `min-h-screen` and `overflow-y-auto` so when virtual mobile keyboards open, inputs remain scrollable and accessible.

### Alternatives Considered
- *Fixed height non-scrollable container*: Causes input field clipping when mobile soft keyboards open.

---

## 4. Single-Provider Social Login Button Alignment

### Decision
Standardize social login across mobile and desktop views using a single full-width "Continue with Google" glass button below an "or continue with" divider line.

### Rationale
In turn Q1 clarification, Option A was selected to align mobile UI with active desktop login integration. 
- Using `SocialLoginButtons.tsx` as a shared component ensures both mobile and desktop login cards invoke the same Google OAuth workflow (`/api/v1/auth/google`).
- A full-width glass button matches the primary submit button width, creating visual balance on mobile touchscreens.

### Alternatives Considered
- *Multi-icon provider buttons*: Replaced per active single-provider Google auth configuration.
