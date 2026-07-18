"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WipBadge } from "@/components/wip-badge";
import { conceptsByStage } from "@/content/registry";
import { type Provider, STAGE_META } from "@/content/types";
import { cn } from "@/lib/utils";

const groups = conceptsByStage();

/**
 * The grouped concept navigation shared by the desktop sidebar and the mobile
 * drawer: every concept grouped by learning stage, each row showing its title
 * and the active provider's service name, with the concept in the current URL
 * highlighted by a teal rail. Links stay within the active provider so browsing
 * concepts keeps the lens. `onNavigate` lets the mobile drawer close itself when
 * a concept is chosen.
 */
export function ConceptNavList({
  provider,
  onNavigate,
}: {
  provider: Provider;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Concepts">
      <div className="px-[10px] pb-[4px] font-mono text-[11px] tracking-[0.1em] text-faint">
        CONCEPTS
      </div>
      {groups.map((group, groupIndex) => (
        <div key={group.stage} className="mt-[20px]">
          <div className="flex items-center gap-[8px] px-[10px] py-[4px]">
            <span
              aria-hidden
              className="inline-block h-[9px] w-[9px] shrink-0 rounded-[3px]"
              style={{ background: STAGE_META[group.stage].accent }}
            />
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
              <span className="text-faint">{groupIndex + 1}. </span>
              {group.stage}
            </span>
          </div>
          {group.concepts.map((concept) => {
            const href = `/${provider}/${concept.id}`;
            const active = pathname === href;
            return (
              <Link
                key={concept.id}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex w-full items-center gap-[10px] rounded-[10px] py-[9px] pl-[14px] pr-[10px] transition-colors",
                  active ? "bg-teal-soft" : "hover:bg-[oklch(0.96_0.012_195)]",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute bottom-[8px] left-[4px] top-[8px] w-[3px] rounded-[2px] bg-teal-ring"
                  />
                ) : null}
                <span className="flex min-w-0 flex-col items-start gap-[1px]">
                  <span className="flex items-center gap-[7px]">
                    <span className="text-[13.5px] font-medium text-ink-strong">
                      {concept.title}
                    </span>
                    {concept.wip ? <WipBadge /> : null}
                  </span>
                  <span className="max-w-[180px] truncate font-mono text-[11px] text-teal">
                    {concept.services[provider]}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
