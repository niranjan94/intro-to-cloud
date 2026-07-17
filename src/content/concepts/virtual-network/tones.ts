/**
 * Semantic tones for the Virtual Network lesson diagrams. The source explainers
 * used a bold blueprint palette (amber/teal/red/green); here those meanings are
 * re-expressed in the app's calm light system as inline oklch utility classes,
 * the same technique diagram.tsx and vm-interactive.tsx already use.
 *
 * Meanings: `net` the VPC/VNet boundary · `public` an internet-facing zone ·
 * `private` an internal-only zone · `resource` a concrete thing (VM, NIC) ·
 * `firewall` a rule set that denies/allows · `ok` an allowed / passing state.
 *
 * Class strings are written as literals (never interpolated) so Tailwind v4 can
 * discover the arbitrary oklch values while scanning source.
 */
export type Tone =
  | "net"
  | "public"
  | "private"
  | "resource"
  | "firewall"
  | "ok";

interface ToneClasses {
  /** Solid-ish container: border + tint background. */
  frame: string;
  /** Border only (for dashed rule overlays). */
  border: string;
  /** Filled label chip: background + light text. */
  chip: string;
  /** Label/heading text color. */
  text: string;
  /** A small status dot background. */
  dot: string;
}

export const TONE: Record<Tone, ToneClasses> = {
  net: {
    frame: "border-[oklch(0.55_0.03_240)] bg-[oklch(0.985_0.005_240)]",
    border: "border-[oklch(0.55_0.03_240)]",
    chip: "bg-[oklch(0.42_0.03_240)] text-white",
    text: "text-[oklch(0.42_0.03_240)]",
    dot: "bg-[oklch(0.5_0.03_240)]",
  },
  public: {
    frame: "border-[oklch(0.78_0.09_70)] bg-[oklch(0.97_0.03_75)]",
    border: "border-[oklch(0.78_0.09_70)]",
    chip: "bg-[oklch(0.62_0.11_65)] text-white",
    text: "text-[oklch(0.52_0.09_65)]",
    dot: "bg-[oklch(0.68_0.12_65)]",
  },
  private: {
    frame: "border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)]",
    border: "border-[oklch(0.8_0.06_245)]",
    chip: "bg-[oklch(0.52_0.09_255)] text-white",
    text: "text-[oklch(0.5_0.08_255)]",
    dot: "bg-[oklch(0.6_0.09_255)]",
  },
  resource: {
    frame: "border-line bg-surface",
    border: "border-line",
    chip: "bg-[oklch(0.4_0.02_230)] text-white",
    text: "text-ink-strong",
    dot: "bg-[oklch(0.5_0.02_230)]",
  },
  firewall: {
    frame: "border-[oklch(0.72_0.14_25)] bg-[oklch(0.96_0.04_25)]",
    border: "border-[oklch(0.72_0.14_25)]",
    chip: "bg-[oklch(0.58_0.16_25)] text-white",
    text: "text-[oklch(0.53_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
  ok: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.48_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
};

/** Raw oklch colors for SVG fills/strokes (SVG can't take utility classes). */
export const TONE_SVG: Record<
  Tone,
  { stroke: string; fill: string; ink: string }
> = {
  net: {
    stroke: "oklch(0.5 0.03 240)",
    fill: "none",
    ink: "oklch(0.42 0.03 240)",
  },
  public: {
    stroke: "oklch(0.68 0.1 65)",
    fill: "oklch(0.97 0.03 75)",
    ink: "oklch(0.5 0.09 65)",
  },
  private: {
    stroke: "oklch(0.62 0.08 255)",
    fill: "oklch(0.97 0.025 245)",
    ink: "oklch(0.48 0.08 255)",
  },
  resource: {
    stroke: "oklch(0.5 0.02 230)",
    fill: "#ffffff",
    ink: "oklch(0.34 0.02 230)",
  },
  firewall: {
    stroke: "oklch(0.62 0.16 25)",
    fill: "oklch(0.96 0.04 25)",
    ink: "oklch(0.53 0.16 25)",
  },
  ok: {
    stroke: "oklch(0.58 0.12 150)",
    fill: "oklch(0.96 0.04 150)",
    ink: "oklch(0.48 0.1 150)",
  },
};
