# Platform Grid Specification

## Overview
- Target file: `src/components/NeurixLanding.tsx`
- Screenshot: `docs/design-references/neurix.sh/sections/platform.png`
- Interaction model: static with link hover states

## DOM Structure
- Centered section intro.
- Bordered 6-column grid.
- Cards 01 and 02 span 3 columns; cards 03, 04, 05 span 2 columns.
- Each card has icon box, number, serif italic title, body, optional CTA or badges.

## Computed Styles
- Grid width: about 982px.
- Card border: 1px rgba(255,255,255,0.1).
- Wide cards: min-height 318px.
- Small cards: min-height 218px.
- Card padding: 44px 62px desktop.
- Card title: Lora/Georgia serif, 30px, italic.
- Body: 15px, line-height 1.75, rgba(255,255,255,0.72).

## Text Content
- Build Your Agent
- Tokenize, If You Want
- On-Chain Treasury
- Community Governed
- Creator Rewards

## Responsive Behavior
- Desktop: 6-column grid.
- Tablet/mobile: cards stack to one column.
