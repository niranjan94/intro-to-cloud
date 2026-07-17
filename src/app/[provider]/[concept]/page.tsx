import { notFound } from "next/navigation";
import { ComingSoonLesson } from "@/components/lesson/coming-soon";
import { getConcept } from "@/content/registry";
import { isProvider } from "@/lib/provider";

/**
 * Renders a concept's lesson through the chosen provider's lens. An unknown
 * provider or concept is a 404; a known concept whose lesson isn't authored yet
 * falls back to the "coming soon" state (still showing the equivalence).
 */
export default async function ConceptPage({
  params,
}: {
  params: Promise<{ provider: string; concept: string }>;
}) {
  const { provider, concept: conceptId } = await params;
  if (!isProvider(provider)) notFound();

  const concept = getConcept(conceptId);
  if (!concept) notFound();

  const loader = concept.components[provider];
  if (!loader) {
    return <ComingSoonLesson concept={concept} provider={provider} />;
  }

  const { default: Lesson } = await loader();
  return <Lesson />;
}
