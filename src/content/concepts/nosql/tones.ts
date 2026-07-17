/**
 * Semantic tones for the NoSQL Database lesson. Several vocabularies share one
 * palette: the parts of a record (key, item, attribute), the health of a
 * partition distribution (balanced vs hot), the efficiency of an access pattern
 * (efficient, needs an index, full scan), and the strength of a read consistency
 * level (strong down to relaxed). Meanings are expressed in the app's calm light
 * system as inline oklch utility classes, the same technique diagram.tsx uses.
 *
 * Class strings are written as literals (never interpolated) so Tailwind v4 can
 * discover the arbitrary oklch values while scanning source.
 */
export type Tone =
  | "key"
  | "item"
  | "meta"
  | "ok"
  | "warn"
  | "hot"
  | "strong"
  | "relaxed";

interface ToneClasses {
  /** Solid-ish container: border + tint background. */
  frame: string;
  /** Border only (for dashed overlays). */
  border: string;
  /** Filled label chip: background + light text. */
  chip: string;
  /** Label/heading text color. */
  text: string;
  /** A small status dot / bar background. */
  dot: string;
}

export const TONE: Record<Tone, ToneClasses> = {
  key: {
    frame: "border-teal-line bg-teal-tint",
    border: "border-teal-line",
    chip: "bg-[oklch(0.46_0.08_195)] text-white",
    text: "text-teal-ink",
    dot: "bg-teal-ring",
  },
  item: {
    frame: "border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)]",
    border: "border-[oklch(0.8_0.06_245)]",
    chip: "bg-[oklch(0.52_0.09_255)] text-white",
    text: "text-[oklch(0.5_0.08_255)]",
    dot: "bg-[oklch(0.6_0.09_255)]",
  },
  meta: {
    frame: "border-line bg-surface-muted",
    border: "border-line",
    chip: "bg-[oklch(0.5_0.02_230)] text-white",
    text: "text-ink-muted",
    dot: "bg-ink-muted",
  },
  ok: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.44_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  warn: {
    frame: "border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)]",
    border: "border-[oklch(0.82_0.08_75)]",
    chip: "bg-[oklch(0.58_0.11_70)] text-white",
    text: "text-[oklch(0.5_0.1_70)]",
    dot: "bg-[oklch(0.66_0.12_70)]",
  },
  hot: {
    frame: "border-[oklch(0.78_0.12_25)] bg-[oklch(0.96_0.04_25)]",
    border: "border-[oklch(0.78_0.12_25)]",
    chip: "bg-[oklch(0.55_0.17_25)] text-white",
    text: "text-[oklch(0.5_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
  strong: {
    frame: "border-[oklch(0.82_0.06_300)] bg-[oklch(0.97_0.025_300)]",
    border: "border-[oklch(0.82_0.06_300)]",
    chip: "bg-[oklch(0.52_0.11_300)] text-white",
    text: "text-[oklch(0.5_0.1_300)]",
    dot: "bg-[oklch(0.6_0.11_300)]",
  },
  relaxed: {
    frame: "border-[oklch(0.8_0.04_255)] bg-[oklch(0.965_0.012_255)]",
    border: "border-[oklch(0.8_0.04_255)]",
    chip: "bg-[oklch(0.48_0.05_255)] text-white",
    text: "text-[oklch(0.46_0.05_255)]",
    dot: "bg-[oklch(0.58_0.05_255)]",
  },
};
