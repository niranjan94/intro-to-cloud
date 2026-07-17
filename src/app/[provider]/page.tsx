import { notFound } from "next/navigation";
import { StageSection } from "@/components/stage-section";
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
    </div>
  );
}
