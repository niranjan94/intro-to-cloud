"use client";

import { ConceptNavList } from "@/components/concept-nav-list";
import type { Provider } from "@/content/types";

/**
 * The desktop concept sidebar: a sticky, scrollable rail alongside the lesson
 * content, holding the full stage-grouped concept navigation. Hidden below
 * 760px, where {@link MobileConceptNav} takes over with a drawer.
 */
export function Sidebar({ provider }: { provider: Provider }) {
  return (
    <aside className="sticky top-[var(--topbar-height)] hidden h-[calc(100vh-var(--topbar-height))] w-[264px] shrink-0 self-start overflow-auto border-r border-line px-[16px] pb-[40px] pt-[26px] min-[760px]:block max-[1000px]:w-[208px]">
      <ConceptNavList provider={provider} />
    </aside>
  );
}
