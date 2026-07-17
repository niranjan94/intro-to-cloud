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

**Category**:
A grouping of related Concepts used for wayfinding in the sidebar, e.g. Storage, Compute,
Networking, Databases. A Concept belongs to exactly one Category. Categories are
provider-agnostic like the Concepts they group.
_Avoid_: Section, group, topic
