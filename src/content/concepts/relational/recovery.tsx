"use client";

import { useId, useState } from "react";
import type { RecoveryContent } from "./data";

/** Turn a whole number of hours-ago into a plain-language label. */
function agoLabel(hoursAgo: number): string {
  if (hoursAgo <= 0) return "now (latest restorable point)";
  const days = Math.floor(hoursAgo / 24);
  const hours = hoursAgo % 24;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  return `${parts.join(" ")} ago`;
}

/** Chapter 3: a point-in-time recovery timeline you scrub across the retention window. */
export function Recovery({ content }: { content: RecoveryContent }) {
  const maxHours = content.windowDays * 24;
  // Start the marker part-way into the window so the mechanic is obvious.
  const [hoursAgo, setHoursAgo] = useState(Math.round(maxHours / 3));
  const sliderId = useId();

  // Now sits at the right edge; older points move the marker left.
  const markerLeft = (1 - hoursAgo / maxHours) * 100;

  return (
    <div className="mt-[16px]">
      <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
        What a backup is made of
      </p>
      <div className="mt-[10px] flex flex-wrap gap-[8px]">
        {content.pieces.map((piece) => (
          <div
            key={piece.label}
            className="rounded-[10px] border-[1.5px] border-[oklch(0.82_0.06_155)] bg-[oklch(0.97_0.025_155)] px-[12px] py-[8px]"
          >
            <span className="block font-mono text-[12px] font-semibold text-[oklch(0.46_0.09_155)]">
              {piece.label}
            </span>
            <span className="mt-[2px] block font-mono text-[11px] text-ink-muted">
              {piece.sub}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-[22px] rounded-[18px] border border-line bg-surface p-[20px]">
        <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
          <span className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            Restore to
          </span>
          <span className="font-mono text-[13.5px] font-semibold text-teal-ink">
            {agoLabel(hoursAgo)}
          </span>
        </div>

        {/* The retention window: now at the right, oldest at the left. */}
        <div className="relative mt-[16px] h-[46px]">
          <div className="absolute inset-0 rounded-[10px] border-[1.5px] border-[oklch(0.82_0.06_155)] bg-[oklch(0.97_0.025_155)]" />
          <div
            className="absolute top-0 bottom-0 w-[2px] -translate-x-1/2 bg-[oklch(0.5_0.11_150)]"
            style={{ left: `${markerLeft}%` }}
            aria-hidden
          >
            <span className="absolute -top-[7px] left-1/2 h-[14px] w-[14px] -translate-x-1/2 rounded-full border-2 border-surface bg-[oklch(0.5_0.11_150)]" />
          </div>
          <span className="absolute bottom-[6px] left-[10px] font-mono text-[10.5px] text-[oklch(0.46_0.09_155)]">
            ← oldest point in window
          </span>
          <span className="absolute right-[10px] bottom-[6px] font-mono text-[10.5px] text-[oklch(0.46_0.09_155)]">
            now
          </span>
        </div>

        <label htmlFor={sliderId} className="sr-only">
          Choose a restore point within the retention window
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={maxHours}
          step={1}
          value={maxHours - hoursAgo}
          onChange={(e) => setHoursAgo(maxHours - Number(e.target.value))}
          className="mt-[14px] w-full accent-[oklch(0.5_0.11_150)]"
        />

        <div className="mt-[12px] grid grid-cols-1 gap-[10px] min-[560px]:grid-cols-2">
          <div className="rounded-[10px] border border-line bg-surface-muted px-[12px] py-[9px]">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-muted">
              Retention window
            </span>
            <span className="mt-[3px] block text-[13px] font-semibold text-ink-strong">
              {content.rangeLabel}
            </span>
          </div>
          <div className="rounded-[10px] border border-line bg-surface-muted px-[12px] py-[9px]">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-muted">
              Granularity
            </span>
            <span className="mt-[3px] block text-[13px] font-semibold text-ink-strong">
              Restore to {content.granularity} in the window
            </span>
          </div>
        </div>

        <p className="mt-[14px] text-pretty text-[13.5px] leading-[1.6] text-body">
          {content.restoreNote}
        </p>
        <p className="mt-[10px] text-pretty text-[13px] leading-[1.6] text-body-soft">
          {content.beyond}
        </p>
      </div>
    </div>
  );
}
