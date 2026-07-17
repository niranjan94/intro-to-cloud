# Concepts are per-provider React components behind a typed registry

Each Concept is an interactive React component, not MDX/JSON content, because lessons are
interactive and tuned to the minute differences between providers. A typed registry maps each
Concept to a component per Provider (`{ aws, azure }`) via lazy imports, plus lightweight metadata
(id, title, Category, supported providers). A Concept may supply distinct components per Provider
for bespoke lessons, or point both Providers at one shared component when they do not differ.

## Why

Interactive lessons can't live in Markdown. Keying the registry per Provider gives authors full
freedom to tune each cloud's lesson, while the "sharing allowed" escape hatch prevents forced
duplication for concepts that are identical across clouds. Splitting lightweight metadata from the
heavy components lets the shell (sidebar, routing) render without importing every lesson; components
are lazy-loaded per route.

## Considered and rejected

- **One component, provider as a prop, branch internally**: least duplication, but caps how bespoke
  each provider's lesson can get — rejected because per-provider tuning is a primary goal.
- **Strictly per-provider always (no sharing)**: guarantees duplication for identical concepts.

## Consequences

- Authors must keep shared and per-provider lessons from drifting apart conceptually; the
  concept-first throughline is a convention, not enforced by the type system.
