"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PricingContent } from "./data";

/** Chapter 4: pick a purchasing model and see the price/flexibility tradeoff. */
export function PricingPicker({ content }: { content: PricingContent }) {
  const [current, setCurrent] = useState(0);
  const model = content.models[current];

  return (
    <div className="mt-[16px]">
      <div className="flex flex-col gap-[10px]">
        {content.models.map((m, i) => {
          const active = i === current;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-[12px] border-[1.5px] px-[16px] py-[13px] text-left transition-colors",
                active
                  ? "border-teal-ring bg-teal-tint"
                  : "border-line bg-surface hover:border-ink-muted",
              )}
            >
              <div className="flex items-center justify-between gap-[12px]">
                <span className="text-[14px] font-semibold text-ink-strong">
                  {m.label}
                </span>
                <span className="font-mono text-[11.5px] text-teal-ink">
                  {m.save}
                </span>
              </div>
              <div className="mt-[9px] flex items-center gap-[10px]">
                <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-teal-ring motion-safe:transition-[width] motion-safe:duration-500"
                    style={{ width: `${Math.round(m.rel * 100)}%` }}
                  />
                </div>
                <span className="w-[92px] shrink-0 text-right font-mono text-[11px] text-ink-muted">
                  {m.commit}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div
        key={model.id}
        className="mt-[16px] rounded-[18px] border border-line bg-surface-muted p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
          <h3 className="text-[16px] font-semibold text-ink-strong">
            {model.label}
          </h3>
          <span className="font-mono text-[12px] text-teal-ink">
            Best for: {model.best}
          </span>
        </div>
        <p className="mt-[10px] text-[13.5px] leading-[1.6] text-body">
          {model.blurb}
        </p>
      </div>

      <p className="mt-[12px] font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
