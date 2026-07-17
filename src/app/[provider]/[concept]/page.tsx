import { notFound } from "next/navigation";
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
  return <Lesson />;
}
