---
name: add-project
description: >-
  Author or edit a capstone project in the intro-to-cloud app end to end: a
  guided, multi-concept build that assembles services the learner already met
  into one working system, taught through the AWS and Azure lenses. Ground the
  facts and the real provisioning commands in official AWS and Azure
  documentation, register it in the project catalog, and write the complete
  per-provider build (architecture map, request flow, ordered build steps,
  provision script, shared-responsibility and agent panels, quiz, and links to
  the authoritative docs) to the standard of the shipped "Web Server on a VM"
  project.
  Use this whenever the user wants to add, author, build, edit, or fill in a
  capstone, project, guided build, walkthrough, or end-to-end deployment (for
  example "add a static website project", "build the three-tier app capstone",
  "write the serverless API project", "edit the web server project to add
  HTTPS"), even if they don't say the word "project". Also use it when wiring a
  new entry into the project catalog (`src/content/projects.ts`) or when turning
  an assembled multi-service architecture into an in-app guided build.
---

# Add a project

This skill authors a capstone **project** in the intro-to-cloud app to the same
standard as the shipped ones. A project is a guided, end-to-end build that
stitches several **concepts** the learner has already met into one working
system (e.g. a web server on a VM inside a virtual network), shown through two
lenses (AWS and Azure). Where a concept lesson explains one idea, a project puts
ideas to work: it reinforces the concepts rather than restating them, and its
payoff is a real deployment the learner can actually stand up.

Projects are a top-level content type parallel to concepts (ADR-0003): their own
catalog, route (`/[provider]/projects/[project]`), and nav section. If you have
authored a concept lesson before, most of this will feel familiar; the sibling
**`add-concept` skill** shares the design language, house rules, and
interactive-lesson patterns, and this skill points at its references rather than
duplicating them.

The codebase is the source of truth, not this skill. Types, tokens, the shared
lesson kit, and the reference-chapter set evolve; always read the live files
named below rather than trusting values memorized here. This skill tells you
*where* to look and *what good looks like*.

## Before you start: read the model

Read these first, in order. They define every contract you must honor:

1. `src/content/types.ts` — the `Project`, `Provider`, and `Lens` types. Note
   `Project` carries `concepts` (ids it builds on) and `stack` (named services
   per provider), not `stage`/`services`. Note `wip` and the `components` loader
   map. `Project` and `Concept` are deliberately close siblings.
2. `src/content/projects.ts` — the `projects` array (the catalog) and its
   helpers (`getProject`, `projectProviders`, `projectSupportsProvider`). This
   is where a new project is registered. Array order is recommended attempt
   order (simplest build first).
3. `src/app/[provider]/projects/[project]/page.tsx` — how a build is routed and
   how an unauthored project falls back to `ProjectComingSoon`.
4. `src/content/projects/web-server-vm/` — the one shipped, complete project. It
   is your quality bar and your structural template. Read `lesson.tsx`,
   `chapters.tsx`, and `data.ts` in full.
5. `docs/adr/0003-*.md` (bespoke per-provider components behind a typed registry)
   and `docs/adr/0002-*.md` (no provider brand color as a surface; dots only).

Then read `references/project-model.md` for how the catalog, routing, and file
layout fit together, and `references/project-kit.md` for the project-specific
shared components (`ProjectShell`, `StackPanel`, the reference chapters, the
chapter shell, and the concept back-links).

Note: unlike concepts, the domain word "project" is not defined in `CONTEXT.md`;
the load-bearing prose descriptions live in the `Project` type doc comment and
the `projects.ts` header. Read those for the intended framing.

## Editing an existing project

If the task is to edit rather than create (add a chapter, extend a build to a
new lens, correct a fact, add HTTPS to the web-server project), skip the
scaffolding steps. Read the target project's `data.ts` and components first, make
the change where the codebase already puts that kind of content (chapter framing
and provider facts in `data.ts`; interaction machinery in the `.tsx` components),
re-ground any new factual claim (step 2), then verify (step 7) and re-ground
(step 8). Do not restructure a working build to match this skill's ordering;
match the file you are editing.

## Workflow

### 1. Pin down the project

Establish, with the user if unclear:

- **id** — kebab-case, unique (e.g. `web-server-vm`). Becomes the URL segment
  (`/aws/projects/<id>`) and the folder name under `src/content/projects/`.
- **title** — display name (e.g. "Web Server on a VM").
- **short** — one-line, provider-agnostic card description of the finished
  system.
- **concepts** — the ids of the concepts this build assembles, in the order they
  come up. Every id must exist in `src/content/registry.ts`; the build links back
  to each concept's lesson, so a project reinforces concepts rather than
  restating them. If a concept the build needs does not exist yet, flag it: the
  project can still reference it, but the link lands on a "coming soon" page.
- **stack** — the named services each provider assembles, in stack order (e.g.
  AWS `["Amazon VPC", "Amazon EC2"]`, Azure `["Azure Virtual Network", "Azure
  Virtual Machine"]`). This drives the "same build, two stacks" panel.

A good capstone has a clear finished artifact the learner can point at ("a page
served to the internet"), assembles concepts they have already met, and is the
*smallest* complete build that exercises them. Scope down before scoping up.

### 2. Ground the facts and the commands in official documentation (both providers)

A project's whole point is that it actually works, so wrong facts or a
provisioning command that fails are the worst failure mode. A plausible-sounding
blog post is not a source. Before writing the build, ground every technical
claim **and every command a learner might run** in the provider's own
first-party documentation, for **both** providers: AWS Documentation
(`docs.aws.amazon.com`) and Microsoft Learn (`learn.microsoft.com`).

The repo ships a `docs-grounding` skill built for exactly this; invoke it for the
grounding pass, or run the same idea by hand with `mcp__exa__web_search_exa` and
`mcp__exa__web_fetch_exa` pointed at the official domains. Delegate to a subagent
so the research does not crowd your context, and ask it to return a compact fact
sheet where every claim carries the authoritative URL it was verified against.

Capture, per provider:

- the exact service names in stack order (for the `stack` metadata and diagrams);
- the **real, runnable provisioning path**: the CLI commands or the coding-agent
  prompt that stands the system up, checked against the official CLI reference.
  The shipped project ships copy-ready agent prompts (see `AgentSetup` in
  `references/project-kit.md`); every resource name, flag, and image id in them
  must be real. Grounding caught real errors in prior authoring, so treat this as
  load-bearing, not decorative;
- how the request reaches the system and every gate it passes (public front door,
  firewall rule, the server itself) — this drives the request-flow chapter;
- the shared-responsibility split and what is mutable vs fixed-at-creation on the
  live resources, grounded in the provider's own docs;
- the canonical documentation URL backing each major claim. These become the
  reader-facing "Further reading" links; tie each to the specific page a curious
  learner would actually want, not a generic product landing page.

Note where the two providers genuinely diverge (usually *how the machine becomes
reachable* and *how the firewall is shaped*). That divergence is what justifies a
bespoke per-provider build rather than a shared static diagram.

### 3. Design the build's chapters

A project is inherently a rich, chapter-by-chapter build; there is no "simple
shape" for it the way there is for a concept. Reuse the shipped structure rather
than inventing a new one: the shared chrome (`ProjectShell` + `StackPanel`), a
`"use client"` chapter shell that reads everything from `data.ts`, and the shared
reference chapters appended before the quiz. The web-server project's chapter
arc is a strong default:

1. **Plan** — an architecture map of the system, with hotspots explaining each
   piece.
2. **Request** — how a request reaches the system, gate by gate (what fails if a
   gate is closed).
3. **Build** — the build as an ordered, dependency-first checklist, each step
   linking back to the concept it draws on.
4. **Provision** — the concrete script/commands that stand it up.
5. **Shared reference tabs** — appended from the shared kit (ownership, security,
   set-it-up-with-an-agent). Read the **live** `REFERENCE_CHAPTERS` in
   `src/components/lesson/lesson-reference.tsx`; the set has grown over time and
   the shipped web-server `chapters.tsx` predates the security tab, so its index
   arithmetic is out of date. Do **not** copy that index math blindly. Render one
   panel per reference chapter (map over the set) and confirm each tab shows the
   panel it names.
6. **Quiz** — the capstone check.

Design *this* project's chapters around its mechanics; reuse the shell, not the
web-server chapters. When building the data-driven interactive components, read
`../add-concept/references/interactive-patterns.md` (the data-driven,
provider-agnostic component pattern is identical for projects: all provider
differences live in `data.ts`, keyed by `Provider`).

### 4. Scaffold the build files

Every project lives in `src/content/projects/<id>/`. Follow the exact pattern of
`web-server-vm/`:

- `lesson.tsx` — a server component `export function <Name>Lesson({ provider })`
  that composes the build inside `ProjectShell`, with `StackPanel`, the chapter
  body, and `FurtherReading`. See `references/project-kit.md` for each shared
  component's API.
- `aws.tsx` — `export default function Aws<Name>() { return <Name>Lesson provider="aws" /> }`.
- `azure.tsx` — the Azure twin.
- `chapters.tsx` — the `"use client"` chapter shell (nav strip, prev/next, the
  per-chapter body), reading `CONTENT[provider]` from `data.ts`.
- `data.ts` — **all** per-provider content, keyed by `Provider`: chapter framing,
  architecture nodes, request-flow gates, build steps, provision script, quiz,
  and the reference-tab data (`ResponsibilitySplit`, `SecurityChecklist`,
  `AgentSetup`, and the `FurtherReading` `DocLink[]`). Keep provider differences
  here, not in `if (provider === ...)` branches scattered through render code.
  Note: the shipped `web-server-vm` keeps its reference/`DOCS` data as consts in
  `lesson.tsx` for historical reasons; that predates the security tab. For a new
  build, consolidate all of it in `data.ts` per the rule above, and have
  `lesson.tsx` read it from there. Pick one location and be consistent; do not
  split the reference data across both files.
- the interactive `.tsx` components each chapter needs (architecture map, request
  flow, build steps, provision script), provider-agnostic and fed from `data.ts`.

The build closes with a **Further reading** section: per-provider links (they
swap with the lens) to the authoritative docs, labelled by what each page
actually is. Use the shared `FurtherReading` component; the URLs come from the
fact sheet in step 2.

### 5. Register it

In `src/content/projects.ts`, add a new `Project` object to the `projects` array
in attempt order (simplest build first). Wire `components.aws`/`components.azure`
to lazy imports of the new entry files:

```ts
components: {
  aws: () => import("./projects/<id>/aws"),
  azure: () => import("./projects/<id>/azure"),
},
```

Set `wip: true` while the build is still being written; remove it once done. A
project without a `components` entry for a provider renders `ProjectComingSoon`
(still showing the stack), so it is a useful page before the build exists.

### 6. Follow the house rules

Read `../add-concept/references/design-and-house-rules.md` for the full set; the
non-negotiables for committed artifacts:

- No em dashes anywhere. Use a colon, a period, or " · ".
- Provider brand color appears only as small identity dots, never as a surface
  (ADR-0002). Semantic color coding uses inline `oklch(...)`.
- Light-only design: no dark-mode variant, no `.dark` block.
- Respect `prefers-reduced-motion` in any animation.
- Use the design tokens and explicit `[Npx]` spacing utilities, matching the
  surrounding components. `src/app/globals.css` is the token source of truth.
- Prose is neutral and professional. No personality in shipped copy.

### 7. Verify

- `pnpm exec tsc --noEmit` is clean.
- `pnpm lint` (Biome) is clean on the new files.
- Run the app and drive **both** lenses end to end: `/aws/projects/<id>` and
  `/azure/projects/<id>` load (not "coming soon"), every chapter renders, each
  reference tab shows the panel it names, the concept back-links resolve, the
  copy-prompt button works, the quiz runs, and the lens switch swaps providers.
  Confirm no brand color is used as a surface, and that focus rings are visible
  on every interactive control.

### 8. Re-ground: review the finished build against the docs

After the build renders in both lenses, spawn a fresh subagent to review it
against current official documentation, for **both** providers. A clean re-read
by an agent that did not write the copy catches drift between what you intended
and what the build actually says, and catches links that rot. This is separate
from your own step 7 verification and it is not optional: shipping a build whose
commands fail is worse than shipping late.

Give the subagent the rendered copy (or the source) plus the `docs-grounding`
skill, and ask it to, for each provider:

- confirm every factual claim (service names, resource limits, CLI syntax, image
  ids, default behaviors) against the first-party docs, citing the page checked;
- confirm the provisioning commands / agent prompts would actually succeed as
  written (real flags, real image names, correct order of operations);
- confirm every "Further reading" link resolves and is the page its label
  promises;
- flag anything unverifiable or contradicted, with the correct value and source.

Fix whatever it flags, then re-run the check if the fixes were substantive.

### 9. Commit

Conventional Commits, no co-authors, no "Generated with Claude Code". Typical
sequence:

- `feat(project): add <id> interactive components and data`
- `feat(project): assemble <id> build and wire catalog`

## Reference files

- `references/project-model.md` — the `Project` type, the `projects.ts` catalog,
  routing, the coming-soon fallback, and the project file layout.
- `references/project-kit.md` — the project-specific shared components:
  `ProjectShell`, `StackPanel`, the reference chapters, the chapter shell, the
  build-step concept back-links, and `FurtherReading`.

Shared with the sibling `add-concept` skill (read these directly, they are
content-type agnostic):

- `../add-concept/references/interactive-patterns.md` — the data-driven,
  provider-agnostic rich-content pattern used by every chapter component.
- `../add-concept/references/design-and-house-rules.md` — tokens, ADR
  constraints, motion, and the committed-artifact house rules.
