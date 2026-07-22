"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An interactive anatomy of a single alert, mirroring the click-a-part explainer
 * in the Virtual Machines concept. The left column is a compact schematic of a
 * real signal, laid out the way the Evidence phase shows one; tapping any row
 * reveals, on the right, what that part is and how to read it. The sample values
 * are fictional (a root-login-style alert) and exist only to make the parts real.
 */

type PartId =
  | "header"
  | "severity"
  | "description"
  | "triage"
  | "evidence"
  | "intel"
  | "details"
  | "raw"
  | "unmapped";

interface Hotspot {
  title: string;
  rel: string;
  body: string;
}

const HOTSPOTS: Record<PartId, Hotspot> = {
  header: {
    title: "Title, source, and time",
    rel: "what fired, where, and when",
    body: "The title is a short name the detection rule gives the finding. It orients you fast, but it is a label, not a conclusion: the same title covers real incidents and false alarms. The source tells you which system saw the event, which shapes what every other field means, and the timestamp lets you place it in a sequence. A timeline is often what turns scattered events into a story.",
  },
  severity: {
    title: "Severity",
    rel: "how bad it would be if real",
    body: "A rating from Critical down to Info, pre-assigned by the rule. It measures the stakes if the alert were true, not whether it is true. A Critical can still be a false positive and a Low can still be a real breach, so treat severity as how loud the alarm is, never as the verdict.",
  },
  description: {
    title: "Description",
    rel: "the detector's own account",
    body: "The rule's plain-language summary of what it observed. Read it as the opening question, not the answer. It tells you which pattern matched; it does not tell you whether that pattern is malicious in this environment. That is the judgment you are here to make.",
  },
  triage: {
    title: "Automated pre-triage",
    rel: "the pipeline's guess, not the truth",
    body: "Before it reaches you, an automated pass may attach a tentative disposition and a confidence score. Most alerts arrive untriaged and routed straight to a human. When a verdict is present, it is a hypothesis to confirm or overturn with evidence. Rubber-stamping the machine is how a wrong call slips through.",
  },
  evidence: {
    title: "Evidence fields",
    rel: "the who, what, and where",
    body: "The substantive fields: the identity involved, the source address, whether strong authentication was used, and the resource affected. This is the core of what you reason over. Compare each against what is normal for this account, host, or region, because most triage is comparison, not gut feeling.",
  },
  intel: {
    title: "Threat intel",
    rel: "shared language and outside context",
    body: "A MITRE ATT&CK tag names the attacker technique in vocabulary every team shares, so an alert maps to a known playbook. For vulnerabilities, enrichment such as the CVE, its EPSS exploit probability, and whether it sits on CISA's known-exploited list tells you how real the external threat is right now.",
  },
  details: {
    title: "Metadata",
    rel: "identifiers for correlation and handoff",
    body: "Alert id, account, category, detection source. These rarely decide a verdict on their own, but they let you correlate this alert with others nearby and hand a clean reference to the next tier if you escalate. The account and resource ids are also what a responder acts on.",
  },
  raw: {
    title: "Raw event (OCSF)",
    rel: "the normalized source record",
    body: "The full event in OCSF, a common schema that makes findings from different vendors read alike. When a summary field looks wrong or is missing, this is the ground truth. Strong analysts drop into the raw event to confirm a detail rather than trusting the summary blindly.",
  },
  unmapped: {
    title: "Unmapped enrichment",
    rel: "fields the schema did not capture",
    body: "Extra data the source attached that does not fit a normalized slot. It is the easiest part to skip and often where the deciding detail lives, such as whether a vulnerability is actually reachable or being exploited. Read it before you close anything.",
  },
};

const CRITICAL_PILL =
  "border-[oklch(0.72_0.14_25)] bg-[oklch(0.96_0.04_25)] text-[oklch(0.53_0.16_25)]";

/** A clickable row in the schematic signal card. */
function Row({
  id,
  selected,
  onSelect,
  children,
}: {
  id: PartId;
  selected: PartId | null;
  onSelect: (id: PartId) => void;
  children: React.ReactNode;
}) {
  const active = selected === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={cn(
        "relative block w-full border-b border-line px-[16px] py-[11px] text-left transition-colors last:border-b-0",
        active ? "bg-teal-tint" : "hover:bg-[oklch(0.97_0.01_195)]",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-[6px] left-0 w-[3px] rounded-r-[2px] bg-teal-ring"
        />
      ) : null}
      {children}
    </button>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-teal">
      {children}
    </span>
  );
}

/** A compact label/value pair used inside the wider rows. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink-soft">{value}</span>
    </>
  );
}

/** The interactive alert-anatomy explorer used in the Orientation primer. */
export function AlertAnatomy() {
  const [selected, setSelected] = useState<PartId | null>(null);
  const info = selected ? HOTSPOTS[selected] : null;

  return (
    <div className="@container mt-[18px]">
      <div className="grid grid-cols-1 gap-[16px] @[720px]:grid-cols-[minmax(0,1fr)_340px] @[720px]:items-start">
        <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
          <Row id="header" selected={selected} onSelect={setSelected}>
            <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
              <span>CloudTrail · ConsoleLogin</span>
              <span aria-hidden>·</span>
              <span>2026-03-14 02:14:07 UTC</span>
            </span>
            <span className="mt-[5px] block text-[15px] font-semibold text-ink-strong">
              Root account console sign-in
            </span>
          </Row>

          <Row id="severity" selected={selected} onSelect={setSelected}>
            <span className="flex items-center justify-between gap-[10px]">
              <RowLabel>Severity</RowLabel>
              <span
                className={cn(
                  "inline-flex items-center rounded-[5px] border px-[7px] py-[1px] font-mono text-[10px] font-medium uppercase tracking-[0.08em]",
                  CRITICAL_PILL,
                )}
              >
                Critical
              </span>
            </span>
          </Row>

          <Row id="description" selected={selected} onSelect={setSelected}>
            <RowLabel>Description</RowLabel>
            <span className="mt-[4px] block text-[12.5px] leading-[1.55] text-body">
              A sign-in to the AWS Management Console authenticated as the
              account root user. Root is meant to sit idle behind hardware MFA.
            </span>
          </Row>

          <Row id="triage" selected={selected} onSelect={setSelected}>
            <span className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px]">
              <RowLabel>Automated pre-triage</RowLabel>
              <span className="inline-flex items-center rounded-[5px] border border-line bg-surface-muted px-[7px] py-[1px] font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                Investigating
              </span>
              <span className="text-[12px] text-ink-muted">
                Not model-assessed. Routed to an analyst.
              </span>
            </span>
          </Row>

          <Row id="evidence" selected={selected} onSelect={setSelected}>
            <RowLabel>Evidence</RowLabel>
            <span className="mt-[5px] grid grid-cols-[max-content_1fr] gap-x-[18px] gap-y-[3px] font-mono text-[11px]">
              <Field label="Identity" value="Root" />
              <Field label="Source IP" value="203.0.113.47" />
              <Field label="MFA" value="No" />
              <Field label="Follow-up" value="CreateAccessKey (Active)" />
            </span>
          </Row>

          <Row id="intel" selected={selected} onSelect={setSelected}>
            <span className="flex items-center justify-between gap-[10px]">
              <RowLabel>Threat intel</RowLabel>
              <span className="inline-flex items-center rounded-[6px] border border-[oklch(0.82_0.06_300)] bg-[oklch(0.97_0.02_300)] px-[8px] py-[2px] font-mono text-[10.5px] text-[oklch(0.46_0.13_300)]">
                Valid Accounts (T1078)
              </span>
            </span>
          </Row>

          <Row id="details" selected={selected} onSelect={setSelected}>
            <RowLabel>Details</RowLabel>
            <span className="mt-[5px] grid grid-cols-[max-content_1fr] gap-x-[18px] gap-y-[3px] font-mono text-[11px]">
              <Field label="Alert ID" value="AWS-IAM-001" />
              <Field label="Account" value="400123456789" />
              <Field label="Region" value="us-east-1" />
            </span>
          </Row>

          <Row id="raw" selected={selected} onSelect={setSelected}>
            <RowLabel>Raw event (OCSF)</RowLabel>
            <span className="mt-[5px] block overflow-hidden rounded-[7px] border border-line bg-surface-muted px-[9px] py-[7px] font-mono text-[10.5px] leading-[1.5] text-ink-muted">
              {'{ "class_name": "Detection Finding", "actor": { "user": {'}
              <br />
              {'  "type": "Root" } }, "src_endpoint": { "ip": ... } }'}
            </span>
          </Row>

          <Row id="unmapped" selected={selected} onSelect={setSelected}>
            <RowLabel>Unmapped enrichment</RowLabel>
            <span className="mt-[5px] grid grid-cols-[max-content_1fr] gap-x-[18px] gap-y-[3px] font-mono text-[11px]">
              <Field label="mfa_used" value="false" />
              <Field label="geo" value="first-seen location" />
            </span>
          </Row>
        </div>

        <div className="rounded-[16px] border border-line bg-surface-muted p-[18px] @[720px]:sticky @[720px]:top-[84px]">
          {info ? (
            <>
              <h3 className="text-[16px] font-semibold text-ink-strong">
                {info.title}
              </h3>
              <p className="mt-[5px] font-mono text-[11.5px] text-teal-ink">
                {info.rel}
              </p>
              <p className="mt-[10px] text-[13px] leading-[1.65] text-body">
                {info.body}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-[16px] font-semibold text-ink-strong">
                Tap a part of the alert
              </h3>
              <p className="mt-[5px] font-mono text-[11.5px] text-teal-ink">
                Every row on the left is clickable.
              </p>
              <p className="mt-[10px] text-[13px] leading-[1.65] text-body">
                This is one alert laid out the way you will see it in the
                Evidence phase. Work down it in order: what fired, how serious
                the rule thinks it is, what the detector saw, what the pipeline
                already guessed, and the fields you reason over. The raw event
                and the unmapped enrichment at the bottom are where the deciding
                detail often hides.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
