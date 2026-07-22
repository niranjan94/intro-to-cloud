import Link from "next/link";
import { HeaderLens } from "@/components/header-lens";
import { HeaderNav } from "@/components/header-nav";

/**
 * Global top bar: a small "two lenses" mark + INTRO/CLOUD wordmark on the left,
 * the provider lens switcher on the right. Sticky and translucent so content
 * scrolls beneath it. Full-bleed; the concept sidebar lives in the provider
 * layout, keeping the home page nav-light.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[oklch(0.985_0.006_95_/_0.82)] backdrop-blur-[12px]">
      <div className="flex items-center justify-between gap-[12px] px-[16px] py-[14px] min-[560px]:gap-4 min-[560px]:px-[28px]">
        <div className="flex items-center gap-[14px] min-[560px]:gap-[22px]">
          <Link
            href="/"
            aria-label="Intro to Cloud home"
            className="flex items-center gap-[10px]"
          >
            <span
              aria-hidden
              className="relative inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] bg-teal-soft"
            >
              <span className="absolute left-[5px] h-[9px] w-[9px] rounded-full bg-teal-ring" />
              <span className="absolute right-[5px] h-[9px] w-[9px] rounded-full bg-[oklch(0.62_0.09_155)] mix-blend-multiply" />
            </span>
            <span className="hidden font-mono text-[15px] font-semibold tracking-[-0.01em] text-ink-soft min-[560px]:inline">
              INTRO<span className="text-teal-ring">/</span>CLOUD
            </span>
          </Link>
          <HeaderNav />
        </div>

        <HeaderLens />
      </div>
    </header>
  );
}
