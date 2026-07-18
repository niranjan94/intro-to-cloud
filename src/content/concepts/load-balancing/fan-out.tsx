"use client";

import {
  ArrowsOutSimpleIcon as ArrowsOut,
  HeartbeatIcon as Heartbeat,
  WarningIcon as Warning,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FanOutContent } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 1: the core fan-out model. One front door spreads requests across a
 * pool of interchangeable targets. Click a target to fail its health check and
 * watch the balancer route around it, splitting traffic across the rest.
 */
export function FanOut({ content }: { content: FanOutContent }) {
  const [down, setDown] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setDown((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const healthyCount = content.targets.length - down.size;
  const share = healthyCount > 0 ? Math.round(100 / healthyCount) : 0;
  const allDown = healthyCount === 0;

  return (
    <div className="mt-[16px]">
      <div className="rounded-[18px] border border-line bg-surface p-[20px]">
        <div className="mx-auto max-w-[420px] rounded-[14px] border-[1.5px] border-teal-line bg-teal-tint px-[16px] py-[13px] text-center">
          <div className="flex items-center justify-center gap-[8px]">
            <span className="h-[9px] w-[9px] rounded-full bg-teal-ring" />
            <span className="text-[14px] font-semibold text-ink-strong">
              {content.frontDoorLabel}
            </span>
          </div>
          <div className="mt-[3px] font-mono text-[11.5px] text-teal">
            {content.frontDoorSub}
          </div>
        </div>

        <div className="mt-[6px] flex justify-center">
          <span aria-hidden className="text-ink-muted">
            <ArrowsOut size={18} weight="bold" className="rotate-45" />
          </span>
        </div>

        <p className="text-center font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          {content.poolLabel}
        </p>

        <div className="mt-[12px] grid grid-cols-1 gap-[10px] min-[560px]:grid-cols-3">
          {content.targets.map((target) => {
            const isDown = down.has(target.id);
            const tone = TONE[isDown ? "down" : "healthy"];
            const width = isDown ? 0 : share;
            return (
              <button
                key={target.id}
                type="button"
                aria-pressed={isDown}
                onClick={() => toggle(target.id)}
                className={cn(
                  "rounded-[12px] border-[1.5px] p-[13px] text-left transition-colors",
                  tone.frame,
                )}
              >
                <div className="flex items-center justify-between gap-[8px]">
                  <span className="flex items-center gap-[7px]">
                    <span
                      className={cn("h-[9px] w-[9px] rounded-full", tone.dot)}
                    />
                    <span className="font-mono text-[13px] font-semibold text-ink-strong">
                      {target.name}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10.5px] font-semibold",
                      tone.text,
                    )}
                  >
                    {isDown ? "unhealthy" : "healthy"}
                  </span>
                </div>
                <div className="mt-[4px] font-mono text-[11px] text-ink-muted">
                  {target.ip}
                </div>
                <div className="mt-[10px] flex items-center gap-[8px]">
                  <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={cn(
                        "h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500",
                        tone.dot,
                      )}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-[34px] shrink-0 text-right font-mono text-[10.5px] text-ink-muted">
                    {width}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-[12px] text-center font-mono text-[11.5px] text-ink-muted">
          Click a {content.targetNoun} to fail its health check.
        </p>
      </div>

      <div
        aria-live="polite"
        className={cn(
          "mt-[14px] flex gap-[11px] rounded-[14px] border p-[15px]",
          allDown ? TONE.down.frame : "border-line bg-surface",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "mt-[1px] flex-none",
            allDown ? TONE.down.text : "text-teal",
          )}
        >
          {allDown ? (
            <Warning size={18} weight="fill" />
          ) : (
            <Heartbeat size={18} weight="fill" />
          )}
        </span>
        <div>
          <p className="text-[13.5px] font-semibold text-ink-strong">
            {allDown
              ? "Every target is unhealthy"
              : `${healthyCount} of ${content.targets.length} healthy · each takes about ${share}% of traffic`}
          </p>
          <p className="mt-[4px] text-pretty text-[13px] leading-[1.6] text-body">
            {allDown
              ? "With no healthy target left, the balancer has nowhere to send requests and users see an error. The fix is capacity, not the balancer."
              : content.healthNote}
          </p>
        </div>
      </div>

      <p className="mt-[12px] font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        {content.algorithm} {content.note}
      </p>
    </div>
  );
}
