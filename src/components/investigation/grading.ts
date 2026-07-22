import type {
  Aspect,
  Disposition,
  Investigation,
  InvestigationResult,
  IocField,
} from "./types";

/**
 * Pure grading logic for the Investigation engine. Everything here is a plain
 * function of the alert data plus the learner's answers, so the phase components
 * stay presentational and the whole scoring model is unit-testable in isolation.
 */

/**
 * Reduce a learner's raw indicator input to a canonical form before matching it
 * against the accepted answers. Trimming and lower-casing apply to every kind;
 * URLs and domains additionally drop a leading scheme and any trailing slash so
 * "https://Evil.example/" and "evil.example" compare equal.
 */
export function normalizeIoc(
  value: string,
  kind: IocField["normalize"],
): string {
  const base = value.trim().toLowerCase();
  if (kind === "url" || kind === "domain") {
    return base.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
  return base;
}

/** Whether one Extract field's answer is acceptable, ignoring formatting. */
export function isExtractFieldCorrect(field: IocField, value: string): boolean {
  const got = normalizeIoc(value, field.normalize);
  if (got.length === 0) return false;
  return field.accept.some(
    (accepted) => normalizeIoc(accepted, field.normalize) === got,
  );
}

export interface IdentifyGrade {
  /** Signal rows the learner correctly selected. */
  hits: number;
  /** Signal rows the learner missed. */
  misses: number;
  /** Decoy rows the learner wrongly selected. */
  falsePositives: number;
  totalSignals: number;
  totalDecoys: number;
  /** Fraction of all rows classified correctly, 0-1. */
  score: number;
}

/** Grade the Identify phase as classification accuracy over every checklist row. */
export function gradeIdentify(
  aspects: Aspect[],
  selected: ReadonlySet<string>,
): IdentifyGrade {
  const signals = aspects.filter((a) => a.signal);
  const decoys = aspects.filter((a) => !a.signal);
  const hits = signals.filter((a) => selected.has(a.id)).length;
  const falsePositives = decoys.filter((a) => selected.has(a.id)).length;
  const correctRows = hits + (decoys.length - falsePositives);
  const score = aspects.length === 0 ? 1 : correctRows / aspects.length;
  return {
    hits,
    misses: signals.length - hits,
    falsePositives,
    totalSignals: signals.length,
    totalDecoys: decoys.length,
    score,
  };
}

export interface JustifyGrade {
  correct: number;
  total: number;
  /** Fraction of reasoning questions answered correctly, 0-1. */
  score: number;
}

/**
 * Grade the Justify phase across all signal aspects that carry a reasoning
 * question, regardless of whether the learner selected them in Identify.
 * `answers` maps an aspect id to the chosen option index.
 */
export function gradeJustify(
  aspects: Aspect[],
  answers: Record<string, number>,
): JustifyGrade {
  const questions = aspects.filter((a) => a.signal && a.reasoning);
  const correct = questions.filter(
    (a) => answers[a.id] === a.reasoning?.correct,
  ).length;
  const total = questions.length;
  const score = total === 0 ? 1 : correct / total;
  return { correct, total, score };
}

export interface ExtractGrade {
  correct: number;
  total: number;
  /** Fraction of indicator fields answered acceptably, 0-1. */
  score: number;
}

/** Grade the Extract phase field by field with tolerant matching. */
export function gradeExtract(
  fields: IocField[],
  values: Record<string, string>,
): ExtractGrade {
  const correct = fields.filter((field) =>
    isExtractFieldCorrect(field, values[field.id] ?? ""),
  ).length;
  const total = fields.length;
  const score = total === 0 ? 1 : correct / total;
  return { correct, total, score };
}

export interface InvestigationGrade {
  identify: IdentifyGrade;
  justify: JustifyGrade;
  extract: ExtractGrade;
  correctCall: boolean;
  /** 0-100 composite of the three graded phases (Verdict is pass/fail, not scored). */
  quality: number;
}

export interface InvestigationAnswers {
  selected: ReadonlySet<string>;
  justify: Record<string, number>;
  extract: Record<string, string>;
  disposition: Disposition;
}

/**
 * Compose the full grade for an attempt. Quality is the mean of the three graded
 * phases, dropping any phase that has no items so an alert with, say, no IOCs to
 * extract is not penalized. The Verdict is reported separately as the headline
 * correct/wrong call.
 */
export function gradeInvestigation(
  investigation: Investigation,
  answers: InvestigationAnswers,
): InvestigationGrade {
  const identify = gradeIdentify(investigation.aspects, answers.selected);
  const justify = gradeJustify(investigation.aspects, answers.justify);
  const extract = gradeExtract(investigation.extract, answers.extract);

  const parts: number[] = [identify.score];
  if (justify.total > 0) parts.push(justify.score);
  if (extract.total > 0) parts.push(extract.score);
  const quality = Math.round(
    (parts.reduce((sum, p) => sum + p, 0) / parts.length) * 100,
  );

  return {
    identify,
    justify,
    extract,
    correctCall: answers.disposition === investigation.verdict.correct,
    quality,
  };
}

/** Reduce a full grade to the persisted per-Investigation result. */
export function toResult(grade: InvestigationGrade): InvestigationResult {
  return {
    completed: true,
    correctCall: grade.correctCall,
    quality: grade.quality,
  };
}
