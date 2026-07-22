import { InvestigationSidebar } from "@/components/investigation-sidebar";
import { MobileInvestigationNav } from "@/components/mobile-investigation-nav";

/**
 * The Investigations shell: the platform-grouped alert-queue sidebar alongside
 * the page content. Parallel to the provider layout, but with no provider
 * segment to validate, since Investigations live outside the provider lens
 * (ADR-0004). The global header, footer, and provider switcher come from the
 * root layout; the switcher is inert here.
 */
export default function InvestigationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MobileInvestigationNav />
      <div className="flex w-full flex-1 items-stretch">
        <InvestigationSidebar />
        <main className="min-w-0 flex-1 pb-[90px]">{children}</main>
      </div>
    </>
  );
}
