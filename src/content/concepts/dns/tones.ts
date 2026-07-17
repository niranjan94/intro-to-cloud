/**
 * Semantic tones for the DNS lesson. Three vocabularies share one calm palette:
 * the tiers of the resolution hierarchy (query, root, tld, auth), the kind of a
 * record (record, alias), and the outcome of a check (ok, blocked, warn, cache).
 * Meanings are expressed in the app's light system as inline oklch utility
 * classes, the same technique diagram.tsx already uses.
 *
 * Class strings are written as literals (never interpolated) so Tailwind v4 can
 * discover the arbitrary oklch values while scanning source.
 */
export type Tone =
  | "query"
  | "root"
  | "tld"
  | "auth"
  | "record"
  | "alias"
  | "ok"
  | "blocked"
  | "warn"
  | "cache";

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
  query: {
    frame: "border-teal-line bg-teal-tint",
    border: "border-teal-line",
    chip: "bg-[oklch(0.46_0.08_195)] text-white",
    text: "text-teal-ink",
    dot: "bg-teal-ring",
  },
  root: {
    frame: "border-[oklch(0.82_0.06_300)] bg-[oklch(0.97_0.025_300)]",
    border: "border-[oklch(0.82_0.06_300)]",
    chip: "bg-[oklch(0.52_0.11_300)] text-white",
    text: "text-[oklch(0.5_0.1_300)]",
    dot: "bg-[oklch(0.6_0.11_300)]",
  },
  tld: {
    frame: "border-[oklch(0.8_0.06_255)] bg-[oklch(0.97_0.025_255)]",
    border: "border-[oklch(0.8_0.06_255)]",
    chip: "bg-[oklch(0.52_0.09_255)] text-white",
    text: "text-[oklch(0.5_0.08_255)]",
    dot: "bg-[oklch(0.6_0.09_255)]",
  },
  auth: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.48_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  record: {
    frame: "border-line bg-surface-muted",
    border: "border-line",
    chip: "bg-[oklch(0.5_0.02_230)] text-white",
    text: "text-ink-muted",
    dot: "bg-ink-muted",
  },
  alias: {
    frame: "border-[oklch(0.82_0.07_320)] bg-[oklch(0.97_0.03_320)]",
    border: "border-[oklch(0.82_0.07_320)]",
    chip: "bg-[oklch(0.52_0.12_320)] text-white",
    text: "text-[oklch(0.5_0.11_320)]",
    dot: "bg-[oklch(0.6_0.12_320)]",
  },
  ok: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.44_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  blocked: {
    frame: "border-[oklch(0.78_0.12_25)] bg-[oklch(0.96_0.04_25)]",
    border: "border-[oklch(0.78_0.12_25)]",
    chip: "bg-[oklch(0.55_0.17_25)] text-white",
    text: "text-[oklch(0.5_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
  warn: {
    frame: "border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)]",
    border: "border-[oklch(0.82_0.08_75)]",
    chip: "bg-[oklch(0.58_0.11_70)] text-white",
    text: "text-[oklch(0.5_0.1_70)]",
    dot: "bg-[oklch(0.66_0.12_70)]",
  },
  cache: {
    frame: "border-[oklch(0.8_0.04_255)] bg-[oklch(0.965_0.012_255)]",
    border: "border-[oklch(0.8_0.04_255)]",
    chip: "bg-[oklch(0.48_0.05_255)] text-white",
    text: "text-[oklch(0.46_0.05_255)]",
    dot: "bg-[oklch(0.58_0.05_255)]",
  },
};

/** Raw oklch colors for SVG fills/strokes (SVG can't take utility classes). */
export const TONE_SVG: Record<
  Tone,
  { stroke: string; fill: string; ink: string }
> = {
  query: {
    stroke: "oklch(0.58 0.08 195)",
    fill: "oklch(0.965 0.02 195)",
    ink: "oklch(0.44 0.08 195)",
  },
  root: {
    stroke: "oklch(0.6 0.11 300)",
    fill: "oklch(0.97 0.025 300)",
    ink: "oklch(0.48 0.1 300)",
  },
  tld: {
    stroke: "oklch(0.6 0.09 255)",
    fill: "oklch(0.97 0.025 255)",
    ink: "oklch(0.48 0.08 255)",
  },
  auth: {
    stroke: "oklch(0.58 0.12 150)",
    fill: "oklch(0.96 0.04 150)",
    ink: "oklch(0.46 0.1 150)",
  },
  record: {
    stroke: "oklch(0.5 0.02 230)",
    fill: "#ffffff",
    ink: "oklch(0.34 0.02 230)",
  },
  alias: {
    stroke: "oklch(0.6 0.12 320)",
    fill: "oklch(0.97 0.03 320)",
    ink: "oklch(0.48 0.11 320)",
  },
  ok: {
    stroke: "oklch(0.58 0.12 150)",
    fill: "oklch(0.96 0.04 150)",
    ink: "oklch(0.46 0.1 150)",
  },
  blocked: {
    stroke: "oklch(0.62 0.17 25)",
    fill: "oklch(0.96 0.04 25)",
    ink: "oklch(0.5 0.16 25)",
  },
  warn: {
    stroke: "oklch(0.66 0.12 70)",
    fill: "oklch(0.97 0.035 80)",
    ink: "oklch(0.5 0.1 70)",
  },
  cache: {
    stroke: "oklch(0.58 0.05 255)",
    fill: "oklch(0.965 0.012 255)",
    ink: "oklch(0.46 0.05 255)",
  },
};
