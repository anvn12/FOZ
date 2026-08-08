# Quickstart: Hashtag Feature Verification

## Developer Verification Steps

1. **Apply Migration**:
   ```bash
   npm run db:migrate
   ```

2. **Run Backend & Frontend**:
   ```bash
   ./start.sh
   ```

3. **Manual Flow Verification**:
   - Create a new post containing `#foz` and `#developer`.
   - Verify that `#foz` and `#developer` render as highlighted clickable links in the post feed item.
   - Click `#foz` and verify you navigate to `/hashtags/foz` displaying the newly created post.
   - Check the homepage sidebar "Trending Hashtags" widget and verify `#foz` appears with an accurate post count badge.

4. **Automated Testing**:
   ```bash
   npx vitest run src/backend/api/hashtags/__tests__/hashtags.test.ts
   ```
