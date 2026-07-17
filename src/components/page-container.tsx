import { cn } from "@/lib/utils";

/**
 * Editorial max-width container (DESIGN.md § Layout — 1200px page max-width),
 * left-aligned with comfortable horizontal padding.
 */
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--page-max-width)] px-24 py-32",
        className,
      )}
    >
      {children}
    </div>
  );
}
