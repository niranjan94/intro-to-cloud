# Design system and house rules

The design language and the non-negotiable rules for anything that ends up
committed. `src/app/globals.css` is the token source of truth; read it for the
current values. `docs/adr/0002-*.md` records the design decision.

## The look

Calm, editorial pastels on a cool off-white canvas, a single teal accent, mono
for labels/code. Light-only: there is no dark mode, no `.dark` block, no dark
variant. Do not add one.

## Tokens, not ad-hoc values

Colors are defined as CSS custom properties in the `@theme` block and consumed as
Tailwind color utilities (`text-ink`, `bg-surface`, `border-line`,
`text-teal-ink`, etc.). Use them. When you need a semantic color the token set
doesn't name (a green "pass", a red "deny", an amber "public zone"), use an
inline `oklch(...)` value the way the existing components do (see `diagram.tsx`,
`cidr-carver.tsx`) rather than inventing a new global token or reaching for a raw
hex.

Key token families (read `globals.css` for exact values):

- Surfaces: `--color-canvas`, `--color-surface`, `--color-surface-muted`,
  `--color-panel`, `--color-panel-deep`.
- Text: `--color-ink*`, `--color-body*`, `--color-ink-muted`, `--color-faint`.
- Teal accent: `--color-teal`, `-ink`, `-deep`, `-soft`, `-tint`, `-line`,
  `-ring`.
- Learning-stage accents: `--color-stage-*` (wayfinding dots only).
- Radii: `--radius-input/button/card/panel/feature/pill`.

## Spacing

The design is pixel-specific. It deliberately does **not** redefine Tailwind's
`--spacing-*` scale. Use arbitrary pixel utilities (`mt-[16px]`, `gap-[12px]`,
`px-[22px]`, `rounded-[18px]`). Bare numeric utilities keep standard rem
behavior; prefer the explicit `[Npx]` form to match the surrounding code.

## Provider brand color (ADR-0002)

The AWS and Azure brand colors (`--color-aws`, `--color-azure`) are used **only**
as small identity dots (the 9px dots in the lens badge and equivalence panel).
Never use a brand color as a surface, background, border of a large element, or
text color. This is the one design rule most likely to be violated; check for it
before committing.

## Motion

- Respect `prefers-reduced-motion`. Use the `motion-safe:` variant for CSS
  animations; for JS animation, branch on `prefersReducedMotion()` and jump to
  the end state (see `virtual-network/anim.ts`).
- Animation custom properties and keyframes live in the `@theme` block of
  `globals.css` (`--animate-fade-up`, etc.). Reuse them; add new keyframes there
  if genuinely needed.

## House rules (from the repo and global conventions)

- **No em dashes** in any committed artifact: code, comments, copy, commit
  messages, docs. Use a colon, period, or " · ".
- **Conventional Commits**: `type(scope): subject` (feat/fix/chore/docs/refactor/
  test/perf/ci). No co-authors. No "Generated with Claude Code" trailer.
- **Neutral, professional voice** in all shipped copy and code. No personality,
  no jokes, no asides in lesson text, comments, or docstrings.
- **Tooling**: `pnpm` (not npm). Type-check with `pnpm exec tsc --noEmit`. Lint
  with `pnpm lint` (Biome). For web research use the exa MCP tools.
- **Read before editing.** Never change code you have not read; the token names
  and types here can drift, so confirm against the live files.
