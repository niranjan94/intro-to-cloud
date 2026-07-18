"use client";

import { useProvider } from "@/components/provider-context";
import { StageSection } from "@/components/stage-section";
import { conceptsByStage } from "@/content/registry";
import { PROVIDER_LABELS } from "@/content/types";

const groups = conceptsByStage();

/**
 * The full concept catalog grouped by learning stage, shown through the active
 * lens. Client-side so the service names on each card re-label when the top-bar
 * switcher changes provider.
 */
export function ConceptOverview() {
  const { provider } = useProvider();

  return (
    <section className="mx-auto w-full max-w-[var(--page-max-width)] px-[28px] pb-[48px] pt-[36px]">
      <div className="flex items-baseline justify-between gap-[16px] border-t border-line pt-[36px]">
        <h2 className="text-[24px] font-bold tracking-[-0.02em] text-ink-soft">
          The concepts
        </h2>
        <span className="text-[13.5px] text-ink-muted">
          In learning order · showing the{" "}
          <strong className="font-semibold text-primary">
            {PROVIDER_LABELS[provider]}
          </strong>{" "}
          lens
        </span>
      </div>

      {groups.map((group, index) => (
        <StageSection
          key={group.stage}
          stage={group.stage}
          index={index}
          concepts={group.concepts}
          provider={provider}
        />
      ))}
    </section>
  );
}
