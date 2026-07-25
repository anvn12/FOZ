# Feature Specification: Profile Page Navigation Bar

**Feature Branch**: `010-profile-nav-bar`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "Current profile management UI does not contain the nav bar as in home page. Add nav bar to profile management UI, also remove 'Back to Home' button on top of the profile management UI (because users can navigate back to home using nav bar). Keep other UI intact, just edit the profile management UI (only add nav bar, and remove the back to home button)"

## Clarifications

### Session 2026-07-21

- Q: Should the nav bar be extracted into a reusable shared component or copied directly into `ProfilePage.tsx`? → A: Extract into a new shared `NavBar` component, reused by both `HomePage` and `ProfilePage`.
- Q: Which nav icon should appear active/highlighted when the user is on the profile page? → A: The **Profile** icon — the profile page is its own destination and the active state should reflect the current page context.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate from Profile Page to Home (Priority: P1)

A logged-in user viewing a profile page can navigate back to the home feed by clicking the Home icon in the navigation bar, without needing the now-removed "Back to Home" button.

**Why this priority**: Navigation consistency is foundational to usability. If a user is stranded on the profile page without the "Back to Home" button and the nav bar is absent, they lose a primary means of navigation. This is the most critical flow to restore.

**Independent Test**: Can be fully tested by visiting any profile page URL and verifying the nav bar is visible and that clicking the Home icon navigates back to the home feed.

**Acceptance Scenarios**:

1. **Given** a user is on any profile page (`/profiles/:userId`), **When** the page loads, **Then** the full navigation bar (identical to the one on the home page) is displayed.
2. **Given** a user is on a profile page, **When** the user clicks the Home icon in the nav bar, **Then** the user is navigated to the home feed (`/`).
3. **Given** a user is on a profile page, **When** the page loads, **Then** the "Back to Home" button/link is no longer visible at the top of the profile content area.

---

### User Story 2 - Use All Nav Bar Actions from Profile Page (Priority: P2)

A user on the profile page can access all navigation destinations available in the home page nav bar (Search, Create, Profile, More/Menu) directly without returning to the home page first.

**Why this priority**: Full nav bar parity ensures the profile page is a first-class destination in the app, not a dead-end sub-page.

**Independent Test**: Can be tested by opening a profile page and interacting with each navigation item (Home, Search, Create, Profile avatar, More menu) to confirm they behave identically to how they do on the home page.

**Acceptance Scenarios**:

1. **Given** a user is on a profile page (desktop/tablet), **When** the left sidebar nav bar is rendered, **Then** all navigation items (Home, Search, Create, Profile, More) are present and functional.
2. **Given** a user is on a profile page on a mobile device, **When** the page loads, **Then** the mobile top app bar and the bottom navigation bar are both rendered and functional.
3. **Given** a logged-in user is on a profile page, **When** the user clicks the Profile icon in the nav bar, **Then** the user is navigated to their own profile page.
4. **Given** a non-logged-in user is on a profile page, **When** the user clicks the Profile icon in the nav bar, **Then** the user is redirected to the login page.
5. **Given** a user is on a profile page, **When** the nav bar renders, **Then** the Profile icon is visually highlighted/active and all other nav icons (Home, Search, Create) are in their default inactive state.

---

### User Story 3 - Profile Page Content Remains Unchanged (Priority: P3)

All existing content and functionality of the profile page (profile header, bio, avatar, Edit Profile button for owners, Threads/Replies/Reposts tabs, and the Profile Edit Modal) is preserved exactly after the nav bar is added.

**Why this priority**: The explicit requirement is to keep other UI intact. Any regression here would contradict the stated acceptance criteria.

**Independent Test**: Can be tested by visiting a profile page as both the profile owner and a different user, and verifying all existing UI elements (avatar, display name, handle, bio, location, website link, Edit Profile button, tabs and their content) are present and functional.

**Acceptance Scenarios**:

1. **Given** the nav bar has been added, **When** a user views any profile page, **Then** the profile header, bio, location, website, avatar, and tabs (Threads, Replies, Reposts) all display correctly.
2. **Given** the nav bar has been added, **When** the profile owner views their own profile page, **Then** the "Edit Profile" button is still visible and the Profile Edit Modal opens correctly when clicked.
3. **Given** the nav bar has been added, **When** a non-owner views a profile page, **Then** the "Edit Profile" button is hidden, and all other profile content is displayed normally.

---

### Edge Cases

- What happens if a user navigates to a profile page directly via URL without being logged in? The nav bar must still render in its non-authenticated state (generic profile icon, Login link on mobile), and profile content must load normally.
- What happens if the profile fails to load (network error or non-existent user)? The nav bar must still be visible so the user can navigate away; only the profile content area should display the error state.
- What happens on mobile when the profile page content is long and requires scrolling? The mobile top app bar and bottom nav bar must remain fixed and not scroll with the content, consistent with home page behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The profile management page MUST display the same navigation bar as the home page, covering both desktop/tablet (left sidebar) and mobile (top app bar + bottom navigation bar) layouts.
- **FR-002**: The "Back to Home" button/link at the top of the profile page content area MUST be removed.
- **FR-003**: The navigation bar on the profile page MUST be fully functional: all icons and links MUST behave identically to how they behave on the home page.
- **FR-004**: The navigation bar MUST reflect the authenticated state of the current user: showing the user's avatar for the Profile icon when logged in, and a generic profile icon (redirecting to login) when not logged in.
- **FR-005**: All existing profile page UI elements (profile header, bio, avatar, Edit Profile button for page owner, Threads/Replies/Reposts tabs, Profile Edit Modal) MUST remain visually and functionally unchanged.
- **FR-006**: The navigation bar on the profile page MUST be fixed/sticky and not scroll with the page content, consistent with behavior on the home page.
- **FR-007**: The main profile content area MUST have appropriate padding/offset to prevent content from being hidden behind the fixed navigation bar, consistent with how the home page handles this layout.
- **FR-008**: When the navigation bar is displayed on the profile page, the Profile icon MUST appear in its active/highlighted state; all other nav icons (Home, Search, Create) MUST appear in their default inactive state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of profile page visits display the navigation bar without visual glitches or layout shifts, as verified across desktop and mobile viewports.
- **SC-002**: Users can navigate from the profile page to the home feed in a single interaction (one click/tap on the Home nav icon), maintaining the same efficiency as the removed "Back to Home" link.
- **SC-003**: Zero regressions in existing profile page functionality: all pre-existing features (bio display, avatar, Edit Profile modal, tabs) pass their existing tests and manual checks after the nav bar is added.
- **SC-004**: The profile page nav bar state (active/inactive icons, user avatar) is consistent with the user's authentication status on every page load.

## Assumptions

- The nav bar will be extracted from `HomePage.tsx` into a new shared `NavBar` component (e.g., `NavBar.tsx`) and consumed by both `HomePage` and `ProfilePage`. This eliminates duplication so future bug fixes or additions apply everywhere.
- The "More" menu (hamburger menu on desktop, mobile drawer) on the profile page will include the same items as on the home page (Settings, Report a Problem, Log out).
- The profile page is the only non-home page that currently lacks the nav bar. Other pages (Login, Register, Change Password) intentionally do not have a nav bar and are out of scope for this feature.
- Mobile responsive behavior follows the same breakpoints as the home page (`md:` breakpoint for switching between mobile and desktop layouts).
- The logout dialog used in the home page nav bar will be reused on the profile page as well.
