# Phase 0 Research: Feedback Menu Button & Dialog

## Research Topics & Decisions

### 1. Modal Component Architecture & Styling Pattern

- **Decision**: Create a dedicated React component `FeedbackDialog.tsx` in `src/frontend/src/components/` following existing modal patterns (`LogoutDialog.tsx`, `GuestLoginModal.tsx`).
- **Rationale**: Reusing existing styling tokens (`bg-tertiary/40 backdrop-blur-xl`, `bg-surface-container-lowest`, `animate-foz-pop`) maintains consistent visual aesthetics and WCAG 2.1 AA accessibility standards without introducing third-party modal libraries (per Constitution Principle II & V).
- **Alternatives Considered**:
  - Browser `alert()` / `prompt()`: Rejected due to poor UX and non-compliance with design system standards.
  - Third-party modal library (e.g. Headless UI): Rejected because FOZ uses custom styled components built with Tailwind CSS and React state.

---

### 2. Clipboard Copy & Mailto Link Integration

- **Decision**: Provide both a `mailto:support@foz.com` link and a "Copy Email Address" button powered by `navigator.clipboard.writeText("support@foz.com")`, displaying visual confirmation via `react-hot-toast`.
- **Rationale**: 
  - `mailto:` links seamlessly trigger desktop/mobile mail applications (Apple Mail, Outlook desktop, default mail client).
  - "Copy Email" button accommodates users who use webmail clients (Gmail, Outlook.com) in browser tabs.
  - `react-hot-toast` is already the binding toast notification library specified in the project constitution.
- **Alternatives Considered**:
  - In-app feedback form submitting to backend API: Rejected because spec explicit scope is instructing users to contact via email.
  - Plain unclickable text: Rejected because it increases friction and risks typos when users retype email addresses.

---

### 3. Navigation Menu Integration

- **Decision**: Update `src/frontend/src/components/NavBar.tsx` to replace the "Report a Problem" item with "Feedback" using a relevant icon (e.g., `MessageSquare` or `Mail` from `lucide-react`).
- **Rationale**: Directly satisfies the user prompt and spec requirements across both desktop and mobile navigation drawers in `NavBar.tsx`.
