"use client";

import {
  CaretLeftIcon as CaretLeft,
  CaretRightIcon as CaretRight,
  CheckIcon as Check,
} from "@phosphor-icons/react/dist/ssr";
import { type ReactNode, useState } from "react";
import {
  type ChapterMeta,
  REFERENCE_CHAPTERS,
  type ReferenceData,
  ReferencePanel,
} from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The shared, tabbed chapter shell every project build sits in: a chapter nav
 * strip, a fade between chapters, prev/next with a Done state, and the chapter
 * header. It owns the one piece that used to be copied (and drift) per project:
 * assembling [guided chapters, shared reference tabs, quiz] and dispatching each
 * index to the right body.
 *
 * A project supplies only what is genuinely bespoke: its guided chapters'
 * framing (`guided`) and matching interactive bodies (`guidedBodies`, same
 * order), the reference data, and the quiz body. Bodies are passed as elements
 * rather than render callbacks: a function prop would trip Next's
 * serializable-props rule on this client-entry component, and React elements are
 * lazy anyway (each body mounts only when its tab is the current one). The
 * reference tabs are rendered by {@link ReferencePanel} keyed on each chapter's
 * `kind`, so adding a reference tab never silently mis-wires a project.
 */
export function ProjectChapters({
  provider,
  guided,
  guidedBodies,
  reference,
  quizMeta,
  quizBody,
}: {
  provider: Provider;
  /** The guided chapters' framing, in order, NOT including the quiz. */
  guided: readonly ChapterMeta[];
  /** Interactive body per guided chapter, same length and order as `guided`. */
  guidedBodies: readonly ReactNode[];
  /** Per-provider data for the shared reference tabs. */
  reference: ReferenceData;
  /** Framing for the quiz tab (its nav label, kicker, title, intro). */
  quizMeta: ChapterMeta;
  /** The quiz body. */
  quizBody: ReactNode;
}) {
  const chapters = [...guided, ...REFERENCE_CHAPTERS, quizMeta];
  const refStart = guided.length;
  const quizIndex = refStart + REFERENCE_CHAPTERS.length;

  const [current, setCurrent] = useState(0);
  const chapter = chapters[current];
  const last = chapters.length - 1;

  const body = (): ReactNode => {
    if (current === quizIndex) return quizBody;
    if (current >= refStart) {
      const ref = REFERENCE_CHAPTERS[current - refStart];
      return (
        <ReferencePanel provider={provider} kind={ref.kind} data={reference} />
      );
    }
    return guidedBodies[current];
  };

  return (
    <section className="mt-[30px]">
      <nav
        aria-label="Project chapters"
        className="flex gap-[2px] overflow-x-auto border-y border-line"
      >
        {chapters.map((c, i) => (
          <button
            key={c.navLabel}
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
              {String(i).padStart(2, "0")}
            </span>
            {c.navLabel}
          </button>
        ))}
      </nav>

      <div
        key={current}
        className="mt-[26px] motion-safe:animate-[fadeUp_0.35s_ease_both]"
      >
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-teal">
          {chapter.kicker}
        </p>
        <h2 className="mt-[6px] text-[26px] font-extrabold tracking-[-0.02em] text-ink max-[520px]:text-[22px]">
          {chapter.title}
        </h2>
        <p className="mt-[10px] max-w-[62ch] text-pretty text-[15px] leading-[1.6] text-body">
          {chapter.intro}
        </p>
        {body()}
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
              Done
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
