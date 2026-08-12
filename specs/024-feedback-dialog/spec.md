# Feature Specification: Feedback Menu Button & Dialog

**Feature Branch**: `024-feedback-dialog`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "in menu, change the report a problem to a feecback button, when user click on that button, it show a dialog box that instructs user to contact an email"

## Clarifications

### Session 2026-08-12

- Q: What exact email address should be displayed in the feedback dialog instructions? → A: `support@foz.com`
- Q: Should the feedback dialog box include a dedicated "Copy Email Address" button? → A: Yes, include a "Copy Email Address" button with quick-copy functionality and confirmation feedback

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Feedback Instructions from Menu (Priority: P1)

As a user navigating the application, I want to access a "Feedback" option in the navigation menu so that I can view instructions on how to submit feedback via email.

**Why this priority**: Core request of the feature; replaces the placeholder "Report a Problem" action with a functional, user-facing feedback dialog.

**Independent Test**: Open the navigation menu, select "Feedback", and verify that a dialog box opens with clear contact email instructions.

**Acceptance Scenarios**:

1. **Given** the user is viewing the navigation menu, **When** they look at the menu items, **Then** "Report a Problem" is replaced by a "Feedback" menu item.
2. **Given** the navigation menu is open, **When** the user clicks the "Feedback" item, **Then** a modal dialog box opens displaying instructions to send feedback to the support email.
3. **Given** the feedback dialog box is open, **When** the user clicks the close button, clicks outside the dialog, or presses the Escape key, **Then** the dialog box closes.

---

### User Story 2 - Actionable Contact Email & Copy Functionality (Priority: P2)

As a user viewing the feedback dialog, I want the support email address to be easily interactive (clickable `mailto:` link and a dedicated "Copy Email" button) so that I can send an email without manually retyping the address.

**Why this priority**: Enhances user experience by reducing friction when contacting support/feedback, especially for users utilizing web-based email clients.

**Independent Test**: Open the feedback dialog, click the "Copy Email Address" button to verify clipboard copy confirmation, and click the email link to verify it initiates an email compose action.

**Acceptance Scenarios**:

1. **Given** the feedback dialog is open, **When** the user clicks the email address link, **Then** the user's default email client opens with `support@foz.com` prepopulated in the "To" field.
2. **Given** the feedback dialog is open, **When** the user clicks the "Copy Email Address" button, **Then** `support@foz.com` is copied to the system clipboard and visual confirmation feedback (e.g. toast notification or button state change) is displayed.

---

### Edge Cases

- **Mobile Viewports**: The feedback dialog must remain centered, fully readable, and dismissible on small mobile screens.
- **Keyboard Navigation & Accessibility**: The "Feedback" menu item must be reachable via keyboard navigation, and pressing `Escape` while the dialog is open must close the dialog and return focus appropriately.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update the navigation menu by replacing the "Report a Problem" option with a "Feedback" option.
- **FR-002**: System MUST trigger a modal dialog box when the "Feedback" menu item is activated.
- **FR-003**: The dialog box MUST present clear instructional text directing the user to submit feedback via email.
- **FR-004**: The dialog box MUST display the platform support email address (`support@foz.com`) as an interactive `mailto:` link and provide a dedicated "Copy Email Address" button with visual copy confirmation feedback.
- **FR-005**: The dialog box MUST provide clear mechanism(s) for dismissal (close button, clicking backdrop, Escape key press).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of clicks on the "Feedback" menu item result in the immediate display of the feedback dialog within 100 milliseconds.
- **SC-002**: Users can complete the process of viewing the contact email and closing the dialog without encountering any visual layout breakage or UI errors across desktop and mobile devices.
- **SC-003**: Accessibility compliance: The feedback option and modal dialog must be 100% navigable via keyboard and announceable by screen readers in accordance with WCAG 2.1 AA standards.

## Assumptions

- Feedback submission is handled directly via email communication rather than an in-app form submit API.
- The designated contact email address is `support@foz.com` (or configurable platform support email).
- Replacing "Report a Problem" with "Feedback" applies to all users (both logged-in and guest users) viewing the navigation menu.
