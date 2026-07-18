"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ListIcon as List, XIcon as X } from "@phosphor-icons/react/dist/ssr";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConceptNavList } from "@/components/concept-nav-list";
import type { Provider } from "@/content/types";

/**
 * The mobile counterpart to {@link Sidebar}: below 760px the sticky sidebar is
 * hidden, so concept-to-concept navigation would otherwise be unreachable inside
 * a lesson. This renders a sticky "Concepts" trigger under the top bar that opens
 * the same stage-grouped navigation in a left drawer (Base UI Dialog: focus trap,
 * Escape-to-close, scroll lock). The drawer closes on selection and on any route
 * change.
 */
export function MobileConceptNav({ provider }: { provider: Provider }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after the route settles, covering both concept selection and back/forward.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is a trigger, not a value read inside the effect — the drawer must close whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="sticky top-[var(--topbar-height)] z-40 border-b border-line bg-[oklch(0.985_0.006_95_/_0.82)] backdrop-blur-[12px] min-[760px]:hidden">
        <Dialog.Trigger className="flex min-h-[44px] items-center gap-[9px] px-[20px] font-mono text-[12.5px] font-medium text-ink-strong">
          <List size={16} weight="bold" aria-hidden />
          Concepts
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[oklch(0.22_0.02_230_/_0.38)]" />
        <Dialog.Popup
          aria-label="Concepts"
          className="fixed left-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col overflow-auto border-r border-line bg-canvas px-[16px] pb-[40px] pt-[14px] shadow-[0_12px_48px_oklch(0.2_0.02_230_/_0.22)]"
        >
          <div className="mb-[6px] flex items-center justify-end">
            <Dialog.Close
              aria-label="Close concepts menu"
              className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] text-ink-muted transition-colors hover:bg-surface-muted"
            >
              <X size={16} weight="bold" aria-hidden />
            </Dialog.Close>
          </div>
          <ConceptNavList
            provider={provider}
            onNavigate={() => setOpen(false)}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
