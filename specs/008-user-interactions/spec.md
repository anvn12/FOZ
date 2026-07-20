# Feature Specification: User Interactions

**Feature Branch**: `008-user-interactions`

**Created**: 2026-07-20

**Status**: Ready for Planning

**Input**: User description: "Refine this existing feature. Remove post creation and post deletion from scope because they belong to feature 005. Keep only comments, replies, comment edit/delete, and post/comment like-unlike interactions. Posts are an existing dependency supplied by feature 005."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - React to Posts and Comments (Priority: P1)

An authenticated user wants to like and unlike a visible post or comment so they can express appreciation without writing a response.

**Why this priority**: Reactions are the fastest, most frequent form of engagement in a discussion.

**Independent Test**: Can be fully tested by opening an existing post, liking and unliking both the post and one of its comments, and verifying that each count and active state updates correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated user views a visible post, **When** they like it, **Then** the post shows an active like state and an updated like count.
2. **Given** an authenticated user has already liked a post or comment, **When** they select its like control again, **Then** the reaction is removed and the count decreases.
3. **Given** an authenticated user repeatedly selects the like control for the same target, **When** each request completes, **Then** there is never more than one active like from that user on that target.
4. **Given** a guest views a post or comment, **When** they attempt to like or unlike it, **Then** they are directed to sign in without changing the reaction.

---

### User Story 2 - Participate in a Discussion (Priority: P1)

An authenticated user wants to add a comment to an existing post and reply to another comment so conversations remain organized in a discussion thread.

**Why this priority**: Comments and replies are the core conversation loop for existing posts.

**Independent Test**: Can be fully tested by opening an existing post, submitting a non-empty comment, replying to that comment, and verifying that the reply appears beneath its parent.

**Acceptance Scenarios**:

1. **Given** an authenticated user views a visible post, **When** they submit a non-empty comment, **Then** the comment appears in that post's discussion.
2. **Given** an authenticated user views an existing visible comment, **When** they submit a non-empty reply, **Then** the reply appears beneath that parent comment within the same discussion.
3. **Given** a guest views a post or comment, **When** they attempt to comment or reply, **Then** they are directed to sign in without creating content.
4. **Given** a user enters only whitespace into a comment or reply, **When** they try to submit it, **Then** the system rejects it with a clear validation message.

---

### User Story 3 - Manage My Comments (Priority: P2)

An authenticated user wants to correct or remove their own comment without changing anyone else's contribution.

**Why this priority**: Ownership controls improve trust and accuracy after the primary commenting flow is available.

**Independent Test**: Can be fully tested by creating a comment, editing it as its author, deleting it as its author, and confirming another user cannot perform either action.

**Acceptance Scenarios**:

1. **Given** an authenticated user views their own visible comment, **When** they submit revised non-empty text, **Then** the comment updates in place.
2. **Given** an authenticated user views their own visible comment, **When** they confirm deletion, **Then** the comment is removed from the visible discussion.
3. **Given** an authenticated user views another user's comment, **When** they attempt to edit or delete it, **Then** the system blocks the action.
4. **Given** a comment has been removed, **When** a user attempts to react to, edit, or reply to it, **Then** the system indicates that the content is no longer available.

### Edge Cases

- A reaction request races with another reaction request for the same user and target; the final visible state reflects at most one active like.
- A post is removed by the post-creation feature while a user is writing a comment or reply; submission is rejected and no orphaned comment is created.
- A reply target belongs to a different post, has been removed, or does not exist; the reply is rejected and is not attached to either discussion.
- A user loses ownership or the comment is removed while editing; the update or deletion is rejected and the discussion refreshes to its current state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to add non-empty comments to visible posts supplied by feature 005.
- **FR-002**: The system MUST allow authenticated users to reply to visible comments and keep replies within the same post discussion.
- **FR-003**: The system MUST allow authenticated users to like and unlike visible posts and comments.
- **FR-004**: The system MUST ensure each user has at most one active like state for any post or comment.
- **FR-005**: The system MUST display the authenticated viewer's current like state and the current like count for visible posts and comments.
- **FR-006**: The system MUST allow users to edit only comments they authored.
- **FR-007**: The system MUST allow users to delete only comments they authored.
- **FR-008**: The system MUST direct guests to sign in when they attempt to comment, reply, like, unlike, edit, or delete a comment.
- **FR-009**: The system MUST reject empty or whitespace-only comments, replies, and comment edits.
- **FR-010**: The system MUST prevent interaction with removed posts or comments and clearly indicate when content is no longer available.
- **FR-011**: The system MUST prevent a reply from being attached to a comment outside the target post discussion.

### Key Entities *(include if feature involves data)*

- **Post**: An existing discussion item supplied by feature 005 that comments and reactions can target.
- **Comment**: A user-written response attached to a post or another comment, with an author, body text, parent target, creation time, and visibility state.
- **Reaction**: A user's active or inactive like state on a post or comment, with a target and timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of authenticated users can like or unlike a post and a comment without assistance on their first attempt.
- **SC-002**: At least 90% of authenticated users can add a comment and a nested reply to an existing post without assistance on their first attempt.
- **SC-003**: 100% of guest attempts to comment, reply, react, edit, or delete a comment are blocked and directed to sign in.
- **SC-004**: At least 95% of successful comment and reaction updates appear in the visible discussion within 3 seconds of confirmation.
- **SC-005**: 100% of tested attempts to edit or delete another user's comment are rejected.

## Assumptions

- Feature 005 is the source of truth for creating, deleting, and supplying visible posts.
- This feature does not create, edit, delete, attach media to, or chain posts.
- Posts supplied by feature 005 can be viewed before a user interacts with them.
- Likes are binary toggles rather than a multi-reaction system.
- The interaction model is available on desktop and mobile layouts.
