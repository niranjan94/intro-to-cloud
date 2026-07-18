import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { StageSection } from "@/components/stage-section";
import { projects } from "@/content/projects";
import { conceptsByStage } from "@/content/registry";
import { PROVIDER_LABELS } from "@/content/types";
import { isProvider } from "@/lib/provider";

const groups = conceptsByStage();

/** Provider overview: browse every concept through this provider's lens. */
export default async function ProviderOverview({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;
  if (!isProvider(provider)) notFound();

  return (
    <div className="px-[44px] pt-[40px] motion-safe:animate-[fadeUp_0.4s_ease_both] max-[760px]:px-[20px] max-[760px]:pt-[28px]">
      <div className="font-mono text-[12px] text-faint">/{provider}</div>
      <h1 className="mt-[8px] text-[34px] font-extrabold tracking-[-0.03em] text-ink">
        Browse concepts through the{" "}
        <span className="text-teal-ink">{PROVIDER_LABELS[provider]}</span> lens
      </h1>
      <p className="mt-[12px] max-w-[52em] text-[16px] leading-[1.55] text-body-soft">
        Every concept below is provider-agnostic. Switching the lens up top only
        changes the concrete service names — never the concepts themselves. Open
        one to start the lesson.
      </p>

      {groups.map((group, index) => (
        <StageSection
          key={group.stage}
          stage={group.stage}
          index={index}
          concepts={group.concepts}
          provider={provider}
        />
      ))}

      {projects.length > 0 ? (
        <div className="mt-[48px] border-t border-line pt-[36px]">
          <h2 className="text-[24px] font-bold tracking-[-0.02em] text-ink-soft">
            Put it together
          </h2>
          <p className="mt-[8px] max-w-[52em] text-[15px] leading-[1.55] text-body-soft">
            Once a few concepts click, build something end to end. Each project
            assembles services you have already met into one working system.
          </p>
          <div className="mt-[20px] grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                provider={provider}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
