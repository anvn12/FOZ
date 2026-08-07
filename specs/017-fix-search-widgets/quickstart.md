# Quickstart Guide: Search Discovery Widgets & Input Fixes

**Feature Branch**: `017-fix-search-widgets`

## Verification Instructions

### 1. Run Automated Integration & Component Tests

```bash
# Run backend search discovery integration tests
npx vitest run src/backend/api/search/__tests__/discovery.test.ts

# Run frontend search page component tests
npx vitest run src/frontend/src/pages/__tests__/SearchPage.test.tsx
```

### 2. Manual Verification Walkthrough

1. **Verify Search Submit Arrow Button Visibility**:
   - Navigate to `/search`.
   - Ensure search box is empty. Verify that the submit right arrow button is **not** displayed.
   - Type `"hello"` in the search input box. Verify that the submit right arrow button appears immediately.
   - Clear text using the close button. Verify that the submit right arrow button disappears.

2. **Verify Dynamic Discovery Widgets**:
   - On `/search` with empty query, observe **Trending Topics**, **Suggested Creators**, and **Trending Discussions**.
   - Confirm all content is dynamically fetched from backend API endpoints and displays real user profiles, tags, and discussion posts.
   - Click a **Trending Topic** chip. Verify that search executes for that topic tag.
   - Click a **Suggested Creator** card. Verify navigation to `/profiles/:userAccountId`.
   - Click a **Trending Discussion** item. Verify navigation to `/posts/:postId`.

3. **Verify "View all" Suggested Creators**:
   - Click **"View all"** next to the Suggested Creators header or on the trailing card.
   - Verify that all recommended creator profiles are retrieved and listed on the search page.
