"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LimitsContent, SizingModel } from "./data";
import { TONE } from "./tones";

const fmtCores = (cores: number) =>
  cores >= 1 ? `${Number(cores.toFixed(2))} vCPU` : `${cores.toFixed(2)} vCPU`;

const fmtMb = (mb: number) =>
  mb >= 1024
    ? `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`
    : `${mb} MB`;

/** The memory / instance-size control that derives CPU. */
function SizingControl({ sizing }: { sizing: SizingModel }) {
  const [continuousMem, setContinuousMem] = useState(
    sizing.mode === "continuous" ? sizing.defaultValue : 0,
  );
  const [discreteIndex, setDiscreteIndex] = useState(
    sizing.mode === "discrete" ? sizing.defaultIndex : 0,
  );

  const mem =
    sizing.mode === "continuous"
      ? continuousMem
      : sizing.sizes[discreteIndex].value;
  const cores =
    sizing.mode === "continuous"
      ? continuousMem / sizing.vcpuAtMb
      : sizing.sizes[discreteIndex].cores;
  // CPU bar is drawn relative to two full vCPUs.
  const coreFrac = Math.min(1, cores / 2);

  return (
    <div className="rounded-[18px] border border-line bg-surface p-[18px]">
      <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
        {sizing.label}
      </p>

      {sizing.mode === "continuous" ? (
        <>
          <div className="mt-[12px] flex items-baseline gap-[10px]">
            <span className="font-mono text-[26px] font-bold text-ink-strong">
              {fmtMb(mem)}
            </span>
            <span className="font-mono text-[12px] text-ink-muted">memory</span>
          </div>
          <input
            aria-label={sizing.label}
            type="range"
            min={sizing.min}
            max={sizing.max}
            step={sizing.step}
            value={continuousMem}
            onChange={(e) => setContinuousMem(Number(e.target.value))}
            className="mt-[10px] w-full accent-[oklch(0.55_0.09_195)]"
          />
          <div className="flex justify-between font-mono text-[10.5px] text-faint">
            <span>{fmtMb(sizing.min)}</span>
            <span>{fmtMb(sizing.max)}</span>
          </div>
        </>
      ) : (
        <div className="mt-[12px] flex flex-wrap gap-[8px]">
          {sizing.sizes.map((size, i) => {
            const active = i === discreteIndex;
            return (
              <button
                key={size.value}
                type="button"
                aria-pressed={active}
                onClick={() => setDiscreteIndex(i)}
                className={cn(
                  "rounded-[10px] border px-[14px] py-[9px] font-mono text-[13px] transition-colors",
                  active
                    ? cn(
                        TONE.instance.frame,
                        TONE.instance.text,
                        "border-[1.5px] font-semibold",
                      )
                    : "border-line bg-surface text-ink-soft hover:border-ink-muted",
                )}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        className={cn(
          "mt-[16px] rounded-[12px] border-[1.5px] p-[14px]",
          TONE.invoke.frame,
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            CPU you get
          </span>
          <span
            className={cn("font-mono text-[15px] font-bold", TONE.invoke.text)}
          >
            {fmtCores(cores)}
          </span>
        </div>
        <div className="mt-[10px] h-[8px] overflow-hidden rounded-full bg-surface-muted">
          <div
            className={cn(
              "h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300",
              TONE.invoke.dot,
            )}
            style={{ width: `${Math.round(coreFrac * 100)}%` }}
          />
        </div>
        <p className="mt-[10px] text-[13px] leading-[1.6] text-body">
          {sizing.cpuNote}
        </p>
      </div>
    </div>
  );
}

/** Chapter 4: set memory or instance size, see CPU follow, and read the hard limits. */
export function LimitsExplorer({ content }: { content: LimitsContent }) {
  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1fr_1fr]">
      <SizingControl sizing={content.sizing} />

      <div className="grid grid-cols-1 gap-[10px] min-[520px]:grid-cols-2">
        {content.limits.map((row) => (
          <div
            key={row.label}
            className="rounded-[14px] border border-line bg-surface p-[14px]"
          >
            <div className="flex items-baseline justify-between gap-[8px]">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
                {row.label}
              </span>
              <span className="font-mono text-[13px] font-semibold text-teal-ink">
                {row.value}
              </span>
            </div>
            <p className="mt-[6px] text-pretty text-[12.5px] leading-[1.5] text-body-soft">
              {row.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
