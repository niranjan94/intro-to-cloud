import { notFound } from "next/navigation";
import { MobileConceptNav } from "@/components/mobile-concept-nav";
import { Sidebar } from "@/components/sidebar";
import { isProvider } from "@/lib/provider";

/**
 * Provider-scoped shell: the concept sidebar alongside the page content, which
 * spans the full viewport width. Validates the provider segment here so every
 * nested route is guarded.
 */
export default async function ProviderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;
  if (!isProvider(provider)) notFound();

  return (
    <>
      <MobileConceptNav provider={provider} />
      <div className="flex w-full flex-1 items-stretch">
        <Sidebar provider={provider} />
        <main className="min-w-0 flex-1 pb-[90px]">{children}</main>
      </div>
    </>
  );
}
