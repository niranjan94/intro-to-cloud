import type {
  Difficulty,
  Investigation,
  Severity,
  SourcePlatform,
} from "@/components/investigation/types";
import { SOURCE_PLATFORMS } from "@/components/investigation/types";

/**
 * The Investigation catalog: lightweight queue metadata split from the full,
 * lazily-loaded Investigation data (mirrors `registry.ts`). The queue page and
 * navigation read only this metadata, so opening the queue never bundles every
 * answer key; the full `Investigation` for a given id is fetched on demand when
 * its page renders.
 *
 * Array order is the suggested attempt order. Each entry is hand-authored and
 * anchored to a real catalog event type, with all instance data fictional
 * (ADR-0005).
 */
export interface InvestigationMeta {
  id: string;
  title: string;
  /** One-line queue description, neutral and spoiler-free. */
  short: string;
  sourcePlatform: SourcePlatform;
  difficulty: Difficulty;
  severity: Severity;
  /** The anchored catalog event type, shown as the alert's rule name. */
  eventType: string;
  mitre?: string;
  /** Lazily loads the full Investigation payload. */
  data: () => Promise<{ default: Investigation }>;
}

export const investigations: readonly InvestigationMeta[] = [
  // Entries are registered as each Investigation's data module is authored.
];

/** Look up an Investigation's metadata by id. */
export function getInvestigation(id: string): InvestigationMeta | undefined {
  return investigations.find((investigation) => investigation.id === id);
}

/** A source platform paired with its Investigations, in catalog order. */
export interface PlatformGroup {
  platform: SourcePlatform;
  items: InvestigationMeta[];
}

/** Group Investigations by source platform for the queue and sidebar. */
export function investigationsByPlatform(): PlatformGroup[] {
  return SOURCE_PLATFORMS.map((platform) => ({
    platform,
    items: investigations.filter(
      (investigation) => investigation.sourcePlatform === platform,
    ),
  })).filter((group) => group.items.length > 0);
}
