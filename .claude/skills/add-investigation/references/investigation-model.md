# The Investigation data contract

How a typed `Investigation` object drives the shared engine. Read the live
`src/components/investigation/types.ts` alongside this; the types are the
authority and this file explains intent and how each field is consumed.

## Contents

- [The two-layer catalog](#the-two-layer-catalog)
- [Investigation fields](#investigation-fields)
- [Evidence: the two paths](#evidence-the-two-paths)
- [How each phase consumes the data](#how-each-phase-consumes-the-data)
- [How grading works](#how-grading-works)

## The two-layer catalog

Like the concept registry, the catalog is split so opening the queue does not
bundle every answer key:

- **`InvestigationMeta`** in `src/content/investigations.ts` is lightweight queue
  metadata (`id`, `title`, `short`, `sourcePlatform`, `difficulty`, `severity`,
  `eventType`, `mitre`) plus a lazy `data` loader. The queue page and nav read
  only this.
- **`Investigation`** in the case's `data.ts` is the full payload, fetched on
  demand when the case page renders.

The metadata fields duplicated across both layers (`id`, `title`, `short`,
`sourcePlatform`, `difficulty`, `severity`, `eventType`, `mitre`) must match
exactly. `detectionSource` and everything below (`evidence`, `aspects`, `extract`,
`verdict`) live only in the full `Investigation`.

## Investigation fields

The anchored, factual metadata (must be accurate for a real detection):

- `eventType` — the catalog event name, shown as the rule name (e.g. "Root
  Account Login", "Package Vulnerability Detected").
- `severity` — one of the `Severity` union, pre-assigned by the rule. It is shown,
  never graded: the learner does not re-score severity.
- `mitre` — the ATT&CK mapping string, `"Name (Txxxx)"`, e.g.
  `"Valid Accounts (T1078)"`.
- `detectionSource` — where the event is detected (e.g. "CloudTrail",
  "Inspector", "GuardDuty").

The fictional, authored content:

- `evidence` — the raw alert the learner explores. See below.
- `aspects` — the Identify checklist (and, on signal rows, the Justify questions).
- `extract` — the IOC fields the learner records.
- `verdict` — `{ correct: Disposition, why: string }`. `why` is revealed after the
  call and is where the teaching lands.

## Evidence: the two paths

`EvidenceModel` is a union: `{ signal: SignalEvidence }` or `{ componentKey:
string }`. Prefer the structured `signal`.

### Structured `SignalEvidence` (default)

The engine renders this as a console-style detail view, top to bottom:

- `title` — alert title, sentence case, no verdict.
- `source` — the detector, shown as a kicker.
- `time` — when it fired.
- `description` — the detector's own neutral description of what it observed. Not
  a verdict, not a hint. Match how the real detector phrases its finding.
- `triage?` — the automated pre-triage strip (`SignalTriage`). **Default to
  untriaged**: `{ source: "fallback", disposition: "investigating", confidence:
  0, note: "..." }`. That models the common reality — the pipeline attached the
  catalog severity and routed the alert to an analyst without a verdict, and the
  strip shows no confidence meter. Only set a real `disposition` and non-zero
  `confidence` when the exercise is specifically about a learner overturning a
  wrong automated call.
- `sections` — grouped fact cards (`SignalSection`), in display order. Convention
  mirrors a real console: an "Evidence" card of the core facts, an optional
  "Threat intel" card carrying MITRE tags in `chips`, a "Context" card of what is
  known-normal, and a "Details" card of alert/account metadata. Each row is a
  `{ label, value }`; set `wide: true` for long values (ARNs, URLs, geolocation)
  so they span both columns.
- `raw` — the raw OCSF payload, pretty-printed as a string. Make it a plausible
  OCSF object for the anchored class. Enrichment (CVE, EPSS, KEV, exploitability)
  frequently rides in an `unmapped` block rather than a normalized field.
- `unmapped?` — notable `unmapped` fields surfaced as facts above the raw dump.
  Use this when severity-deciding enrichment lives there; it tells the learner to
  read past the headline score.

### Bespoke `componentKey` (escape hatch, ADR-0004)

Only when the evidence shape genuinely does not fit the typed blocks — a rendered
phishing email, a mailbox rule, a config diff, a log excerpt. Steps:

1. Set `evidence: { componentKey: "<id>" }` in the data module.
2. Author the component at `src/content/investigations/<id>/evidence.tsx` as a
   default-exported client component, following
   `entra-inbox-forwarding/evidence.tsx`: the same card language
   (`rounded-[14px] border border-line bg-surface p-[18px]`), mono labels, and
   inert values (never live anchors — the evidence routinely contains malicious
   indicators that must not be actionable).
3. Register it in `src/components/investigation/evidence-registry.ts` by adding a
   `lazy(() => import(...))` entry keyed by the same string.

The key is a plain string (not a loader function) so the `Investigation` stays
serializable and can cross the server/client boundary as a prop.

## How each phase consumes the data

- **Evidence** renders `evidence` read-only. Nothing is graded here.
- **Identify** shows every `aspect.label` as a checklist row. The learner selects
  the ones they judge suspicious.
- **Justify** shows, for each signal aspect that has a `reasoning` block, the
  `reasoning.prompt` and `reasoning.options`; the learner picks one. This runs
  over signal rows regardless of what they selected in Identify.
- **Extract** shows each `extract` field's `label` and optional `hint`; the
  learner types the indicator.
- **Verdict** shows the three dispositions; the learner picks one, then
  `verdict.why` is revealed.

## How grading works

Read `src/components/investigation/grading.ts` for the exact math. What matters
for authoring:

- **Identify** is classification accuracy over *all* rows:
  `(correct signals selected + decoys correctly left unselected) / total rows`. A
  decoy is not dead weight — correctly *not* selecting it earns credit, and
  wrongly selecting it costs. This is why decoy quality is the whole game.
- **Justify** scores only signal aspects that carry a `reasoning` block:
  `correct / total`. Give every real signal a reasoning question so the phase has
  substance.
- **Extract** scores each field with tolerant matching: the input is normalized
  per the field's `normalize` (`text` / `ip` / `domain` / `url`) and compared
  against every entry in `accept`. `domain` and `url` also strip a leading scheme
  and trailing slash. Put every acceptable spelling in `accept`.
- **Quality** is the mean of the three phase scores, dropping any phase with zero
  items (a case with no IOCs is not penalized). It is reported 0-100 alongside the
  headline correct/wrong **call** (whether the chosen disposition equals
  `verdict.correct`). The call is pass/fail and is not folded into quality.

Implication: a case needs enough signals, decoys, reasoning questions, and IOC
fields for the scores to be meaningful. One signal and no decoys grades as trivial
regardless of how hard the real judgment is.
