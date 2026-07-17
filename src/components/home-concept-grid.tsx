"use client";

import { useEffect, useState } from "react";
import { ConceptCard } from "@/components/concept-card";
import { concepts } from "@/content/registry";
import type { Provider } from "@/content/types";
import { DEFAULT_PROVIDER, getStoredProvider } from "@/lib/provider";

/**
 * Concept overview grid for the home page. Cards link into the learner's
 * last-used provider (default until the stored value resolves after mount).
 */
export function HomeConceptGrid() {
  const [provider, setProvider] = useState<Provider>(DEFAULT_PROVIDER);
  useEffect(() => {
    setProvider(getStoredProvider());
  }, []);

  return (
    <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
      {concepts.map((concept) => (
        <ConceptCard
          key={concept.id}
          concept={concept}
          href={`/${provider}/${concept.id}`}
        />
      ))}
    </div>
  );
}
