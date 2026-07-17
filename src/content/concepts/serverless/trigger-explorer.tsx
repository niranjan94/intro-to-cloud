"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TriggersContent } from "./data";
import { TONE } from "./tones";

/** Chapter 1: pick a trigger and see what fires the function and what it gets. */
export function TriggerExplorer({ content }: { content: TriggersContent }) {
  const [current, setCurrent] = useState(0);
  const trigger = content.triggers[current];
  const dt = TONE[trigger.deliveryTone];

  return (
    <div className="mt-[16px]">
      <div className="grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[18px] border border-line bg-surface p-[16px]">
          <p className="px-[4px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            Trigger source
          </p>
          <div className="mt-[10px] flex flex-col gap-[6px]">
            {content.triggers.map((row, i) => {
              const active = i === current;
              const rt = TONE[row.deliveryTone];
              return (
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "rounded-[10px] border px-[12px] py-[10px] text-left transition-colors",
                    active
                      ? "border-teal-ring bg-surface"
                      : "border-line bg-surface hover:border-ink-muted",
                  )}
                >
                  <span className="flex items-center gap-[8px]">
                    <span
                      className={cn("h-[9px] w-[9px] rounded-full", rt.dot)}
                    />
                    <span
                      className={cn(
                        "font-mono text-[12.5px]",
                        active
                          ? "font-semibold text-ink-strong"
                          : "text-ink-soft",
                      )}
                    >
                      {row.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={trigger.id}
          className="rounded-[18px] border border-line bg-surface p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
        >
          <div className="flex flex-wrap items-center gap-[10px]">
            <h3 className="text-[17px] font-semibold text-ink-strong">
              {trigger.name}
            </h3>
            <span
              className={cn(
                "rounded-full px-[10px] py-[3px] font-mono text-[10.5px] font-semibold",
                dt.chip,
              )}
            >
              {trigger.delivery}
            </span>
          </div>

          <dl className="mt-[16px] flex flex-col gap-[10px]">
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
                Fires when
              </dt>
              <dd className="mt-[3px] text-[13.5px] leading-[1.5] text-body">
                {trigger.source}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
                Your code receives
              </dt>
              <dd className="mt-[3px] text-[13.5px] leading-[1.5] text-body">
                {trigger.data}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
                Typical use
              </dt>
              <dd className="mt-[3px] text-[13.5px] leading-[1.5] text-body">
                {trigger.use}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-2">
        <div className="rounded-[18px] border border-line bg-surface p-[18px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            The {content.unitTerm}
          </p>
          <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
            {content.handlerNote}
          </p>
          <div className="mt-[12px] overflow-x-auto rounded-[12px] bg-panel-deep px-[16px] py-[13px]">
            <code className="whitespace-pre font-mono text-[12px] leading-[1.6] text-[oklch(0.88_0.02_195)]">
              {content.handlerCode}
            </code>
          </div>
        </div>

        <div
          className={cn(
            "rounded-[18px] border-[1.5px] p-[18px]",
            TONE.event.frame,
          )}
        >
          <p
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.06em]",
              TONE.event.text,
            )}
          >
            {content.bindingsTitle}
          </p>
          <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
            {content.bindingsBody}
          </p>
        </div>
      </div>
    </div>
  );
}
