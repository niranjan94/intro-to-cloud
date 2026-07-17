/**
 * Semantic tones for the Virtual Machines lesson. Two vocabularies live here:
 * the category of a machine part (compute, storage, network, security,
 * identity) used by the anatomy map, and the lifecycle state of a running
 * machine (pending, running, stopped, deallocated, terminated) used by the
 * lifecycle simulator. Meanings are expressed in the app's calm light system as
 * inline oklch utility classes, the same technique diagram.tsx already uses.
 *
 * Class strings are written as literals (never interpolated) so Tailwind v4 can
 * discover the arbitrary oklch values while scanning source.
 */
export type Tone =
  | "compute"
  | "storage"
  | "network"
  | "security"
  | "identity"
  | "pending"
  | "running"
  | "stopped"
  | "deallocated"
  | "terminated";

interface ToneClasses {
  /** Solid-ish container: border + tint background. */
  frame: string;
  /** Border only (for dashed overlays). */
  border: string;
  /** Filled label chip: background + light text. */
  chip: string;
  /** Label/heading text color. */
  text: string;
  /** A small status dot background. */
  dot: string;
}

export const TONE: Record<Tone, ToneClasses> = {
  compute: {
    frame: "border-teal-line bg-teal-tint",
    border: "border-teal-line",
    chip: "bg-[oklch(0.46_0.08_195)] text-white",
    text: "text-teal-ink",
    dot: "bg-teal-ring",
  },
  storage: {
    frame: "border-[oklch(0.82_0.06_300)] bg-[oklch(0.97_0.025_300)]",
    border: "border-[oklch(0.82_0.06_300)]",
    chip: "bg-[oklch(0.52_0.11_300)] text-white",
    text: "text-[oklch(0.5_0.1_300)]",
    dot: "bg-[oklch(0.6_0.11_300)]",
  },
  network: {
    frame: "border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)]",
    border: "border-[oklch(0.8_0.06_245)]",
    chip: "bg-[oklch(0.52_0.09_255)] text-white",
    text: "text-[oklch(0.5_0.08_255)]",
    dot: "bg-[oklch(0.6_0.09_255)]",
  },
  security: {
    frame: "border-[oklch(0.78_0.1_25)] bg-[oklch(0.97_0.03_25)]",
    border: "border-[oklch(0.78_0.1_25)]",
    chip: "bg-[oklch(0.58_0.16_25)] text-white",
    text: "text-[oklch(0.53_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
  identity: {
    frame: "border-[oklch(0.82_0.08_70)] bg-[oklch(0.97_0.03_75)]",
    border: "border-[oklch(0.82_0.08_70)]",
    chip: "bg-[oklch(0.58_0.11_65)] text-white",
    text: "text-[oklch(0.52_0.1_65)]",
    dot: "bg-[oklch(0.68_0.12_65)]",
  },
  pending: {
    frame: "border-teal-line bg-teal-tint",
    border: "border-teal-line",
    chip: "bg-[oklch(0.46_0.08_195)] text-white",
    text: "text-teal-ink",
    dot: "bg-teal-ring",
  },
  running: {
    frame: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]",
    border: "border-[oklch(0.72_0.12_150)]",
    chip: "bg-[oklch(0.52_0.11_150)] text-white",
    text: "text-[oklch(0.48_0.1_150)]",
    dot: "bg-[oklch(0.58_0.12_150)]",
  },
  stopped: {
    frame: "border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)]",
    border: "border-[oklch(0.82_0.08_75)]",
    chip: "bg-[oklch(0.58_0.11_70)] text-white",
    text: "text-[oklch(0.5_0.1_70)]",
    dot: "bg-[oklch(0.66_0.12_70)]",
  },
  deallocated: {
    frame: "border-[oklch(0.8_0.03_255)] bg-[oklch(0.965_0.008_255)]",
    border: "border-[oklch(0.8_0.03_255)]",
    chip: "bg-[oklch(0.48_0.04_255)] text-white",
    text: "text-[oklch(0.46_0.04_255)]",
    dot: "bg-[oklch(0.58_0.04_255)]",
  },
  terminated: {
    frame: "border-[oklch(0.78_0.12_25)] bg-[oklch(0.96_0.04_25)]",
    border: "border-[oklch(0.78_0.12_25)]",
    chip: "bg-[oklch(0.55_0.17_25)] text-white",
    text: "text-[oklch(0.5_0.16_25)]",
    dot: "bg-[oklch(0.62_0.17_25)]",
  },
};
