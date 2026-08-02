# Data Model: Administrator Dashboard

**Feature**: `012-admin-dashboard`  
**Date**: 2026-08-02  

## Entity Definitions

### 1. AdminAuditLog (`admin_audit_logs`)
Represents an immutable record of a moderation or administrative action.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | Primary Key, Default `gen_random_uuid()` | Unique log entry identifier |
| `actorId` | `varchar(255)` | Not Null, FK → `users.id` | User ID of Admin or Moderator performing action |
| `actorName` | `varchar(255)` | Not Null | Display name/handle at time of action |
| `actorRole` | `varchar(50)` | Not Null | Role at time of action (`moderator`, `administrator`) |
| `actionType` | `varchar(100)` | Not Null | Enum: `ROLE_ASSIGN`, `ROLE_REVOKE`, `USER_DELETE`, `CONTENT_DELETE`, `REPORT_FORWARD`, `REPORT_DISMISS`, `CATEGORY_CREATE`, `CATEGORY_UPDATE`, `CATEGORY_DELETE`, `SETTING_UPDATE` |
| `targetType` | `varchar(50)` | Not Null | Enum: `USER`, `POST`, `COMMENT`, `CATEGORY`, `SYSTEM_SETTING` |
| `targetId` | `varchar(255)` | Not Null | Identifier of affected target entity |
| `rationale` | `text` | Nullable | Admin/Moderator notes or reason for action |
| `createdAt` | `timestamp` | Not Null, Default `now()` | Timestamp when action occurred |

**Indexes**:
- `idx_audit_actor_created`: `(actor_id, created_at DESC)`
- `idx_audit_action_created`: `(action_type, created_at DESC)`

---

### 2. ForumCategory (`forum_categories`)
Represents a discussion category in the forum.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | Primary Key, Default `gen_random_uuid()` | Category unique identifier |
| `name` | `varchar(100)` | Not Null, Unique | Category display title |
| `slug` | `varchar(100)` | Not Null, Unique | URL-friendly category slug |
| `description` | `text` | Nullable | Category description |
| `displayOrder` | `integer` | Not Null, Default `0` | Sequence order in forum navigation |
| `isArchived` | `boolean` | Not Null, Default `false` | Whether category is archived |
| `allowNewPosts` | `boolean` | Not Null, Default `true` | Whether standard users can post in this category |
| `createdAt` | `timestamp` | Not Null, Default `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | Not Null, Default `now()` | Last modification timestamp |

**Indexes**:
- `idx_categories_order`: `(display_order ASC)`

---

### 3. SystemConfiguration (`system_settings`)
Represents a key-value store for global platform settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | `varchar(100)` | Primary Key | Configuration setting key (e.g. `allow_registration`, `ai_rate_limit`) |
| `value` | `text` | Not Null | JSON-encoded configuration value |
| `dataType` | `varchar(20)` | Not Null | `boolean`, `number`, `string`, `json` |
| `description` | `text` | Nullable | Human-readable explanation of setting |
| `lastUpdatedBy` | `varchar(255)` | Not Null, FK → `users.id` | Admin who last updated setting |
| `updatedAt` | `timestamp` | Not Null, Default `now()` | Last updated timestamp |

---

## Shared Zod Schemas (`src/shared/schemas/admin.ts`)

```typescript
import { z } from 'zod';

export const UserRoleEnum = z.enum(['guest', 'standard_user', 'moderator', 'administrator']);
export const AccountStatusEnum = z.enum(['active', 'warned', 'suspended', 'banned']);

export const AssignRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['standard_user', 'moderator']),
  rationale: z.string().min(3).max(500).optional(),
});

export const DeleteUserSchema = z.object({
  userId: z.string().min(1),
  rationale: z.string().min(5).max(1000),
});

export const CategoryCreateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  displayOrder: z.number().int().min(0).default(0),
  allowNewPosts: z.boolean().default(true),
});

export const CategoryDeleteSchema = z.object({
  targetCategoryId: z.string().uuid("Target category ID must be provided to reassign threads"),
});

export const UpdateSystemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.unknown())]),
  rationale: z.string().optional(),
});
```
