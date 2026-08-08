# Quickstart Guide: Post Summarize (TL;DR)

## Overview
This feature provides on-demand TL;DR AI summaries of discussion posts and key community comments using a balanced 4:3:3 comment sampling strategy (4 Most Liked, 3 Most Replied, 3 Most Recent).

## Key Components

1. **Shared Schema**: `src/shared/schemas/post-summary.ts`
2. **Database Schema**: `src/backend/db/schema/interactions.ts` (`post_summaries` table)
3. **Repository**: `src/backend/db/repositories/post-summary.repository.ts`
4. **AI Service**: `src/backend/services/ai-summarizer.ts`
5. **API Routes**: `src/backend/api/posts/summary.routes.ts` (mounted under `/api/v1/posts`)
6. **Frontend Component**: `src/frontend/components/PostSummaryCard.tsx`

---

## AI API Key Setup

To enable live LLM AI summarization:
1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) (or an OpenAI API key).
2. Open `.env` at the repository root.
3. Set your key:
   ```env
   AI_API_KEY=AIzaSy...
   ```
4. If `AI_API_KEY` is not set, the application automatically uses an offline/fallback summarizer so post summarization remains fully functional for local development.

---


## Verifying & Testing

### 1. Run Backend Tests
```bash
npm run test -- src/backend/__tests__/post-summary.test.ts
```

### 2. Manual API Verification (cURL)
Fetch or generate summary:
```bash
curl -X GET http://localhost:3000/api/v1/posts/<POST_ID>/summary
```

Force refresh summary:
```bash
curl -X POST http://localhost:3000/api/v1/posts/<POST_ID>/summary/refresh
```

### 3. Frontend Verification
1. Navigate to any post page with multiple comments.
2. Click **"Generate TL;DR"**.
3. Verify that:
   - A snapshot of the post, bulleted discussion highlights, and community sentiment appear.
   - Re-visiting the page loads the cached summary instantly.
   - Clicking **"Refresh Summary"** updates the summary with new comments.
