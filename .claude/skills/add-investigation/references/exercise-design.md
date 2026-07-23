# Designing the exercise

The structural contract is in `investigation-model.md`. This file is about making
the exercise *teach*. A case that type-checks but has obvious decoys and a
hand-wavy verdict is the most common failure mode, and it is invisible to the
compiler.

## Contents

- [The three-outcome verdict](#the-three-outcome-verdict)
- [Signals: the real thing](#signals-the-real-thing)
- [Decoys: the whole game](#decoys-the-whole-game)
- [Writing reasoning questions](#writing-reasoning-questions)
- [Extract fields](#extract-fields)
- [The verdict rationale](#the-verdict-rationale)
- [Difficulty and scaffolding](#difficulty-and-scaffolding)

## The three-outcome verdict

`Disposition` is `escalate | route | close`, and the distinction is the single
most valuable thing these exercises teach. Read the docstring in `types.ts`, then
internalize:

- **`escalate`** — a true positive worth acting on now. Hand it up the incident
  path.
- **`route`** — a *real* finding that is *not* an incident. Refer it to the owning
  team to fix on their normal cadence; that closes it for SOC purposes. The
  canonical case is an unreachable critical CVE routed to vulnerability management
  for patching (`aws-inspector-cve-noise`).
- **`close`** — benign activity or a false positive, where there is nothing to
  hand off.

Conflating `route` with `close` is a genuine, gradeable analyst error: a plain
Close treats a real vulnerability as noise, so the finding never reaches the team
that would fix it and the host never gets patched. The strongest cases are built
so the hard part is choosing between two adjacent outcomes (escalate vs route,
route vs close), not spotting an obvious incident. A pair of near-identical alerts
with opposite calls is a powerful teaching device — see the CVE `noise` and
`exploitable` twins, same 9.8 score, opposite verdicts, the difference being
reachability.

## Signals: the real thing

Signal rows (`signal: true`) are the aspects a competent analyst *should* flag.
Guidelines:

- Each should be independently defensible from the evidence. If you cannot point
  at the fact in the Evidence phase that justifies it, cut it.
- Aim for a handful (roughly 3-5), enough that the case has texture without
  turning into a scavenger hunt.
- Give every signal a `reasoning` question so Justify has substance, and a `note`
  used as corrective feedback if the learner misses it.

## Decoys: the whole game

Decoy rows (`signal: false`) are what separate a real exercise from a checklist.
Grading rewards correctly leaving them unselected, so their quality *is* the
difficulty. Weak decoys are obviously irrelevant ("the alert has an ID"); strong
decoys are things a hurried analyst would plausibly flag. The recurring archetypes
in the shipped cases:

- **Exculpatory facts** — details that actually *lower* risk, dressed up to look
  suspicious. "No public exploit exists and EPSS is very low." A learner who flags
  these has the logic backwards, and the `note` says so.
- **Normal-channel noise** — the expected, unremarkable way something happened.
  "The sign-in came through the console." The channel is not the signal; who, from
  where, and without MFA are.
- **Background scale** — true but uninformative context. "The account has 312
  other open findings this week." It describes the backlog, not this finding.
- **Expected-behavior details** — facts that are always true for this event type.
  "Root events are recorded in us-east-1." Seeing it tells you nothing.

Every decoy needs a `note` that explains, without condescension, why it is not the
signal. The note is the teaching moment for a learner who guessed wrong.

## Writing reasoning questions

Each `reasoning` block is a prompt, an `options` array, and the index of the
`correct` one. The craft is in the wrong options: they must be *believable
misconceptions*, not absurdities. "Root has no permissions so the session cannot
do anything" is a real misunderstanding worth correcting; "root only supports
IPv4" is noise no one believes. Three options is the shipped norm. The correct
option should state the actual reason crisply, because the learner reads it as the
takeaway.

## Extract fields

`extract` is IOC recall. Choose indicators that are:

- **Unambiguous** — a single clearly-correct string present in the evidence (a
  source IP, an access-key id, a CVE, a forwarding address).
- **Correctly normalized** — set `normalize` to `ip`, `domain`, `url`, or `text`
  so tolerant matching works, and put every acceptable spelling in `accept`.
- **Load-bearing** — the indicators an analyst would actually record to hand off
  or hunt with, not trivia.

A `hint` points at where the value lives ("the AKIA... id from CreateAccessKey")
without giving it away.

## The verdict rationale

`verdict.why` is revealed after the call and is where the lesson lands. Good ones:

- State the correct call and the evidence chain that forces it.
- **Name the tempting wrong call and say why it is wrong.** This is what turns a
  right/wrong result into understanding. The `route` cases do this explicitly:
  they argue why a plain Close would be the wrong call.
- End on the transferable principle ("a high CVSS score describes the
  vulnerability; reachability and exposure describe your risk").

Keep it a tight paragraph or two, neutral in voice, no em dashes.

## Difficulty and scaffolding

`Difficulty` (`guided | standard | challenge`) sets suggested order and how much
help the learner gets; it never gates access. Match the exercise to the tier:

- **`guided`** reveals the count of true signals and per-row hints. Fit the
  earliest cases in a platform group, with decoys that are instructive but not
  cruel.
- **`standard`** is the default working difficulty.
- **`challenge`** withholds the scaffolding and leans on the subtlest decoys and
  the closest verdict calls (the `route`-vs-`close` and near-twin cases).

Severity is independent of difficulty: a critical-severity alert can be an easy
call, and a medium one can be the hardest case in the set. Do not conflate them.
