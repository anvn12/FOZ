# Post Creation Test Suite Review & Refinement

**Test Suite Folder:** `src/backend/__tests__/integration/`  
**Target File:** `post.test.ts`

---

## 1. Overall Quality Analysis

### Superficial Assertions — Lack of Database Verification

- The current tests act mostly as basic smoke tests, such as verifying `201 Created` and checking the response payload.
- They do not verify the actual database state after a successful API request.
- There are no direct Drizzle ORM queries, for example `db.select().from(posts)`, to guarantee that:
  - `content` is persisted correctly.
  - `parentId` is persisted correctly.
  - Attachments are correctly stored and associated with the post.

### Missing Controller Side-Effects — Hashtags

- The backend controller explicitly includes logic to parse and synchronize hashtags through `extractHashtagsAndSync`.
- The current test suite completely ignores this functionality.
- As a result, hashtag extraction and synchronization have effectively **0% test coverage**.

### Missing Core Interactive Feature — Reposting

- The application supports reposting through the dedicated endpoint:

  `POST /:postId/repost`

- This endpoint contains specific relational logic involving `repostOfId`.
- However, reposting is completely absent from the current test suite.

### Naive Media Attachment Handling

- The tests currently use dummy base64 strings such as:
  `data:image/jpeg;base64,abc`
- This is useful for bypassing schema validation, but it does not verify whether attachment records are actually inserted into the `post_attachments` table.
- The tests should verify both:
  - The attachment record exists.
  - The attachment correctly references the created post through its foreign key.

### Lack of Real-World Edge Cases — Sad Paths

The current suite focuses primarily on happy paths and basic validation errors, such as exceeding the 5000-character limit.

It misses important relational and cleanup scenarios, including:

- Creating a thread/reply with a deleted or non-existent parent post.
- Reposting a post that has already been deleted.
- Sending duplicate delete requests.
- Verifying that deleting a post also removes its associated attachments.

---

## 2. Refinement

### Category 1: Deep Database Assertions & Side-Effects

#### Verify DB Persistence

Update all relevant creation and deletion tests to include Drizzle ORM queries against:

- `posts`
- `postAttachments`

Verify that the database state matches the API response and expected behavior.

The tests should explicitly validate:

- Post content.
- `parentId`.
- `repostOfId`.
- Attachment records.
- Foreign-key relationships.

#### Test Hashtag Extraction

Add a test case containing hashtags in the post content, for example:

`Hello #world`

Verify that after post creation:

1. The post is successfully created.
2. The hashtag is extracted correctly.
3. The corresponding hashtag mapping records are created in the database.
4. The mapping points to the correct post.

---

### Category 2: Missing Core Features — Reposting & Chaining

#### Implement Repost Tests

Add a dedicated `describe` block for:

`POST /api/v1/posts/:postId/repost`

Verify that:

1. The original post exists.
2. The repost request succeeds.
3. A new post record is created.
4. The new post's `repostOfId` correctly references the original post.

#### Validate Thread DB State

For the **Create a Chained Thread** test, do not only verify the response array.

Query the database and verify that:

- The first post exists.
- The second post exists.
- The second post's `parentId` strictly equals the ID of the first post.

---

### Category 3: Relational Edge Cases & Cleanup — Sad Paths

#### 1. Ghost Threads / Missing Parent — `404/400`

**Scenario:**  
A user attempts to create a thread or reply where `parentId` points to a non-existent or deleted post.

**Expected:**

- The server rejects the request.
- No orphaned post is created.
- The database remains unchanged.

---

#### 2. Reposting a Deleted Post — `404 NOT FOUND`

**Scenario:**  
A user attempts to call:

`POST /:postId/repost`

for a target post that has already been deleted by its author.

**Expected:**

- The server validates that the target post no longer exists.
- The repost request is rejected with `404 NOT FOUND`.
- No repost record is created.

---

#### 3. Attachment Cleanup / Cascading Deletes

**Scenario:**  
A user creates a post containing media attachments and then deletes the post.

**Expected:**

- The delete request succeeds.
- The post is removed from the `posts` table.
- All associated records are removed from the `postAttachments` table.
- No orphaned attachment records remain.

---

#### 4. Idempotent Deletion — `404 NOT FOUND`

**Scenario:**  
A user sends two `DELETE` requests for the same post consecutively.

**Expected:**

- The first request succeeds with `200 OK`.
- The second request returns `404 NOT FOUND`.
- The second request must not crash or return a generic `500 Internal Server Error`.
- The database remains in a consistent state.
