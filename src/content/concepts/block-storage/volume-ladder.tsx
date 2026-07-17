"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TypesContent } from "./data";
import { TONE } from "./tones";

/** Chapter 2: walk the volume / disk type ladder and read the tradeoff. */
export function VolumeLadder({ content }: { content: TypesContent }) {
  const [current, setCurrent] = useState(0);
  const type = content.types[current];
  const t = TONE[type.tone];

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[16px]">
        <p className="px-[4px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          {content.label}
        </p>
        <div className="mt-[10px] flex flex-col gap-[6px]">
          {content.types.map((row, i) => {
            const active = i === current;
            const rt = TONE[row.tone];
            return (
              <button
                key={row.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(i)}
                className={cn(
                  "rounded-[10px] border px-[12px] py-[10px] text-left transition-colors",
                  active
                    ? cn(rt.frame, "border-[1.5px]")
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <div className="flex items-center gap-[8px]">
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
                </div>
                <div className="mt-[8px] flex items-center gap-[8px]">
                  <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={cn(
                        "h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500",
                        rt.dot,
                      )}
                      style={{ width: `${Math.round(row.perfRel * 100)}%` }}
                    />
                  </div>
                  <span className="w-[92px] shrink-0 text-right font-mono text-[10.5px] text-ink-muted">
                    peak perf
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={type.id}
        className={cn(
          "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
          t.frame,
        )}
      >
        <div className="flex items-center gap-[9px]">
          <span className={cn("h-[11px] w-[11px] rounded-full", t.dot)} />
          <h3 className={cn("text-[17px] font-semibold", t.text)}>
            {type.name}
          </h3>
        </div>
        <p className="mt-[3px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted">
          {type.family}
        </p>
        <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
          {type.tagline}
        </p>
        <dl className="mt-[16px] grid grid-cols-1 gap-[8px] min-[520px]:grid-cols-2">
          {type.facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-[10px] border border-line bg-surface px-[12px] py-[10px]"
            >
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
                {fact.label}
              </dt>
              <dd className="mt-[4px] text-[13px] font-semibold text-ink-strong">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-[16px] text-[13.5px] leading-[1.6] text-body">
          <span className="font-semibold text-ink-strong">Best for: </span>
          {type.use}
        </p>
      </div>

      <p className="min-[820px]:col-span-2 text-pretty font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
