# Technical Research: Homepage UI Responsive Layout

## Decisions & Rationale

### 1. Responsive Layout Strategy (Mobile-First Centered Layout)
- **Decision**: Use Tailwind's responsive layout tools to support two primary views:
  - Viewport < 768px (Mobile): Main feed takes 100% width, Left Sidebar hidden. Top App Bar is `fixed`, Bottom Navigation is `fixed`.
  - Viewport >= 768px (Desktop/Tablet): Left Sidebar is visible (`fixed left-0 w-24`). Right Sidebar is removed completely. The Main Feed is centered inside the remaining screen space. This is achieved by placing `<main>` inside a `flex justify-center` wrapper with `md:pl-24` padding to prevent overlapping the fixed sidebar.
- **Rationale**: Keeps responsive layout simple, centered, and visually balanced on all viewports without requiring custom grid calculations or JavaScript resize listeners.

### 2. Mobile Drawer Slide-Up Animation
- **Decision**: Implement the slide-up Bottom Navigation Drawer using standard Tailwind utility classes for absolute positioning, combined with local React state (`isOpen`).
  - Overlay: A backdrop cover (`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity`) that fades in.
  - Drawer Container: An absolute panel (`fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-surface rounded-t-2xl transform transition-transform duration-300`) translating on Y-axis (`translate-y-0` when open, `translate-y-full` when closed).
- **Rationale**: CSS transitions provide high performance (60fps) on mobile browsers, leveraging hardware acceleration for `transform` and `opacity` properties.

### 3. Dropdown Menu (Desktop) and Click Outside Dismissal
- **Decision**: Implement a custom React hook `useOutsideClick` or an inline ref click listener to dismiss the desktop "More" dropdown and the mobile drawer overlay when a user clicks outside the element boundary.
- **Rationale**: Ensures accessible and expected modal-dismissal UX behavior.

### 4. Decommitting Compose Modal for Toast Notification Placeholder
- **Decision**: The specifications mandate that the "Create" button displays a `"Post creation coming soon"` toast notification rather than opening a dialog. Therefore, the `ComposeModal` component is decommitted and removed from `HomePage.tsx`.
- **Rationale**: Reduces client-side complexity, bundle size, and potential bugs for an out-of-scope feature.

## Alternatives Considered

### Swapping Tailwind v4 for a Material Web Component library
- **Rejected**: The FOZ Constitution Principle V mandates styling exclusively via Tailwind CSS config. Installing third-party libraries (e.g., Radix, MUI) violates this and increases bundle size. Custom Tailwind-styled components are highly lightweight.

### Centering Feed on the Entire Viewport (Ignoring Sidebar Width)
- **Rejected**: If the main feed is centered on the absolute viewport width on medium/tablet viewports, it overlaps with the left navigation sidebar. Adding `md:pl-24` padding ensures centering is relative to the remaining screen space, preventing overlap.
