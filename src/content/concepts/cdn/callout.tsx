import { cn } from "@/lib/utils";

/** myth = a common wrong belief · fix = the correction · note = an aside. */
export type CalloutKind = "myth" | "fix" | "note";

const KIND: Record<CalloutKind, { bar: string; tint: string; tag: string }> = {
  myth: {
    bar: "border-l-[oklch(0.72_0.14_25)]",
    tint: "bg-[oklch(0.97_0.03_25)]",
    tag: "text-[oklch(0.53_0.16_25)]",
  },
  fix: {
    bar: "border-l-[oklch(0.72_0.12_150)]",
    tint: "bg-[oklch(0.97_0.03_150)]",
    tag: "text-[oklch(0.48_0.1_150)]",
  },
  note: {
    bar: "border-l-teal-ring",
    tint: "bg-teal-tint",
    tag: "text-teal",
  },
};

export interface CalloutData {
  kind: CalloutKind;
  /** Short uppercase label, e.g. "Common mix-up". */
  tag: string;
  /** The bold claim being made or corrected. */
  title: string;
  /** The explanation. */
  body: string;
}

/**
 * A left-barred callout used across the lesson chapters to flag a common
 * misconception (myth), its correction (fix), or a provider-specific aside
 * (note).
 */
export function Callout({ kind, tag, title, body }: CalloutData) {
  const k = KIND[kind];
  return (
    <div
      className={cn(
        "mt-[14px] rounded-r-[12px] border-l-[4px] px-[16px] py-[14px]",
        k.bar,
        k.tint,
      )}
    >
      <div
        className={cn(
          "font-mono text-[11px] font-bold uppercase tracking-[0.1em]",
          k.tag,
        )}
      >
        {tag}
      </div>
      <p className="mt-[6px] text-[14.5px] font-semibold text-ink-strong">
        {title}
      </p>
      <p className="mt-[6px] text-pretty text-[13.5px] leading-[1.6] text-body">
        {body}
      </p>
    </div>
  );
}
