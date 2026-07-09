---
name: FOZ Visual Language
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#5c3f41'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#906f70'
  outline-variant: '#e5bdbe'
  surface-tint: '#be0037'
  primary: '#ba0035'
  on-primary: '#ffffff'
  primary-container: '#e12149'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b6'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#006a43'
  on-tertiary: '#ffffff'
  tertiary-container: '#008656'
  on-tertiary-container: '#f6fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920028'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#7ffaba'
  tertiary-fixed-dim: '#62dda0'
  on-tertiary-fixed: '#002112'
  on-tertiary-fixed-variant: '#005233'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 640px
  gutter: 16px
---

## Brand & Style

The design system is rooted in **Modern Minimalism**, prioritizing content clarity and conversational flow over decorative elements. Inspired by high-end editorial layouts and contemporary social platforms, it leverages generous whitespace to reduce cognitive load and create a "breathable" community environment.

The aesthetic is characterized by:
- **Pristine Surfaces:** Utilizing absolute white backgrounds to maximize contrast and focus.
- **Typography-First Hierarchy:** Using font weight and scale rather than color or boxes to organize information.
- **Subtle Boundaries:** Using ultra-low opacity strokes instead of heavy shadows or fills to define structure.
- **High-Energy Accents:** A singular, vibrant primary color used sparingly for high-intent actions and active states.

## Colors

The palette is strictly functional. The background is a clean `#FFFFFF`, providing the maximum possible canvas for content. 

- **Primary (#FF3B5C):** A vibrant, energetic pink-red used for "Like" states, new post indicators, and primary call-to-action buttons.
- **Text Primary (#000000):** Reserved for headlines and usernames to ensure immediate legibility.
- **Text Secondary (#1E1E1E):** Used for post bodies and comments to provide a slightly softer reading experience than pure black.
- **Borders:** A consistent `#000000` at `0.06` or `0.10` opacity is used to separate feed items without creating visual noise.

## Typography

This design system uses **Inter** for all roles to maintain a systematic, utilitarian feel. The hierarchy relies on tight line heights for headlines and comfortable, airy line heights for body text.

- **Headlines:** Use Bold (700) weights with slight negative letter spacing to create a modern "impact" look.
- **Body Text:** Use Regular (400) weights. Paragraph spacing should be generous to accommodate long-form forum discussions.
- **Usernames & Metadata:** Use Semibold (600) or Medium (500) for usernames to differentiate them from the surrounding body copy without needing color shifts.

## Layout & Spacing

The layout follows an **8px grid system**. The structure is intentionally narrow, mimicking mobile-first feed layouts even on desktop to ensure maximum readability and focus.

- **Max Width:** The main content feed is constrained to `640px` and centered on the screen.
- **Fluidity:** While the container is fixed-max, the internal elements use fluid widths with fixed `24px` horizontal padding on mobile.
- **Vertical Rhythm:** Post cards are separated by a simple border or `1px` line, with `16px` to `24px` of vertical padding inside each card to ensure the text doesn't feel cramped.

## Elevation & Depth

This design system avoids traditional shadows to maintain its minimalist aesthetic. Depth is achieved through **Tonal Layering** and **Line Work**:

- **Level 0:** The main page background (`#FFFFFF`).
- **Level 1:** Input fields and secondary buttons use a very light gray fill (`#F5F5F5`) to sit slightly "below" the surface or indicate interactivity.
- **Outlines:** Instead of shadows, cards and sections are defined by a `1px` solid stroke at `6%` black opacity.
- **Overlays:** Modals and menus use a heavy backdrop blur (Glassmorphism) with a `20px` to `40px` blur radius to maintain context while focusing the user.

## Shapes

The shape language is friendly and modern. 
- **Standard Radius:** `12px` (rounded-md) for input fields and smaller containers.
- **Large Radius:** `16px` (rounded-lg) for main thread cards and profile sections.
- **Full Radius:** Buttons and tags use a pill-shape (circular ends) to contrast against the more structured content cards.

## Components

### Buttons
- **Primary:** Pill-shaped, background `#000000`, text `#FFFFFF`. High contrast.
- **Secondary:** Pill-shaped, border `1px solid #00000010`, background transparent.
- **Accent/Active:** Use the Primary Red/Pink for specific "Follow" or "Like" actions.

### Cards & Threads
Cards have no background color (white) and no shadow. They are separated by a `1px` bottom border or contained within a `1px` border with `16px` corner radius. Internal padding is `16px` for mobile, `24px` for desktop.

### Input Fields
Inputs use a `12px` radius and a light gray background (`#F5F5F5`) with no border. On focus, the background stays the same but a `1px` black border appears.

### Chips & Tags
Small, pill-shaped elements with `#F5F5F5` background and `label-sm` typography. Used for categories or status indicators.

### Navigation
A centered, bottom-fixed navigation bar on mobile or a top-sticky bar on desktop. Icons are minimalist line-art with a `2px` stroke weight. Active states are indicated by the Primary Red/Pink.