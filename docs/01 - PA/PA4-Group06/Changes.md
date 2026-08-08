# Changes Made for PA4

## 4A. Revised Use-Case Specification

Based on the TA feedback from PA3-2026, the following revisions were made to the Use-Case Specification document to provide more specific and concrete details, especially around alternative flows, and to ensure project-wide synchronization with the actual codebase:

1. **Reordered Sections for Clarity (All Use Cases):**
   - Moved the **Preconditions** section to appear immediately before the **Flow of Events**. This creates a logical flow where the prerequisites are clearly stated before describing the sequence of actions.

2. **Enhanced Alternative Flows (Project-Wide Synchronization):**
   - **UC-01 (Sign Up):** Added detailed alternative flows for `Password Too Long` (enforcing the strict 128 character max limit) and `Rate Limit Exceeded` (enforcing the 100 requests per 15 minutes limit).
   - **UC-02 (Log In):** Updated the rate limit specification in the alternative flow and special requirements from 10 attempts to the correctly implemented 100 attempts per 15 minutes.
   - **UC-04 (Manage Profile):** Added a concrete validation error alternative flow specifying exact database schema constraints (Display Name max 50 chars, Bio max 160 chars, Location max 100 chars, Website max 200 chars).
   - **UC-05 (Change Password):** Added alternative flow for when the new password identically matches the old password (Zod schema constraint).
   - **UC-06 (Change Avatar):** Synchronized the maximum file size limit with the actual codebase (updated from 5MB to 2MB).
   - **UC-09 (View Post Details):** Added alternative flow for 404 Post Not Found when querying a non-existent or deleted ID.
   - **UC-10 (Create Post):** Enhanced alternative flows to explicitly list system constraints (max 5,000 characters per post, maximum of 5 media attachments, and maximum of 10 posts in a chained thread).
   - **UC-12 (Leave Comment):** Added alternative flow handling POST_NOT_FOUND and PARENT_COMMENT_NOT_FOUND exceptions directly from the backend service layer.
   - **UC-14 (Request AI Summary):** Added alternative flows for `Rate Limit Exceeded` (10 requests/min), `Zero or Short Comment Thread` (fallback indicator for posts with 0 or minimal comments), and `AI Engine Failure` (graceful local fallback summary generation).
   - **UC-15 (Delete Own Post):** Added alternative flows for `User Cancels Deletion` and `Post Not Found or Forbidden` exception handling.
   - **UC-16 (Report Inappropriate Content):** Updated the reporting reasons to perfectly match the implemented codebase (`Harassment`, `Spam`, `Inappropriate`, `Other`). Added detailed alternative flows for `Content Already Reported by User` duplicate prevention and `Validation Error` for details exceeding the 1000 character limit.
   - **UC-17 (Review Reports):** Updated basic flow to cover querying `open` or `under_review` reports and explicit content deletion, linking extension point `UC-18`.
   - **UC-18 (Forward Report to Admin):** Added alternative flows for `Moderator Cancels Escalation` and `Report Not Found or Already Processed`.
   - **UC-19 (Delete Any Content):** Enhanced basic flow to specify mandatory administrative rationale and hard deletion in database (`posts`/`comments`), and added alternative flows for `Admin Cancels Deletion` and `Content Not Found or Already Deleted`.
   - **UC-20 (Permanently Remove User):** Refined basic flow for User Action Modal with mandatory administrative rationale requirement (min 5 characters) and database table purging, and added alternative flows for `Admin Cancels Deletion` and `Missing Rationale or Insufficient Rationale Length`.
   - **UC-21 (Assign Moderator Role):** Updated basic flow to specify User Action Modal role selection, recording entries in `audit_logs`, and added alternative flows for `Admin Cancels Role Assignment` and `Missing Rationale or Insufficient Rationale Length`.

   - **UC-01 (Sign Up - Additional Pass):** Integrated the 'Username' field into the basic flow to reflect actual database schema. Added alternative flows for 'Username Already Taken' and 'Sign Up with Google Account' (as Google OAuth is fully implemented in the backend routes).

   - **UC-02 (Log In - Additional Pass):** Added alternative flow for 'Sign In with Google Account' to align with the frontend and backend OAuth integrations.

   - **UC-06 (Change Avatar - Additional Pass):** Reverted the 'Wrong File Type' alternative flow back to 'File Too Large' because the browser's native file picker strictly prevents selecting non-image formats, making the 'Wrong File Type' flow impossible to test in the UI.

   - **UC-06 (Change Avatar - Correction):** Corrected the 'File Too Large' alternative flow to trigger at 25MB instead of 2MB, accurately reflecting the frontend client's raw upload limit before compression.
3. **Include more prototype requirements for detailed alternative flows in each use case**
   - **UC-01 (Sign Up):** 
     - Added the 'Username' field to the basic flow to accurately reflect the database schema.
     - Added alternative flow for `Password Too Long` (enforcing the strict 128 character max limit).
     - Added alternative flow for `Rate Limit Exceeded` (enforcing the 100 requests per 15 minutes limit implemented via `authRateLimiter`).
     - Added alternative flow for `Username Already Taken`.
     - Added alternative flow for `Sign Up with Google Account`.
     - Added alternative flow for `Google Sign Up Username Collision`, detailing the automatic generation of a unique username (by appending a numeric counter) when the base email prefix is already taken.
   
   - **UC-02 (Log In):** 
     - Updated the rate limit specification in the alternative flow and special requirements from 10 attempts to the correctly implemented 100 attempts per 15 minutes.
     - Added alternative flow for `Sign In with Google Account`.
     - Added alternative flow for `Log In with Non-Existent Google Account`, specifying that logging in with a non-existent Google account will not reject the user, but seamlessly auto-provision a new account and username on the fly.
   
   - **UC-04 (Manage Profile):** 
     - Added a concrete validation error alternative flow specifying exact database schema constraints (Display Name max 50 chars, Bio max 160 chars, Location max 100 chars, Website max 200 chars).
   
   - **UC-05 (Change Password):** 
     - Added alternative flow for when the new password identically matches the old password (Zod schema constraint).
   
   - **UC-06 (Change Avatar):** 
     - Synchronized the maximum file size limit with the actual codebase by setting the `File Too Large` alternative flow to trigger at 25MB, reflecting the frontend client's raw upload limit prior to heavy compression. (Removed the 'Wrong File Type' flow since native browser behavior prevents selecting invalid file types entirely).
   
   - **UC-09 (View Post Details):** 
     - Added alternative flow for 404 Post Not Found when querying a non-existent or deleted ID.
   
   - **UC-10 (Create Post):** 
     - Enhanced alternative flows to explicitly list system constraints (max 5,000 characters per post, maximum of 5 media attachments, and maximum of 10 posts in a chained thread).
   
   - **UC-12 (Leave Comment):** 
     - Added alternative flow handling `POST_NOT_FOUND` and `PARENT_COMMENT_NOT_FOUND` exceptions directly from the backend service layer.
   
   - **UC-14 (Request AI Summary):** 
     - Added an alternative flow for `Rate Limit Exceeded` when a user exceeds 10 summary requests within 1 minute.
   
   - **UC-15 (Delete Own Post):** 
     - Added alternative flow handling `POST_NOT_FOUND` or `POST_FORBIDDEN` exceptions.
   
   - **UC-16 (Report Inappropriate Content):** 
     - Updated the reporting reasons to perfectly match the implemented codebase (`Harassment`, `Spam`, `Inappropriate`, `Other`). 
     - Added a detailed validation error alternative flow for details exceeding the 1000 character limit.

3. **Expanded Prototype Requirements:**
   - To ensure a comprehensive mapping between documentation and the actual User Interface, we rigorously expanded the Prototype Requirements section for every single use case.
   - For every Alternative Flow added (such as Validation Errors, Rate Limits, Missing Permissions, or External OAuth logic), a dedicated placeholder screen was introduced into the prototype requirements list (e.g., `Alt Flow - Username Already Taken`, `Alt Flow - File Too Large`, `Alt Flow - Rate Limit Exceeded`). 
   - This explicitly mandates that the UI/UX design team must account for, and visually design, the specific error states, edge cases, and graceful degradation paths identified during the backend synchronization process.
