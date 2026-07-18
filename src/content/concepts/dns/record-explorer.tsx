"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RecordsContent } from "./data";
import { TONE } from "./tones";

/** Chapter 2: browse the record types that live inside a zone. */
export function RecordExplorer({ content }: { content: RecordsContent }) {
  const [current, setCurrent] = useState(0);
  const row = content.rows[current];
  const t = TONE[row.tone];

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          {content.zoneNoun} · {content.zoneName}
        </p>
        <p className="mt-[5px] text-pretty text-[13.5px] leading-[1.6] text-body">
          {content.grouping}
        </p>
      </div>

      <div
        aria-live="polite"
        className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="rounded-[18px] border border-line bg-surface p-[12px]">
          <p className="px-[6px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            Record types
          </p>
          <div className="mt-[10px] flex flex-col gap-[5px]">
            {content.rows.map((r, i) => {
              const active = i === current;
              const rt = TONE[r.tone];
              return (
                <button
                  key={r.type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "flex items-center gap-[10px] rounded-[10px] border px-[12px] py-[9px] text-left transition-colors",
                    active
                      ? cn(rt.frame, "border-[1.5px]")
                      : "border-line bg-surface hover:border-ink-muted",
                  )}
                >
                  <span
                    className={cn("h-[9px] w-[9px] rounded-full", rt.dot)}
                  />
                  <span
                    className={cn(
                      "font-mono text-[13px]",
                      active ? cn(rt.text, "font-semibold") : "text-ink-soft",
                    )}
                  >
                    {r.type}
                  </span>
                  <span className="ml-auto truncate font-mono text-[11px] text-ink-muted">
                    {r.exampleName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={row.type}
          className={cn(
            "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            t.frame,
          )}
        >
          <div className="flex items-center gap-[9px]">
            <span className={cn("h-[11px] w-[11px] rounded-full", t.dot)} />
            <h3 className={cn("font-mono text-[18px] font-semibold", t.text)}>
              {row.type}
            </h3>
          </div>
          <p className="mt-[8px] text-[14px] leading-[1.6] text-body">
            {row.purpose}
          </p>

          <div className="mt-[16px] rounded-[12px] bg-panel-deep px-[16px] py-[13px] font-mono text-[12.5px] leading-[1.7]">
            <div className="flex flex-wrap gap-x-[10px] text-[oklch(0.88_0.02_195)]">
              <span className="text-[oklch(0.7_0.09_150)]">
                {row.exampleName}
              </span>
              <span className="text-[oklch(0.62_0.02_230)]">
                {content.zoneName}.
              </span>
              <span className="text-[oklch(0.72_0.09_65)]">{row.type}</span>
              <span className="text-[oklch(0.78_0.02_195)]">
                {row.exampleValue}
              </span>
            </div>
          </div>

          <p className="mt-[14px] text-pretty text-[13.5px] leading-[1.6] text-body">
            {row.note}
          </p>
        </div>
      </div>
    </div>
  );
}
