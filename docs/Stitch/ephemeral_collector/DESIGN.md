---
name: Ephemeral Collector
colors:
  surface: '#f8faf8'
  surface-dim: '#d8dad9'
  surface-bright: '#f8faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f2'
  surface-container: '#eceeec'
  surface-container-high: '#e6e9e7'
  surface-container-highest: '#e1e3e1'
  on-surface: '#191c1b'
  on-surface-variant: '#434843'
  inverse-surface: '#2e3130'
  inverse-on-surface: '#eff1ef'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#9e3f41'
  on-secondary: '#ffffff'
  secondary-container: '#fe8988'
  on-secondary-container: '#752125'
  tertiary: '#0b1a13'
  on-tertiary: '#ffffff'
  tertiary-container: '#202f26'
  on-tertiary-container: '#86978c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b1'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#7f282b'
  tertiary-fixed: '#d5e7da'
  tertiary-fixed-dim: '#b9cbbe'
  on-tertiary-fixed: '#101f17'
  on-tertiary-fixed-variant: '#3b4a41'
  background: '#f8faf8'
  on-background: '#191c1b'
  surface-variant: '#e1e3e1'
  cream: '#FFF9E5'
  pale-blue: '#D9EAF2'
  blush: '#FCE4EC'
  sage-border: '#C5D3C9'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
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
  unit: 8px
  container-margin: 24px
  gutter: 16px
  card-padding: 20px
  section-gap: 40px
---

## Brand & Style
The design system is crafted for a digital toy collection experience that feels like a curated gallery rather than a chaotic marketplace. The brand personality is **Premium, Soft, and Personal**, aiming to evoke the quiet joy of organizing a physical shelf. 

The aesthetic is a hybrid of **Minimalism** and **Tactile Modernism**. It prioritizes high-quality whitespace and soft, organic shapes to create a "calm-tech" environment. By avoiding aggressive gradients or flashy animations, the UI steps back to let the vibrant colors and details of the digital collectibles take center stage. The emotional response should be one of "gentle ownership"—a safe, warm space where users feel a sentimental connection to their digital objects.

## Colors
The palette is grounded in a warm, sophisticated naturalism. The background uses a very pale mint (#F9FBF9) to provide a softer visual anchor than pure white, reducing eye strain and feeling more "paper-like."

- **Primary Text (#1B3022):** A deep forest green used for high-contrast legibility and a sense of established quality.
- **Accent (#D16666):** A muted raspberry used sparingly for primary actions and emotional highlights.
- **Secondary Tones:** A curated set of soft pastels (Mint, Cream, Pale Blue, Blush) are used to categorize different toy rarities or series collections, providing a playful variety without breaking the premium feel.

## Typography
The typography strategy balances playfulness with precision. **Plus Jakarta Sans** provides a modern, friendly, and slightly rounded geometric feel for headlines, making the app feel approachable. For body text and data-heavy areas, **Hanken Grotesk** offers exceptional clarity and a professional edge that keeps the "toy" theme from feeling juvenile.

Large display type should use a tighter letter-spacing to feel more "editorial." Body text uses generous line heights to enhance the "calm" atmosphere of the app.

## Layout & Spacing
This design system utilizes a **Fixed Grid** for desktop (12 columns, 1200px max-width) and a **Fluid Grid** for mobile (4 columns). The rhythm is based on an 8px base unit.

Generous internal padding within components is critical to maintaining the "premium" feel. Elements should never feel cramped; if in doubt, increase the whitespace. 

- **Mobile:** 24px side margins to create a "framed" look for content cards.
- **Desktop:** Centered layout with wide gutters (24px) to allow the soft shadows of cards to breathe without overlapping adjacent content.

## Elevation & Depth
Hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**. Surfaces do not use "harsh" shadows; instead, they use a soft, multi-layered "diffusion" effect.

- **Base Layer:** The pale mint background (#F9FBF9).
- **Surface Layer (Cards):** Pure white (#FFFFFF) or very light cream (#FFF9E5) with a 1px "Sage" border (#C5D3C9) at 50% opacity.
- **Shadows:** Use a low-opacity forest-green tint (#1B3022 at 8%) for shadows rather than pure black. This maintains the warmth of the palette.
- **Interaction:** On hover or tap, cards should subtly lift (increased shadow spread) or scale (1.02x) to provide a tactile, "squishy" physical feedback.

## Shapes
The shape language is dominated by high-radius curves. While the base `rounded-md` is 8px, the primary container for the "collectible" experience is the **Large Card**, which must utilize a 24px or 32px corner radius. This "super-ellipse" feel mimics the molded plastic of toy packaging and high-end industrial design. 

Buttons and input fields should follow a consistent `rounded-lg` (16px) or `pill` (full radius) style to reinforce the friendly, safe-to-touch nature of the interface.

## Components

### Buttons
Primary buttons use the Raspberry accent (#D16666) with white text. Secondary buttons use a Forest Green outline or a soft Sage fill. All buttons should have a minimum height of 48px to ensure a tactile, easy-to-tap feel.

### Cards
Cards are the core of the design system. They must feature a 24px+ corner radius, a subtle 1px border (#C5D3C9), and an ambient green-tinted shadow. Content inside cards should have a minimum of 20px padding.

### Lists
Lists should be presented as a vertical stack of "mini-cards" rather than simple divided rows. Each list item should have a soft background color (e.g., Blush or Pale Blue) to distinguish it from the main surface.

### Input Fields
Inputs should use a soft Cream (#FFF9E5) background with no border, except when focused. On focus, a 2px Sage border should appear. Labels should always be visible above the field in Hanken Grotesk Medium.

### Chips & Badges
Used for toy "tags" (e.g., "Limited Edition," "Series 1"). These should be pill-shaped with low-saturation background fills and dark forest-green text.

### Progress Bars
For "Collection Completion," use a thick, rounded track with a soft mint fill and a raspberry progress indicator. The rounded caps on the bar are essential to maintain the shape language.