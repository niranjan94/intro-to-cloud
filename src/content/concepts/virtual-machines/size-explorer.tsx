"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SizingContent } from "./data";

/** Chapter 2: decode a size name and compare workload shapes. */
export function SizeExplorer({ content }: { content: SizingContent }) {
  const [current, setCurrent] = useState(0);
  const row = content.rows[current];

  return (
    <div className="mt-[16px]">
      <div className="rounded-[18px] border border-line bg-surface p-[20px]">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          How to read a size name
        </p>
        <p className="mt-[8px] font-mono text-[15px] text-ink-strong">
          {content.pattern}
        </p>
        <div className="mt-[14px] grid grid-cols-2 gap-x-[16px] gap-y-[8px] min-[560px]:grid-cols-3">
          {content.families.map((f) => (
            <div key={f.letter} className="flex items-baseline gap-[8px]">
              <span className="inline-flex min-w-[34px] justify-center rounded-[6px] bg-surface-muted px-[6px] py-[2px] font-mono text-[12px] font-bold text-teal">
                {f.letter}
              </span>
              <span className="text-[12.5px] text-body">{f.meaning}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-[16px] flex gap-[2px] overflow-x-auto"
        role="tablist"
        aria-label="Workload shapes"
      >
        {content.rows.map((r, i) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={i === current}
            onClick={() => setCurrent(i)}
            className={cn(
              "flex-none whitespace-nowrap rounded-t-[10px] border-b-2 px-[14px] py-[10px] font-mono text-[12.5px] transition-colors",
              i === current
                ? "border-teal-ring text-ink-strong"
                : "border-transparent text-ink-muted hover:text-body",
            )}
          >
            {r.workload}
          </button>
        ))}
      </div>

      <div
        key={row.id}
        className="rounded-[18px] rounded-tl-none border border-line bg-surface p-[22px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-[10px]">
          <span className="font-mono text-[22px] font-bold text-ink-strong">
            {row.name}
          </span>
          <span className="font-mono text-[12.5px] text-teal-ink">
            {row.decode}
          </span>
        </div>
        <div className="mt-[16px] flex flex-wrap gap-[10px]">
          <div className="flex-1 rounded-[12px] border border-line bg-surface-muted px-[14px] py-[12px]">
            <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted">
              vCPU
            </div>
            <div className="mt-[4px] text-[18px] font-semibold text-ink-strong">
              {row.vcpu}
            </div>
          </div>
          <div className="flex-1 rounded-[12px] border border-line bg-surface-muted px-[14px] py-[12px]">
            <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted">
              Memory
            </div>
            <div className="mt-[4px] text-[18px] font-semibold text-ink-strong">
              {row.ram}
            </div>
          </div>
        </div>
        <p className="mt-[14px] text-[13.5px] leading-[1.6] text-body">
          {row.use}
        </p>
      </div>

      <p className="mt-[14px] text-pretty text-[13.5px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
