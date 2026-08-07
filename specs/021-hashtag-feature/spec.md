# Feature Specification: Hashtag Feature

**Feature Branch**: `021-hashtag-feature`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "I want to create hashtag feature for the foz forum. Ensure it uses the live data"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Render Hashtags in Forum Content (Priority: P1)

As a forum member, when I write a post or comment containing one or more hashtags (e.g. `#foz`, `#technology`), the platform automatically detects and formats these hashtags as interactive, highlighted links so that readers can discover related conversations.

**Why this priority**: Core entry point for hashtag creation and visual recognition in posts.

**Independent Test**: Can be tested by creating a post with text `#foz` and verifying that `#foz` is rendered as an interactive clickable link in the feed.

**Acceptance Scenarios**:

1. **Given** a user is creating a post or comment, **When** they type text containing `#topic` (letters, numbers, underscores), **Then** the published post renders `#topic` as an interactive hashtag badge/link.
2. **Given** a post contains multiple hashtags (e.g. `#foz #web3`), **When** viewed in the live feed or post detail page, **Then** each hashtag is individually parsed and clickable.

---

### User Story 2 - Explore Hashtag Feed with Live Data (Priority: P2)

As a forum user, when I click on a hashtag (or search for a hashtag), I am taken to a dedicated hashtag feed page showing all live posts tagged with that hashtag, ordered chronologically.

**Why this priority**: Essential for content discovery and topic-based navigation across live forum threads.

**Independent Test**: Can be tested by clicking `#foz` on any post and verifying the hashtag page displays all live posts containing `#foz` directly from the live database.

**Acceptance Scenarios**:

1. **Given** a user clicks on `#foz`, **When** the hashtag page opens, **Then** it queries the live database and displays a feed of posts tagged with `#foz`.
2. **Given** new posts with `#foz` are published, **When** the hashtag feed is refreshed, **Then** the new posts appear immediately in the live feed.

---

### User Story 3 - Discover Live Trending Hashtags (Priority: P3)

As a user exploring the FOZ forum, I want to see a "Trending Hashtags" widget on the sidebar displaying the most frequently used hashtags derived from live database activity.

**Why this priority**: Promotes discovery of active discussions across the platform using live telemetry.

**Independent Test**: Can be tested by viewing the sidebar and verifying the listed hashtags match live hashtag frequency metrics from the database.

**Acceptance Scenarios**:

1. **Given** users are actively posting on the forum, **When** a user views the homepage sidebar, **Then** the Trending Hashtags section displays live topic tags with post count badges.
2. **Given** a user clicks a trending hashtag, **When** selected, **Then** they navigate directly to that hashtag's dedicated live feed.

---

### Edge Cases

- What happens when a post contains punctuation directly adjacent to a hashtag (e.g., `#foz!`, `#foz,`, `#foz.`)? Punctuation outside alphanumeric and underscore characters MUST be trimmed from the hashtag link target.
- How does the system handle mixed-case hashtags (e.g. `#FOZ` vs `#foz`)? Hashtag indexing and querying MUST be case-insensitive so `#FOZ` and `#foz` group into the same live topic feed.
- What happens if a post contains no text other than a single invalid `#` symbol? The isolated `#` MUST NOT be parsed as a hashtag link.

## Clarifications

### Session 2026-08-06

- Q: How should the "Trending Hashtags" sidebar calculate which hashtags are trending? → A: Calculate trending hashtags based on post usage frequency in the last 7 days.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically parse and index hashtags (`#tagname`) from post and comment body text during publishing.
- **FR-002**: System MUST render hashtags as interactive clickable links in feed items, post details, and comments.
- **FR-003**: System MUST provide a dedicated Hashtag Feed page (`/hashtags/:tag`) that queries live database posts tagged with `:tag`.
- **FR-004**: System MUST support case-insensitive matching for hashtag aggregation and live feed filtering.
- **FR-005**: System MUST compute and display live Trending Hashtags based on post frequency within the past 7 days from the live database.
- **FR-006**: System MUST handle special characters and punctuation adjacent to hashtags cleanly without breaking URL targets.

### Key Entities

- **Hashtag**: Represents a unique topic tag extracted from post content (attributes: tag name normalized to lowercase, usage count, last used timestamp).
- **PostHashtag**: Junction entity linking a specific post to its associated hashtags for database querying.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can click any hashtag and view the matching live hashtag feed in under 1 second.
- **SC-002**: 100% of published posts containing valid `#tag` syntax correctly extract, index, and render clickable hashtag links.
- **SC-003**: Trending Hashtags widget updates dynamically based on live database activity.

## Assumptions

- Hashtags consist of alphanumeric characters and underscores following the standard regex pattern `#\w+`.
- Case normalization converts hashtags to lowercase for indexing while preserving visual presentation where appropriate.
- Hashtags integrate seamlessly into existing search and feed infrastructure.
