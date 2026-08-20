# Data Model & Fixture Schema: Test Databases

**Feature Branch**: `025-test-databases`
**Date**: 2026-08-17
**Spec**: [spec.md](./spec.md)

## 1. Test Database Inventory

| Database Name | Purpose | Target Volume | Primary Roles |
|---|---|---|---|
| `foz_test_empty` | Clean-slate testing, empty state UI, onboarding flows | 0 posts, 0 comments, 0 reactions, 0 reports | Admin, Moderator |
| `foz_test_populated` | High-density fixture testing, feed pagination, interactions | 50 users, 100+ posts, comments, replies, reposts, likes, reports | Admin, Moderator, Standard Users |

---

## 2. Seeded Accounts & Credentials

### Administrative Accounts (Present in BOTH `foz_test_empty` and `foz_test_populated`)

| Email | Username | Password | Role | Status | Display Name |
|---|---|---|---|---|---|
| `admin@admin.foz` | `admin` | `admin@admin.foz` | `admin` | `active` | `FOZ Administrator` |
| `mod@mod.foz` | `moderator` | `mod@mod.foz` | `moderator` | `active` | `FOZ Moderator` |

### Synthetic Standard User Accounts (Present in `foz_test_populated`)

| Pattern | Range | Password | Role | Status | Profile Characteristics |
|---|---|---|---|---|---|
| `user{N}@foz.test` | `N = 1..50` | `password123` | `user` | `active` | Unique usernames (`user_1`..`user_50`), display names, varied avatar URLs, bios, websites |

---

## 3. Entity Schemas & Relational Mapping

### User Accounts (`user_accounts`)
- `id`: UUID (Primary Key, deterministic)
- `email`: Text (Unique, lowercase)
- `username`: Text (Unique, lowercase)
- `passwordHash`: Text (bcrypt hash of password at cost 4)
- `role`: Text (`"admin"` | `"moderator"` | `"user"`)
- `status`: Text (`"active"`)
- `createdAt`: Timestamp with timezone
- `updatedAt`: Timestamp with timezone

### Profiles (`profiles`)
- `id`: UUID (Primary Key)
- `userAccountId`: UUID (Foreign Key -> `user_accounts.id`, Cascade)
- `displayName`: Text
- `bio`: Text (varied community bios)
- `avatarUrl`: Text (placeholder avatars)
- `location`: Text (optional location strings)
- `website`: Text (optional website URLs)

### Posts (`posts`)
- `id`: UUID (Primary Key)
- `authorId`: UUID (Foreign Key -> `user_accounts.id`, Restrict)
- `content`: Text (thread text, discussions, markdown formatting, hashtags)
- `parentId`: UUID (Nullable, Foreign Key -> `posts.id`, Cascade - used for top-level post threads)
- `repostOfId`: UUID (Nullable, Foreign Key -> `posts.id`, Cascade - used for reposts)
- `visibilityState`: Text (`"public"`)
- `lifecycleState`: Text (`"published"`)
- `createdAt`: Timestamp with timezone (distributed over the last 30 days)
- `updatedAt`: Timestamp with timezone

### Comments & Threaded Replies (`comments`)
- `id`: UUID (Primary Key)
- `postId`: UUID (Foreign Key -> `posts.id`, Cascade)
- `authorId`: UUID (Foreign Key -> `user_accounts.id`, Restrict)
- `parentCommentId`: UUID (Nullable, Foreign Key -> `comments.id`, Cascade - for nested reply trees)
- `body`: Text (comment text)
- `visibilityState`: Text (`"public"`)
- `lifecycleState`: Text (`"published"`)
- `createdAt`: Timestamp with timezone (timestamped after parent post)

### Reactions (`reactions`)
- `id`: UUID (Primary Key)
- `userAccountId`: UUID (Foreign Key -> `user_accounts.id`, Cascade)
- `targetType`: Text (`"post"` | `"comment"`)
- `targetId`: UUID (Target post or comment ID)
- `reactionKind`: Text (`"like"`)
- `createdAt`: Timestamp with timezone

### Hashtags & Post-Hashtags (`hashtags`, `post_hashtags`)
- `hashtags.id`: UUID (Primary Key)
- `hashtags.name`: Text (e.g. `tech`, `announcement`, `general`, `foz`, `design`)
- `hashtags.displayName`: Text (`tech`, `announcement`, etc.)
- `post_hashtags.postId`: UUID (Foreign Key -> `posts.id`, Cascade)
- `post_hashtags.hashtagId`: UUID (Foreign Key -> `hashtags.id`, Cascade)

### Moderation Reports (`reports`)
- `id`: UUID (Primary Key)
- `reporterId`: UUID (Foreign Key -> `user_accounts.id`)
- `targetType`: Text (`"post"` | `"user"`)
- `targetId`: UUID (ID of reported post or user)
- `reasonType`: Text (`"spam"` | `"harassment"` | `"hate_speech"` | `"misinformation"` | `"other"`)
- `details`: Text
- `status`: Text (`"open"` | `"dismissed"` | `"resolved"`)

---

## 4. Populated Dataset Volume & Distribution Summary

```
Total Users: 52 (1 Admin + 1 Moderator + 50 Standard Users)
Total Posts: 100
  ├── Root Posts: ~85
  └── Reposts: ~15
Total Comments: ~150
  ├── Top-Level Comments: ~100
  └── Nested Replies (depth 1..3): ~50
Total Reactions (Likes): ~300 distributed across posts and comments
Total Hashtags: ~10 unique hashtags mapped to ~60 posts
Total Moderation Reports: ~10 sample reports (open and resolved)
```
