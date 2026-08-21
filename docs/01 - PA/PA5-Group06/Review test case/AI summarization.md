## AI Summarization Test Suite Review & Refinement

Test Suite Folder: `src/backend/api/posts/__tests__/`

---

### 1. Review (Current Test Cases & Analysis)

#### Summary of Current Test Cases (8 Test Cases in 5 Files)
1. `ai-summarizer.test.ts`
	- TC1: Normal case (1 post + 3 comments) - Generates summary properties (`postSnapshot`, `keyHighlights`, `sentiment`) using fallback logic.
	- TC2: Empty comments case (`comments: []`) - Checks behavior when a post has no comments.
2. `post-summary-fallbacks.test.ts`
	- TC3: Post with 0 comments - Generates fallback text for posts without comments. *(Duplicate of TC2)*
	- TC4: Post with < 10 comments - Generates summary for short comment threads (e.g. 2 comments). *(Duplicate of TC1)*
3. `comment-sampling-dedup.test.ts`
	- TC5: Comment Sampling Deduplication - Checks 4:3:3 sampling (4 most liked, 3 most replied, 3 most recent) without picking duplicates.
4. `summary-routes.test.ts`
	- TC6: `GET /api/v1/posts/:postId/summary` - Returns 404 when the post does not exist.
	- TC7: `POST /api/v1/posts/:postId/summary/refresh` - Returns 404 when refreshing summary for a non-existent post.
5. `post-summary-repository.test.ts`
	- TC8: Function export check - Verifies `getSampledCommentsForSummary` is exported as a function.

#### Analysis
- Duplicate Tests (TC1/TC4 & TC2/TC3):
	- TC1 and TC4 test the exact same logic on short threads (< 10 comments).
	- TC2 and TC3 test the exact same case (`comments: []`).
	=> Merge `post-summary-fallbacks.test.ts` into `ai-summarizer.test.ts` and remove the redundant cases.

- Flawed / Ineffective Tests (TC5 & TC8):
	- TC5 (`comment-sampling-dedup.test.ts`): The test writes its own copy of the sorting loop instead of calling the actual repository function. If the real production code has bugs, this test will still pass.
	- TC8 (`post-summary-repository.test.ts`): Only checks that the function exists (`typeof === 'function'`), leaving all real database queries, joins, and SQL filters untested as DB is where AI gets data (0% DB coverage).

- Good Error Boundaries (TC6 & TC7):
	- Properly verify that non-existent posts return HTTP 404 with structured error messages.

---

### 2. Refine (Improving Existing Test Cases)

#### A. Fix Weak / Loose Expected Results

1. **Empty Comments Output (`ai-summarizer.test.ts`):**
	- *Issue:* Currently only checks if properties exist, which passes even if they return empty strings or null.
	- *Fix:* Verify exact expected values:
		- `postSnapshot` = original post content.
		- `keyHighlights` = `["No community comments provided yet."]`.
		- `sentiment` = `"Neutral"`.

2. **API 404 Error Envelope (`summary-routes.test.ts`):**
	- *Issue:* Only checks the error code string without validating the whole response.
	- *Fix:* Verify HTTP 404 status and full JSON error body: `{ error: { code: "NOT_FOUND", message: "Post not found" } }`.

3. **Sampling Algorithm Test (`comment-sampling-dedup.test.ts`):**
	- *Issue:* Duplicates loop logic in the test file.
	- *Fix:* Import and test the actual production sampling function, asserting that the output contains exactly 10 distinct comment IDs matching the 4:3:3 priority.

#### B. Add Missing Edge Cases

1. **Fallback Mechanism on API Failure / Missing Key (`ai-summarizer.test.ts`):**
	- *Scenario:* External LLM API key is not provided, or all remote Gemini provider calls fail (503 / timeout).
	- *Expected:* Automatically triggers the rule-based fallback generator (`generateFallbackSummary`) to return valid summary data without throwing runtime exceptions.

2. **Text Truncation Limits:**
	- *Post Body > 150 characters:* Snapshot must be trimmed to 150 characters with trailing `...`.
	- *Comment Body > 100 characters:* Highlights must be trimmed to 100 characters with trailing `...`.

3. **Thread with 0 Engagement (0 Likes, 0 Replies):**
	- *Scenario:* All 15 comments have 0 likes and 0 replies.
	- *Expected:* Defaults smoothly to timestamp ordering (10 newest comments) without crashing.

4. **Thread with Fewer Than 10 Comments:**
	- *Scenario:* Post only has 3 comments total.
	- *Expected:* Returns all 3 comments without throwing index errors.

#### C. Improve Test Descriptions
Make test names describe the real user/system behavior:
- `ai-summarizer.test.ts`:
	- Change: *"generates a structured summary output from post content and comments"*
	- To: **"Generates a structured summary for a standard post and comments"**

	- Change: *"handles empty comments gracefully"*
	- To: **"Returns default placeholder highlight and Neutral sentiment when comments list is empty"**

- `comment-sampling-dedup.test.ts`:
	- Change: *"deduplicates comments across Most Liked, Most Replied, and Most Recent buckets"*
	- To: **"Extracts 10 unique comments following the 4:3:3 priority ratio without duplicate items"**

- `summary-routes.test.ts`:
	- Change: *"returns 404 for non-existent post summary request"*
	- To: **"GET /posts/:postId/summary - Returns 404 NOT_FOUND when the post does not exist"**

	- Change: *"returns 404 for non-existent post summary refresh request"*
	- To: **"POST /posts/:postId/summary/refresh - Returns 404 NOT_FOUND and prevents regeneration when post does not exist"**

- `post-summary-repository.test.ts`:
	- Change: *"exports getSampledCommentsForSummary function"*
	- To: **"getSampledCommentsForSummary - Queries active comments from DB, applies ranking, and returns up to 10 sampled comments"**

---

### 3. Add (New Test Cases for Uncovered Features)

#### A. API Endpoints & Routes (`summary-routes.test.ts`)

1. **Happy Path (200 OK):**
	- *Scenario:* Fetch summary for an existing post with active comments.
	- *Expected:* Returns HTTP 200 with summary data and `cached: false`.

2. **Cache vs. Refresh Lifecycle:**
	- *Scenario:* First `GET` generates summary (`cached: false`); second `GET` returns cached record (`cached: true`); `POST /refresh` regenerates summary (`cached: false`) and updates the timestamp.

3. **Rate Limiting (429 Too Many Requests):**
	- *Scenario:* User makes more than 10 summary requests in 1 minute.
	- *Expected:* Server blocks requests with HTTP 429.

4. **Invalid Post ID Format (400 Bad Request):**
	- *Scenario:* Request summary with an invalid ID format (e.g. `/posts/invalid-id/summary`).
	- *Expected:* Returns HTTP 400 Bad Request.

5. **Guest / Unauthenticated Access:**
	- *Scenario:* Guest user attempts to trigger summary requests.
	- *Expected:* Request is handled for authentication rules.

#### B. AI Provider Failover & Resilience (`ai-summarizer.test.ts`)

6. **Provider Outage / Timeout Failover:**
	- *Scenario:* Primary Google Gemini API endpoint times out or returns 503.
	- *Expected:* Automatically retries fallback models in the chain, then falls back to heuristic summary without showing a 500 error to the user.

7. **Malformed LLM JSON Response:**
	- *Scenario:* AI model returns broken text or invalid JSON.
	- *Expected:* Safely catches parse errors and returns a readable fallback summary.

#### C. Database Queries & Filtering (`post-summary.repository.test.ts`)

8. **Filtering Hidden and Deleted Comments:**
	- *Scenario:* A post has normal comments, deleted comments (`deletedAt != null`), and hidden comments (`visibilityState = 'hidden'`).
	- *Expected:* Only public, active comments are selected; deleted and hidden comments are completely ignored.

9. **Upsert Summary (Insert vs. Update):**
	- *Scenario:* Saving a new summary creates a new row; refreshing an existing summary updates the existing row in place with a new `updatedAt` timestamp.

10. **Posts with Image Attachments:**
	- *Scenario:* Post contains text plus images.
	- *Expected:* Text is extracted cleanly for the summary without crashing on image attachments.
