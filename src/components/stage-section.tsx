import { ConceptCard } from "@/components/concept-card";
import {
  type Concept,
  type Provider,
  STAGE_META,
  type Stage,
} from "@/content/types";

/** A stage dot + label, used above concept grids and in the sidebar. */
export function StageLabel({ stage }: { stage: Stage }) {
  return (
    <div className="flex items-center gap-[9px]">
      <span
        aria-hidden
        className="inline-block h-[9px] w-[9px] shrink-0 rounded-[3px]"
        style={{ background: STAGE_META[stage].accent }}
      />
      <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-muted">
        {stage}
      </span>
    </div>
  );
}

/** A titled stage block with its concept cards, for overview/browse grids. */
export function StageSection({
  stage,
  index,
  concepts,
  provider,
}: {
  stage: Stage;
  index: number;
  concepts: Concept[];
  provider: Provider;
}) {
  return (
    <div className="mt-[34px]">
      <div className="mb-[14px] flex items-center gap-[10px]">
        <span className="font-mono text-[12px] font-semibold text-faint">
          {`0${index + 1}`}
        </span>
        <StageLabel stage={stage} />
      </div>
      <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {concepts.map((concept) => (
          <ConceptCard key={concept.id} concept={concept} provider={provider} />
        ))}
      </div>
    </div>
  );
}
