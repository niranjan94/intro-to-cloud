import Link from "next/link";
import { CATEGORIES, type Concept } from "@/content/types";
import { cn } from "@/lib/utils";

/*
 * DESIGN.md's pastels carry a project-status taxonomy; per ADR-0002 that
 * semantic is dropped and the three pastels are reassigned to Concept
 * Categories (one color per Category, cycling if there are more than three).
 */
const CATEGORY_BACKGROUNDS = [
  "bg-pale-sage",
  "bg-lavender-mist",
  "bg-dusty-rose",
] as const;

function categoryBackground(category: Concept["category"]): string {
  const index = Math.max(0, CATEGORIES.indexOf(category));
  return CATEGORY_BACKGROUNDS[index % CATEGORY_BACKGROUNDS.length];
}

/**
 * Pastel Category tile for home / overview grids ("Project Card" variants):
 * 8px radius, 24px padding, 1px stone hairline, ink-black title (DESIGN.md).
 */
export function ConceptCard({
  concept,
  href,
}: {
  concept: Concept;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col gap-16 rounded-cards border border-stone-border p-24 transition-colors",
        "hover:border-ink-black",
        categoryBackground(concept.category),
      )}
    >
      <span className="text-micro font-medium uppercase tracking-[0.04em] text-slate-gray">
        {concept.category}
      </span>
      <span className="text-subheading font-medium text-ink-black">
        {concept.title}
      </span>
    </Link>
  );
}
