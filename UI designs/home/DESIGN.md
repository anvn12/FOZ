---
name: FOZ Social System
colors:
  surface: '#f8fafa'
  surface-dim: '#d8dada'
  surface-bright: '#f8fafa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f4'
  surface-container: '#eceeee'
  surface-container-high: '#e6e8e9'
  surface-container-highest: '#e1e3e3'
  on-surface: '#191c1d'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#eff1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#006399'
  on-secondary: '#ffffff'
  secondary-container: '#35adff'
  on-secondary-container: '#003f63'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#171c20'
  on-tertiary-container: '#7f8489'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#95ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004a75'
  tertiary-fixed: '#dee3e8'
  tertiary-fixed-dim: '#c2c7cc'
  on-tertiary-fixed: '#171c20'
  on-tertiary-fixed-variant: '#42474c'
  background: '#f8fafa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e3'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '800'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 19px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '800'
    lineHeight: 24px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: auto
---

## Brand & Style

The design system for FOZ is rooted in **Minimalism** and **High-Contrast Modernism**. It prioritizes content over container, removing unnecessary visual noise to foster a fast-paced, information-dense social environment. The brand personality is direct, objective, and utilitarian, appealing to a savvy audience that values speed and clarity.

The visual mood is stark and editorial, utilizing a monochrome palette to allow user-generated imagery to provide the primary "color" of the interface. The aesthetic is inspired by contemporary digital journals and micro-blogging platforms where the wordmark and content are the sole focuses.

## Colors

The palette is strictly functional, leveraging extreme contrast to guide user behavior. 

- **Primary Action**: Solid Black (#000000) is reserved for high-priority interactions and primary brand elements.
- **Secondary/Accent**: A restrained blue is used exclusively for verified badges or specific link highlights.
- **Surface & Neutral**: A scale of grays handles the structural hierarchy. In Light Mode, the primary background is Pure White, with light gray dividers. In Dark Mode, the background shifts to Pure Black (#000000) to ensure high-end OLED displays achieve maximum depth and power efficiency.
- **Text**: Pure Black for headings and Pure White for dark-mode text ensures maximum legibility.

## Typography

This design system utilizes **Inter** for its systematic, utilitarian precision. The typographic hierarchy is designed for rapid scanning. Headlines use heavy weights (700-800) and slightly tighter letter spacing to create a sense of urgency and "news-style" authority. Body text is optimized for readability with generous line heights. Metadata and timestamps utilize the Label roles, often appearing in secondary neutral tones to recede in the visual stack.

## Layout & Spacing

The layout follows a **Fluid Grid** model for mobile and a **Centered Fixed Column** for desktop to ensure long-form readability.

- **Mobile**: A single-column feed with 16px lateral margins. Elements are separated by thin 1px hair-line borders to maximize screen real estate.
- **Desktop**: The content is capped at 600px width, centered on the screen, mimicking the focused experience of a mobile device while utilizing white space to reduce cognitive load.
- **Rhythm**: All spacing is derived from a 4px baseline grid. Padding within feed items (cards) should be 12px or 16px depending on content density.

## Elevation & Depth

To maintain the clean, minimal aesthetic, this design system rejects shadows in favor of **Tonal Layers** and **Hairline Outlines**.

- **Level 0**: Main background (White/Black).
- **Level 1**: Secondary surfaces like search bars or input fields, using a subtle gray shift.
- **Dividers**: 1px solid lines (#EFF3F4 in Light, #2F3336 in Dark) are the primary tool for separating content units.
- **Sticky Elements**: The Bottom Navigation and Top Bar use a Backdrop Blur (Glassmorphism) effect (20px blur) with 90% opacity to maintain context of the feed while scrolling.

## Shapes

The shape language is dominated by **Full Circularity (Pill-shaped)** for interactive elements and **Soft-Rectangles** for content.

- **Buttons & Chips**: Always use the maximum radius (pill-shaped) to distinguish them from content containers.
- **Media (Images/Video)**: Use `rounded-lg` (16px) to soften the edges of user-generated content, creating a friendly contrast against the sharp typography.
- **Avatars**: Strictly circular.

## Components

### Buttons
- **Primary**: Pill-shaped, Solid Black background, White text. High-contrast, no shadow.
- **Secondary**: Pill-shaped, White background, 1px Black border, Black text.
- **Ghost**: No background, Bold text, used for tertiary actions like "Reply" or "Share".

### Input Fields
- Search bars and text inputs should use a light gray fill (#F7F9F9) with no border in Light Mode, transitioning to a dark gray (#202327) in Dark Mode.

### Bottom Navigation (Mobile)
- A persistent bar at the bottom of the viewport.
- Icons should be stroke-based (2px weight) when inactive and solid/filled when active.
- Background uses the system glassmorphism blur.

### Feed Cards
- No outer border or shadow. 
- Separated by a single horizontal 1px line.
- Content is left-aligned, following the avatar "column" which sits 12px from the left margin.

### Chips
- Used for categories or trends. Small, pill-shaped, with a light gray background and medium-weight label text.