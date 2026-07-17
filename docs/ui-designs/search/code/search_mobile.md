---
name: Monochrome Precision
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is defined by absolute clarity, high contrast, and a strict adherence to a monochrome palette. It targets professional environments where information density and legibility are paramount. By stripping away the distraction of color, the UI emphasizes structure, typography, and intent.

The design style is **Minimalist-Brutalist Hybrid**. It leverages the clean, spacious qualities of high-end minimalism but adopts the structural rigor and sharp definition of soft brutalism. The emotional response is one of authority, focus, and unwavering reliability. Every element serves a functional purpose, with no decorative flourishes that do not contribute to the user's immediate task.

## Colors

The palette is strictly limited to pure black (#000000) and pure white (#FFFFFF). Grayscale tones are used exclusively for structural hierarchy—such as borders and disabled states—rather than aesthetic variation.

- **Primary:** Black is used for all primary actions, typography, and high-impact structural elements.
- **Surface:** White is the primary canvas, providing a clinical and expansive backdrop.
- **Muted/Disabled:** A mid-range gray (#717171) is used for secondary information and inactive states to ensure they recede visually without losing legibility.
- **Borders:** A light gray (#D4D4D4) provides subtle containment when high-contrast black borders are too aggressive for the context.

## Typography

Using Hanken Grotesk across all levels ensures a cohesive, contemporary, and highly legible experience. The typeface's sharp geometry complements the monochrome aesthetic.

Hierarchy is established through extreme weight variations and size. Headlines use "ExtraBold" or "Bold" weights with tight tracking to create impact. Body text maintains "Regular" weights for maximum readability. Labels are often set in uppercase with slight letter spacing to differentiate them from body content. In this color-restricted environment, typography *is* the primary design tool for information architecture.

## Layout & Spacing

The design system utilizes a **Fixed Grid** model for desktop and a **Fluid Grid** for mobile. A strict 8px baseline grid governs all spatial decisions, ensuring mathematical harmony and predictability.

- **Desktop:** 12-column grid with a 1280px max-width. Gutters are fixed at 24px to provide ample breathing room between content blocks.
- **Mobile:** 4-column fluid grid with 16px side margins. 
- **Spacing Philosophy:** Use generous whitespace to separate distinct functional areas. Avoid tight groupings unless the elements are logically inseparable (e.g., a label and its input). High contrast requires more "air" to prevent the interface from feeling cramped or overwhelming.

## Elevation & Depth

This design system rejects shadows and blurs in favor of **Tonal Layers and Bold Borders**. Depth is communicated through the physical stacking of elements and hair-line strokes.

- **Level 0 (Base):** Pure white background.
- **Level 1 (Surface):** Elements sit directly on the base, separated by a 1px solid border (#D4D4D4 or #000000 depending on priority).
- **Level 2 (Pop-overs/Modals):** These use a thick 2px black border and a white fill to "float" above the content. No shadows are used; instead, a solid black "offset" stroke can be used for high-importance modals to simulate depth (mimicking a shadow in a graphic, flat way).
- **Inversion:** Dark modes or "dark sections" use a solid black background with white typography and white borders.

## Shapes

The shape language is strictly **Sharp (0px roundedness)**. This reinforces the professional, architectural feel of the system. Every button, input field, card, and image container must have 90-degree corners. This geometric rigidity creates a sense of precision and aligns perfectly with the high-contrast monochrome palette.

## Components

- **Buttons:** 
  - *Primary:* Solid black background, white text, uppercase bold. 
  - *Secondary:* White background, 1px black border, black text.
  - *Ghost:* No background or border, black text, underlined on hover.
- **Input Fields:** 1px gray-border (#D4D4D4) that becomes a 2px black border on focus. Text is body-md. Labels are label-md, positioned strictly above the field.
- **Cards:** White background with a 1px gray-border. No shadow. For "active" or "hovered" states, the border thickens to 2px black.
- **Chips/Tags:** Small, sharp-edged boxes. Primary tags are black with white text; secondary tags are white with a 1px black border.
- **Lists:** Separated by 1px horizontal lines (#E5E5E5). High-contrast black text for primary list items; gray for metadata.
- **Checkboxes & Radios:** Sharp square (checkbox) or sharp-edged diamond (radio) containers. When checked, they are filled solid black with a white internal icon/dot.
- **Data Tables:** Heavy black header row with white text. Alternating row fills are not used; use 1px horizontal dividers only for a cleaner look.