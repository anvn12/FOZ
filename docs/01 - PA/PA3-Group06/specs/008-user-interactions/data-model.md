# Data Model: User Interactions

## Entities

### Post

- **Purpose**: A root discussion item created by a user.
- **Key Fields**:
  - `id`: unique identifier
  - `authorId`: user who created the post
  - `body`: post text content
  - `visibilityState`: public or hidden
  - `lifecycleState`: active, hidden, removed_by_moderation, or removed_by_administration
  - `createdAt`, `updatedAt`, `deletedAt`: lifecycle timestamps
- **Relationships**:
  - One post has many comments.
  - One post has many reactions.
- **Validation Rules**:
  - Body text must be non-empty after trimming.
  - Deleted posts must not remain publicly visible.

### Comment

- **Purpose**: A response attached to a post or another comment.
- **Key Fields**:
  - `id`: unique identifier
  - `postId`: owning post
  - `authorId`: user who created the comment
  - `parentCommentId`: optional parent comment for replies
  - `body`: comment text content
  - `visibilityState`: public or hidden
  - `lifecycleState`: active, hidden, removed_by_moderation, or removed_by_administration
  - `createdAt`, `updatedAt`, `deletedAt`: lifecycle timestamps
- **Relationships**:
  - Many comments belong to one post.
  - A comment may reply to another comment.
  - One comment has many reactions.
- **Validation Rules**:
  - Body text must be non-empty after trimming.
  - `parentCommentId`, when present, must belong to the same post.
  - Users may edit or delete only their own comments.

### Reaction

- **Purpose**: A binary like state applied by a user to a post or comment.
- **Key Fields**:
  - `id`: unique identifier
  - `userId`: user who reacted
  - `targetType`: post or comment
  - `targetId`: ID of the post or comment being liked
  - `kind`: like
  - `active`: whether the reaction is currently applied
  - `createdAt`, `updatedAt`
- **Relationships**:
  - One user may have at most one active reaction per target.
- **Validation Rules**:
  - Target must exist and be visible.
  - Reactions must be idempotent for the same user/target combination.

## State Transitions

- **Post**: active -> hidden/removed -> no further interactions.
- **Comment**: active -> hidden/removed -> no further edits, deletes, or replies.
- **Reaction**: active -> inactive on unlike, or removed with the target content.

## Integrity Rules

- Deleting a post hides its descendant comments and reactions from public view.
- Editing a post or comment does not create a new entity; it updates the existing record.
- Likes must be counted from active reactions only.