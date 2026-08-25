## Feed Generation Test Suite Review & Refinement

Test Suite Folders: `src/backend/__tests__/unit/feed-ranking.test.ts`, `src/backend/__tests__/integration/feed.test.ts`, `src/backend/__tests__/integration/feed-routes.test.ts`, `src/backend/__tests__/integration/feed-degradation.test.ts`, `src/frontend/src/pages/__tests__/HomePage.test.tsx`

**Execution result:** 6 test files, **48 tests, 0 failures** (31 baseline + 17 added this review). Note: the TC ids below group related assertions (e.g. TC1 covers 3 `it()` cases for `recencyScore`) and don't map 1:1 to the raw test count.

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
- **TC25** *(new)*: Exact-value regression - Freezes the clock and asserts `scorePost` returns a precise, hand-verified score (1.178333...) for fixed likes/comments/affinity/age, instead of only a loose range.
- **TC26** *(new)*: Unbounded affinity - Documents that a viewer with 50 interactions with one author scores that author's posts above 20, versus a 0.5 ceiling for engagement + recency combined for any other post.

#### Category 2: Feed Service Functions (DB-backed)
*File: `src/backend/__tests__/integration/feed.test.ts`*
- **TC9:** Chronological ordering - Checks posts come back newest-first, calling `listPosts` (raw repo query) directly.
- **TC10:** Popular feed ranking - Checks `listPopularFeed` ranks a heavily-engaged older post above a fresh unengaged one.
- **TC11:** Popular feed, empty - Checks `listPopularFeed` returns `{ items: [] }` when there are no posts.
- **TC12:** For-you affinity ranking - Checks `listForYouFeed` ranks a post from an author the viewer previously liked above an unrelated post.
- **TC13:** For-you cold start - Checks `listForYouFeed` falls back to popularity ranking when the viewer has zero interaction history.
- **TC14:** For-you cursor pagination - Checks `listForYouFeed` returns a `nextCursor` on a full page and the remaining item on the next page.
- **TC15:** Popular feed with no interaction map - Checks `listPopularFeed` ranks purely by engagement + recency when called with an empty interaction map. *(renamed, was "guest feed" - see Refine)*
- **TC16:** 500ms NFR - Checks `listForYouFeed` responds in under 500ms against 100 seeded posts.
- **TC27** *(new)*: `authorId` filter on `listPosts` - Checks the raw repo query returns only the given author's posts.
- **TC28** *(new)*: `listPostFeed` enrichment - Checks the real production "latest" path returns `liked`, `reposted`, `commentCount`, and `attachments` correctly for a signed-in viewer, not just post ordering.
- **TC29** *(new)*: `authorId` filter on `listPostFeed` - Checks the enriched service function respects the `authorId` filter.
- **TC30** *(new)*: `listPopularFeed` cursor pagination - Checks `listPopularFeed` paginates correctly (previously only `listForYouFeed`'s identical cursor logic was tested).
- **TC31** *(new)*: Repost surfaces original content - Checks a repost appears in the ranked feed as its own entry (`repostId` set) carrying the original post's content and the reposter's profile (`repostedBy`), alongside the original poster's own occurrence of the same content.
- **TC32** *(new)*: Repost of a non-public original is dropped - Checks a repost whose original post has since been made private is silently excluded from the ranked feed.

#### Category 3: API Routes & HTTP Endpoints
*Files (new): `src/backend/__tests__/integration/feed-routes.test.ts`, `src/backend/__tests__/integration/feed-degradation.test.ts`*
- **TC33** *(new)*: `GET /api/v1/posts?type=latest`, guest - 200 with the chronological feed.
- **TC34** *(new)*: `GET /api/v1/posts?type=for-you`, guest - 200 with the popularity-feed shape, no `degraded` flag (this is the intended guest path, not a failure fallback).
- **TC35** *(new)*: `GET /api/v1/posts?type=for-you`, authenticated - 200 with `{ items, nextCursor }` sourced from `listForYouFeed`.
- **TC36** *(new)*: Invalid `type` query param - 400 `INVALID_QUERY`.
- **TC37** *(new)*: `limit` out of bounds (`0` and `51`) - 400 `INVALID_QUERY` for both.
- **TC38** *(new)*: `authorId` filter via HTTP - `GET /api/v1/posts?type=latest&authorId=<uuid>` returns only that author's posts.
- **TC39** *(new, isolated file)*: Graceful degradation - `listForYouFeed` mocked to throw; route still returns 200 with `{ items, degraded: true }` (chronological fallback), not a 500.

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
- **TC40** *(new)*: Feed-type parameterization - Checks `feedType="for-you"` calls `listFeed("for-you", undefined)` and marks the "For You" tab `aria-selected="true"` (and "Latest" `"false"`).
- **TC41** *(new)*: Empty feed state - Checks a zero-post response renders the "No posts yet. Be the first to share something!" placeholder instead of a blank page.

---

#### Overall Quality Analysis
- **Production Path Not Covered (Category 3):**
  - `GET /api/v1/posts?type=for-you|latest` was the only endpoint the frontend actually calls for feed data, and it had **zero** HTTP-level tests. Query validation (`feedQuerySchema`: `type`, `authorId`, `cursor`, `limit` 1-50), the guest-vs-authenticated branch for `type=for-you`, and the try/catch graceful-degradation fallback (`{ items, degraded: true }` when `listForYouFeed` throws) were all completely unexercised.
  - => Closed this review with TC33-TC39, see **2. Refine**.

- **Ineffective Test (TC9):**
  - TC9 calls `listPosts` (a low-level repo query) directly, but the real "latest" tab goes through `listPostFeed` -> `enrichPostList`, which adds `liked`, `reposted`, `attachments`, and repost-unwrapping on top. None of that enrichment logic was touched by any test - TC9 only proves the DB `ORDER BY` clause works.
  - => Supplemented with TC28 this review, see **2. Refine**.

- **Loose Assertions (TC10, TC12, TC13):**
  - All three only assert `result.items[0].id === expectedPost.id` (ordinal position), never the actual score. Re-computing TC10's numbers: the popular post (2 likes + 2 comments, 60 min old) scores `0.04x0.3 + 0.9796x0.2 = 0.2079`; the unpopular post (0 engagement, 5 min old) scores `0 + 0.9983x0.2 = 0.1997`. The margin is **under 4%** - the test technically passes today, but it's really `engagementScore`'s cap of 100 making 4 total interactions barely register against recency's weight, not a robust proof that engagement ranking works. A ranking-formula regression (e.g. a typo in a weight constant) could easily still pass this test by accident.
  - => An exact-value regression test (TC25) was added alongside the loose checks this review; TC10/TC12/TC13 themselves were left as ordinal checks (see Refine).

- **Mislabeled Test (TC15):**
  - The name "guest feed" / "works without viewerId (guest)" implied it tests guest routing behavior. It doesn't - `listPopularFeed` never accepts a `viewerId` parameter in the first place, for guests or anyone else. The actual guest-vs-authenticated decision (`if (!req.user) listPopularFeed else listForYouFeed`) lived in the untested HTTP route (Category 3).
  - => Renamed this review, see **2. Refine**.

- **Good Coverage:**
  - The ranking math itself (recency decay, engagement capping, affinity boost, sort order) is thoroughly and correctly unit-tested in isolation (TC1-TC8).
  - Cold-start fallback (TC13) and cursor pagination (TC14) are both covered at the service layer for the personalized feed.

- **Untested Production Behavior Worth Flagging:**
  - `scorePost`'s affinity term is `rawInteractionCount x 0.5` with **no cap**, unlike `engagementScore`, which is explicitly capped at 1.0 (`Math.min(raw, 100) / 100`). A viewer who has interacted 50+ times with one author scores that author's posts at 25+, which dwarfs the maximum possible engagement + recency contribution (0.3 + 0.2 = 0.5) for every other post in the feed.
  - => TC26 was added this review to lock in and document the current (unbounded) behavior. **No production code was changed** - this remains a candidate bug in the ranking algorithm, flagged for the team to decide on intentionally; test-only refinement can't fix it directly.

---

### 2. Refine

#### Category 1: Ranking Algorithm
- **Added Missing Edge Case - unbounded affinity (TC26):** A viewer with 50 interactions with a single author now has a locked-in assertion that the resulting score exceeds 20, far above the 0.5 ceiling engagement + recency could ever reach alone. Flagged to the team as a possible production bug (`W_AFFINITY` applied to a raw, uncapped count) - out of scope for a test-only refinement to fix directly.
- **Fixed Loose Assertions (TC25):** Added a frozen-clock, fixed-input, exact-value regression test for `scorePost` (asserted to 5 decimal places via `toBeCloseTo`), alongside the existing range-based checks, so a formula regression can't drift while still satisfying the loose bounds.

#### Category 2: Feed Service Functions
- **Fixed Ineffective Test (TC9 -> TC28):** Added a call to `listPostFeed` (the function the real "latest" route uses), asserting the enrichment fields - `liked`, `reposted`, `commentCount`, `attachments` - are present and correct for a signed-in viewer. TC9 itself was left in place (it's still a valid, if narrower, check of the raw ordering).
- **Added Missing Edge Cases:**
  1. *`listPopularFeed` cursor pagination (TC30):* `listPopularFeed` has identical pagination logic to `listForYouFeed` (TC14) and previously had zero coverage of its own.
  2. *Reposts in a ranked feed (TC31, TC32):* seeded a `repostOfId` row and confirmed `unwrapReposts` surfaces the original post's content with the reposter attached (`repostedBy`); confirmed a repost of a post that later became non-public is silently dropped rather than shown blank. This also surfaced a worth-knowing behavior: a repost renders as a *second*, separate feed entry alongside the original poster's own copy, not a replacement of it.
  3. *`authorId` filter (TC27, TC29):* added for both the raw `listPosts` query and the enriched `listPostFeed` service.
- **Improved Test Description (TC15):** Renamed from *"listPopularFeed works without viewerId (guest)"* to **"listPopularFeed ranks purely by engagement + recency when the interaction map is empty"** - it doesn't test guest identity or routing.

#### Category 3: API Routes & HTTP Endpoints
- **Added Missing Test Cases (TC33-TC39):** New file `feed-routes.test.ts` covers the latest/guest, for-you/guest, for-you/authenticated, invalid-query, limit-bounds, and authorId-filter cases against the real DB. The graceful-degradation case (TC39, forcing `listForYouFeed` to throw) was split into its own file, `feed-degradation.test.ts`, because it needs a module mock on the posts service - isolating it keeps that mock from leaking into the real-DB tests in the other files.

#### Category 4: Feed UI (HomePage)
- **Added Missing Edge Cases:**
  1. *Feed-type parameterization (TC40):* On inspection, the "For You" / "Latest" tabs turned out to do a full page navigation (`window.location.href = ...`) rather than a client-side switch, so there's no client-side "tab switching" to test. Instead, TC40 verifies the `feedType` prop correctly drives both the `listFeed` call and each tab's `aria-selected` state at render time - the part that's actually testable and actually matters.
  2. *Empty feed state (TC41):* Added a test rendering zero posts and confirming the "No posts yet. Be the first to share something!" placeholder appears instead of a blank page.

**Net result:** 17 tests added (2 ranking-algorithm, 6 feed-service, 7 API-route in two new files, 2 UI), 1 test renamed for accuracy, 0 production code changed. 4 -> 6 files, 31 -> 48 tests, all passing.
