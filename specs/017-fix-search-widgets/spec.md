# Feature Specification: Search Discovery Widgets & Input Fixes

**Feature Branch**: `017-fix-search-widgets`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Fix search: Trending Topics, Suggested Creators, Trending Discussions use mock data. View all (right side of Suggested Creators) is not functionable. The submit search input (the right arrow) only shows when user enters some input to the box"

## Clarifications

### Session 2026-08-05

- Q: What exact UI action should occur when a user clicks "View all" for Suggested Creators? → A: Trigger a profile search to list all recommended creators directly on the Search page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic Search Discovery Content (Priority: P1)

As a user exploring the search page, I want to see real dynamic trending topics, suggested creators, and trending discussions instead of mock data so that I can discover active content and relevant creators.

**Why this priority**: Displaying live backend data instead of hardcoded mock data is fundamental to providing users with actual value and discovery on the search page.

**Independent Test**: Can be tested by opening the search page with clean backend data and verifying that Trending Topics, Suggested Creators, and Trending Discussions accurately reflect database records instead of static mock names.

**Acceptance Scenarios**:

1. **Given** the search page is loaded, **When** no search term is entered, **Then** the page dynamically renders Trending Topics, Suggested Creators, and Trending Discussions from the backend API.
2. **Given** the backend has active tags or topics, **When** a user clicks on a Trending Topic tag, **Then** the search input populates with the topic and triggers search for that topic.
3. **Given** the backend has active creators/users, **When** a user clicks on a Suggested Creator card, **Then** the user is navigated to that creator's profile page.

---

### User Story 2 - Functional "View all" Suggested Creators (Priority: P2)

As a user exploring suggested creators, I want to click "View all" on the right side of the Suggested Creators section (or the trailing View all card) so that I can see the full list of recommended creators directly on the search page.

**Why this priority**: Users need an intuitive entry point to explore all recommended creators beyond the initial horizontal preview row.

**Independent Test**: Can be tested by clicking the "View all" button next to Suggested Creators and confirming it populates search results with all creators on the search page.

**Acceptance Scenarios**:

1. **Given** the Suggested Creators section on the search page, **When** the user clicks "View all" on the right header or on the trailing "View all" card, **Then** the system triggers a profile search query that lists all available creators directly on the search page.
2. **Given** a user is viewing the search results listing all creators, **When** they click on any creator, **Then** they are taken to that creator's profile.

---

### User Story 3 - Search Input Submit Button Visibility (Priority: P3)

As a user typing in the search box, I want the submit arrow button to only display when I have entered input, so that the search interface is clean and explicitly indicates when a search action is ready.

**Why this priority**: Improves input field clarity, visual feedback, and user interaction mechanics.

**Independent Test**: Can be tested by focusing on an empty search input box and confirming the right arrow submit button is hidden, then typing text and confirming the arrow button appears.

**Acceptance Scenarios**:

1. **Given** an empty search input box, **When** the input box has no text, **Then** the submit search right arrow button is not visible.
2. **Given** a user types one or more non-whitespace characters in the search box, **When** text is present, **Then** the submit search right arrow button becomes visible and clickable.
3. **Given** text is present in the search box, **When** the user clicks the clear (close) button or deletes all text, **Then** the submit search right arrow button hides again.

---

### Edge Cases

- What happens when there are no trending topics or suggested creators in the database? System MUST display a clean fallback empty state (e.g. "No trending topics available right now") instead of crashing or showing broken layouts.
- How does the system handle rapid typing in the search input box? Submit button visibility updates instantly without input lag or flicker.
- What happens when a user clicks a trending discussion item? System navigates directly to the post detail page for that discussion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch dynamic real backend data for Trending Topics, Suggested Creators, and Trending Discussions on the Search page.
- **FR-002**: System MUST replace hardcoded mock profiles, discussion posts, and topic tags with real data retrieved from the backend API.
- **FR-003**: System MUST make both the header "View all" link and the grid card "View all" in the Suggested Creators section functional by triggering a profile search that lists all recommended creators directly on the search page.
- **FR-004**: System MUST conditionally show the submit search right arrow button ONLY when the search input box contains non-empty text.
- **FR-005**: System MUST hide the submit search right arrow button when the search input box is empty or cleared.
- **FR-006**: System MUST allow users to trigger search submission via both the submit arrow button (when visible) and by pressing the `Enter` key.
- **FR-007**: System MUST allow users to click a Trending Topic chip to immediately execute a search for that topic.

### Key Entities

- **Trending Topic**: Represents popular search tags or hashtags dynamically aggregated from recent posts.
- **Suggested Creator**: Represents active user profiles recommended to users based on popularity or activity.
- **Trending Discussion**: Represents recent posts with high engagement (likes, comments).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of search page discovery widgets (Trending Topics, Suggested Creators, Trending Discussions) display dynamic real backend data without mock data fallbacks.
- **SC-002**: Clicking "View all" for Suggested Creators triggers profile search results within 300ms.
- **SC-003**: The search submit right arrow button is 100% hidden when the search input is empty, and appears within 50ms upon typing input.
- **SC-004**: Clicking any Trending Topic or Trending Discussion correctly navigates to search results or post detail with 0 console errors.

## Assumptions

- Backend endpoints for profiles/users, posts, and topics are available or can be queried for trending/suggested content.
- Viewing all suggested creators triggers an empty/all profile search on the existing Search page.
- Standard keyboard interactions (e.g., pressing `Enter` to submit search, `Escape` to clear search) remain consistent across the app.
