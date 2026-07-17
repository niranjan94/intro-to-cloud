# Interactive patterns for rich lessons

The rich lesson shape when a concept has mechanics worth *doing*. The complete,
shipped reference is `src/content/concepts/virtual-network/`. Read those files
alongside this; the point here is the pattern and the reasoning, so you can apply
it to a new concept rather than copy it blindly.

## The core idea: data-driven, provider-agnostic components

ADR-0003 rejects "one component that branches on provider internally". But
duplicating an animated simulator per provider is also wrong. The resolution:
the interactive *components* are provider-agnostic and stateless about which
provider they serve; every provider difference is expressed as **data** in a
single `data.ts`, keyed by `Provider`.

```
data.ts        CONTENT: Record<Provider, LessonContent>   // all the differences
chapters.tsx   reads CONTENT[provider], renders each chapter component with its slice
*.tsx          "use client" components that render whatever data they are handed
```

A component like the CIDR validator or firewall trace never writes
`if (provider === "aws")`. It reads an ordered model from data (e.g. a list of
firewall "gates", a list of flows with pass/fail rules) and the provider
difference emerges from the data. This keeps AWS and Azure genuinely bespoke in
*content* while sharing all the interaction machinery.

## The chapter shell

`chapters.tsx` is a `"use client"` tabbed shell: a chapter nav, prev/next, a
fade between chapters, and a `switch` that renders each chapter's component with
its data slice. Chapter framing (nav label, kicker, title, intro) is itself data
(`ChapterMeta[]` in `data.ts`), so adding or reordering chapters is a data edit.

The virtual-network chapter set (map, nesting, addresses, internet, firewall,
quiz) is specific to networking. For a new concept, design the chapters around
*its* mechanics; reuse the shell structure, not the networking chapters.

## Reusable building blocks already in the folder

These are networking-specific today but show the patterns to follow:

- `callout.tsx` — small myth/fix/note callout, driven by `CalloutData`.
- `controls.tsx` — plain (non-client) shared `Switch` / `Verdict` primitives.
  Kept free of `"use client"` so it is a shared module; note the Next.js
  serializable-props constraint that forced this (don't pass event handlers
  across the client boundary from a server component).
- `tones.ts` — a semantic `Tone` vocabulary (`net`/`public`/`private`/
  `resource`/`firewall`/`ok`) mapped to both Tailwind classes (`TONE`) and raw
  `oklch` values for SVG fills (`TONE_SVG`). Define a similar small semantic
  palette for a new concept rather than scattering raw colors.
- `anim.ts` — animation helpers: `prefersReducedMotion()`, `easeInOut`,
  `tween()`, `roundedPathD()` (builds a clean rounded-corner SVG path), `pop()`.

## Animation guidance

SVG path animation uses `requestAnimationFrame` with `getPointAtLength` to move a
node along a path. Two hard-won points:

- Always honor reduced motion: when `prefersReducedMotion()` is true, jump to the
  end state instead of animating. Wrap CSS animations in `motion-safe:`.
- `requestAnimationFrame` is paused when the tab is backgrounded
  (`document.hidden`). Animations frozen in an automated screenshot are usually
  this, not a bug. Verify in a foreground tab.
- Build paths with `roundedPathD` (rounded corners), not raw straight segments; a
  polyline of straight segments reads as crude. This was explicit user feedback.

## When to reach for rich vs simple

Rich is justified when either is true: the concept has a *mechanism* a learner
learns better by manipulating (address math, routing, request filtering), or AWS
and Azure diverge enough that a shared static diagram would be misleading. If
neither holds, the simple shape (see `references/lesson-kit.md`) plus maybe one
focused interactive component (like `virtual-machines/vm-interactive.tsx`) is the
right amount. Don't build a six-chapter kit for a concept that is really "here is
the thing and its three parts".
