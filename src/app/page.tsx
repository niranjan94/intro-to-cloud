import { ConceptOverview } from "@/components/concept-overview";
import { LiveLensCard } from "@/components/live-lens-card";
import { ProjectsOverview } from "@/components/projects-overview";
import { StartLensButton } from "@/components/start-lens-button";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto grid max-w-[var(--page-max-width)] grid-cols-1 items-center gap-[34px] px-[20px] pb-[40px] pt-[48px] min-[760px]:px-[28px] min-[1000px]:grid-cols-[1.05fr_0.95fr] min-[1000px]:gap-[56px] min-[1000px]:pt-[64px]">
        <div className="motion-safe:animate-[fadeUp_0.5s_ease_both]">
          <div className="inline-flex items-center gap-[8px] rounded-full bg-teal-soft px-[12px] py-[6px] font-mono text-[11.5px] tracking-[0.08em] text-[oklch(0.5_0.06_195)]">
            OPEN SOURCE · NO LOGIN · FREE
          </div>
          <h1 className="mt-[22px] text-balance text-[52px] font-extrabold leading-[1.04] tracking-[-0.03em] text-ink max-[520px]:text-[34px]">
            Learn the cloud once.
            <br />
            See it through{" "}
            <span className="text-[oklch(0.5_0.085_195)]">any provider.</span>
          </h1>
          <p className="mt-[22px] max-w-[30em] text-pretty text-[18px] leading-[1.55] text-body">
            Clouds are ~90% the same idea and ~10% branding. Pick a{" "}
            <strong className="font-semibold text-ink-strong">concept</strong>,
            then flip between providers to watch the <em>same idea</em> wear a
            different name.
          </p>
          <div className="mt-[30px] flex flex-wrap items-center gap-[14px]">
            <StartLensButton />
            <span className="text-[13.5px] text-ink-muted">
              or switch the lens up top — the concepts never change.
            </span>
          </div>
        </div>

        <LiveLensCard />
      </section>

      <ConceptOverview />
      <ProjectsOverview />
    </main>
  );
}
