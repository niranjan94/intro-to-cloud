"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AccessContent } from "./data";
import { TONE } from "./tones";

/** Chapter 3: run access patterns and see how the store serves each one. */
export function QueryPlanner({ content }: { content: AccessContent }) {
  const [current, setCurrent] = useState(0);
  const pattern = content.patterns[current];
  const t = TONE[pattern.tone];

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          Access patterns
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.intro}
        </p>
      </div>

      <div
        aria-live="polite"
        className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="flex flex-col gap-[8px]">
          {content.patterns.map((p, i) => {
            const active = i === current;
            const pt = TONE[p.tone];
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(i)}
                className={cn(
                  "rounded-[10px] border px-[14px] py-[11px] text-left transition-colors",
                  active
                    ? cn(pt.frame, "border-[1.5px]")
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <span className="flex items-center gap-[8px]">
                  <span
                    className={cn("h-[8px] w-[8px] rounded-full", pt.dot)}
                  />
                  <span
                    className={cn(
                      "text-[13.5px] font-semibold",
                      active ? pt.text : "text-ink-strong",
                    )}
                  >
                    {p.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={pattern.id}
          className={cn(
            "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            t.frame,
          )}
        >
          <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
            Request
          </p>
          <p className="mt-[5px] break-words font-mono text-[12.5px] text-ink-strong">
            {pattern.request}
          </p>

          <div className="mt-[14px] flex flex-wrap items-center gap-[10px]">
            <span
              className={cn(
                "rounded-full px-[12px] py-[4px] font-mono text-[11.5px] font-semibold",
                t.chip,
              )}
            >
              {pattern.methodLabel}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-[7px] font-mono text-[12px] font-semibold",
                t.text,
              )}
            >
              <span className={cn("h-[8px] w-[8px] rounded-full", t.dot)} />
              {pattern.cost}
            </span>
          </div>

          <p className="mt-[14px] text-[13.5px] leading-[1.6] text-body">
            {pattern.why}
          </p>

          <div className="mt-[14px] rounded-[10px] border border-line bg-surface px-[13px] py-[10px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-ink-muted">
              Indexing
            </p>
            <p className="mt-[4px] text-[13px] leading-[1.6] text-ink-strong">
              {pattern.indexNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
