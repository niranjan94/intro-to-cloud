# Design Brief — Intro to Cloud

## The product, in one line

A free, open-source, no-login web app that teaches basic cloud concepts, and lets the learner see each concept through the lens of a chosen provider (AWS or Azure).

## Who it's for

People new to the cloud: students, developers from other disciplines, career-switchers, and the "I keep nodding along in meetings but never actually learned this" crowd. They are curious but easily intimidated. The product should feel like an approachable, well-made explainer, not a certification course or a cloud console.

## The one idea the design must protect

**Concepts come first; a provider is just a lens on the same concept.** The whole thesis is that clouds are ~90% the same idea and ~10% branding. A learner picks a concept (e.g. Object Storage) and can flip between AWS and Azure to see the *same idea* realized as *Amazon S3* or *Azure Blob Storage*. The navigation and the concepts never change when you switch providers — only the concrete examples do.

The single most important design job is to make that "same concept, different lens" moment feel obvious and even a little delightful. Right now it is buried; a learner can switch providers but the *equivalence* (S3 ⇄ Blob Storage is the same thing) is not the hero of the screen. It should be.

## Why we're briefing a designer

There is a working prototype. The information architecture, routing, provider-switch mechanic, and content model all function. What it lacks is design: the current UI is a developer's structural pass, not a designed experience. We want a designer to own the visual and interaction design end to end.

Be candid: assume nothing in the current visual design is precious. Keep the two things listed under "What to keep" and treat everything else as open.

## What to keep

- **The typefaces.** Inter (as the primary sans) and JetBrains Mono (for code/identifiers like service names, bucket names, endpoints). We like the editorial, slightly technical pairing. Open to weight/scale changes.
- **The color intent: pastel, approachable, calm.** Soft, desaturated, friendly, low-anxiety. We do *not* want a saturated, high-contrast, "cloud dashboard" look. We are open to a completely new palette as long as it stays in this approachable-pastel register.

## What isn't working today (so you know what to solve)

- The layout feels empty and unstructured — content drifts, whitespace reads as "unfinished" rather than "considered."
- There is no visual hierarchy or focal point on any screen; everything has similar weight.
- The concept-first / provider-lens insight (the product's entire reason to exist) is not expressed visually.
- No sense of progress, place, or "lesson." It reads as a directory of text, not something you learn from.
- Little visual interest or personality beyond a few tinted cards.

## The screens and their jobs

There are three screen types. Design each around its job, not around filling space.

1. **Home / landing** (`/`)
   - Job: explain the premise in seconds, and get the learner to pick a provider and start.
   - Must convey the "same concept, two lenses" idea *on this page* — ideally show a concrete example of it.
   - Contains: a short editorial hero, a provider choice (AWS/Azure), and an overview of available concepts.
   - Nav-light: global top bar only, no concept sidebar.

2. **Provider overview** (`/[provider]`, e.g. `/aws`)
   - Job: browse the concepts available through the chosen provider's lens, grouped by category.
   - Contains: the concept sidebar (concepts grouped by Category) + a grid/list of concepts.

3. **Concept lesson** (`/[provider]/[concept]`, e.g. `/aws/object-storage`)
   - Job: teach one concept through the current provider's lens, while keeping the cross-provider equivalence visible.
   - This is where a learner spends real time. It will eventually hold **interactive** lesson content (diagrams, small interactive widgets, comparisons) — not just prose. Design a container/system that can host rich, interactive lessons, not a static article template.
   - The active provider is signalled here, and switching providers should swap the lens *in place* (stay on the same concept).

**Global chrome (all screens):** a top bar with the `INTRO/CLOUD` wordmark and a provider switcher (AWS/Azure). The concept sidebar appears on provider/concept screens only.

## Domain vocabulary (please use these labels correctly)

Getting the language right matters; these terms are load-bearing.

- **Concept** — a provider-agnostic cloud idea we teach (Object Storage, Compute, Networking, Databases). The stable spine of the app.
- **Provider** — a cloud vendor the learner chooses between: **AWS** or **Azure**.
- **Lens** — one provider's concrete realization of a concept (the AWS lens on Object Storage is Amazon S3).
- **Service** — the named provider product a lens points at (Amazon S3, Azure Blob Storage).
- **Category** — a grouping of concepts for wayfinding in the sidebar (Storage, Compute, Networking, Databases).

Avoid: "topic/module" for Concept, "vendor/platform" for Provider, "product/offering" for Service.

## Functional and technical constraints

- **Providers:** AWS and Azure only (for now). The design should not assume exactly two forever, but two is the near-term reality.
- **Provider brand logos are in use** and may carry their brand color as a small accent (e.g. in the switcher). Inactive provider = de-emphasized. This is the *one* sanctioned place brand color appears; the rest of the UI stays in the calm palette. You may rethink how the logos are used, but assume real AWS/Azure marks are available.
- **No brand-color flooding:** switching to Azure should not turn the UI blue, and AWS should not turn it orange. The provider is signalled by logo + emphasis, not by re-skinning the app.
- **Light theme only** for v1. Dark mode is out of scope.
- **No login, no accounts, fully client-side.** No personalization beyond remembering the last-used provider locally.
- **Responsive:** must work well from ~360px mobile up to wide desktop. The current wide-desktop emptiness is a specific problem to solve.
- **Accessibility:** aim for WCAG AA — real focus states, sufficient contrast (mind the pastels), keyboard navigability, sensible reading order.
- **Stack (for context, not a constraint on you):** Next.js + React, Tailwind v4, shadcn/base-ui primitives. Deliverables in Figma are ideal; a token set that maps to CSS custom properties is a bonus but not required.

## Aesthetic direction

Approachable, editorial, calm, and quietly confident. Think "a beautifully made explainer / friendly reference," not "enterprise console" and not "playful toy." Pastel and soft, but with enough structure, hierarchy, and visual interest that each screen has a clear focal point and feels intentional. A little warmth and personality is welcome. Illustration, simple diagrams, or a light motif that reinforces the "same idea, different lens" metaphor would be very welcome — but that's your call.

## Deliverables we'd like

1. A visual direction / moodboard and 1–2 style explorations to align before full design.
2. A small design system: palette, type scale, spacing, elevation/border approach, and core components (buttons, tags/labels, cards, sidebar, provider switcher, the concept/lens display).
3. High-fidelity designs for the three screen types, in mobile and desktop.
4. A specific, worked-out treatment for the **concept ⇄ lens equivalence** — the moment that shows S3 and Blob Storage are the same idea.
5. A concept-lesson layout/system that can host interactive content, with at least one example lesson designed to show how rich content sits in it.
6. Empty/edge states (e.g. a category with one concept, a concept a provider doesn't support yet).

## Open questions for the designer

- How should the provider switch feel — instant in-place swap, a subtle transition, a side-by-side compare mode?
- Should the home page teach with a live example, or stay a clean menu into the concepts?
- Is there a visual metaphor for "one concept, many lenses" worth building the identity around?
- How much personality/illustration is right for the audience without tipping into childish?

## References for tone (not to copy)

Calm, editorial, single-typeface, document-like product sites with restrained color and generous structure — e.g. read.cv, Are.na, Linear's marketing pages. The reference we started from is in `DESIGN.md` (a muted, pastel, editorial system); it is a starting point, not a requirement, and its layout specifics have not served us well — feel free to depart from it.
