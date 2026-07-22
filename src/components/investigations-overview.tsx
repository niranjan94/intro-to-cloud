import {
  ArrowRightIcon as ArrowRight,
  CompassIcon as Compass,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { investigations } from "@/content/investigations";

/**
 * The Investigations teaser on the landing page: a short pitch, the Orientation
 * primer, and a link into the full queue. The alerts themselves are not listed
 * here; the queue at /investigations is their home, and it stays scannable as
 * the catalog grows. Provider-independent (Investigations sit outside the lens,
 * ADR-0004), so unlike {@link ProjectsOverview} it does not re-label when the
 * top-bar switcher changes.
 */
export function InvestigationsOverview() {
  if (investigations.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[var(--page-max-width)] px-[28px] pb-[80px] pt-[8px]">
      <div className="flex items-baseline justify-between gap-[16px] border-t border-line pt-[36px]">
        <h2 className="text-[24px] font-bold tracking-[-0.02em] text-ink-soft">
          Or put on the analyst hat
        </h2>
        <Link href="/investigations" className="text-[13.5px] text-teal-ink">
          Open the alert queue
        </Link>
      </div>
      <p className="mt-[10px] max-w-[52em] text-[15px] leading-[1.55] text-body-soft">
        Investigations are a different mode: triage a realistic security alert
        end to end and get graded on the call. No provider lens, just the
        evidence and your judgment.
      </p>

      <Link
        href="/investigations/orientation"
        className="mt-[20px] flex items-center gap-[14px] rounded-[16px] border border-line bg-teal-tint px-[20px] py-[16px] transition-colors hover:border-teal-ring max-[760px]:px-[16px]"
      >
        <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px] bg-surface">
          <Compass size={20} weight="bold" aria-hidden className="text-teal" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ink-strong">
            New to security? Start with Orientation
          </span>
          <span className="mt-[2px] block text-[13.5px] leading-[1.5] text-body">
            A short, ungraded primer on what a SOC analyst does, the vocabulary,
            and how to work an alert. Read it once before your first case.
          </span>
        </span>
        <ArrowRight
          size={18}
          weight="bold"
          aria-hidden
          className="shrink-0 text-teal-ink"
        />
      </Link>
    </section>
  );
}
