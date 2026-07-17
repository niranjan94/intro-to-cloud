import Link from "next/link";
import {
  type Concept,
  PROVIDER_BRAND,
  PROVIDER_LABELS,
  type Provider,
} from "@/content/types";

/** The "you're viewing the X lens" marker shown beside the lesson title. */
function LensBadge({ provider }: { provider: Provider }) {
  return (
    <div className="flex items-center gap-[8px] rounded-[10px] border border-line bg-surface-muted px-[12px] py-[8px] text-[12.5px] text-muted">
      <span
        aria-hidden
        className="h-[9px] w-[9px] rounded-full"
        style={{ background: PROVIDER_BRAND[provider] }}
      />
      You&rsquo;re viewing the{" "}
      <strong className="font-semibold text-ink-strong">
        {PROVIDER_LABELS[provider]}
      </strong>{" "}
      lens
    </div>
  );
}

/**
 * The shared chrome every lesson sits in: a breadcrumb, the concept title with
 * its active-lens badge, an intro blurb, the lesson body, and a footer link
 * back to the concept list. Lesson bodies are free to compose the lesson kit
 * (equivalence panel, diagrams, CLI, glossary) however they need.
 */
export function LessonLayout({
  concept,
  provider,
  blurb,
  children,
}: {
  concept: Concept;
  provider: Provider;
  blurb: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="max-w-[820px] px-[44px] pt-[40px] motion-safe:animate-[fadeUp_0.4s_ease_both] max-[760px]:px-[20px] max-[760px]:pt-[28px]">
      <div className="flex items-center gap-[8px] font-mono text-[12.5px] text-muted">
        <Link href={`/${provider}`} className="text-teal-ink">
          {concept.category}
        </Link>
        <span>/</span>
        <span className="text-body">{concept.title}</span>
      </div>

      <div className="mt-[12px] flex flex-wrap items-start justify-between gap-[20px]">
        <h1 className="text-[38px] font-extrabold tracking-[-0.03em] text-ink max-[520px]:text-[28px]">
          {concept.title}
        </h1>
        <LensBadge provider={provider} />
      </div>

      <p className="mt-[16px] text-pretty text-[17px] leading-[1.6] text-body">
        {blurb}
      </p>

      {children}

      <div className="mt-[44px] flex gap-[12px] border-t border-line pt-[24px]">
        <Link href={`/${provider}`} className="text-[14px] text-teal-ink">
          ← All concepts
        </Link>
      </div>
    </article>
  );
}
