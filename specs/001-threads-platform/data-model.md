# Data Model: Threads Platform — Core MVP

**Phase**: 1 | **Date**: 2026-06-04 | **Research**: [research.md](./research.md)

All entities derive directly from the Key Entities section in the spec. Prisma
schema syntax is used as the canonical representation.

---

## Entity Relationship Overview

```
User (5 predefined)
  │
  ├── authored ──────► Thread (0..*)
  │                       │
  │                       ├── has ──────► Reply (0..*)
  │                       │                   │
  │                       │                   └── liked by ─► Like (userId + replyId)
  │                       │
  │                       └── liked by ──► Like (userId + threadId)
  │
  ├── follows ─────────► Follow (followerId + followingId)
  │
  └── is followed by ──► Follow
```

---

## Entities

### User

Predefined at seed time. No creation endpoint. Five instances only.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | PK, UUID, unique | Stable identifier used as author/session ref |
| name | String | Not null | Display name |
| avatarUrl | String | Not null | Path to avatar image (bundled asset) |
| createdAt | DateTime | Not null, default now() | |

**Seed data**: 5 users pre-populated via `prisma/seed.ts`.

**Relationships**:
- Has many `Thread` (authored)
- Has many `Reply` (authored)
- Has many `Like` (given)
- Has many `Follow` as follower
- Has many `Follow` as following

---

### Thread

Top-level post. Supports text + optional single image.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | PK, UUID, default cuid() | |
| authorId | String | FK → User.id, not null | Recorded at creation; ownership signal |
| content | String | Not null, max 500 chars | Validated server-side before insert |
| imageUrl | String? | Nullable | Relative URL `/uploads/<filename>` or null |
| likeCount | Int | Not null, default 0 | Denormalized; updated on Like create/delete |
| replyCount | Int | Not null, default 0 | Denormalized; updated on Reply create/delete |
| createdAt | DateTime | Not null, default now() | Feed ordering key |

**Validation rules**:
- `content` MUST be 1–500 characters.
- `content` OR `imageUrl` MUST be present (both absent → reject).
- `likeCount` and `replyCount` MUST NOT go below 0.

**Relationships**:
- Belongs to `User` (author)
- Has many `Reply`
- Has many `Like`

**State transitions**:
- Created → exists in feed
- Deleted → cascade deletes all `Reply` and `Like` records for this thread

---

### Reply

One-level-deep response to a Thread. No nested replies.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | PK, UUID, default cuid() | |
| threadId | String | FK → Thread.id, not null | Parent thread |
| authorId | String | FK → User.id, not null | Recorded at creation; ownership signal |
| content | String | Not null, max 500 chars | Same limit as Thread for consistency |
| likeCount | Int | Not null, default 0 | Denormalized |
| createdAt | DateTime | Not null, default now() | Display ordering within thread |

**Validation rules**:
- `content` MUST be 1–500 characters.
- `threadId` MUST reference an existing, non-deleted Thread.

**Relationships**:
- Belongs to `Thread`
- Belongs to `User` (author)
- Has many `Like`

**State transitions**:
- Created → decrements parent Thread.replyCount is never needed; replyCount increments on creation
- Deleted → cascade deletes all `Like` records for this reply; decrements Thread.replyCount

---

### Like

Represents a user's like on either a Thread or a Reply. Exactly one of
`threadId` or `replyId` is set on each row (polymorphic, enforced by constraint).

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | PK, UUID, default cuid() | |
| userId | String | FK → User.id, not null | Acting user |
| threadId | String? | FK → Thread.id, nullable | Set when liking a thread |
| replyId | String? | FK → Reply.id, nullable | Set when liking a reply |
| createdAt | DateTime | Not null, default now() | |

**Constraints**:
- `UNIQUE(userId, threadId)` — one like per user per thread.
- `UNIQUE(userId, replyId)` — one like per user per reply.
- Exactly one of `threadId` / `replyId` must be non-null (enforced in service layer).

**On create**: increment `likeCount` on the parent Thread or Reply.
**On delete**: decrement `likeCount` on the parent Thread or Reply.

**Note**: Self-likes allowed (userId == thread.authorId is valid per spec Q2 clarification).

---

### Follow

Directional relationship: follower follows following.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | PK, UUID, default cuid() | |
| followerId | String | FK → User.id, not null | The user who follows |
| followingId | String | FK → User.id, not null | The user being followed |
| createdAt | DateTime | Not null, default now() | |

**Constraints**:
- `UNIQUE(followerId, followingId)` — no duplicate follow relationships.
- `followerId != followingId` enforced in service layer (self-follow not allowed; not addressed in spec, sensible default).

---

## Prisma Schema (Canonical)

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  name      String
  avatarUrl String
  createdAt DateTime @default(now())

  threads   Thread[]
  replies   Reply[]
  likes     Like[]
  following Follow[] @relation("follower")
  followers Follow[] @relation("following")
}

model Thread {
  id         String   @id @default(cuid())
  authorId   String
  content    String   @db.NVarChar(500)
  imageUrl   String?
  likeCount  Int      @default(0)
  replyCount Int      @default(0)
  createdAt  DateTime @default(now())

  author  User    @relation(fields: [authorId], references: [id])
  replies Reply[]
  likes   Like[]
}

model Reply {
  id        String   @id @default(cuid())
  threadId  String
  authorId  String
  content   String   @db.NVarChar(500)
  likeCount Int      @default(0)
  createdAt DateTime @default(now())

  thread Thread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  author User   @relation(fields: [authorId], references: [id])
  likes  Like[]
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  threadId  String?
  replyId   String?
  createdAt DateTime @default(now())

  user   User    @relation(fields: [userId], references: [id])
  thread Thread? @relation(fields: [threadId], references: [id], onDelete: Cascade)
  reply  Reply?  @relation(fields: [replyId], references: [id], onDelete: Cascade)

  @@unique([userId, threadId])
  @@unique([userId, replyId])
}

model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("follower",  fields: [followerId],  references: [id])
  following User @relation("following", fields: [followingId], references: [id])

  @@unique([followerId, followingId])
}
```

---

## Denormalization Notes

`likeCount` and `replyCount` are stored directly on Thread and Reply rather
than computed via COUNT queries. This trades write complexity (update the count
on every like/reply mutation) for read performance (feed queries return counts
without joins). Given the prototype scope and Socket.io count-update events,
this pattern is straightforward and appropriate.

---

## Seed Data Scope

`prisma/seed.ts` MUST create:
- 5 User records with distinct names and avatar URLs
- At least 15 Thread records distributed across all 5 users
- At least 10 Reply records spread across multiple threads
- A representative set of Like records (mix of thread likes and reply likes)
- A representative set of Follow records (not all users follow all users)
