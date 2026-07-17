"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AccessLayersContent, LayerStatus } from "./data";
import { TONE, type Tone } from "./tones";

/** Each status maps to a semantic tone and a short chip label. */
const STATUS: Record<LayerStatus, { tone: Tone; label: string }> = {
  recommended: { tone: "allow", label: "Recommended" },
  legacy: { tone: "infrequent", label: "Legacy" },
  guardrail: { tone: "object", label: "Guardrail" },
  delegation: { tone: "auto", label: "Delegation" },
};

/** Chapter 3: explore the separate layers that make up object-storage access. */
export function AccessLayers({ content }: { content: AccessLayersContent }) {
  const [current, setCurrent] = useState(0);
  const layer = content.layers[current];
  const status = STATUS[layer.status];
  const t = TONE[status.tone];

  const rows: { label: string; value: string }[] = [
    { label: "Attaches to", value: layer.attachesTo },
    { label: "Scope", value: layer.scope },
    { label: "Default", value: layer.default },
  ];

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-teal-line bg-teal-tint px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-teal">
          Default posture
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.defaultPosture}
        </p>
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col gap-[8px]">
          {content.layers.map((row, i) => {
            const active = i === current;
            const rs = STATUS[row.status];
            const rt = TONE[rs.tone];
            return (
              <button
                key={row.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(i)}
                className={cn(
                  "flex items-center justify-between gap-[10px] rounded-[10px] border px-[14px] py-[12px] text-left transition-colors",
                  active
                    ? cn(rt.frame, "border-[1.5px]")
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "text-[13.5px] font-semibold",
                    active ? rt.text : "text-ink-strong",
                  )}
                >
                  {row.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-[9px] py-[3px] font-mono text-[10px] uppercase tracking-[0.04em]",
                    rt.chip,
                  )}
                >
                  {rs.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={layer.id}
          className={cn(
            "rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            t.frame,
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-[10px]">
            <h3 className={cn("text-[17px] font-semibold", t.text)}>
              {layer.name}
            </h3>
            <span
              className={cn(
                "rounded-full px-[10px] py-[3px] font-mono text-[10.5px] uppercase tracking-[0.04em]",
                t.chip,
              )}
            >
              {status.label}
            </span>
          </div>
          <dl className="mt-[14px] flex flex-col gap-[10px]">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[92px_1fr] gap-[10px] border-b border-line pb-[10px] last:border-b-0 last:pb-0"
              >
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted">
                  {row.label}
                </dt>
                <dd className="text-[13px] leading-[1.5] text-ink-strong">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-[14px] text-[13.5px] leading-[1.6] text-body">
            {layer.body}
          </p>
        </div>
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
