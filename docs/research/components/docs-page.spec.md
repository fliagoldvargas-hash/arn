# Docs Page Specification

## Overview
- Target files: `src/app/docs/page.tsx`, `src/components/RyuxDocsPage.tsx`
- Screenshots: `docs/design-references/neurix-docs/desktop-full.png`, `docs/design-references/neurix-docs/mobile-full.png`
- Interaction model: static documentation page with nav scroll state and wallet click action.

## DOM Structure
- Fixed navigation.
- `docs-hero` section.
- Repeated `docs-section` blocks for problem, process, skills, audience, and safety.
- Wide `vision-panel` and `technical-panel`.
- Disclaimer and footer.

## Computed Style Targets
- Main background: black with subtle vertical column lines.
- Content max widths: 720px for text sections, 982px for wide panels.
- Cards: 1px rgba(255,255,255,0.1) border, rgba(255,255,255,0.018) background.
- Headings: Lora/Georgia serif, 42-64px desktop, regular or italic.
- Body text: Plus Jakarta Sans, muted white, 16-18px desktop.

## Text Content
- Adapted from original Neurix docs page, with brand changed to RYUX.
- Covers problem/solution, process, skill market, builders/investors, vision, trust/safety, technical docs, and disclaimer.

## Responsive Behavior
- Desktop: two-column cards and full-width rows.
- Tablet: grids become one column.
- Mobile: reduced hero height, smaller headings, compact cards and nav.
