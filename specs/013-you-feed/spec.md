# Feature Specification: You Feed

**Feature Branch**: `013-you-feed`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Implement feed generation, for you feed"

## User Scenarios & Testing

### User Story 1 - Personalized Feed Discovery (Priority: P1)

As a logged-in user, I want to see a personalized "For You" feed that surfaces posts most relevant to me, so that I discover content I care about without manually searching.

**Why this priority**: This is the core value proposition — a personalized feed differentiates the platform from a flat chronological list and drives engagement.

**Independent Test**: Can be fully tested by logging in, interacting with some posts (likes, comments), then verifying the "For You" feed surfaces related content ranked higher than unrelated content.

**Acceptance Scenarios**:

1. **Given** a logged-in user who has liked posts about topic A, **When** they open the "For You" feed, **Then** posts about topic A appear higher in the feed than posts about unrelated topics.
2. **Given** a logged-in user with no interaction history, **When** they open the "For You" feed, **Then** they see a diverse mix of recent popular posts (cold-start fallback).
3. **Given** a logged-in user, **When** they switch between "For You" and "Latest" feed tabs, **Then** each tab shows its respective feed ordering independently.

---

### User Story 2 - Feed Tab Switching (Priority: P2)

As a logged-in user, I want to switch between "For You" and "Latest" feed views, so that I can choose between personalized discovery and chronological browsing.

**Why this priority**: Users should retain control over their viewing experience; some prefer chronological order.

**Independent Test**: Can be tested by verifying tab UI exists, switching between tabs, and confirming each loads the correct feed variant.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the home feed, **When** they tap the "For You" tab, **Then** the personalized feed loads with ranked content.
2. **Given** a logged-in user on the home feed, **When** they tap the "Latest" tab, **Then** the chronological feed loads (current behavior).
3. **Given** a logged-in user refreshes the page, **When** the feed loads, **Then** the previously selected tab is remembered.

---

### User Story 3 - Guest Feed Experience (Priority: P3)

As a guest (not logged in), I want to see a general feed of popular recent posts, so that I can browse the forum before committing to sign up.

**Why this priority**: Guests need a usable experience, but personalized feeds require user data, so guests see a popularity-based fallback.

**Independent Test**: Can be tested by visiting the site without logging in and verifying a feed of recent popular posts loads.

**Acceptance Scenarios**:

1. **Given** a guest user, **When** they visit the home page, **Then** they see a feed of recent posts ranked by engagement (likes + comments).
2. **Given** a guest user, **When** they attempt to switch to "For You" tab, **Then** they are prompted to log in or the tab is not available.

---

### Edge Cases

- What happens when a user has interactions but the posts they interacted with are all deleted? → Fallback to cold-start logic.
- What happens when the feed generation service is slow or unavailable? → Degrade to chronological feed with no error shown to user.
- What happens when a post is promoted but then moderated/removed? → It must be excluded from feed results immediately.
- What happens with a brand new user who has exactly zero interactions? → Cold-start: show recent popular posts.
- What happens when a user has only interacted with a very narrow set of content? → Ensure some diversity in the feed to avoid filter bubbles.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a "For You" feed endpoint that returns posts ranked by relevance to the authenticated user.
- **FR-002**: System MUST provide a "Latest" feed endpoint that returns posts in reverse chronological order (existing behavior).
- **FR-003**: Feed ranking MUST consider user interaction signals: posts the user has liked, commented on, or reposted.
- **FR-004**: Feed ranking MUST consider post engagement metrics: total likes, comments, and reposts across all users.
- **FR-005**: Feed ranking MUST incorporate recency: newer posts receive a time-decay boost.
- **FR-006**: System MUST handle the cold-start problem: users with no interaction history receive a popularity-based feed.
- **FR-007**: Feed MUST exclude posts that are soft-deleted, moderated, or from suspended authors.
- **FR-008**: Feed MUST support pagination (load more) to avoid loading all posts at once.
- **FR-009**: Guest users MUST see a popularity-based feed (no personalization without authentication).
- **FR-010**: The frontend MUST display a tab switcher ("For You" / "Latest") on the feed page for logged-in users.
- **FR-011**: The system MUST remember the user's last selected feed tab across sessions.
- **FR-012**: Feed generation MUST degrade gracefully — if personalization fails, fall back to chronological order without user-facing errors.

### Key Entities

- **Post**: Content created by users; has author, content, timestamps, engagement counts, visibility/lifecycle state.
- **Reaction**: A user's like on a post or comment; used as an interaction signal for feed ranking.
- **Comment**: A user's reply on a post; used as an interaction signal for feed ranking.
- **User Account**: The authenticated user whose interaction history drives personalization.
- **Feed Ranking Score**: A computed relevance score per (user, post) pair — not persisted as an entity, but derived at query time from interaction and engagement data.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Logged-in users see personalized content in the top 5 feed positions within 2 weeks of active usage (measured by presence of posts related to user's interaction history).
- **SC-002**: Feed page loads within 2 seconds for users with up to 10,000 posts in the database.
- **SC-003**: 80% of logged-in users can switch between "For You" and "Latest" tabs without errors.
- **SC-004**: Guest users see a usable feed of recent popular posts without errors.
- **SC-005**: Feed generation degrades gracefully — zero user-facing errors when personalization service is slow or unavailable.

## Assumptions

- The existing posts, reactions, and comments tables provide sufficient interaction data for basic personalization. No new tables (e.g., follows, user interests) are required for v1.
- Feed ranking is computed in real-time at query time (no pre-computed feed cache or background job). This is acceptable for the expected scale (thousands of posts, not millions).
- Content-based topic matching (NLP/semantic analysis) is out of scope for v1; ranking is based on interaction signals and engagement metrics only.
- The "For You" feed is only available to authenticated users; guests always see the popularity-based feed.
- Mobile support is in scope since the existing feed page is already responsive.
- The existing Drizzle/PostgreSQL stack is used for feed queries; no external search or recommendation service is introduced.
