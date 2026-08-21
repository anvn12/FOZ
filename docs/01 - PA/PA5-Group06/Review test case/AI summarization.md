## AI summarization review

Test case folder: `src\backend\api\posts\__tests__`

### Review
    - 1. Test a normal case (1 post + 3 comments)
    - 2. Test an empty case (post with no comments)
    - 3. Test post with 0 comments
    - 4. Test post with < 10 comments
    - 5. Test sampling comments into groups (4 most liked, 3 most replied, 3 most recent) without any duplicates
    - 6. Test when post not found
    - 7. Test the refresh summarization not work when the post is not found
    - 8. Test getSampledCommentsForSummary is a function or not

    - Test case duplicate: 1, 4 (Test a normal case (1 post + 3 comments) and test post with < 10 comments is the same, should remove one)
    - Test case duplicate: 2, 3 (post with 0 comments and empty post comments is the same, should remove one)
    - Test 6, 7 is good
    - Test 8 is redundant
    - Test 5: define its own filter function (not use from the actual logical code) -> BAD

    Missing: 
        - fallback mechanism
        Test Data: Post with 3 hidden comments.
        "Test Data: Extremely long post and 10 long comments
        Test Data: 429 Too Many Requests response.					
        Test Data: 503 Service Unavailable.					
        Test Data: Guest token / No token.					
        Test Data: Post with text and images.					

#### 1. Summary of Current Test Cases (8 Cases)
1. `ai-summarizer.test.ts`:
   - TC1: Normal case (1 post + 3 comments) -> checks output properties.
   - TC2: Empty comments case (`comments: []`).
2. `post-summary-fallbacks.test.ts`:
   - TC3: Post with 0 comments (Fallback text generation).
   - TC4: Post with < 10 comments (Short thread handling).
3. `comment-sampling-dedup.test.ts`:
   - TC5: 4:3:3 sampling distribution and comment deduplication.
4. `summary-routes.test.ts`:
   - TC6: `GET /api/v1/posts/:postId/summary` returns 404 when post not found.
   - TC7: `POST /api/v1/posts/:postId/summary/refresh` returns 404 when post not found.
5. `post-summary-repository.test.ts`:
   - TC8: Check `getSampledCommentsForSummary` is exported as a function.

#### 2. Test Quality & Critique
* **Duplicate Test Cases:**
  * TC1 & TC4: Both test the same fallback behavior for short threads (< 10 comments).
  * TC2 & TC3: Both test an empty comments array (`[]`) on `DefaultAISummarizerProvider`.
* **Tautological / Ineffective Test:**
  * TC5: Inlines its own copy of the sorting/deduplication algorithm inside the test file instead of testing the actual repository function in `post-summary.repository.ts`.
* **Redundant Test:**
  * TC8: Only verifies `typeof === 'function'`, leaving all database queries (aggregates, joins, and filters) completely untested.
* **Good Integration Tests:**
  * TC6 & TC7: Properly verify HTTP 404 error boundaries and standard error response format on missing posts.


### Refine

### Add
#### 3. Missing Critical Test Scenarios & Test Data
1. **Happy Path (200 OK):** Verify successful summary generation and retrieval on existing posts.
2. **Caching Behavior:** Verify subsequent `GET` requests return `cached: true`, while `POST .../refresh` updates the summary.
3. **Database Filtering:** Test post with soft-deleted (`deletedAt != null`) or hidden (`visibilityState != 'public'`) comments.
4. **Rate Limiting (429):** Test user exceeding 10 requests/minute.
5. **Provider Failure & Graceful Degradation (503 / Timeout):** Test fallback behavior when Google Gemini API fails.
6. **Authentication Boundary:** Test guest/unauthenticated user access (must reject or block AI calls per Constitution Principle VI).
7. **Boundary & Stress Data:**
   - Extremely long post body and comments (testing string truncation).
   - Posts containing image attachments.
