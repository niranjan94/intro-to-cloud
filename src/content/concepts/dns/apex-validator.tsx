"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ApexContent, Verdict } from "./data";
import { TONE } from "./tones";

const VERDICT_TONE: Record<Verdict, "ok" | "warn" | "blocked"> = {
  ok: "ok",
  warn: "warn",
  blocked: "blocked",
};

const MARK: Record<Verdict, string> = {
  ok: "✓",
  warn: "!",
  blocked: "✕",
};

/** Chapter 3: choose an apex target and test each mechanism for legality. */
export function ApexValidator({ content }: { content: ApexContent }) {
  const [current, setCurrent] = useState(0);
  const target = content.targets[current];

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          Point the apex
        </p>
        <p className="mt-[5px] font-mono text-[15px] text-ink-strong">
          {content.domain}
          <span className="text-ink-muted"> at ...</span>
        </p>
      </div>

      <div className="mt-[14px] flex flex-wrap gap-[8px]">
        {content.targets.map((tgt, i) => {
          const active = i === current;
          return (
            <button
              key={tgt.id}
              type="button"
              aria-pressed={active}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-[10px] border px-[13px] py-[9px] text-left font-mono text-[12.5px] transition-colors",
                active
                  ? "border-teal-ring bg-teal-tint text-teal-ink"
                  : "border-line bg-surface text-body hover:border-ink-muted",
              )}
            >
              {tgt.label}
            </button>
          );
        })}
      </div>

      <p className="mt-[10px] font-mono text-[11.5px] text-ink-muted">
        target: {target.sub}
      </p>

      <div
        key={target.id}
        className="mt-[14px] flex flex-col gap-[10px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
      >
        {target.mechanisms.map((mech) => {
          const t = TONE[VERDICT_TONE[mech.verdict]];
          return (
            <div
              key={mech.label}
              className={cn("rounded-[14px] border-[1.5px] p-[16px]", t.frame)}
            >
              <div className="flex items-center justify-between gap-[10px]">
                <span className="font-mono text-[13.5px] font-semibold text-ink-strong">
                  {mech.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-[7px] rounded-full px-[11px] py-[3px] font-mono text-[11.5px]",
                    t.chip,
                  )}
                >
                  <span aria-hidden>{MARK[mech.verdict]}</span>
                  {mech.outcome}
                </span>
              </div>
              <p className="mt-[9px] text-pretty text-[13.5px] leading-[1.6] text-body">
                {mech.why}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-[12px] font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        {content.aliasNoun} is this provider&rsquo;s apex-safe escape hatch.
      </p>
    </div>
  );
}
