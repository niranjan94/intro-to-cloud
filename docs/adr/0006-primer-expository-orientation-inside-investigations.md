# A Primer is an expository orientation that introduces Investigations

The Investigations section assumes a vocabulary (alert, triage, escalate/close, indicator of
compromise, severity, MITRE ATT&CK) and a working method that a learner arriving straight from the
cloud Concepts has never met. A **Primer** answers that gap: a single expository, ungraded
orientation to the SOC analyst's job that teaches the role, the alert lifecycle, the vocabulary, and
the five-phase triage method, then hands the learner off to the alert queue.

The Primer is a new content type, distinct from both a Concept and an Investigation:

- **Not a Concept (contra ADR-0001 and ADR-0003).** SOC fundamentals are provider-agnostic and
  carry no AWS/Azure lens. A provider-lensed Concept with an active switcher would be dishonest here,
  and the material belongs beside Investigations, not in the concept spine.

- **Not an Investigation (contra ADR-0004).** A Primer *teaches*; it is not assessed. It has no
  phases, no Verdict, and no grading. Forcing a correct answer onto "what a SOC is" is nonsense.

## Where it lives

The Primer lives inside the Investigations section: route `/investigations/orientation`, a navigation
entry above the alert queue, and a card at the top of the queue page. It is not a fourth top-level
section. It exists only to prepare the learner for Investigations and shares their vocabulary, so
colocating keeps the on-ramp beside the thing it ramps into and avoids a third destination competing
with Concepts and Investigations for attention.

There is exactly one Primer. It is built as hand-authored interactive components (per ADR-0003), not
as a data-driven engine: its sections are bespoke, and nothing about it is uniform enough to justify
the machinery Investigations needed (ADR-0004).

## Considered and rejected

- **A new Concept Stage ("Security operations")** — Concepts are provider-lensed; SOC fundamentals
  are not, and the provider switcher would be meaningless or actively misleading on them.
- **A fourth top-level section** — a third destination competing with Concepts and Investigations,
  and separated from the exercises it prepares the learner for.
- **An assessed "intro" Investigation** — the material is teaching, not triage; there is no alert to
  work and no honest Verdict to grade.
