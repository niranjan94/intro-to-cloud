---
name: add-concept
description: >-
  Author a new cloud concept lesson end to end in the intro-to-cloud app: ground
  the facts in official AWS and Azure documentation, register it in the concept
  catalog, and write the complete per-provider lesson (equivalence panel,
  diagrams, interactivity, and links to the authoritative docs) that matches the
  quality of the existing Virtual Network lesson.
  Use this whenever the user wants to add, author, build, or fill in a concept,
  lesson, or topic (for example "add a DNS concept", "write the object storage
  lesson", "build out the load balancer topic", "fill in the relational database
  slot"), even if they don't say the word "concept". Also use it when wiring a
  new entry into the concept registry or when turning an external explainer into
  an in-app lesson.
---

# Add a concept

This skill authors a new concept lesson in the intro-to-cloud app to the same
standard as the shipped ones. A concept is a provider-agnostic cloud idea (e.g.
Object Storage) taught through two lenses (AWS and Azure). The work spans three
things: catalog metadata, per-provider lesson components, and factual research.

The codebase is the source of truth, not this skill. Types, tokens, and the
stage taxonomy evolve; always read the live files named below rather than
trusting values memorized here. This skill tells you *where* to look and *what
good looks like*.

## Before you start: read the model

Read these first, in order. They define every contract you must honor:

1. `src/content/types.ts` — the `Concept`, `Provider`, and `Stage` types. Note
   the current `Stage` union and the `STAGES` order; do not hardcode stage names
   from memory. Note `wip`, `services`, and the `components` loader map.
2. `src/content/registry.ts` — the `concepts` array (the catalog) and its
   helpers. This is where a new concept is registered.
3. `src/app/[provider]/[concept]/page.tsx` — how a lesson is routed and how an
   unauthored concept falls back to "coming soon".
4. `docs/adr/0002-*.md` and `docs/adr/0003-*.md` — the two decisions that
   constrain every lesson: no provider brand color as surface (dots only), and
   concepts are bespoke per-provider React components behind a typed registry.

Then read `references/concept-model.md` for how these fit together.

## Workflow

### 1. Pin down the concept

Establish, with the user if unclear:

- **id** — kebab-case, unique (e.g. `load-balancing`). Becomes the URL segment
  and the folder name under `src/content/concepts/`.
- **title** — display name (e.g. "Load Balancing").
- **stage** — which learning stage it belongs to. Read the live `Stage` union in
  `types.ts`; pick the stage whose prerequisites the concept assumes.
- **services** — the named AWS and Azure services (e.g. AWS "Elastic Load
  Balancing", Azure "Azure Load Balancer"). If the concept already exists as a
  stub in `registry.ts`, its metadata is likely already filled; reuse it.
- **short** — one-line, provider-agnostic card description.

### 2. Ground the facts in official documentation (both providers)

Lessons teach real infrastructure; wrong facts are the worst failure mode, and a
plausible-sounding blog post is not a source. Before you write a line of the
lesson, ground every technical claim you plan to make in the provider's own
first-party documentation, for **both** providers: the AWS Documentation
(`docs.aws.amazon.com`) and Microsoft Learn / Azure docs (`learn.microsoft.com`).
Other clouds have first-party docs too (Google Cloud at `cloud.google.com/docs`,
etc.); the principle is the same, ground in the vendor's own pages, not
third-party summaries.

The repo ships a `docs-grounding` skill built for exactly this; invoke it for the
grounding pass, or run the same idea by hand with `mcp__exa__web_search_exa` and
`mcp__exa__web_fetch_exa` pointed at the official domains. Delegate the work to a
subagent so the research does not crowd your context, and ask it to return a
compact fact sheet in which every claim carries the authoritative URL it was
verified against. Prior authoring caught a real error this way (AWS reserves 5
addresses per subnet, not 0), so treat grounding as load-bearing, not decorative.

Capture, per provider:

- the exact service name and the key resource nouns (for the glossary);
- the real CLI invocation, checked against the official CLI reference;
- any provider-specific gotcha worth a callout;
- the canonical documentation URL backing each major claim. These URLs are not
  only for your own verification: they become the reader-facing "Further reading"
  links in step 4, so tie each one to the specific page a curious learner would
  actually want, not a generic product landing page.

Note where the two providers genuinely diverge; that divergence is what justifies
bespoke content rather than a shared component.

### 3. Choose the interactivity depth

Match the interactivity to the concept; do not over- or under-build. Two
reference shapes exist in the codebase:

- **Simple shape** — equivalence panel, a static diagram, the CLI block, and a
  glossary. Reference: `src/content/concepts/object-storage/lesson.tsx`. Right
  for concepts that are mostly "here is the thing and its parts".
- **Rich shape** — a data-driven, multi-chapter interactive lesson where all
  provider differences live in a `data.ts` and provider-agnostic client
  components render them. Reference: `src/content/concepts/virtual-network/`
  (chapters, hotspot map, CIDR validator, animated packet simulator, firewall
  trace, quiz). Right for concepts with mechanics worth *doing*, not just
  reading, or where AWS and Azure diverge enough to need per-provider data.

A middle option is the object-storage shape plus a single focused interactive
component, like `src/content/concepts/virtual-machines/vm-interactive.tsx`.

If the depth isn't obvious, ask the user. When building rich interactivity, read
`references/interactive-patterns.md`.

### 4. Scaffold the lesson files

Every concept lives in `src/content/concepts/<id>/`. The minimum is three files,
following the exact pattern of the existing concepts:

- `lesson.tsx` — a server component `export function <Name>Lesson({ provider })`
  that composes the lesson kit inside `LessonLayout`. Read
  `references/lesson-kit.md` for every kit component's API.
- `aws.tsx` — `export default function Aws<Name>() { return <Name>Lesson provider="aws" /> }`.
- `azure.tsx` — the Azure twin.

Rich lessons add `data.ts` plus the client components (see the virtual-network
folder for the full set). Keep provider differences in `data.ts`, not in
`if (provider === ...)` branches scattered through render code.

Every lesson closes with a **Further reading** section: a short list of links to
the authoritative provider documentation for the active lens, so a reader who
wants the real thing can go straight to it. The URLs come from the fact sheet in
step 2. Keep the links per-provider (they swap with the lens), label each by what
the page actually is (not "click here"), and render them as real external links.
See `references/lesson-kit.md` for where this lives; if the shared kit has no
links component yet, add a small one under `src/components/lesson/` following the
kit conventions rather than hand-rolling anchor markup inside the lesson.

### 5. Register it

In `src/content/registry.ts`, either fill an existing stub's `components` map or
add a new `Concept` object to the `concepts` array in learning-path order. Wire
`components.aws` and `components.azure` to lazy imports of the new entry files:

```ts
components: {
  aws: () => import("./concepts/<id>/aws"),
  azure: () => import("./concepts/<id>/azure"),
},
```

Set `wip: true` while the lesson is still being written; remove it once done.

### 6. Follow the house rules

These are non-negotiable in committed artifacts (code, comments, copy):

- No em dashes anywhere in committed content. Use a colon, a period, or " · ".
- Provider brand color appears only as small identity dots, never as a surface
  (ADR-0002). Semantic color coding uses inline `oklch(...)`, matching the
  existing components.
- Light-only design: no dark-mode variant, no `.dark` block.
- Respect `prefers-reduced-motion` in any animation (use `motion-safe:` or the
  `prefersReducedMotion()` helper the virtual-network kit already has).
- Use the design tokens, not ad-hoc colors or a rem spacing scale. See
  `references/design-and-house-rules.md`.
- Prose is neutral and professional. No personality in shipped copy.

### 7. Verify

- `pnpm exec tsc --noEmit` is clean.
- `pnpm lint` (Biome) is clean on the new files.
- Run the app and drive **both** lenses end to end: `/aws/<id>` and
  `/azure/<id>` load (not "coming soon"), every interactive control works by
  mouse and keyboard, focus rings are visible, and the lens switch swaps
  providers. Confirm no brand color is used as a surface.

### 8. Re-ground: review the finished lesson against the docs

After the lesson builds and both lenses render, spawn a fresh subagent to review
the finished lesson against current official documentation, for **both**
providers. A clean re-read by an agent that did not write the copy catches drift
between what you intended in step 2 and what the lesson actually says, and catches
links that rot or point at the wrong page. This is a separate pass from your own
step 7 verification, and it is not optional: shipping a wrong fact is worse than
shipping late.

Give the subagent the rendered copy (or the lesson source) plus the
`docs-grounding` skill, and ask it to, for each provider:

- confirm every factual claim (service names, limits, reserved counts, CLI
  syntax, default behaviors) against the first-party docs, citing the page it
  checked;
- confirm every "Further reading" link resolves and is the page its label
  promises;
- flag anything unverifiable or contradicted, with the correct value and its
  source.

Fix whatever it flags, then re-run the check if the fixes were substantive. Treat
an unverifiable claim as one to cut or soften, not to ship on faith.

### 9. Commit

Conventional Commits, no co-authors, no "Generated with Claude Code". Typical
sequence:

- `feat(lesson): add <id> interactive components and data` (rich lessons)
- `feat(lesson): assemble <id> lesson and wire registry`

## Reference files

- `references/concept-model.md` — how types, registry, routing, and stages fit.
- `references/lesson-kit.md` — the shared lesson components and their props.
- `references/interactive-patterns.md` — the data-driven rich-lesson pattern.
- `references/design-and-house-rules.md` — tokens, ADR constraints, house rules.
