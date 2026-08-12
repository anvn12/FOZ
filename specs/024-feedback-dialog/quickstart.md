# Quickstart: Feedback Menu Button & Dialog

## Overview
This feature replaces the "Report a Problem" option in the navigation menu with a "Feedback" option that opens an instructional dialog guiding users to contact support at `support@foz.com`.

## Verification Steps

### 1. Run Automated Component Tests

Run Vitest in the frontend package to verify component rendering, menu item replacement, modal trigger, copy button interaction, and dismissal:

```bash
npx vitest run src/frontend/src/components/__tests__/NavBar.test.tsx src/frontend/src/components/__tests__/FeedbackDialog.test.tsx
```

### 2. Manual Verification in Browser

1. Start the frontend development server:
   ```bash
   npm --prefix src/frontend run dev
   ```
2. Open the web app in your browser (e.g. `http://localhost:5173`).
3. Click on the "More" navigation menu (or side menu on mobile).
4. Verify that "Report a Problem" has been replaced by "Feedback".
5. Click "Feedback". Verify the feedback dialog opens with:
   - Clear instructional text directing users to contact email.
   - Interactive `mailto:support@foz.com` email link.
   - "Copy Email Address" button.
6. Click "Copy Email Address" and verify toast notification appears ("Email copied to clipboard!").
7. Dismiss the dialog via close button, backdrop click, or `Escape` key.
