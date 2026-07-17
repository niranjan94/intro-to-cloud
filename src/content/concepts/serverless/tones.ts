/**
 * Semantic tones for the Serverless Functions lesson. One palette serves several
 * vocabularies: the source that fires a function (event), the phases of an
 * invocation (init for cold-start work, invoke for the running handler, frozen
 * for a paused environment), the units that scale out (instance), and the
 * outcome of a request under load (ok, throttle). Colors are expressed as inline
 * oklch utility classes, the same technique diagram.tsx and the object-storage
 * lesson already use, so nothing here reaches for a provider brand color.
 *
 * Class strings are written as literals (never interpolated) so Tailwind v4 can
 * discover the arbitrary oklch values while scanning source.
 */
export type Tone =
  | "event"
  | "init"
  | "invoke"
  | "frozen"
  | "instance"
  | "ok"
  | "throttle"
  | "meta";

interface ToneClasses {
  /** Solid-ish container: border + tint background. */
  frame: string;
  /** Border only (for dashed overlays). */
  border: string;
  /** Filled label chip: background + light text. */
  chip: string;
  /** Label/heading text color. */
  text: string;
  /** A small status dot / bar / cell background. */
  dot: string;
}

export const TONE: Record<Tone, ToneClasses> = {
  event: {
    frame: "border-[oklch(0.82_0.06_300)] bg-[oklch(0.97_0.025_300)]",
    border: "border-[oklch(0.82_0.06_300)]",
    chip: "bg-[oklch(0.52_0.11_300)] text-white",
    text: "text-[oklch(0.5_0.1_300)]",
    dot: "bg-[oklch(0.6_0.11_300)]",
  },
  init: {
    frame: "border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)]",
    border: "border-[oklch(0.82_0.08_75)]",
    chip: "bg-[oklch(0.58_0.11_70)] text-white",
    text: "text-[oklch(0.5_0.1_70)]",
    dot: "bg-[oklch(0.66_0.12_70)]",
  },
  invoke: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.46_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  frozen: {
    frame: "border-[oklch(0.8_0.03_240)] bg-[oklch(0.965_0.01_240)]",
    border: "border-[oklch(0.8_0.03_240)]",
    chip: "bg-[oklch(0.5_0.03_240)] text-white",
    text: "text-[oklch(0.48_0.03_240)]",
    dot: "bg-[oklch(0.6_0.03_240)]",
  },
  instance: {
    frame: "border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)]",
    border: "border-[oklch(0.8_0.06_245)]",
    chip: "bg-[oklch(0.52_0.09_255)] text-white",
    text: "text-[oklch(0.5_0.08_255)]",
    dot: "bg-[oklch(0.6_0.09_255)]",
  },
  ok: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.44_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  throttle: {
    frame: "border-[oklch(0.78_0.12_25)] bg-[oklch(0.96_0.04_25)]",
    border: "border-[oklch(0.78_0.12_25)]",
    chip: "bg-[oklch(0.55_0.17_25)] text-white",
    text: "text-[oklch(0.5_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
  meta: {
    frame: "border-line bg-surface-muted",
    border: "border-line",
    chip: "bg-[oklch(0.5_0.02_230)] text-white",
    text: "text-ink-muted",
    dot: "bg-ink-muted",
  },
};
