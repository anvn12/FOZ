---
name: Obsidian Light
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
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e4e2e2'
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
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  container-max: 1120px
---

## Brand & Style

The design system pivots from its dark origins into a high-clarity, sophisticated light mode that prioritizes intellectual focus and structural order. It targets professionals, researchers, and community builders who value readability and organized thought over social media noise.

The style is a hybrid of **Minimalism** and **Corporate Modern**, characterized by a "Paper-and-Ink" philosophy. It utilizes expansive whitespace, a strictly controlled neutral palette, and subtle architectural lines to create an airy, focused environment. The emotional response is one of calm authority—a digital workspace that feels as intentional and permanent as a well-bound journal.

## Colors

This system employs a monochrome-heavy palette to maintain the "Obsidian" heritage while optimizing for a light interface. 

- **Primary (#121212):** Used for headlines, primary buttons, and active states. It provides the high-contrast "ink" against the white canvas.
- **Secondary (#666666):** Reserved for body text, meta-data, and secondary icons to reduce eye strain.
- **Surface & Background:** The interface uses `#FFFFFF` for main content areas to maximize brightness, with `#F9F9F9` used for structural backgrounds (sidebars, gutters) to provide subtle depth.
- **Accents:** Semantic colors (Success, Error) should be used sparingly, desaturated to maintain the professional tone.

## Typography

The typography strategy pairs the sharp, contemporary geometry of **Hanken Grotesk** for headings with the systematic legibility of **Inter** for long-form content. 

To reinforce the technical and structured nature of the "Obsidian" brand, **JetBrains Mono** is utilized for labels, metadata, and "Topic" chips. This monospaced touch distinguishes the platform as a place for curated information rather than casual scrolling. Vertical rhythm is strictly enforced with a 4px baseline grid.

## Layout & Spacing

The layout adopts a **Structured Fixed Grid** to differentiate from the fluid, stream-of-consciousness feel of typical social feeds. 

- **Desktop:** A 12-column grid with a 1120px max-width, centered. Content is organized into distinct logical zones (Navigation, Feed/Content, Contextual Sidebar).
- **Gutter & Margins:** A generous 20px gutter ensures visual separation.
- **Rhythm:** All component padding and margins must be multiples of 4px. Use `lg` (40px) spacing between major sections to emphasize the "Airy" brand value.
- **Reflow:** On mobile, the 3-column layout collapses into a single column with 16px horizontal margins.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows. This maintains the clean, flat aesthetic while providing necessary hierarchy.

1.  **Level 0 (Base):** `#F9F9F9` – The application background.
2.  **Level 1 (Surface):** `#FFFFFF` – Main content cards and panels. These feature a 1px border of `#EEEEEE`.
3.  **Level 2 (Active/Hover):** Surfaces receive a very soft, ambient shadow (4px blur, 2% opacity black) and a slightly darker border (`#E5E5E5`) to indicate interactivity.

Avoid heavy blurs or colored glows. The goal is "architectural" depth, where layers feel like stacked sheets of paper.

## Shapes

The design system adheres to a consistent 8px (0.5rem) corner radius for all primary UI elements. This "Soft" geometry balances the high-contrast "Ink" typography, preventing the interface from feeling too sterile or aggressive.

- **Buttons & Inputs:** 8px radius.
- **Cards & Modals:** 12px (rounded-lg) for larger containers to soften their visual impact.
- **Topic Chips:** Fully pill-shaped (rounded-xl) to distinguish them from standard buttons and interactive cards.

## Components

### Buttons
- **Primary:** Background `#121212`, Text `#FFFFFF`. Solid, no-nonsense block style.
- **Secondary:** Background `#FFFFFF`, Border 1px `#121212`, Text `#121212`.
- **Ghost:** No background or border. Text `#666666`.

### Topic Chips
To differentiate from a standard feed, Topic Chips use **JetBrains Mono** and a light-gray fill (`#F2F2F2`) with no border. They are pill-shaped. On hover, the fill darkens slightly to `#E5E5E5`.

### Input Fields
Inputs are minimal: a 1px border (`#EEEEEE`) that transitions to `#121212` on focus. Labels use `label-sm` (monospaced) positioned above the field.

### Cards
Cards are the primary container for "Topics" or "Posts." They feature a white background, an 8px radius, and a 1px border. Unlike social feeds, cards should have generous internal padding (24px) to promote readability.

### Lists
Lists are separated by thin 1px horizontal lines (`#EEEEEE`) rather than alternating background colors. This reinforces the structured, forum-like grid.