"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SectionLabel } from "@/components/section-label";
import { conceptsByCategory } from "@/content/registry";
import type { Provider } from "@/content/types";
import { cn } from "@/lib/utils";

const groups = conceptsByCategory();

/**
 * Concepts grouped by Category with the current concept highlighted. Category
 * labels use the micro-label treatment (• CATEGORY). Links stay within the
 * active provider so switching concepts preserves the lens.
 */
export function Sidebar({ provider }: { provider: Provider }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Concepts"
      className="flex w-full flex-col gap-32 md:w-[240px]"
    >
      {groups.map((group) => (
        <div key={group.category} className="flex flex-col gap-8">
          <SectionLabel className="px-12">{group.category}</SectionLabel>
          <ul className="flex flex-col gap-4">
            {group.concepts.map((concept) => {
              const href = `/${provider}/${concept.id}`;
              const isActive = pathname === href;
              return (
                <li key={concept.id}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-list-items px-12 py-8 text-body-sm transition-colors",
                      isActive
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-slate-gray hover:bg-bone hover:text-ink-black",
                    )}
                  >
                    {concept.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
