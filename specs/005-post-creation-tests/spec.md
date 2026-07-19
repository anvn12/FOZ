# Feature Specification: Post Creation

**Feature Branch**: `005-post-creation-tests`

**Created**: 2026-07-20

**Status**: Ready for Planning

**Input**: User description: "I want to create test cases for the post Creation functional group. Only create test case, not logic code. The details about post creation functional group is given in the project proposal and the page (for UI design).@[d:\FOZ\docs\ui-designs\upload\upload_desktop.png]"
## Clarifications

### Session 2026-07-20
- Q: How should the system handle the deletion of a root post that has comments or subsequent chained posts? → A: A (Cascade delete: Delete the root post and automatically delete all chained posts and comments).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Simple Text Post (Priority: P1)

An authenticated user wants to share their thoughts or ask a question by writing a text post, creating a new discussion thread for the community.

**Why this priority**: Core value of the platform. Without post creation, there is no content for other users to read, comment on, or like.

**Independent Test**: Can be fully tested by opening the "New Post" modal, entering valid text, clicking "Post", and verifying that the post is saved and appears in the feed.

**Acceptance Scenarios**:

1. **Given** a user is logged in as a Standard User, Moderator, or Administrator, **When** they enter valid text content into the post input field and click "Post", **Then** the post is created, the modal closes, and the post is displayed in the feed.
2. **Given** a user is logged in, **When** they attempt to click "Post" with no content in the textarea, **Then** the action is disabled, or they receive a friendly validation error message "Content cannot be empty".
3. **Given** a user is not logged in (Guest), **When** they click a button or attempt to trigger the "New Post" flow, **Then** the action is intercepted, and they are redirected to the sign-in/registration flow.
4. **Given** a user is editing a post, **When** they click the "Close" (X) button, **Then** the modal closes, and the unsaved text is discarded (optionally prompting to confirm discard if content was typed).

---

### User Story 2 - Delete My Post (Priority: P1)

An authenticated user wants to delete their own post to remove it from the forum.

**Why this priority**: Core management function. Users must have control over the content they create.

**Independent Test**: Can be tested by creating a post, clicking the "Delete" action on that post as the owner, and verifying it is no longer visible in the feed.

**Acceptance Scenarios**:

1. **Given** a Standard User is logged in, **When** they view a post they authored, **Then** they see a "Delete" action on that post.
2. **Given** a Standard User is logged in, **When** they click "Delete" on their own post and confirm, **Then** the post is removed from public view.
3. **Given** a Standard User is logged in, **When** they view a post authored by another user, **Then** they do not see a "Delete" option, and attempting to delete it via direct API endpoints fails with a forbidden error.
4. **Given** an Administrator is logged in, **When** they view any user's post, **Then** they see a "Delete" action, and clicking it deletes the post immediately.
5. **Given** a Moderator is logged in, **When** they view another user's post, **Then** they do not see a "Delete" action (Moderators can only review/forward reports, not delete directly).
6. **Given** a user deletes a root post that has comments or subsequent chained posts, **When** they click "Delete" and confirm the action, **Then** the root post, all of its chained posts, and all associated comments are permanently deleted (cascade deletion).

---

### User Story 3 - Add Media Attachments (Priority: P2)

An authenticated user wants to attach images to their post to make it more engaging.

**Why this priority**: Enhances the visual experience and post capability, but the core text forum is functional without media.

**Independent Test**: Can be tested by uploading a valid image, verifying the preview appears with a close button in the modal, and submitting the post to see the image rendered in the feed.

**Acceptance Scenarios**:

1. **Given** a logged-in user is creating a post, **When** they click "Attach media" and select a valid image (JPEG/PNG/WebP, under 5MB), **Then** the image is uploaded and a preview card with a delete/close button is shown below the textarea.
2. **Given** a logged-in user has attached an image, **When** they click the close/remove button on the preview card, **Then** the image is removed from the draft and its preview disappears.
3. **Given** a logged-in user has attached an image, **When** they submit the post, **Then** the post is created successfully and displays the attached image in the feed.
4. **Given** a logged-in user is creating a post, **When** they attempt to attach a file that is too large (exceeding 5MB) or of an unsupported format, **Then** the attachment is rejected with a clear validation message.

---

### User Story 4 - Create a Chained Thread ("Add to FOZ") (Priority: P2)

An authenticated user wants to create a sequence of connected posts (a thread) at the same time to present longer ideas.

**Why this priority**: Supports richer multi-post formatting and chains, which aligns with the "Obsidian" paper-and-ink style, but simple single-posts are the P1 baseline.

**Independent Test**: Can be tested by writing a post, clicking "Add to FOZ" to open a second chained input field, entering text, and posting to verify that multiple linked posts are created.

**Acceptance Scenarios**:

1. **Given** a logged-in user is creating a post, **When** they click the "Add to FOZ" button, **Then** a new connected textarea appears below the first one, linked by a vertical thread connecting line.
2. **Given** a user is editing a chained thread with multiple post fields, **When** they fill all fields and click "Post", **Then** a chained sequence of posts is created and displayed in order.
3. **Given** a user is editing a chained thread, **When** they click the remove/close button on a chained post text area, **Then** that specific post text area is removed from the creation sequence.

---

### Edge Cases

- **Post Character Limits**: What happens when a user attempts to submit a post containing exactly the maximum allowed characters (e.g., 5,000) versus exceeding it? (Validation should pass at boundary and fail above boundary).
- **Network / Upload Failures**: How does the system handle a network timeout or disconnect mid-upload when attaching an image? (The user should receive a retry option or error message, and the "Post" button should remain disabled/pending until resolved).
- **Concurrent Deletion**: What happens if a post is deleted by an Admin or the owner while another user is trying to comment on it? (The comment submission should fail with a "Post no longer exists" error).
- **Multiple Attachments limit**: What is the maximum number of attachments a user can add to a single post? (System should limit attachments to 4 and disable the attach button once limit is reached).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Only authenticated users (Standard Users, Moderators, Administrators) MUST be able to create new posts or threads.
- **FR-002**: System MUST validate that a post contains at least some text content or an image attachment before allowing submission.
- **FR-003**: System MUST enforce a maximum length of 5,000 characters for post text content.
- **FR-004**: System MUST allow users to attach media files (JPEG, PNG, WebP) up to a maximum of 4 files per post, with a file size limit of 5MB per file.
- **FR-005**: System MUST allow users to delete posts they authored, verifying ownership before processing deletion.
- **FR-006**: System MUST allow Administrators to delete any post, regardless of authorship.
- **FR-007**: System MUST prevent Standard Users and Moderators from deleting posts they do not own.
- **FR-008**: System MUST allow users to chain multiple posts together within the creation modal ("Add to FOZ") to form a single thread.

### Key Entities *(include if feature involves data)*

- **Post**: Represents a single content entry written by a user.
  - *Attributes*: ID, Author (User ID), Content Text, Timestamp, Parent/Chained Post ID (optional, to link threads).
- **Attachment**: Represents media uploaded and associated with a post.
  - *Attributes*: ID, Post ID, File URL, File Type, File Size.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully complete creating a simple text post in under 10 seconds from opening the modal.
- **SC-002**: 100% of unauthorized (guest) attempts to create or delete posts are successfully intercepted and blocked.
- **SC-003**: System successfully enforces input limits, rejecting 100% of posts exceeding character or file size limits with a visual validation message.
- **SC-004**: Deletion of a post is updated across active visitor views within 3 seconds without requiring a full page refresh.

## Assumptions

- **A-001**: Users have a stable internet connection capable of uploading images up to 5MB.
- **A-002**: The authentication system is already functional and provides user identity/roles (Standard User, Moderator, Admin).
- **A-003**: Rich text/Markdown parsing is out of scope for the initial post creation MVP; posts are text-based or media-based.
- **A-004**: Mobile UI layout collapses the post creation layout into a single column, but preserves all functional capabilities of the desktop layout.
