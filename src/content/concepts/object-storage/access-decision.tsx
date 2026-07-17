"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AccessDecisionContent, DecisionInput } from "./data";
import { TONE } from "./tones";

/** Effect of one input on the decision, mapped to a semantic tone and glyph. */
const EFFECT: Record<
  DecisionInput["effect"],
  { tone: "allow" | "deny" | "meta"; icon: string }
> = {
  allow: { tone: "allow", icon: "✓" },
  deny: { tone: "deny", icon: "✕" },
  neutral: { tone: "meta", icon: "–" },
};

/** Chapter 4: run requests through the access layers and see which one decides. */
export function AccessDecision({
  content,
}: {
  content: AccessDecisionContent;
}) {
  const [current, setCurrent] = useState(0);
  const scenario = content.scenarios[current];
  const verdictTone = TONE[scenario.allowed ? "allow" : "deny"];

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
                      TONE[s.allowed ? "allow" : "deny"].dot,
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
            Request
          </p>
          <p className="mt-[5px] font-mono text-[12.5px] text-ink-strong">
            {scenario.request}
          </p>

          <div className="mt-[14px] flex flex-col gap-[6px]">
            {scenario.inputs.map((input) => {
              const e = EFFECT[input.effect];
              const et = TONE[e.tone];
              return (
                <div
                  key={input.layer}
                  className={cn(
                    "flex items-center justify-between gap-[10px] rounded-[10px] border px-[12px] py-[9px]",
                    et.frame,
                  )}
                >
                  <span className="flex items-center gap-[8px]">
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex h-[18px] w-[18px] items-center justify-center rounded-full font-mono text-[11px] font-bold text-white",
                        et.dot,
                      )}
                    >
                      {e.icon}
                    </span>
                    <span className="font-mono text-[12px] text-ink-strong">
                      {input.layer}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-right text-[12px] font-medium",
                      et.text,
                    )}
                  >
                    {input.state}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-[14px] flex flex-wrap items-center gap-[10px]">
            <span aria-hidden className="font-mono text-[16px] text-ink-muted">
              ↓
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-[8px] rounded-full border-[1.5px] px-[14px] py-[6px] font-mono text-[13px] font-semibold",
                verdictTone.frame,
                verdictTone.text,
              )}
            >
              <span
                className={cn("h-[9px] w-[9px] rounded-full", verdictTone.dot)}
              />
              {scenario.verdict}
            </span>
            <span className="font-mono text-[11.5px] text-ink-muted">
              decided by {scenario.decidedBy}
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
