# Feature Specification: Threads-Style Community Database Schema

**Feature Branch**: `[001-threads-schema]`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "Define a database schema for my website application. The app is a Threads style application, the details are in the given 1B. Project Proposal.md file"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Community Data (Priority: P1)

As a product owner, I want the database to store user accounts, profiles, posts, comments, and reactions in a consistent structure so that the application can support the main discussion experience end to end.

**Why this priority**: This is the foundation of the application. Without a reliable core content model, no other feature can function.

**Independent Test**: Create one user, one post, one comment, and one reaction, then verify each record can be linked back to the correct owner and parent content without ambiguity.

**Acceptance Scenarios**:

1. **Given** a new registered user, **When** they create a profile and publish a post, **Then** the database stores the account, profile, and post as separate but related records.
2. **Given** an existing post, **When** a user comments on it or likes it, **Then** the database records the interaction and links it to the correct user and post.

---

### User Story 2 - Roles and Ownership Rules (Priority: P2)

As a moderator or administrator, I want user roles and content ownership to be stored clearly so that permissions can be enforced consistently across the application.

**Why this priority**: The proposal defines distinct user roles, and the schema must preserve those distinctions before moderation and admin workflows can work safely.

**Independent Test**: Change a user from Standard User to Moderator, then verify the same account retains ownership of its content while gaining the new role state.

**Acceptance Scenarios**:

1. **Given** a standard account, **When** an administrator assigns a moderator role, **Then** the account's role history and current role are both represented without losing ownership of existing content.
2. **Given** a piece of content, **When** a different user attempts to claim it, **Then** the stored ownership remains tied to the original creator.

---

### User Story 3 - Reporting and AI Support Data (Priority: P3)

As a moderator or administrator, I want reports, moderation decisions, and post summaries to be stored with clear status information so that unsafe content and AI-generated overviews can be managed reliably.

**Why this priority**: These records support moderation and summarization, which are important but depend on the core social data model already existing.

**Independent Test**: Create a report for a post and attach a summary record to the same post, then verify both records remain available with their current status and relationship history.

**Acceptance Scenarios**:

1. **Given** a reported post, **When** a moderator reviews it, **Then** the database can store the report outcome and any escalation to an administrator.
2. **Given** a post with a generated summary, **When** the summary is refreshed or replaced, **Then** the database keeps the current summary state linked to the original post.

---

### Edge Cases

- A user likes the same post more than once.
- A post or comment is removed after it has already received reactions or reports.
- A report is filed against content that is later deleted or hidden.
- A user's role changes after they have already created posts, comments, or reports.
- A summary is requested for content that is too short or has no meaningful body text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The schema MUST store user account identity data separately from public profile data.
- **FR-002**: The schema MUST store posts as first-class records that are linked to exactly one creating user.
- **FR-003**: The schema MUST store comments as records that are linked to a parent post and the user who created them.
- **FR-004**: The schema MUST store reactions such as likes in a way that prevents duplicate reactions by the same user on the same target.
- **FR-005**: The schema MUST store the four user roles defined in the proposal and preserve role changes over time.
- **FR-006**: The schema MUST store content ownership so that the original creator of each post or comment can always be identified.
- **FR-007**: The schema MUST store user reports with a report subject, a reason, a status, and the reporting user.
- **FR-008**: The schema MUST store moderation review outcomes and escalation history for reported content.
- **FR-009**: The schema MUST store AI-generated post summary records linked to the original post and their current availability state.
- **FR-010**: The schema MUST preserve enough information to support search, discovery, and trend-based feed ranking from stored content and engagement history.
- **FR-011**: The schema MUST support content lifecycle states needed for normal deletion, moderation removal, and administrative removal.

### Key Entities *(include if feature involves data)*

- **User Account**: The authenticated identity for a person using the application, including role and account status.
- **Profile**: Public-facing user information such as display name, bio, and avatar references.
- **Post**: A top-level discussion entry created by a user.
- **Comment**: A response attached to a post, optionally representing threaded discussion structure.
- **Reaction**: A like or similar engagement action made by a user on a post or comment.
- **Report**: A moderation record created when a user flags content or another user.
- **Moderation Review**: The decision record describing how a report was handled and whether it was escalated.
- **Role History**: The record of role assignment changes for accounts that move between guest, standard user, moderator, and administrator.
- **Post Summary**: The stored record for an AI-generated TL;DR summary attached to a post.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A review dataset can create and link a user account, profile, post, comment, reaction, report, moderation review, role change, and post summary with zero orphaned records.
- **SC-002**: 100% of the functional groups named in the proposal have a corresponding persistent entity or relationship in the schema.
- **SC-003**: In a schema walkthrough with 10 representative scenarios, reviewers can identify the owner, current role, moderation state, and summary state for each record without needing external notes.
- **SC-004**: The schema can represent at least 1,000,000 posts, 10,000,000 comments, and 100,000,000 reactions without changing the entity model.
- **SC-005**: At least 95% of reviewed edge cases for duplicate reactions, deleted content, reports on removed content, and role changes are resolved by the schema rules without ambiguity.

## Assumptions

- Users access the application only through the web, as described in the proposal.
- Guests can read content but do not create persisted engagement or moderation records.
- Comment replies may need to support threaded discussion structure, so the schema is expected to keep that option open.
- Content deletion and moderation removal should preserve enough history for audit and reporting.
- AI summarization is stored as a separate summary record so the original post remains unchanged.
- Search and trend ranking will rely on stored content, timestamps, and engagement history rather than hidden manual curation.
