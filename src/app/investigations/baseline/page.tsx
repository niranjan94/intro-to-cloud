import Baseline from "@/content/investigations/baseline/baseline";

/**
 * The Baseline route: a fixed, read-only sample environment baseline for the
 * fictional organization the exercises use. Reference material, not graded. Like
 * the Orientation primer, this static segment resolves ahead of the sibling
 * `[investigation]` dynamic route, and no Investigation id is `baseline`, so the
 * two never collide.
 */
export default function BaselinePage() {
  return <Baseline />;
}
