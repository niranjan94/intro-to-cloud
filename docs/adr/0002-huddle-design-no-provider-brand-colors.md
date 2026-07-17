# Adopt the Huddle design language; do not use provider brand colors

The UI uses the Huddle design system (muted pastel palette, flat 1px hairline borders, no
box-shadow, editorial left-aligned layout, deliberate radius vocabulary). We deliberately do NOT
introduce the providers' saturated brand colors (AWS orange `#FF9900`, Azure blue `#0078D4`) into
the theme. The active Provider is signalled by the provider logo/label in the switcher and text
markers, optionally with a subtle muted-pastel accent, not by re-coloring the UI.

## Why

Huddle's calm, desaturated, poster-like feel is the whole reason the app reads as approachable and
pleasant rather than as another cloud console. Flooding the UI with orange or blue on provider
switch would break that register and pull it toward generic-SaaS-dashboard. The provider is still
unambiguous via logo + label, so we lose recognizability essentially nowhere while keeping the
visual system intact. Huddle's original card-color *status taxonomy* (sage=upcoming, etc.) is
dropped as meaningless here; the three pastels are reused to distinguish Concept Categories instead.

A future contributor will reasonably wonder "why is there no AWS orange?" — this is the answer:
it is intentional, not an oversight.

## Consequences

- If per-provider theming is ever wanted, it must be introduced as muted accents within the palette,
  not saturated brand colors, or this decision should be revisited explicitly.

## Revision (2026-07): provider brand logos are allowed

We now use the real AWS and Azure brand wordmarks (from the Devicon set, stored in `public/logos/`)
as the provider identity in the switcher, the landing chooser, and the lens rail. These logos carry
their own brand colors. This is a deliberate, bounded relaxation of the original decision, not a
reversal of it:

- Brand color appears **only inside the provider logos themselves** — small wordmarks a few
  pixels tall. The page chrome (backgrounds, borders, buttons, text, accents) stays entirely within
  the muted Huddle palette. We do not tint surfaces orange or blue on provider switch.
- Inactive providers render their logo **desaturated (grayscale, reduced opacity)**; only the active
  provider shows full brand color. So the brand color also does double duty as the active-state
  signal, which keeps it purposeful rather than decorative.

Rationale: a generic cloud glyph made the two providers visually interchangeable and slightly
generic. The real marks are instantly recognizable and are the clearest possible provider signal,
which matters for a tool whose whole point is comparing providers. Confining the color to the marks
preserves the calm register the original decision was protecting.

## Revision (2026-07): Huddle palette replaced by the delivered pastel-teal system

The Huddle palette (burnt amber, bone hairlines, flat/no-shadow) has been replaced wholesale by the
visual system a designer delivered (see the handoff prototype the implementation was built from).
The load-bearing decision this ADR records — **provider brand color is signalled by identity, not by
re-skinning the app** — is unchanged and stronger than before. What changed is the surrounding
system, now the single source of truth in `src/app/globals.css`:

- **Palette:** a cool off-white canvas (`oklch(0.985 0.006 220)`) with a single **teal** accent, all
  in oklch. No burnt amber; the primary action is deep teal.
- **Provider identity:** brand logos in the top switcher (active full-color, inactive desaturated)
  and small brand-colored **dots** in the equivalence panel, lens badge, and home flip card. Surfaces
  are never tinted orange/blue on switch — the constraint above holds.
- **Category color:** four muted category hues (Storage 280, Compute 195, Networking 235,
  Databases 50) used only as small wayfinding dots.
- **Shadows are now allowed.** The original "no box-shadow" rule was a Huddle trait; the delivered
  system uses soft shadows for card hover and the home flip card. That rule is retired.

`DESIGN.md` was removed earlier in the project's history; `globals.css` (heavily commented) plus this
ADR are the design record now.
