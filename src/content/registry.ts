import {
  CATEGORIES,
  type Category,
  type Concept,
  type Provider,
} from "./types";

/**
 * The concept registry. One placeholder concept for now (Slice 1) — enough to
 * prove the concept-first + provider-switch plumbing end to end.
 */
export const concepts: readonly Concept[] = [
  {
    id: "object-storage",
    title: "Object Storage",
    category: "Storage",
    services: {
      aws: "Amazon S3",
      azure: "Azure Blob Storage",
    },
    components: {
      aws: () => import("./concepts/object-storage/aws"),
      azure: () => import("./concepts/object-storage/azure"),
    },
  },
];

/** Look up a concept by its id. */
export function getConcept(id: string): Concept | undefined {
  return concepts.find((concept) => concept.id === id);
}

/** The providers a concept supports, derived from its component keys. */
export function supportedProviders(concept: Concept): Provider[] {
  return Object.keys(concept.components) as Provider[];
}

/** Whether a concept can be viewed through a given provider's lens. */
export function conceptSupportsProvider(
  concept: Concept,
  provider: Provider,
): boolean {
  return provider in concept.components;
}

/** A category paired with its concepts, in canonical display order. */
export interface CategoryGroup {
  category: Category;
  concepts: Concept[];
}

/** Group concepts by category for sidebar / overview rendering. */
export function conceptsByCategory(): CategoryGroup[] {
  return CATEGORIES.map((category) => ({
    category,
    concepts: concepts.filter((concept) => concept.category === category),
  })).filter((group) => group.concepts.length > 0);
}
