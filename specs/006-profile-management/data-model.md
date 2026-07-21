# Data Model: Profile Management

The profile management module relies on the existing `profiles` table defined in the user schema.

## Schema Definition

### 1. `profiles` Table
Stores public-facing user attributes. Mapped using Drizzle ORM in [users.ts](file:///d:/FOZ/src/backend/db/schema/users.ts).

| Field | TS/Drizzle Type | DB Type | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` (UUID) | `UUID` | Primary Key, Default Random | Unique profile identifier. |
| `userAccountId` | `string` (UUID) | `UUID` | Foreign Key (`user_accounts.id`), Cascade Delete, Not Null | Link to user account. |
| `displayName` | `string` | `TEXT` | Not Null, Length: 1-50 | The public name shown to users. |
| `bio` | `string \| null` | `TEXT` | Nullable, Max Length: 160 | Public user biography. |
| `avatarUrl` | `string \| null` | `TEXT` | Nullable | Stored as a Base64-encoded data URL string (e.g. `data:image/png;base64,...`). |
| `location` | `string \| null` | `TEXT` | Nullable, Max Length: 100 | Public physical location. |
| `website` | `string \| null` | `TEXT` | Nullable, Max Length: 200 | Public website URL. |
| `createdAt` | `Date` | `TIMESTAMP WITH TZ` | Default Now, Not Null | Row creation timestamp. |
| `updatedAt` | `Date` | `TIMESTAMP WITH TZ` | Default Now, Not Null | Row modification timestamp. |

### Indexes
- Index: `profiles_user_account_id_idx` on `userAccountId` for quick lookups when viewing a user's profile.

---

## Validation & Business Rules

1. **Display Name**:
   - Must be present (minimum 1 character after trimming).
   - Maximum length: 50 characters.
2. **Bio**:
   - Optional.
   - Maximum length: 160 characters.
3. **Location**:
   - Optional.
   - Maximum length: 100 characters.
4. **Website**:
   - Optional.
   - Must be a valid URL format or empty. Normalization on input: prepend `https://` if format is `domain.com` without protocol.
   - Maximum length: 200 characters.
5. **Avatar**:
   - Optional.
   - Must be a valid Base64 data URL matching regular expression: `^data:image/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$`
   - Encoded Base64 payload length must correspond to a binary file size of at most 2MB (approx 2,728,000 characters).
