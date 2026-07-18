"use client";

import {
  CaretLeftIcon as CaretLeft,
  CaretRightIcon as CaretRight,
  CheckIcon as Check,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import {
  AgentPromptPanel,
  type AgentSetup,
  REFERENCE_CHAPTERS,
  type ResponsibilitySplit,
  type SecurityChecklist,
  SecurityPanel,
  SharedResponsibilityPanel,
} from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";
import { cn } from "@/lib/utils";
import { CacheKeyExplorer } from "./cache-key";
import { CacheTrace } from "./cache-trace";
import { Callout } from "./callout";
import { CONTENT } from "./data";
import { EdgeLatency } from "./edge-latency";
import { FreshnessDecision } from "./freshness";
import { Quiz } from "./quiz";
import { RouteMatcher } from "./route-matcher";

/**
 * The guided, chapter-by-chapter body of the Content Delivery lesson. Chapter
 * order is fixed (edge, hit or miss, cache key, routing, operations, quiz);
 * every chapter's copy and interactive data comes from CONTENT[provider].
 * AWS and Azure diverge in scope (CloudFront is a CDN with a second regional
 * caching tier; Front Door is a global load balancer with optional per-route
 * caching), in the routing model (ordered first-match cache behaviors versus
 * most-specific route matching with no implicit catch-all), and in how private
 * content is locked down (signed URLs versus WAF, rules, and Private Link).
 */
export function ContentDeliveryChapters({
  provider,
  responsibility,
  security,
  agent,
}: {
  provider: Provider;
  responsibility: ResponsibilitySplit;
  security: SecurityChecklist;
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
      return <SecurityPanel provider={provider} checklist={security} />;
    if (current === content.chapters.length + 1)
      return <AgentPromptPanel cli={agent.cli} scenarios={agent.scenarios} />;
    if (current === content.chapters.length + 2)
      return <Quiz questions={content.quiz} />;
    switch (current) {
      case 0:
        return (
          <>
            <EdgeLatency content={content.edge} />
            {content.edge.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 1:
        return (
          <>
            <CacheTrace content={content.trace} />
            {content.trace.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 2:
        return (
          <>
            <CacheKeyExplorer content={content.cacheKey} />
            {content.cacheKey.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 3:
        return (
          <>
            <RouteMatcher content={content.routing} />
            {content.routing.callouts.map((c) => (
              <Callout key={c.tag} {...c} />
            ))}
          </>
        );
      case 4:
        return (
          <>
            <FreshnessDecision content={content.ops} />
            {content.ops.callouts.map((c) => (
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
