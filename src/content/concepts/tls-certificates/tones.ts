/**
 * Semantic tones for the TLS Certificates lesson. One palette carries every
 * meaning the chapters need: an encrypted or trusted state (secure), a plaintext
 * or rejected state (insecure), a validation still in flight (pending), the
 * certificate authority that signs (ca), the store a cert lives in (store), and
 * a neutral resting state (neutral). Meanings are expressed in the app's calm
 * light system as inline oklch utility classes, the same technique the other
 * lessons use.
 *
 * Class strings are written as literals (never interpolated) so Tailwind v4 can
 * discover the arbitrary oklch values while scanning source.
 */
export type Tone =
  | "secure"
  | "insecure"
  | "pending"
  | "ca"
  | "store"
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
  secure: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.46_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  insecure: {
    frame: "border-[oklch(0.78_0.12_25)] bg-[oklch(0.96_0.04_25)]",
    border: "border-[oklch(0.78_0.12_25)]",
    chip: "bg-[oklch(0.55_0.17_25)] text-white",
    text: "text-[oklch(0.5_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
  pending: {
    frame: "border-[oklch(0.82_0.09_70)] bg-[oklch(0.97_0.03_75)]",
    border: "border-[oklch(0.82_0.09_70)]",
    chip: "bg-[oklch(0.62_0.11_65)] text-white",
    text: "text-[oklch(0.5_0.09_65)]",
    dot: "bg-[oklch(0.66_0.12_65)]",
  },
  ca: {
    frame: "border-[oklch(0.82_0.08_300)] bg-[oklch(0.97_0.03_300)]",
    border: "border-[oklch(0.82_0.08_300)]",
    chip: "bg-[oklch(0.52_0.13_300)] text-white",
    text: "text-[oklch(0.5_0.13_300)]",
    dot: "bg-[oklch(0.6_0.13_300)]",
  },
  store: {
    frame: "border-teal-line bg-teal-tint",
    border: "border-teal-line",
    chip: "bg-[oklch(0.46_0.08_195)] text-white",
    text: "text-teal-ink",
    dot: "bg-teal-ring",
  },
  neutral: {
    frame: "border-line bg-surface-muted",
    border: "border-line",
    chip: "bg-[oklch(0.5_0.02_230)] text-white",
    text: "text-ink-muted",
    dot: "bg-ink-muted",
  },
};
