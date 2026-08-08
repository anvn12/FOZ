# Changes Made for PA4

## 4A. Revised Use-Case Specification


1. **Per-Use-Case Content Changes:**

   - **UC-01 (Sign Up):**
     - Added the `username` field to the basic flow to reflect the actual database schema.
     - Added alternative flows: `Password Too Long` (128-char max), `Rate Limit Exceeded` (100 requests / 15 min), `Confirm Password Does Not Match`, `Username Already Taken`, `Sign Up with Google Account`, and `Google Sign Up Username Collision` (auto-appends a numeric counter when the base username is taken).
     - Prototype requirements expanded from 2 to 9 screens (3 screens for the username-collision flow).

   - **UC-02 (Log In):**
     - Rate limit corrected from 10 to **100 attempts per 15 minutes** in the alternative flow and special requirements.
     - Added alternative flows: `Rate Limit Exceeded`, `Sign In with Google Account`, and `Log In with Non-Existent Google Account` (auto-provisions a new account on the fly instead of rejecting).
     - Prototype requirements expanded from 2 to 6 screens.

   - **UC-03 (Log Out):**
     - Added alternative flow `User Cancels Log Out`.
     - Prototype requirements expanded from 1 to 2 screens.

   - **UC-04 (Manage Profile):**
     - Added alternative flows: `Validation Errors` (exact schema limits: Display Name 50, Bio 160, Location 100, Website 200 chars) and `User Cancels`.
     - Prototype requirements expanded from 1 to 3 screens.

   - **UC-05 (Change Password):**
     - Added alternative flows: `New Password Matches Old Password` (Zod constraint), `Confirm Password Does Not Match`, `Weak New Password`, and `User Cancels`.
     - Prototype requirements expanded from 1 to 5 screens.

   - **UC-06 (Change Avatar):**
     - `File Too Large` limit synchronized with the codebase: **25MB raw upload limit** (client-side, before compression), replacing the old 5MB limit; special requirements updated accordingly.
     - Added alternative flows: `User Cancels` and `Wrong File Type`.
     - Prototype requirements expanded from 1 to 3 screens.

   - **UC-07 (Browse Feed):**
     - Basic flow corrected to match the implemented feed endpoints: the homepage presents "For You" (default) and "Latest" feed tabs; the system queries `posts` with `visibility_state = 'public'` and `deleted_at IS NULL`, unwrapping reposts to show the original content.
     - Sorting is now mode-specific: **For You** ranks posts by viewer affinity, engagement, and recency (guests and viewers without interaction history receive a popularity-ranked feed), while **Latest** sorts by posting time with the newest first.
     - Pagination clarified as cursor-based (scroll-to-load-more).
     - Added alternative flow `Switch feed mode` (Latest ↔ For You).
     - Prototype requirements expanded from 1 to 3 screens.

   - **UC-08 (Search Content):**
     - Reworked alternative flows: `Search feature unavailable` (search button hidden until a valid query is entered) and `No matching results` ("No results for search query.").
     - Performance requirement updated to 2–3 seconds under good network conditions.
     - Prototype requirements expanded from 1 to 3 screens.

   - **UC-09 (View Post Details):**
     - Added alternative flows: `No comments` and `Post Not Found` (404 for non-existent or `removed_by_moderation` posts), replacing the previous `Post Removed or Hidden` flow.
     - Prototype requirements expanded from 1 to 2 screens.

   - **UC-10 (Create Post):**
     - Added alternative flows: `Post creation canceled`, updated `Content Validation Error` (submit button disabled on empty body), and `Exceeds Limits` (5,000 chars / 5 media attachments / 10 chained thread posts).
     - Prototype requirements expanded from 1 to 3 screens.

   - **UC-11 (Interact with Post):**
     - Added alternative flows making the extension points explicit: `Reply` → UC-12, `Like` → UC-13, `Report` → UC-16.

   - **UC-12 (Leave Comment):**
     - `Empty Comment` flow updated to include whitespace-only input.
     - Added alternative flows: `Comment Exceeds Maximum Length` (5,000-char limit) and `Long Comment Display` (truncation with "Read more" toggle).
     - Prototype requirements expanded from 1 to 3 screens.

   - **UC-13 (Like/Unlike):**
     - Added alternative flow `Target Post or Comment Deleted / Not Found` (reverts optimistic UI on failure).
     - Special requirements detailed: UI response < 50ms (optimistic), API sync ≤ 500ms.
     - Prototype requirements expanded from 1 to 2 screens.

   - **UC-14 (Request AI Summary):**
     - Actor restricted to **Standard User** (AI requests require authentication; guests removed).
     - Basic flow reworked: verifies post accessibility and per-user rate limit; samples up to 10 comments using a deduplicated 4:3:3 ratio (4 most liked, 3 most replied-to, 3 most recent); sends a sanitized payload through a provider fallback chain; validates the AI response before display.
     - Added alternative flows: `Post Not Found or No Longer Accessible`, `AI Provider Error` (fallback provider attempt), `Invalid AI Response`, and `Rate Limit Exceeded` (10 requests / min per user).
     - Special requirements added: authentication, rate limit, payload sanitization; persistent caching is out of scope for v1.

   - **UC-15 (Delete Own Post):**
     - Clarified as a **soft delete**: `lifecycle_state` set to `hidden` atomically; post removed from feeds and search results while the record is retained.
     - Added alternative flows: `Post Not Found or Forbidden` and `Update Failure`; expanded `User Cancels Deletion` (Cancel, close dialog, or Escape).
     - Added special requirements: ownership check at API boundary, visibility rules, data retention.

   - **UC-16 (Report Inappropriate Content):**
     - Reporting reasons synchronized with the codebase: `Harassment`, `Spam`, `Inappropriate`, `Other`; `Other` requires details; details limited to 1,000 chars.
     - Added alternative flows: `User Cancels Report`, `Validation Error`, `Content Already Reported by User` (unique open report per reporter/target), `Content Not Found or No Longer Reportable`, `Reporting Rate Limit Exceeded` (10 reports / 15 min), and `Report Submission Failure`.

   - **UC-17 (Review Reports):**
     - Reworked basic flow: role-based queues (Moderators: `open`/`under_review`; Administrators: `escalated`), atomic report claiming, mandatory decision rationale of at least 5 words, dismiss/escalate actions, and Administrator invocation of UC-19.
     - Added alternative flows: `No Reports Available`, `Actor Leaves Without a Decision`, `Report Not Found or Already Processed`, `Reported Content No Longer Exists`, `Unauthorized Action`, and `Missing or Insufficient Decision Rationale`.
     - Added special requirements: separation of powers (Moderators must not permanently remove content or punish users), concurrency, decision rationale, and audit logging.

   - **UC-18 (Forward Report to Admin):**
     - Escalation now requires a rationale of at least 5 words; status change, moderation review, and audit entry are written in one transaction.
     - Added alternative flows: `Moderator Cancels Escalation`, `Missing or Insufficient Escalation Rationale`, `Report Not Found`, `Report Already Processed`, and `Escalation Update Failure`.

   - **UC-19 (Delete Any Content):**
     - Changed from a lifecycle-state update to a **permanent hard delete** in one transaction (target + dependent comments/replies, reactions, attachments; related report closed; `audit_logs` entry), requiring an administrative rationale of at least 5 words.
     - Added alternative flows: `Administrator Cancels Deletion`, `Missing or Insufficient Rationale`, `Content Not Found or Already Deleted`, `Target Not Eligible for Force Deletion`, and `Deletion Transaction Fails`.

   - **UC-20 (Permanently Remove User):**
     - Scope changed from "ban user" to **permanent account removal**: User Management page → User Action Modal with a mandatory rationale of at least 5 words; one transaction revokes all `refresh_sessions`, purges profile, submitted reports, posts, comments, reactions, and attachments, deletes the `user_accounts` record, and writes a `USER_DELETE` audit entry.
     - Added alternative flows: `Administrator Cancels Deletion`, `Missing or Insufficient Rationale`, `Target Not Found or Already Removed`, `Target No Longer Eligible` (administrators and protected accounts excluded), and `Data-Wipe Transaction Fails`.

   - **UC-21 (Assign Moderator Role):**
     - Basic flow reworked: User Management page → "Assign Moderator" → User Action Modal with role selection and a rationale of at least 5 words; role change and audit entry (`previous_role`/`new_role`) committed atomically.
     - Added alternative flows: `Administrator Cancels Role Assignment`, `Missing or Insufficient Rationale`, `Target Not Found or Not Eligible`, `Concurrent Role Update`, and `Role Update or Audit Failure`.

3. **Expanded Prototype Requirements:**
   - Every use case now includes dedicated prototype screens for each new alternative flow (validation errors, rate limits, OAuth flows, cancellations, and failure paths), so the UI/UX design team must account for all error states and edge cases identified during the revision.
