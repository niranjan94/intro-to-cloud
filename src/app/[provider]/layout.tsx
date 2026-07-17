import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { isProvider } from "@/lib/provider";

/**
 * Provider-scoped shell: hosts the concept sidebar alongside the page content.
 * Validates the provider segment here so every nested route is guarded.
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
    <div className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-col gap-32 px-24 py-32 md:flex-row md:gap-48">
      <Sidebar provider={provider} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
