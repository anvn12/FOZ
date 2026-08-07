# Data Model & Schema Specifications: Search Discovery Widgets & Input Fixes

**Feature Branch**: `017-fix-search-widgets`

## Data Structures & DTOs

### 1. DiscoveryResponse DTO

Represents the combined search discovery payload returned by the backend for initial search page view.

```typescript
export interface SearchDiscoveryResponse {
  topics: Array<{
    id: string;
    name: string;
    tag: string;
    postCount?: number;
  }>;
  creators: Array<{
    id: string;
    userAccountId: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
  }>;
  discussions: Array<{
    id: string;
    authorId: string;
    authorName: string;
    authorHandle: string;
    authorAvatarUrl: string | null;
    content: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
  }>;
}
```

### 2. Validation Schemas

Zod schemas for validating discovery endpoints and query parameters in `src/shared/schemas/search.ts`.

```typescript
import { z } from "zod";

export const SearchDiscoveryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

export const DiscoveryTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  tag: z.string(),
  postCount: z.number().optional(),
});

export const DiscoveryCreatorSchema = z.object({
  id: z.string(),
  userAccountId: z.string(),
  displayName: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export const DiscoveryDiscussionSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorHandle: z.string(),
  authorAvatarUrl: z.string().nullable(),
  content: z.string(),
  createdAt: z.string(),
  likeCount: z.number(),
  commentCount: z.number(),
});

export const SearchDiscoveryResponseSchema = z.object({
  topics: z.array(DiscoveryTopicSchema),
  creators: z.array(DiscoveryCreatorSchema),
  discussions: z.array(DiscoveryDiscussionSchema),
});
```

---

## Entity Relationships

- **Suggested Creator** ── (1:1) ──> **Profile** & **UserAccount** (`userAccounts.status = 'active'`)
- **Trending Discussion** ── (1:1) ──> **Post** (public, active) + **Profile** (Author) + **Likes Count** + **Comments Count**
- **Trending Topic** ── (1:N) ──> Extracted tags from **Posts**
