---
name: add-investigation
description: >-
  Author a new SOC-analyst Investigation end to end in the intro-to-cloud app:
  anchor it to a real detection event type for factual accuracy, invent fully
  fictional instance data (ADR-0005), design the five-phase triage exercise
  (Evidence, Identify with plausible decoys, Justify, Extract, Verdict), and wire
  the typed data module into the investigation catalog to the quality of the
  shipped cases.
  Use this whenever the user wants to add, author, build, write, or fill in an
  investigation, alert, triage case, or security exercise (for example "add an
  Azure Key Vault access investigation", "write a GuardDuty crypto-mining alert",
  "build a phishing triage case", "add a Linux privilege-escalation drill"), even
  if they don't say the word "investigation". Also use it when wiring a new entry
  into the investigation catalog or turning a real detection rule into an in-app
  triage exercise.
---

# Add an investigation

This skill authors a new Investigation in the intro-to-cloud app to the same
standard as the shipped ones. An Investigation is an assessed triage exercise: the
learner works one realistic security alert through a fixed five-phase flow
(Evidence, Identify, Justify, Extract, Verdict) and is graded against a correct
answer. Every Investigation runs the identical engine and differs only in a typed
data module, so authoring one is writing data, not building a component (ADR-0004).

The work has two halves that are easy to underweight:

- **The plumbing is small.** One `data.ts`, one catalog entry, occasionally one
  bespoke Evidence component. The types make it hard to get structurally wrong.
- **The craft is the point.** A good Investigation teaches judgment. That lives in
  the quality of the decoys, the defensibility of the verdict, and the honesty of
  the fictional detail. A structurally valid case with obvious decoys and a
  hand-wavy verdict is a failure even if it type-checks.

The codebase is the source of truth, not this skill. Types, the disposition set,
and the grading model evolve; always read the live files named below rather than
trusting values memorized here. This skill tells you *where* to look and *what
good looks like*.

## Before you start: read the model

Read these first, in order. They define every contract you must honor:

1. `src/components/investigation/types.ts` — the `Investigation` interface and
   every type it uses: `SourcePlatform`, `Severity`, `Difficulty`, `Disposition`
   (note it is three values, not two), `Aspect`, `IocField`, `SignalEvidence`,
   `SignalTriage`, and the `EvidenceModel` union. This is the whole contract.
2. `src/content/investigations.ts` — the `investigations` catalog array and its
   `InvestigationMeta` metadata shape. This is where a new case is registered, and
   its array order is the suggested attempt order.
3. `src/components/investigation/grading.ts` — how each phase is scored. You
   cannot author good decoys or reasoning questions without knowing how they are
   graded (see `references/exercise-design.md`).
4. `docs/adr/0004-investigations-assessed-content-type.md` and
   `docs/adr/0005-investigation-content-hand-authored-and-scrubbed.md` — the two
   decisions that constrain every case: the data-driven flow with a bespoke
   Evidence escape hatch, and the hand-authored-and-scrubbed rule.
5. A shipped exemplar whose shape matches what you are building. Read at least one
   fully before writing:
   - `src/content/investigations/aws-root-login/data.ts` — a clean `escalate`
     case with a structured signal and untriaged pre-triage.
   - `src/content/investigations/aws-inspector-cve-noise/data.ts` — a `route`
     case (real finding, not an incident) whose decoys are exculpatory facts.
   - `src/content/investigations/entra-inbox-forwarding/{data,evidence}.tsx` — a
     case that uses the bespoke Evidence component escape hatch.

Then read `references/investigation-model.md` for how the data drives the engine.

## Workflow

### 1. Decide the teaching point and the correct call first

An Investigation exists to teach one piece of triage judgment. Name it before you
write anything, because it determines every later choice. Establish:

- **The lesson.** What should a learner take away? "A high CVSS base score
  measures the vulnerability, not your exposure." "Impossible-travel is a VPN
  artifact as often as a takeover." The lesson is what makes the decoys and the
  verdict cohere.
- **The correct Verdict.** One of `escalate`, `route`, or `close`. These are three
  genuinely different outcomes and picking among them *is* the exercise; read the
  `Disposition` docstring in `types.ts` and the three-outcome discussion in
  `references/exercise-design.md`. A case whose "hard part" is choosing between two
  of the three is usually the most valuable kind.
- **id** — kebab-case, unique, conventionally `<platform>-<subject>` (e.g.
  `azure-keyvault-access`, `aws-guardduty-threatlist-egress`). Becomes the folder
  under `src/content/investigations/<id>/` and the catalog id.
- **title / short** — a display title and a one-line queue description. Both must
  be neutral and spoiler-free: the queue must not reveal the verdict. Look at how
  the shipped `short` lines pose the question without answering it.
- **sourcePlatform / difficulty / severity** — from the live unions in `types.ts`.
  Difficulty controls scaffolding, not gating; match decoy subtlety to it (see
  `references/exercise-design.md`).

If the lesson or the correct call is unclear, settle it with the user before
building. Everything downstream depends on it.

### 2. Anchor the facts

Investigations are fictional in their particulars but honest in their mechanics
(ADR-0005). Each is anchored to a real detection **event type** so the factual
metadata a working analyst would recognize is correct: the `eventType` name, the
`severity` a real detector would assign, the `mitre` ATT&CK mapping, the
`detectionSource`, and the OCSF class the raw payload claims to be.

The real alert catalog lives in a **separate, private repo (`siem-ingest-api`) and
is not available here** — do not look for it or invent a dependency on it. Anchor
instead against public, first-party references so the facts are defensible:

- MITRE ATT&CK (`attack.mitre.org`) for the technique id and name.
- The OCSF schema (`schema.ocsf.io`) for the event class and field shapes in the
  raw payload.
- The provider's own detection docs (GuardDuty / Inspector / Defender / Entra
  Identity Protection) for what the detector actually reports and how it phrases
  it.

Use `mcp__exa__web_search_exa` and `mcp__exa__web_fetch_exa` against those domains,
or delegate the grounding to a subagent so the research does not crowd your
context. A wrong MITRE mapping or an implausible severity is exactly the drift a
real analyst notices, and it is the worst failure mode for this content.

### 3. Scrub: invent the instance data

Every concrete detail is invented and must sit inside the documentation-reserved
conventions the app already uses, so no real organization, person, or address can
appear. Read `references/authoring-and-scrubbing.md` for the full convention set;
the essentials:

- IP addresses come from the RFC 5737 documentation ranges (`192.0.2.0/24`,
  `198.51.100.0/24`, `203.0.113.0/24`) for external addresses, and RFC 1918
  private ranges for internal ones.
- The single fictional organization is **Meridian** (`meridian.example`,
  `meridian.onmicrosoft.com`). Reuse it, and keep instance details consistent with
  Meridian's environment **baseline** (`src/content/investigations/baseline/`) — if
  the baseline says office egress is `198.51.100.0/24`, an "unusual" login must not
  come from there.
- Resource ids, keys, and account numbers follow the shipped placeholder style
  (`400123456789`, `AKIA...EXAMPLE...`).

The learner-facing "all names, addresses, and indicators are fictional" marker is
rendered once at the queue level (`src/app/investigations/page.tsx`); you do not
add it per case.

### 4. Design the exercise

This is the craft, and it has its own reference: read
`references/exercise-design.md` before writing the `aspects`, `extract`, and
`verdict` fields. The load-bearing ideas:

- **Identify is discrimination.** The `aspects` checklist mixes real signals
  (`signal: true`) with plausible **decoys** (`signal: false`). Grading scores
  classification accuracy over *every* row, so a decoy the learner correctly
  leaves unchecked earns credit. Weak decoys (obviously irrelevant) make the
  exercise trivial; the good ones are exculpatory facts, normal-channel noise,
  background scale, and expected-behavior details, each with a `note` that
  explains why it is not the signal.
- **Justify tests the "why."** Each real signal carries a `reasoning` question
  whose wrong options are believable misconceptions, not absurdities.
- **Extract is IOC recall** with tolerant matching. Pick fields whose answers are
  unambiguous strings present in the evidence, and set `normalize` correctly.
- **The Verdict must be defensible from the evidence**, and `verdict.why` should
  explain both the correct call and why the tempting wrong call is wrong. The
  shipped `route` cases model this well.

### 5. Build the Evidence

Most alerts fit the structured `SignalEvidence` shape the engine renders as a
console-style detail view (header, automated pre-triage strip, grouped fact
sections, raw OCSF payload, optional unmapped enrichment). Prefer it: it is
consistent, searchable, and what a real console looks like. Default the `triage`
to the untriaged fallback (`source: "fallback"`, `disposition: "investigating"`,
`confidence: 0`) unless the case is specifically about overturning a wrong
automated call.

Reach for the **bespoke Evidence escape hatch** only when the shape genuinely does
not fit the typed blocks — a rendered phishing email, a diffed config, a log
excerpt. Then set `evidence: { componentKey: "<id>" }`, author the component under
the case folder, and register it in
`src/components/investigation/evidence-registry.ts`. The key is a string (not a
loader) so the Investigation stays serializable across the server/client boundary.
`references/investigation-model.md` documents both paths.

### 6. Write the data module and register it

Create `src/content/investigations/<id>/data.ts` exporting the `Investigation` as
the default export, with a top-of-file docstring stating the anchored event type
and noting the data is fictional (ADR-0005), following the exemplar you read. Then
add an `InvestigationMeta` entry to the `investigations` array in
`src/content/investigations.ts`, placed in the intended attempt order within its
platform group, with `data: () => import("./investigations/<id>/data")`. The
metadata fields must match the ones in the data module.

### 7. Verify

- `pnpm exec tsc --noEmit` is clean.
- `pnpm lint` (Biome) is clean on the new files.
- Run the app and drive the case end to end at `/investigations/<id>`: all five
  phases render, the Evidence looks like a real console, Identify grades signals
  and decoys as intended, Justify and Extract accept the right answers, and the
  Verdict reveals `verdict.why`. Confirm the queue card is spoiler-free.
- **Scrub check.** Grep the new files for any real IP, domain, org, or name that
  escaped the conventions; confirm every address is RFC 5737 / RFC 1918 and every
  domain is a `.example` (or Meridian) value.

### 8. Re-check the anchor

Spawn a fresh subagent to confirm the factual anchor against the public references
from step 2: the MITRE technique id/name, the OCSF class, and the detector's real
behavior. A clean read by an agent that did not write the case catches drift
between the anchor you intended and what the alert actually says. Fix whatever it
flags; an unverifiable claim is one to soften or cut, not to ship on faith.

### 9. Commit

Conventional Commits, no co-authors, no "Generated with Claude Code". Typical:

- `feat(investigations): add <id> triage case`
- `feat(investigations): add bespoke evidence view for <id>` (if applicable)

## Reference files

- `references/investigation-model.md` — the data contract field by field, how the
  engine consumes and grades it, and both Evidence paths.
- `references/exercise-design.md` — the craft: designing signals and decoys, the
  three-outcome verdict, difficulty and scaffolding, and writing reasoning.
- `references/authoring-and-scrubbing.md` — the ADR-0005 fictional-data
  conventions, the Meridian baseline, and the house rules for committed content.
