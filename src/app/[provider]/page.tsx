import { notFound } from "next/navigation";
import { ConceptCard } from "@/components/concept-card";
import { SectionLabel } from "@/components/section-label";
import { conceptSupportsProvider, concepts } from "@/content/registry";
import { PROVIDER_LABELS } from "@/content/types";
import { isProvider } from "@/lib/provider";

/** Provider overview: lists the concepts available through this provider's lens. */
export default async function ProviderOverview({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;
  if (!isProvider(provider)) notFound();

  const available = concepts.filter((concept) =>
    conceptSupportsProvider(concept, provider),
  );

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-12">
        <SectionLabel>{PROVIDER_LABELS[provider]} LENS</SectionLabel>
        <h1 className="text-heading font-light text-ink-black">Concepts</h1>
        <p className="max-w-[60ch] text-body text-slate-gray">
          Pick a concept to explore it through the {PROVIDER_LABELS[provider]}{" "}
          lens. Switch providers any time from the top bar.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2">
        {available.map((concept) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            href={`/${provider}/${concept.id}`}
          />
        ))}
      </div>
    </div>
  );
}
