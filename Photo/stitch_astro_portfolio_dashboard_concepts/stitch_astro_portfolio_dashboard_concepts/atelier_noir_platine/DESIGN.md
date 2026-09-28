---
name: Atelier Noir & Platine
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474a'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777a'
  outline-variant: '#c5c6ca'
  surface-tint: '#5c5f62'
  primary: '#5c5f62'
  on-primary: '#ffffff'
  primary-container: '#e5e7eb'
  on-primary-container: '#64676b'
  inverse-primary: '#c4c7ca'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#575d78'
  on-tertiary: '#ffffff'
  tertiary-container: '#e2e6ff'
  on-tertiary-container: '#606681'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e2e6'
  primary-fixed-dim: '#c4c7ca'
  on-primary-fixed: '#191c1f'
  on-primary-fixed-variant: '#44474a'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#bfc5e4'
  on-tertiary-fixed: '#141a32'
  on-tertiary-fixed-variant: '#3f465f'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '600'
    lineHeight: 80px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 44px
    fontWeight: '500'
    lineHeight: 52px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.12em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 3rem
---

## Brand & Style

The design system embodies a refined editorial-technical aesthetic designed for high-caliber design engineering, architecture, and technology leadership portfolios. It balances the stark precision of a technical blueprint with the understated luxury of an haute-monograph. 

The aesthetic is anchored in an elevated editorial minimalism: generous negative space, crisp hairline dividers, architectural grid structures, and meticulous typographic cadence. Instead of relying on decorative flourishes or ephemeral trends, the interface conveys authority through high-contrast structural discipline, sculptural monochrome surfaces, and deep midnight anchors. The emotional response should be immediate clarity, quiet confidence, and tactile digital craftsmanship.

## Colors

The palette operates on an inverted architectural hierarchy where light gray/platinum forms the foundational ambient canvas, crisp pure white acts as elevated structural content planes, and deep midnight navy anchors the composition with authoritative contrast.

- **Primary (`#E5E7EB` - Platinum / Light Gray):** Serves as the primary canvas and structural background environment. It provides a tactile, concrete-like architectural wash that prevents ocular fatigue while making white foreground panels decisively pop.
- **Secondary (`#FFFFFF` - Pure White):** Reserved for elevated surface cards, editorial showcase panels, modals, and brilliant highlights.
- **Tertiary (`#0A1128` - Deep Midnight Navy):** The core ink and structural contrast tone. Used for high-impact typography, hero section contrast backdrops, technical badges, navigation frames, and primary interactive states.
- **Neutral (`#64748B` - Slate Grey):** Deployed for secondary metadata, technical captions, subtle borders (`rgba(10, 17, 40, 0.08)`), and inactive states.

### Contrast Application
Text against the Platinum background defaults to Deep Midnight Navy for headings (AAA compliance) and a darkened Slate (`#334155`) for body copy. Inverted sections leverage full `#0A1128` fields with White and Platinum typographic treatments to denote shifts between case study narratives and technical project matrices.

## Typography

The typography unites three distinct typographic personalities:

1. **Space Grotesk (Headlines & Section Indexing):** Provides an architectural, modernist identity with subtle engineered quirks. Its geometric proportions bring precision and distinction to project titles and editorial hooks.
2. **Hanken Grotesk (Body & Long-form Narrative):** A razor-sharp, contemporary grotesque that prioritizes effortless legibility, natural balance, and neutral delivery for project case studies and design rationale.
3. **JetBrains Mono (Metadata, Metrics & Technical Specs):** Used selectively for taxonomy labels, project dates, commit hashes, client metadata, tags, and technical stack chips. It introduces an authentic engineering subtext.

### Typographic Rules
- Always pair uppercase `label-caps` with loose tracking (`0.12em`) when introducing project categories or timeline indicators.
- Numeric metrics (e.g., performance increases, project KPIs) must use `Space Grotesk` tabular figures or `JetBrains Mono` to maintain structural rhythm.

## Layout & Spacing

The layout is built on a 12-column responsive fluid grid governed by strict column rules and architectural rhythm:

- **Desktop (1200px+):** 12 columns, `1.5rem` gutters, and `4rem` outer boundary margins. Max content container is capped at `1440px`.
- **Tablet (768px - 1199px):** 8 columns, `1.25rem` gutters, and `2rem` outer margins.
- **Mobile (320px - 767px):** 4 columns, `1rem` gutters, and `1.25rem` canvas edge margins.

### Spatial Discipline
Spacing follows an exact 4px/8px modular cadence. Layouts prefer asymmetrical column distributions (e.g., 4-column sticky project brief paired with an 8-column visual artifact scroll). Whitespace is treated as active structural mass: case study transitions demand `space-xl` (expanded to `6rem` for macro section breaks) to cleanly delineate distinct conceptual work.

## Elevation & Depth

Visual hierarchy is established using layered plane architecture, sharp tonal delineation, and hairline borders rather than heavy blur shadows.

- **Base Layer (L0):** Platinum ground (`#E5E7EB`).
- **Surface Layer (L1):** Pure White cards and showcase slabs (`#FFFFFF`) with a 1px border of `rgba(10, 17, 40, 0.08)` and an ultra-subtle ambient drop: `box-shadow: 0 1px 3px rgba(10, 17, 40, 0.04), 0 12px 24px -12px rgba(10, 17, 40, 0.06)`.
- **Raised Interactive Layer (L2):** Active hover states, flyout menus, and persistent header bars. Elevation is communicated by lifting the card `translateY(-2px)` and intensifying the border to `rgba(10, 17, 40, 0.20)`.
- **Deep Anchor Layer (Structural Inversion):** Full-bleed blocks or floating consoles styled in solid Midnight Navy (`#0A1128`). This produces an immediate foreground-background inversion for terminal views, primary callouts, or full-width showcase moments.
- **Dividers & Rules:** Hairline 1px solid vectors tinted to `rgba(10, 17, 40, 0.1)` define boundaries without visual clutter.

## Shapes

The design system maintains a controlled, semi-structural shape language (`Soft - level 1`):

- **Micro elements (chips, inputs, small buttons):** `0.25rem` (4px).
- **Cards, structural panels, and image viewports:** `0.5rem` (8px).
- **Large thematic overlays and modals:** `0.75rem` (12px).

Rounding is intentionally restrained to maintain an engineered, precision-milled physical quality. Circular shapes are strictly isolated to status indicators, avatars, and pagination dots.

## Components

### Buttons
- **Primary:** Deep Midnight Navy (`#0A1128`) fill, pure white text (`#FFFFFF`), `0.25rem` radius, typography `label-code` uppercase. Hover shifts to an interactive ink blue (`#152042`) with subtle forward translation.
- **Secondary / Outline:** Transparent fill, pure white panel background when rested on platinum, 1px border of `rgba(10, 17, 40, 0.25)`, text in `#0A1128`. Hover: fill transitions to `#0A1128` with text shifting to `#FFFFFF`.
- **Ghost:** No border or background; text in `#0A1128` with a 1px baseline underline that animates width from 0 to 100% on hover.

### Chips & Technical Badges
- **Technical Chip:** JetBrains Mono font, 11px, padded `4px 10px`. Background in `#0A1128` with white text for primary disciplines, or White background with `1px solid rgba(10, 17, 40, 0.15)` and slate text (`#475569`) for technology taxonomy tags.

### Project & Case Study Cards
- Constructed with a pure white (`#FFFFFF`) interior surface surrounded by an ultra-fine structural border (`rgba(10, 17, 40, 0.08)`).
- Image media containers sit flush or with a uniform `space-md` internal inset padding.
- Cards showcase metadata at the top right via JetBrains Mono labels, followed by Space Grotesk headings. Hover interactions invoke an edge contrast increase rather than glowing colors.

### Input Fields & Controls
- **Inputs:** Crisp white fill, 1px border in `#CBD5E1`. Active focus transitions border to `#0A1128` with no fuzzy outer focus ring—instead using a crisp 1px offset outline.
- **Checkboxes & Radios:** Minimal geometric squares and circles with 1.5px stroke `#0A1128`. Checked states use solid `#0A1128` fill with sharp white icons.

### Lists & Index Views
- Editorial table index view: rows divided by 1px hairline rules (`rgba(10, 17, 40, 0.1)`). Hovering an index item smoothly reveals a floating image preview thumbnail and highlights text from Slate to Deep Midnight.