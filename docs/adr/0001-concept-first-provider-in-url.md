# Concept-first model with provider in the URL path

The app teaches provider-agnostic cloud Concepts (Object Storage, Compute, ...) and lets the
learner view each through the lens of a chosen Provider (AWS or Azure). Concepts are the stable
spine; switching Provider swaps the concrete examples, not the set of Concepts. We put the
Provider in the URL path (`/aws/object-storage`, `/azure/object-storage`) rather than in client
state only.

## Why

The point of a provider switch is the teaching payload: clouds are ~90% the same idea, ~10%
branding. A concept-first model makes that insight structural instead of incidental, and keeps
the navigation stable across providers. Putting the Provider in the path makes lessons deep-linkable
and shareable (you can link someone to "S3 specifically"), makes both providers independently
indexable for an open learning resource, and gives a clear canonical URL per provider+concept.
Last-used provider is mirrored to `localStorage` so bare `/` and provider-less entry can resolve
to the learner's choice.

## Considered and rejected

- **Provider in client state only** (`/object-storage`): simpler route tree, but links aren't
  provider-specific, no per-provider deep links, weaker SEO for a shareable resource.
- **Query parameter** (`?provider=aws`): shareable but reads as non-canonical and is easy to drop.
