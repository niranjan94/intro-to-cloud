/**
 * Semantic tones for the Load Balancing lesson. One palette carries every
 * meaning the chapters need: the load balancer itself (lb), the client or
 * internet side (client), a healthy or failed target (healthy / down), the two
 * network zones (public / private), and the two layers the lesson turns on
 * (l4 / l7). Meanings are expressed in the app's calm light system as inline
 * oklch utility classes, the same technique diagram.tsx already uses.
 *
 * Class strings are written as literals (never interpolated) so Tailwind v4 can
 * discover the arbitrary oklch values while scanning source.
 */
export type Tone =
  | "lb"
  | "client"
  | "healthy"
  | "down"
  | "public"
  | "private"
  | "l4"
  | "l7"
  | "neutral";

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
  lb: {
    frame: "border-teal-line bg-teal-tint",
    border: "border-teal-line",
    chip: "bg-[oklch(0.46_0.08_195)] text-white",
    text: "text-teal-ink",
    dot: "bg-teal-ring",
  },
  client: {
    frame: "border-line bg-surface-muted",
    border: "border-line",
    chip: "bg-[oklch(0.4_0.02_230)] text-white",
    text: "text-ink-strong",
    dot: "bg-[oklch(0.5_0.02_230)]",
  },
  healthy: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.46_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  down: {
    frame: "border-[oklch(0.78_0.12_25)] bg-[oklch(0.96_0.04_25)]",
    border: "border-[oklch(0.78_0.12_25)]",
    chip: "bg-[oklch(0.55_0.17_25)] text-white",
    text: "text-[oklch(0.5_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
  public: {
    frame: "border-[oklch(0.82_0.09_70)] bg-[oklch(0.97_0.03_75)]",
    border: "border-[oklch(0.82_0.09_70)]",
    chip: "bg-[oklch(0.62_0.11_65)] text-white",
    text: "text-[oklch(0.5_0.09_65)]",
    dot: "bg-[oklch(0.66_0.12_65)]",
  },
  private: {
    frame: "border-[oklch(0.8_0.06_255)] bg-[oklch(0.97_0.025_255)]",
    border: "border-[oklch(0.8_0.06_255)]",
    chip: "bg-[oklch(0.52_0.09_255)] text-white",
    text: "text-[oklch(0.5_0.08_255)]",
    dot: "bg-[oklch(0.6_0.09_255)]",
  },
  l4: {
    frame: "border-[oklch(0.82_0.08_300)] bg-[oklch(0.97_0.03_300)]",
    border: "border-[oklch(0.82_0.08_300)]",
    chip: "bg-[oklch(0.52_0.13_300)] text-white",
    text: "text-[oklch(0.5_0.13_300)]",
    dot: "bg-[oklch(0.6_0.13_300)]",
  },
  l7: {
    frame: "border-[oklch(0.8_0.07_215)] bg-[oklch(0.97_0.028_215)]",
    border: "border-[oklch(0.8_0.07_215)]",
    chip: "bg-[oklch(0.5_0.11_215)] text-white",
    text: "text-[oklch(0.48_0.1_215)]",
    dot: "bg-[oklch(0.58_0.11_215)]",
  },
  neutral: {
    frame: "border-line bg-surface-muted",
    border: "border-line",
    chip: "bg-[oklch(0.5_0.02_230)] text-white",
    text: "text-ink-muted",
    dot: "bg-ink-muted",
  },
};

/** Raw oklch colors for SVG fills/strokes (SVG can't take utility classes). */
export const TONE_SVG: Record<
  Tone,
  { stroke: string; fill: string; ink: string }
> = {
  lb: {
    stroke: "oklch(0.55 0.09 195)",
    fill: "oklch(0.97 0.02 195)",
    ink: "oklch(0.42 0.07 195)",
  },
  client: {
    stroke: "oklch(0.5 0.02 230)",
    fill: "#ffffff",
    ink: "oklch(0.34 0.02 230)",
  },
  healthy: {
    stroke: "oklch(0.58 0.12 150)",
    fill: "oklch(0.96 0.04 150)",
    ink: "oklch(0.44 0.1 150)",
  },
  down: {
    stroke: "oklch(0.62 0.17 25)",
    fill: "oklch(0.96 0.04 25)",
    ink: "oklch(0.5 0.16 25)",
  },
  public: {
    stroke: "oklch(0.68 0.1 65)",
    fill: "oklch(0.97 0.03 75)",
    ink: "oklch(0.5 0.09 65)",
  },
  private: {
    stroke: "oklch(0.62 0.08 255)",
    fill: "oklch(0.97 0.025 255)",
    ink: "oklch(0.48 0.08 255)",
  },
  l4: {
    stroke: "oklch(0.6 0.13 300)",
    fill: "oklch(0.97 0.03 300)",
    ink: "oklch(0.48 0.13 300)",
  },
  l7: {
    stroke: "oklch(0.58 0.11 215)",
    fill: "oklch(0.97 0.028 215)",
    ink: "oklch(0.46 0.1 215)",
  },
  neutral: {
    stroke: "oklch(0.5 0.02 230)",
    fill: "oklch(0.975 0.006 220)",
    ink: "oklch(0.5 0.02 230)",
  },
};
