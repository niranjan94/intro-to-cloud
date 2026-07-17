"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ScalingContent } from "./data";
import { TONE } from "./tones";

/** Chapter 3: push simultaneous requests and watch instances scale out or throttle. */
export function ScalingSim({ content }: { content: ScalingContent }) {
  const maxRequests = content.demoCap + 6;
  const [requests, setRequests] = useState(3);

  const running = Math.min(requests, content.demoCap);
  const throttled = Math.max(0, requests - content.demoCap);
  const slots = Array.from({ length: content.demoCap }, (_, i) => i < running);

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          The rule
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.rule}
        </p>
      </div>

      <div className="mt-[18px] rounded-[18px] border border-line bg-surface p-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <label
            htmlFor="scaling-requests"
            className="font-mono text-[12px] uppercase tracking-[0.04em] text-ink-muted"
          >
            Simultaneous requests
          </label>
          <div className="flex items-center gap-[10px] font-mono text-[12px]">
            <span className="flex items-center gap-[6px]">
              <span
                className={cn(
                  "h-[9px] w-[9px] rounded-full",
                  TONE.instance.dot,
                )}
              />
              <span className={TONE.instance.text}>{running} running</span>
            </span>
            <span className="flex items-center gap-[6px]">
              <span
                className={cn(
                  "h-[9px] w-[9px] rounded-full",
                  TONE.throttle.dot,
                )}
              />
              <span className={TONE.throttle.text}>{throttled} throttled</span>
            </span>
          </div>
        </div>

        <input
          id="scaling-requests"
          type="range"
          min={0}
          max={maxRequests}
          value={requests}
          onChange={(e) => setRequests(Number(e.target.value))}
          className="mt-[12px] w-full accent-[oklch(0.55_0.09_195)]"
        />

        <p className="mt-[6px] font-mono text-[11.5px] text-ink-muted">
          {requests} in flight · capacity {content.demoCap} {content.unitTerm}s
        </p>

        <div className="mt-[16px] grid grid-cols-6 gap-[8px] min-[520px]:grid-cols-12">
          {slots.map((filled, i) => (
            <div
              key={`slot-${content.demoCap}-${i}`}
              className={cn(
                "flex h-[40px] items-center justify-center rounded-[9px] border font-mono text-[12px] font-semibold transition-colors",
                filled
                  ? cn(
                      TONE.instance.frame,
                      TONE.instance.text,
                      "border-[1.5px]",
                    )
                  : "border-dashed border-line bg-surface-muted text-faint",
              )}
              title={filled ? `${content.unitTerm} ${i + 1}` : "idle capacity"}
            >
              {filled ? i + 1 : ""}
            </div>
          ))}
        </div>

        {throttled > 0 ? (
          <div
            className={cn(
              "mt-[12px] rounded-[10px] border-[1.5px] px-[14px] py-[10px]",
              TONE.throttle.frame,
            )}
          >
            <span
              className={cn(
                "font-mono text-[12.5px] font-semibold",
                TONE.throttle.text,
              )}
            >
              {throttled} request{throttled === 1 ? "" : "s"} throttled
            </span>
            <span className="ml-[8px] text-[12.5px] text-body">
              past the ceiling, extra requests wait for a {content.unitTerm} to
              free up.
            </span>
          </div>
        ) : (
          <div className="mt-[12px] rounded-[10px] border-[1.5px] border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)] px-[14px] py-[10px]">
            <span
              className={cn(
                "font-mono text-[12.5px] font-semibold",
                TONE.ok.text,
              )}
            >
              All requests served
            </span>
            <span className="ml-[8px] text-[12.5px] text-body">
              each concurrent request has its own {content.unitTerm}.
            </span>
          </div>
        )}
      </div>

      <p className="mt-[14px] text-pretty font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>

      <div
        className={cn(
          "mt-[14px] rounded-[14px] border-[1.5px] p-[16px]",
          TONE.instance.frame,
        )}
      >
        <p
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.06em]",
            TONE.instance.text,
          )}
        >
          {content.controls.name}
        </p>
        <p className="mt-[6px] text-[13.5px] leading-[1.6] text-body">
          {content.controls.body}
        </p>
      </div>
    </div>
  );
}
