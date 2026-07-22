import type { ComponentType } from "react";

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
 * One rendered chunk of the raw alert shown in the Evidence phase. The block
 * dispatcher renders each `kind`; adding a kind is a deliberate engine change.
 */
export type EvidenceBlock =
  | { kind: "summary"; time: string; source: string; message: string }
  | { kind: "kv"; title: string; rows: { label: string; value: string }[] }
  | { kind: "code"; title: string; body: string }
  | { kind: "urls"; title: string; items: string[] }
  | { kind: "note"; title: string; body: string };

/**
 * The Evidence payload. Most alerts are a list of typed blocks the engine
 * renders directly; the `component` escape hatch (ADR-0004) is for evidence
 * whose shape is genuinely bespoke, such as a rendered phishing email.
 */
export type EvidenceModel =
  | { blocks: EvidenceBlock[] }
  | { component: () => Promise<{ default: ComponentType }> };

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
