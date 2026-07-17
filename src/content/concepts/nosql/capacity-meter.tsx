"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CapacityContent } from "./data";
import { TONE } from "./tones";

/** Chapter 5: explore the throughput unit, per-operation cost, and billing modes. */
export function CapacityMeter({ content }: { content: CapacityContent }) {
  const [mode, setMode] = useState(0);
  const [op, setOp] = useState(0);
  const selectedMode = content.modes[mode];
  const selectedOp = content.ops[op];
  const ot = TONE[selectedOp.tone];

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-teal-line bg-teal-tint px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-teal">
          {content.unitName}
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.unitIntro}
        </p>
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1fr_1fr]">
        <div className="rounded-[18px] border border-line bg-surface p-[16px]">
          <p className="px-[2px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            What one operation costs
          </p>
          <div className="mt-[10px] flex flex-col gap-[6px]">
            {content.ops.map((row, i) => {
              const active = i === op;
              const rt = TONE[row.tone];
              return (
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setOp(i)}
                  className={cn(
                    "flex items-center justify-between gap-[10px] rounded-[10px] border px-[12px] py-[10px] text-left transition-colors",
                    active
                      ? cn(rt.frame, "border-[1.5px]")
                      : "border-line bg-surface hover:border-ink-muted",
                  )}
                >
                  <span
                    className={cn(
                      "text-[12.5px]",
                      active
                        ? "font-semibold text-ink-strong"
                        : "text-ink-soft",
                    )}
                  >
                    {row.label}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-[9px] py-[3px] font-mono text-[11px] font-semibold",
                      rt.chip,
                    )}
                  >
                    {row.cost}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            key={selectedOp.id}
            className={cn(
              "mt-[12px] rounded-[12px] border px-[13px] py-[10px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
              ot.frame,
            )}
          >
            <p className="text-[13px] leading-[1.6] text-body">
              {selectedOp.detail}
            </p>
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-surface p-[16px]">
          <p className="px-[2px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            How you provision it
          </p>
          <div className="mt-[10px] flex flex-col gap-[6px]">
            {content.modes.map((row, i) => {
              const active = i === mode;
              return (
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(i)}
                  className={cn(
                    "flex items-center justify-between gap-[10px] rounded-[10px] border px-[12px] py-[10px] text-left transition-colors",
                    active
                      ? "border-teal-ring bg-teal-tint"
                      : "border-line bg-surface hover:border-ink-muted",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[12.5px]",
                      active ? "font-semibold text-teal-ink" : "text-ink-soft",
                    )}
                  >
                    {row.name}
                  </span>
                  {row.isDefault ? (
                    <span className="shrink-0 rounded-full border border-teal-line bg-surface px-[8px] py-[2px] font-mono text-[9.5px] uppercase tracking-[0.05em] text-teal">
                      Default
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div
            key={selectedMode.id}
            className="mt-[12px] rounded-[12px] border border-line bg-surface-muted px-[13px] py-[11px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
          >
            <p className="text-[13px] leading-[1.6] text-body">
              {selectedMode.billing}
            </p>
            <p className="mt-[8px] text-[12.5px] leading-[1.6] text-ink-muted">
              <span className="font-semibold text-ink-strong">Best for: </span>
              {selectedMode.bestFor}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
