# Frontend State & Component Model: Homepage UI

This document outlines the state structure, properties, and components utilized for the FOZ Homepage UI.

## Zustand Auth Store Integration

The homepage queries state from the existing `useAuthStore` to check authentication:
- `user`: `User | null` (object representing standard authenticated user, e.g. `{ id, email }`).

## Component State Map

### 1. `HomePage.tsx`
- **Main Feed State**:
  - `posts`: Array of mock or database thread items.
- **Desktop Navigation Drawer**:
  - `isMoreMenuOpen`: `boolean` - Controls the floating dropdown above the "More" button in the Left Sidebar.
- **Mobile Navigation Drawer**:
  - `isMobileDrawerOpen`: `boolean` - Controls the slide-up drawer bottom-sheet.
- **Create Action State**:
  - Toast notification `"Post creation coming soon"` is triggered on clicking the "Create" button. No component state is required.

## Mock Data Shapes

```typescript
interface FeedPost {
  id: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  body: string;
  category?: string; // e.g. "Love Island USA"
  createdAt: string; // relative timestamp, e.g. "3h"
  likesCount: number;
  repliesCount: number;
  repostsCount: number;
  attachmentUrl?: string; // image post attachment
}
```
