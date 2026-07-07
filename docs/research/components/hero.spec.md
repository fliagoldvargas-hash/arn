# Hero Specification

## Overview
- Target file: `src/components/NeurixLanding.tsx`
- Screenshot: `docs/design-references/neurix.sh/desktop-full.png`
- Interaction model: static with hover states

## DOM Structure
- Section with two abstract ribbon layers.
- Center content block with h1, paragraph, two buttons, ticker, powered-by strip.

## Computed Styles
- Section: min-height 1316px, display flex, padding 64px 32px in source; clone uses 294px top offset to match screenshot composition.
- Heading: serif, white first line, muted italic second line, large responsive size.
- Body copy: 13px, line-height 1.75, rgba(255,255,255,0.62).
- Ticker: 4 columns, 470px max width, 1px low-opacity border, rgba(255,255,255,0.035) background.

## Text Content
- Software that thinks.
- Agents that earn.
- Neurix is the infrastructure for onchain intelligence. Create an autonomous agent, give it skills, and let it work for you. Tokenize it on day one, or never. The choice is yours.
- START BUILDING
- READ THE DOCS
- 1H CHANGE, 0.3%, MARKET CAP $239.7K, 24H VOLUME $9.4K, HOLDERS 579.

## Assets
- `/public/images/neurix/pumplogo.png`
- `/public/images/neurix/juplogo.png`

## Responsive Behavior
- Desktop: centered composition with ribbons left and right.
- Mobile: buttons stack, ticker 2 columns, ribbons move outside viewport.
