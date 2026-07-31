# Feature Specification: Post Summarize (TL;DR)

**Feature Branch**: `011-post-summarize`

**Created**: 2026-07-31

**Status**: Draft

**Input**: Based on `d:\FOZ\docs\00 - Old-PA-docs\1B. Project Proposal.md`, create Post Summarize (TL;DR) functional group. That function uses LLMs API to summarize about 10 selected comments on the ratio: most liked, most replied, recent (define the suitable ratio for me).

## Clarifications

### Session 2026-07-31
- Q: Summary Cache Invalidation Strategy → A: Option B - Manual refresh button only (users explicitly trigger a re-summary).
- Q: "Most Replied" Calculation Metric → A: Option A - Direct child replies only (count 1st-level replies attached directly to the comment).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - On-Demand Post & Comment Summary (Priority: P1)

As a reader browsing a lengthy discussion thread, I want to request an AI-generated TL;DR overview of the post and its top comments, so that I can quickly grasp the main takeaways and community sentiments without reading all comments.

**Why this priority**: Core value proposition of the Post Summarize feature defined in the project proposal to save user time and increase engagement.

**Independent Test**: Can be tested on any post with 10+ comments by triggering the "Summarize" button and verifying a structured summary (key post points + top comment summary) is returned within seconds.

**Acceptance Scenarios**:

1. **Given** a post with 10 or more comments, **When** a user clicks the "Generate TL;DR" button, **Then** the system extracts a representative sample of 10 comments (based on the defined 4:3:3 ratio) and displays a structured overview containing: (a) main post topic/summary, (b) key themes from top comments, and (c) overall community sentiment.
2. **Given** an existing generated summary for a post, **When** another user views the post, **Then** the existing summary is displayed immediately without re-triggering unnecessary AI processing unless manually refreshed.

---

### User Story 2 - Representative Comment Selection Strategy (Priority: P2)

As a community participant, I want the summary to reflect a fair balance of top-rated responses, active sub-discussions, and recent updates, so that the summary is well-rounded and unbiased.

**Why this priority**: Ensures the summary is not skewed solely by early likes or recent comments, giving an accurate representation of complex discussions.

**Independent Test**: Can be tested by verifying comment selection on threads with known metrics (high likes, high replies, recent timestamps) to ensure selected comments strictly adhere to the 4:3:3 distribution rule with deduplication.

**Acceptance Scenarios**:

1. **Given** a post with diverse comments, **When** comment sampling occurs for summarization, **Then** 10 unique comments are selected using the ratio: 4 Most Liked (40%), 3 Most Replied by direct 1st-level replies (30%), and 3 Most Recent (30%).
2. **Given** a comment that fits multiple criteria (e.g., both Most Liked and Most Replied), **When** building the 10-comment sample batch, **Then** the system deduplicates the comment and fills remaining slots from the next highest candidate in that category.

---

### User Story 3 - Handling Short Threads & Fallback Summaries (Priority: P3)

As a reader viewing a newly created or low-activity post (fewer than 10 comments), I want the system to handle summarization gracefully without breaking or producing meaningless output.

**Why this priority**: Gracefully handles edge cases for small threads or posts without comments.

**Independent Test**: Test on posts with 0 comments, 1-9 comments, and verify accurate, concise summaries are produced using available data.

**Acceptance Scenarios**:

1. **Given** a post with fewer than 10 comments, **When** a user requests a summary, **Then** the system uses all available comments (or just the post body if 0 comments) to generate the summary.
2. **Given** an AI service temporary delay or error, **When** summarization fails, **Then** an informative, non-intrusive notification is displayed with an option to retry.

---

### Edge Cases

- **Post with 0 comments**: System summarizes only the main post body text and indicates no community comments are available yet.
- **Duplicate overlaps in comment selection**: If the top-liked comments are also the top-replied comments, deduplication automatically selects the next eligible comment down the list for each category to ensure 10 unique comments are analyzed.
- **Very long comments or post body**: Excessively long text is truncated safely before prompt processing to keep summaries concise and within model context windows.
- **Deleted or moderated comments**: Comments flagged or deleted prior to summary generation are automatically excluded from the selection pool.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an on-demand "Generate TL;DR" trigger on post detail pages for authenticated users and guests.
- **FR-002**: System MUST select a target batch of 10 comments using the balanced ratio:
  - 40% (4 comments) - **Most Liked** (highest positive reactions/endorsements)
  - 30% (3 comments) - **Most Replied** (highest direct 1st-level child reply count)
  - 30% (3 comments) - **Most Recent** (latest timestamp/fresh insights)
- **FR-003**: System MUST deduplicate comments across selection buckets so that exactly 10 distinct comments (or all available comments if total < 10) are passed to the summarizer.
- **FR-004**: System MUST format the output summary into clear, scannable sections:
  - **Post Snapshot**: 1-2 sentence core message of the original post.
  - **Key Discussion Highlights**: Bullet points capturing major viewpoints from selected comments.
  - **Community Consensus / Sentiment**: Brief note on general sentiment (e.g., supportive, divided, technical debate).
- **FR-005**: System MUST cache generated summaries per post to avoid redundant AI calls. Re-summarization occurs only when explicitly triggered via a manual "Refresh Summary" action by a user.
- **FR-006**: System MUST enforce authorization policies such that Guests and Standard Users can view/generate summaries, while Moderators/Admins retain full oversight.

### Key Entities *(include if feature involves data)*

- **Post Summary**: Represents a generated TL;DR overview linked to a specific Post.
  - *Attributes*: Post Identifier, Summary Text (snapshot, key highlights, sentiment), Selection Metadata (comment count, timestamp), Expiration/Freshness state.
- **Comment Selection Pool**: A transient collection of up to 10 comments gathered via 4:3:3 selection ratio for LLM input.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of requested summaries are generated and displayed to the user within 3 seconds.
- **SC-002**: Summary quality test achieves >85% user agreement that the TL;DR accurately reflects the original post and top discussions.
- **SC-003**: Deduplication logic guarantees 100% unique comment representation in the sampled batch without duplicates.
- **SC-004**: Repeated views of a summarized post load cached summaries in under 300 milliseconds.

## Assumptions

- **Comment Ratio Selection**: The 4:3:3 ratio (4 Most Liked, 3 Most Replied, 3 Most Recent) provides an optimal balance between popularity, active discussion, and freshness for community forums.
- **LLM Integration**: An external or self-hosted LLM service will be available via standard API for text summarization.
- **Access Control**: Summaries are visible to all users who have access to read the post (including Guest users).
- **Thread Length Threshold**: For threads under 10 comments, all existing comments are included in the summary without requiring sub-ratio filtering.
