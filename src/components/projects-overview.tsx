"use client";

import { ProjectCard } from "@/components/project-card";
import { useProvider } from "@/components/provider-context";
import { projects } from "@/content/projects";
import { PROVIDER_LABELS } from "@/content/types";

/**
 * The capstone-project catalog on the landing page, shown through the active
 * lens. Client-side so the stack chips on each card re-label when the top-bar
 * switcher changes provider, mirroring {@link ConceptOverview}.
 */
export function ProjectsOverview() {
  const { provider } = useProvider();

  if (projects.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[var(--page-max-width)] px-[28px] pb-[80px] pt-[8px]">
      <div className="flex items-baseline justify-between gap-[16px] border-t border-line pt-[36px]">
        <h2 className="text-[24px] font-bold tracking-[-0.02em] text-ink-soft">
          Then build something
        </h2>
        <span className="text-[13.5px] text-ink-muted">
          Capstones · showing the{" "}
          <strong className="font-semibold text-primary">
            {PROVIDER_LABELS[provider]}
          </strong>{" "}
          lens
        </span>
      </div>
      <p className="mt-[10px] max-w-[52em] text-[15px] leading-[1.55] text-body-soft">
        Once a few concepts click, put them together into one working system.
        Each project assembles services you have already met, end to end.
      </p>

      <div className="mt-[20px] grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} provider={provider} />
        ))}
      </div>
    </section>
  );
}
