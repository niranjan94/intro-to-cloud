import { ConceptCard } from "@/components/concept-card";
import {
  CATEGORY_META,
  type Category,
  type Concept,
  type Provider,
} from "@/content/types";

/** A category dot + label, used above concept grids and in the sidebar. */
export function CategoryLabel({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-[9px]">
      <span
        aria-hidden
        className="inline-block h-[9px] w-[9px] shrink-0 rounded-[3px]"
        style={{ background: CATEGORY_META[category].accent }}
      />
      <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-muted">
        {category}
      </span>
    </div>
  );
}

/** A titled category block with its concept cards, for overview/browse grids. */
export function CategorySection({
  category,
  concepts,
  provider,
}: {
  category: Category;
  concepts: Concept[];
  provider: Provider;
}) {
  return (
    <div className="mt-[34px]">
      <div className="mb-[14px]">
        <CategoryLabel category={category} />
      </div>
      <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {concepts.map((concept) => (
          <ConceptCard key={concept.id} concept={concept} provider={provider} />
        ))}
      </div>
    </div>
  );
}
