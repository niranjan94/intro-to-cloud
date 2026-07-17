/**
 * Global footer: the wordmark restated as a quiet colophon plus the product's
 * one-line thesis. Full-bleed to match the top bar.
 */
export function AppFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[28px] py-[22px]">
      <span className="font-mono text-[11.5px] text-faint">
        INTRO<span className="text-teal">/</span>CLOUD · open source ·
        concept-first cloud learning
      </span>
      <span className="text-[11.5px] text-[oklch(0.6_0.015_230)]">
        Providers are lenses. The concepts are the constant.
      </span>
    </footer>
  );
}
