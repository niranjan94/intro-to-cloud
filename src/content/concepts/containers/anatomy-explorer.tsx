"use client";

import {
  CaretDownIcon as CaretDown,
  CaretRightIcon as CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AnatomyContent } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 2: two linked views of the run definition. On the left, the fields of
 * the blueprint with the exact place each one is declared; on the right, the
 * boxes those running instances nest inside. Selecting a field reveals where it
 * lives and why.
 */
export function AnatomyExplorer({ content }: { content: AnatomyContent }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          {content.specLabel}
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.specNote}
        </p>
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1fr_1fr]">
        {/* Fields */}
        <div className="rounded-[18px] border border-line bg-surface p-[16px]">
          <p className="px-[2px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted">
            What you declare
          </p>
          <div className="mt-[10px] flex flex-col gap-[6px]">
            {content.fields.map((f, i) => {
              const active = i === current;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "rounded-[10px] border px-[12px] py-[9px] text-left transition-colors",
                    active
                      ? "border-teal-ring bg-teal-tint"
                      : "border-line bg-surface hover:border-ink-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-[10px]">
                    <span
                      className={cn(
                        "text-[13.5px] font-semibold",
                        active ? "text-teal-ink" : "text-ink-strong",
                      )}
                    >
                      {f.concept}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                      {active ? (
                        <CaretDown size={13} weight="bold" aria-hidden />
                      ) : (
                        <CaretRight size={13} weight="bold" aria-hidden />
                      )}
                    </span>
                  </div>
                  {active ? (
                    <div className="mt-[8px] motion-safe:animate-[fadeUp_0.25s_ease_both]">
                      <div className="rounded-[8px] border border-line bg-surface px-[10px] py-[7px]">
                        <div className="font-mono text-[9.5px] uppercase tracking-[0.05em] text-ink-muted">
                          Declared in
                        </div>
                        <div className="mt-[3px] break-all font-mono text-[12px] text-ink-strong">
                          {f.home}
                        </div>
                      </div>
                      <div className="mt-[7px] rounded-[8px] border border-line bg-surface px-[10px] py-[7px]">
                        <div className="font-mono text-[9.5px] uppercase tracking-[0.05em] text-ink-muted">
                          Example value
                        </div>
                        <div className="mt-[3px] break-all font-mono text-[12px] text-teal-ink">
                          {f.value}
                        </div>
                      </div>
                      <p className="mt-[8px] text-[13px] leading-[1.55] text-body">
                        {f.note}
                      </p>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Containment model */}
        <div className="rounded-[18px] border border-line bg-surface p-[16px]">
          <p className="px-[2px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted">
            What it nests inside
          </p>
          <div className="mt-[12px]">
            <NestedBoxes levels={content.containment} depth={0} />
          </div>
          <p className="mt-[14px] text-[13px] leading-[1.6] text-ink-muted">
            {content.containmentNote}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Render the containment levels as visibly nested, labeled boxes. */
function NestedBoxes({
  levels,
  depth,
}: {
  levels: AnatomyContent["containment"];
  depth: number;
}) {
  if (levels.length === 0) return null;
  const [level, ...rest] = levels;
  const t = TONE[level.tone];
  const innermost = rest.length === 0;

  return (
    <div className={cn("rounded-[12px] border-[1.5px] p-[12px]", t.frame)}>
      <div className="flex items-center gap-[8px]">
        <span className={cn("h-[9px] w-[9px] rounded-full", t.dot)} />
        <span className={cn("font-mono text-[12.5px] font-semibold", t.text)}>
          {level.term}
        </span>
      </div>
      <div className="mt-[3px] pl-[17px] font-mono text-[10.5px] text-ink-muted">
        {level.sub}
      </div>
      {!innermost ? (
        <div className="mt-[10px]">
          <NestedBoxes levels={rest} depth={depth + 1} />
        </div>
      ) : null}
    </div>
  );
}
