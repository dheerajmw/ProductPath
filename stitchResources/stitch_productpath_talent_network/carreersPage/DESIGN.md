---
name: ProductPath Launch System
colors:
  surface: '#0e1323'
  surface-dim: '#0e1323'
  surface-bright: '#34394a'
  surface-container-lowest: '#080d1d'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f30'
  surface-container-high: '#25293a'
  surface-container-highest: '#2f3446'
  on-surface: '#dee1f9'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dee1f9'
  inverse-on-surface: '#2b3041'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#0e1323'
  on-background: '#dee1f9'
  surface-variant: '#2f3446'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  section: 120px
  container-max: 1200px
---

## Brand & Style

This design system is engineered for a high-impact, aspirational "Launch Page" experience. It targets sophisticated tech audiences who value precision, speed, and premium aesthetics. The style is a refined blend of **Modern Corporate** and **Glassmorphism**, drawing inspiration from the "Dark UI" movement pioneered by industry leaders like Linear and Vercel.

The visual narrative focuses on depth and luminosity. Against a mathematical, dark void, elements emerge through translucency, subtle glow effects, and razor-sharp borders. The emotional response should be one of "future-proof reliability"—feeling both cutting-edge and rock-solid.

## Colors

The palette is anchored in a deep, celestial navy to provide maximum contrast for luminous accents.

- **Deep Navy (#0B1020):** The foundational void. Use for the primary background.
- **Electric Blue (#3B82F6):** The primary action color. Use for CTA buttons, active states, and primary brand indicators.
- **Emerald Green (#10B981):** The success state. Use for "Verified," "Launch Successful," and positive data trends.
- **Surface Strategy:** Layers are built using increasing lightness rather than pure grey. Each elevated surface should be a slightly lighter tint of the navy base to maintain color harmony.
- **Glows:** Primary accents should utilize "bloom" effects—soft, high-radius box shadows with low opacity to simulate light emission.

## Typography

The design system utilizes **Inter** exclusively to achieve a systematic, utilitarian, yet modern look. 

- **Headlines:** Use high-contrast weights (Bold/ExtraBold) with tight letter spacing to create a "dense" and impactful visual hierarchy.
- **Body Text:** Maintain generous line-height (1.5–1.6) to ensure readability against the dark background. 
- **Labels:** Use uppercase with increased letter-spacing for metadata and small categorizations to create a technical, "instrument-panel" feel.
- **Coloration:** Primary headings should be pure white (#FFFFFF). Secondary body text should be a dimmed silver (rgba(255, 255, 255, 0.7)) to establish hierarchy through value.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the core content to maintain a high-end editorial feel, while the background effects remain fluid.

- **The 12-Column Grid:** Use a 12-column grid for desktop (1200px max width) with 24px gutters.
- **Rhythm:** Spacing follows a 4px base unit. Component internal padding should favor the `lg` (24px) or `md` (16px) units to feel spacious and premium.
- **Sectioning:** Vertical breathing room is critical. Use 120px to 160px of padding between major landing page sections to prevent the dark UI from feeling cramped.
- **Mobile:** Transition to a single-column layout with 20px side margins. Scale down display typography using the `mobile` definitions provided.

## Elevation & Depth

Depth is the defining characteristic of this design system. We use a **Glassmorphic** approach:

1.  **Level 0 (Background):** Solid #0B1020.
2.  **Level 1 (Cards/Surfaces):** Background: `rgba(22, 29, 49, 0.7)` with a `backdrop-filter: blur(20px)`. 
3.  **Borders:** Instead of standard shadows, use a "Inner Glow" border. A 1px solid stroke with `rgba(255, 255, 255, 0.1)` on the top and left, and `rgba(255, 255, 255, 0.05)` on the bottom and right.
4.  **Shadows:** Use large, soft ambient shadows (`0 20px 40px rgba(0,0,0,0.4)`) to lift cards off the background.
5.  **Accent Depth:** For primary cards, add a very subtle outer glow using the primary Electric Blue at 5-10% opacity to suggest the element is "powered on."

## Shapes

The design system uses a consistent **16px (Round Sixteen)** corner radius for all primary containers and cards.

- **Primary Cards:** 16px (1rem) radius.
- **Buttons:** Use a slightly smaller 12px radius to appear more "clickable" and distinct from large containers.
- **Inputs:** Align with button radius (12px) for consistency in forms.
- **Consistency:** Ensure that nested elements (like an image inside a card) have a slightly smaller radius (e.g., 12px) to maintain visual concentricity with the 16px outer frame.

## Components

### Buttons
- **Primary:** Electric Blue background, white text, 12px radius. Add a subtle `box-shadow` of the same color at 30% opacity on hover.
- **Secondary/Glass:** `rgba(255, 255, 255, 0.05)` background with a 1px border of `rgba(255, 255, 255, 0.1)`. Backdrop blur applied.

### Glass Cards
- Feature cards should use the glassmorphism stack: 16px radius, 20px backdrop blur, and a 1px subtle white stroke.
- **Interactive State:** On hover, the border opacity should increase to `rgba(59, 130, 246, 0.5)` (Primary Blue) to indicate focus.

### Input Fields
- Dark, recessed appearance. `rgba(0, 0, 0, 0.2)` background, 1px border.
- **Focus State:** Border changes to Electric Blue with a 2px outer glow (bloom).

### Success Indicators/Chips
- Used for "Verified" or "Active" tags.
- Emerald Green text on a `rgba(16, 185, 129, 0.1)` background. Pill-shaped (fully rounded).

### 3D Depth Elements
- Use linear gradients for illustrations and icons that move from #3B82F6 to a darker indigo to simulate light-source directionality.
- Elements should appear to "float" using the ambient shadow rules defined in the Elevation section.