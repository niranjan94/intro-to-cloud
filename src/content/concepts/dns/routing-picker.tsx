"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RoutingContent } from "./data";
import { TONE } from "./tones";

/** Chapter 4: pick a routing goal and see the mechanism this provider uses. */
export function RoutingPicker({ content }: { content: RoutingContent }) {
  const [current, setCurrent] = useState(0);
  const goal = content.goals[current];
  const t = TONE[goal.tone];

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-teal-line bg-teal-tint px-[16px] py-[13px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-teal">
          Routing lives in · {content.service}
        </p>
        <p className="mt-[6px] text-pretty text-[13.5px] leading-[1.6] text-body">
          {content.model}
        </p>
      </div>

      <div
        aria-live="polite"
        className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.85fr_1.15fr]"
      >
        <div className="rounded-[18px] border border-line bg-surface p-[12px]">
          <p className="px-[6px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            Your goal
          </p>
          <div className="mt-[10px] flex flex-col gap-[5px]">
            {content.goals.map((g, i) => {
              const active = i === current;
              const gt = TONE[g.tone];
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "flex items-center gap-[10px] rounded-[10px] border px-[12px] py-[10px] text-left transition-colors",
                    active
                      ? cn(gt.frame, "border-[1.5px]")
                      : "border-line bg-surface hover:border-ink-muted",
                  )}
                >
                  <span
                    className={cn("h-[9px] w-[9px] rounded-full", gt.dot)}
                  />
                  <span
                    className={cn(
                      "text-[13px]",
                      active ? cn(gt.text, "font-semibold") : "text-ink-soft",
                    )}
                  >
                    {g.goal}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={goal.id}
          className={cn(
            "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            t.frame,
          )}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            {content.service} uses
          </p>
          <div className="mt-[6px] flex items-center gap-[9px]">
            <span className={cn("h-[11px] w-[11px] rounded-full", t.dot)} />
            <h3 className={cn("text-[17px] font-semibold", t.text)}>
              {goal.mechanism}
            </h3>
          </div>
          <p className="mt-[10px] text-pretty text-[13.5px] leading-[1.6] text-body">
            {goal.how}
          </p>

          <div className="mt-[16px] rounded-[12px] border border-line bg-surface px-[14px] py-[12px]">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
              Health checking
            </p>
            <p className="mt-[5px] text-[13px] leading-[1.6] text-body">
              {content.health}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
