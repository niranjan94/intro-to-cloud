import { Suspense } from "react";
import { EVIDENCE_COMPONENTS } from "@/components/investigation/evidence-registry";
import type {
  EvidenceBlock,
  EvidenceModel,
} from "@/components/investigation/types";

/**
 * The Evidence phase: a read-only render of the raw alert. Most alerts are a
 * list of typed blocks rendered by the dispatcher below; an alert whose evidence
 * is genuinely bespoke (a rendered phishing email, say) names a component via
 * the escape hatch (ADR-0004), which is lazily mounted here from the registry.
 *
 * URLs are shown as inert monospace text, never anchors: the evidence routinely
 * contains malicious indicators that must not be clickable.
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
  return (
    <div className="mt-[16px] flex flex-col gap-[14px]">
      {evidence.blocks.map((block, i) => (
        <EvidenceBlockView key={`${block.kind}-${i}`} block={block} />
      ))}
    </div>
  );
}

function EvidenceBlockView({ block }: { block: EvidenceBlock }) {
  switch (block.kind) {
    case "summary":
      return (
        <div className="rounded-[14px] border border-line bg-surface p-[18px]">
          <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            <span>{block.time}</span>
            <span>·</span>
            <span>{block.source}</span>
          </div>
          <p className="mt-[10px] text-[15px] leading-[1.6] text-ink-strong">
            {block.message}
          </p>
        </div>
      );
    case "kv":
      return (
        <div className="rounded-[14px] border border-line bg-surface p-[18px]">
          <BlockTitle>{block.title}</BlockTitle>
          <dl className="mt-[10px] grid grid-cols-1 gap-x-[24px] gap-y-[8px] min-[560px]:grid-cols-[max-content_1fr]">
            {block.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-subgrid min-[560px]:col-span-2"
              >
                <dt className="font-mono text-[12px] text-ink-muted">
                  {row.label}
                </dt>
                <dd className="font-mono text-[12.5px] text-ink-soft">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "code":
      return (
        <div className="rounded-[14px] border border-line bg-surface p-[18px]">
          <BlockTitle>{block.title}</BlockTitle>
          <pre className="mt-[10px] overflow-x-auto rounded-[10px] border border-line bg-surface-muted p-[13px] font-mono text-[12px] leading-[1.65] text-ink-soft">
            {block.body}
          </pre>
        </div>
      );
    case "urls":
      return (
        <div className="rounded-[14px] border border-line bg-surface p-[18px]">
          <BlockTitle>{block.title}</BlockTitle>
          <ul className="mt-[10px] flex flex-col gap-[6px]">
            {block.items.map((item) => (
              <li
                key={item}
                className="overflow-x-auto rounded-[8px] border border-line bg-surface-muted px-[11px] py-[7px] font-mono text-[12px] text-ink-soft"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      );
    case "note":
      return (
        <div className="rounded-[14px] border border-teal-line bg-teal-tint p-[16px]">
          <BlockTitle>{block.title}</BlockTitle>
          <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
            {block.body}
          </p>
        </div>
      );
  }
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11.5px] uppercase tracking-[0.05em] text-teal">
      {children}
    </p>
  );
}
