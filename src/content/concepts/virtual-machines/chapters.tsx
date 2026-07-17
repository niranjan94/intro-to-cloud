"use client";

import { useState } from "react";
import type { Provider } from "@/content/types";
import { cn } from "@/lib/utils";
import { Anatomy } from "./anatomy";
import { Callout } from "./callout";
import { CONTENT } from "./data";
import { LifecycleSim } from "./lifecycle-sim";
import { PricingPicker } from "./pricing-picker";
import { Quiz } from "./quiz";
import { SizeExplorer } from "./size-explorer";

/**
 * The guided, chapter-by-chapter body of the Virtual Machines lesson. Chapter
 * order is fixed (anatomy, sizing, lifecycle, cost, quiz); every chapter's copy
 * and interactive data comes from CONTENT[provider]. AWS and Azure genuinely
 * diverge in the lifecycle chapter, where Azure adds a deallocate step.
 */
export function VmChapters({ provider }: { provider: Provider }) {
  const content = CONTENT[provider];
  const [current, setCurrent] = useState(0);
  const chapter = content.chapters[current];
  const last = content.chapters.length - 1;

  const body = () => {
    switch (current) {
      case 0:
        return <Anatomy content={content.anatomy} />;
      case 1:
        return <SizeExplorer content={content.sizing} />;
      case 2:
        return (
          <>
            <LifecycleSim content={content.lifecycle} />
            {content.lifecycle.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 3:
        return <PricingPicker content={content.pricing} />;
      default:
        return <Quiz questions={content.quiz} />;
    }
  };

  return (
    <section className="mt-[30px]">
      <nav
        aria-label="Lesson chapters"
        className="flex gap-[2px] overflow-x-auto border-y border-line"
      >
        {content.chapters.map((c, i) => (
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
            "rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted",
            current === 0 && "invisible",
          )}
        >
          ◂ Back
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.min(last, c + 1))}
          disabled={current === last}
          className="rounded-button bg-primary px-[16px] py-[8px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {current === last ? "Done ✓" : "Next ▸"}
        </button>
      </div>
    </section>
  );
}
