# Data Model: Social Login via Google and Facebook

**Feature Branch**: `019-social-login`
**Date**: 2026-08-06

## Database Entities

### 1. Existing `users` Table (Referenced)

Represents user accounts within the system.

- `id`: UUID (Primary Key, default `gen_random_uuid()`)
- `email`: VARCHAR(255) (Unique, Not Null)
- `username`: VARCHAR(50) (Unique, Not Null)
- `display_name`: VARCHAR(100) (Not Null)
- `avatar_url`: TEXT (Nullable)
- `password_hash`: TEXT (Nullable for social-only accounts)
- `created_at`: TIMESTAMP (Default `now()`)
- `updated_at`: TIMESTAMP (Default `now()`)

### 2. New `user_social_links` Table

Stores social identity provider linkages for user accounts.

```sql
CREATE TABLE IF NOT EXISTS user_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'google' | 'facebook'
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT uq_provider_user UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_user_social_links_user_id ON user_social_links(user_id);
```

## TypeScript / Zod Schemas (`src/shared/schemas/social-auth.ts`)

```typescript
import { z } from 'zod';

export const socialProviderEnum = z.enum(['google', 'facebook']);
export type SocialProvider = z.infer<typeof socialProviderEnum>;

export const socialAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
});

export const socialAuthResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});

export type SocialAuthResponse = z.infer<typeof socialAuthResponseSchema>;
```
