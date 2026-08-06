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
   - **UC-14 (Request AI Summary):** Added an alternative flow for `Rate Limit Exceeded` when a user exceeds 10 summary requests within 1 minute.
   - **UC-15 (Delete Own Post):** Added alternative flow handling POST_NOT_FOUND or POST_FORBIDDEN exceptions.
   - **UC-16 (Report Inappropriate Content):** Updated the reporting reasons to perfectly match the implemented codebase (`Harassment`, `Spam`, `Inappropriate`, `Other`). Added a detailed validation error alternative flow for details exceeding the 1000 character limit.
