# Feature Specification: Settings Page

**Feature Branch**: `022-settings-page`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "complete the settings button in More, it should contains the ability to change password and change appearance (dark/light)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Settings from More Menu (Priority: P1)

A logged-in user clicks the "More" button in the navigation bar and selects "Settings" from the dropdown menu. The user is navigated to a dedicated Settings page.

**Why this priority**: This is the entry point — without it, no other settings functionality is reachable.

**Independent Test**: Can be fully tested by clicking More → Settings and verifying the Settings page loads.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on any page, **When** they click "More" in the navigation bar, **Then** a dropdown menu appears containing a "Settings" option.
2. **Given** the More menu is open, **When** the user clicks "Settings", **Then** they are navigated to the Settings page.
3. **Given** the Settings page is open, **When** the user views the page, **Then** they see sections for "Change Password" and "Appearance".

---

### User Story 2 - Change Password (Priority: P2)

A logged-in user navigates to Settings and can change their password by entering their current password and a new password with confirmation.

**Why this priority**: Password management is a core account security function that users expect in any settings page.

**Independent Test**: Can be fully tested by navigating to Settings, filling in the password form, and verifying the password is updated.

**Acceptance Scenarios**:

1. **Given** the user is on the Settings page, **When** they view the Change Password section, **Then** they see fields for "Current Password", "New Password", and "Confirm New Password".
2. **Given** the user has entered a valid current password and matching new passwords, **When** they submit the form, **Then** the password is changed and a success message is shown.
3. **Given** the user enters an incorrect current password, **When** they submit the form, **Then** an error message is displayed and the password is not changed.
4. **Given** the new password and confirmation do not match, **When** they submit the form, **Then** a validation error is shown before the request is sent.
5. **Given** the new password does not meet minimum strength requirements, **When** they submit the form, **Then** a validation error describes the requirements.

---

### User Story 3 - Toggle Appearance (Dark/Light Mode) (Priority: P3)

A logged-in user navigates to Settings and can switch between dark mode and light mode. The change applies immediately and persists across sessions.

**Why this priority**: Appearance personalization improves user experience and accessibility; it is lower priority than security functions.

**Independent Test**: Can be fully tested by toggling the appearance setting and verifying the UI theme changes and persists on reload.

**Acceptance Scenarios**:

1. **Given** the user is on the Settings page, **When** they view the Appearance section, **Then** they see a toggle or selector for Light and Dark mode.
2. **Given** the user is in light mode, **When** they select dark mode, **Then** the entire application switches to dark mode immediately.
3. **Given** the user has selected dark mode, **When** they reload the page, **Then** dark mode is still active.
4. **Given** the user is in dark mode, **When** they select light mode, **Then** the application switches to light mode immediately.

---

### Edge Cases

- What happens when the user tries to set a new password that is the same as the current one?
- What happens when the user navigates away mid-password-change (form partially filled)?
- What happens if the password change request fails due to a network error?
- What happens when a guest (not logged in) tries to access the Settings page directly via URL?
- What happens when the appearance toggle is used on a device that also has a system-level dark mode preference?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Settings" option in the "More" navigation menu for authenticated users.
- **FR-002**: System MUST display a dedicated Settings page with at least two sections: Change Password and Appearance.
- **FR-003**: System MUST allow users to change their password by providing their current password and a new password with confirmation.
- **FR-004**: System MUST validate that the new password meets minimum strength requirements (minimum 8 characters).
- **FR-005**: System MUST validate that the new password and confirmation match before submitting.
- **FR-006**: System MUST reject password changes when the current password is incorrect.
- **FR-007**: System MUST show success and error feedback after password change attempts.
- **FR-008**: System MUST allow users to toggle between light mode and dark mode from the Appearance section.
- **FR-009**: System MUST apply the selected appearance theme immediately across the entire application.
- **FR-010**: System MUST persist the user's appearance preference across sessions.
- **FR-011**: System MUST protect the Settings page from unauthenticated access.

### Key Entities

- **User**: Represents an authenticated account; holds credentials and preferences.
- **Appearance Preference**: The user's chosen theme (light or dark); persisted per user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate from any page to the Settings page in 2 clicks or fewer.
- **SC-002**: Users can complete a password change in under 30 seconds (excluding typing time).
- **SC-003**: 95% of users successfully change their password on the first attempt when provided valid inputs.
- **SC-004**: Appearance theme toggle takes effect within 1 second of selection.
- **SC-005**: Appearance preference persists after browser refresh for 100% of users.
- **SC-006**: Zero instances of unauthenticated users accessing the Settings page.

## Assumptions

- The existing authentication system (JWT + refresh cookie) is reused for password change verification.
- Password change requires the current password for security; no "forgot password" flow is in scope for this feature.
- Appearance preference is stored per-user in the database (not just localStorage) so it persists across devices.
- The dark mode CSS variables already added to `index.css` will be leveraged by the appearance toggle.
- The Settings page replaces the current "Settings coming soon" toast in the More menu.
- Guest users do not see the Settings option in the More menu.
