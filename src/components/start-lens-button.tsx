"use client";

import Link from "next/link";
import { useProvider } from "@/components/provider-context";
import { PROVIDER_LABELS } from "@/content/types";

/**
 * Home hero CTA: sends the learner into the browse view for the active lens.
 * Provider-aware so its label tracks the top-bar switcher.
 */
export function StartLensButton() {
  const { provider } = useProvider();

  return (
    <Link
      href={`/${provider}`}
      className="inline-flex items-center gap-[8px] rounded-[12px] bg-primary px-[22px] py-[14px] text-[15px] font-semibold text-primary-foreground shadow-[0_1px_2px_oklch(0.4_0.06_195_/_0.3)] transition-colors hover:bg-[color-mix(in_oklab,var(--primary),black_8%)]"
    >
      Start with the {PROVIDER_LABELS[provider]} lens
      <span className="font-mono">→</span>
    </Link>
  );
}
