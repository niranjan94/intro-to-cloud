import { cn } from "@/lib/utils";

/**
 * "Step Section Header" micro-label — the primary wayfinding device.
 * Bullet-prefixed, uppercase 12px, tight tracking (DESIGN.md § Components).
 */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-6 text-micro font-medium uppercase tracking-[0.04em] text-ink-black",
        className,
      )}
    >
      <span aria-hidden="true" className="text-mist-gray">
        &bull;
      </span>
      <span>{children}</span>
    </p>
  );
}
