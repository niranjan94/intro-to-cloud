import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { isProvider } from "@/lib/provider";

/**
 * Provider-scoped shell: the concept sidebar alongside the page content, capped
 * to the wide shell width. Validates the provider segment here so every nested
 * route is guarded.
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
    <div className="mx-auto flex w-full max-w-[var(--shell-max-width)] flex-1 items-stretch">
      <Sidebar provider={provider} />
      <main className="min-w-0 flex-1 pb-[90px]">{children}</main>
    </div>
  );
}
