# Feature Specification: User Interactions

**Feature Branch**: `008-user-interactions`

**Created**: 2026-07-20

**Status**: Ready for Planning

**Input**: User description: "I want to create code for User Interactions functional group as shown in the attached UI images. What to have: Comment to the post, like/unlike a post or comment, reply/edit/delete a comment. Creating a new post, deleting posts (restricted by the post owner check)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Engage With Posts and Comments (Priority: P1)

An authenticated user wants to react to posts and participate in discussions by liking, unliking, commenting, and replying within a thread.

**Why this priority**: This is the core conversation loop. Without reactions and comments, the forum cannot support discussion or engagement.

**Independent Test**: Can be fully tested by opening a post, liking and unliking it, adding a comment, and replying to that comment while verifying the thread updates correctly.

**Acceptance Scenarios**:

1. **Given** a guest user views a post or comment, **When** they try to like, unlike, comment, or reply, **Then** the system blocks the action and directs them to sign in.
2. **Given** an authenticated user views a post, **When** they like it, **Then** the post shows an active like state and the like count reflects that user’s reaction.
3. **Given** an authenticated user has already liked a post or comment, **When** they select the same like control again, **Then** the reaction is removed and the count decreases accordingly.
4. **Given** an authenticated user views a post or comment thread, **When** they submit a non-empty comment, **Then** the comment appears in the thread and is associated with the target post.
5. **Given** an authenticated user views an existing comment, **When** they submit a non-empty reply, **Then** the reply appears beneath the parent comment and remains part of the same discussion thread.

---

### User Story 2 - Create and Remove Own Posts (Priority: P1)

An authenticated user wants to start a new discussion and later remove a post they own if they no longer want it visible.

**Why this priority**: Creating discussions is a primary value of the forum, and ownership-based removal is essential for user control over published content.

**Independent Test**: Can be fully tested by creating a post, confirming it appears in the feed, and then deleting it as the owner to confirm it is no longer visible.

**Acceptance Scenarios**:

1. **Given** a guest user opens the forum, **When** they attempt to create a new post, **Then** the system blocks the action and directs them to sign in.
2. **Given** an authenticated user enters valid text in the post composer, **When** they submit it, **Then** the new post is published and shown in the feed.
3. **Given** a user views a post they authored, **When** they open the post actions, **Then** they can see a delete option for that post.
4. **Given** a user views a post authored by someone else, **When** they open the post actions, **Then** they do not see a delete option for that post.
5. **Given** a post owner confirms deletion, **When** the delete action completes, **Then** the post is removed from public view and can no longer be interacted with.

---

### User Story 3 - Manage Own Comments (Priority: P2)

An authenticated user wants to correct or remove a comment they previously wrote without affecting other people’s comments.

**Why this priority**: Comment ownership controls are important, but they come after the primary post, comment, and reaction flows.

**Independent Test**: Can be fully tested by creating a comment, editing it as the original author, deleting it as the original author, and verifying other users cannot do the same.

**Acceptance Scenarios**:

1. **Given** an authenticated user views their own comment, **When** they choose to edit it and submit revised text, **Then** the comment updates in place.
2. **Given** an authenticated user views their own comment, **When** they choose to delete it and confirm the action, **Then** the comment is removed from the visible thread.
3. **Given** an authenticated user views another user’s comment, **When** they try to edit or delete it, **Then** the system blocks the action.
4. **Given** an authenticated user submits a comment or reply with no meaningful text, **When** they try to publish it, **Then** the system rejects the submission with a clear validation message.

### Edge Cases

- What happens when a user taps like or unlike repeatedly on the same post or comment? The system should keep only one active reaction state for that user and target.
- What happens when a user tries to comment on, reply to, or react to a post that has already been deleted? The system should block the action and indicate the content is no longer available.
- What happens when a user tries to edit or delete a comment that they no longer own or that has already been removed? The system should reject the action.
- What happens when a user enters only whitespace into a post or comment composer? The system should treat it as empty content and block submission.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to create a new text post from the main interaction surface.
- **FR-002**: The system MUST allow authenticated users to add comments to visible posts.
- **FR-003**: The system MUST allow authenticated users to reply to comments and keep replies within the same conversation thread.
- **FR-004**: The system MUST allow authenticated users to like and unlike posts and comments.
- **FR-005**: The system MUST ensure each user has at most one active like state for any given post or comment.
- **FR-006**: The system MUST allow users to edit only their own comments.
- **FR-007**: The system MUST allow users to delete only their own comments.
- **FR-008**: The system MUST allow users to delete only posts they own.
- **FR-009**: The system MUST prevent guests from creating posts, commenting, replying, liking, editing, or deleting content, and must direct them to sign in when they attempt those actions.
- **FR-010**: The system MUST prevent users from editing or deleting posts or comments they do not own.
- **FR-011**: The system MUST reject empty or whitespace-only posts, comments, and replies.
- **FR-012**: The system MUST remove deleted posts from public view and prevent further interactions with them.

### Key Entities *(include if feature involves data)*

- **Post**: A discussion item created by a user and shown in the feed or thread view.
  - Attributes: author, body text, creation time, current visibility state.
- **Comment**: A user-written response attached to a post or another comment.
  - Attributes: author, body text, parent target, creation time, edit state, visibility state.
- **Reaction**: A user’s like state on a post or comment.
  - Attributes: reacting user, target item, active/inactive state, timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability testing, at least 90% of authenticated users can complete a post, comment, reply, and like/unlike action without assistance on their first attempt.
- **SC-002**: 100% of guest attempts to create, comment, reply, like, edit, or delete content are blocked and redirected to sign in.
- **SC-003**: At least 95% of successful interaction updates appear in the visible thread within 3 seconds of the action being confirmed.
- **SC-004**: At least 90% of tested owners can find and use the correct delete control for their own post or comment without help.

## Assumptions

- Users can already view posts and threads before they interact with them.
- This feature covers text posts and text comments only; media attachments are out of scope.
- Likes are binary toggles rather than a multi-reaction system.
- Deleting a post ends further interaction with that post and removes it from public view.
- The same interaction model is available on desktop and mobile, with layout adapting to screen size.