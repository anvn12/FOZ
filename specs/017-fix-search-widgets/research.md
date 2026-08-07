# Technical Research: Search Discovery Widgets & Input Fixes

**Feature Branch**: `017-fix-search-widgets`

## 1. Discovery Data Aggregation & Backend Endpoint Design

### Decision
We will expose dedicated discovery sub-routes under `GET /api/v1/search/discovery` (or modular `GET /api/v1/search/topics`, `GET /api/v1/search/creators`, `GET /api/v1/search/discussions`) to deliver dynamic content for Trending Topics, Suggested Creators, and Trending Discussions.

### Rationale
- Modular endpoints (or a consolidated discovery endpoint) prevent hardcoded client state and cleanly separate discovery queries from full-text search queries.
- Suggested creators can query active `profiles` joined with `userAccounts` where `status = 'active'`.
- Trending discussions query recent `posts` joined with `profiles` and interaction counts (likes & comments).
- Trending topics extract hashtags/tags from recent posts or return top active topic tags.

### Alternatives Considered
- *Keeping mock data in frontend*: Rejected because user requirement explicitly states discovery sections must stop using mock data.
- *Overloading single search route*: Rejected because discovery needs targeted defaults (e.g. top creators, top discussions) when no search query has been typed by the user.

---

## 2. Search Input Arrow Visibility Mechanics

### Decision
The submit button (containing the `arrow_forward` Material Symbol icon) will be conditionally rendered in `SearchPage.tsx` based on `searchTerm.trim().length > 0`.

### Rationale
- Satisfies requirement FR-004 and FR-005.
- Provides immediate visual feedback indicating search submit is ready.
- Avoids rendering a non-functional arrow button when search input is empty.

### Alternatives Considered
- *Disabling button instead of hiding*: Rejected because spec requires the arrow icon to only show when input is entered.

---

## 3. "View All" Suggested Creators Integration

### Decision
Clicking "View all" (either header text or trailing card) in Suggested Creators will invoke a profile search (setting search state to fetch all active profiles or submit a profile search query).

### Rationale
- Clarification Q1 established that "View all" should list all recommended creators directly on the Search page.
- Reuses existing search result listing component layout without introducing unnecessary new routes.
