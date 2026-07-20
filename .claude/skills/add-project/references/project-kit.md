# The project lesson kit

The shared components a project build composes, and the project-specific
conventions. These live in `src/components/lesson/`; read the live files for
exact props, since the kit evolves. This is the project counterpart to the
concept lesson kit; a project reuses much of the same kit (callouts, quiz,
further-reading) plus a few project-only pieces.

## The shell: `ProjectShell`

`src/components/lesson/project-shell.tsx`. The chrome every build sits in: a
breadcrumb back to the projects index, the title with an active-lens badge, the
goal `blurb`, the build body (`children`), and a footer link back to all
projects. It mirrors the concept `LessonLayout` but is scoped to the projects
surface (breadcrumb and footer point at `/[provider]/projects`).

```tsx
<ProjectShell project={project} provider={provider} blurb={BLURB}>
  {/* stack panel, chapters, further reading */}
</ProjectShell>
```

`project` comes from `getProject("<id>")` in the build's `lesson.tsx`.

## The equivalence: `StackPanel`

`src/components/lesson/stack-panel.tsx`. The project counterpart to a concept's
`EquivalencePanel`: the same build shown as each provider's concrete stack, side
by side, with the active lens lifted and the other dimmed. An optional `elevator`
line names the shared shape in one phrase.

```tsx
<StackPanel
  provider={provider}
  aws={project.stack.aws ?? []}
  azure={project.stack.azure ?? []}
  elevator="one Linux VM in a network you control, serving a page to the internet"
/>
```

Feed it from `project.stack`, not hardcoded arrays, so the panel and the metadata
never drift.

## The chapter shell: `ProjectChapters` (shared)

`src/components/lesson/project-chapters.tsx` is the shared tabbed shell every
build uses: the chapter nav strip, prev/next with a Done state, the fade between
chapters, and the chapter header. It owns the piece that used to be copied per
project and drift: assembling `[guided chapters, shared reference tabs, quiz]`
and dispatching each index to the right body. Do **not** hand-roll this shell in
a new project; use `ProjectChapters` and supply only what is bespoke.

The project's own `chapters.tsx` becomes a thin `"use client"` adapter: it reads
`CONTENT[provider]`, builds the guided chapter bodies from their data slices, and
hands them to `ProjectChapters`:

```tsx
export function <Name>Chapters({ provider, responsibility, security, agent }) {
  const content = CONTENT[provider];
  const guided = content.chapters.slice(0, -1);            // framing, minus quiz
  const quizMeta = content.chapters[content.chapters.length - 1];
  const guidedBodies = [                                    // one element per guided chapter
    <ArchitectureMap key="plan" .../>,
    <Fragment key="request"><RequestFlow .../>{callouts}</Fragment>,
    <BuildSteps key="build" .../>,
    <Fragment key="provision"><ProvisionScript .../>{callouts}</Fragment>,
  ];
  return (
    <ProjectChapters
      provider={provider}
      guided={guided}
      guidedBodies={guidedBodies}
      reference={{ responsibility, security, agent }}
      quizMeta={quizMeta}
      quizBody={<Quiz questions={content.quiz} />}
    />
  );
}
```

Two things the shell's contract fixes for you: bodies are passed as **elements**
(not render callbacks) because a function prop would trip Next's
serializable-props rule on the client-entry shell, and each element needs a
stable `key` (Biome's `useJsxKeyInIterable`), so wrap fragment bodies in
`<Fragment key="...">` rather than `<>...</>`. Chapter framing (nav label,
kicker, title, intro) stays data in `data.ts`, so adding or reordering guided
chapters is a data edit plus a matching entry in `guidedBodies`.

Note on the request-flow chapter: the shipped `request-flow.tsx` is data-driven
in its stages but hardwired to exactly **two gates** (`reach` and `firewall`)
and a fixed canvas width. This is enough for most builds (a public front door
plus one backend firewall map cleanly onto the two gates), but design your flow
within that constraint rather than assuming arbitrarily many gates. The number of
`stages` drives how wide the canvas needs to be, so if you add stages (e.g. an L7
load balancer adds a listener/routing hop), widen the SVG `W`/`RW` constants in
your copy of the component to fit them without horizontal overflow. If a build
genuinely needs more than two gates, that is a real component change, not a data
edit; call it out rather than forcing it.

### The shared reference chapters

`REFERENCE_CHAPTERS` in `src/components/lesson/lesson-reference.tsx` is a shared,
ordered set of tabs every build appends: the shared-responsibility split
(`SharedResponsibilityPanel`), a security-practices panel (`SecurityPanel`), and
the hands-on agent setup (`AgentPromptPanel`). `ProjectChapters` appends them for
you and renders each via `ReferencePanel`, which selects the panel by the
chapter's `kind` discriminant rather than by array position. So your only job is
to supply the `reference={{ responsibility, security, agent }}` data (each keyed
per provider in `data.ts`); adding or reordering a reference tab later cannot
silently mis-wire your build.

This is deliberate history worth knowing: the set grew over time, and the
original `web-server-vm/chapters.tsx` mapped a fixed integer offset to each panel
(`current === content.chapters.length`), which silently broke once the security
tab was inserted. The `kind`-keyed `ReferencePanel` exists so that class of bug
cannot recur. Still confirm in the running app that every reference tab shows the
panel it names and the quiz is the last tab.

The reference panels and their data types:

- `SharedResponsibilityPanel` ← `ResponsibilitySplit` (`youManage`,
  `providerManages`, `mutable`, `immutable`). Ground the mutable/immutable split
  in the provider's own docs.
- `SecurityPanel` ← `SecurityChecklist` (`posture` + `practices[]`, each a
  `{ risk, label, why }` that teaches the mechanism, not a checkbox). The shipped
  `web-server-vm` predates this tab, so there is no example to copy in the
  codebase; the shape and intended voice are:

  ```ts
  const SECURITY: Record<Provider, SecurityChecklist> = {
    aws: {
      posture:
        "A new security group allows nothing inbound, so the instance is closed by default. The exposure you own is the load balancer's public listener and the rule that lets it reach the instances.",
      practices: [
        {
          risk: "Public exposure",
          label: "Keep the instances in a private subnet and let only the load balancer reach them.",
          why: "The instance security group should allow inbound only from the load balancer's security group, not 0.0.0.0/0. If the instances had public IPs or an open rule, the load balancer stops being the single front door and every gate you built is bypassable.",
        },
        // 3 to 5 more, most important first, each grounded in the provider's own
        // security docs.
      ],
    },
    azure: {
      /* the Azure twin */
    },
  };
  ```

  Keep it to four to six practices, most important first, each grounded in the
  provider's own security guidance for the active lens.
- `AgentPromptPanel` ← `AgentSetup` (`cli` + `scenarios[]`, each a
  `{ label, blurb, prompt }`). The `prompt` is copy-ready for a coding agent;
  every resource name, flag, and image id in it must be real and grounded. Offer
  more than one scenario when there is a meaningfully different path (build the
  network vs reuse the default network).

## Build steps and concept back-links

The build-steps chapter (`build-steps.tsx` in the web-server folder) renders the
build as an ordered, dependency-first checklist. Each `BuildStep` may carry a
`concept` id; the row then renders a link to `/${provider}/${concept.id}` via
`getConcept(step.concept)`. This is how a project reinforces concepts rather than
restating them, so wire the back-links: every major step should point at the
concept lesson it draws on, and those ids should be a subset of the project's
`concepts` metadata.

## Callouts, quiz, and further reading (shared with concepts)

- `callout.tsx` — small myth/fix/note callout, driven by `CalloutData`. Attach
  callouts to the request-flow and provision chapters as the shipped project
  does.
- `quiz.tsx` — the capstone check, driven by `QuizQ[]` from `data.ts`.
- `further-reading.tsx` — the per-lens `FurtherReading` list (`DocLink[]`:
  `{ label, href, note }`). Swaps with the lens; label each link by what the page
  actually is. URLs come from the grounding fact sheet.
- `tones.ts` — the semantic `Tone` vocabulary used by diagram nodes and flow
  stages; reuse it for the architecture map and request flow rather than
  scattering raw colors.

## The coming-soon fallback

`project-coming-soon.tsx` renders a project in the catalog whose build is not yet
authored for the active lens. It still shows the `StackPanel` from metadata, so
the page is useful. You do not edit this per project; it is driven entirely by
`project.stack`. Wiring `components[provider]` is what replaces it with the real
build.
