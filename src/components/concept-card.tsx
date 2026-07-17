import Link from "next/link";
import type { Concept, Provider } from "@/content/types";

/**
 * A concept summary card for the home and browse grids. Shows the concept's
 * provider-agnostic title and blurb, plus the concrete service name for the
 * active lens. Links into the lesson for the current provider.
 */
export function ConceptCard({
  concept,
  provider,
}: {
  concept: Concept;
  provider: Provider;
}) {
  return (
    <Link
      href={`/${provider}/${concept.id}`}
      className="flex flex-col rounded-[16px] border border-line bg-surface p-[18px] shadow-[0_1px_2px_oklch(0.4_0.02_230_/_0.03)] transition-all hover:-translate-y-[2px] hover:border-[oklch(0.78_0.06_195)] hover:shadow-[0_10px_26px_-16px_oklch(0.4_0.06_195_/_0.5)]"
    >
      <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink-soft">
        {concept.title}
      </span>
      <span className="mt-[6px] font-mono text-[12.5px] text-teal">
        {concept.services[provider]}
      </span>
      <span className="mt-[10px] text-pretty text-[12.5px] leading-[1.45] text-ink-muted">
        {concept.short}
      </span>
    </Link>
  );
}
