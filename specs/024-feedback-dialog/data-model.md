# Data Model & Component Specs: Feedback Menu Button & Dialog

## Component Interfaces & Data Structures

Since this feature is a client-side UI modal interaction without backend persistence, the data model represents frontend component props and transient UI state.

### `FeedbackDialogProps`

```typescript
export interface FeedbackDialogProps {
  /** Controls whether the feedback modal dialog is visible */
  open: boolean;
  /** Callback fired when the user requests to close the dialog */
  onClose: () => void;
}
```

### Component State & Constants

| Identifier | Type | Scope | Description |
|------------|------|-------|-------------|
| `SUPPORT_EMAIL` | `string` (constant) | Module | Constant set to `"support@foz.com"` |
| `copied` | `boolean` | Component Local State | Transient indicator for button feedback state (resets after 2000ms) |

### Navigation Menu Item State

In `src/frontend/src/components/NavBar.tsx`:

| State Variable | Type | Default | Description |
|----------------|------|---------|-------------|
| `isFeedbackOpen` | `boolean` | `false` | Controls opening/closing of `FeedbackDialog` |
