# Neurix Behavior Notes

## Scroll Sweep
- Header starts as `v2-nav` at y=0 and changes to `v2-nav v2-nav-scrolled` by y=300.
- Extracted nav computed styles: fixed position, height 60px, padding 0 32px, background rgba(0,0,0,0.7), z-index 1000, transition 0.4s cubic-bezier(0.4,0,0.2,1).
- Clone implements the same threshold behavior at 80px with stronger backdrop blur for the scrolled state.

## Click Sweep
- Primary navigation links route to product pages on the live site. In this standalone clone they anchor to local page sections.
- Contract address pill is click-to-copy on the live site. Clone copies `Hrpq2D2Y...pump` and temporarily changes label to `Copied`.

## Hover Sweep
- Buttons, nav links, text links, and bordered controls use subtle color/border/translate changes.
- No dropdowns, modals, tabs, accordions, or carousels were detected on the homepage.

## Responsive Sweep
- Desktop: centered hero, large serif type, platform grid in 6 columns.
- Tablet: nav hides center links, platform cards stack, metrics go to two columns.
- Mobile: CTAs stack vertically, metrics become one column, hero ribbons move outward.
