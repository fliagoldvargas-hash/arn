# Marketplace Demo Specification

## Overview

- Target file: `src/components/RyuxMarketplacePage.tsx`
- Route: `src/app/marketplace/page.tsx`
- Reference screenshots:
  - `docs/design-references/neurix-marketplace/desktop-full.png`
  - `docs/design-references/neurix-marketplace/mobile-full.png`
- Interaction model: mostly static visual demo with hover states and visual-only filters.

## DOM Structure

- `main.marketplace-demo-shell`
  - fixed `nav.nav`
  - `section.marketplace-demo-hero`
    - logo mark
    - overline
    - h1
    - body text
    - four stats
    - search field
  - `section.marketplace-demo-library`
    - tabs and sort select
    - three `article.marketplace-demo-card`
  - footer

## Visual Requirements

- Background: black with very subtle grid lines.
- Hero: centered, large italic serif heading, dim supporting copy.
- Metrics: thin top/bottom borders, four cells desktop, two columns mobile.
- Cards: dark outlined cards, understated hover lift, internal mini red sparkline.
- Typography: reuse existing RYUX site fonts and tokens.

## Content Adaptation

- Replace Neurix with RYUX.
- Do not use original agent names Thesis, ClawX/Claudex, or Blob.
- Use generic demo agents: Signal, Vector, Relay.
- Make clear that data is demo placeholder content.

## Responsive Behavior

- Desktop: 3 cards in one row.
- Tablet/mobile: cards stack to one column.
- Mobile hero uses reduced heading size and narrower page gutters.
