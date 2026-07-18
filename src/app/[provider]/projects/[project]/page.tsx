import { notFound } from "next/navigation";
import { ProjectComingSoon } from "@/components/lesson/project-coming-soon";
import { getProject } from "@/content/projects";
import { isProvider } from "@/lib/provider";

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
