import { notFound } from "next/navigation";
import { LensRail } from "@/components/lens-rail";
import { getConcept } from "@/content/registry";
import { isProvider } from "@/lib/provider";

/**
 * Renders the lazy-loaded concept component for the chosen provider. Unknown
 * provider, unknown concept, or a concept that doesn't support the provider all
 * resolve to 404.
 */
export default async function ConceptPage({
  params,
}: {
  params: Promise<{ provider: string; concept: string }>;
}) {
  const { provider, concept: conceptId } = await params;
  if (!isProvider(provider)) notFound();

  const concept = getConcept(conceptId);
  const loader = concept?.components[provider];
  if (!concept || !loader) notFound();

  const { default: Lesson } = await loader();
  return (
    <div className="grid gap-40 lg:grid-cols-[1fr_300px] lg:items-start">
      <Lesson />
      <LensRail
        concept={concept}
        activeProvider={provider}
        className="lg:sticky lg:top-[72px]"
      />
    </div>
  );
}
