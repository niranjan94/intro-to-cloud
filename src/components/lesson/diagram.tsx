import { cn } from "@/lib/utils";

/** The white card that holds an architecture diagram. */
export function DiagramCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[16px] rounded-[18px] border border-line bg-surface p-[26px]">
      {children}
    </div>
  );
}

const FRAME_TONES = {
  blue: {
    border: "border-[oklch(0.8_0.03_235)]",
    label: "text-[oklch(0.55_0.04_235)]",
  },
  green: {
    border: "border-[oklch(0.82_0.03_155)]",
    label: "text-[oklch(0.5_0.05_155)]",
  },
} as const;

/** A dashed, labeled boundary (a Region, a network, a subnet). Nestable. */
export function DiagramFrame({
  label,
  tone = "blue",
  className,
  children,
}: {
  label: string;
  tone?: keyof typeof FRAME_TONES;
  className?: string;
  children?: React.ReactNode;
}) {
  const t = FRAME_TONES[tone];
  return (
    <div
      className={cn(
        "rounded-[14px] border-[1.5px] border-dashed p-[16px]",
        t.border,
        className,
      )}
    >
      <div className={cn("font-mono text-[11px]", t.label)}>{label}</div>
      {children}
    </div>
  );
}

/** A concrete resource box inside a diagram frame. */
export function DiagramNode({
  title,
  sub,
  tone = "teal",
}: {
  title: string;
  sub: string;
  tone?: "teal" | "gray";
}) {
  return (
    <div
      className={cn(
        "min-w-[150px] flex-1 rounded-[12px] border p-[14px]",
        tone === "teal"
          ? "border-teal-line bg-teal-tint"
          : "border-line bg-[oklch(0.975_0.006_220)]",
      )}
    >
      <div className="text-[13px] font-semibold text-ink-strong">{title}</div>
      <div
        className={cn(
          "mt-[4px] font-mono text-[11px]",
          tone === "teal" ? "text-teal" : "text-muted",
        )}
      >
        {sub}
      </div>
    </div>
  );
}
