/**
 * Semantic tones for the Containers lesson. One palette carries several
 * vocabularies: the parts of the delivery pipeline (image, registry, container),
 * the two compute models (serverless, managed), the state of a scaled app (ok,
 * idle), an access verdict (ok, deny), and the two versions in a rollout (verA,
 * verB). Meanings are expressed in the app's calm light system as inline oklch
 * utility classes, the same technique diagram.tsx already uses.
 *
 * Class strings are written as literals (never interpolated) so Tailwind v4 can
 * discover the arbitrary oklch values while scanning source.
 */
export type Tone =
  | "container"
  | "image"
  | "registry"
  | "serverless"
  | "managed"
  | "idle"
  | "ok"
  | "deny"
  | "verA"
  | "verB";

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
  container: {
    frame: "border-teal-line bg-teal-tint",
    border: "border-teal-line",
    chip: "bg-[oklch(0.46_0.08_195)] text-white",
    text: "text-teal-ink",
    dot: "bg-teal-ring",
  },
  image: {
    frame: "border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)]",
    border: "border-[oklch(0.8_0.06_245)]",
    chip: "bg-[oklch(0.52_0.09_255)] text-white",
    text: "text-[oklch(0.5_0.08_255)]",
    dot: "bg-[oklch(0.6_0.09_255)]",
  },
  registry: {
    frame: "border-[oklch(0.82_0.06_300)] bg-[oklch(0.97_0.025_300)]",
    border: "border-[oklch(0.82_0.06_300)]",
    chip: "bg-[oklch(0.52_0.11_300)] text-white",
    text: "text-[oklch(0.5_0.1_300)]",
    dot: "bg-[oklch(0.6_0.11_300)]",
  },
  serverless: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.48_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  managed: {
    frame: "border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)]",
    border: "border-[oklch(0.82_0.08_75)]",
    chip: "bg-[oklch(0.58_0.11_70)] text-white",
    text: "text-[oklch(0.5_0.1_70)]",
    dot: "bg-[oklch(0.66_0.12_70)]",
  },
  idle: {
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
  deny: {
    frame: "border-[oklch(0.78_0.12_25)] bg-[oklch(0.96_0.04_25)]",
    border: "border-[oklch(0.78_0.12_25)]",
    chip: "bg-[oklch(0.55_0.17_25)] text-white",
    text: "text-[oklch(0.5_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
  verA: {
    frame: "border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)]",
    border: "border-[oklch(0.8_0.06_245)]",
    chip: "bg-[oklch(0.52_0.09_255)] text-white",
    text: "text-[oklch(0.5_0.08_255)]",
    dot: "bg-[oklch(0.6_0.09_255)]",
  },
  verB: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.48_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
};
