# Feature Specification: Profile Management

**Feature Branch**: `006-profile-management`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "I want to create code for the profile management functional group. The details about profile management functional group is given in the project proposal and the page.md (for UI design)"

## Referenced Documents
- [1B. Project Proposal.md](file:///d:/FOZ/docs/1B. Project Proposal.md)
- [ui-designs/pro5 management/page.md](file:///d:/FOZ/docs/ui-designs/pro5 management/page.md)

## Clarifications

### Session 2026-07-20
- Q: How should the backend store and serve uploaded avatar files? → A: Option B (Store as Base64 encoded data directly in the PostgreSQL database profiles table as a Base64 data URL string).


## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public Profile View (Priority: P1)

As a guest or authenticated user, I want to view a member's public profile page so that I can see their avatar, username, display name, bio, location, website, and their community posts and interactions.

**Why this priority**: Crucial for community engagement. Profile discovery is a core social element that allows members to connect.

**Independent Test**: Verified by navigating to a user's public profile route (e.g. `/profiles/:userId`) as a guest, verifying all public information (display name, bio, website link, location) renders correctly, and clicking the website link navigates to the external page.

**Acceptance Scenarios**:

1. **Given** a user has set up a profile with a display name, bio, location, website, and custom avatar,
   **When** a guest or another authenticated user navigates to `/profiles/:userId`,
   **Then** the page MUST display the user's avatar, username, display name, bio, location, and website link.
   **And** the website link MUST open in a new tab.
   **And** the "Threads", "Replies", and "Reposts" tabs MUST render and display correct counts.
   **And** the "Edit Profile" button MUST NOT be visible.

2. **Given** a user has set up a profile with only mandatory fields (display name, default avatar),
   **When** another user navigates to `/profiles/:userId`,
   **Then** the page MUST display the profile with empty or hidden layout fields for bio, location, and website (no placeholders or null text rendered).

---

### User Story 2 - Profile Edit Form and Persistence (Priority: P1)

As an authenticated member, I want to edit my display name, bio, location, and website, so that I can customize my public identity in the community.

**Why this priority**: Core self-management functionality. Users must be able to change their public presence.

**Independent Test**: Verified by signing in, navigating to my own profile, clicking the "Edit Profile" button, modifying the display name, bio, location, website, and saving. The profile page should update immediately with the new values.

**Acceptance Scenarios**:

1. **Given** an authenticated user is on their own profile page,
   **When** they click the "Edit Profile" button,
   **Then** a modal/form MUST open displaying the current values for display name, bio, location, and website.

2. **Given** the edit profile form is open,
   **When** the user changes the display name, bio, location, and website to valid new values and clicks "Save",
   **Then** the form MUST submit successfully, close the edit mode, and immediately reflect the updated details on the profile page.

3. **Given** the edit profile form is open,
   **When** the user clears optional fields (bio, location, website) and clicks "Save",
   **Then** the form MUST submit successfully and these fields MUST be removed/hidden from the public profile view.

---

### User Story 3 - Avatar Upload and Persistence (Priority: P1)

As an authenticated member, I want to upload a custom avatar image in the edit profile modal so that I can have a unique visual representation in the community.

**Why this priority**: Essential visual branding element in modern web communities, as shown in the UI designs.

**Independent Test**: Verified by opening the edit profile form, clicking the avatar image to select a file, choosing a valid PNG/JPEG/GIF file, seeing the preview update, and saving the profile. The new avatar must be persisted and displayed on the profile page.

**Acceptance Scenarios**:

1. **Given** the edit profile form is open,
   **When** the user selects a new image file,
   **Then** a client-side preview of the selected image MUST render in the form immediately.

2. **Given** a new avatar is selected,
   **When** the user clicks "Save",
   **Then** the image MUST be uploaded/sent to the server, persisted in the user's profile record as a Base64 data URL string, and displayed as the active avatar on their profile page and navigation elements.

---

### User Story 4 - Access Control and Security Boundaries (Priority: P1)

As a security-conscious system, I want to ensure that only the profile owner can edit or update their profile, and that all unauthorized attempts are rejected.

**Why this priority**: Core security requirement. Unauthorized modifications would violate user privacy and undermine system trust.

**Independent Test**: Verified by logging in as User A and attempting to send a patch update request to User B's profile, verifying a `403 Forbidden` response is returned and no data changes.

**Acceptance Scenarios**:

1. **Given** User A is logged in,
   **When** they view User B's profile page,
   **Then** the "Edit Profile" button MUST NOT be rendered.

2. **Given** User A is logged in,
   **When** they attempt to send a direct API request to update User B's profile,
   **Then** the server MUST reject the request with `403 Forbidden`.

3. **Given** a guest (unauthenticated user),
   **When** they attempt to edit any profile or upload an avatar via the API,
   **Then** the server MUST reject the request with `401 Unauthorized`.

---

### User Story 5 - Form Validation and Limits (Priority: P2)

As a system, I want to validate profile inputs to prevent database corruption, layout breakage, and service abuse.

**Why this priority**: Key to maintaining data integrity and system reliability. Prevents malicious or accidental overflow inputs.

**Independent Test**: Verified by entering inputs that exceed character limits or uploading file types/sizes that exceed boundaries, verifying that clear validation messages are shown and saving is blocked.

**Acceptance Scenarios**:

1. **Given** the edit profile form is open,
   **When** the user enters a display name longer than 50 characters or a bio longer than 160 characters,
   **Then** the client MUST show a clear error message and disable the "Save" button.

2. **Given** the edit profile form is open,
   **When** the user enters an invalid URL in the website field,
   **Then** the client MUST show a validation error and block submission.

3. **Given** the edit profile form is open,
   **When** the user selects an avatar file larger than 2MB or of an invalid file type (e.g. PDF),
   **Then** the client MUST reject the file immediately with a warning message, and the upload MUST NOT proceed.

---

### User Story 6 - Mobile Responsiveness (Priority: P2)

As a mobile user, I want the profile page and edit form to adapt seamlessly to my screen dimensions so that I can manage my profile on the go.

**Why this priority**: Important for UX as web users frequently access communities via mobile browsers.

**Independent Test**: Verified by loading the profile page at mobile viewports (e.g. Pixel 7, 390x844px) and verifying correct layouts.

**Acceptance Scenarios**:

1. **Given** a user is viewing a profile on a mobile device,
   **When** the page renders,
   **Then** the avatar, display name, username, bio, and stats MUST stack vertically to fit the screen without horizontal overflow, matching [main page (pixel 7).png](file:///d:/FOZ/docs/ui-designs/pro5 management/images/main page (pixel 7).png).

2. **Given** the edit profile form is open on a mobile device,
   **When** the user edits fields,
   **Then** all input controls and action buttons MUST stack vertically, matching [edit profile.png](file:///d:/FOZ/docs/ui-designs/pro5 management/images/edit profile.png).

---

### Edge Cases

- **Empty optional fields**: Clearing optional fields (bio, location, website) must delete them in the database or store them as null, and the UI must hide their icons/labels gracefully.
- **URL normalization**: If the website URL does not contain `http://` or `https://`, the system should handle it gracefully, ideally prefixing `https://` when rendering the external link so it doesn't resolve as a relative path.
- **Concurrent updates**: If a user submits edits from two browser sessions, the latest request must succeed and overwrite previous data without deadlocks.
- **Failed uploads recovery**: If an avatar upload fails mid-way due to network loss, the existing profile data and previous avatar must remain unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a public endpoint `GET /api/v1/profiles/:userId` to retrieve profile details.
- **FR-002**: The public profile payload MUST include the profile ID, user account ID, display name, bio, location, website, avatar URL, and creation/update timestamps.
- **FR-003**: The system MUST expose an authenticated endpoint `PATCH /api/v1/profiles/me` to update the current user's profile details.
- **FR-004**: The system MUST expose an authenticated endpoint `POST /api/v1/profiles/me/avatar` to upload an avatar image, accepting it as a Base64 string or file payload and storing it directly as a Base64 data URL string.
- **FR-005**: The system MUST support uploading PNG, JPEG, and GIF formats for avatars, up to 2MB in file size, and reject files exceeding this size or with unsupported mime-types.
- **FR-006**: The system MUST validate inputs at the API boundary using Zod: display name (1-50 characters), bio (max 160 characters), location (max 100 characters), and website (valid URL format or empty, max 200 characters).
- **FR-007**: The system MUST reject profile updates if the user is unauthenticated (401 Unauthorized).
- **FR-008**: The system MUST reject attempts to update other users' profiles (403 Forbidden).
- **FR-009**: The frontend MUST display a profile view at route `/profiles/:userId`.
- **FR-010**: The frontend profile view MUST render tabs for "Threads", "Replies", and "Reposts", listing the user's threads in the primary tab.
- **FR-011**: The frontend MUST display the "Edit Profile" button on `/profiles/:userId` only if the logged-in user's ID matches the `:userId`.
- **FR-012**: The frontend "Edit Profile" modal MUST show validations for display name length, bio length, website format, and avatar size.
- **FR-013**: The frontend MUST render responsive layouts for mobile and desktop screens following the provided wireframes.

### Key Entities *(include if feature involves data)*

- **Profile**: Represents the user's public presence. Kept in the `profiles` table.
  - `id`: UUID (Primary Key, unique identifier)
  - `userAccountId`: UUID (Foreign Key referencing `user_accounts.id`, Cascade Delete)
  - `displayName`: string (Required, 1-50 chars)
  - `bio`: string (Optional, max 160 chars)
  - `avatarUrl`: string (Optional, stored directly in the database as a Base64 data URL string, e.g., `data:image/png;base64,...`)
  - `location`: string (Optional, max 100 chars)
  - `website`: string (Optional, max 200 chars)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of defined integration and unit tests for profiles must pass.
- **SC-002**: Frontend profile pages and edit modals must load and display details in under 200ms under normal mock API latency.
- **SC-003**: Backend API validation for profile edits and file uploads must respond in under 300ms.
- **SC-004**: The mobile profile layout must render without horizontal scrollbars or element overlap down to 320px width.

## Assumptions

- A default profile is created for every user during the registration process (handled by the auth/registration service).
- Uploaded avatars will be stored directly in the database profiles table as Base64-encoded strings (as data URLs), and served directly in the profile responses rather than as static server file URLs.
- The tabs "Replies" and "Reposts" will render placeholders or empty states if those subsystems are not yet implemented.
- Password change functionality is excluded from the profile management system scope (already covered by authentication).
