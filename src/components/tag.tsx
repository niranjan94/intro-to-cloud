import { cn } from "@/lib/utils";

/**
 * "Status Tag Pill" — 100px radius, burnt-amber hairline border, no fill.
 * Text matches the border (burnt amber), the signature warm accent
 * (DESIGN.md § Components → Status Tag Pill).
 */
export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-tags border border-burnt-amber bg-paper-white px-12 py-4 text-caption font-medium text-burnt-amber",
        className,
      )}
    >
      {children}
    </span>
  );
}
