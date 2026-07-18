# CLAUDE.md

Intro to Cloud — a client-side, no-login Next.js app that teaches provider-agnostic
cloud **Concepts** and lets the learner view each through the **lens** of a Provider
(AWS or Azure). Static, no backend, no accounts, no tracking.

Read `CONTEXT.md` for the domain language (Concept, Provider, Lens, Service, Stage)
and `docs/adr/` for load-bearing decisions before making structural changes.

## Commands

```bash
pnpm install
pnpm dev      # dev server on http://localhost:3000
pnpm build    # production build
pnpm lint     # Biome check (NOT eslint)
pnpm format   # Biome format --write
```

Package manager is **pnpm only** (pnpm-lock.yaml, pnpm-workspace.yaml). Use
`pnpm exec tsc` for a standalone typecheck.

## Architecture

- Next.js App Router, fully static/client-side. Provider is in the URL path
  (`/aws/object-storage`), not just client state — ADR-0001.
- `src/content/registry.ts` is the concept catalog: lightweight metadata plus lazy
  imports of per-provider lesson components. `src/content/types.ts` defines `Concept`,
  `Project`, and `Stage`.
- Concepts are grouped by learning-path **`Stage`** (`Foundations` → `Storing data` →
  `Reaching users` → `Going further`), in dependency order. Array order sets sequence
  within a stage.
- Each concept is a folder under `src/content/concepts/<id>/` with per-provider React
  components (`aws.tsx`, `azure.tsx`) — lessons are interactive components, not MDX/JSON
  (ADR-0003). The `aws.tsx`/`azure.tsx` files are thin wrappers that render a shared
  `lesson.tsx` with the provider as a prop; the real content is in the folder's supporting
  files. Shared lesson primitives live in `src/components/lesson/`.
- `src/content/projects.ts` + `src/content/projects/` are guided multi-concept builds,
  a parallel content type with its own catalog, route, and nav section.

## Adding a concept lesson

Use the **`add-concept` skill** — it grounds facts in official AWS/Azure docs and matches
the existing lesson quality. Manually: add/verify the entry in `registry.ts`, then create
`src/content/concepts/<id>/{aws,azure}.tsx` (following an existing folder such as
`virtual-network`). A concept in the registry without a component renders a "coming soon"
state; `wip: true` flags an in-progress lesson in nav.

## Gotchas

- **No provider brand colors in the UI** (no AWS orange / Azure blue on surfaces). Brand
  color appears only inside the small provider logos and identity dots — ADR-0002. The
  single source of visual truth is `src/app/globals.css` (oklch, teal accent); there is no
  DESIGN.md.
- Biome, not ESLint/Prettier. `@/*` maps to `src/*`.
