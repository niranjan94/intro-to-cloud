# Intro to Cloud

An open-source, client-side, no-login interactive web app that teaches basic cloud
concepts. The app is concept-first: it presents provider-agnostic cloud concepts and
lets the learner view each one through the lens of a chosen cloud provider (AWS or Azure).

## Language

**Concept**:
A provider-agnostic cloud idea the app teaches, e.g. Object Storage, Compute, Networking.
Concepts are the stable spine of the app; they do not change when the provider changes.
_Avoid_: Topic, module, service (a Service is provider-specific; see below)

**Provider**:
A cloud vendor the learner can choose between: AWS or Azure. Choosing a provider changes
the concrete examples shown for a Concept, not the set of Concepts.
_Avoid_: Vendor, platform, cloud

**Lens**:
A single Provider's concrete realization of a Concept, e.g. the AWS lens on Object Storage
is Amazon S3; the Azure lens is Blob Storage. Switching Provider switches the Lens.
_Avoid_: Mapping, implementation

**Service**:
The named provider product that a Lens points at (Amazon S3, Azure Blob Storage). A Service
always belongs to exactly one Provider and realizes exactly one Concept.
_Avoid_: Product, offering

**Stage**:
A step in the learning path that groups related Concepts for wayfinding in the sidebar,
e.g. Foundations, Storing data, Reaching users, Going further. Stages run in dependency
order (each assumes the ones before it), so the catalog reads as an order to follow rather
than a tech taxonomy. A Concept belongs to exactly one Stage. Stages are provider-agnostic
like the Concepts they group.
_Avoid_: Category, section, group, topic

**Investigation**:
A guided security-operations exercise in which the learner triages a single realistic
security alert and reaches a verdict. Unlike a Concept or Project, which are expository,
an Investigation is assessed: it has a correct answer the learner is graded against. The
set of Investigations is provider-agnostic; each one is tagged with the Source Platform its
alert originates from.
_Avoid_: Scenario, drill, case, exercise, challenge

**Source Platform**:
The system an Investigation's alert originates from, e.g. AWS, Azure, Entra ID, Linux. Source
Platform is the axis that organizes Investigations, and it is independent of Provider: it
includes identity and operating-system sources (Entra ID, Linux) that the two-Provider
teaching axis deliberately excludes. The Provider lens does not apply inside Investigations.
_Avoid_: Provider (that is the AWS/Azure teaching axis), source, origin, platform

**Phase**:
One step in an Investigation's fixed flow. The phases run in order: **Evidence** (explore the
raw alert), **Identify** (select the suspicious aspects from a checklist that includes
decoys), **Justify** (choose the correct reasoning for each selection), **Extract** (record
the indicators of compromise), and **Verdict**. Every Investigation runs the same phases.
_Avoid_: Step, stage (Stage is the learning-path term for Concepts), tab

**Verdict**:
The learner's final disposition of an Investigation's alert: **Escalate** (a true positive
worth acting on) or **Close** (benign or a false positive). Severity is a pre-assigned
property of the alert, not part of the Verdict. The Verdict is the terminal Phase and the
headline graded outcome of the Investigation.
_Avoid_: Decision, conclusion, suspicious/benign (name the action: Escalate/Close)

**Difficulty**:
A tier assigned to each Investigation, one of **Guided**, **Standard**, or **Challenge**. It
sets the suggested order within a Source Platform group, drives a filter, and controls how
much scaffolding the learner gets (e.g. whether the count of true signals is revealed). It
never gates access; navigation is free.
_Avoid_: Level, rank, tier (as a standalone noun)

**Primer**:
The expository orientation that prepares a learner for Investigations. Unlike an Investigation,
a Primer is not assessed: it teaches the SOC analyst's role, the alert lifecycle, the shared
vocabulary, and the five-phase triage method, then hands off to the alert queue. There is exactly
one Primer. It lives inside the Investigations section (at `/investigations/orientation`) because it
is provider-agnostic and shares the Investigation vocabulary, but it is a content type of its own,
distinct from the provider-lensed Concept and the assessed Investigation. Its user-facing label is
"Orientation".
_Avoid_: Tutorial, intro, onboarding, course
