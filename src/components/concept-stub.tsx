import { SectionLabel } from "@/components/section-label";
import { Tag } from "@/components/tag";
import type { Lens } from "@/content/types";
import { PROVIDER_LABELS } from "@/content/types";

/**
 * Placeholder, non-interactive concept lesson. Renders the provider-specific
 * Service name so switching providers visibly swaps the lens. Real interactive
 * lessons replace this per concept later.
 */
export function ConceptStub({ lens }: { lens: Lens }) {
  return (
    <article className="flex flex-col gap-24">
      <div className="flex flex-col gap-12">
        <SectionLabel>{PROVIDER_LABELS[lens.provider]} LENS</SectionLabel>
        <h1 className="text-heading font-light text-ink-black">
          {lens.service}
        </h1>
        <p className="max-w-[60ch] text-body text-slate-gray">
          This is the {PROVIDER_LABELS[lens.provider]} lens on this concept. The
          idea stays the same across providers; only the concrete Service and
          its details change. An interactive lesson will live here.
        </p>
      </div>
      <div className="flex flex-wrap gap-8">
        <Tag>{PROVIDER_LABELS[lens.provider]}</Tag>
        <Tag>{lens.service}</Tag>
      </div>
    </article>
  );
}
