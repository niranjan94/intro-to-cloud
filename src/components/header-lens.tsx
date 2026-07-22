"use client";

import { usePathname } from "next/navigation";
import { ProviderSwitcher } from "@/components/provider-switcher";

/**
 * The right-hand lens control in the top bar: the "Viewing through" label and
 * the provider switcher. Hidden on Investigations routes, which sit outside the
 * provider lens (ADR-0004); showing a lens control there would imply it applies
 * to the alert queue, which it does not.
 */
export function HeaderLens() {
  const pathname = usePathname();
  if (pathname?.startsWith("/investigations")) return null;

  return (
    <div className="flex items-center gap-[14px]">
      <span className="hidden text-[12px] font-medium text-ink-muted min-[900px]:inline">
        Viewing through
      </span>
      <ProviderSwitcher />
    </div>
  );
}
