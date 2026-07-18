"use client";

import {
  ArrowCounterClockwiseIcon as ArrowCounterClockwise,
  ArrowRightIcon as ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { type Cancelable, tween } from "./anim";
import type { TtlContent } from "./data";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

type Phase = "idle" | "running" | "done";

/** Chapter 5: publish a change and watch the cached-answer window drain over the TTL. */
export function TtlSim({ content }: { content: TtlContent }) {
  const [ttlIdx, setTtlIdx] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const animRef = useRef<Cancelable | null>(null);

  const ttl = content.presets[ttlIdx].ttl;

  useEffect(() => () => animRef.current?.cancel(), []);

  const publish = () => {
    animRef.current?.cancel();
    setPhase("running");
    setProgress(0);
    animRef.current = tween(
      2600,
      (p) => setProgress(p),
      () => setPhase("done"),
    );
  };

  const reset = () => {
    animRef.current?.cancel();
    setPhase("idle");
    setProgress(0);
  };

  const chooseTtl = (i: number) => {
    reset();
    setTtlIdx(i);
  };

  const elapsed = progress * ttl;
  const stalePct = Math.round((1 - progress) * 100);

  return (
    <div className="mt-[16px]">
      <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
        Record TTL
      </p>
      <div className="mt-[10px] flex flex-wrap gap-[8px]">
        {content.presets.map((preset, i) => {
          const active = i === ttlIdx;
          return (
            <button
              key={preset.ttl}
              type="button"
              aria-pressed={active}
              onClick={() => chooseTtl(i)}
              className={cn(
                "rounded-[10px] border px-[13px] py-[8px] font-mono text-[12.5px] transition-colors",
                active
                  ? "border-teal-ring bg-teal-tint text-teal-ink"
                  : "border-line bg-surface text-body hover:border-ink-muted",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <p className="mt-[9px] text-pretty text-[13px] leading-[1.6] text-body">
        {content.presets[ttlIdx].use}
      </p>

      <div className="mt-[18px] rounded-[16px] border border-line bg-surface p-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px] font-mono text-[12px]">
          <span className="text-ink-strong">{content.recordName}</span>
          <span className="flex items-center gap-[8px] text-ink-muted">
            <span className="text-[oklch(0.5_0.16_25)] line-through">
              {content.oldValue}
            </span>
            <ArrowRight size={14} weight="bold" aria-hidden />
            <span className="text-[oklch(0.46_0.1_150)]">
              {content.newValue}
            </span>
          </span>
        </div>

        {/* Cache drain track */}
        <div className="mt-[16px]">
          <div className="flex items-center justify-between font-mono text-[10.5px] text-ink-muted">
            <span>t = 0 (change saved)</span>
            <span>t = TTL ({formatDuration(ttl)})</span>
          </div>
          <div className="relative mt-[6px] h-[26px] overflow-hidden rounded-[8px] border border-line bg-[oklch(0.96_0.04_25)]">
            <div
              className="absolute inset-y-0 left-0 bg-[oklch(0.9_0.06_150)] motion-safe:transition-[width] motion-safe:duration-150"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
            <div
              className="absolute inset-y-0 w-[2px] bg-ink-strong motion-safe:transition-[left] motion-safe:duration-150"
              style={{ left: `${Math.round(progress * 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-[10px] font-mono text-[10.5px]">
              <span className="text-[oklch(0.44_0.1_150)]">serving new</span>
              <span className="text-[oklch(0.5_0.16_25)]">
                still cached: old
              </span>
            </div>
          </div>
        </div>

        <div className="mt-[16px] grid grid-cols-2 gap-[10px] font-mono text-[12px] min-[520px]:grid-cols-3">
          <div className="rounded-[10px] border border-line bg-surface-muted px-[12px] py-[9px]">
            <div className="text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
              Simulated elapsed
            </div>
            <div className="mt-[3px] text-[14px] font-semibold text-ink-strong">
              {formatDuration(elapsed)}
            </div>
          </div>
          <div className="rounded-[10px] border border-line bg-surface-muted px-[12px] py-[9px]">
            <div className="text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
              Caches still stale
            </div>
            <div className="mt-[3px] text-[14px] font-semibold text-ink-strong">
              {phase === "idle" ? "-" : `${stalePct}%`}
            </div>
          </div>
          <div className="col-span-2 rounded-[10px] border border-line bg-surface-muted px-[12px] py-[9px] min-[520px]:col-span-1">
            <div className="text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
              Worst-case window
            </div>
            <div className="mt-[3px] text-[14px] font-semibold text-ink-strong">
              {formatDuration(ttl)}
            </div>
          </div>
        </div>

        <div className="mt-[16px] flex items-center gap-[8px]">
          <button
            type="button"
            onClick={publish}
            disabled={phase === "running"}
            className="inline-flex items-center gap-[6px] rounded-button bg-primary px-[16px] py-[8px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {phase === "done" ? (
              <>
                <ArrowCounterClockwise size={14} weight="bold" aria-hidden />
                Publish again
              </>
            ) : (
              "Publish change"
            )}
          </button>
          {phase !== "idle" ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted"
            >
              Reset
            </button>
          ) : null}
          <span
            aria-live="polite"
            className="ml-auto font-mono text-[11.5px] text-ink-muted"
          >
            {phase === "done"
              ? "all caches refreshed"
              : phase === "running"
                ? "caches expiring ..."
                : "ready"}
          </span>
        </div>
      </div>
    </div>
  );
}
