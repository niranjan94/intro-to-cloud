# Authoring conventions and scrubbing

The rules that keep this content honest in its mechanics and fictional in its
particulars (ADR-0005), plus the house rules for anything committed. The principle:
anchor the *facts* to a real detection so an analyst would recognize them, and
invent *everything* concrete so no real organization or client data can appear.

## Contents

- [Why scrubbing is load-bearing](#why-scrubbing-is-load-bearing)
- [The fictional-data conventions](#the-fictional-data-conventions)
- [The Meridian baseline](#the-meridian-baseline)
- [House rules for committed content](#house-rules-for-committed-content)

## Why scrubbing is load-bearing

This app is open source. The real alert catalog and its instances (in the private
`siem-ingest-api` repo) carry company- and client-specific patterns that must
never appear here. So an Investigation is anchored to a real event *type* for
factual accuracy, but every concrete detail — organization, IPs, usernames,
timeline, evidence, decoys — is invented. There is no build-time dependency on the
catalog and there must never be one. Treat the catalog as an author's factual
reference that you cannot see from this repo, not as data to import.

## The fictional-data conventions

Use documentation-reserved values by convention, matching the shipped cases so the
whole corpus is internally consistent:

- **External IP addresses** come from the RFC 5737 documentation ranges:
  `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`. Never a real routable
  address.
- **Internal IP addresses** come from RFC 1918 private ranges (`10.0.0.0/8`,
  `172.16.0.0/12`, `192.168.0.0/16`).
- **The organization** is always **Meridian**, a single fictional company. Its
  domains are `meridian.example` (and `meridian.onmicrosoft.com` for Entra cases).
  Any secondary domain in a case (a phishing lookalike, a proxy) is a `.example`
  value too (e.g. `meridian-support.example`, `mailfence-proxy.example`).
- **Identifiers** follow the shipped placeholder style: account `400123456789`,
  access keys like `AKIAV7QMEXAMPLE3ROOT` (the `EXAMPLE` marker is deliberate),
  instance ids like `i-0af23c9b1e77d4a05`. Keep them obviously synthetic.
- **People** are plausible but invented names on the Meridian domain
  (`j.okafor@meridian.example`).

The learner-facing disclaimer that all names and indicators are fictional is
rendered once, at the queue level (`src/app/investigations/page.tsx`), and the
orientation and baseline pages reinforce it. You do not repeat it per case.

## The Meridian baseline

`src/content/investigations/baseline/` describes Meridian's known-normal
environment: its office egress ranges, identity practices, naming, and what
routine activity looks like. It is the shared reference that lets a case say an
address is "unusual" or a role assignment is "against policy" and have that mean
something.

Before you invent instance data, read the baseline and stay consistent with it. If
the baseline establishes office egress as `198.51.100.0/24`, then an anomalous
login must originate from somewhere else, and a legitimate one may come from there.
Contradicting the baseline breaks the fiction and can invert the intended answer.
If your case needs a new standing fact about Meridian, consider whether it belongs
in the baseline rather than buried in one case.

## House rules for committed content

Everything you write here is committed and outlives the conversation. Match the
repo conventions:

- **No em dashes** anywhere in committed content: code, comments, copy, docstrings,
  commit messages. Use a colon, a period, or " · ".
- **Neutral, professional voice** in all shipped copy, comments, and docstrings.
  No personality, jokes, or asides. The alert descriptions read like a real
  detector; the notes and rationale read like a calm senior analyst.
- **Data-module docstring.** Start each `data.ts` with a short docstring naming the
  anchored event type and its factual metadata (severity, detection source, MITRE)
  and noting the instance data is fictional (ADR-0005), following the shipped
  cases.
- **Values are inert.** In bespoke Evidence components, render indicators as plain
  monospace text, never as live anchors or clickable markup: the evidence
  routinely contains malicious URLs and addresses that must not be actionable.
- **Tooling.** `pnpm` (not npm). Type-check with `pnpm exec tsc --noEmit`, lint
  with `pnpm lint` (Biome). Use the exa MCP tools for web research.
- **Read before editing.** Type names, the disposition set, and token names drift;
  confirm against the live files rather than trusting memory.
- **Conventional Commits**: `type(scope): subject`. No co-authors, no "Generated
  with Claude Code" trailer.
