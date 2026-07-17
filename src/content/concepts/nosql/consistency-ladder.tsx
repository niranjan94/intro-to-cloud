"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ConsistencyContent } from "./data";
import { TONE } from "./tones";

/** Chapter 4: walk the read-consistency ladder from strongest to most relaxed. */
export function ConsistencyLadder({
  content,
}: {
  content: ConsistencyContent;
}) {
  const defaultIndex = Math.max(
    0,
    content.levels.findIndex((l) => l.isDefault),
  );
  const [current, setCurrent] = useState(defaultIndex);
  const level = content.levels[current];
  const t = TONE[level.tone];

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[16px]">
        <div className="flex items-center justify-between px-[4px]">
          <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            {content.label}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-ink-muted">
            strongest → relaxed
          </p>
        </div>
        <div className="mt-[10px] flex flex-col gap-[6px]">
          {content.levels.map((row, i) => {
            const active = i === current;
            const rt = TONE[row.tone];
            return (
              <button
                key={row.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(i)}
                className={cn(
                  "flex items-center justify-between gap-[10px] rounded-[10px] border px-[12px] py-[11px] text-left transition-colors",
                  active
                    ? cn(rt.frame, "border-[1.5px]")
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <span className="flex items-center gap-[8px]">
                  <span
                    className={cn("h-[9px] w-[9px] rounded-full", rt.dot)}
                  />
                  <span
                    className={cn(
                      "font-mono text-[12.5px]",
                      active ? cn(rt.text, "font-semibold") : "text-ink-soft",
                    )}
                  >
                    {row.name}
                  </span>
                </span>
                {row.isDefault ? (
                  <span className="shrink-0 rounded-full border border-teal-line bg-teal-tint px-[8px] py-[2px] font-mono text-[9.5px] uppercase tracking-[0.05em] text-teal">
                    Default
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={level.id}
        className={cn(
          "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
          t.frame,
        )}
      >
        <div className="flex flex-wrap items-center gap-[9px]">
          <span className={cn("h-[11px] w-[11px] rounded-full", t.dot)} />
          <h3 className={cn("text-[17px] font-semibold", t.text)}>
            {level.name}
          </h3>
          {level.isDefault ? (
            <span
              className={cn(
                "rounded-full px-[9px] py-[2px] font-mono text-[10px] uppercase tracking-[0.04em]",
                t.chip,
              )}
            >
              Default
            </span>
          ) : null}
        </div>

        <dl className="mt-[16px] flex flex-col gap-[10px]">
          <div>
            <dt className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-muted">
              Guarantee
            </dt>
            <dd className="mt-[3px] text-[13.5px] leading-[1.6] text-body">
              {level.guarantee}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-muted">
              Tradeoff
            </dt>
            <dd className="mt-[3px] text-[13.5px] leading-[1.6] text-body">
              {level.tradeoff}
            </dd>
          </div>
        </dl>

        <p className="mt-[14px] text-[13.5px] leading-[1.6] text-body">
          <span className="font-semibold text-ink-strong">Reach for it: </span>
          {level.use}
        </p>
      </div>

      <p className="min-[820px]:col-span-2 text-pretty font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
