# The lesson kit

Shared presentational components under `src/components/lesson/`. Compose these in
`lesson.tsx` rather than reinventing chrome. All are light-only and already use
the design tokens. Read the component source when you need exact class details;
this documents the API and intent.

## `LessonLayout` (`lesson-layout.tsx`)

The outer chrome every lesson sits in: breadcrumb (stage / title), the title with
an active-lens badge, the intro blurb, the body, and a footer link back.

```tsx
<LessonLayout concept={concept} provider={provider} blurb={BLURB}>
  {/* lesson body */}
</LessonLayout>
```

- `concept` — from `getConcept("<id>")` (guard `if (!concept) return null;`).
- `provider` — the active `Provider`.
- `blurb` — one paragraph, provider-agnostic, sets up the concept.

## `EquivalencePanel` (`equivalence-panel.tsx`)

The heart of every lesson: the same concept through both provider lenses side by
side, active one lifted and the other dimmed, with an optional plain-language
"same idea" line. Include this in every lesson.

```tsx
<EquivalencePanel
  provider={provider}
  aws={{ service: "Amazon S3", code: "s3" }}
  azure={{ service: "Azure Blob Storage", code: "Microsoft.Storage" }}
  elevator="dump files somewhere durable and fetch them by URL"
/>
```

- `aws` / `azure` — `{ service: string; code?: string }`. `code` is the resource
  namespace or CLI noun shown small under the service name.
- `elevator` — optional one-liner naming the shared idea in plain words.

## `SectionHeading` (`section-heading.tsx`)

Mono, uppercase section separator. `<SectionHeading>How it fits together</SectionHeading>`.

## `DiagramCanvas` / `DiagramFrame` / `DiagramNode` (`diagram.tsx`)

A static architecture diagram built from three primitives:

- `DiagramCanvas` — the white card wrapper.
- `DiagramFrame` — a dashed, labeled, nestable boundary (a Region, network,
  subnet). Props: `label`, `tone` (`"blue" | "green"`), `className`.
- `DiagramNode` — a concrete resource box inside a frame. Props: `title`, `sub`,
  `tone` (`"teal" | "gray"`).

```tsx
<DiagramCanvas>
  <DiagramFrame label={`Region · ${region}`} tone="blue">
    <div className="mt-[12px] flex flex-wrap gap-[12px]">
      <DiagramNode title="Amazon S3" sub="one flat bucket, no folders" />
      <DiagramNode title="Object" sub="fetched by key over HTTPS" tone="gray" />
    </div>
  </DiagramFrame>
</DiagramCanvas>
```

## `CliBlock` (`cli-block.tsx`)

Terminal-styled command card. `<CliBlock command="aws s3 mb s3://my-bucket" />`.
Use the researched, real CLI invocation per provider.

## `Glossary` (`glossary.tsx`)

Two-column grid of key terms; renders nothing if empty.

```tsx
const TERMS: GlossaryTerm[] = [
  { term: "Bucket / Container", definition: "The top-level holder for objects." },
];
<Glossary terms={TERMS} />
```

Pair the AWS and Azure noun in the `term` (e.g. "Bucket / Container") so the
glossary itself teaches the cross-provider mapping.

## Further reading links

Every lesson closes with a short list of links to the authoritative provider
documentation for the active lens, so a reader can go deeper on the real service.
The links are per-provider and swap with the lens, and their URLs come from the
grounding pass (SKILL step 2), verified again in the step 8 re-ground review.

`FurtherReading` (`further-reading.tsx`) is the shared component; it embeds its
own `SectionHeading`, renders nothing if empty, and matches the `Glossary`
card aesthetic. Feed it a per-provider list of `DocLink` (`{ label, href, note? }`):

```tsx
import { type DocLink, FurtherReading } from "@/components/lesson/further-reading";

const DOCS: Record<Provider, DocLink[]> = {
  aws: [{ label: "Amazon S3 User Guide", href: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/", note: "Buckets, objects, and access." }],
  azure: [{ label: "Azure Blob Storage documentation", href: "https://learn.microsoft.com/azure/storage/blobs/", note: "Containers, blobs, and tiers." }],
};
<FurtherReading links={DOCS[provider]} />
```

Label each link by what the page is, never "click here" or "docs", and point at
the specific page a learner wants (a service user guide or a concept page), not a
marketing landing page. The URLs must come from the grounding pass and survive
the step 8 re-ground review.

## `ComingSoonLesson` (`coming-soon.tsx`)

You do not call this; the route renders it automatically for concepts without a
`components` entry for the active provider. Knowing it exists explains why
registering a concept before writing its lesson is safe.

## A minimal lesson body

The simple shape, in full. No shipped lesson uses it as-is any more (the built
ones all grew into the rich shape), so this code block is the reference:

```tsx
export function ObjectStorageLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;
  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel provider={provider} aws={...} azure={...} elevator={...} />
      <SectionHeading>How it fits together</SectionHeading>
      <DiagramCanvas>{/* frames + nodes */}</DiagramCanvas>
      <SectionHeading>The command</SectionHeading>
      <CliBlock command={lens.cli} />
      <Glossary terms={TERMS} />
      <SectionHeading>Further reading</SectionHeading>
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
```

Provider-varying facts (CLI, region, unit noun) go in a
`const LENS: Record<Provider, {...}>` map at module scope, indexed by `provider`,
so one lesson body serves both lenses.
