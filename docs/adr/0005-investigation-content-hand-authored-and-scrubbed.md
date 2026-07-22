# Investigation content is hand-authored and scrubbed, not imported from the alert catalog

The company operates a real SIEM alert catalog (~231 rule definitions in the separate
`siem-ingest-api` repo). Investigations are **not** generated from or code-coupled to that
catalog. Instead each Investigation is hand-authored in this repo as self-contained typed data:
it is *anchored* to a real catalog event **type** so the factual metadata is accurate (severity,
MITRE technique, detection source, response action), but every concrete detail — organization
name, IP addresses, usernames, timeline, evidence, and decoy options — is invented and fully
fictional.

## Why

- **Privacy / open-source boundary.** This app is open source. The catalog and its alert
  instances carry company- and client-specific patterns that must never appear here. A build-time
  dependency on `siem-ingest-api` would couple two unrelated repos and risk leaking identifiable
  data.
- **The catalog lacks what a drill needs.** Rule definitions have no narrative, evidence, decoys,
  reasoning options, or answer key. Auto-generation would produce shallow exercises.
- **Anchoring keeps it honest.** Tying each Investigation to a real event type prevents factual
  drift (wrong MITRE mapping, implausible severity) that a working analyst would notice.

## Consequences

- Fictional instance data uses documentation-reserved values by convention: RFC 5737 IP ranges
  (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24), a single consistent fictional organization and
  domain, and a visible "training simulation — all names and addresses are fictional" marker.
- Adding an Investigation is an authoring task, not a data sync. The catalog is a factual
  reference for authors, nothing more.
