import { SOURCE_PLATFORM_LABELS } from "@/components/investigation/types";
import { InvestigationCard } from "@/components/investigation-card";
import {
  investigationsByPlatform,
  toQueueItem,
} from "@/content/investigations";

/**
 * The Investigations queue: the full catalog of triage exercises, grouped by the
 * source platform each alert comes from. Styled as a SOC alert queue rather than
 * a lesson index. Cards carry a completion badge hydrated client-side from
 * localStorage.
 */
export default function InvestigationsQueue() {
  const groups = investigationsByPlatform();

  return (
    <div className="px-[44px] pt-[40px] motion-safe:animate-[fadeUp_0.4s_ease_both] max-[760px]:px-[20px] max-[760px]:pt-[28px]">
      <div className="font-mono text-[12px] text-faint">/investigations</div>
      <h1 className="mt-[8px] text-[34px] font-extrabold tracking-[-0.03em] text-ink">
        Alert queue
      </h1>
      <p className="mt-[12px] max-w-[56em] text-[16px] leading-[1.55] text-body-soft">
        Work a realistic security alert the way a SOC analyst would: read the
        evidence, flag what is actually suspicious, justify each call, pull the
        indicators, and reach a verdict. Every alert is graded. These are
        training simulations, so all names, addresses, and indicators are
        fictional.
      </p>

      {groups.length === 0 ? (
        <p className="mt-[34px] text-[15px] text-ink-muted">
          No investigations are available yet.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.platform} className="mt-[34px]">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              {SOURCE_PLATFORM_LABELS[group.platform]}
            </h2>
            <div className="mt-[14px] grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
              {group.items.map((investigation) => (
                <InvestigationCard
                  key={investigation.id}
                  investigation={toQueueItem(investigation)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
