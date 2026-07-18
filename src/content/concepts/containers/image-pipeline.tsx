"use client";

import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import { cn } from "@/lib/utils";
import type { ImageContent } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 1: step through build, push, and run, watching the image reference get
 * assembled from its parts (host / repository : tag) and the artifact that each
 * step produces. The reference is the thread that ties the three steps together.
 */
export function ImagePipeline({ content }: { content: ImageContent }) {
  const [current, setCurrent] = useState(0);
  const stage = content.stages[current];
  const t = TONE[stage.tone];
  const { host, repository, tag } = content.reference;
  // The reference is fully "built" once the image has been pushed (step >= 1).
  const built = current >= 1;

  const refParts: { label: string; value: string; shown: boolean }[] = [
    { label: content.hostLabel, value: host, shown: built },
    { label: "Repository", value: repository, shown: built },
    { label: "Tag", value: tag, shown: built },
  ];

  return (
    <div className="mt-[16px]">
      {/* Pipeline track */}
      <div className="flex flex-wrap items-center gap-[8px]">
        {content.stages.map((s, i) => {
          const active = i === current;
          const st = TONE[s.tone];
          return (
            <div key={s.id} className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-current={active}
                className={cn(
                  "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[13px] py-[7px] font-mono text-[12px] transition-colors",
                  active
                    ? cn(st.frame, st.text, "font-semibold")
                    : "border-line bg-surface text-ink-muted hover:border-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-[16px] w-[16px] items-center justify-center rounded-full font-bold text-[10px] text-white",
                    active ? st.dot : "bg-line",
                  )}
                >
                  {i + 1}
                </span>
                {s.label}
              </button>
              {i < content.stages.length - 1 ? (
                <span
                  aria-hidden
                  className="inline-flex items-center text-line"
                >
                  <ArrowRight size={14} weight="bold" />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* The image reference, assembled */}
      <div className="mt-[18px] rounded-[14px] border border-line bg-surface-muted p-[16px]">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
          Image reference
        </p>
        <div className="mt-[10px] flex flex-wrap items-stretch gap-[6px]">
          {refParts.map((part, i) => (
            <div key={part.label} className="flex items-stretch gap-[6px]">
              {i > 0 ? (
                <span
                  aria-hidden
                  className="flex items-center font-mono text-[15px] text-ink-muted"
                >
                  {i === 2 ? ":" : "/"}
                </span>
              ) : null}
              <div
                className={cn(
                  "rounded-[9px] border px-[10px] py-[7px] transition-colors",
                  part.shown
                    ? cn(TONE.registry.frame, "border-[1.5px]")
                    : "border-dashed border-line bg-surface",
                )}
              >
                <div className="font-mono text-[9px] uppercase tracking-[0.05em] text-ink-muted">
                  {part.label}
                </div>
                <div
                  className={cn(
                    "mt-[3px] break-all font-mono text-[12px]",
                    part.shown ? "text-ink-strong" : "text-faint",
                  )}
                >
                  {part.shown ? part.value : "not yet in a registry"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-[10px] text-[12.5px] leading-[1.6] text-ink-muted">
          {built
            ? "The full reference now names an image in the registry. Anything that can authenticate can pull exactly these bytes."
            : "Before a push, the image is only a local tag. It has no registry host, so nothing else can pull it yet."}
        </p>
      </div>

      {/* The selected stage */}
      <div
        key={stage.id}
        className={cn(
          "mt-[18px] rounded-[18px] border-[1.5px] p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
          t.frame,
        )}
      >
        <div className="flex items-center gap-[9px]">
          <span className={cn("h-[11px] w-[11px] rounded-full", t.dot)} />
          <h3 className={cn("text-[16px] font-semibold", t.text)}>
            {stage.title}
          </h3>
        </div>
        <p className="mt-[10px] text-[13.5px] leading-[1.6] text-body">
          {stage.body}
        </p>

        <div className="mt-[14px] rounded-[12px] border border-line bg-surface px-[14px] py-[11px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted">
            After this step
          </p>
          <p className="mt-[4px] text-[13px] leading-[1.55] text-ink-strong">
            {stage.artifact}
          </p>
        </div>

        <p className="mt-[14px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted">
          The command
        </p>
        <CliBlock command={stage.cli} />
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
