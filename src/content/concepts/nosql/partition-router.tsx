"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { PartitioningContent } from "./data";
import { TONE } from "./tones";

/** Deterministic, stable hash of a key value into one of `count` partitions. */
function hashToPartition(value: string, count: number): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h % count;
}

interface Distribution {
  /** Item count landing in each partition, indexed by partition. */
  counts: number[];
  max: number;
  /** Partitions whose share is high enough to be a hot spot. */
  hot: boolean[];
  anyHot: boolean;
}

function distribute(keys: string[], count: number): Distribution {
  const counts = new Array<number>(count).fill(0);
  for (const key of keys) counts[hashToPartition(key, count)] += 1;
  const total = keys.length;
  const even = total / count;
  const hot = counts.map((c) => c >= 3 && c >= even * 1.8);
  return {
    counts,
    max: Math.max(1, ...counts),
    hot,
    anyHot: hot.some(Boolean),
  };
}

/** Chapter 2: pick a partition-key strategy and watch how keys distribute. */
export function PartitionRouter({ content }: { content: PartitioningContent }) {
  const [current, setCurrent] = useState(0);
  const strategy = content.strategies[current];
  const dist = useMemo(
    () => distribute(strategy.sampleKeys, content.partitionCount),
    [strategy.sampleKeys, content.partitionCount],
  );
  const distinct = new Set(strategy.sampleKeys).size;
  const badge = dist.anyHot ? TONE.hot : TONE.ok;

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          How routing works
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.intro}
        </p>
      </div>

      <div
        className="mt-[16px] flex flex-wrap gap-[8px]"
        role="tablist"
        aria-label="Partition key strategy"
      >
        {content.strategies.map((s, i) => {
          const active = i === current;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-[10px] border px-[13px] py-[9px] text-left font-mono text-[12.5px] transition-colors",
                active
                  ? "border-teal-ring bg-teal-tint text-teal-ink"
                  : "border-line bg-surface text-ink-soft hover:border-ink-muted",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-[16px] rounded-[18px] border border-line bg-surface p-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <p className="font-mono text-[11.5px] text-ink-muted">
            {strategy.sampleKeys.length} items · partition key{" "}
            <span className="text-ink-strong">{strategy.keyName}</span> ·{" "}
            {distinct} distinct {distinct === 1 ? "value" : "values"}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[12px] py-[4px] font-mono text-[11.5px] font-semibold",
              badge.frame,
              badge.text,
            )}
          >
            <span className={cn("h-[8px] w-[8px] rounded-full", badge.dot)} />
            {dist.anyHot ? "Hot partition" : "Balanced"}
          </span>
        </div>

        <div className="mt-[16px] grid grid-cols-5 gap-[8px] max-[520px]:gap-[5px]">
          {dist.counts.map((count, i) => {
            const isHot = dist.hot[i];
            const tone = isHot ? TONE.hot : count > 0 ? TONE.ok : TONE.meta;
            const heightPct = Math.round((count / dist.max) * 100);
            return (
              <div
                key={`p-${content.partitionCount}-${i}`}
                className="flex flex-col items-center gap-[6px]"
              >
                <div className="flex h-[120px] w-full items-end rounded-[8px] border border-line bg-surface-muted p-[4px]">
                  <div
                    className={cn(
                      "w-full rounded-[5px] motion-safe:transition-[height] motion-safe:duration-500",
                      tone.dot,
                    )}
                    style={{
                      height: `${Math.max(count > 0 ? 8 : 0, heightPct)}%`,
                    }}
                  />
                </div>
                <div className="font-mono text-[12px] font-semibold text-ink-strong">
                  {count}
                </div>
                <div
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.04em]",
                    isHot ? badge.text : "text-ink-muted",
                  )}
                >
                  P{i}
                </div>
              </div>
            );
          })}
        </div>

        <div
          key={strategy.id}
          className={cn(
            "mt-[16px] rounded-[12px] border px-[14px] py-[11px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            badge.frame,
          )}
        >
          <p className="text-[13.5px] leading-[1.6] text-body">
            {strategy.verdict}
          </p>
        </div>
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
