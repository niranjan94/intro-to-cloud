"use client";

import { useState } from "react";
import {
  AgentPromptPanel,
  type AgentSetup,
  REFERENCE_CHAPTERS,
  type ResponsibilitySplit,
  SharedResponsibilityPanel,
} from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";
import { cn } from "@/lib/utils";
import { AnatomyExplorer } from "./anatomy-explorer";
import { Callout } from "./callout";
import { ComputeExplorer } from "./compute-explorer";
import { CONTENT } from "./data";
import { ImagePipeline } from "./image-pipeline";
import { Quiz } from "./quiz";
import { ScaleSim } from "./scale-sim";
import { TrafficRollout } from "./traffic-rollout";

/**
 * The guided, chapter-by-chapter body of the Containers lesson. Chapter order is
 * fixed (image, anatomy, compute, scaling, traffic, quiz); every chapter's copy
 * and interactive data comes from CONTENT[provider]. AWS and Azure diverge in the
 * blueprint-and-manager split (task definition plus service versus one container
 * app made of revisions), the compute model (Fargate or EC2 versus always
 * serverless workload profiles), scaling (no default scale-to-zero versus KEDA
 * scale-to-zero), and rollout (rolling task replacement versus a revision flip).
 */
export function ContainersChapters({
  provider,
  responsibility,
  agent,
}: {
  provider: Provider;
  responsibility: ResponsibilitySplit;
  agent: AgentSetup;
}) {
  const content = CONTENT[provider];
  // The quiz is the last entry of content.chapters, but it reads as the
  // capstone, so the reference tabs (ownership, then set it up) slot in ahead
  // of it: [...guided chapters, ownership, set it up, quiz].
  const chapters = [
    ...content.chapters.slice(0, -1),
    ...REFERENCE_CHAPTERS,
    content.chapters[content.chapters.length - 1],
  ];
  const [current, setCurrent] = useState(0);
  const chapter = chapters[current];
  const last = chapters.length - 1;

  const body = () => {
    if (current === content.chapters.length - 1)
      return (
        <SharedResponsibilityPanel provider={provider} split={responsibility} />
      );
    if (current === content.chapters.length)
      return <AgentPromptPanel cli={agent.cli} scenarios={agent.scenarios} />;
    if (current === content.chapters.length + 1)
      return <Quiz questions={content.quiz} />;
    switch (current) {
      case 0:
        return (
          <>
            <ImagePipeline content={content.image} />
            {content.image.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 1:
        return (
          <>
            <AnatomyExplorer content={content.anatomy} />
            {content.anatomy.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 2:
        return (
          <>
            <ComputeExplorer content={content.compute} />
            {content.compute.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 3:
        return (
          <>
            <ScaleSim content={content.scale} />
            {content.scale.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 4:
        return (
          <>
            <TrafficRollout content={content.traffic} />
            {content.traffic.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <section className="mt-[30px]">
      <nav
        aria-label="Lesson chapters"
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
