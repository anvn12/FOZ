---
name: Nexus Admin
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#1e1200'
  on-tertiary: '#ffffff'
  tertiary-container: '#35260c'
  on-tertiary-container: '#a38c6a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#fadfb8'
  tertiary-fixed-dim: '#ddc39d'
  on-tertiary-fixed: '#271902'
  on-tertiary-fixed-variant: '#564427'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  status-critical: '#E11D48'
  status-warning: '#F59E0B'
  status-success: '#10B981'
  status-info: '#0EA5E9'
  border-subtle: '#E2E8F0'
  surface-elevated: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 1rem
  margin-page: 2rem
  stack-xs: 0.25rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
---

## Brand & Style

The design system is engineered for high-stakes moderation and administrative oversight. It prioritizes **efficiency, authority, and clarity**. The visual language is rooted in **Modern Corporate** aesthetics, utilizing a structured, data-dense approach to manage complex information without cognitive overload.

The system evokes a sense of security and systematic control. It avoids decorative flourishes in favor of utility, using whitespace not just for "breathing room" but as a functional separator between dense data sets. The target audience—moderators and administrators—requires a UI that facilitates rapid decision-making and high-frequency actions.

**Key Principles:**
- **Information Density:** Prioritizing vertical and horizontal space to maximize the visibility of reporting queues.
- **Visual Evidence:** Using clear containment and status indicators to distinguish between "pending," "actioned," and "critical" items.
- **Trustworthy Professionalism:** A sober, balanced palette that remains neutral until an action or alert requires immediate attention.

## Colors

The palette is anchored by "Nexus Slate" (Primary) and "Command Blue" (Secondary). The system defaults to a **Light Mode** to maintain high legibility during long moderation sessions, though it is architected for high-contrast accessibility.

- **Primary (#1E293B):** Used for deep-level navigation, primary headers, and text to establish a grounded, authoritative feel.
- **Secondary (#3B82F6):** Reserved for primary actions, active states, and focus indicators.
- **Neutral (#F8FAFC):** The foundational background color, providing a clean canvas for content containers.
- **Status Colors:** These are functionally non-negotiable. 
    - **Critical (Red):** Used exclusively for bans, deletions, and high-priority reports.
    - **Warning (Amber):** For flagged content requiring manual review or minor infractions.
    - **Success (Green):** For approvals and completed task confirmations.

## Typography

This design system uses a dual-font strategy to balance editorial clarity with technical precision. 

**Hanken Grotesk** is used for headlines and dashboard titles, providing a sharp, modern professional look. **Inter** handles the bulk of the UI text, chosen for its exceptional legibility in small, dense tables and feeds. For technical data—such as User IDs, IP addresses, or system logs—**JetBrains Mono** is utilized to prevent character confusion and signal a shift to "raw data" mode.

**Scaling Rules:**
- On mobile devices, `display-lg` scales down to `headline-md`.
- Body text never drops below 13px to ensure accessibility for moderators reviewing long-form text content.

## Layout & Spacing

The layout utilizes a **Fixed Grid** model for the main dashboard (1440px max-width) to ensure predictable data visualization, while the sidebars and internal content containers utilize a fluid internal rhythm.

**Grid System:**
- **Desktop:** 12-column grid with 24px gutters. Main navigation is pinned to the left (240px width).
- **Tablet:** 8-column grid with 16px gutters. Sidebar collapses into an icon-only "rail" or hamburger menu.
- **Mobile:** 4-column grid with 16px margins. Content stacks vertically; table views transform into card-based layouts.

**Spacing Rhythm:**
A strict 4px/8px base-8 scale is used to maintain vertical rhythm. High-density components (like the moderation queue) use "compact" padding (8px) to maximize the number of visible rows on screen.

## Elevation & Depth

This design system avoids heavy shadows to prevent the UI from feeling "cluttered" or "heavy." Depth is communicated primarily through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** Neutral Slate (#F8FAFC).
- **Level 1 (Cards/Containers):** Pure White (#FFFFFF) with a 1px subtle border (#E2E8F0).
- **Level 2 (Hover/Active):** A very soft ambient shadow (4px blur, 5% opacity) is applied only to interactive cards or active menu items to indicate focus.
- **Level 3 (Modals/Overlays):** Used for critical administrative confirmations (e.g., "Confirm Ban"). These use a semi-transparent backdrop blur (12px) to focus the administrator's attention on the decision at hand.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a clean, professional edge that feels modern without being overly "friendly" or "playful." 

- **Standard Elements:** Buttons, Input fields, and Cards use the 4px (0.25rem) radius.
- **Large Containers:** Dashboard widgets or main content areas may use up to 8px (0.5rem) to soften the overall interface.
- **Status Pills:** Status indicators (e.g., "Pending") use a 100px "Pill" shape to distinguish them from functional buttons.

## Components

### Buttons
- **Primary:** Solid Command Blue with white text. High-contrast.
- **Destructive:** Solid Status-Critical (Red). Used for "Delete" or "Ban."
- **Secondary/Ghost:** Subtle border with primary text. Used for "Cancel" or "Forward to Admin."

### Moderation Cards
- Cards must include a header with the "Reported User" and "Reporter" side-by-side.
- Content body should use `body-md` with a subtle background tint to indicate it is a "quoted post."
- Quick-action footer: Approve, Flag, or Delete buttons pinned to the bottom right.

### Input Fields
- Structured with a clear `label-caps` top-aligned.
- 1px border (#E2E8F0) that turns Command Blue on focus.
- Error states must use a red border and helper text below.

### Status Indicators (Chips)
- Small, pill-shaped tags with low-opacity background colors (e.g., Light Red background with Dark Red text) for better readability and accessibility.

### Data Tables
- Row height: 48px for standard, 40px for compact.
- Zebra striping is used to help moderators track data across wide screens.
- Critical actions appear on hover at the end of the row.