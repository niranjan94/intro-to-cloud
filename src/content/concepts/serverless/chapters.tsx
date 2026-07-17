"use client";

import { useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import type { Provider } from "@/content/types";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";
import { CostEstimator } from "./cost-estimator";
import { CONTENT } from "./data";
import { LifecycleTrace } from "./lifecycle-trace";
import { LimitsExplorer } from "./limits-explorer";
import { Quiz } from "./quiz";
import { ScalingSim } from "./scaling-sim";
import { TriggerExplorer } from "./trigger-explorer";

/**
 * The guided, chapter-by-chapter body of the Serverless Functions lesson.
 * Chapter order is fixed (triggers, cold start, scaling, sizing, pricing, quiz);
 * every chapter's copy and interactive data comes from CONTENT[provider]. AWS
 * and Azure diverge in the triggering model (one event into one handler plus the
 * AWS SDK, versus a trigger plus declarative input and output bindings), and in
 * how the hosting plan shapes cold starts, scale ceilings, timeouts, and sizing
 * on Azure where Lambda exposes a single tunable model.
 */
export function ServerlessChapters({ provider }: { provider: Provider }) {
  const content = CONTENT[provider];
  const [current, setCurrent] = useState(0);
  const chapter = content.chapters[current];
  const last = content.chapters.length - 1;

  const body = () => {
    switch (current) {
      case 0:
        return (
          <>
            <TriggerExplorer content={content.triggers} />
            {content.triggers.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
            <div className="mt-[16px]">
              <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
                Deploy or invoke from the CLI
              </p>
              <CliBlock command={content.cli} />
            </div>
          </>
        );
      case 1:
        return (
          <>
            <LifecycleTrace content={content.lifecycle} />
            {content.lifecycle.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 2:
        return (
          <>
            <ScalingSim content={content.scaling} />
            {content.scaling.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 3:
        return (
          <>
            <LimitsExplorer content={content.limits} />
            {content.limits.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 4:
        return (
          <>
            <CostEstimator content={content.pricing} />
            {content.pricing.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
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
