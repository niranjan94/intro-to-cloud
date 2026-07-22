import Link from "next/link";
import { InvestigationCard } from "@/components/investigation-card";
import { investigations } from "@/content/investigations";

/**
 * The Investigations teaser on the landing page: a short pitch and the alert
 * cards, linking into the full queue. Provider-independent (Investigations sit
 * outside the lens, ADR-0004), so unlike {@link ProjectsOverview} it does not
 * re-label when the top-bar switcher changes.
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

      <div className="mt-[20px] grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {investigations.map((investigation) => (
          <InvestigationCard
            key={investigation.id}
            investigation={investigation}
          />
        ))}
      </div>
    </section>
  );
}
