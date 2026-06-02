---
name: ProductPath OS
colors:
  surface: '#0e1323'
  surface-dim: '#0e1323'
  surface-bright: '#34394a'
  surface-container-lowest: '#080d1d'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f30'
  surface-container-high: '#24293a'
  surface-container-highest: '#2f3446'
  on-surface: '#dee1f8'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dee1f8'
  inverse-on-surface: '#2b3041'
  outline: '#8e909a'
  outline-variant: '#44474f'
  surface-tint: '#adc6ff'
  primary: '#d8e2ff'
  on-primary: '#122f5f'
  primary-container: '#adc6ff'
  on-primary-container: '#385283'
  inverse-primary: '#455e90'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00b47d'
  on-secondary-container: '#003e28'
  tertiary: '#ffdbc4'
  on-tertiary: '#502501'
  tertiary-container: '#feb685'
  on-tertiary-container: '#79451e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#2c4677'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#6b3a14'
  background: '#0e1323'
  on-background: '#dee1f8'
  surface-variant: '#2f3446'
  surface-glass: rgba(22, 29, 49, 0.7)
  border-white-low: rgba(255, 255, 255, 0.1)
  glow-primary: rgba(173, 198, 255, 0.5)
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
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.15em
  label-micro:
    fontFamily: Inter
    fontSize: 10px
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

ProductPath OS is a high-performance career management platform designed for ambitious professionals. The brand personality is **technical, sophisticated, and kinetic**, evoking the feeling of a mission control center for one's professional life. 

The design style is a refined **Glassmorphism**, utilizing deep navy-space backgrounds, translucent frosted layers, and vibrant neon accents to create a sense of depth and futuristic precision. It avoids the "playfulness" of consumer apps in favor of a "pro-tool" aesthetic—reliable, data-dense, and highly organized. Atmospheric blurs and subtle glows are used sparingly to highlight active status and critical path milestones.

## Colors

The palette is anchored in a **Dark Color Mode** to reduce eye strain during deep work. 
- **Primary (#adc6ff):** A desaturated periwinkle blue used for branding, primary actions, and "complete" states.
- **Secondary (#4edea3):** A vibrant mint green used exclusively for positive metrics, success indicators, and secondary milestones.
- **Neutral (#0e1323):** A deep obsidian blue that serves as the base canvas.
- **Atmospheric Accents:** Semi-transparent whites and primary-tinted glows create the "glass" effect, ensuring the UI feels light and airy despite the dark background.

## Typography

The system relies entirely on **Inter** to maintain a clean, systematic, and utilitarian feel. 
- **Visual Hierarchy:** Established through aggressive weight variance and letter spacing rather than font mixing. 
- **Tracking:** High-intent labels (overlines and small buttons) utilize wide letter spacing (0.1em+) to improve legibility at small sizes. 
- **Weight:** Headers use SemiBold (600) to ExtraBold (800) to anchor the page, while body text remains Regular (400) for maximum readability.

## Layout & Spacing

The system uses a **Fixed Grid** approach for the central content area (max-width: 1200px), flanked by a persistent sidebar on desktop.
- **Sidebar:** Fixed 256px (64 units) width, providing a stable navigation anchor.
- **Rhythm:** A 4px base unit informs all spacing. Standard component gaps are 16px (md) or 24px (lg).
- **Responsive Behavior:** On mobile, the sidebar collapses into a bottom or top-navigation pattern, and horizontal margins shrink from 48px to 16px. Large grid structures (2-column cards) reflow into a single vertical stack.

## Elevation & Depth

Depth is communicated through **Z-axis layering and Backdrop Filtering** rather than traditional drop shadows.
- **Level 0 (Background):** Deepest layer (#0e1323) with organic, large-scale color blurs in corners.
- **Level 1 (Glass Cards):** Surfaces using `rgba(22, 29, 49, 0.7)` with a 20px blur. They feature a 1px `white/10` border to define edges.
- **Level 2 (Active States):** Elevated elements use a "Glow" effect, utilizing a drop shadow with the primary color (e.g., `0 0 20px rgba(173,198,255,0.4)`).
- **Navigation:** Top and side bars use a higher opacity and blur factor to appear as though they are floating significantly above the content.

## Shapes

The shape language is **distinctly rounded but structured**. 
- **Cards:** Use a large 24px (1.5rem) radius to feel modern and friendly.
- **Interactive Elements:** Buttons and input fields use a 12px (0.75rem) radius.
- **Micro-elements:** Status chips and small badges use "Full" rounding (Pill-shaped) to distinguish them from structural containers.
- **Nodes:** Roadmap icons and avatars are always circular (Full radius).

## Components

- **Buttons:** Primary buttons are high-contrast (Primary color background). Secondary buttons are "Ghost" style (white/5 background with 1px border). All buttons feature a subtle `hover:scale-95` or `hover:scale-105` transition.
- **Glass Cards:** The workhorse of the UI. Must always include a backdrop blur and a thin, low-opacity border. Hover states should increase the border brightness.
- **Progress Bars:** Use a dual-layered approach. The track is a low-opacity white/5, and the fill is a solid primary color with a matching glow.
- **Inputs:** Dark containers with `outline-variant` borders. Focus states transition the border to the primary color with a 2px ring.
- **Roadmap Nodes:** Vertical or horizontal lines using linear gradients. Completed nodes are solid; active nodes are outlined with a center pulse; locked nodes are desaturated and low-opacity.
- **Status Chips:** Small, uppercase text inside pill-shaped containers with 10% opacity backgrounds matching the text color (e.g., Green text on 10% Green background).