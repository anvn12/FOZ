---
name: Lumina Tech-Forward System
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#c2c6d7'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#8c90a0'
  outline-variant: '#424754'
  surface-tint: '#afc6ff'
  primary: '#afc6ff'
  on-primary: '#002d6d'
  primary-container: '#528dff'
  on-primary-container: '#00275f'
  inverse-primary: '#0059c7'
  secondary: '#dbb8ff'
  on-secondary: '#480082'
  secondary-container: '#8000e2'
  on-secondary-container: '#e3c5ff'
  tertiary: '#75d1ff'
  on-tertiary: '#003548'
  tertiary-container: '#009ccd'
  on-tertiary-container: '#002e3f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001944'
  on-primary-fixed-variant: '#004299'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#dbb8ff'
  on-secondary-fixed: '#2b0052'
  on-secondary-fixed-variant: '#6600b6'
  tertiary-fixed: '#c2e8ff'
  tertiary-fixed-dim: '#75d1ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  split-ratio: '0.5'
---

## Brand & Style

The design system is engineered for a tech-forward audience that demands both precision and vibrancy. The brand personality is defined by three pillars: **Minimalist** (stripping away the unnecessary), **Striking** (bold, high-contrast focal points), and **Alive** (dynamic color transitions and depth).

The aesthetic marries **Glassmorphism** with **Corporate Modern** structures. It utilizes frosted glass effects to create a sense of depth and translucency, suggesting an open and innovative platform. The visual tone is assertive, using large geometric typography to command attention while maintaining a professional, data-centric air.

## Colors

The palette is derived from high-energy spectral blues and purples. 
- **Primary (#2E7DFF):** A vibrant tech-blue used for primary actions and brand identifiers.
- **Secondary (#9D3BFF):** A deep violet used for accents and to create the "alive" gradient feel.
- **Tertiary (#00C2FF):** A bright cyan used for highlights and status indicators.
- **Neutral (#0A0C10):** A deep, near-black slate that serves as the canvas, allowing glass effects to pop.

The system defaults to **Dark Mode** to better support the luminous quality of the glassmorphic components and the vibrancy of the primary gradients.

## Typography

This design system uses a triple-font strategy to ensure an assertive yet readable interface. 
- **Montserrat** is the voice of the brand, used for bold, geometric headlines that feel structural and modern. 
- **Plus Jakarta Sans** provides a softer, approachable touch for body copy, ensuring long-form content is legible.
- **JetBrains Mono** is utilized for technical labels, metadata, and small captions to reinforce the "tech-forward" and precise nature of the system.

On mobile, display sizes are capped at 32px to maintain hierarchy without overwhelming the viewport.

## Layout & Spacing

The layout follows a **split-screen philosophy** for desktop environments. The screen is typically divided 50/50: one side hosts immersive brand visuals or hero imagery, while the other side contains the functional UI and data. 

On mobile devices, this transitions into a **centered card layout**, where content is stacked vertically within the safe areas. 

We use an **8px base unit** for all spacing. Gutters are fixed at 24px to ensure breathing room between glass cards, while the outer margins scale from 64px on desktop down to 20px on mobile to maximize screen real estate.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** rather than traditional shadows. Surfaces use a background blur (16px to 32px) and a semi-transparent fill (white or primary at 5-10% opacity).

To define edges, each glass container must have a **1px solid border** with a subtle gradient (top-left at 30% white to bottom-right at 10% white). This creates a "specular highlight" effect. When elements overlap, the background blur of the top layer naturally obscures the layer beneath, creating a sophisticated sense of verticality.

## Shapes

The design system employs a **Rounded (0.5rem)** shape language. This balances the "assertive" geometric nature of the typography with a modern, high-end tech feel.

- **Standard Containers:** 0.5rem (8px) radius.
- **Large Cards & Modals:** 1rem (16px) radius.
- **Buttons & Inputs:** 0.5rem (8px) radius to maintain consistency with the grid.

Full pill-shapes (3) are reserved exclusively for status badges and chips to differentiate them from actionable buttons.

## Components

### Buttons
Primary buttons use a vibrant gradient from Primary (#2E7DFF) to Secondary (#9D3BFF). Text is white Montserrat Bold. Secondary buttons use the glass style: a 1px border with a backdrop blur and no fill color.

### Input Fields
Inputs are transparent with a 1px border. On focus, the border glows with the Primary color and a subtle outer glow (neon effect). Labels use JetBrains Mono for a technical feel.

### Cards
Cards are the centerpiece of the glassmorphic style. They must include:
- `backdrop-filter: blur(20px);`
- `background: rgba(255, 255, 255, 0.05);`
- `border: 1px solid rgba(255, 255, 255, 0.1);`

### Chips & Badges
Small, high-contrast elements using Tertiary (#00C2FF) backgrounds with black JetBrains Mono text. They should have a pill-shaped radius.

### Lists
List items are separated by subtle 1px lines at 5% white opacity. Hover states should trigger a slight increase in the card's background opacity (from 5% to 12%) to indicate interactivity.