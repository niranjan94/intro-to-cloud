import type {
  Difficulty,
  Severity,
  SourcePlatform,
} from "@/components/investigation/types";
import { SOURCE_PLATFORM_LABELS } from "@/components/investigation/types";
import { cn } from "@/lib/utils";

/**
 * The small status pills used across the Investigations surface. Colours follow
 * the app's status-swatch formula as inline oklch literals (globals.css keeps
 * only `--destructive` as a named status token), and no provider brand colour
 * appears on any surface (ADR-0002). All three share the `WipBadge` shell shape.
 */

const BADGE_BASE =
  "inline-flex shrink-0 items-center rounded-[5px] border px-[6px] py-[1px] font-mono text-[9.5px] font-medium uppercase tracking-[0.08em]";

const SEVERITY_STYLE: Record<Severity, string> = {
  critical:
    "border-[oklch(0.72_0.14_25)] bg-[oklch(0.96_0.04_25)] text-[oklch(0.53_0.16_25)]",
  high: "border-[oklch(0.74_0.13_50)] bg-[oklch(0.965_0.04_50)] text-[oklch(0.52_0.15_50)]",
  medium:
    "border-[oklch(0.8_0.1_85)] bg-[oklch(0.97_0.04_85)] text-[oklch(0.5_0.1_85)]",
  low: "border-[oklch(0.78_0.08_235)] bg-[oklch(0.97_0.03_235)] text-[oklch(0.48_0.1_235)]",
  info: "border-line bg-surface-muted text-ink-muted",
};

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

/** The alert's pre-assigned severity (shown, never graded). */
export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn(BADGE_BASE, SEVERITY_STYLE[severity])}>
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  guided: "border-teal-line bg-teal-tint text-teal-ink",
  standard: "border-line bg-surface-muted text-faint",
  challenge:
    "border-[oklch(0.74_0.13_50)] bg-[oklch(0.965_0.04_50)] text-[oklch(0.52_0.15_50)]",
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  guided: "Guided",
  standard: "Standard",
  challenge: "Challenge",
};

/** The Investigation's scaffolding tier. Never gates; only orders and hints. */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={cn(BADGE_BASE, DIFFICULTY_STYLE[difficulty])}>
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}

/** The source platform an alert originates from. Neutral surface, no brand colour. */
export function SourcePlatformBadge({
  platform,
}: {
  platform: SourcePlatform;
}) {
  return (
    <span
      className={cn(BADGE_BASE, "border-line bg-surface-muted text-ink-muted")}
    >
      {SOURCE_PLATFORM_LABELS[platform]}
    </span>
  );
}
