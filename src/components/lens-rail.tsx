import { ProviderLogo } from "@/components/provider-logo";
import { SectionLabel } from "@/components/section-label";
import { supportedProviders } from "@/content/registry";
import type { Concept, Provider } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Right-rail card showing a concept's cross-provider equivalence: the same
 * concept realized as each provider's Service. Makes the concept-first idea
 * visible without switching. The active provider (if any) is emphasized.
 */
export function LensRail({
  concept,
  activeProvider,
  className,
}: {
  concept: Concept;
  activeProvider?: Provider;
  className?: string;
}) {
  const providers = supportedProviders(concept);

  return (
    <aside
      className={cn(
        "flex flex-col gap-16 rounded-cards border border-stone-border bg-paper-white p-24",
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        <SectionLabel>ONE CONCEPT, TWO LENSES</SectionLabel>
        <p className="text-subheading font-medium text-ink-black">
          {concept.title}
        </p>
      </div>
      <ul className="flex flex-col gap-8">
        {providers.map((provider) => {
          const isActive = provider === activeProvider;
          return (
            <li
              key={provider}
              className={cn(
                "flex items-center justify-between gap-16 rounded-list-items border px-16 py-12",
                isActive
                  ? "border-ink-black bg-accent"
                  : "border-transparent bg-bone",
              )}
            >
              <ProviderLogo provider={provider} className="h-16 w-auto" />
              <span
                className={cn(
                  "font-mono text-caption",
                  isActive ? "text-ink-black" : "text-slate-gray",
                )}
              >
                {concept.services[provider]}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
