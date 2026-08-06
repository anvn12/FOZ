---
name: Luminous Tech
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#424754'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#727786'
  outline-variant: '#c2c6d7'
  surface-tint: '#0059c7'
  primary: '#0057c3'
  on-primary: '#ffffff'
  primary-container: '#0f6ef0'
  on-primary-container: '#fefcff'
  inverse-primary: '#afc6ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#5a5c5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#737576'
  on-tertiary-container: '#fcfdfe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001944'
  on-primary-fixed-variant: '#004299'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.25'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

This design system embodies a **Modern Corporate** aesthetic with a lean toward **Minimalism**. It is designed for high-growth technology platforms that require a balance between innovative energy and professional reliability. The interface prioritizes clarity, utilizing generous whitespace and a "light-first" architecture to evoke a sense of openness and speed. 

The target audience consists of professionals and tech-savvy users who value efficiency and precision. The emotional response should be one of "clarity and momentum"—the UI feels lightweight and fast, yet structurally sound. Visual interest is driven by high-quality typography and vibrant accent hits rather than heavy decorative elements.

## Colors

The palette is anchored by a crisp white surface to maximize perceived brightness and cleanliness. The **Vibrant Blue (#2E7DFF)** serves as the primary action color, providing a high-energy focal point against the neutral background. 

- **Primary:** Used for call-to-actions, active states, and primary brand indicators.
- **Secondary:** A muted slate blue-gray used for supporting information and secondary iconography.
- **Tertiary/Containers:** A very soft gray (#F8F9FA) used to subtly distinguish content blocks from the main surface.
- **Neutral:** Deep charcoal-blue for maximum text legibility and contrast.

All color combinations must meet WCAG AA standards for accessibility, particularly when placing the primary blue against white backgrounds.

## Typography

This system utilizes a dual-typeface strategy to distinguish between structural brand impact and functional readability.

- **Montserrat** is reserved for headlines. Its geometric construction reinforces the tech-forward, confident personality of the brand. Use tighter letter spacing for larger sizes to maintain a cohesive visual block.
- **Plus Jakarta Sans** is used for all body copy, UI labels, and inputs. Its soft, rounded characteristics balance the sharpness of Montserrat, providing a friendly and highly legible experience even at small sizes.

Hierarchy is established through clear weight shifts. Use `600` or `700` weights for interactive triggers and headers, while maintaining `400` for long-form reading to prevent visual fatigue.

## Layout & Spacing

The design system employs a **Fluid Grid** model based on an 8px base unit. This ensures all components scale mathematically and remain aligned across different viewport sizes.

- **Desktop:** 12-column grid with a 24px gutter. Content is capped at a 1280px max-width to ensure optimal line lengths.
- **Tablet:** 8-column grid with a 24px gutter and 32px side margins.
- **Mobile:** 4-column grid with a 16px gutter and 16px side margins. 

Spacing between sections should utilize `xxl` (48px) to emphasize the minimalist, airy aesthetic. Component-level spacing should rely primarily on `md` (16px) for standard padding and `sm` (8px) for tightly related elements like icon-text pairs.

## Elevation & Depth

To maintain a crisp, light-mode feel, the design system utilizes **Tonal Layers** and **Ambient Shadows** rather than heavy borders.

1.  **Base Layer:** The `#FFFFFF` surface is the lowest level.
2.  **Container Layer:** Secondary content blocks (e.g., sidebars, feed items) use the `#F8F9FA` tertiary color with no shadow.
3.  **Raised Layer:** Elements like cards use a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
4.  **Overlay Layer:** Modals and dropdowns use a more defined shadow to signify high priority: `0px 10px 32px rgba(0, 0, 0, 0.08)`.

Avoid using pure black shadows; instead, use low-opacity neutral tints to ensure the "Luminous" quality of the design is preserved.

## Shapes

The shape language is **Rounded**, strike a balance between friendly approachability and professional structure. 

- **Standard Components:** Buttons, input fields, and small cards use a `0.5rem` (8px) radius.
- **Large Containers:** Hero sections or large content cards use `rounded-lg` (16px) or `rounded-xl` (24px) to create a softer visual frame.
- **Functional Elements:** Icons and small badges may use smaller 4px radii where space is constrained.

This consistent rounding helps the UI feel modern and safe, avoiding the aggression of sharp corners while remaining more structured than a fully pill-shaped "playful" system.

## Components

- **Buttons:** Primary buttons use the vibrant blue background with white text. Hover states should darken the blue slightly. Secondary buttons use a transparent background with a `#E2E8F0` border and blue text.
- **Inputs:** Text fields use a white background with a `#E2E8F0` border. On focus, the border transitions to the primary blue with a subtle 2px blue glow (10% opacity).
- **Cards:** Cards should be white with the "Raised Layer" ambient shadow. Padding inside cards is strictly `lg` (24px).
- **Chips/Badges:** Small indicators for status. Use the primary blue at 10% opacity for the background and 100% opacity for the text to create a modern, high-tech look without overwhelming the user.
- **Lists:** Use the `#F8F9FA` color for row hover states to provide clear visual feedback without introducing new colors.
- **Navigation:** Top navigation bars should be white with a subtle bottom border of `#F8F9FA`. Active links should use the primary blue with a 2px bottom indicator.