import { ProjectShell } from "@/components/lesson/project-shell";
import { StackPanel } from "@/components/lesson/stack-panel";
import type { Project, Provider } from "@/content/types";

/**
 * Placeholder build for a project that is in the catalog but whose lesson
 * hasn't been authored for the active provider yet. It still shows the
 * cross-provider stack from the project's metadata, so the page is useful
 * rather than a dead end.
 */
export function ProjectComingSoon({
  project,
  provider,
}: {
  project: Project;
  provider: Provider;
}) {
  return (
    <ProjectShell project={project} provider={provider} blurb={project.short}>
      <StackPanel
        provider={provider}
        aws={project.stack.aws ?? []}
        azure={project.stack.azure ?? []}
      />
      <div className="mt-[34px] rounded-[18px] border border-dashed border-line bg-surface p-[26px] text-center">
        <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-faint">
          Build in progress
        </div>
        <p className="mx-auto mt-[10px] max-w-[44ch] text-[14px] leading-[1.55] text-body-soft">
          {`The full ${project.title} walkthrough is being written for this lens. The stack above is the shape of what’s coming.`}
        </p>
      </div>
    </ProjectShell>
  );
}
