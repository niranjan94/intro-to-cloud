# The project model

How a capstone project flows from catalog metadata to a rendered build. Read the
live files as the source of truth; this explains how they connect. Projects are a
top-level content type parallel to concepts (ADR-0003), so this mirrors the
concept model closely; where they differ is called out.

## The `Project` type (`src/content/types.ts`)

A `Project` is lightweight, provider-agnostic metadata plus a map of lazy build
loaders. The fields you set when authoring:

- `id` — kebab-case, unique. Doubles as the URL segment (`/aws/projects/<id>`)
  and the folder name `src/content/projects/<id>/`.
- `title` — display name.
- `short` — one-line, provider-agnostic card copy describing the finished system.
- `concepts` — `string[]` of concept ids this build assembles, in the order they
  come up. Each id must exist in `src/content/registry.ts`. Drives the "concepts
  you'll use" back-links, so the project reinforces concepts rather than
  restating them. This is the field a concept lesson does not have.
- `stack` — `Partial<Record<Provider, string[]>>` of named services in stack
  order, e.g. `{ aws: ["Amazon VPC", "Amazon EC2"], azure: ["Azure Virtual
  Network", "Azure Virtual Machine"] }`. The project counterpart to a concept's
  `services`, but ordered and multi-valued. Drives the "same build, two stacks"
  panel and the coming-soon fallback.
- `wip?` — `true` drives a "WIP" badge in navigation. Independent of whether a
  build component exists. Set it while authoring, remove it when done.
- `components` — `Partial<Record<Provider, ConceptComponentLoader>>` (the loader
  type is shared with concepts). Each value is
  `() => import("./projects/<id>/<provider>")`. A provider is "authored" when its
  key is present here.

`Provider` is currently `"aws" | "azure"`; `PROVIDERS` is the ordered list. Never
hardcode the provider list; derive from `PROVIDERS` where you iterate.

Contrast with `Concept`: a concept has `stage` (its slot in the learning path)
and `services` (one service per provider); a project has `concepts` (what it
assembles) and `stack` (an ordered list of services per provider). A project has
no `stage`; its ordering is the array order in `projects.ts`.

## The catalog (`src/content/projects.ts`)

`projects` is the ordered catalog. Array order is the recommended attempt order,
simplest build first. Helpers you may use:

- `getProject(id)` — look up by id (build files call this to get their own
  metadata; e.g. `const project = getProject("web-server-vm")`).
- `projectProviders(project)` — which lenses are authored.
- `projectSupportsProvider(project, provider)` — whether one lens is authored.

To register a project, append a new `Project` object in the right place in the
`projects` array. There is no stub convention as there is for concepts; a project
is added when it is being built.

## Routing and the "coming soon" fallback

`src/app/[provider]/projects/[project]/page.tsx` resolves the project, looks up
`project.components[provider]`, and:

- if a loader exists, awaits it and renders `<Build />`;
- if not, renders `ProjectComingSoon` (still shows the `stack` side by side), so
  an unauthored project is a useful page, not a dead end.

An unknown provider or project id is a `notFound()` (404). This is why a project
can appear in navigation before its build is written, and why wiring `components`
is the switch that turns "coming soon" into the real build. The projects index is
`src/app/[provider]/projects/page.tsx`; it maps `projects` to `ProjectCard`s.

## File layout of a project

```
src/content/projects/<id>/
├── lesson.tsx     server component: <Name>Lesson({ provider }) inside ProjectShell
├── aws.tsx        default export: <Name>Lesson provider="aws"
├── azure.tsx      default export: <Name>Lesson provider="azure"
├── chapters.tsx   "use client" chapter shell; reads CONTENT[provider]
├── data.ts        all per-provider content, keyed by Provider
└── *.tsx          "use client" interactive chapter components fed from data.ts
                   (architecture map, request flow, build steps, provision script)
```

`aws.tsx` / `azure.tsx` are deliberately trivial thin entry points; they exist so
the catalog can lazy-import one default-exported component per provider
(ADR-0003). All shared build logic lives in `lesson.tsx` + `chapters.tsx`, and
provider facts flow in through `data.ts` keyed by the `provider` prop. This is
the same split concepts use; a project is simply always the rich, data-driven
shape (there is no minimal single-file project).
