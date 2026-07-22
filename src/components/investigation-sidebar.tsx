import { InvestigationNavList } from "@/components/investigation-nav-list";

/**
 * The desktop Investigations sidebar: a sticky, scrollable rail alongside the
 * content holding the platform-grouped alert queue. Hidden below 760px, where
 * {@link MobileInvestigationNav} takes over with a drawer. Mirrors {@link Sidebar}
 * but carries no provider (Investigations sit outside the lens).
 */
export function InvestigationSidebar() {
  return (
    <aside className="sticky top-[var(--topbar-height)] hidden h-[calc(100vh-var(--topbar-height))] w-[264px] shrink-0 self-start overflow-auto border-r border-line px-[16px] pb-[40px] pt-[26px] min-[760px]:block max-[1000px]:w-[208px]">
      <InvestigationNavList />
    </aside>
  );
}
