# Data Model: Threads-Style Community Database Schema

## Entities

### UserAccount
- Purpose: Stores authentication identity and account status.
- Key fields: id, email or login identifier, password hash reference, role, account status, createdAt, updatedAt.
- Relationships: Owns one profile; owns many posts, comments, reactions, reports, and role history records.

### Profile
- Purpose: Stores public-facing user details.
- Key fields: id, userAccountId, displayName, bio, avatarUrl, location, website, createdAt, updatedAt.
- Relationships: Belongs to exactly one user account.

### Post
- Purpose: Stores top-level discussion content.
- Key fields: id, authorId, body, visibility state, lifecycle state, createdAt, updatedAt, deletedAt.
- Relationships: Belongs to one user account; has many comments, reactions, reports, and summaries.

### Comment
- Purpose: Stores responses on posts and optionally threaded replies.
- Key fields: id, postId, authorId, parentCommentId, body, lifecycle state, createdAt, updatedAt, deletedAt.
- Relationships: Belongs to one post and one author; may reference a parent comment.

### Reaction
- Purpose: Stores likes or similar engagement actions.
- Key fields: id, userAccountId, targetType, targetId, reactionType, createdAt.
- Relationships: Belongs to one user account and one target content item.
- Validation rule: A user may create at most one reaction of a given type per target.

### Report
- Purpose: Stores moderation reports submitted by users.
- Key fields: id, reporterId, subjectType, subjectId, reason, status, createdAt, updatedAt.
- Relationships: Belongs to one reporting user and one reported subject.

### ModerationReview
- Purpose: Stores moderator review and escalation history.
- Key fields: id, reportId, reviewedBy, outcome, escalationState, notes, reviewedAt, escalatedAt, createdAt, updatedAt.
- Relationships: Belongs to one report and one reviewing moderator or administrator.

### RoleHistory
- Purpose: Stores changes to a user's role over time.
- Key fields: id, userAccountId, previousRole, newRole, changedBy, changedAt, reason.
- Relationships: Belongs to one user account and one actor who made the change.

### PostSummary
- Purpose: Stores AI-generated TL;DR summaries.
- Key fields: id, postId, summaryText, providerName, summaryState, createdAt, updatedAt, refreshedAt.
- Relationships: Belongs to one post.

## Relationships

- One user account owns one profile.
- One user account can create many posts, comments, reactions, reports, and role history entries.
- One post can have many comments, reactions, reports, and summaries.
- One comment belongs to one post and may optionally belong to another comment.
- One report can produce one or more moderation review records over time if escalation occurs.
- One user account can have many role history entries but only one current role value.

## Validation Rules

- User account identity must be unique and stable.
- A post must always have exactly one author.
- A comment must always belong to a post.
- A reaction must not be duplicated by the same user on the same target and reaction type.
- A report must always identify both the reporting user and the reported subject.
- A moderation review must always reference a report and a reviewer.
- A role history entry must always capture both the previous and new role values.
- A post summary must always reference the source post and its current summary state.

## State Notes

- Lifecycle states should allow content to be created, visible, hidden, removed by moderation, or removed by administration.
- Report states should allow submission, review, escalation, dismissal, and closure.
- Summary states should allow pending, available, hidden, failed, or refreshed conditions.
- Role history should preserve every assignment change so the current role can be reconstructed from stored data.
- Reactions should stay unique per user-target-kind combination so duplicate likes do not create ambiguity.
