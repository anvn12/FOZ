# Data Model: Display Name Separate from Username

**Feature Branch**: `021-display-name` | **Date**: 2026-08-06

## Entity Relationship & Schema Changes

```
┌─────────────────────────────────────────────────────────┐
│                      user_accounts                      │
├─────────────────────────────────────────────────────────┤
│ id           : uuid (PK)                                │
│ email        : text (Unique, Lowercase)                 │
│ username     : text (NEW - Unique, Lowercase, Not Null) │
│ password_hash: text                                     │
│ role         : text (enum)                              │
│ status       : text (enum)                              │
│ created_at   : timestamp                                │
│ updated_at   : timestamp                                │
└────────────────────────────┬────────────────────────────┘
                             │ 1 : 1
                             ▼
┌─────────────────────────────────────────────────────────┐
│                        profiles                         │
├─────────────────────────────────────────────────────────┤
│ id             : uuid (PK)                              │
│ user_account_id: uuid (FK -> user_accounts.id)          │
│ display_name   : text (Mutable, Not Null)               │
│ bio            : text (Optional)                        │
│ avatar_url     : text (Optional)                        │
│ location       : text (Optional)                        │
│ website        : text (Optional)                        │
│ created_at     : timestamp                              │
│ updated_at     : timestamp                              │
└─────────────────────────────────────────────────────────┘
```

## Schema Definitions

### 1. `user_accounts` Table (`src/backend/db/schema/users.ts`)

| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `id` | `uuid` | Primary Key, Default Random | Unique account identifier |
| `email` | `text` | Not Null, Unique Index (lower) | Account email address |
| `username` | `text` | **NEW**: Not Null, Unique Index (lower) | Permanent handle (`@username`) |
| `passwordHash` | `text` | Not Null | Bcrypt password hash |
| `role` | `text` | Not Null, Enum | Account role (`guest`, `standard`, `moderator`, `administrator`) |
| `status` | `text` | Not Null, Enum | Account status (`active`, `suspended`, `banned`, `pending`) |
| `createdAt` | `timestamp` | Not Null, Default Now | Creation timestamp |
| `updatedAt` | `timestamp` | Not Null, Default Now | Update timestamp |

**Indexes**:
- `uniqueIndex("user_accounts_email_lower_idx").on(t.email)`
- **NEW**: `uniqueIndex("user_accounts_username_lower_idx").on(t.username)`

---

### 2. Validation & Business Rules

#### Username Constraints (`usernameSchema` in `src/shared/schemas/auth.ts`)
- **Format**: Lowercase letters (`a-z`), digits (`0-9`), underscores (`_`), periods (`.`).
- **Regex**: `/^[a-z0-9._]+$/`
- **Length**: Minimum 3 characters, Maximum 30 characters.
- **Uniqueness**: Case-insensitive uniqueness enforced in DB via `LOWER(username)` unique index.
- **Immutability**: Assigned at account creation (registration or OAuth); cannot be edited after account creation.
- **Reserved List**: `["admin", "administrator", "moderator", "mod", "api", "support", "root", "null", "undefined", "foz", "system", "help", "about", "settings", "terms", "privacy"]`

#### Display Name Constraints (`UpdateProfileRequest` in `src/shared/schemas/profile.ts`)
- **Format**: Unicode letters, numbers, spaces, dots, underscores, apostrophes, hyphens (`/^[\p{L}\p{M}\p{N}\s._'-]+$/u`).
- **Length**: Minimum 1 character, Maximum 50 characters.
- **Uniqueness**: Non-unique (multiple users may share the same display name).
- **Mutability**: Fully mutable at any time via Profile Settings.
