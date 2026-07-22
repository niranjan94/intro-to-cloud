import { notFound } from "next/navigation";
import { ProjectComingSoon } from "@/components/lesson/project-coming-soon";
import { getProject, projects } from "@/content/projects";
import { PROVIDERS } from "@/content/types";
import { isProvider } from "@/lib/provider";

/** Prerender every provider × project pairing so the route is fully static. */
export function generateStaticParams() {
  return PROVIDERS.flatMap((provider) =>
    projects.map((project) => ({ provider, project: project.id })),
  );
}

/**
 * Renders a capstone project's build through the chosen provider's lens. An
 * unknown provider or project is a 404; a known project whose build isn't
 * authored for this lens yet falls back to the "coming soon" state (still
 * showing the cross-provider stack).
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ provider: string; project: string }>;
}) {
  const { provider, project: projectId } = await params;
  if (!isProvider(provider)) notFound();

  const project = getProject(projectId);
  if (!project) notFound();

  const loader = project.components[provider];
  if (!loader) {
    return <ProjectComingSoon project={project} provider={provider} />;
  }

  const { default: Build } = await loader();
  return <Build />;
}
