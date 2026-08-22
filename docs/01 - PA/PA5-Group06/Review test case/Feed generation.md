## Feed Generation Test Suite Review & Refinement

Test Suite Folders: `src/backend/__tests__/unit/feed-ranking.test.ts`, `src/backend/__tests__/integration/feed.test.ts`, `src/frontend/src/pages/__tests__/HomePage.test.tsx`

---

### 1. Review

#### Category 1: Ranking Algorithm (pure functions)
*File: `src/backend/__tests__/unit/feed-ranking.test.ts`*
- **TC1:** Recency scoring - Checks `recencyScore` returns ~1 for a brand-new post, ~0.5 at the 48h half-life, and decays toward 0 for a 30-day-old post.
- **TC2:** Engagement scoring - Checks `engagementScore` returns 0 for no engagement, scales linearly below the cap, and caps at 1.0 once likes+comments+reposts reach 100.
- **TC3:** Cold-start scoring - Checks `scorePost` with an empty interaction map (affinity = 0, score is engagement + recency only).
- **TC4:** Affinity boost - Checks a post scores higher when the viewer has prior interactions with its author than when they don't.
- **TC5:** Recency comparison - Checks a newer post outscores an older one given identical engagement.
- **TC6:** Rank ordering - Checks `rankPosts` sorts a mixed list by score, descending.
- **TC7:** Empty input - Checks `rankPosts([], map)` returns `[]`.
- **TC8:** Viewer interaction map - Checks `buildViewerInteractionMap` counts reactions and comments per post author, and returns an empty map when the viewer has no history.

#### Category 2: Feed Service Functions (DB-backed)
*File: `src/backend/__tests__/integration/feed.test.ts`*
- **TC9:** Chronological ordering - Checks posts come back newest-first, calling `listPosts` (raw repo query) directly.
- **TC10:** Popular feed ranking - Checks `listPopularFeed` ranks a heavily-engaged older post above a fresh unengaged one.
- **TC11:** Popular feed, empty - Checks `listPopularFeed` returns `{ items: [] }` when there are no posts.
- **TC12:** For-you affinity ranking - Checks `listForYouFeed` ranks a post from an author the viewer previously liked above an unrelated post.
- **TC13:** For-you cold start - Checks `listForYouFeed` falls back to popularity ranking when the viewer has zero interaction history.
- **TC14:** For-you cursor pagination - Checks `listForYouFeed` returns a `nextCursor` on a full page and the remaining item on the next page.
- **TC15:** "Guest feed" - Checks `listPopularFeed` called with no viewer context returns posts ordered by recency.
- **TC16:** 500ms NFR - Checks `listForYouFeed` responds in under 500ms against 100 seeded posts.

#### Category 3: API Routes & HTTP Endpoints
*File: none — `GET /api/v1/posts` (the actual feed endpoint the frontend calls) has no dedicated test file and is not exercised by any existing suite.*
- *(no test cases exist for this category — see Refine)*

#### Category 4: Feed UI (HomePage)
*File: `src/frontend/src/pages/__tests__/HomePage.test.tsx`*
- **TC17:** Guest render - Renders the homepage logo and mock posts for an unauthenticated guest.
- **TC18:** Guest modal dismissal - Remembers dismissal of the guest login modal.
- **TC19:** Guest profile click - Shows the login modal when a guest clicks the Profile button.
- **TC20:** Authenticated post creation - Removes the Log in button and opens `CreatePostModal` for an authenticated user on Create click.
- **TC21:** Guest create click - Shows the login modal when a guest clicks the Create button.
- **TC22:** Logout dialog - Opens `LogoutDialog` when clicking Log out.
- **TC23:** Guest pagination gating - Prompts the login modal and does not fetch a next page when a guest clicks Load more.
- **TC24:** Authenticated pagination - Fetches the next page when an authenticated user clicks Load more.

---

#### Overall Quality Analysis
- **Production Path Not Covered (Category 3):**
  - `GET /api/v1/posts?type=for-you|latest` is the only endpoint the frontend actually calls for feed data, and it has **zero** HTTP-level tests. Query validation (`feedQuerySchema`: `type`, `authorId`, `cursor`, `limit` 1–50), the guest-vs-authenticated branch for `type=for-you`, and the try/catch graceful-degradation fallback (`{ items, degraded: true }` when `listForYouFeed` throws) are all completely unexercised.

- **Ineffective Test (TC9):**
  - TC9 calls `listPosts` (a low-level repo query) directly, but the real "latest" tab goes through `listPostFeed` → `enrichPostList`, which adds `liked`, `reposted`, `attachments`, and repost-unwrapping on top. None of that enrichment logic is touched by any test — TC9 only proves the DB `ORDER BY` clause works.

- **Loose Assertions (TC10, TC12, TC13):**
  - All three only assert `result.items[0].id === expectedPost.id` (ordinal position), never the actual score. Re-computing TC10's numbers: the popular post (2 likes + 2 comments, 60 min old) scores `0.04×0.3 + 0.9796×0.2 ≈ 0.2079`; the unpopular post (0 engagement, 5 min old) scores `0 + 0.9983×0.2 ≈ 0.1997`. The margin is **under 4%** — the test technically passes today, but it's really `engagementScore`'s cap of 100 making 4 total interactions barely register against recency's weight, not a robust proof that engagement ranking works. A ranking-formula regression (e.g. a typo in a weight constant) could easily still pass this test by accident.

- **Mislabeled Test (TC15):**
  - The name "guest feed" / "works without viewerId (guest)" implies it tests guest routing behavior. It doesn't — `listPopularFeed` never accepts a `viewerId` parameter in the first place, for guests or anyone else. The actual guest-vs-authenticated decision (`if (!req.user) listPopularFeed else listForYouFeed`) lives in the untested HTTP route (Category 3). TC15 only proves recency-only ordering when the interaction map is empty.

- **Good Coverage:**
  - The ranking math itself (recency decay, engagement capping, affinity boost, sort order) is thoroughly and correctly unit-tested in isolation (TC1–TC8).
  - Cold-start fallback (TC13) and cursor pagination (TC14) are both covered at the service layer for the personalized feed.

- **Untested Production Behavior Worth Flagging:**
  - `scorePost`'s affinity term is `rawInteractionCount × 0.5` with **no cap**, unlike `engagementScore`, which is explicitly capped at 1.0 (`Math.min(raw, 100) / 100`). A viewer who has interacted 50+ times with one author scores that author's posts at 25+, which dwarfs the maximum possible engagement + recency contribution (0.3 + 0.2 = 0.5) for every other post in the feed. No test exercises a high-affinity viewer to confirm this is intentional; this is a candidate bug in the ranking algorithm itself, not just a coverage gap.

---

### 2. Refine

#### Category 1: Ranking Algorithm 
- **Add Missing Edge Case — unbounded affinity:** Add a test with a viewer who has 50+ interactions with a single author, asserting either that the score is capped/normalized (if that's the intended fix) or explicitly documenting the current unbounded behavior as expected, so a future change can't silently alter it either way. Flag to the team as a possible production bug (`W_AFFINITY` applied to a raw, uncapped count) — out of scope for a test-only refinement to fix directly.
- **Fix Loose Assertions:** Alongside the existing range-based checks (`toBeGreaterThan`/`toBeLessThan`), add one fixed-input, exact-value regression test per function (e.g. `scorePost` with hardcoded `likeCount`/`commentCount`/`createdAt`, asserting the score to 3 decimal places) so a formula regression can't drift while still satisfying the loose bounds.

#### Category 2: Feed Service Functions
- **Fix Ineffective Test (TC9):** Replace or supplement it with a call to `listPostFeed` (the function the real "latest" route uses), asserting the enrichment fields — `liked`, `reposted`, `commentCount`, `attachments` — are present and correct for a signed-in viewer.
- **Add Missing Edge Cases:**
  1. *`listPopularFeed` cursor pagination:* currently only `listForYouFeed`'s cursor (TC14) is tested; `listPopularFeed` has identical pagination logic and zero coverage.
  2. *Reposts in a ranked feed:* seed a `repostOfId` row and confirm `unwrapReposts` surfaces the original post's content with the reposter attached (`repostedBy`), and that a repost of a deleted or non-public original is silently dropped rather than shown blank.
  3. *`authorId` filter on the chronological feed:* `listPostFeed(viewerId, authorId)` with a real `authorId` should return only that author's posts.
- **Improve Test Description (TC15):** Rename from *"listPopularFeed works without viewerId (guest)"* to **"listPopularFeed ranks purely by engagement + recency when the interaction map is empty"** — it doesn't test guest identity or routing.

#### Category 3: API Routes & HTTP Endpoints
*New file needed, e.g. `src/backend/__tests__/integration/feed-routes.test.ts`*
- **Add Missing Test Cases:**
  1. *Happy path, latest (guest):* `GET /api/v1/posts?type=latest` with no auth → 200, `{ items: [...] }`.
  2. *Happy path, for-you (guest):* `GET /api/v1/posts?type=for-you` with no auth → 200, same shape as `listPopularFeed`'s output (no `degraded` flag — this is the intended guest path, not a failure fallback).
  3. *Happy path, for-you (authenticated):* `GET /api/v1/posts?type=for-you` with a valid token → 200, `{ items, nextCursor }` sourced from `listForYouFeed`.
  4. *Invalid query:* `GET /api/v1/posts?type=bogus` → 400 `INVALID_QUERY`.
  5. *Limit bounds:* `GET /api/v1/posts?type=latest&limit=0` and `&limit=51` → 400 (`feedQuerySchema` caps `limit` to 1–50).
  6. *Graceful degradation:* force `listForYouFeed` to throw and confirm the route still returns 200 with `{ items, degraded: true }` (chronological fallback) instead of a 500.
  7. *`authorId` filter via HTTP:* `GET /api/v1/posts?type=latest&authorId=<uuid>` returns only that author's posts.

#### Category 4: Feed UI (HomePage)
- **Add Missing Edge Cases:**
  1. *Tab switching:* assert the "For You" and "Latest" tabs set `aria-selected` correctly and that each drives a distinct React Query key (`["posts", feedType]`), so switching tabs actually requests the other feed.
  2. *Empty feed state:* render with zero posts returned and confirm an empty/placeholder view appears instead of a blank page or crash.
