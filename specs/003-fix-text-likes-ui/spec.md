# Feature Specification: Fix Thread Text Overflow, Per-User Likes, and Like Count Display

**Feature Branch**: `003-fix-text-likes-ui`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "New bugs: When a thread message is too long, there is a text overflow, no line breaks. The like seems to share across all 5 accounts? When logging in as Carlos, i liked the first 3 threads and all the other accounts also have those threads liked too. The number of likes of a thread does not go up after liking."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Per-User Like State (Priority: P1)

Each of the five predefined users has their own independent like state. Liking a thread or reply as one user does not cause any other user to see that content as liked.

**Why this priority**: Shared like state across accounts breaks the prototype’s identity model and makes engagement data meaningless for testing and demos.

**Independent Test**: Sign in as Carlos, like the first three threads, sign out, sign in as a different user. The same three threads must show as not liked for the second user unless that user also liked them.

**Acceptance Scenarios**:

1. **Given** user A is signed in, **When** user A likes a thread, **Then** only user A sees that thread as liked.
2. **Given** user A liked several threads, **When** user B signs in and views the feed, **Then** those threads show as not liked for user B (unless user B liked them separately).
3. **Given** user A and user B each liked the same thread, **When** either user views the thread, **Then** each sees their own liked state correctly.
4. **Given** user A liked threads then signed out, **When** user A signs back in, **Then** user A’s previously liked threads still show as liked for user A only.

---

### User Story 2 - Accurate Like Count on Toggle (Priority: P1)

When a user likes or unlikes a thread or reply, the displayed like count updates immediately to reflect the action and stays consistent after refresh.

**Why this priority**: Like count is the primary feedback that the action worked; a static count erodes trust in the feature.

**Independent Test**: Note a thread’s like count, like it as the signed-in user, confirm the count increases by one. Unlike it and confirm the count decreases by one. Reload the page and confirm the count matches.

**Acceptance Scenarios**:

1. **Given** a thread showing like count N and not liked by the current user, **When** the user likes the thread, **Then** the count displays N+1 and the like control shows active.
2. **Given** a thread liked by the current user with count N, **When** the user unlikes the thread, **Then** the count displays N−1 (minimum 0) and the like control shows inactive.
3. **Given** a reply with like count M, **When** the user likes the reply, **Then** the reply count displays M+1.
4. **Given** a successful like action, **When** the user refreshes the feed, **Then** the count and liked state match the server-backed values.

---

### User Story 3 - Readable Long Thread and Reply Text (Priority: P2)

Long thread and reply messages wrap within the feed layout so all text remains readable without horizontal overflow or clipping.

**Why this priority**: Overflow makes long posts unusable; fix improves readability for the 500-character content limit already supported by the product.

**Independent Test**: Open a thread or reply at or near the maximum allowed length (including long unbroken words or URLs). Confirm all text is visible within the card width with line breaks and no horizontal scroll on the message body.

**Acceptance Scenarios**:

1. **Given** a thread with text near the maximum allowed length, **When** the user views it in the feed, **Then** the full message is readable with line breaks and no horizontal overflow on the message area.
2. **Given** a thread containing a long unbroken string (e.g. URL), **When** displayed in the feed, **Then** the string wraps or breaks within the card width.
3. **Given** a long reply under a thread, **When** displayed, **Then** the reply body follows the same wrapping rules as thread content.

---

### Edge Cases

- What happens when two users like the same thread at the same time? The total like count reflects both likes; each user’s personal liked indicator remains independent.
- What happens when the user switches accounts without a full browser refresh? The feed must show the new user’s like state and counts, not the previous user’s cached indicators.
- What happens when like count is zero and the user unlikes? Count remains zero; no negative values displayed.
- What happens with very short messages? Layout unchanged; no unnecessary scrollbars on the message body.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST track whether the **current signed-in user** liked each thread and reply separately from every other user.
- **FR-002**: Switching to a different predefined user MUST refresh feed like indicators and counts so they reflect that user’s session, not a prior user’s.
- **FR-003**: When the current user likes content, the displayed like count for that thread or reply MUST increase by one relative to the count shown immediately before the action (unless already at the correct value after idempotent retry).
- **FR-004**: When the current user unlikes content, the displayed like count MUST decrease by one relative to the pre-action count, never below zero.
- **FR-005**: Thread message bodies in the feed MUST wrap long text within the content area without horizontal overflow.
- **FR-006**: Reply message bodies MUST use the same readability rules as thread messages.
- **FR-007**: Like count shown on a thread MUST represent the total number of likes from all users (aggregate), while the liked indicator MUST represent only the current user’s like.

### Key Entities

- **Like**: Binding between one user and one thread or reply; unique per user per target.
- **Like count**: Aggregate number of likes on a thread or reply (all users).
- **Liked indicator**: Boolean state for whether the **current session user** liked the target.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a five-account test, 100% of accounts show independent liked indicators for the same three threads after one account liked them and others did not.
- **SC-002**: 100% of like actions in a 10-item test (threads and replies) produce a visible count change of ±1 matching the action.
- **SC-003**: After account switch without browser refresh, feed like state matches the new account within one feed view (no carryover from prior account).
- **SC-004**: 100% of test messages at maximum allowed length render with no horizontal overflow on the message body in the feed.
- **SC-005**: Liked state after page reload matches the signed-in user’s actual likes for at least 10 checked items.

## Assumptions

- The five predefined seeded accounts (including Carlos) remain the test identities.
- Maximum thread/reply length rules from the existing product (500 characters) still apply.
- Bugs were observed after prior like/post fixes; this feature corrects remaining UX/data isolation issues, not a redesign of real-time updates.
- “Like count” is global per thread; only the heart/filled state is per-user (standard social feed model).
- Mobile layout uses the same wrapping rules as desktop for message bodies.
