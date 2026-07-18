"use client";

import {
  CaretLeftIcon as CaretLeft,
  CaretRightIcon as CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TrafficContent } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 5: an ingress summary plus a rollout stepper. Advancing the rollout
 * shifts a traffic bar from the old version to the new one, so the difference
 * between a gradual task replacement and a clean revision flip is visible rather
 * than described.
 */
export function TrafficRollout({ content }: { content: TrafficContent }) {
  const [current, setCurrent] = useState(0);
  const step = content.steps[current];
  const last = content.steps.length - 1;
  const a = TONE.verA;
  const b = TONE.verB;

  return (
    <div className="mt-[16px]">
      {/* Ingress summary */}
      <div className="rounded-[14px] border border-line bg-surface p-[16px]">
        <div className="flex flex-wrap items-center gap-[8px]">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            Ingress
          </span>
          <span
            className={cn(
              "rounded-full px-[10px] py-[3px] font-mono text-[10.5px]",
              content.needsLoadBalancer
                ? TONE.managed.chip
                : TONE.serverless.chip,
            )}
          >
            {content.ingressModel}
          </span>
        </div>
        <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
          {content.ingressNote}
        </p>
        <dl className="mt-[12px] grid grid-cols-1 gap-[8px] min-[620px]:grid-cols-2">
          <div className="rounded-[10px] border border-line bg-surface-muted px-[12px] py-[9px]">
            <dt className="font-mono text-[10px] uppercase tracking-[0.05em] text-ink-muted">
              Public endpoint
            </dt>
            <dd className="mt-[3px] break-all font-mono text-[12px] text-teal-ink">
              {content.endpoint}
            </dd>
          </div>
          <div className="rounded-[10px] border border-line bg-surface-muted px-[12px] py-[9px]">
            <dt className="font-mono text-[10px] uppercase tracking-[0.05em] text-ink-muted">
              Health gate
            </dt>
            <dd className="mt-[3px] text-[12.5px] text-ink-strong">
              {content.healthCheck}
            </dd>
          </div>
        </dl>
      </div>

      {/* Rollout stepper */}
      <div className="mt-[18px] rounded-[18px] border border-line bg-surface p-[20px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            {content.rolloutLabel}
          </p>
          <div className="flex items-center gap-[12px] font-mono text-[11px]">
            <span className="flex items-center gap-[6px]">
              <span className={cn("h-[8px] w-[8px] rounded-full", a.dot)} />
              <span className={a.text}>{content.oldName}</span>
            </span>
            <span className="flex items-center gap-[6px]">
              <span className={cn("h-[8px] w-[8px] rounded-full", b.dot)} />
              <span className={b.text}>{content.newName}</span>
            </span>
          </div>
        </div>

        {/* Traffic bar */}
        <div className="mt-[14px]">
          <div className="flex h-[34px] w-full overflow-hidden rounded-[10px] border border-line bg-surface-muted">
            <div
              className={cn(
                "flex items-center justify-center font-mono text-[11px] font-semibold text-white motion-safe:transition-[width] motion-safe:duration-500",
                a.dot,
              )}
              style={{ width: `${step.oldPct}%` }}
            >
              {step.oldPct >= 12 ? `${step.oldPct}%` : ""}
            </div>
            <div
              className={cn(
                "flex items-center justify-center font-mono text-[11px] font-semibold text-white motion-safe:transition-[width] motion-safe:duration-500",
                b.dot,
              )}
              style={{ width: `${step.newPct}%` }}
            >
              {step.newPct >= 12 ? `${step.newPct}%` : ""}
            </div>
          </div>
          <div className="mt-[6px] flex justify-between font-mono text-[10.5px] text-ink-muted">
            <span>old {step.oldPct}%</span>
            <span>new {step.newPct}%</span>
          </div>
        </div>

        {/* Step markers */}
        <div className="mt-[16px] flex flex-wrap items-center gap-[8px]">
          {content.steps.map((s, i) => {
            const active = i === current;
            const done = i < current;
            return (
              <div key={s.id} className="flex items-center gap-[8px]">
                <button
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-current={active}
                  className={cn(
                    "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[12px] py-[6px] font-mono text-[12px] transition-colors",
                    active
                      ? "border-teal-ring bg-teal-tint text-teal-ink font-semibold"
                      : "border-line bg-surface text-ink-muted hover:border-ink-muted",
                  )}
                >
                  <span
                    className={cn(
                      "h-[8px] w-[8px] rounded-full",
                      active || done ? "bg-teal-ring" : "bg-line",
                    )}
                  />
                  {s.label}
                </button>
                {i < content.steps.length - 1 ? (
                  <span className="text-line">
                    <CaretRight size={14} weight="bold" aria-hidden />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <p
          key={step.id}
          className="mt-[14px] text-[13.5px] leading-[1.6] text-body motion-safe:animate-[fadeUp_0.25s_ease_both]"
        >
          {step.note}
        </p>

        <div className="mt-[16px] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            className={cn(
              "inline-flex items-center gap-[6px] rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted",
              current === 0 && "invisible",
            )}
          >
            <CaretLeft size={14} weight="bold" aria-hidden />
            Back
          </button>
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.min(last, c + 1))}
            className={cn(
              "inline-flex items-center gap-[6px] rounded-button border border-teal-line bg-teal-tint px-[16px] py-[8px] font-mono text-[12.5px] text-teal-ink transition-colors hover:border-teal-ring",
              current === last && "invisible",
            )}
          >
            Advance rollout
            <CaretRight size={14} weight="bold" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
