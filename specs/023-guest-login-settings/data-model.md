# Data Model & State Specification: Guest Login & Settings Navigation Menu Fix

## State Representation

### 1. Navigation Menu State
- **Store Source**: `useAuthStore` (`src/frontend/src/stores/auth.ts`)
- **Key Fields**:
  - `user`: `User | null`
    - `null` -> Guest mode (Unauthenticated)
    - `User object` -> Authenticated user mode

### 2. Menu Item Action Configuration

| Menu Item | Visibility Condition | Action Handler | Target Route / Callback |
|-----------|----------------------|----------------|------------------------|
| **Log in** | `!user` (Guest only) | `navigate("/login")` | `/login` |
| **Settings** | Always visible (`true`) | `navigate("/settings")` | `/settings` |
| **Report a Problem** | Always visible (`true`) | `toast("Report feature coming soon")` | N/A |
| **Log out** | `user !== null` (Authenticated only) | `setIsLogoutOpen(true)` | Modal dialog |

## Component Interface Contracts

### `NavBar` Component
- **Props**: None (self-contained layout component)
- **Local State**:
  - `isMoreMenuOpen`: `boolean` (desktop dropdown menu toggle)
  - `isMobileDrawerOpen`: `boolean` (mobile dropdown menu toggle)
  - `isLogoutOpen`: `boolean` (logout confirmation modal toggle)
  - `isCreateOpen`: `boolean` (create post modal toggle)
