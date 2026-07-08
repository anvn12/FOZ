---
name: Obsidian Flux
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#9ecaff'
  on-secondary: '#003258'
  secondary-container: '#0095f6'
  on-secondary-container: '#002b4d'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#d1e4ff'
  secondary-fixed-dim: '#9ecaff'
  on-secondary-fixed: '#001d36'
  on-secondary-fixed-variant: '#00497d'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  headline-bold:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
  body-main:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 21px
    letterSpacing: -0.01em
  body-secondary:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-timestamp:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  max-width-desktop: 700px
  container-padding: 1rem
  gutter: 12px
  thread-line-width: 1.5px
  avatar-size-lg: 48px
  avatar-size-sm: 32px
---

## Brand & Style
The design system is built for a high-velocity social forum, prioritizing content legibility and rapid-fire interactions. The aesthetic is **Modern Minimalism** with a focus on dark-mode immersion. It draws inspiration from contemporary social platforms, utilizing a "Content-First" philosophy where the UI recedes into the background to let user media and text lead the experience. 

The emotional response is one of precision and sophistication—using high-contrast typography against a void-black canvas to create a premium, editorial feel for social discourse.

## Colors
The palette is rooted in absolute black to maximize OLED efficiency and visual depth. 

- **Monochromatic Core:** Pure White is reserved for high-priority information (body text, usernames). Grays are tiered by elevation: `#101010` for main feed items and `#1E1E1E` for elevated modals or hover states.
- **Functional Accents:** Interaction states use highly saturated, punchy hues. Liked states use a vibrant Red-Pink, Reposts use a crisp Green, and primary actions (Follow, Links) use a clean Blue.
- **Subtle Boundaries:** Borders use a low-contrast dark gray (`#262626`) to define structure without breaking the visual flow of the infinite scroll.

## Typography
The system utilizes **Inter** for its neutral, systematic character. To achieve the modern "social" look, letter spacing is slightly tightened across all headlines and body text to create a more compact, intentional visual rhythm.

- **Usernames:** Always rendered in `headline-bold` to establish clear identity.
- **Body Copy:** Set at `15px` with a `1.4` line-height ratio to balance information density with readability.
- **Hierarchy:** Use color (`#777777`) rather than weight to distinguish secondary information like timestamps and metadata.

## Layout & Spacing
The layout follows a **Fixed-Width Centered** model for desktop, constraining the content to `700px` to maintain an optimal line length for reading threads. 

- **The Feed:** Elements are stacked vertically with `0px` gap, separated by 1px borders.
- **Threading:** A `1.5px` vertical line (`#262626`) connects avatars in a thread, visually anchoring the conversation flow.
- **Responsive:** On mobile, the `700px` constraint relaxes to `100%` width with `16px` horizontal padding. The UI relies on consistent margins between the avatar column and the content column.

## Elevation & Depth
This design system avoids traditional box-shadows to maintain a sleek, flat aesthetic. 

- **Tonal Layering:** Depth is communicated through color shifts. The background is `#000000`. Overlays, such as "See More" cards or input fields, use `#101010`.
- **Borders as Dividers:** Fine 1px lines (`#262626`) serve as the primary structural tool.
- **Active States:** Subtle brightness increases (shifting from `#101010` to `#1E1E1E`) are used for hover states on feed items.

## Shapes
The shape language is "Soft-Organic." 

- **Containers:** Main feed cards and input areas use a `12px` to `16px` radius.
- **Avatars:** Strictly circular (50% radius) to contrast against the squarer layout elements.
- **Interactive Elements:** Buttons and chips use a `pill` shape (fully rounded) to clearly distinguish them as tappable targets.

## Components
- **Avatars:** High-fidelity images with a 1px inner stroke to ensure separation from dark backgrounds.
- **Buttons:** 
    - *Primary:* Pure white background with black text.
    - *Secondary:* Transparent with a 1px border of `#262626`.
- **Interaction Icons:** Sleek, 1.5pt weight outline icons. Upon activation (e.g., Liking), icons transition to a solid fill in their respective accent color.
- **Thread Lines:** Vertical paths that align perfectly with the center of the avatar, terminating at the start of the final reply in a chain.
- **Input Fields:** Minimalist containers using `#101010` background, white placeholder text (at 30% opacity), and no shadows.