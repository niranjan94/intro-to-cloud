"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  ArrowDownIcon as ArrowDown,
  CurrencyDollarIcon as CurrencyDollar,
  GaugeIcon as Gauge,
  LightningIcon as Lightning,
  PowerIcon as Power,
  WavesIcon as Waves,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PickerContent, SignalWeight } from "./data";
import { TONE, type Tone } from "./tones";

/** Each workload signal maps to a semantic tone and a short glyph. */
const WEIGHT: Record<SignalWeight, { tone: Tone; icon: Icon; label: string }> =
  {
    latency: { tone: "top", icon: Lightning, label: "Latency" },
    iops: { tone: "ssd", icon: Gauge, label: "IOPS" },
    throughput: { tone: "hdd", icon: Waves, label: "Throughput" },
    cost: { tone: "baseline", icon: CurrencyDollar, label: "Cost" },
    boot: { tone: "machine", icon: Power, label: "Boot" },
  };

/** Chapter 5: read a workload's signals and see which type fits. */
export function VolumePicker({ content }: { content: PickerContent }) {
  const [current, setCurrent] = useState(0);
  const scenario = content.scenarios[current];
  const pickTone = TONE[scenario.pickTone];

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

      <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col gap-[8px]">
          {content.scenarios.map((s, i) => {
            const active = i === current;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(i)}
                className={cn(
                  "rounded-[10px] border px-[14px] py-[11px] text-left transition-colors",
                  active
                    ? "border-teal-ring bg-surface"
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <span className="flex items-center gap-[8px] text-[13.5px] font-semibold text-ink-strong">
                  <span
                    className={cn(
                      "h-[8px] w-[8px] rounded-full",
                      TONE[s.pickTone].dot,
                    )}
                  />
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={scenario.id}
          className="rounded-[18px] border border-line bg-surface p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
        >
          <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
            Workload
          </p>
          <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
            {scenario.workload}
          </p>

          <div className="mt-[14px] flex flex-col gap-[6px]">
            {scenario.signals.map((signal) => {
              const w = WEIGHT[signal.weight];
              const wt = TONE[w.tone];
              const Icon = w.icon;
              return (
                <div
                  key={signal.label}
                  className={cn(
                    "flex items-center justify-between gap-[10px] rounded-[10px] border px-[12px] py-[9px]",
                    wt.frame,
                  )}
                >
                  <span className="flex items-center gap-[8px]">
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex h-[18px] w-[18px] items-center justify-center rounded-full font-mono text-[10px] font-bold text-white",
                        wt.dot,
                      )}
                    >
                      <Icon size={11} />
                    </span>
                    <span className="font-mono text-[12px] text-ink-strong">
                      {signal.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-right text-[12px] font-medium",
                      wt.text,
                    )}
                  >
                    {signal.value}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-[14px] flex flex-wrap items-center gap-[10px]">
            <span aria-hidden className="font-mono text-[16px] text-ink-muted">
              <ArrowDown size={16} weight="bold" aria-hidden />
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-[8px] rounded-full border-[1.5px] px-[14px] py-[6px] font-mono text-[13px] font-semibold",
                pickTone.frame,
                pickTone.text,
              )}
            >
              <span
                className={cn("h-[9px] w-[9px] rounded-full", pickTone.dot)}
              />
              {scenario.pick}
            </span>
          </div>

          <p className="mt-[14px] text-[13.5px] leading-[1.6] text-body">
            {scenario.why}
          </p>
        </div>
      </div>
    </div>
  );
}
