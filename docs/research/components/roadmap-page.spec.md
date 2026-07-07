# Roadmap Page Specification

## Overview
- Target files: `src/app/roadmap/page.tsx`, `src/components/RyuxRoadmapPage.tsx`
- Screenshots: `docs/design-references/neurix-roadmap/desktop-full.png`, `mobile-full.png`
- Interaction model: static timeline.

## DOM Structure
- `roadmap-shell`
- Fixed `nav`
- `roadmap-hero` with progress indicator
- `roadmap-timeline`
- Repeated `roadmap-card` articles
- Footer

## Visual Style
- Black background with vertical grid lines.
- Serif italic heading, muted sans-serif labels.
- Timeline cards use 1px rgba white border and low-opacity background.
- Completed phase has a brighter timeline dot; pending cards are dimmed.

## Adapted Content
- Phase 1: Genesis Launch, completed, 06 JUL 2026, 4/4.
- Phase 2: Marketplace Opening, pending, 15 JUL 2026, 0/4.
- Phase 3: Wallet and Dashboard, pending, late JUL 2026, 0/4.
- Phase 4: Agent Builder Layer, pending, AUG 2026, 0/5.
- Phase 5: Ecosystem Expansion, pending, SEP 2026, 0/4.

## Responsive
- Desktop: wide centered cards with left rail.
- Mobile: compact cards, metadata stacked, smaller hero.
