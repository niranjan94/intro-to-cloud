import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Button variants mapped to DESIGN.md § Components:
 * - primary → "Primary Pill Button": burnt-amber fill, white text, 1000px radius.
 * - outline → "Outlined Action Button": transparent, 1px hairline, 100px radius.
 * - ghost   → "Ghost Text Link": no chrome, underline on hover.
 * Flat by design: no box-shadow (DESIGN.md Do's & Don'ts).
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-8 whitespace-nowrap font-medium transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-white disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-16",
  {
    variants: {
      variant: {
        primary:
          "rounded-buttons bg-primary px-24 py-16 text-body-sm text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),black_12%)]",
        outline:
          "rounded-pills border border-ink-black bg-transparent px-20 py-12 text-caption text-ink-black hover:bg-bone",
        ghost:
          "px-0 py-0 text-body-sm font-normal text-ink-black underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

function Button({
  className,
  variant = "primary",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
