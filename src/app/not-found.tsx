import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col items-start justify-center gap-[16px] px-[28px] py-[80px]">
      <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-faint">
        404
      </div>
      <h1 className="text-[38px] font-extrabold tracking-[-0.03em] text-ink">
        This page doesn&rsquo;t exist.
      </h1>
      <p className="max-w-[52ch] text-[16px] leading-[1.55] text-body-soft">
        The provider or concept you asked for isn&rsquo;t here. Providers are
        lenses; the concepts are the constant.
      </p>
      <Link
        href="/"
        className="mt-[8px] inline-flex items-center gap-[8px] rounded-[12px] bg-primary px-[22px] py-[14px] text-[15px] font-semibold text-primary-foreground shadow-[0_1px_2px_oklch(0.4_0.06_195_/_0.3)]"
      >
        Back to home
        <ArrowRight size={16} weight="bold" aria-hidden />
      </Link>
    </main>
  );
}
