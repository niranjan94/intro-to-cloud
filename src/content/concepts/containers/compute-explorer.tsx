"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ComputeContent } from "./data";
import { TONE } from "./tones";

/** Chapter 3: compare the compute options and read the control-versus-work tradeoff. */
export function ComputeExplorer({ content }: { content: ComputeContent }) {
  const [current, setCurrent] = useState(0);
  const option = content.options[current];
  const t = TONE[option.tone];

  return (
    <div className="mt-[16px]">
      <div className="flex gap-[2px]" role="tablist" aria-label={content.label}>
        {content.options.map((o, i) => {
          const active = i === current;
          const ot = TONE[o.tone];
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCurrent(i)}
              className={cn(
                "flex items-center gap-[8px] rounded-t-[10px] border-b-2 px-[15px] py-[10px] font-mono text-[12.5px] transition-colors",
                active
                  ? "border-teal-ring text-ink-strong"
                  : "border-transparent text-ink-muted hover:text-body",
              )}
            >
              <span
                className={cn(
                  "h-[9px] w-[9px] rounded-full",
                  active ? ot.dot : "bg-line",
                )}
              />
              {o.name}
            </button>
          );
        })}
      </div>

      <div
        key={option.id}
        className={cn(
          "rounded-[18px] rounded-tl-none border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
          t.frame,
        )}
      >
        <div className="flex flex-wrap items-center gap-[9px]">
          <span className={cn("h-[11px] w-[11px] rounded-full", t.dot)} />
          <h3 className={cn("text-[17px] font-semibold", t.text)}>
            {option.name}
          </h3>
          <span
            className={cn(
              "rounded-full px-[10px] py-[3px] font-mono text-[10.5px]",
              option.serverless ? TONE.serverless.chip : TONE.managed.chip,
            )}
          >
            {option.serverless ? "serverless" : "you manage capacity"}
          </span>
          {option.recommended ? (
            <span className="rounded-full border border-teal-line bg-teal-tint px-[10px] py-[3px] font-mono text-[10.5px] text-teal-ink">
              common default
            </span>
          ) : null}
        </div>

        <p className="mt-[10px] text-[13.5px] leading-[1.6] text-body">
          {option.tagline}
        </p>

        <dl className="mt-[16px] grid grid-cols-1 gap-[8px] min-[520px]:grid-cols-3">
          {option.facts.map((fact) => (
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
          {option.use}
        </p>
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
