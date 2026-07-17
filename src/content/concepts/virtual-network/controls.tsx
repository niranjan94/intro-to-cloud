import { cn } from "@/lib/utils";

/** A labelled on/off switch used by the packet and firewall simulators. */
export function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-[10px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "relative h-[24px] w-[42px] shrink-0 rounded-full border-[1.5px] border-line bg-surface-muted transition-colors",
          "after:absolute after:left-[2px] after:top-[2px] after:h-[16px] after:w-[16px] after:rounded-full after:bg-ink-muted after:transition-transform",
          "peer-checked:border-[oklch(0.72_0.12_150)] peer-checked:bg-[oklch(0.95_0.04_150)] peer-checked:after:translate-x-[18px] peer-checked:after:bg-[oklch(0.58_0.12_150)]",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-teal-ring",
        )}
      />
      <span className="font-mono text-[12.5px] leading-[1.4] text-body">
        {label}
        {hint ? <span className="text-ink-muted"> ({hint})</span> : null}
      </span>
    </label>
  );
}

export type VerdictKind = "idle" | "pass" | "fail" | "pending";

export interface VerdictState {
  kind: VerdictKind;
  title: string;
  body: string;
}

const VERDICT_STYLE: Record<
  VerdictKind,
  { box: string; dot: string; text: string }
> = {
  idle: {
    box: "border-dashed border-line bg-surface",
    dot: "bg-ink-muted",
    text: "text-ink-strong",
  },
  pending: {
    box: "border-teal-line bg-teal-tint",
    dot: "bg-teal-ring",
    text: "text-teal-ink",
  },
  pass: {
    box: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.97_0.03_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
    text: "text-[oklch(0.44_0.1_150)]",
  },
  fail: {
    box: "border-[oklch(0.72_0.14_25)] bg-[oklch(0.97_0.03_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
    text: "text-[oklch(0.5_0.16_25)]",
  },
};

/** A status panel that reports the outcome of a simulated flow. */
export function Verdict({ state }: { state: VerdictState }) {
  const s = VERDICT_STYLE[state.kind];
  const mark = state.kind === "pass" ? "✓ " : state.kind === "fail" ? "✕ " : "";
  return (
    <div
      className={cn(
        "mt-[16px] min-h-[92px] rounded-[12px] border-[1.5px] p-[14px]",
        s.box,
      )}
    >
      <div className="flex items-center gap-[8px]">
        <span className={cn("h-[11px] w-[11px] rounded-full", s.dot)} />
        <span className={cn("text-[15px] font-semibold", s.text)}>
          {mark}
          {state.title}
        </span>
      </div>
      <p className="mt-[6px] text-[13px] leading-[1.6] text-body">
        {state.body}
      </p>
    </div>
  );
}
