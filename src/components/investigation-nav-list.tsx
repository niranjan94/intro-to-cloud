"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DifficultyBadge,
  SeverityBadge,
} from "@/components/investigation/badges";
import { SOURCE_PLATFORM_LABELS } from "@/components/investigation/types";
import { investigationsByPlatform } from "@/content/investigations";
import { cn } from "@/lib/utils";

const groups = investigationsByPlatform();

/**
 * The grouped Investigation navigation shared by the desktop sidebar and the
 * mobile drawer: every Investigation grouped by its source platform, each row
 * showing its title, severity, and difficulty, with the one in the current URL
 * highlighted by a teal rail. Unlike the concept nav this carries no provider in
 * its links (Investigations sit outside the provider lens, ADR-0004).
 * `onNavigate` lets the mobile drawer close itself when one is chosen.
 */
export function InvestigationNavList({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Investigations">
      <div className="px-[10px] pb-[4px] font-mono text-[11px] tracking-[0.1em] text-faint">
        ALERT QUEUE
      </div>
      {groups.map((group) => (
        <div key={group.platform} className="mt-[20px]">
          <div className="flex items-center gap-[8px] px-[10px] py-[4px]">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
              {SOURCE_PLATFORM_LABELS[group.platform]}
            </span>
          </div>
          {group.items.map((investigation) => {
            const href = `/investigations/${investigation.id}`;
            const active = pathname === href;
            return (
              <Link
                key={investigation.id}
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
                <span className="flex min-w-0 flex-col items-start gap-[4px]">
                  <span className="text-[13.5px] font-medium text-ink-strong">
                    {investigation.title}
                  </span>
                  <span className="flex items-center gap-[5px]">
                    <SeverityBadge severity={investigation.severity} />
                    <DifficultyBadge difficulty={investigation.difficulty} />
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
