# Feature Specification: Homepage UI

**Feature Branch**: `009-homepage-ui`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "I want to create home page UI for my app, the design can be found in docs/ui-designs/home folder. I have designed for mobile and destop layout (unified), make sure to implement both so that the web is responsive. When logged in, remove the log in button, add "Log out" button (red text) inside the hamburger menu below the "Report a problem". Update: fix the current home page UI as screenshot. I want to move main content (posts) into center. Remove right bar where "Reserved for notifications & trends". Change create button when click to display a notification "Post creation coming soon", not the dialog."

## Clarifications

### Session 2026-07-21
- Q: What should be displayed in the Right Sidebar (desktop view) when the user is logged in? → A: Option A - Leave it empty / Reserved space.
- Q: What should happen when an authenticated user clicks the "Create" button in the navigation? → A: Option A - Open a compose modal overlay.

### Session 2026-07-21 (Update)
- Q: How should the main content feed be centered after removing the right sidebar? → A: The main content (posts) should be centered on the screen, and the right sidebar (reserved for notifications & trends) is removed entirely.
- Q: What should happen when clicking the "Create" button? → A: Instead of opening the compose modal dialog/overlay, it should display a toast notification saying "Post creation coming soon".
- Q: Should unauthenticated guests clicking the 'Create' button see the toast directly, or be redirected to login? → A: Directly show the "Post creation coming soon" toast to all users (both guests and logged-in members) without redirection.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop / Unified Layout (Priority: P1)

As a visitor (guest or authenticated member) using a desktop or tablet browser, I want to view a unified layout with the main feed centered on the screen so that I can browse threads comfortably with a persistent left navigation sidebar.

**Why this priority**: Core presentation layout for larger screens. Provides immediate brand identification, main feed discovery, and navigation options, centered for comfortable viewing.

**Independent Test**: Navigate to `/` on a desktop-sized viewport (>1024px). Verify the layout has two columns: left sidebar navigation (with FOZ branding, Home/Search/Create/Profile buttons, and a bottom menu button) and a centered main feed column (max-width 600px/2xl). There is no right sidebar.

**Acceptance Scenarios**:
1. **Given** a guest user on a desktop screen viewport,
   **When** the homepage loads,
   **Then** the Left Sidebar navigation MUST be visible on the left side of the screen with a width of 80px to 96px (w-20 to w-24).
   **And** the main feed column MUST be centered and have a maximum width of 600px.
   **And** a floating "Log in" button MUST render at the top right corner.
2. **Given** the Left Sidebar is visible,
   **When** the user clicks the "More" (hamburger/menu) toggle button at the bottom of the sidebar,
   **Then** a floating dropdown menu MUST appear above it containing "Settings" and "Report a problem".
   **And** clicking outside the menu MUST close the dropdown.

---

### User Story 2 - Mobile Layout & Responsiveness (Priority: P1)

As a mobile visitor using a smartphone browser, I want the homepage UI to adapt to my screen size with a persistent top app bar, a bottom navigation bar, and a slide-up menu drawer so that I can browse threads and navigate easily with touch targets.

**Why this priority**: Essential for mobile device user experience (UX), ensuring that text does not overflow and controls are thumb-accessible.

**Independent Test**: Navigate to `/` on a mobile viewport (<768px). Verify that the desktop Left Sidebar is hidden, a fixed top bar is shown with the "FOZ" logo and "Log in" button, a bottom navigation bar is shown at the bottom of the screen, and clicking the top-left menu icon slides up a bottom drawer.

**Acceptance Scenarios**:
1. **Given** a user on a screen width below 768px,
   **When** the homepage loads,
   **Then** the desktop Left Sidebar MUST be hidden.
   **And** a fixed Top App Bar (height 60px) MUST render at the top containing a menu icon button (left), "FOZ" wordmark (center), and "Log in" button (right).
   **And** a persistent Bottom Navigation bar (height 56px) MUST render at the bottom containing "Home", "Search", "Create", and "Profile" icon buttons.
2. **Given** the mobile Top App Bar is visible,
   **When** the user taps the top-left Menu button,
   **Then** a Bottom Navigation Drawer MUST slide up from the bottom of the screen.
   **And** the drawer MUST overlay a semi-transparent dark background.
   **And** it MUST contain "Settings" and "Report a problem" menu buttons.
   **And** tapping the overlay background MUST slide the drawer down and close it.

---

### User Story 3 - Authentication State Adjustments (Priority: P1)

As an authenticated member, I want the homepage layout to adjust its options based on my login state (removing the public "Log in" buttons and showing a "Log out" button with red text in the hamburger menu), so that my options match my access level.

**Why this priority**: Prevents redundant login prompts and provides a clear logout flow inside the responsive menu locations.

**Independent Test**: Sign in to the application and view the homepage. Verify the top-right "Log in" button is removed. Click the desktop "More" menu or mobile Top App Bar Menu button, and verify a "Log out" option with red text is present below "Report a problem". Click "Log out" and confirm the sign-out confirmation dialog appears.

**Acceptance Scenarios**:
1. **Given** an authenticated user is on the homepage (mobile or desktop),
   **When** the page renders,
   **Then** the floating "Log in" button MUST NOT be displayed anywhere in the UI.
2. **Given** an authenticated user on desktop clicks the "More" (hamburger/menu) toggle button,
   **When** the dropdown menu opens,
   **Then** a "Log out" option with red text MUST be displayed directly below the "Report a problem" item.
3. **Given** an authenticated user on mobile opens the Bottom Navigation Drawer,
   **When** the drawer slides up,
   **Then** a "Log out" button with red text and a logout icon MUST be displayed directly below the "Report a problem" item.
4. **Given** the "Log out" button is visible in either menu,
   **When** the user clicks it,
   **Then** the logout confirmation dialog (`LogoutDialog`) MUST open.

---

### User Story 4 - Create Button Placeholder (Priority: P1)

As a visitor or member, when I click the "Create" button, I want to see a notification informing me that post creation is coming soon so that I am aware the feature is not yet available.

**Why this priority**: Correct placeholder behavior for unavailable feature, providing clear feedback without loading dialogs or requiring unnecessary redirects.

**Independent Test**: Click the "Create" button on either the desktop Left Sidebar or mobile Bottom Navigation. Verify a toast notification displaying "Post creation coming soon" appears, and no compose modal dialog is opened.

**Acceptance Scenarios**:
1. **Given** any user on the homepage,
   **When** they click the "Create" button on the desktop sidebar or the mobile bottom navigation,
   **Then** a toast notification saying "Post creation coming soon" MUST be displayed.
   **And** no compose modal dialog MUST be opened.

---

### Edge Cases

- **Fast Viewport Resizing**: If a user rotates their device or resizes their desktop browser window, the transition between mobile view (Top App Bar + Bottom Nav + Bottom Drawer) and desktop view (Left Sidebar + dropdown menu) must happen instantly without keeping duplicate elements open.
- **Unauthenticated Navigation Gating**: If an unauthenticated guest clicks the "Profile" button on either navigation interface, they must be redirected to the `/login` route.
- **Empty Feed Degradation**: If there are no threads/posts available in the community database, the feed area must render a clean empty state with a message (e.g., "No posts yet. Be the first to share something!") rather than crash or remain blank.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a responsive homepage at the `/` route, supporting screen sizes from 320px to 1440px+ wide.
- **FR-002**: For desktop viewports (>=1024px), the system MUST render a two-column layout: Left Sidebar (navigation) and centered Main Feed (max-width 600px). The Right Sidebar is removed.
- **FR-003**: For mobile viewports (<768px), the system MUST render a single-column centered feed with a fixed Top App Bar (height 60px) and a persistent Bottom Navigation bar (height 56px).
- **FR-004**: The Left Sidebar (desktop) and Bottom Navigation (mobile) MUST contain links to "Home" (`/`), "Search" (`/search`), "Create", and "Profile" (authenticated).
- **FR-005**: If the user is unauthenticated (guest):
  - A "Log in" button MUST be displayed in the top-right corner on desktop, and in the Top App Bar on mobile. Clicking it navigates to `/login`.
  - The menu/hamburger options MUST show "Settings" and "Report a problem".
- **FR-006**: If the user is authenticated:
  - The "Log in" button MUST NOT be displayed.
  - The "More" dropdown (desktop) or Bottom Navigation Drawer (mobile) MUST display a "Log out" button with red text (`color: var(--color-error)` or `#ba1a1a` / Tailwind `text-red-600`) below the "Report a problem" option.
  - Tapping "Log out" MUST open the `LogoutDialog` to confirm sign-out.
- **FR-007**: The navigation menus (desktop dropdown, mobile drawer) MUST slide/fade in with smooth CSS transitions and be closable by clicking/tapping outside their container boundaries.
- **FR-008**: When any user clicks the "Create" button on either the Left Sidebar or Bottom Navigation, a toast notification saying "Post creation coming soon" MUST be displayed, and no modal dialog is shown.

### Key Entities *(include if feature involves data)*

- **Thread/Post**: The content items rendered in the feed list.
  - `id`: Unique identifier (UUID).
  - `author`: Profile object (displayName, avatarUrl).
  - `body`: Post body text.
  - `createdAt`: Date/time of creation (formatted as relative time, e.g., "3h", "2d").
  - `likesCount`, `repliesCount`, `repostsCount`: Numeric counters of user interactions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The homepage layout must load and render mock feed posts in under 200ms on a simulated mobile or fast 3G network connection.
- **SC-002**: The viewport transition between mobile and desktop layout modes must compile with zero layout overlapping or scrollbar bugs down to 320px screen width.
- **SC-003**: 100% of integration test specs for navigation redirection (redirecting guests to `/login` when clicking restricted nav items) must pass.

## Assumptions

- The feed page retrieves and renders posts from the existing backend posts database or endpoints.
- Clicking "Create", "Settings" and "Report a problem" will display toast alerts ("Post creation coming soon", "Settings coming soon", "Report feature coming soon") in the current iteration as those full sub-features are out of scope.
- Global styling tokens (colors, border-radius, font-family) defined in `docs/ui-designs/home/DESIGN.md` will be mapped into the application's existing design system or `index.css`.
