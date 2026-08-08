# Feature Specification: Display Name Separate from Username

**Feature Branch**: `021-display-name`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Display name can be different from username. Help me add that"

## Clarifications

### Session 2026-08-06
- Q: How should the system handle incoming requests to the legacy `/profiles/:userId` route? → A: Support both routes; `/profiles/:userId` automatically redirects to `/profiles/@<username>`.
- Q: How should username collisions be resolved during migration for existing users with duplicate email prefixes? → A: Append an incrementing numeric suffix (e.g., `john`, `john1`, `john2`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a Unique Username at Registration (Priority: P1)

As a new user registering with email/password, I want to pick a unique `@username` during sign-up so that I have a persistent, URL-safe handle that identifies me across the platform — separate from my public display name.

**Why this priority**: The username is the foundational identity anchor. Without it, the platform cannot route profile URLs, mentions, or `@handle` references correctly. Everything else in this feature depends on the username existing.

**Independent Test**: A new user can register with an email, password, and desired username. After registration the user's profile page is accessible at `/profiles/@<username>`. A second user attempting the same username is rejected with a clear error.

**Acceptance Scenarios**:

1. **Given** a guest is on the registration page,
   **When** they submit a valid email, password, and a username that has not been taken,
   **Then** the account is created, the username is permanently associated with their profile, and they are logged in.

2. **Given** a guest submits a username that is already taken,
   **When** the form is submitted,
   **Then** the system rejects registration with a clear message: "This username is already taken."

3. **Given** a guest submits a username containing invalid characters (e.g., spaces, special symbols other than `_` and `.`),
   **When** the form is submitted,
   **Then** registration is rejected with a validation message explaining the allowed character set.

4. **Given** a username shorter than 3 or longer than 30 characters is submitted,
   **When** the form is submitted,
   **Then** registration is rejected with an appropriate length-constraint message.

---

### User Story 2 - View Profile via @Username URL (Priority: P1)

As any visitor (guest or authenticated user), I want to navigate to a user's profile using their `@username` handle so that human-readable, shareable URLs work on the platform (e.g., `/profiles/@john_doe`).

**Why this priority**: URL-based profile routing is required for mentions, search results, and share links. Depends on US1.

**Independent Test**: Navigating to `/profiles/@<username>` in the browser renders the correct user's profile. The page displays both the `@username` handle and the user's display name as distinct elements.

**Acceptance Scenarios**:

1. **Given** a user with username `jane` and display name `Jane Doe` exists,
   **When** a visitor navigates to `/profiles/@jane`,
   **Then** the profile page loads showing display name "Jane Doe" prominently and `@jane` as the handle beneath it.

2. **Given** a visitor navigates to `/profiles/@nonexistent`,
   **When** the page loads,
   **Then** a 404 "User not found" page is displayed.

---

### User Story 3 - Display Name and Username Shown Separately in UI (Priority: P1)

As any visitor viewing a profile, post, or comment, I want to see the user's display name (their chosen public name) and their `@username` handle as two distinct pieces of information so that I can tell the friendly name from the unique identifier.

**Why this priority**: The core UX differentiation of this feature. Without this, having two separate fields provides no visible benefit.

**Independent Test**: On any profile card, post author line, or comment header, both the display name (e.g., "Jane Doe") and the handle (e.g., "@jane") are visible and clearly distinct. Changing the display name does not change the handle and vice versa.

**Acceptance Scenarios**:

1. **Given** a user has display name "Jane Doe" and username "jane",
   **When** their post appears in the feed or on a profile page,
   **Then** "Jane Doe" is displayed as the primary name and "@jane" is displayed as the secondary handle.

2. **Given** a user updates their display name from "Jane Doe" to "Jane Smith",
   **When** their posts and profile are viewed,
   **Then** the display name shows "Jane Smith" but the handle remains "@jane" — unchanged.

---

### User Story 4 - Change Display Name in Profile Settings (Priority: P2)

As an authenticated user, I want to update my display name in my profile settings at any time without affecting my username so that I can use a preferred name, nickname, or real name independently of my permanent handle.

**Why this priority**: Display name mutability is the practical value proposition of keeping the two fields separate.

**Independent Test**: Navigating to profile settings, changing the display name, and saving — the profile page reflects the new display name while the `@username` remains unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated user opens their profile edit form,
   **When** they update the display name and save,
   **Then** the profile page immediately reflects the new display name. The `@username` handle is not editable in this form and remains unchanged.

2. **Given** a user enters an empty display name or one exceeding 50 characters,
   **When** they attempt to save,
   **Then** the form rejects the input with a validation message; no change is persisted.

---

### User Story 5 - Social Login Assigns Username Automatically (Priority: P2)

As a user who registers via Google OAuth, I want a username to be auto-generated from my Google account information so that I get a unique handle without having to choose one during the OAuth flow.

**Why this priority**: Social login bypasses the registration form, so username assignment must be handled automatically to maintain consistency.

**Independent Test**: After completing Google OAuth for the first time, the user has a username automatically assigned (visible on their profile). The handle is unique and URL-safe.

**Acceptance Scenarios**:

1. **Given** a new user signs in via Google for the first time,
   **When** the OAuth callback completes,
   **Then** a username is derived from their Google display name or email prefix, made unique if necessary (e.g., appending a suffix), and stored permanently.

2. **Given** the derived username would conflict with an existing username,
   **When** the OAuth flow completes,
   **Then** the system automatically appends a numeric suffix (e.g., `jane2`) to make it unique — no user action required.

---

### Edge Cases

- What happens when a user attempts to set a username that differs only by case (e.g., `Jane` vs `jane`)? Usernames are case-insensitive for uniqueness checks but stored in lowercase.
- What happens when an auto-generated username from social login still conflicts after suffixing? The system retries with incrementing suffixes until a unique one is found (up to a reasonable limit).
- What happens when a guest visits `/profiles/@username` where the username belongs to a suspended or banned user? The profile page may still render with limited information, consistent with existing behavior for such accounts.
- What happens if someone tries to register a username that is a reserved word (e.g., `admin`, `api`, `support`)? Reserved usernames are rejected at validation time with a clear message.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST require a unique `username` from every user, distinct from their display name.
- **FR-002**: Usernames MUST contain only lowercase letters, digits, underscores (`_`), and periods (`.`), with a minimum length of 3 characters and a maximum of 30 characters.
- **FR-003**: Username uniqueness MUST be enforced case-insensitively at the data storage level.
- **FR-004**: Usernames MUST be permanent once set — users MUST NOT be able to change their username after registration.
- **FR-005**: The system MUST allow users to update their display name at any time, independently of their username.
- **FR-006**: Profile pages MUST be accessible via the `@username` URL route (e.g., `/profiles/@<username>`). The legacy `/profiles/:userId` route MUST automatically redirect to `/profiles/@<username>`.
- **FR-007**: All UI surfaces that show a user's identity (feed posts, comments, profile headers, search results, admin/moderator panels) MUST display both the display name and the `@username` handle as visually distinct elements.
- **FR-008**: For social login (Google OAuth), the system MUST automatically derive and assign a unique, valid username from the user's Google profile information, requiring no manual input from the user.
- **FR-009**: Reserved usernames (a defined list including terms such as `admin`, `api`, `moderator`, `support`, `root`, `null`, `undefined`, `foz`) MUST be rejected at validation time.
- **FR-010**: The registration form MUST include a real-time or on-blur availability check so users know whether their chosen username is taken before submitting the form.
- **FR-011**: The system MUST provide a clear, unambiguous validation message for each username constraint violation (too short, too long, invalid characters, already taken, reserved).

### Key Entities

- **User Account**: The authentication record. Gains a `username` field — globally unique, immutable after creation, URL-safe.
- **Profile**: The public-facing record. Retains `displayName` (mutable), bio, avatar, location, website. Does NOT store the username (owned by User Account).
- **Username Reservation List**: A static list of reserved strings that cannot be claimed as usernames.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing and new user accounts have a unique, non-null username after the migration is applied.
- **SC-002**: Users can navigate to any profile via `/profiles/@<username>` with a page load response in under 2 seconds under normal conditions.
- **SC-003**: Username uniqueness constraint violations are caught before form submission in under 500ms (real-time availability check).
- **SC-004**: 100% of UI surfaces displaying user identity show both the display name and the `@username` handle as distinct elements — verifiable via acceptance test scenarios.
- **SC-005**: Social login users receive a valid, unique username automatically with no additional user action required, confirmed by end-to-end OAuth flow testing.
- **SC-006**: Attempting to register a duplicate or reserved username results in a rejection 100% of the time, with a human-readable error message.

---

## Assumptions

- Usernames are immutable after initial assignment — no rename feature is in scope for this version.
- The display name field already exists in the profiles table and its validation rules remain unchanged.
- Existing users in the database will be backfilled with a username derived from their email prefix as part of a migration step; duplicate prefixes will be resolved by appending numeric suffixes (`john`, `john1`, `john2`). This migration is a one-time operation and is included in scope.
- The URL routing change to support `/profiles/@:username` (alongside or replacing `/profiles/:userId`) is in scope and must be implemented alongside this feature.
- Mobile support follows the same feature set; no mobile-specific variations are in scope.
- The username availability check endpoint will be rate-limited to prevent enumeration abuse.
