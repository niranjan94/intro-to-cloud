import {
  ArrowRightIcon as ArrowRight,
  CompassIcon as Compass,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { SOURCE_PLATFORM_LABELS } from "@/components/investigation/types";
import { InvestigationRow } from "@/components/investigation-row";
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

      <Link
        href="/investigations/orientation"
        className="mt-[28px] flex items-center gap-[14px] rounded-[16px] border border-line bg-teal-tint px-[20px] py-[16px] transition-colors hover:border-teal-ring max-[760px]:px-[16px]"
      >
        <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px] bg-surface">
          <Compass size={20} weight="bold" aria-hidden className="text-teal" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ink-strong">
            New to this? Start with Orientation
          </span>
          <span className="mt-[2px] block text-[13.5px] leading-[1.5] text-body">
            A short, ungraded primer on the SOC analyst&rsquo;s job, the
            vocabulary, and how to work an alert. Read it once before your first
            case.
          </span>
        </span>
        <ArrowRight
          size={18}
          weight="bold"
          aria-hidden
          className="shrink-0 text-teal-ink"
        />
      </Link>

      {groups.length === 0 ? (
        <p className="mt-[34px] text-[15px] text-ink-muted">
          No investigations are available yet.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.platform} className="mt-[30px]">
            <h2 className="mb-[10px] flex items-baseline gap-[8px] text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              {SOURCE_PLATFORM_LABELS[group.platform]}
              <span className="font-mono text-[11px] font-normal tracking-normal text-faint">
                {group.items.length}
              </span>
            </h2>
            <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
              {group.items.map((investigation) => (
                <InvestigationRow
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
