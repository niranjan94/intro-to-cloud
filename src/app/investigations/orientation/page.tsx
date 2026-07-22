import Orientation from "@/content/investigations/orientation/orientation";

/**
 * The Primer route: an expository orientation to the SOC analyst's job that
 * prepares a learner for the alert queue (ADR-0006). A single static page. This
 * static segment resolves ahead of the sibling `[investigation]` dynamic route,
 * and no Investigation id is `orientation`, so the two never collide.
 */
export default function OrientationPage() {
  return <Orientation />;
}
