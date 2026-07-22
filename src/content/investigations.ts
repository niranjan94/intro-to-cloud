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

/**
 * The queue metadata without the lazy `data` loader. A loader is a function and
 * therefore not serializable, so this is the shape a Server Component passes to
 * a client card across the RSC boundary. Use {@link toQueueItem} to drop it.
 */
export type InvestigationQueueItem = Omit<InvestigationMeta, "data">;

/** Strip the (non-serializable) loader so metadata can cross to a Client Component. */
export function toQueueItem(meta: InvestigationMeta): InvestigationQueueItem {
  const { data: _data, ...item } = meta;
  return item;
}

export const investigations: readonly InvestigationMeta[] = [
  {
    id: "aws-root-login",
    title: "Root account sign-in",
    short:
      "A root console login lands on the desk. Authorized change, or takeover?",
    sourcePlatform: "aws",
    difficulty: "guided",
    severity: "critical",
    eventType: "Root Account Login",
    mitre: "Valid Accounts (T1078)",
    data: () => import("./investigations/aws-root-login/data"),
  },
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
