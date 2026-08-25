## AI Summarization Test Suite Review & Refinement

Test Suite Folder: `src/backend/api/posts/__tests__/`

---

### 1. Review

#### Category 1: AI Summarizer & Fallback Service
*Files: `ai-summarizer.test.ts`, `post-summary-fallbacks.test.ts`*
- **TC1:** Normal case (1 post + 3 comments) - Generates summary properties (`postSnapshot`, `keyHighlights`, `sentiment`) using fallback logic.
- **TC2:** Empty comments case (`comments: []`) - Checks behavior when a post has no comments.
- **TC3:** Post with 0 comments - Generates fallback text for posts without comments. *(Duplicate of TC2)*
- **TC4:** Post with < 10 comments - Generates summary for short comment threads (e.g. 2 comments). *(Duplicate of TC1)*

#### Category 2: Comment Sampling & Deduplication Algorithm
*File: `comment-sampling-dedup.test.ts`*
- **TC5:** Comment Sampling Deduplication - Checks 4:3:3 sampling (4 most liked, 3 most replied, 3 most recent) without picking duplicates.

#### Category 3: API Routes & HTTP Endpoints
*File: `summary-routes.test.ts`*
- **TC6:** `GET /api/v1/posts/:postId/summary` - Returns 404 when the post does not exist.
- **TC7:** `POST /api/v1/posts/:postId/summary/refresh` - Returns 404 when refreshing summary for a non-existent post.

#### Category 4: Database Repository & Data Persistence
*File: `post-summary-repository.test.ts`*
- **TC8:** Function export check - Verifies `getSampledCommentsForSummary` is exported as a function.

---

#### Overall Quality Analysis
- **Duplication:**
	- TC1 and TC4 test the exact same logic on short threads (< 10 comments).
	- TC2 and TC3 test the exact same case (`comments: []`).
	=> Merge `post-summary-fallbacks.test.ts` into `ai-summarizer.test.ts` and remove redundant cases.

- **Ineffective Tests:**
	- **TC5:** The test writes its own copy of the sorting loop instead of calling the actual repository function. If production code breaks, this test still passes.
	- **TC8:** Only checks that the function exists (`typeof === 'function'`), leaving all real database queries, joins, and SQL filters untested (0% DB coverage).

- **Good Error Boundaries:**
	- **TC6 & TC7:** Properly verify that non-existent posts return HTTP 404 with structured error messages.

---

### 2. Refine

#### Category 1: AI Summarizer & Fallback Service
- **Fix Loose Assertions (TC2):** Verify exact fallback values (`postSnapshot` = original content, `keyHighlights` = `["No community comments provided yet."]`, `sentiment` = `"Neutral"`).

- **Improve Test Descriptions:**
	- Change *"generates a structured summary output from post content and comments"* -> **"Generates a structured summary for a standard post and comments"**
	- Change *"handles empty comments gracefully"* -> **"Returns default placeholder highlight and Neutral sentiment when comments list is empty"**

- **Add Missing Edge Cases:**
	1. *Fallback on API Failure / Provider Outage (503 / Timeout):* Automatically retries fallback models in the chain, then falls back to heuristic rule-based summary without showing a 500 error.
	2. *Malformed LLM JSON Response:* Safely catches JSON parsing errors on broken AI outputs and returns a readable fallback summary.
	3. *Text Truncation Limits:* Post body > 150 characters trims with `...`; comment body > 100 characters trims with `...`.
	4. *Posts with Image Attachments:* Post contains text plus images -> text is extracted cleanly for the summary while image attachments are safely bypassed.

#### Category 2: Comment Sampling & Deduplication Algorithm
- **Fix Flawed Test (TC5):** Import and test the actual production sampling function, asserting that the output contains exactly 10 distinct comment IDs matching the 4:3:3 priority.

- **Improve Test Descriptions:**
	- Change *"deduplicates comments across Most Liked, Most Replied, and Most Recent buckets"* -> **"Extracts 10 unique comments following the 4:3:3 priority ratio without duplicate items"**

- **Add Missing Edge Cases:**
	1. *Thread with 0 Engagement (0 Likes, 0 Replies):* Defaults smoothly to timestamp ordering (10 newest comments) without crashing.
	2. *Thread with Fewer Than 10 Comments:* Returns all available comments (e.g. 3 comments) without index errors.

#### Category 3: API Routes & HTTP Endpoints
- **Fix Loose Assertions (TC6, TC7):** Verify HTTP 404 status and full standard JSON error body: `{ error: { code: "NOT_FOUND", message: "Post not found" } }`.

- **Improve Test Descriptions:**
	- Change *"returns 404 for non-existent post summary request"* -> **"GET /posts/:postId/summary - Returns 404 NOT_FOUND when the post does not exist"**
	- Change *"returns 404 for non-existent post summary refresh request"* -> **"POST /posts/:postId/summary/refresh - Returns 404 NOT_FOUND and prevents regeneration when post does not exist"**

- **Add Missing Test Cases & Edge Cases:**
	1. *Happy Path (200 OK):* Fetch summary for an existing post with active comments -> returns HTTP 200 with summary data and `cached: false`.
	2. *Cache vs. Refresh Lifecycle:* First `GET` generates summary (`cached: false`); second `GET` returns cached record (`cached: true`); `POST /refresh` regenerates summary (`cached: false`) and updates timestamp.
	3. *Rate Limiting (429 Too Many Requests):* User makes more than 10 summary requests in 1 minute -> server blocks requests with HTTP 429.
	4. *Invalid Post ID Format (400 Bad Request):* Request summary with an invalid ID format (e.g. `/posts/invalid-id/summary`) -> returns HTTP 400 Bad Request.
	5. *Guest / Unauthenticated Access:* Guest user attempts to trigger summary requests -> handled according to guest authentication & rate limit rules.

#### Category 4: Database Repository & Data Persistence
- **Fix Trivial Smoke Test (TC8):** Replace `typeof === 'function'` with integration tests validating comment querying and ranking from the database.

- **Improve Test Descriptions:**
	- Change *"exports getSampledCommentsForSummary function"* -> **"getSampledCommentsForSummary - Queries active comments from DB, applies ranking, and returns up to 10 sampled comments"**

- **Add Missing Test Cases & Edge Cases:**
	1. *Filtering Hidden and Deleted Comments:* A post has normal comments, deleted comments (`deletedAt != null`), and hidden comments (`visibilityState = 'hidden'`) -> only public, active comments are selected.
	2. *Upsert Summary Flow (Insert vs. Update in DB):* Saving a new summary creates a new row; refreshing an existing summary updates the existing row in place with a new `updatedAt` timestamp.
