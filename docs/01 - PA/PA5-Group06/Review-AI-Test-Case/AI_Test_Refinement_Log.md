# AI Test Refinement Log

## Manage Profile

### 1. AI Generation Prompt
**Prompt Used:**
> *Generate integration tests for the Profile Management API using Vitest. Ensure you test auth, max limits for bio, empty display name, website formatting, and avatar upload restrictions.*

**AI Tool Used:** *Codeium/Copilot (Assumed based on testing setup)*

### 2. Initial AI Output Summary & Assessment
- **What was good (Backend):** The AI provided a structurally sound testing foundation by accurately simulating the authenticated user lifecycle. It successfully implemented the happy-path updates for standard profile fields and properly validated HTTP 401 Unauthorized responses for unauthenticated requests. It also intelligently anticipated basic business rules, such as verifying the 160-character database limit for user biographies and ensuring proper protocol formatting (HTTP/HTTPS= for the website URL field). Most importantly, it included a cross-tenant security test verifying that User A cannot manipulate the profile of User B.
- **What was good (Frontend):** The initial tests successfully mapped out core happy paths (rendering correct items and initial user profile values).
- **Flaws & Missing Cases (Backend):** While the functional coverage was good, the AI's approach to edge cases and security was superficial. Instead of testing the exact boundary condition for the bio limit (160 vs 161), it relied on generic lengths. It failed to account for whitespace exploitation (e.g., submitting empty spaces for a display name). Furthermore, it completely omitted critical defensive programming scenarios: there were no protections against massive payload uploads for the avatar (which could easily lead to a Denial of Service attack via memory exhaustion), no tests to verify the sanitization of Stored XSS vectors (like script tags) in user-facing fields, and no pathway to test avatar deletion.
- **Flaws & Missing Cases (Frontend):** Ignored handling of null or empty states, missed network/error API fallback UI checks, missing form boundary and length limit validations. Missed avatar deletion logic altogether in the component and tests.
- **Explanation for the team:** The Profile Management test suite acts as the primary gatekeeper for user identity data. It guarantees that our API securely allows users to retrieve and update their personal info while rigidly enforcing data integrity. By running backend and frontend tests, we ensure that malicious actors cannot inject harmful scripts into their bios, bloat our database with oversized images, bypass validation by submitting invisible whitespace names, and we ensure our users get a clear interface whenever things deviate from the "happy path," avoiding silent UI failures or confusing generic crashes.

### 3. Human Refinement & Adjustments
| Test Case ID(s) / Area | Original AI Output | Refined / Human Adjustment | Reason for Change |
| :--- | :--- | :--- | :--- |
| `PATCH /api/v1/profiles/me` | Tested a generic `161` character string to verify the bio length maximum. | Restructured the test to perform a strict boundary analysis: validating that exactly `160` characters passes (HTTP 200), while exactly `161` characters fails (HTTP 422). | To rigidly enforce the database column length constraints and ensure edge-case reliability. |
| `PATCH /api/v1/profiles/me` | Checked for missing or completely empty (`""`) display names. | Added a new test scenario simulating a payload containing only whitespace characters (e.g., `"     "`). | To verify that the backend trims strings before validation, preventing invisible or blank display names from breaking the UI. |
| `PATCH /api/v1/profiles/me` | No security validation for HTML/JavaScript injection. | Introduced a test payload containing a standard Stored XSS vector (`<script>alert('xss')</script>`) to evaluate API response handling. | Critical security requirement. Prevents malicious scripts from being persisted and executed in the browsers of other users visiting the profile. |
| `POST /api/v1/profiles/me/avatar` | Checked basic Base64 string validation and mime-type blocking. | Created an artificially inflated 5MB Base64 payload and verified the server returns an HTTP 413 or 422 error. | Necessary to validate DoS (Denial of Service) protections. The backend must reject oversized payloads before they exhaust server memory. |
| `PATCH /api/v1/profiles/me` | Only tested uploading new avatars. | Added an explicit test scenario where the user submits `avatarUrl: null` to the PATCH route. | To guarantee that the application fully supports removing a profile picture and that the database accurately reflects a `null` state. |
| `ProfilePage` (Frontend) | Missing fallback display for 404/Error states and XSS testing. | Added missing checks for "Profile Not Found" 404 boundaries and `maliciousBio` assertions verifying dangerous `<script>` elements are sanitized as plain text. | To prevent silent UI failures and ensure dangerous elements are sanitized correctly in the UI. |
| `ProfileEditModal` (Frontend) | Missing avatar deletion logic and bio length bounds checks. | Introduced test cases to verify bio length bounds, and implemented the missing "Remove Avatar" UI button. | Ensures the UI correctly maps to the backend's avatar deletion capability and restricts overly long bios. |

---

## Search Content

### 1. AI Generation Prompt
**Prompt Used:**
> *Write integration tests for the Search and Discovery API endpoint. It needs to test searching for posts, users, and hashtags, filtering by active status, and testing the 500ms performance NFR.*

**AI Tool Used:** *Codeium/Copilot (Assumed based on testing setup)*

### 2. Initial AI Output Summary & Assessment
- **What was good:** The AI built an incredibly thorough and modular test suite for the various search query parameters (`type=posts`, `hashtags`, `users`, `all`). It expertly handled the complex relational data setup required for searching, and it correctly simulated the system's privacy filter. By creating multiple mock accounts and posts with different lifecycle statuses (e.g., suspended users, hidden posts, removed posts), it successfully proved that the search engine adheres to privacy and moderation rules. Frontend tests successfully mapped out core happy paths (rendering correct items in search).
- **Flaws & Missing Cases:** Despite the strong functional coverage, the AI completely omitted cursor-based pagination tests, which are absolutely critical for rendering the Discovery feed without crashing the client. It also lacked essential security resilience tests, meaning there was no proof that the search input was safe from SQL injection or unexpected special character parsing errors. Finally, its non-functional performance test was superficial—high-level artificial data insertion of a mere 20 posts instead of simulating a heavier data load to truly test the 500ms response time ceiling. The frontend tests ignored handling of null or empty states.
- **Explanation for the team:** The Search & Discovery test suite is our primary defense against data leaks. It verifies that the search engine can find partial text matches for content while acting as an iron-clad privacy filter. If a post is deleted, hidden, or authored by a banned user, these tests definitively prove that the search engine hides them from the public. Furthermore, the refined tests ensure the search bar cannot be weaponized via SQL injection or pagination overload, and the frontend properly handles empty UI states.

### 3. Human Refinement & Adjustments
| Test Case ID(s) / Area | Original AI Output | Refined / Human Adjustment | Reason for Change |
| :--- | :--- | :--- | :--- |
| Security / SQLi (`GET /api/v1/search`) | No security queries or malformed string tests were generated. | Added a robust loop of malicious injection strings (e.g., `' OR 1=1; --`, `%; DROP TABLE`, and unescaped quote marks `"`). | To guarantee that all user search input is safely parameterized by the ORM/database, preventing SQL injection vulnerabilities or unhandled 500 server crashes. |
| Pagination (`type=posts`) | Only tested querying 1 or 2 matching posts, ignoring cursor functionality. | Seeded the test database with 25 identical matching posts, validated that the response array was capped at the default limit (20), and tested that the `nextCursor` successfully retrieved the remaining 5 posts. | Essential for frontend stability. Ensuring pagination works correctly prevents massive database payloads from crashing the user's browser or exhausting server bandwidth. |
| `SearchPage` (Frontend) | No empty state handling; limit set to 500 characters incorrectly. | Added tests checking for the "No results found" display on empty results, and verified the 100-character constraint logic on local frontend queries. | Prevents confusing generic crashes and mirrors backend constraints to prevent generic API 400 errors. |

---

## Discovered Application Bugs & Fixes
While running the refined test suites (backend and frontend), several critical vulnerabilities and bugs were discovered in the application codebase. These were promptly fixed to ensure the tests pass:

1. **Profile XSS Vulnerability:** The `bio` field in the Profile API did not sanitize HTML tags, allowing Stored XSS attacks. Fixed by adding a Zod validation rule (`!/[<>]/.test(val)`) to the `UpdateProfileRequest` schema.
2. **Avatar Deletion Bug:** The application ignored attempts to delete a profile picture (`avatarUrl: null`) because the field was missing from the `UpdateProfileRequest` schema. Added `avatarUrl: z.string().url().nullable().optional()` to explicitly allow nullable avatar updates.
3. **Missing Search Pagination:** The Search API (`GET /search`) had hardcoded `nextCursor: null` and lacked offset implementation. Fixed by adding a `cursor` property to `SearchQuerySchema` and implementing SQL `.offset()` pagination logic.
4. **Missing Avatar Deletion (Frontend):** Users were unable to remove an existing avatar once uploaded. **Fix:** Added a `Remove Avatar` conditional button to `ProfileEditModal.tsx` and tied it to a state handler passing `avatarUrl: null` into the mutation profile update hook to align with the backend database fix.
5. **Search Character Limit Discrepancy:** The frontend locally restricted search queries to 500 characters while the backend enforced a maximum of 100 characters. **Fix:** Adjusted local query guards in `SearchPage.tsx` and their corresponding tests to strictly limit at 100 characters, mirroring backend constraints to prevent generic API 400 errors.
