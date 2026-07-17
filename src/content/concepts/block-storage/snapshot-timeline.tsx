"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SnapshotContent } from "./data";
import { TONE } from "./tones";

/** Chapter 4: step a disk through a snapshot chain and watch stored data. */
export function SnapshotTimeline({ content }: { content: SnapshotContent }) {
  const [current, setCurrent] = useState(0);
  const step = content.steps[current];
  const last = content.steps.length - 1;
  const t = TONE[step.tone];

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          {content.policyLabel}
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.ruleSummary}
        </p>
      </div>

      {/* Timeline track */}
      <div className="mt-[18px] flex flex-wrap items-center gap-[8px]">
        {content.steps.map((s, i) => {
          const active = i === current;
          const st = TONE[s.tone];
          return (
            <div key={s.day} className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-current={active}
                className={cn(
                  "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[12px] py-[6px] font-mono text-[12px] transition-colors",
                  active
                    ? cn(st.frame, st.text, "font-semibold")
                    : "border-line bg-surface text-ink-muted hover:border-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "h-[8px] w-[8px] rounded-full",
                    active ? st.dot : "bg-line",
                  )}
                />
                {s.day}
              </button>
              {i < content.steps.length - 1 ? (
                <span aria-hidden className="text-line">
                  ›
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        key={current}
        className={cn(
          "mt-[18px] rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
          t.frame,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <div className="flex items-center gap-[9px]">
            <span className={cn("h-[11px] w-[11px] rounded-full", t.dot)} />
            <h3 className={cn("text-[16px] font-semibold", t.text)}>
              {step.action}
            </h3>
          </div>
          <span
            className={cn(
              "rounded-full px-[12px] py-[4px] font-mono text-[11.5px]",
              t.chip,
            )}
          >
            {step.chip}
          </span>
        </div>

        <div className="mt-[16px]">
          <div className="flex items-center justify-between font-mono text-[11px] text-ink-muted">
            <span>{content.storedLabel}</span>
            <span>{Math.round(step.storedRel * 100)}%</span>
          </div>
          <div className="mt-[6px] h-[10px] overflow-hidden rounded-full bg-surface-muted">
            <div
              className={cn(
                "h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500",
                TONE.snapshot.dot,
              )}
              style={{ width: `${Math.round(step.storedRel * 100)}%` }}
            />
          </div>
        </div>

        <p className="mt-[14px] text-[13.5px] leading-[1.6] text-body">
          {step.note}
        </p>
      </div>

      <div className="mt-[18px] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          className={cn(
            "rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted",
            current === 0 && "invisible",
          )}
        >
          ◂ Earlier
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.min(last, c + 1))}
          className={cn(
            "rounded-button border border-teal-line bg-teal-tint px-[16px] py-[8px] font-mono text-[12.5px] text-teal-ink transition-colors hover:border-teal-ring",
            current === last && "invisible",
          )}
        >
          Advance time ▸
        </button>
      </div>
    </div>
  );
}
