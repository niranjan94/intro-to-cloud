"use client";

import type { Icon, IconWeight } from "@phosphor-icons/react";
import {
  ArrowCounterClockwiseIcon as ArrowCounterClockwise,
  CaretRightIcon as CaretRight,
  CheckIcon as Check,
  CircleIcon as Circle,
  CurrencyDollarIcon as CurrencyDollar,
  MinusIcon as Minus,
  XIcon as X,
} from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { LifecycleContent, MeterKind } from "./data";
import { TONE } from "./tones";

/** Meter badge styling by semantic kind. */
const METER: Record<
  MeterKind,
  { chip: string; icon: Icon; weight: IconWeight }
> = {
  charge: {
    chip: "border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)] text-[oklch(0.5_0.1_70)]",
    icon: CurrencyDollar,
    weight: "bold",
  },
  free: {
    chip: "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)] text-[oklch(0.44_0.1_150)]",
    icon: Check,
    weight: "bold",
  },
  kept: {
    chip: "border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)] text-[oklch(0.48_0.08_255)]",
    icon: Circle,
    weight: "fill",
  },
  lost: {
    chip: "border-[oklch(0.78_0.12_25)] bg-[oklch(0.96_0.04_25)] text-[oklch(0.5_0.16_25)]",
    icon: X,
    weight: "bold",
  },
  muted: {
    chip: "border-line bg-surface-muted text-ink-muted",
    icon: Minus,
    weight: "bold",
  },
};

/** Chapter 3: drive a machine through its lifecycle and watch billing and data. */
export function LifecycleSim({ content }: { content: LifecycleContent }) {
  const [currentId, setCurrentId] = useState(content.initial);

  const state = useMemo(
    () => content.states.find((s) => s.id === currentId) ?? content.states[0],
    [content.states, currentId],
  );
  const actions = content.actions.filter((a) => a.from === currentId);
  const t = TONE[state.tone];

  return (
    <div className="mt-[16px]">
      {/* State track */}
      <div className="flex flex-wrap items-center gap-[8px]">
        {content.states.map((s, i) => {
          const active = s.id === currentId;
          const st = TONE[s.tone];
          return (
            <div key={s.id} className="flex items-center gap-[8px]">
              <span
                className={cn(
                  "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[12px] py-[6px] font-mono text-[12px] transition-colors",
                  active
                    ? cn(st.frame, st.text, "font-semibold")
                    : "border-line bg-surface text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "h-[8px] w-[8px] rounded-full",
                    active ? st.dot : "bg-line",
                  )}
                />
                {s.label}
              </span>
              {i < content.states.length - 1 ? (
                <span aria-hidden className="text-line">
                  <CaretRight size={13} weight="bold" />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Controls + readout */}
      <div className="mt-[18px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[18px] border border-line bg-surface p-[20px]">
          <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            Actions
          </p>
          <div className="mt-[12px] flex flex-col gap-[8px]">
            {actions.length > 0 ? (
              actions.map((a) => (
                <button
                  key={`${a.from}-${a.to}-${a.label}`}
                  type="button"
                  onClick={() => setCurrentId(a.to)}
                  className={cn(
                    "rounded-[10px] border px-[14px] py-[11px] text-left font-mono text-[13px] transition-colors",
                    a.intent === "danger"
                      ? "border-[oklch(0.82_0.09_25)] bg-[oklch(0.98_0.02_25)] text-[oklch(0.5_0.16_25)] hover:border-[oklch(0.7_0.14_25)]"
                      : a.intent === "primary"
                        ? "border-teal-line bg-teal-tint text-teal-ink hover:border-teal-ring"
                        : "border-line bg-surface-muted text-body hover:border-ink-muted",
                  )}
                >
                  {a.label}
                </button>
              ))
            ) : (
              <p className="text-[13px] leading-[1.6] text-ink-muted">
                This is a terminal state. Nothing more to do.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCurrentId(content.initial)}
            className="mt-[16px] inline-flex items-center gap-[6px] rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12px] text-ink-soft transition-colors hover:border-ink-muted"
          >
            <ArrowCounterClockwise size={14} weight="bold" aria-hidden />
            {content.resetLabel} a fresh machine
          </button>
        </div>

        <div
          key={currentId}
          className={cn(
            "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            t.frame,
          )}
        >
          <div className="flex items-center gap-[9px]">
            <span className={cn("h-[11px] w-[11px] rounded-full", t.dot)} />
            <h3 className={cn("text-[16px] font-semibold", t.text)}>
              {state.label}
            </h3>
          </div>
          <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
            {state.detail}
          </p>
          <div className="mt-[16px] grid grid-cols-1 gap-[8px] min-[520px]:grid-cols-2">
            {state.meters.map((m) => {
              const mk = METER[m.kind];
              const MeterIcon = mk.icon;
              return (
                <div
                  key={m.label}
                  className={cn(
                    "flex items-center justify-between gap-[10px] rounded-[10px] border px-[12px] py-[9px]",
                    mk.chip,
                  )}
                >
                  <span className="flex items-center gap-[7px]">
                    <span
                      aria-hidden
                      className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-surface/70 font-mono text-[11px] font-bold"
                    >
                      <MeterIcon size={13} weight={mk.weight} />
                    </span>
                    <span className="font-mono text-[11.5px] text-ink-soft">
                      {m.label}
                    </span>
                  </span>
                  <span className="text-right text-[12px] font-semibold">
                    {m.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
