# Feature Specification: Login UI Redesign (White Mode Lumina Glassmorphism)

**Feature Branch**: `018-login-ui-redesign`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Change current login UI to the white mode Lumina glassmorphic design from docs/03 - UI-designs/white mode/login with full responsive layout support."

## Clarifications

### Session 2026-08-06

- Q: How should "Create new account" and "Forgotten password?" navigation behave? → A: Navigate directly to `/register` for registration, and link to `/forgot-password` (or display an informational toast if unconfigured) for password recovery.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Glassmorphic Authentication & Form Submission (Priority: P1)

As a returning or new user visiting the FOZ application, I want to see a striking, modern light-mode glassmorphic login interface where I can enter my credentials securely and submit them to log in to my account.

**Why this priority**: Core user authentication entry point; without a functional and visually complete login form, users cannot access their accounts.

**Independent Test**: Can be tested by navigating to `/login` on desktop/mobile browsers, entering valid or invalid credentials into the styled glassmorphic input fields, submitting the form, and observing successful authentication navigation or error handling.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on the `/login` route, **When** the page renders, **Then** the user sees a translucent frosted glass panel containing the title "Log in to FOZ", styled input fields for email/mobile and password, a prominent gradient "Log in" action button, a "Forgotten password?" recovery link, and a "Create new account" secondary action button.
2. **Given** a user submitting invalid or empty credentials, **When** they click "Log in", **Then** validation error feedback is rendered immediately without page reload, keeping inputs clear and accessible.
3. **Given** a user submitting valid credentials, **When** they click "Log in", **Then** a loading indicator state is displayed on the button, and upon successful authentication, the user is redirected to the home page (`/`).

---

### User Story 2 - Responsive Split-Screen & Mobile Stack Layout (Priority: P2)

As a user accessing FOZ across various devices (desktop, tablet, mobile), I want the login page to automatically adjust its layout so that desktop displays a feature-rich 50/50 split view with brand hero content, while mobile devices display a clean, vertically stacked centered layout.

**Why this priority**: Responsive layout ensures a seamless, visually stunning experience on all screen sizes, preventing UI overflow, awkward scaling, or clipped form components on smaller devices.

**Independent Test**: Resize the browser window from desktop (>= 768px) down to mobile (< 768px). On desktop width, verify the 50/50 split layout with brand hero imagery and interactive trending carousel on the left and login card on the right. On mobile width, verify that the left hero panel is cleanly hidden or stacked, top brand navigation bar is shown, and the login card is horizontally centered with comfortable touch targets.

**Acceptance Scenarios**:

1. **Given** a screen width of 768px or greater (desktop), **When** viewing the login page, **Then** the page displays a 50/50 split layout: the left section presents the brand display headline ("Focus on Zillions."), subtext, and trending carousel, while the right section presents the centered glassmorphic login card.
2. **Given** a screen width under 768px (mobile), **When** viewing the login page, **Then** the layout switches to a single-column view with top navigation bar showing the FOZ logo, followed by the centered glassmorphic login card optimized for mobile viewports.

---

### User Story 3 - Interactive Trending Carousel (Priority: P3)

As a visitor exploring the login page on a desktop device, I want to see an auto-advancing, interactive trending topic carousel on the brand hero side so I can preview popular discussions and community insights.

**Why this priority**: Delivers brand personality ("Alive", "Tech-Forward") and visual engagement while users interact with or discover the platform.

**Independent Test**: Observe the hero carousel on desktop view. Verify it automatically cycles through trending cards every 5 seconds, and responds instantly to manual previous/next arrow button clicks.

**Acceptance Scenarios**:

1. **Given** the login page loaded on desktop view, **When** 5 seconds elapse without interaction, **Then** the carousel smoothly transitions to the next trending card item (e.g., Trending, Market, Community topics).
2. **Given** a user clicking the previous or next arrow navigation control buttons, **When** clicked, **Then** the carousel immediately updates the active visible card with smooth transition animations.

---

### Edge Cases

- **Small Viewport Height**: On mobile screens with low vertical height or when virtual keyboards are active, the glass card stays scrollable without hiding the submit button or form fields.
- **Dark Mode System Setting**: The new login design specifies light-mode glassmorphic tokens (`#f9f9ff` background, white frosted glass surface) by default for this page, ensuring consistent high contrast regardless of OS color scheme preference.
- **Slow Network / Submitting state**: While authentication API request is pending, input fields and submit button are disabled to prevent duplicate submissions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the login interface adhering to the Lumina light-mode glassmorphic visual specifications (`#f9f9ff` background canvas, translucent glass panel with backdrop blur `blur(20px)`, and subtle border highlights).
- **FR-002**: System MUST display brand typography using Montserrat for display/headlines, Plus Jakarta Sans for body text, and JetBrains Mono for badges and technical labels.
- **FR-003**: System MUST provide input fields for Email address/mobile number and Password with custom glass styling (`input-glass`) and a distinct blue/purple neon glow focus state (`#2E7DFF`).
- **FR-004**: System MUST include a password visibility toggle icon within the password input field.
- **FR-005**: System MUST feature a primary call-to-action button styled with a vibrant 135° linear gradient (`#2E7DFF` to `#9D3BFF`) that triggers user authentication submission.
- **FR-006**: System MUST provide navigation links using React Router `<Link>` to "Create new account" (`/register`) and "Forgotten password?" (`/forgot-password` with graceful toast fallback if unconfigured).
- **FR-007**: System MUST implement responsive layout switching between desktop (50/50 split-screen layout with left brand panel & right login card) and mobile/tablet (single-column centered card layout with top brand header).
- **FR-008**: System MUST render an interactive trending topics carousel in the desktop hero section featuring automatic 5-second slide transitions and manual navigation arrow controls.
- **FR-009**: System MUST preserve existing authentication integration, including form validation, error message notifications, and redirecting upon successful authentication to `/`.

### Key Entities *(include if feature involves data)*

- **AuthCredentials**: Encapsulates email/mobile identifier string and password string submitted during login attempt.
- **CarouselSlide**: Represents a trending item displayed in the brand hero section containing tag category (e.g., Trending, Market, Community), timestamp label, and headline text content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% visual alignment with specified Lumina white mode design specifications across desktop and mobile screen resolutions.
- **SC-002**: Page layout seamlessly adapts to screen width changes (desktop >= 768px, mobile < 768px) with 0 horizontal scrollbars or clipping.
- **SC-003**: Form interactive feedback (focus states, password visibility toggle, submit loading state) responds in under 100ms.
- **SC-004**: Form submission correctly authenticates valid users and redirects to home page (`/`) without breaking existing auth store or token handling.

## Assumptions

- Existing API endpoints (`/api/v1/auth/login`) and frontend query hooks (`useLogin`) remain fully compatible with the new visual interface.
- Fonts (Montserrat, Plus Jakarta Sans, JetBrains Mono) and icons (Material Symbols Outlined) will be loaded via standard CSS link / Tailwind font configuration.
- Password reset and registration routes exist or are linked cleanly within React Router.
