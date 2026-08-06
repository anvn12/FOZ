# Feature Specification: Mobile Login UI Redesign (White Mode Lumina)

**Feature Branch**: `020-mobile-login-redesign`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "redesign the Login UI on mobile based on docs/03 - UI-designs/white mode/mobile/login. The mobile design must match the original one from desktop version docs/03 - UI-designs/white mode/desktop/login, so you can adjust to make sure everything is matching together."

## Clarifications

### Session 2026-08-06

- Q: Should the mobile social login section use a single full-width "Continue with Google" button or side-by-side icon buttons? → A: Single full-width "Continue with Google" button matching active desktop layout.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mobile Glassmorphic Login Experience & Form Controls (Priority: P1)

As a mobile user visiting the FOZ application, I want a sleek, modern light-mode glassmorphic login screen optimized for mobile viewports so that I can easily enter my credentials, toggle password visibility, and authenticate without visual clutter or awkward zooming.

**Why this priority**: Core mobile user authentication entry point; mobile users require touch-friendly inputs, clean contrast, and intuitive navigation.

**Independent Test**: Can be tested on mobile viewport dimensions (< 768px wide) by navigating to `/login`, inspecting the translucent glass card, entering credentials into input fields with touch target validation, toggling password visibility, and submitting the form.

**Acceptance Scenarios**:

1. **Given** a user viewing the login page on a mobile device (< 768px width), **When** the page renders, **Then** the viewport displays a top navbar with the FOZ logo, a centered brand headline ("Focus on Zillions."), and a frosted glass card containing email/username and password inputs, a gradient "Log in" action button with arrow icon, a "Forgotten password?" recovery link, a "Create new account" secondary glass button, and social authentication options.
2. **Given** a user interacting with password input on mobile, **When** they tap the eye icon, **Then** the input type toggles between hidden password dots and visible text.
3. **Given** a user tapping the primary "Log in" button with valid credentials, **When** submission is triggered, **Then** the button shows a loading feedback state, disables duplicate taps, and redirects to the home page (`/`) upon authentication success.

---

### User Story 2 - Responsive Visual & Design Token Alignment across Breakpoints (Priority: P2)

As a user switching between mobile, tablet, and desktop devices, I want the visual identity (Lumina light-mode glassmorphism, typography, colors, background ambient orbs) to remain completely unified while the layout seamlessly transitions between single-column mobile view and 50/50 split desktop view.

**Why this priority**: Ensures brand consistency across device types; desktop and mobile share identical design tokens (colors, typography, glass aesthetics) while adapting container layouts cleanly.

**Independent Test**: Resize the browser window from 320px up to 1440px. Verify that color palette (`#f9f9ff` canvas, `#2E7DFF` to `#9D3BFF` gradient), typography (Montserrat headlines, Plus Jakarta Sans body, JetBrains Mono labels), and background floating shader orbs remain identical, while layout transitions from single-column vertical stack (< 768px) to 50/50 split hero screen (>= 768px).

**Acceptance Scenarios**:

1. **Given** screen width below 768px, **When** viewing the page, **Then** the desktop left hero panel and carousel are hidden, and content is organized into a single-column layout with centered logo header, main headline, and full-width responsive login card (padding `16px`/`20px`).
2. **Given** screen width 768px or greater, **When** viewing the page, **Then** the layout dynamically expands to a 50/50 split screen matching the desktop login design with hero section on the left and login card on the right.
3. **Given** any viewport size, **When** background elements render, **Then** animated soft floating gradient orbs (`#afc6ff` and `#dbb8ff`) render smoothly behind the frosted glass panels.

---

### User Story 3 - Mobile Touch Target Optimization & Social Login Access (Priority: P3)

As a mobile user preferring social sign-in or quick interaction, I want prominent, tap-friendly social login buttons and high-contrast touch targets that conform to mobile usability standards.

**Why this priority**: Improves mobile conversion and accessibility by providing standard 44px+ touch targets and quick social authentication access.

**Independent Test**: Interact with social login icons and secondary buttons on a mobile touch emulator/device. Confirm tap targets are at least 44px high with clear active/hover feedback states.

**Acceptance Scenarios**:

1. **Given** a mobile user looking for alternative authentication, **When** viewing the bottom section of the login glass card, **Then** an "or continue with" divider line is displayed followed by a single full-width glass "Continue with Google" button matching active desktop login UI.
2. **Given** a user tapping the "Continue with Google" button, **When** tapped, **Then** the app initiates Google OAuth authentication flow.
3. **Given** interactive elements on mobile (inputs, buttons, links), **When** measured, **Then** all tap targets have a minimum height of 44px with comfortable touch padding.

---

### Edge Cases

- **Virtual Keyboard On-Screen**: On mobile devices when the virtual keyboard pops up, the glass card and action buttons scroll gracefully inside the viewport without blocking focused inputs or submit buttons.
- **Extreme Small Screens (320px width)**: Layout scales down cleanly without text clipping, horizontal scrollbars, or button text wrapping onto multiple broken lines.
- **Disabled/Offline State**: Network failure during login attempt triggers a clear toast error alert without resetting typed input values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the mobile login interface using Lumina light-mode glassmorphism styling (`#f9f9ff` background canvas, translucent `glass-panel` container with `backdrop-filter: blur(20px)`, and specular border highlight).
- **FR-002**: System MUST render animated ambient floating shader orbs (`orb-1`: `#afc6ff` top-left, `orb-2`: `#dbb8ff` bottom-right) in the fixed background behind the content layers.
- **FR-003**: System MUST display brand typography using Montserrat for headlines (`headline-lg-mobile` 32px / `headline-md` 24px), Plus Jakarta Sans for body text, and JetBrains Mono for technical labels/badges.
- **FR-004**: System MUST render a mobile top navigation header featuring the FOZ brand logo mark and gradient logo text, centered or aligned to safe mobile margins (`20px`).
- **FR-005**: System MUST present mobile header text ("Focus on Zillions.") with gradient text highlight on "Zillions." matching desktop brand styling.
- **FR-006**: System MUST provide input fields for Email/Username and Password with custom glass styling (`input-glass`), dark mode light text contrast (`text-on-surface`), blue/purple focus glow (`#2E7DFF`), and password visibility toggle.
- **FR-007**: System MUST feature a primary submit button with a 135° linear gradient (`#2E7DFF` to `#9D3BFF`), white bold text, and right arrow icon (`arrow_forward`).
- **FR-008**: System MUST provide navigation links to "Forgotten password?" (`/forgot-password`) and "Create new account" (`/register`) styled as a full-width secondary glass button.
- **FR-009**: System MUST display a single full-width "Continue with Google" social authentication button below an "or continue with" divider, matching active desktop social login integration.


### Key Entities *(include if feature involves data)*

- **AuthCredentials**: Contains email/username string and password string submitted during login attempts.
- **LoginThemeConfig**: Defines shared visual design tokens (colors, font families, radius, spacing) shared between mobile and desktop login views.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% visual alignment with specified Lumina white mode mobile UI design (`docs/03 - UI-designs/white mode/mobile/login`) while retaining full token consistency with desktop design (`docs/03 - UI-designs/white mode/desktop/login`).
- **SC-002**: Zero horizontal scrolling across all mobile device screen widths from 320px to 767px.
- **SC-003**: Mobile touch interactive elements (inputs, buttons, links) maintain minimum 44px touch targets and respond to interaction in under 100ms.
- **SC-004**: Full integration with existing authentication flow (`useLogin` hook, session tokens, error handling) with redirect to `/` on success.

## Assumptions

- Mobile login UI leverages the same backend API (`/api/v1/auth/login`) and shared Zod validation schemas as the desktop version.
- Theme design tokens (colors, fonts, glass classes) defined in `DESIGN.md` are unified across desktop and mobile components.
- Responsive switching between mobile view (< 768px) and desktop split view (>= 768px) is handled via CSS media queries / Tailwind responsive breakpoint classes.

