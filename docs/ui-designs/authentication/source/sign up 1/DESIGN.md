---
name: FOZ
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.04em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
  max-width: 640px
---

## Brand & Style

The design system is built on a foundation of **Strict Minimalism** and **High-Fidelity Utility**. It prioritizes content above all else, using a monochrome palette to create a premium, focused atmosphere. The emotional response is one of quiet confidence—avoiding unnecessary ornamentation to let user-generated media and text take center stage.

Drawing inspiration from contemporary social platforms and editorial design, the system utilizes high-contrast relationships (pure black on pure white) to establish a clear hierarchy. Depth is achieved through purposeful whitespace rather than decorative shadows, resulting in a UI that feels lightweight, fast, and sophisticated.

## Colors

The palette is intentionally restrained to maximize focus. 
- **Primary Black (#000000):** Used for primary actions, headings, and high-emphasis text.
- **Pure White (#FFFFFF):** The standard background for all surfaces to ensure maximum clarity.
- **Surface Grays (#F5F5F5, #E5E5E5):** Reserved for secondary containers, input backgrounds, and subtle borders. 
- **Secondary Text (#737373):** A mid-tone gray for metadata and placeholder text to maintain visual hierarchy without clutter.

Interaction states should be subtle; for example, a black button may shift to a dark gray (#262626) on hover or press.

## Typography

This design system utilizes **Inter** for its systematic, utilitarian aesthetic. The key to the "high-fidelity" look is the use of **tight letter-spacing** (negative tracking) on larger headlines to create a compact, editorial feel. 

Headings should always be semi-bold or bold to contrast against the airy background. Body text maintains standard tracking for readability. For metadata or "Labels," use a slightly heavier weight at a smaller size to ensure they remain legible and distinct from body copy.

## Layout & Spacing

The layout philosophy follows a **Centered Content Stream**. Given the focus on high-fidelity feeds, the content width is capped at 640px on desktop to mimic the focused experience of a mobile device.

- **Grid:** A fluid 12-column grid is used within the 640px container, though most content spans the full width.
- **Rhythm:** An 8px/4px base unit ensures consistent vertical rhythm.
- **Margins:** Use 16px horizontal margins on mobile devices.
- **Padding:** Vertical spacing between feed items should be generous (24px - 32px) to prevent the UI from feeling cramped and to maintain the minimalist "breathable" aesthetic.

## Elevation & Depth

This design system avoids traditional drop shadows. Depth is communicated through **Tonal Layering** and **Minimalist Outlines**:

1.  **Level 0 (Base):** Pure White (#FFFFFF) background.
2.  **Level 1 (Surface):** Subtle Gray (#F5F5F5) used for inset sections like search bars or quote-reposts.
3.  **Outlines:** Use a 1px solid border (#E5E5E5) to define card boundaries and horizontal separators. 

For overlays (modals or sheets), use a heavy backdrop blur (20px+) with a 40% black overlay to maintain focus on the modal without adding heavy visual weight.

## Shapes

The shape language is defined by **Soft Geometricism**. Elements use a consistent radius to feel approachable yet modern.

- **Standard Elements:** Buttons, input fields, and small cards use a **12px (rounded)** radius.
- **Large Containers:** Large feed images or dialogue boxes use a **16px (rounded-lg)** radius.
- **Avatars:** User profiles always use a circular (pill-shaped) crop to provide a distinctive break from the rectangular grid.

## Components

### Buttons
- **Primary:** Solid #000000 background with #FFFFFF text. No border. 12px corner radius.
- **Secondary:** Transparent background with a 1px #E5E5E5 border and #000000 text.
- **Ghost:** No background or border. Used for low-priority actions like "Cancel."

### Input Fields
- **Search/Text Inputs:** #F5F5F5 solid background, no border, 12px corner radius. Placeholder text in #737373.
- **Focus State:** Transition the background to #FFFFFF and add a 1px #000000 border.

### Cards & Feed Items
- Feed items are separated by a 1px #E5E5E5 horizontal rule. 
- Media (images/video) should fill the container width and use a 12px corner radius to match the component language.

### Chips/Tags
- Small, rounded pills with #F5F5F5 background and #000000 text. Used for categories or status indicators.

### Navigation
- A bottom bar on mobile and top bar on desktop using pure white backgrounds. Icons should be "Outlined" style with a 1.5pt stroke weight to match the clean typography.