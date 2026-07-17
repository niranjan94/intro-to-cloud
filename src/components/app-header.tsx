import Link from "next/link";
import { ProviderSwitcher } from "@/components/provider-switcher";

/**
 * Global top bar: INTRO/CLOUD wordmark (all-caps, tight tracking) on the left,
 * provider switcher on the right. Present on every page; the concept sidebar
 * lives in the provider layout, not here (home stays nav-light).
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-paper-white">
      <div className="mx-auto flex h-64 w-full max-w-[var(--page-max-width)] items-center justify-between px-24">
        <Link
          href="/"
          className="text-body-sm font-medium uppercase tracking-[-0.01em] text-ink-black"
        >
          Intro<span className="text-mist-gray">/</span>Cloud
        </Link>
        <ProviderSwitcher />
      </div>
    </header>
  );
}
