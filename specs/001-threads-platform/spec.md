# Feature Specification: Threads Platform — Core MVP

**Feature Branch**: `001-threads-platform`

**Created**: 2026-06-04

**Status**: Draft

## Clarifications

### Session 2026-06-04

- Q: How should content ownership be determined and enforced given there is no authentication? → A: Prototype trust model — ownership is tracked by the author field on each post, and the UI surfaces controls (e.g., delete) based on the currently selected user identity. No server-side enforcement exists; the system trusts that users act within their own identity.
- Q: Can a user like their own thread or reply? → A: Yes — self-like is allowed with no restriction. A user may like their own content and the like counts toward the total.
- Q: Does the app launch with pre-existing seed content, or do all five users start with an empty feed? → A: Pre-seeded — the five users launch with sample threads and replies already present to enable immediate demo and testing without manual content creation.
- Q: When another user posts a new thread, does it auto-appear in the active user's feed in real time, or only counts update live? → A: Counts only — like and reply counts update in real time; new threads from other users do not auto-push into the feed and require a reload to appear.
- Q: How does a user reload the feed to see new threads, given a full browser refresh resets the session? → A: An in-app refresh control (button or pull-to-refresh gesture) reloads feed content without resetting the selected user identity.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — User Selection & Identity (Priority: P1)

When the application first loads, it presents a list of five predefined users.
The visitor selects one user and immediately assumes that identity for the
entire session. No password or credential is required. All subsequent actions
(posting, liking, following) are performed as the selected user.

**Why this priority**: Nothing else in the application is usable until an
identity is established. This is the entry gate to all other features.

**Independent Test**: Launch the app, confirm five user profiles are listed,
select any one, and verify the main feed loads with that user's name and avatar
displayed as the active identity.

**Acceptance Scenarios**:

1. **Given** the app has just launched, **When** the user selection screen
   appears, **Then** exactly five user profiles are visible, each showing a
   name and avatar.
2. **Given** the selection screen is displayed, **When** a user clicks on a
   profile, **Then** they are taken directly to the main feed as that user
   with no additional authentication steps.
3. **Given** a session is active, **When** the user navigates within the app,
   **Then** the selected identity persists throughout the session.

---

### User Story 2 — Feed Browsing (Priority: P1)

The main view displays a consolidated feed of all threads from all users in
reverse chronological order (newest first). The feed loads more content
automatically as the user scrolls toward the bottom (infinite scroll), without
requiring a page reload or manual "load more" action.

**Why this priority**: The feed is the core value surface of the platform.
Without it, the platform has no utility.

**Independent Test**: With a session active, verify the feed displays threads
in newest-first order. Scroll to the bottom and confirm additional threads
load automatically without user interaction beyond scrolling.

**Acceptance Scenarios**:

1. **Given** a session is active, **When** the main view loads, **Then** threads
   appear in reverse chronological order with the most recently created thread
   at the top.
2. **Given** the feed is loaded, **When** the user scrolls to near the bottom,
   **Then** older threads are appended below without refreshing the page.
3. **Given** the feed is displayed, **When** a new thread is created by any
   user, **Then** it appears at the top of the feed.

---

### User Story 3 — Thread Creation (Priority: P2)

The active user can compose and publish a new thread from the main view. A
thread consists of a text body (maximum 500 characters) and optionally one
attached image. Once posted, the thread appears immediately at the top of the
feed.

**Why this priority**: Content creation is the primary input mechanism. Without
it the feed never grows, but identity and browsing must exist first.

**Independent Test**: As any selected user, compose a thread with text and an
optional image, submit it, and confirm it appears at the top of the feed with
correct authorship, timestamp, text, and image displayed.

**Acceptance Scenarios**:

1. **Given** a session is active, **When** the user opens the compose area and
   types text, **Then** a character counter reflects the remaining characters
   out of 500, and submission is blocked if the limit is exceeded.
2. **Given** the compose area is open, **When** the user attaches an image,
   **Then** only one image is accepted; attaching a second replaces the first.
3. **Given** a valid thread is submitted, **When** submission completes, **Then**
   the new thread appears at the top of the feed showing the author's name,
   avatar, timestamp, text, and image (if attached).
4. **Given** the compose area is open, **When** the user submits with no text
   and no image, **Then** submission is blocked and an error is shown.

---

### User Story 4 — Replies & Conversation Chains (Priority: P2)

Any user can reply to any thread. Replies appear directly below their parent
thread, connected by a subtle visual indicator (e.g., a vertical line) that
communicates conversational continuity. Multiple replies nest in
chronological order under the parent.

**Why this priority**: Conversation chains are the defining social mechanic of
the platform. They differentiate threads from isolated posts.

**Independent Test**: As any user, click the reply button on a thread, submit a
reply, and confirm it appears immediately below the parent thread with a
visible connector between them.

**Acceptance Scenarios**:

1. **Given** a thread is visible in the feed, **When** the user clicks the reply
   button, **Then** a compose area opens pre-associated with that thread.
2. **Given** a reply is submitted, **When** it is posted, **Then** it appears
   immediately below the parent thread with a visible visual connector linking
   them.
3. **Given** multiple replies exist on a thread, **When** the feed renders them,
   **Then** they are displayed in chronological order beneath the parent.
4. **Given** a reply is displayed, **When** another user replies to the same
   parent thread, **Then** the new reply joins the chain in order without
   displacing existing replies.

---

### User Story 5 — Likes & Social Signals (Priority: P2)

Any user can like or unlike any thread or reply. The like count on each item
updates in real time and is visible to all users without requiring a page
refresh.

**Why this priority**: Social feedback signals (likes) drive engagement and
give users visibility into what content resonates.

**Independent Test**: As user A, like a thread. Switch to user B in a separate
browser tab. Verify the like count on that thread has updated without
refreshing the page.

**Acceptance Scenarios**:

1. **Given** a thread or reply is displayed, **When** the active user clicks the
   like button, **Then** the like count increments by one and the button
   reflects the liked state immediately.
2. **Given** the active user has already liked an item, **When** they click the
   like button again, **Then** the like is removed and the count decrements by
   one.
3. **Given** any user likes or unlikes an item, **When** another session is
   viewing the same content, **Then** the updated count is reflected in real
   time without a manual refresh.

---

### User Story 6 — Follow & Unfollow Users (Priority: P3)

A user can follow or unfollow any other user. Following is recorded per active
user identity. The follow/unfollow action is available from threads and
profiles where another user's identity is surfaced.

**Why this priority**: Social graph features are valuable but do not block any
core content interactions. They build on the already-functional feed and
posting system.

**Independent Test**: As user A, follow user B. Confirm the follow state is
reflected on user B's profile or thread. Unfollow user B and confirm the state
reverts.

**Acceptance Scenarios**:

1. **Given** the active user views a thread authored by another user, **When**
   they click Follow, **Then** the active user's follow list includes that user
   and the button reflects the following state.
2. **Given** the active user already follows another user, **When** they click
   Unfollow, **Then** that user is removed from the follow list and the button
   reverts.
3. **Given** a user follows or unfollows another, **When** the change is made,
   **Then** it is persisted for the duration of the session and does not reset
   unexpectedly.

---

### User Story 7 — Content Deletion (Priority: P3)

The active user can delete any thread or reply they authored. Deleted content
is removed immediately from the feed. Users cannot edit content, and cannot
delete content authored by others.

**Why this priority**: Content ownership and the ability to retract one's own
content is a baseline expectation. It relies on all prior stories being in
place.

**Independent Test**: As user A, create a thread, then delete it. Confirm it
disappears from the feed. Attempt to delete a thread authored by user B and
confirm no delete option is available.

**Acceptance Scenarios**:

1. **Given** the active user views their own thread or reply, **When** they
   click Delete and confirm, **Then** the content is removed from the feed
   immediately.
2. **Given** the active user views content authored by another user, **When**
   they inspect the available actions, **Then** no delete option is present.
3. **Given** a thread is deleted, **When** it had replies, **Then** the replies
   are also removed from the feed.
4. **Given** the active user views their own content, **When** they inspect
   available actions, **Then** no edit option is present — only delete.

---

### Edge Cases

- What happens if the user scrolls faster than new content can load?
  A loading indicator MUST appear while content is being fetched.
- What happens if all seeded and user-created content is deleted and the feed
  is empty? An explicit empty-state message MUST be displayed.
- What happens when the 500-character limit is reached mid-word?
  Submission MUST be blocked; the user MUST be shown the current count clearly.
- What happens when image attachment fails or exceeds a reasonable file size?
  The upload MUST fail gracefully with a user-readable error; the thread can
  still be submitted as text-only.
- What happens if two users like the same item simultaneously?
  Each like MUST be counted independently; the total MUST converge correctly.
- What happens when a user deletes a thread that another user is currently viewing?
  The deleted thread MUST disappear or show a "no longer available" state on
  the viewer's screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present exactly five predefined user profiles on
  launch with no login required.
- **FR-002**: The system MUST allow a visitor to select one user identity and
  use it for the duration of the session.
- **FR-003**: The system MUST display a consolidated feed of all threads in
  reverse chronological order.
- **FR-003a**: The feed MUST provide an in-app refresh control (button or
  pull-to-refresh gesture) that reloads feed content and surfaces new threads
  from other users without resetting the active user session.
- **FR-004**: The feed MUST support infinite scroll, loading older content
  automatically as the user approaches the bottom.
- **FR-005**: Users MUST be able to create a thread containing text (up to 500
  characters) and optionally one image.
- **FR-006**: The system MUST prevent thread submission when text exceeds 500
  characters or when both text and image are absent.
- **FR-007**: Users MUST be able to reply to any thread, creating a
  conversation chain.
- **FR-008**: Replies MUST appear directly below their parent thread with a
  visual connector indicating conversational continuity.
- **FR-009**: Users MUST be able to like or unlike any thread or reply,
  including their own content. Self-likes count toward the total with no
  restriction.
- **FR-010**: Like counts and reply counts MUST update in real time across all
  active sessions without requiring a page refresh. New threads posted by other
  users do NOT auto-push into the feed; they appear only after the feed is
  manually reloaded.
- **FR-011**: Users MUST be able to follow or unfollow any other user.
- **FR-012**: The UI MUST display a delete control only on threads and replies
  authored by the currently selected user; no delete control appears on content
  authored by others.
- **FR-013**: No server-side ownership verification is required in this phase;
  enforcement is prototype trust — UI-gated only. The system MUST record the
  author identity on every thread and reply to drive UI visibility rules.
- **FR-014**: Users MUST NOT be able to edit any thread or reply after posting;
  no edit control is presented to any user on any content.
- **FR-015**: Deleting a thread MUST also remove all of its replies.

### Key Entities

- **User**: A predefined identity with a name and avatar. Five instances exist.
  Attributes: name, avatar, list of followed users, authored threads, liked
  items. Each thread and reply MUST store the author's user identity at creation
  time; this is the sole ownership signal used by the UI (prototype trust model,
  no server-side auth enforcement).
- **Thread**: A top-level post. Attributes: author, text body (≤ 500 chars),
  optional single image, timestamp, like count, reply count, list of replies.
- **Reply**: A response to a thread. Attributes: author, text body, timestamp,
  like count, parent thread reference. Replies cannot themselves be replied to
  in this phase.
- **Like**: A relationship between a user and a thread or reply. A user may
  like each item at most once.
- **Follow**: A directional relationship from one user to another. User A
  following user B does not imply B follows A.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can select a user identity and reach the main feed in
  under 5 seconds from app launch.
- **SC-002**: A new thread appears at the top of the feed within 2 seconds of
  submission.
- **SC-003**: A reply appears below its parent thread within 2 seconds of
  submission.
- **SC-004**: Like and reply count updates are reflected across sessions within
  3 seconds of the action.
- **SC-005**: The feed loads the next page of content before the user reaches
  the absolute bottom, resulting in no visible content gap during normal
  scrolling speed.
- **SC-006**: 100% of delete actions on own content result in immediate removal
  with no orphaned replies remaining.
- **SC-007**: Zero delete or edit controls are accessible on content authored
  by another user.

## Assumptions

- The five predefined users are static for this phase; no user creation,
  registration, or profile editing is in scope.
- The application MUST launch with pre-seeded sample threads and replies
  distributed across the five users, enabling immediate use without manual
  content creation. Seed data volume is a plan-level detail.
- The single attached image per thread is assumed to be a standard web-compatible
  format (JPEG, PNG, GIF, WebP); file size limits are a technical detail to
  be determined in the plan phase.
- "Real-time" updates (likes, reply counts) mean near-real-time within a few
  seconds; strict sub-second latency is not required for this phase.
- Replies are one level deep only — replies to replies are out of scope for
  this initial phase.
- The consolidated feed shows threads from all users, not just followed users,
  in this phase.
- Session persistence (e.g., surviving a page refresh) is out of scope; the
  user must re-select their identity after a reload.
- Mobile responsiveness is assumed to be a requirement given the web-based,
  cross-device target audience described in the README.
- Admin management features (banning users, removing any content) are out of
  scope for this phase.
