"use client";

import {
  MinusCircleIcon as MinusCircle,
  PlusCircleIcon as PlusCircle,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PickerContent } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 5: pick a layer. Choose a scenario and read the recommendation, the
 * layer and service it maps to, and the honest trade: what that layer gains you
 * and what it costs.
 */
export function LayerPicker({ content }: { content: PickerContent }) {
  const [current, setCurrent] = useState(0);
  const scenario = content.scenarios[current];
  const tone = TONE[scenario.verdictTone];

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-[8px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          What you need
        </p>
        {content.scenarios.map((s, i) => {
          const active = i === current;
          const st = TONE[s.verdictTone];
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={active}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-[12px] border px-[13px] py-[11px] text-left transition-colors",
                active
                  ? "border-teal-ring bg-surface"
                  : "border-line bg-surface hover:border-ink-muted",
              )}
            >
              <span className="flex items-start gap-[8px]">
                <span
                  className={cn(
                    "mt-[6px] h-[8px] w-[8px] flex-none rounded-full",
                    st.dot,
                  )}
                />
                <span className="text-[13.5px] font-semibold leading-[1.4] text-ink-strong">
                  {s.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={scenario.id}
        className={cn(
          "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
          tone.frame,
        )}
      >
        <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
          The requirement
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {scenario.need}
        </p>

        <div className="mt-[14px] flex items-center gap-[9px]">
          <span className={cn("h-[11px] w-[11px] rounded-full", tone.dot)} />
          <span className={cn("text-[17px] font-semibold", tone.text)}>
            {scenario.verdict}
          </span>
        </div>

        <div className="mt-[16px] grid grid-cols-1 gap-[10px] min-[520px]:grid-cols-2">
          <div className="rounded-[12px] border border-line bg-surface p-[13px]">
            <p className="flex items-center gap-[7px] font-mono text-[10.5px] uppercase tracking-[0.05em] text-[oklch(0.46_0.1_150)]">
              <PlusCircle size={14} weight="fill" aria-hidden /> You gain
            </p>
            <p className="mt-[6px] text-[13px] leading-[1.55] text-body">
              {scenario.gain}
            </p>
          </div>
          <div className="rounded-[12px] border border-line bg-surface p-[13px]">
            <p className="flex items-center gap-[7px] font-mono text-[10.5px] uppercase tracking-[0.05em] text-[oklch(0.53_0.16_25)]">
              <MinusCircle size={14} weight="fill" aria-hidden /> You give up
            </p>
            <p className="mt-[6px] text-[13px] leading-[1.55] text-body">
              {scenario.cost}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
