import { notFound } from "next/navigation";
import { InvestigationShell } from "@/components/investigation/investigation-shell";
import { getInvestigation, investigations } from "@/content/investigations";

/**
 * Prerender one page per Investigation id. Unlike the provider-scoped routes,
 * this does not multiply by PROVIDERS: Investigations live outside the lens
 * (ADR-0004), so each id maps to exactly one static page.
 */
export function generateStaticParams() {
  return investigations.map((investigation) => ({
    investigation: investigation.id,
  }));
}

/**
 * Renders a single Investigation. An unknown id is a 404; a known id loads its
 * full data module on demand and hands it to the shared engine shell.
 */
export default async function InvestigationPage({
  params,
}: {
  params: Promise<{ investigation: string }>;
}) {
  const { investigation: id } = await params;
  const meta = getInvestigation(id);
  if (!meta) notFound();

  const { default: investigation } = await meta.data();
  return <InvestigationShell investigation={investigation} />;
}
