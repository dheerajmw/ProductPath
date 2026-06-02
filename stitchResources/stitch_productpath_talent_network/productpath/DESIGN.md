---
name: ProductPath
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
  tertiary: '#c0c1ff'
  on-tertiary: '#1000a9'
  tertiary-container: '#8083ff'
  on-tertiary-container: '#0d0096'
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
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#0e1323'
  on-background: '#dee1f9'
  surface-variant: '#2f3446'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  code:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
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
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built to feel like a "Career Operating System" for elite product talent. It rejects the cluttered, pedagogical aesthetics of traditional Learning Management Systems (LMS) in favor of a high-performance, developer-adjacent environment inspired by modern engineering tools like Vercel and Linear.

The brand personality is **Precise, Authoritative, and Future-Forward**. It prioritizes technical proficiency and skills over traditional credentials, using a sleek, dark-mode interface to signal a premium, invite-only professional atmosphere. The design style is a blend of **Minimalism** and **Glassmorphism**, emphasizing clarity through depth, subtle light diffraction, and ultra-crisp typography.

## Colors

The palette is anchored in a **Deep Navy (#0B1020)** foundation to provide a sophisticated, low-fatigue environment. 

- **Primary (Electric Blue):** Used for primary actions, focus states, and progress indicators. It represents momentum and energy.
- **Success (Emerald Green):** Reserved exclusively for "Verified" statuses, skill endorsements, and successful completions. This high-contrast pairing against the navy background creates an immediate "trust signal."
- **Neutral/Surface:** We use a tiered system of navy shades. Surface-1 is the base background; Surface-2 is for cards and containers, providing enough contrast to eliminate the need for heavy shadows.
- **Accents:** Subtle indigo gradients are used sparingly to highlight high-value "Skills-first" sections.

## Typography

We utilize **Geist** for its technical precision and exceptional legibility in dark environments. The typographic hierarchy is aggressive, using significant scale differences to guide the eye through dense skill data.

- **Headlines:** Use tight letter-spacing and heavy weights to create a "locked-in" professional look.
- **Body:** Generous line-height (1.5–1.6) ensures readability for long-form product case studies.
- **Technical Data:** JetBrains Mono is used sparingly for metadata, timestamps, and "Skill IDs" to reinforce the OS-like aesthetic.
- **Scaling:** On mobile, display sizes are reduced by approximately 30% to maintain content density without sacrificing the premium feel.

## Layout & Spacing

The layout philosophy follows a **12-column fluid grid** for desktop, transitioning to a single-column stack for mobile. 

- **Generous Whitespace:** To differentiate from cluttered job boards, we use an 8px base unit with significant "breathing room" (48px–80px) between major sections.
- **The "Power User" Grid:** While the spacing is generous, data-heavy views (like skill graphs or talent directories) utilize tighter 12px or 16px internal padding within cards to maximize information density.
- **Breakpoints:**
  - Mobile: < 768px (16px margins)
  - Tablet: 768px - 1024px (24px margins)
  - Desktop: > 1024px (Center-aligned fixed-width container at 1280px).

## Elevation & Depth

This design system uses **Layered Glassmorphism** instead of traditional shadows to define hierarchy.

1.  **Level 0 (Background):** The base Deep Navy (#0B1020).
2.  **Level 1 (Cards/Containers):** A slightly lighter navy with a 1px solid border at 10% opacity white.
3.  **Level 2 (Overlays/Modals):** A frosted effect using `backdrop-filter: blur(12px)` and a semi-transparent background (`rgba(22, 27, 44, 0.7)`). This creates a sense of physical space and "light" passing through the UI.
4.  **Accent Lighting:** Subtle, large-radius radial gradients (Electric Blue at 5% opacity) are positioned behind primary containers to create a "glow" effect, suggesting energy and focus.

## Shapes

The shape language is **Structured and Modern**. 

- **Cards & Primary Containers:** Use a 12px (`rounded-lg`) corner radius. This is soft enough to feel approachable but sharp enough to maintain a professional, systematic edge.
- **Badges & Tags:** Use a full pill-shape (999px) to distinguish "metadata" from "interactive cards."
- **Buttons:** Match the 12px radius of the cards to maintain visual continuity.
- **Verification Icons:** Use a sharp, precise geometric seal to emphasize the "Verified" status.

## Components

### Buttons
- **Primary:** Electric Blue fill with white text. High-contrast, 12px radius.
- **Secondary/Ghost:** 1px white (10% opacity) border with a subtle hover state that increases border opacity to 30%.
- **Action Size:** 44px minimum height for mobile accessibility.

### Cards
- **Glass-Card:** 12px blur, 1px white-alpha-10 border, 24px internal padding. 
- **Hover State:** On hover, the border should transition to Electric Blue at 40% opacity, and a subtle "inner glow" should appear.

### Badges & Verification
- **Skill Badges:** Pill-shaped, dark-grey background with white text. On "Expert" skills, add a subtle Electric Blue outer glow.
- **Verified Status:** An Emerald Green badge featuring a minimalist checkmark icon. This badge should always be high-contrast against its parent surface.

### Input Fields
- **Styling:** Darker than the card surface. 1px border. Focus state triggers an Electric Blue glow (`0px 0px 8px rgba(59, 130, 246, 0.5)`).
- **Labels:** Always use the `label-md` Geist font for clarity, positioned above the field.

### Lists
- **Talent List:** Use horizontal separators (1px, alpha-10 white) with generous 24px vertical padding between items. No zebra-striping; use hover-lift effects instead.