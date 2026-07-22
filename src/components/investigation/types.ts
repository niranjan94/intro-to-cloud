/**
 * The Investigation domain model. Investigations are an assessed, data-driven
 * content type (ADR-0004): every one runs the identical five-phase flow
 * (Evidence -> Identify -> Justify -> Extract -> Verdict) and differs only in
 * the data below. The shared engine in this folder renders and grades from this
 * contract, so authoring a new Investigation is writing a typed data module, not
 * a component. All instance data is hand-authored and fictional (ADR-0005).
 */

/**
 * The system an Investigation's alert originates from. This is the axis that
 * organizes Investigations, independent of the AWS/Azure teaching Provider: it
 * includes identity and operating-system sources the two-Provider axis excludes.
 */
export type SourcePlatform = "aws" | "azure" | "entra" | "linux";

/** All source platforms, in display order. */
export const SOURCE_PLATFORMS: readonly SourcePlatform[] = [
  "aws",
  "azure",
  "entra",
  "linux",
] as const;

/** Human-readable source-platform labels for UI. */
export const SOURCE_PLATFORM_LABELS: Record<SourcePlatform, string> = {
  aws: "AWS",
  azure: "Azure",
  entra: "Entra ID",
  linux: "Linux",
};

/** The pre-assigned severity of the anchored alert. Not part of the graded Verdict. */
export type Severity = "critical" | "high" | "medium" | "low" | "info";

/** All severities, from most to least urgent. */
export const SEVERITIES: readonly Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
] as const;

/**
 * The scaffolding tier of an Investigation. Sets suggested order and drives a
 * filter; Guided reveals extra help (the true-signal count and per-row hints).
 * It never gates access.
 */
export type Difficulty = "guided" | "standard" | "challenge";

/** The learner's terminal call on an alert. */
export type Disposition = "escalate" | "close";

/** A single Identify checklist row: a candidate suspicious aspect of the alert. */
export interface Aspect {
  id: string;
  /** The claim shown in the checklist (e.g. "Login came from an unusual region"). */
  label: string;
  /** true = a real signal the learner should select; false = a plausible decoy. */
  signal: boolean;
  /**
   * The Justify reasoning question for this aspect. Present on signal rows so the
   * learner explains WHY it matters; graded against `correct`.
   */
  reasoning?: {
    prompt: string;
    options: string[];
    /** Index into `options` of the correct reasoning. */
    correct: number;
  };
  /** Corrective feedback shown for a decoy picked, or a signal missed. */
  note?: string;
}

/** A single Extract input: an indicator of compromise the learner must record. */
export interface IocField {
  id: string;
  label: string;
  hint?: string;
  /** Acceptable answers, compared after normalization. */
  accept: string[];
  /** How to normalize the learner's input before matching against `accept`. */
  normalize: "domain" | "ip" | "url" | "text";
}

/**
 * The automated disposition a signal carries before a human reviews it, mirroring
 * the real console's assessment/triage verdict. `investigating` is the untriaged
 * state (no verdict yet), which is how the overwhelming majority of real signals
 * arrive.
 */
export type SignalDisposition =
  | "investigating"
  | "informational"
  | "benign"
  | "suspicious"
  | "true_positive";

/**
 * The automated pre-triage strip shown above a signal, mirroring the console's
 * triage hero. Most signals arrive untriaged (source "fallback", disposition
 * "investigating", confidence 0), the realistic and non-spoiler default for an
 * exercise: the pipeline attached the catalog severity and routed the alert to an
 * analyst without a verdict. A case built around a wrong automated call instead
 * sets a real disposition and confidence so the learner can overturn it.
 */
export interface SignalTriage {
  source: "fallback" | "rule" | "stateful" | "llm" | "cache";
  disposition: SignalDisposition;
  /** 0-100; 0 when untriaged. */
  confidence: number;
  /** A short, non-spoiler line describing the automated state. */
  note: string;
}

/** A single label/value fact in a signal section. */
export interface SignalFact {
  label: string;
  value: string;
  /** Render full width for long values (ARNs, resource keys, URLs). */
  wide?: boolean;
}

/**
 * One grouped card of facts, mirroring the console's Evidence / Threat intel /
 * Details cards. `chips` render above the rows and are used for MITRE ATT&CK
 * tags; `rows` are the key/value facts.
 */
export interface SignalSection {
  heading: string;
  chips?: string[];
  rows: SignalFact[];
}

/**
 * A signal rendered the way the real console shows one: a titled header carrying
 * the detector's own description, the automated pre-triage state, grouped fact
 * sections, the raw OCSF payload, and any notable `unmapped` enrichment surfaced
 * above the raw dump. Field sourcing mirrors the console's three-way split (flat
 * metadata, OCSF `payload`, and enrichment that rides in `unmapped`). This is the
 * shape the Evidence phase reads for all but the bespoke-evidence Investigations.
 */
export interface SignalEvidence {
  /** Alert title, sentence case, no verdict (mirrors the finding title). */
  title: string;
  /** The detection source, shown as a kicker (e.g. "Inspector", "CloudTrail"). */
  source: string;
  /** When the signal fired. */
  time: string;
  /** The detector's own description of what it observed. Neutral, not a verdict. */
  description: string;
  triage?: SignalTriage;
  /** Grouped fact sections, in display order (Evidence, Threat intel, Details). */
  sections: SignalSection[];
  /** The raw OCSF payload, pretty-printed. */
  raw: string;
  /**
   * Notable `unmapped` fields surfaced above the raw dump. Enrichment (CVE, EPSS,
   * KEV, exploit availability) frequently lives here rather than in the normalized
   * OCSF fields, so it is worth calling out explicitly.
   */
  unmapped?: SignalFact[];
}

/**
 * The Evidence payload. Most alerts are a structured `signal` the engine renders
 * as a console-style detail view; the `componentKey` escape hatch (ADR-0004) is
 * for evidence whose shape is genuinely bespoke, such as a rendered phishing
 * email. The key resolves to a lazily-loaded component in the client-side
 * registry in `phases/evidence.tsx`. It is a string (not a loader function) so an
 * Investigation stays fully serializable and can cross the server/client
 * boundary as a prop.
 */
export type EvidenceModel =
  | { signal: SignalEvidence }
  | { componentKey: string };

/** A complete, self-contained Investigation. */
export interface Investigation {
  id: string;
  title: string;
  /** One-line queue description, neutral and spoiler-free. */
  short: string;
  sourcePlatform: SourcePlatform;
  difficulty: Difficulty;
  /** Pre-assigned by the anchored rule. Shown, never graded. */
  severity: Severity;
  /** The anchored catalog event type, e.g. "Root Account Login". */
  eventType: string;
  /** MITRE ATT&CK mapping of the anchored event, e.g. "Valid Accounts (T1078)". */
  mitre?: string;
  /** Where the anchored event is detected, e.g. "CloudTrail". */
  detectionSource?: string;
  evidence: EvidenceModel;
  /** The Identify checklist (and, for signal rows, the Justify questions). */
  aspects: Aspect[];
  /** The indicators the learner extracts in the Extract phase. */
  extract: IocField[];
  /** The correct disposition and the explanation revealed after the call. */
  verdict: { correct: Disposition; why: string };
}

/**
 * The persisted outcome of an attempt, kept per Investigation id in
 * localStorage. `quality` is the best (highest) score achieved among
 * correct-call attempts; see `src/lib/investigations.ts`.
 */
export interface InvestigationResult {
  completed: boolean;
  /** Whether the learner's Verdict matched the correct disposition. */
  correctCall: boolean;
  /** 0-100, composed from Identify + Justify + Extract performance. */
  quality: number;
}
