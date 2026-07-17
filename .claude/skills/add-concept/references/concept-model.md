# The concept model

How a concept flows from catalog metadata to a rendered lesson. Read the live
files as the source of truth; this explains how they connect.

## The `Concept` type (`src/content/types.ts`)

A `Concept` is lightweight, provider-agnostic metadata plus a map of lazy lesson
loaders. The fields you set when authoring:

- `id` — kebab-case, unique. Doubles as the URL segment (`/aws/<id>`) and the
  folder name `src/content/concepts/<id>/`.
- `title` — display name.
- `stage` — one of the `Stage` union values. Read the union in `types.ts`; it is
  the learning taxonomy and it changes over time. `STAGES` gives the order.
- `short` — one-line, provider-agnostic card copy.
- `services` — `Partial<Record<Provider, string>>` of named services, e.g.
  `{ aws: "Amazon S3", azure: "Azure Blob Storage" }`. Used by cards and the
  "coming soon" fallback before a lesson exists.
- `wip?` — `true` drives a "WIP" badge in navigation. Independent of whether a
  lesson component exists. Set it while authoring, remove it when done.
- `components` — `Partial<Record<Provider, ConceptComponentLoader>>`. Each value
  is `() => import("./concepts/<id>/<provider>")`. A provider is considered
  "authored" when its key is present here.

`Provider` is currently `"aws" | "azure"`; `PROVIDERS` is the ordered list.
Never hardcode the provider list; derive from `PROVIDERS` where you iterate.

## The registry (`src/content/registry.ts`)

`concepts` is the ordered catalog. Array order is the learning sequence within a
stage. Helpers you may use:

- `getConcept(id)` — look up by id (lesson files call this to get their own
  metadata).
- `supportedProviders(concept)` / `conceptSupportsProvider(concept, provider)` —
  which lenses are authored.
- `conceptsByStage()` — groups concepts by `Stage` in `STAGES` order for the
  sidebar and overview grids.

To register a concept, either fill an existing stub's `components` (many stubs
already have correct `id`/`title`/`stage`/`services` with `components: {}`), or
append a new `Concept` object in the right place.

## Routing and the "coming soon" fallback

`src/app/[provider]/[concept]/page.tsx` resolves the concept, looks up
`concept.components[provider]`, and:

- if a loader exists, awaits it and renders `<Lesson />`;
- if not, renders `ComingSoonLesson` (still shows the equivalence from
  `services`), so an unauthored concept is a useful page, not a dead end.

This is why a concept can appear in navigation before its lesson is written, and
why wiring `components` is the switch that turns "coming soon" into the real
lesson.

## File layout of a concept

```
src/content/concepts/<id>/
├── lesson.tsx     server component: <Name>Lesson({ provider })
├── aws.tsx        default export: <Name>Lesson provider="aws"
├── azure.tsx      default export: <Name>Lesson provider="azure"
└── (rich lessons only)
    ├── data.ts    all per-provider content, keyed by Provider
    └── *.tsx      "use client" interactive components fed from data.ts
```

`aws.tsx` / `azure.tsx` are deliberately trivial thin entry points; they exist
so the registry can lazy-import one default-exported component per provider
(ADR-0003). All shared lesson logic lives in `lesson.tsx`, and provider facts are
passed in via the `provider` prop.
