# Feature Specification: Fix Like Button Inconsistency and Post Error Screen

**Feature Branch**: `002-fix-like-post-bugs`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "after testing the MVP, there are 2 issues i found - The like button does not work consistently, i can only like 1-2 thread and comment, this occur with all 5 accounts. - After posting a thread there is always a black screen saying something is wrong and i have to refresh to see the newly posted thread"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Like Toggle (Priority: P1)

A user can like and unlike any number of threads and comments without restriction. The like state is accurately reflected immediately after the action and persists across page reloads.

**Why this priority**: Like functionality is core social engagement. Broken likes undermine trust and usability for every user on the platform.

**Independent Test**: Log in as any account, navigate to the feed, like 5 or more threads and 5 or more comments in sequence. Every like action must succeed and be reflected in the UI count.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the feed, **When** the user clicks the like button on any thread, **Then** the like is recorded, the button shows the active state, and the count increments by 1.
2. **Given** a thread the user has already liked, **When** the user clicks the like button again, **Then** the like is removed, the button returns to inactive state, and the count decrements by 1.
3. **Given** a logged-in user, **When** the user likes 10 or more threads in a single session, **Then** all like actions succeed without error.
4. **Given** a logged-in user, **When** the user likes threads and comments interleaved, **Then** all like actions succeed and counts are accurate.
5. **Given** a page reload after liking, **When** the feed is re-displayed, **Then** previously liked items show the active liked state.

---

### User Story 2 - Seamless Thread Creation (Priority: P1)

After a user submits a new thread, the feed updates to show the new thread without any error screen or manual refresh required.

**Why this priority**: Posting a thread is the primary creation action. An error screen after every post is a critical blocker that breaks the core posting flow.

**Independent Test**: Log in as any account, compose and submit a new thread. Verify the feed immediately shows the new thread and no error screen appears.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the feed, **When** the user submits a new thread, **Then** the thread appears in the feed and no error screen is displayed.
2. **Given** a logged-in user submitting a thread, **When** submission succeeds, **Then** the user remains on the feed page without any black or error overlay.
3. **Given** a logged-in user who just posted a thread, **When** the feed is displayed, **Then** the new thread is visible without requiring a manual page refresh.
4. **Given** multiple accounts posting threads in sequence, **When** each post is submitted, **Then** every submission completes without an error screen.

---

### Edge Cases

- What happens when a like request fails mid-flight (network error)? The UI should revert the optimistic update and show the previous state.
- What happens if a user double-clicks the like button rapidly? Only one like/unlike action should register.
- What happens if the thread post request fails legitimately (server error)? An informative inline error message should display — not a full-screen black overlay.
- What happens if the user navigates away immediately after posting? The thread should still be persisted and visible on return.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The like action MUST succeed for any number of threads and comments within a single session without degradation or silent failure.
- **FR-002**: The like button state (active/inactive) MUST reflect the actual server-side like status after each action.
- **FR-003**: The like count displayed MUST be accurate and update immediately upon a successful like or unlike action.
- **FR-004**: After successfully submitting a new thread, the system MUST NOT display a full-screen error overlay.
- **FR-005**: After successfully submitting a new thread, the new thread MUST appear in the feed without requiring a manual page refresh.
- **FR-006**: Error states from failed like or post requests MUST be communicated inline (e.g., toast or field-level message) rather than via a blocking full-screen overlay.
- **FR-007**: The like and post features MUST work correctly across all user accounts (no account-specific failure).

### Key Entities

- **Like**: Association between a user and a target (thread or comment); must be idempotent — creating a duplicate like is a no-op, not an error.
- **Thread**: A user-created post; after creation the thread must be immediately available in the feed response.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can like at least 20 threads and 20 comments consecutively in a single session without any failure.
- **SC-002**: The like button reflects the correct state within 500 ms of user action under normal conditions.
- **SC-003**: 100% of thread submissions by any account result in the new thread appearing in the feed without a full-screen error.
- **SC-004**: No black or full-screen error overlay appears after a successful thread post across all tested accounts.
- **SC-005**: All 5 test accounts reproduce the correct like and post behaviour after the fix.

## Assumptions

- The issues are reproducible bugs in the current MVP codebase, not infrastructure outages.
- "Black screen saying something is wrong" is a client-side error boundary or unhandled error state triggered after a successful or partially-successful post request.
- Like failures after 1–2 actions suggest a state management or server-side constraint bug (e.g., duplicate key, session issue) rather than a rate limit.
- All 5 accounts are already seeded in the development environment and can be used for testing.
- Mobile support is out of scope for this fix; only browser-based testing is required.
