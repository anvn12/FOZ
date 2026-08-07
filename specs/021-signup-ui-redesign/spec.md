# Feature Specification: Sign Up UI Redesign

**Feature Branch**: `021-signup-ui-redesign`
**Created**: 2026-08-06
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Redesigned Registration Flow (Priority: P1)
Users need a cohesive and engaging registration experience that aligns with the login page.
**Why this priority**: Core authentication journey that dictates user first impressions.
**Independent Test**: Can be tested by filling out the new form and ensuring validations pass.
**Acceptance Scenarios**:
1. **Given** a user is on the registration page, **When** they view the page, **Then** they see the new layout (carousel and shader background).
2. **Given** a user is filling out the form, **When** they leave `username` blank, **Then** a validation error is shown.

### User Story 2 - Avatar Onboarding (Priority: P2)
Users need an option to set their profile picture immediately after account creation.
**Why this priority**: Enhances profile completeness early on.
**Independent Test**: Can be fully tested immediately post-registration.
**Acceptance Scenarios**:
1. **Given** a newly registered user, **When** registration completes, **Then** they are redirected to the avatar onboarding page.
2. **Given** a user on the avatar page, **When** they click skip, **Then** they are redirected to the homepage and logged in.

## Requirements

### Functional Requirements
- **FR-001**: System MUST collect `email`, `password`, `username`, `displayName`, `location`, `website` during registration.
- **FR-002**: System MUST validate `username` for uniqueness.
- **FR-003**: System MUST automatically authenticate the user after successful registration.
- **FR-004**: System MUST present an avatar upload screen post-registration.
- **FR-005**: System MUST allow users to skip the avatar upload step.

### Key Entities
- **Profile**: Now includes a unique `username`.

## Success Criteria
- **SC-001**: Users can register and land on the homepage in under 2 minutes.
- **SC-002**: 100% of new users have a unique `username`.

## Assumptions
- Existing avatar upload API is already functional and can be reused, or the user can just skip it if it relies on Cloudinary integration implemented elsewhere.
