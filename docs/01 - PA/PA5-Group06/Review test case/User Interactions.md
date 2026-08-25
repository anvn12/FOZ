## User Interactions Test Suite Review & Refinement

Test Suite Folders: `src/backend/__tests__/integration/`, `src/frontend/src/components/__tests__/`, `src/frontend/src/pages/__tests__/`

---

### 1. Review

#### Category 1: Comments & Nested Replies API
*File: `src/backend/__tests__/integration/interaction.comments.test.ts`*
- **TC1:** Unauthenticated comment submission - Rejects unauthenticated comment submissions with HTTP 401.
- **TC2:** Top-level comment creation - Allows logged-in user to submit a top-level comment.
- **TC3:** Comment body validation - Rejects empty or whitespace-only comment body strings.
- **TC4:** Maximum body length enforcement - Enforces maximum comment body character length limit (max 2000 characters).
- **TC5:** Comment creation rate limiting - Enforces rate limiting on comment creation (e.g. 15 comments per minute threshold).
- **TC6:** Non-existent post comment check - Returns HTTP 404 error when submitting a comment on a non-existent post ID.
- **TC7:** Nested reply creation - Submits nested comment reply linked to a parent comment ID.
- **TC8:** Multi-tier nested reply - Allows multi-tier nested reply (replying to a nested reply).
- **TC9:** Mismatched post reply check - Rejects nested reply if parent comment ID belongs to a different post.
- **TC10:** Comment thread retrieval - Retrieves comments for a post with nested reply counts and author details.
- **TC11:** Comment editing - Allows comment author to edit their own comment text.
- **TC12:** Empty edit body check - Rejects edit if new comment body is empty or whitespace.
- **TC13:** Non-author edit block - Blocks non-author from editing someone else's comment (HTTP 403).
- **TC14:** Leaf comment deletion - Allows comment author to hard-delete a leaf comment with no child replies.
- **TC15:** Non-author deletion block - Blocks non-author from deleting someone else's comment (HTTP 403).
- **TC16:** Soft comment deletion - Soft-deletes parent comment with active child replies to preserve sub-thread structure.

#### Category 2: Post & Comment Reactions API
*File: `src/backend/__tests__/integration/interaction.likes.test.ts`*
- **TC17:** Unauthenticated post reaction check - Rejects unauthenticated post reaction requests with HTTP 401.
- **TC18:** Post reaction toggling - Toggles post like on (POST) and unlike off (DELETE).
- **TC19:** Multi-user post reaction aggregation - Aggregates concurrent post likes from multiple distinct users accurately.
- **TC20:** Comment reaction toggling - Allows user to like (POST) and unlike (DELETE) a comment.
- **TC21:** Multi-user comment reaction aggregation - Aggregates concurrent comment likes from multiple distinct users accurately.

#### Category 3: User Interactions UI Components
*Files: `src/frontend/src/components/__tests__/CommentEditor.test.tsx`, `src/frontend/src/components/__tests__/FeedPostItem.test.tsx`, `src/frontend/src/pages/__tests__/PostPage.test.tsx`*
- **TC22:** Comment editor UI - Renders comment input box and handles Enter/Shift+Enter key behaviors across desktop and mobile.
- **TC23:** Inline reply UI - Opens inline reply box when clicking "Reply" on a comment item.
- **TC24:** Comment sorting UI - Dynamically sorts comments by Top (most liked), Newest, and Oldest.
- **TC25:** Optimistic post reaction UI - Optimistically toggles heart icon and increments/decrements post like count on click.
- **TC26:** Optimistic comment reaction UI - Optimistically toggles heart icon and increments/decrements comment like count on click.
- **TC27:** Reaction button debouncing UI - Debounces rapid repeated clicks on post or comment reaction buttons to prevent UI race conditions.
- **TC28:** Edited comment badge UI - Displays `(edited)` badge next to timestamp on modified comments.
- **TC29:** Expandable text UI - Truncates long comment bodies (>300 chars) with "Show more" expand button.
- **TC30:** Guest intercept modal UI - Prompts guest users with login modal when attempting to comment, reply, or like.

---

#### Overall Quality Analysis
- **Duplication & Overlap:**
  - Comment validation for empty strings was duplicated across post creation and comment creation.
  => Consolidated under TC3.

- **Ineffective Tests & Placeholder Assertions:**
  - Previous placeholder tests refactored into real integration tests.

- **Good Error Boundaries & Coverage:**
  - Comment ownership checks (TC13, TC15) strictly enforce HTTP 403 Forbidden.
  - Multi-user concurrent reaction aggregation (TC19, TC21) ensures backend DB consistency under concurrent requests.

---

### 2. Refine

#### Category 1: Comments & Nested Replies API
- **Fix Loose Assertions (TC3, TC4):** Validate HTTP 422 Unprocessable Entity for empty body strings or body lengths > 2000 characters.
- **Improve Test Descriptions:**
  - Change *"adds comment"* -> **"TC2: Allows logged-in user to submit a top-level comment"**
  - Change *"rejects empty"* -> **"TC3: Rejects empty or whitespace-only comment body strings"**
- **Add Missing Edge Cases:**
  1. *Multi-Tier Nested Replies (TC8):* Level 3+ reply submission updates parent comment `replyCount` accurately.
  2. *Mismatched Post Reply Prevention (TC9):* Submitting a reply with a parent comment ID belonging to a different post returns HTTP 400/422.
  3. *Soft-Deletion of Parent Comments (TC16):* Deleting a parent comment with active child replies preserves sub-thread structure with `[Comment deleted]`.

#### Category 2: Post & Comment Reactions API
- **Fix Loose Assertions (TC18, TC20):** Assert `active: true` and count +1 on `POST`, and `active: false` and count -1 on `DELETE`.
- **Improve Test Descriptions:**
  - Change *"likes post"* -> **"TC18: Toggles post like on (POST) and unlike off (DELETE)"**
  - Change *"likes comment"* -> **"TC20: Allows user to like (POST) and unlike (DELETE) a comment"**
- **Add Missing Edge Cases:**
  1. *Concurrent Multi-User Aggregation (TC19, TC21):* Multiple concurrent likes aggregate accurately without race conditions.
  2. *Reaction Button Debouncing (TC27):* Rapid repeated clicks on reaction buttons are debounced smoothly on client UI.
