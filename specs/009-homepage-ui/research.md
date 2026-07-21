# Technical Research: Homepage UI Responsive Layout

## Decisions & Rationale

### 1. Responsive Layout Strategy (Mobile-First CSS Grid)
- **Decision**: Use Tailwind's responsive breakpoints (`md:`, `lg:`) to control the display grid.
  - Viewport < 768px (Mobile): Main feed takes 100% width, sidebars hidden. Top App Bar is `fixed`, Bottom Navigation is `fixed`.
  - Viewport >= 768px && < 1024px (Tablet): Left Sidebar becomes visible (`md:flex`), Right Sidebar remains hidden. Fixed bars are hidden.
  - Viewport >= 1024px (Desktop): Right Sidebar becomes visible (`lg:block`). Left Sidebar expands slightly.
- **Rationale**: Keeps responsive styling unified in a single HTML file template (mimicking `code.html` behavior) without using JavaScript viewport listeners, ensuring maximum CSS rendering speed.

### 2. Mobile Drawer Slide-Up Animation
- **Decision**: Implement the slide-up Bottom Navigation Drawer using standard Tailwind utility classes for absolute positioning, combined with local React state (`isOpen`).
  - Overlay: A backdrop cover (`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity`) that fades in.
  - Drawer Container: An absolute panel (`fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-surface rounded-t-2xl transform transition-transform duration-300`) translating on Y-axis (`translate-y-0` when open, `translate-y-full` when closed).
- **Rationale**: CSS transitions provide high performance (60fps) on mobile browsers, leveraging hardware acceleration for `transform` and `opacity` properties.

### 3. Dropdown Menu (Desktop) and Click Outside Dismissal
- **Decision**: Implement a custom React hook `useOutsideClick` or an inline ref click listener to dismiss the desktop "More" dropdown and the mobile drawer overlay when a user clicks outside the element boundary.
- **Rationale**: Ensures accessible and expected modal-dismissal UX behavior.

### 4. Compose Modal Overlay state
- **Decision**: Manage the visibility of `ComposeModal` using simple component state (`[isComposeOpen, setIsComposeOpen]`) passed as a prop from the HomePage context, rather than a global store.
- **Rationale**: Keeps component cohesion high and avoids unnecessary state storage complexity.

## Alternatives Considered

### Swapping Tailwind v4 for a Material Web Component library
- **Rejected**: The FOZ Constitution Principle V mandates styling exclusively via Tailwind CSS config. Installing third-party libraries (e.g., Radix, MUI) violates this and increases bundle size. Custom Tailwind-styled components are highly lightweight.

### Separate Desktop and Mobile Page Components
- **Rejected**: Creating separate components like `DesktopHomePage.tsx` and `MobileHomePage.tsx` increases code duplication. A unified markup utilizing CSS media queries fits standard responsive practices and is cleaner to maintain.
