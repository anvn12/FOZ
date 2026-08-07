# Phase 0 Research: Hashtag Feature

## Research Topic 1: Hashtag Extraction & Case Normalization

### Decision
Extract hashtags using regex pattern `/#([a-zA-Z0-9_]+)/g`. Store normalized lowercase tag names in `hashtags.name` for indexing and search, while retaining the original casing in post content for display.

### Rationale
- Regex pattern `#([a-zA-Z0-9_]+)` matches standard hashtag syntax across social platforms (Twitter, Reddit, Instagram).
- Trimming trailing punctuation (e.g. `#foz!`, `#foz,`) ensures clean tag extraction without corrupting tag targets.
- Storing lowercase `name` enables case-insensitive database indexing and instant aggregation (`WHERE name = 'foz'`).

### Alternatives Considered
- *Full-text search without junction tables*: Rejected because querying `#tag` with `ILIKE '%#tag%'` is slow ($O(N)$ table scans) and does not support fast 7-day trending aggregation.

---

## Research Topic 2: Relational Schema vs JSON Array Storage

### Decision
Use two relational tables: `hashtags` (lookup table) and `post_hashtags` (junction table).

### Rationale
- Enables simple, indexed SQL join queries for `/api/v1/hashtags/:tag/posts`.
- Makes computing 7-day trending hashtags extremely fast via:
  `SELECT h.name, h.display_name, COUNT(ph.post_id) AS count FROM hashtags h JOIN post_hashtags ph ON h.id = ph.hashtag_id JOIN posts p ON ph.post_id = p.id WHERE p.created_at >= NOW() - INTERVAL '7 days' GROUP BY h.id ORDER BY count DESC LIMIT 10;`
- Maintains foreign key integrity (`ON DELETE CASCADE` when posts are removed).

---

## Research Topic 3: Frontend Text Parsing & Rendering

### Decision
Create a lightweight `<HashtagText text={content} />` component using string splitting/regex matching to transform hashtag substrings into React Router `<Link to="/hashtags/:tag">#tag</Link>` elements.

### Rationale
- Avoids dangerous `dangerouslySetInnerHTML`.
- Preserves React component lifecycle and routing SPA transitions.
- Integrates seamlessly with existing `FeedPostItem` and comment rendering.
