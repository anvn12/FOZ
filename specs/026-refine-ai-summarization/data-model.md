# Data Model & Test Fixtures: Refine AI Summarization Test Suite

## Core Entities & DTOs

### 1. `PostSummary` (Database Entity & Response DTO)
Represents a generated TL;DR overview for a discussion post.

| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default UUID v4 | Unique identifier for the summary record |
| `postId` | `UUID` | Foreign Key (`posts.id`), Unique | The post this summary belongs to |
| `postSnapshot` | `Text` | Not Null | 1-2 sentence core overview of the post body |
| `keyHighlights` | `JSON / Text[]` | Not Null | Array of 2-4 bullet points summarizing top comments |
| `sentiment` | `Text` | Not Null | Overall discussion tone (e.g., "Supportive", "Neutral") |
| `commentCount` | `Integer` | Not Null, Default 0 | Number of comments sampled when generated |
| `createdAt` | `Timestamp` | Not Null, Default `now()` | Timestamp when first created |
| `updatedAt` | `Timestamp` | Not Null, Default `now()` | Timestamp when last refreshed |

### 2. `AISummarizerInput` & `AISummarizerOutput` (Service Contract)
```typescript
export interface AISummarizerInput {
  postContent: string;
  comments: Array<{ id: string; body: string }>;
}

export interface AISummarizerOutput {
  postSnapshot: string;
  keyHighlights: string[];
  sentiment: string;
}
```

### 3. Pure Sampling Input & Output Types
```typescript
export interface CommentCandidate {
  id: string;
  body: string;
  createdAt: string | Date;
}

export interface SampledComment {
  id: string;
  body: string;
}
```

---

## Test Data Fixtures

### 1. Fallback Fixtures (`ai-summarizer.test.ts`)
- **Empty comments input**:
  ```typescript
  { postContent: "A post with no comments.", comments: [] }
  ```
  Expected fallback:
  - `postSnapshot`: `"A post with no comments."`
  - `keyHighlights`: `["No community comments provided yet."]`
  - `sentiment`: `"Neutral"`
- **Long text truncation fixture**:
  - `postContent`: 200 characters string -> expects 150 chars + `"..."`
  - `comment.body`: 150 characters string -> expects 100 chars + `"..."`

### 2. Comment Sampling Synthetic Batch (`comment-sampling-dedup.test.ts`)
- **Overlapping engagement batch (15 comments)**:
  - `c1`, `c2`: High likes (10, 8) AND high replies (20, 15).
  - `c3`, `c4`: High likes (6, 5), zero replies.
  - `c5`, `c6`, `c7`: High replies (12, 10, 8), zero likes.
  - `c8` through `c15`: 0 likes, 0 replies, varied timestamps.
  - **Expected 10-comment result**:
    - Most liked (4 slots): `["c1", "c2", "c3", "c4"]`
    - Most replied (3 slots, skipping `c1` & `c2`): `["c5", "c6", "c7"]`
    - Most recent (3 slots): `["c8", "c9", "c10"]` (or latest 3 available)
    - Total unique IDs: `10`

### 3. Database Seed Fixtures (`post-summary-repository.test.ts`)
- Post `post-1` with 4 comment variations:
  1. `comment-active`: `visibilityState = 'public'`, `deletedAt = null` -> **Included**
  2. `comment-deleted`: `visibilityState = 'public'`, `deletedAt = now()` -> **Excluded**
  3. `comment-hidden`: `visibilityState = 'hidden'`, `deletedAt = null` -> **Excluded**
  4. `comment-deleted-and-hidden`: `visibilityState = 'hidden'`, `deletedAt = now()` -> **Excluded**
