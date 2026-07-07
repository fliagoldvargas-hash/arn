# Navigation Specification

## Overview
- Target file: `src/components/NeurixLanding.tsx`
- Screenshot: `docs/design-references/neurix.sh/sections/hero.png`
- Interaction model: scroll-driven plus hover states

## DOM Structure
- `nav.nav` fixed to top.
- Brand link contains 28px logo and uppercase serif `Neurix`.
- Center link group: Build, Marketplace, Docs.
- Right action group: 30px icon button and Connect outline button.

## Computed Styles
- Container: display grid, height 60px, padding 0 32px, position fixed, z-index 1000, background rgba(0,0,0,0.7).
- Brand text: Lora/Georgia, 11px, letter-spacing 0.18em, uppercase, rgba(255,255,255,0.85).
- Links: uppercase, 10px, letter-spacing 0.18em, rgba(255,255,255,0.75).
- Buttons: transparent background, 1px rgba(255,255,255,0.12) border.

## States & Behaviors
- Scroll trigger: `window.scrollY > 80`.
- State A: transparent black background.
- State B: rgba(0,0,0,0.88) with blur.
- Transition: 0.4s cubic-bezier(0.4,0,0.2,1).
- Hover: links brighten to white.

## Assets
- `/public/images/neurix/neurix-new-logo.jpg`

## Responsive Behavior
- Desktop: three-column nav.
- Mobile: center links hidden, Connect hidden under 560px.
