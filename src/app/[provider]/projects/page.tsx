import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/content/projects";
import { PROVIDER_LABELS, PROVIDERS } from "@/content/types";
import { isProvider } from "@/lib/provider";

/** Prerender one projects index per provider so the route is fully static. */
export function generateStaticParams() {
  return PROVIDERS.map((provider) => ({ provider }));
}

/** Projects index: browse every capstone build through this provider's lens. */
export default async function ProjectsOverview({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;
  if (!isProvider(provider)) notFound();

  return (
    <div className="px-[44px] pt-[40px] motion-safe:animate-[fadeUp_0.4s_ease_both] max-[760px]:px-[20px] max-[760px]:pt-[28px]">
      <div className="font-mono text-[12px] text-faint">
        /{provider}/projects
      </div>
      <h1 className="mt-[8px] text-[34px] font-extrabold tracking-[-0.03em] text-ink">
        Build something with the{" "}
        <span className="text-teal-ink">{PROVIDER_LABELS[provider]}</span> lens
      </h1>
      <p className="mt-[12px] max-w-[52em] text-[16px] leading-[1.55] text-body-soft">
        Capstones put the concepts to work. Each project assembles services you
        have already met into one working system, so you see how the pieces fit
        together end to end. Switching the lens up top only changes the concrete
        service names, never the shape of the build.
      </p>

      <div className="mt-[34px] grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} provider={provider} />
        ))}
      </div>
    </div>
  );
}
