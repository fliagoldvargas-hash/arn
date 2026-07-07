# Content Sections Specification

## Overview
- Target file: `src/components/NeurixLanding.tsx`
- Screenshots: `docs/design-references/neurix.sh/sections/marketplace.png`, `labs.png`, `ecosystem.png`, `cta-footer.png`
- Interaction model: mostly static; ecosystem contract pill is click-driven.

## DOM Structure
- Marketplace: centered intro, body note, text link.
- Agent Labs: centered intro, 3 metric cards.
- Ecosystem: centered intro, 4 metric cards, copy pill.
- CTA: centered large heading, body, two buttons.
- Footer: compact link rows.

## Computed Styles
- Section padding: 20px/80px variants.
- Intro width: about 700px.
- Headings: serif, 42px to 68px responsive.
- Metric cards: bordered row, rgba(255,255,255,0.03) background, serif numeric values.
- Footer: uppercase 9px text, centered.

## Text Content
- Discover agents worth investing in.
- Pushing the boundary.
- Protocol metrics.
- The infrastructure for intelligent agents is here.
- Docs, Marketplace, Roadmap, Status, X, Solana, Pump.fun, Meteora, Jupiter.

## States & Behaviors
- Contract pill: click copies address and shows `Copied`.
- Links/buttons: subtle hover brightness and border change.

## Responsive Behavior
- Desktop: metrics 3 or 4 columns.
- Tablet: metrics 2 columns.
- Mobile: metrics 1 column.
