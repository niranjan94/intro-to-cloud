# Investigations are an assessed, data-driven content type outside the provider lens

Investigations (a SOC-analyst training exercise: triage one realistic security alert through
Evidence → Identify → Justify → Extract → Verdict) are a third top-level content type alongside
Concepts and Projects. They deliberately break two earlier decisions, for reasons specific to
how they differ from lessons:

- **Not provider-scoped (contra ADR-0001).** Investigations live at their own route
  (`/investigations`), not under `/[provider]`. They are organized by **Source Platform**
  (AWS, Azure, Entra ID, Linux) — an axis independent of the two-value `Provider` type. The
  `Provider` union is left untouched: Entra ID and Linux are legitimate alert sources but are
  not cloud Providers in the teaching sense, and triage is not a "lens" on a Concept. The
  Provider switcher is inert inside this section.

- **Data-driven, not bespoke components (contra ADR-0003).** Every Investigation runs the
  identical five-phase flow and differs only in data (the alert, the checklist and its decoys,
  the reasoning options, the IOC fields, the expected answers, the correct Verdict). A single
  shared engine renders and grades the four uniform phases from a typed data object; only the
  **Evidence** phase — where a phishing email, a CloudTrail JSON event, and SSH auth logs
  genuinely differ in shape — gets an optional bespoke-component escape hatch. Authoring a new
  Investigation is writing a typed data module, not a component.

## Why

Investigations *assess* (there is a correct answer graded against) rather than *teach*, and one
alert maps to one Investigation. ADR-0001 and ADR-0003 optimize for the opposite: a stable
provider-agnostic concept spine and bespoke interactive lessons. Forcing Investigations into
those shapes would either leave Entra/Linux homeless or duplicate an invariant flow dozens of
times. The divergence is bounded to this content type; Concepts and Projects are unchanged.

## Considered and rejected

- **Extend the `Provider` union with `entra`/`linux`** — pollutes the type used across every
  Concept, Project, and route and breaks ADR-0001's clean two-provider model.
- **Investigations under `/[provider]`** — no honest home for Entra/Linux alerts; triage isn't
  a lens.
- **Bespoke component per Investigation (ADR-0003 literal)** — massive duplication of a flow
  that never varies.
