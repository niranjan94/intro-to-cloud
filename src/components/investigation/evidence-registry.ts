import { type ComponentType, type LazyExoticComponent, lazy } from "react";

/**
 * The escape-hatch registry for bespoke Evidence views (ADR-0004). An
 * Investigation whose raw evidence does not fit the typed blocks (a rendered
 * phishing email, for example) sets `evidence.componentKey` to one of these
 * keys, and the Evidence phase mounts the matching component lazily. Keeping the
 * mapping here (rather than a loader function inside the data) is what lets an
 * Investigation stay serializable across the server/client boundary.
 */
export const EVIDENCE_COMPONENTS: Record<
  string,
  LazyExoticComponent<ComponentType>
> = {
  "entra-inbox-forwarding": lazy(
    () => import("@/content/investigations/entra-inbox-forwarding/evidence"),
  ),
};
