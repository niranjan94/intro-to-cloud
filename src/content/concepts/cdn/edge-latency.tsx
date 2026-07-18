"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { EdgeContent } from "./data";

/** Chapter 1: pick a viewer and compare the trip to the origin against the edge. */
export function EdgeLatency({ content }: { content: EdgeContent }) {
  const [current, setCurrent] = useState(0);
  const viewer = content.viewers[current];
  const scale = Math.max(...content.viewers.map((v) => v.directMs));
  const saved = Math.round(
    ((viewer.directMs - viewer.edgeMs) / viewer.directMs) * 100,
  );

  return (
    <div
      aria-live="polite"
      className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.85fr_1.15fr]"
    >
      <div className="rounded-[18px] border border-line bg-surface p-[16px]">
        <p className="px-[4px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          Viewer location
        </p>
        <div className="mt-[10px] flex flex-col gap-[6px]">
          {content.viewers.map((v, i) => {
            const active = i === current;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(i)}
                className={cn(
                  "flex items-center justify-between gap-[10px] rounded-[10px] border px-[12px] py-[10px] text-left transition-colors",
                  active
                    ? "border-[1.5px] border-teal-line bg-teal-tint"
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[12.5px]",
                    active ? "font-semibold text-teal-ink" : "text-ink-soft",
                  )}
                >
                  {v.city}
                </span>
                <span className="font-mono text-[11px] text-ink-muted">
                  {v.directMs} ms direct
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-[12px] px-[4px] font-mono text-[11px] leading-[1.6] text-ink-muted">
          {content.originLabel}
        </p>
      </div>

      <div
        key={viewer.id}
        className="rounded-[18px] border border-line bg-surface p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
          <h3 className="text-[16px] font-semibold text-ink-strong">
            A viewer in {viewer.city}
          </h3>
          <span className="rounded-full bg-[oklch(0.96_0.04_150)] px-[12px] py-[4px] font-mono text-[11.5px] text-[oklch(0.44_0.1_150)]">
            {saved}% faster from the edge
          </span>
        </div>

        <div className="mt-[18px] flex flex-col gap-[16px]">
          <LatencyBar
            label={`Straight to origin · ${content.originLabel.split("·")[1]?.trim() ?? "origin"}`}
            ms={viewer.directMs}
            scale={scale}
            barClass="bg-[oklch(0.66_0.12_70)]"
            trackNote="crosses the public internet"
          />
          <LatencyBar
            label={`Via ${viewer.edgeName}`}
            ms={viewer.edgeMs}
            scale={scale}
            barClass="bg-teal-ring"
            trackNote={`then the ${content.networkName}`}
          />
        </div>

        <p className="mt-[18px] text-pretty text-[13.5px] leading-[1.6] text-body">
          {content.note}
        </p>
      </div>
    </div>
  );
}

function LatencyBar({
  label,
  ms,
  scale,
  barClass,
  trackNote,
}: {
  label: string;
  ms: number;
  scale: number;
  barClass: string;
  trackNote: string;
}) {
  const pct = Math.max(4, Math.round((ms / scale) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="font-mono text-[12px] text-ink-soft">{label}</span>
        <span className="shrink-0 font-mono text-[13px] font-semibold text-ink-strong">
          {ms} ms
        </span>
      </div>
      <div className="mt-[6px] h-[12px] overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn(
            "h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700",
            barClass,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-[4px] font-mono text-[10.5px] text-ink-muted">
        {trackNote}
      </p>
    </div>
  );
}
