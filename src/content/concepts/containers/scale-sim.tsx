"use client";

import { SquareIcon as Square } from "@phosphor-icons/react/dist/ssr";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { ScaleContent } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 4: drag a load slider and watch the running instance count follow.
 * The math is deliberately simple (one instance per `perUnit` of load, clamped
 * to the min and max), so the teaching point stands out: whether the platform
 * can drop to zero when the load is gone.
 */
export function ScaleSim({ content }: { content: ScaleContent }) {
  const sliderId = useId();
  const [load, setLoad] = useState(Math.round(content.loadMax * 0.3));

  const desired = computeDesired(load, content);
  const atZero = desired === 0;
  const atMax = desired === content.max;
  const noun = content.unitNoun;
  const nounPlural = `${noun}s`;

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          {content.engine}
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.ruleSummary}
        </p>
      </div>

      <div className="mt-[18px] rounded-[18px] border border-line bg-surface p-[20px]">
        {/* Load slider */}
        <div className="flex items-center justify-between">
          <label
            htmlFor={sliderId}
            className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted"
          >
            {content.loadLabel}
          </label>
          <span className="font-mono text-[12.5px] text-ink-strong">
            {load}{" "}
            <span className="text-ink-muted">/ {content.metricLabel}</span>
          </span>
        </div>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={content.loadMax}
          step={5}
          value={load}
          onChange={(e) => setLoad(Number(e.target.value))}
          className="mt-[10px] w-full"
          style={{ accentColor: "var(--color-teal)" }}
        />
        <div className="mt-[4px] flex justify-between font-mono text-[10px] text-faint">
          <span>idle</span>
          <span>peak</span>
        </div>

        {/* Instance count read-out */}
        <div className="mt-[20px] flex flex-wrap items-end justify-between gap-[12px]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
              Running {nounPlural}
            </div>
            <div className="mt-[2px] flex items-baseline gap-[8px]">
              <span
                className={cn(
                  "font-mono text-[34px] font-extrabold tabular-nums leading-none",
                  atZero ? "text-ink-muted" : TONE.ok.text,
                )}
              >
                {desired}
              </span>
              <span className="font-mono text-[12px] text-ink-muted">
                min {content.min} · max {content.max}
              </span>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[12px] py-[5px] font-mono text-[11.5px] font-semibold",
              atZero
                ? cn(TONE.idle.frame, TONE.idle.text)
                : cn(TONE.ok.frame, TONE.ok.text),
            )}
          >
            <span
              className={cn(
                "h-[8px] w-[8px] rounded-full",
                atZero ? TONE.idle.dot : TONE.ok.dot,
              )}
            />
            {atZero
              ? "Scaled to zero · no usage billed"
              : atMax
                ? "At the ceiling"
                : "Serving"}
          </span>
        </div>

        {/* Instance cells */}
        <div className="mt-[14px] flex flex-wrap gap-[7px]">
          {Array.from({ length: content.max }, (_, i) => {
            const filled = i < desired;
            return (
              <div
                key={`slot-${i + 1}`}
                aria-hidden
                className={cn(
                  "flex h-[38px] w-[30px] items-center justify-center rounded-[7px] border font-mono text-[11px] motion-safe:transition-all motion-safe:duration-300",
                  filled
                    ? cn(TONE.ok.frame, "border-[1.5px]", TONE.ok.text)
                    : "border-dashed border-line bg-surface-muted text-faint",
                )}
              >
                {filled ? (
                  <Square size={13} weight="fill" aria-hidden />
                ) : (
                  <Square size={13} aria-hidden />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-[10px] font-mono text-[11px] text-ink-muted">
          Each cell is one {noun}. Solid cells are running now; dashed cells are
          headroom up to the maximum.
        </p>
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}

/** One instance per `perUnit` of load, clamped to [min, max]; zero only if allowed. */
function computeDesired(load: number, content: ScaleContent): number {
  if (load <= 0) return content.canScaleToZero ? 0 : content.min;
  const raw = Math.ceil(load / content.perUnit);
  return Math.min(content.max, Math.max(content.min, raw));
}
