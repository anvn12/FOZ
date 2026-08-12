# UI Component Contract: Feedback Dialog

## 1. Component Signature

```typescript
// Location: src/frontend/src/components/FeedbackDialog.tsx

export function FeedbackDialog(props: {
  open: boolean;
  onClose: () => void;
}): JSX.Element | null;
```

## 2. Behavioral Contract

1. **Visibility**:
   - If `open` is `false`, the component returns `null` (renders nothing).
   - If `open` is `true`, renders a full-viewport fixed overlay (`fixed inset-0 z-50 flex items-center justify-center bg-tertiary/40 backdrop-blur-xl`).

2. **User Interactions**:
   - **Backdrop Click**: Clicking the backdrop container triggers `onClose()`.
   - **Modal Container Click**: Clicking inside the modal dialog stops propagation (`e.stopPropagation()`).
   - **Escape Key**: Pressing `Escape` key while open triggers `onClose()`.
   - **Close Icon / Button**: Clicking the header close icon or footer close button triggers `onClose()`.
   - **Copy Email Button**: Clicking copies `support@foz.com` to `navigator.clipboard`, displays toast (`"Email copied to clipboard!"`), and sets `copied` state to `true` for 2 seconds.
   - **Send Email Link**: Clicking opens `mailto:support@foz.com`.

3. **Menu Item Contract (`NavBar.tsx`)**:
   - Menu item label: `"Feedback"` (replacing `"Report a Problem"`).
   - Menu item icon: `MessageSquare` or `Mail`.
   - Menu item click handler: triggers `setIsFeedbackOpen(true)` and closes dropdown menu (`setIsMoreMenuOpen(false)`).
