# Technical Research: Post Summarize (TL;DR)

## 1. Comment Sampling Strategy (4:3:3 Ratio Algorithm)

### Decision
Implement a SQL/Drizzle repository query function `getSampledCommentsForSummary(postId: string)` that retrieves up to 10 unique comments across three categories in sequence with deduplication:
1. **4 Most Liked**: Top 4 comments ranked by count of associated reactions (`target_type = 'comment'`).
2. **3 Most Replied**: Top 3 comments ranked by count of direct child replies (`parent_comment_id = comment.id`), excluding IDs selected in step 1.
3. **3 Most Recent**: Top 3 comments ordered by `created_at DESC`, excluding IDs selected in steps 1 & 2.

### Rationale
- Deduplication ensures every slot in the 10-comment payload offers distinct discussion content.
- For posts with fewer than 10 comments, all active comments (`visibility_state = 'visible' AND lifecycle_state = 'active'`) are included directly without ratio splitting.
- Excludes deleted or moderated comments (`lifecycle_state != 'active'`).

### Alternatives Considered
- *In-memory array filter*: Fetching all comments for a 1,000-comment post into Node.js memory and sorting in JavaScript. Rejected due to high memory usage and DB I/O overhead.
- *Single complex SQL query*: Complex `UNION ALL` or Window function. Selected individual indexed query steps or subqueries for clarity, testability, and SQL index efficiency.

---

## 2. AI LLM Service Isolation & Provider Abstraction

### Decision
Create a dedicated backend service module `src/backend/services/ai-summarizer.ts` implementing a provider interface:
```ts
export interface AISummarizerProvider {
  generateSummary(postContent: string, comments: Array<{ id: string; body: string }>): Promise<PostSummaryOutput>;
}
```
- Primary provider: Fetch-based HTTP call to Gemini/OpenAI REST API using environment-configured API keys.
- Structured output requirement: Enforce JSON response schema from LLM (or parse structured JSON markdown) containing `snapshot`, `highlights` (array of bullet points), and `sentiment`.

### Rationale
- Complies strictly with **FOZ Constitution Principle VI (AI Service Isolation)**.
- Provider remains completely decoupled from Express route handlers or DB repository logic.
- If API key is unconfigured or call fails, returns a clear service error to trigger UI fallback without crashing the post view.

### Alternatives Considered
- *Heavy SDKs (LangChain / LlamaIndex)*: Rejected per FOZ Constitution (keep dependencies minimal and standard Node fetch/REST calls).

---

## 3. Storage & Cache Persistence Strategy

### Decision
Create `post_summaries` table in PostgreSQL via Drizzle ORM (`src/backend/db/schema/interactions.ts`):
- `id` (uuid, primary key)
- `postId` (uuid, foreign key to `posts.id`, unique index)
- `postSnapshot` (text)
- `keyHighlights` (jsonb array of strings)
- `sentiment` (text)
- `commentCount` (integer - count of comments sampled)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Rationale
- Caching summaries in Postgres allows instant loading (< 300ms) on repeated post views.
- Per clarification Q1, re-summarization occurs only on explicit user request ("Refresh Summary" button), which updates `updatedAt` and overwrites the existing row for `postId`.
