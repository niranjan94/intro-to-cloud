import { Suspense } from "react";
import { EVIDENCE_COMPONENTS } from "@/components/investigation/evidence-registry";
import type {
  EvidenceModel,
  SignalDisposition,
  SignalEvidence,
  SignalFact,
  SignalSection,
  SignalTriage,
} from "@/components/investigation/types";
import { cn } from "@/lib/utils";

/**
 * The Evidence phase: a read-only render of the raw alert, laid out the way the
 * real signal console shows one, so the exercise trains against a familiar shape.
 * Top to bottom: a titled header with the detector's own description, the
 * automated pre-triage strip, grouped fact sections (Evidence, Threat intel,
 * Details), the raw OCSF payload, and any notable `unmapped` enrichment. An alert
 * whose evidence is genuinely bespoke (a rendered phishing email, say) names a
 * component via the escape hatch (ADR-0004), lazily mounted from the registry.
 *
 * Values are shown as inert monospace text, never anchors or live markup: the
 * evidence routinely contains malicious indicators that must not be actionable.
 */
export function EvidencePhase({ evidence }: { evidence: EvidenceModel }) {
  if ("componentKey" in evidence) {
    const Lazy = EVIDENCE_COMPONENTS[evidence.componentKey];
    return (
      <div className="mt-[16px]">
        <Suspense
          fallback={
            <p className="font-mono text-[12.5px] text-ink-muted">
              Loading evidence...
            </p>
          }
        >
          {Lazy ? <Lazy /> : null}
        </Suspense>
      </div>
    );
  }
  return <SignalView signal={evidence.signal} />;
}

function SignalView({ signal }: { signal: SignalEvidence }) {
  return (
    <div className="mt-[16px] flex flex-col gap-[14px]">
      <div className="rounded-[14px] border border-line bg-surface p-[18px]">
        <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          <span>{signal.source}</span>
          <span aria-hidden>·</span>
          <span>{signal.time}</span>
        </div>
        <h3 className="mt-[10px] text-[18px] font-semibold leading-[1.35] text-ink-strong">
          {signal.title}
        </h3>
        <p className="mt-[8px] text-[14px] leading-[1.6] text-body">
          {signal.description}
        </p>
      </div>

      {signal.triage ? <TriageStrip triage={signal.triage} /> : null}

      {signal.sections.map((section) => (
        <SectionCard key={section.heading} section={section} />
      ))}

      <div className="rounded-[14px] border border-line bg-surface p-[18px]">
        <BlockTitle>Raw event (OCSF)</BlockTitle>
        <pre className="mt-[10px] overflow-x-auto rounded-[10px] border border-line bg-surface-muted p-[13px] font-mono text-[12px] leading-[1.65] text-ink-soft">
          {signal.raw}
        </pre>
      </div>

      {signal.unmapped && signal.unmapped.length > 0 ? (
        <div className="rounded-[14px] border border-line bg-surface p-[18px]">
          <BlockTitle>Unmapped enrichment</BlockTitle>
          <p className="mt-[8px] text-[12.5px] leading-[1.55] text-ink-muted">
            Fields the source attached that do not map to a normalized OCSF
            slot. Enrichment that decides severity often lives here, so read it
            before you judge the finding.
          </p>
          <FactGrid rows={signal.unmapped} className="mt-[12px]" />
        </div>
      ) : null}
    </div>
  );
}

const SOURCE_LABEL: Record<SignalTriage["source"], string> = {
  fallback: "Fallback heuristic",
  rule: "Rule match",
  stateful: "Stateful evaluator",
  llm: "Model",
  cache: "Cached model",
};

const DISPOSITION_LABEL: Record<SignalDisposition, string> = {
  investigating: "Investigating",
  informational: "Informational",
  benign: "Benign",
  suspicious: "Suspicious",
  true_positive: "True positive",
};

const DISPOSITION_STYLE: Record<SignalDisposition, string> = {
  investigating: "border-line bg-surface-muted text-ink-muted",
  informational: "border-line bg-surface-muted text-ink-muted",
  benign:
    "border-[oklch(0.8_0.09_150)] bg-[oklch(0.96_0.04_150)] text-[oklch(0.44_0.11_150)]",
  suspicious:
    "border-[oklch(0.8_0.1_85)] bg-[oklch(0.97_0.04_85)] text-[oklch(0.5_0.12_85)]",
  true_positive:
    "border-[oklch(0.72_0.14_25)] bg-[oklch(0.96_0.04_25)] text-[oklch(0.53_0.16_25)]",
};

/**
 * The automated pre-triage strip. It is framed as the pipeline's call, not the
 * truth, because validating or overturning it is the learner's job. Untriaged
 * signals (confidence 0) show no meter.
 */
function TriageStrip({ triage }: { triage: SignalTriage }) {
  return (
    <div className="rounded-[14px] border border-dashed border-line bg-surface-muted p-[16px]">
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-ink-muted">
          Automated pre-triage · {SOURCE_LABEL[triage.source]}
        </span>
        {triage.confidence > 0 ? (
          <ConfidenceMeter value={triage.confidence} />
        ) : null}
      </div>
      <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-[6px] border px-[8px] py-[2px] font-mono text-[11px] font-medium uppercase tracking-[0.06em]",
            DISPOSITION_STYLE[triage.disposition],
          )}
        >
          {DISPOSITION_LABEL[triage.disposition]}
        </span>
        <span className="min-w-0 flex-1 text-[13px] leading-[1.5] text-body">
          {triage.note}
        </span>
      </div>
    </div>
  );
}

/** A 5-segment confidence meter, matching the console's assessment header. */
function ConfidenceMeter({ value }: { value: number }) {
  const filled = Math.round((Math.min(100, Math.max(0, value)) / 100) * 5);
  return (
    <span className="inline-flex items-center gap-[6px]">
      <span aria-hidden className="flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-[8px] w-[14px] rounded-[2px]",
              i < filled ? "bg-teal-ring" : "bg-line",
            )}
          />
        ))}
      </span>
      <span className="font-mono text-[11px] text-ink-muted">
        {value}% confidence
      </span>
    </span>
  );
}

function SectionCard({ section }: { section: SignalSection }) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-[18px]">
      <BlockTitle>{section.heading}</BlockTitle>
      {section.chips && section.chips.length > 0 ? (
        <div className="mt-[10px] flex flex-wrap gap-[6px]">
          {section.chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-[6px] border border-[oklch(0.82_0.06_300)] bg-[oklch(0.97_0.02_300)] px-[8px] py-[2px] font-mono text-[11px] text-[oklch(0.46_0.13_300)]"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
      {section.rows.length > 0 ? (
        <FactGrid rows={section.rows} className="mt-[10px]" />
      ) : null}
    </div>
  );
}

/** The shared two-column label/value grid used by sections and the unmapped card. */
function FactGrid({
  rows,
  className,
}: {
  rows: SignalFact[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-x-[24px] gap-y-[8px] min-[560px]:grid-cols-2",
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(
            "flex flex-col gap-[2px]",
            row.wide && "min-[560px]:col-span-2",
          )}
        >
          <dt className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted">
            {row.label}
          </dt>
          <dd className="break-words font-mono text-[12.5px] text-ink-soft">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11.5px] uppercase tracking-[0.05em] text-teal">
      {children}
    </p>
  );
}
