# Data Model & State Specifications: Login UI Redesign

## UI Component State & Data Shapes

### 1. AuthCredentials (Form State)
Represents the user input data bound to `react-hook-form` via `LoginRequest` Zod schema.

| Field | Type | Validation / Rules | Description |
|-------|------|-------------------|-------------|
| `email` | `string` | Valid email string or mobile identifier, non-empty | User email address or mobile number |
| `password` | `string` | Min 8 chars, non-empty | User account password |

### 2. CarouselSlide (UI Presentation Data)
Represents a card item in the desktop brand hero trending carousel.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"slide-1"` | Unique slide identifier |
| `tag` | `string` | `"Trending" \| "Market" \| "Community"` | Category badge label |
| `tagColor` | `string` | `"bg-tertiary" \| "bg-secondary" \| "bg-primary"` | Background color for pill badge |
| `timeAgo` | `string` | `"Just now" \| "2h ago" \| "5h ago"` | Publication relative time string |
| `headline` | `string` | `"Top 10 productivity hacks for 2024..."` | Summary text content for card |

### 3. CarouselState (Local Component State)

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `currentIndex` | `number` | `0` | Index of currently active slide |
| `isAutoPlaying` | `boolean` | `true` | Controls 5-second automatic slide progression |

## Validation Rules & Error States
- Empty Email/Password: Triggers Zod validation error below respective input field (`text-error` styling).
- Password Visibility: Toggled via `visible` boolean state in input component.
- API Authentication Failure: Handled by `onError` callback of `useLogin()`, displaying toast error.
