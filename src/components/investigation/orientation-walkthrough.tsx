"use client";

import {
  CaretLeftIcon as CaretLeft,
  CaretRightIcon as CaretRight,
  CheckIcon as Check,
} from "@phosphor-icons/react/dist/ssr";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * One section of the Primer: its nav label plus the framing shown above the body.
 * The `body` is a ready-rendered element rather than a render callback so this
 * client-entry component never receives a function prop (which would trip Next's
 * serializable-props rule); elements are lazy anyway, mounting only when their
 * section is current. Mirrors the shape {@link ProjectChapters} consumes.
 */
export interface OrientationSection {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
  body: ReactNode;
  /**
   * Let the body use more horizontal room than the prose reading column. Set for
   * all-interactive sections (the alert anatomy) that would otherwise sit cramped
   * in the width tuned for readable paragraphs.
   */
  wide?: boolean;
}

/**
 * The stepped shell the Primer sits in: a section nav strip, a fade between
 * sections, and Back/Next with a Done state. A trimmed cousin of
 * {@link ProjectChapters} with no reference tabs and no quiz, because a Primer
 * only reads (it is expository, not assessed, per ADR-0006).
 */
export function OrientationWalkthrough({
  sections,
}: {
  sections: readonly OrientationSection[];
}) {
  const [current, setCurrent] = useState(0);
  const section = sections[current];
  const last = sections.length - 1;

  return (
    <section className="mt-[30px]">
      <nav
        aria-label="Orientation sections"
        className="flex gap-[2px] overflow-x-auto border-y border-line"
      >
        {sections.map((s, i) => (
          <button
            key={s.navLabel}
            type="button"
            onClick={() => setCurrent(i)}
            aria-current={i === current}
            className={cn(
              "flex-none whitespace-nowrap border-b-2 px-[13px] py-[11px] font-mono text-[12.5px] transition-colors",
              i === current
                ? "border-teal-ring text-ink-strong"
                : "border-transparent text-ink-muted hover:text-body",
            )}
          >
            <span
              className={cn(
                "mr-[7px] font-bold",
                i === current ? "text-teal" : "text-line",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {s.navLabel}
          </button>
        ))}
      </nav>

      <div
        key={current}
        className="mt-[26px] motion-safe:animate-[fadeUp_0.35s_ease_both]"
      >
        <div className="max-w-[760px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-teal">
            {section.kicker}
          </p>
          <h2 className="mt-[6px] text-[26px] font-extrabold tracking-[-0.02em] text-ink max-[520px]:text-[22px]">
            {section.title}
          </h2>
          <p className="mt-[10px] text-pretty text-[15px] leading-[1.6] text-body">
            {section.intro}
          </p>
        </div>
        <div className={cn(section.wide ? "max-w-[1080px]" : "max-w-[760px]")}>
          {section.body}
        </div>
      </div>

      <div className="mt-[34px] flex items-center justify-between border-t border-line pt-[20px]">
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
          disabled={current === last}
          className="inline-flex items-center gap-[6px] rounded-button bg-primary px-[16px] py-[8px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {current === last ? (
            <>
              Ready
              <Check size={14} weight="bold" aria-hidden />
            </>
          ) : (
            <>
              Next
              <CaretRight size={14} weight="bold" aria-hidden />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
