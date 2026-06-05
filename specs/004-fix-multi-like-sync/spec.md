# Feature Specification: Fix Multi-Like Persistence and Count Revert

**Feature Branch**: `004-fix-multi-like-sync`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "The liking system is still buggy, after liking a thread/comment, if you like any other threads/comments, it will only briefly show the post is liked and then the number goes down instantly. If you click refresh all the likes will be gone except for the original like."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multiple Likes Persist in One Session (Priority: P1)

A signed-in user can like many different threads and comments in the same session. Every like remains active after each subsequent like action, and all liked items stay liked after a manual feed refresh.

**Why this priority**: Users naturally like more than one item while browsing. Only the first like persisting makes the feature effectively broken for normal use.

**Independent Test**: Sign in, like thread A, then like threads B and C and two replies. Refresh the feed. All five items must still show as liked by the current user.

**Acceptance Scenarios**:

1. **Given** a user who has liked one thread, **When** the user likes a second thread, **Then** both threads show as liked and remain liked without reverting.
2. **Given** a user who has liked several threads, **When** the user likes a comment on any thread, **Then** the comment stays liked along with all previously liked threads.
3. **Given** a user who liked five or more items in one session, **When** the user refreshes the feed, **Then** all five items still show as liked for that user.
4. **Given** a user who liked multiple items, **When** the user signs out and signs back in as the same user, **Then** all previously liked items still show as liked.

---

### User Story 2 - Stable Like Count After Each Action (Priority: P1)

When a user likes or unlikes any item, the displayed like count updates once to the correct value and does not immediately drop or flicker back to a lower number.

**Why this priority**: The brief “liked then count drops” behavior signals failure even when the heart state might still look correct, and erodes trust in engagement feedback.

**Independent Test**: Note counts on three unliked threads. Like each in sequence. After each click, the count must increase by one and stay at that value for at least several seconds without dropping until the user unlikes or another user’s action legitimately changes the aggregate count.

**Acceptance Scenarios**:

1. **Given** a thread with like count N not liked by the user, **When** the user likes it after already liking another thread, **Then** the count shows N+1 and does not revert to N without an unlike action.
2. **Given** a user who just liked an item, **When** no further interaction occurs for 5 seconds, **Then** the like count and liked indicator remain stable.
3. **Given** a reply with like count M, **When** the user likes it after liking threads, **Then** the reply count shows M+1 and stays there.
4. **Given** a successful like on any item, **When** the user refreshes, **Then** the count matches the number of persisted likes on that item from all users.

---

### Edge Cases

- What happens when the user likes multiple items quickly in succession? Each like must register independently without undoing prior likes.
- What happens when the same user receives a live count update from another session or user while liking multiple items? Only the affected item’s aggregate count may change; other items’ liked state for the current user must not reset.
- What happens when a like request fails for one item? Only that item reverts; other already-liked items remain liked with correct counts.
- What happens when the user unlikes one of several liked items? Only that item’s count decreases and heart clears; other likes remain unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a single user to like multiple distinct threads and comments within one session without losing earlier likes.
- **FR-002**: Each successful like MUST remain recorded for that user until explicitly unliked or the session user changes.
- **FR-003**: After liking item B, item A (previously liked) MUST still show as liked with an accurate count.
- **FR-004**: The displayed like count for an item MUST NOT decrease immediately after a successful like on that same item or on a different item.
- **FR-005**: A manual feed refresh MUST show all likes the current user made in the session, not only the first one.
- **FR-006**: Unlike actions MUST only affect the targeted thread or comment, not other liked items.
- **FR-007**: Liked state and counts after refresh MUST match the persisted state for the signed-in user across all items they liked.

### Key Entities

- **Like**: One per user per thread or comment; many likes per user across different targets must coexist.
- **Like count**: Aggregate total per thread or comment; must reflect all users’ likes including multiple likes from the same user on different targets.
- **Liked indicator**: Per-user boolean on each item; must not be cleared on unrelated like actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can like 10 threads and 10 comments in one session; after refresh, 100% still show as liked for that user.
- **SC-002**: In a 10-item sequential like test, 0 items exhibit an immediate count drop within 5 seconds of a successful like.
- **SC-003**: After refresh, the number of items showing as liked by the user equals the number of distinct like actions performed in the session (minus any explicit unlikes).
- **SC-004**: Unlike on one of five liked items leaves the other four liked with unchanged counts (except legitimate aggregate updates).
- **SC-005**: Re-sign-in as the same user preserves 100% of likes from the prior session test set.

## Assumptions

- The bug is reproducible on the current build after prior like-related fixes (002, 003).
- Server-side per-user like records are intended to support unlimited distinct targets per user; the defect is in persistence and/or display sync, not a product rule limiting one like per session.
- “Refresh” means the in-app feed refresh control or full page reload — both must show consistent results.
- Real-time count updates from other users may still change aggregate counts on items the current user did not just interact with; that is expected and not a failure.
- Mobile and desktop share the same like behavior; no separate mobile scope.
