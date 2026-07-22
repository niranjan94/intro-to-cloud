"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProvider } from "@/components/provider-context";
import { cn } from "@/lib/utils";

/**
 * The top-bar section nav: the two peer modes of the app, Concepts (the
 * provider-lensed learning path) and Investigations (the assessed SOC triage).
 * Concepts points at the active provider's overview so the link keeps the lens;
 * the current section is highlighted. Client-side because it reads the active
 * provider and the current path.
 */
export function HeaderNav() {
  const { provider } = useProvider();
  const pathname = usePathname();

  const onInvestigations = pathname.startsWith("/investigations");
  const onConcepts = !onInvestigations && pathname !== "/";

  return (
    <nav className="flex items-center gap-[14px] min-[560px]:gap-[18px]">
      <HeaderLink href={`/${provider}`} active={onConcepts}>
        Concepts
      </HeaderLink>
      <HeaderLink href="/investigations" active={onInvestigations}>
        Investigations
      </HeaderLink>
    </nav>
  );
}

function HeaderLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-[13px] font-medium transition-colors hover:text-ink-strong",
        active ? "text-ink-strong" : "text-ink-muted",
      )}
    >
      {children}
    </Link>
  );
}
