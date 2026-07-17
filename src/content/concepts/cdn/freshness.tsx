"use client";

import { useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import { cn } from "@/lib/utils";
import type { OpsContent } from "./data";
import { TONE } from "./tones";

/** Chapter 5: pick an operational situation and see the mechanism for it. */
export function FreshnessDecision({ content }: { content: OpsContent }) {
  const [current, setCurrent] = useState(0);
  const scenario = content.scenarios[current];
  const t = TONE[scenario.tone];

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[16px]">
        <p className="px-[2px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          The situation
        </p>
        <div className="mt-[10px] flex flex-col gap-[6px]">
          {content.scenarios.map((s, i) => {
            const active = i === current;
            const st = TONE[s.tone];
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(i)}
                className={cn(
                  "flex items-center gap-[9px] rounded-[10px] border px-[12px] py-[10px] text-left transition-colors",
                  active
                    ? cn(st.frame, "border-[1.5px]")
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "h-[9px] w-[9px] shrink-0 rounded-full",
                    active ? st.dot : "bg-line",
                  )}
                />
                <span
                  className={cn(
                    "font-mono text-[12.5px]",
                    active ? cn(st.text, "font-semibold") : "text-ink-soft",
                  )}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={scenario.id}
        className={cn(
          "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
          t.frame,
        )}
      >
        <p className="text-[14px] leading-[1.6] text-body">
          {scenario.question}
        </p>

        <div className="mt-[16px] flex flex-wrap items-center gap-[10px]">
          <span
            className={cn(
              "rounded-full px-[12px] py-[4px] font-mono text-[11.5px]",
              t.chip,
            )}
          >
            {scenario.mechanism}
          </span>
          <h3 className={cn("text-[16px] font-semibold", t.text)}>
            {scenario.verdict}
          </h3>
        </div>

        <p className="mt-[12px] text-[13.5px] leading-[1.6] text-body">
          {scenario.why}
        </p>

        {scenario.cli ? <CliBlock command={scenario.cli} /> : null}
      </div>
    </div>
  );
}
