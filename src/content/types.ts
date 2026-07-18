import type { ComponentType } from "react";

/** A cloud vendor the learner can choose between. */
export type Provider = "aws" | "azure";

/** All supported providers, in display order. */
export const PROVIDERS: readonly Provider[] = ["aws", "azure"] as const;

/** Human-readable provider labels for UI. */
export const PROVIDER_LABELS: Record<Provider, string> = {
  aws: "AWS",
  azure: "Azure",
};

/** Brand color for each provider — used ONLY for small identity dots. */
export const PROVIDER_BRAND: Record<Provider, string> = {
  aws: "var(--color-aws)",
  azure: "var(--color-azure)",
};

/**
 * A stage in the learning path. Concepts are grouped by stage so the catalog
 * reads as an order to follow rather than a tech taxonomy — you build the
 * foundations, then store data, then make it reachable, then go deeper.
 * Provider-agnostic.
 */
export type Stage =
  | "Foundations"
  | "Storing data"
  | "Reaching users"
  | "Going further";

/**
 * Stage display order for the sidebar and overview grids. This IS the learning
 * order — each stage assumes the ones before it.
 */
export const STAGES: readonly Stage[] = [
  "Foundations",
  "Storing data",
  "Reaching users",
  "Going further",
] as const;

/**
 * Per-stage presentation metadata. `accent` is a CSS custom property that
 * resolves to the stage's wayfinding-dot color (see globals.css).
 */
export const STAGE_META: Record<Stage, { accent: string }> = {
  Foundations: { accent: "var(--color-stage-foundations)" },
  "Storing data": { accent: "var(--color-stage-storing)" },
  "Reaching users": { accent: "var(--color-stage-reaching)" },
  "Going further": { accent: "var(--color-stage-further)" },
};

/**
 * A single Provider's concrete realization of a Concept — e.g. the AWS lens on
 * Object Storage is Amazon S3; the Azure lens is Azure Blob Storage.
 */
export interface Lens {
  provider: Provider;
  /** The named provider Service this lens points at (e.g. "Amazon S3"). */
  service: string;
}

/** Lazily imports a Concept's React component for one Provider. */
export type ConceptComponentLoader = () => Promise<{ default: ComponentType }>;

/**
 * A provider-agnostic cloud idea the app teaches. Metadata is kept lightweight
 * (nav + card copy) and split from the per-provider lesson components, which
 * are lazy-loaded and free to be fully bespoke (ADR-0003).
 */
export interface Concept {
  id: string;
  title: string;
  stage: Stage;
  /** One-line card description, provider-agnostic. */
  short: string;
  /**
   * The named Service each provider maps this concept to (e.g. Amazon S3).
   * Lightweight metadata so the shell can show the cross-provider equivalence
   * without loading a lesson component.
   */
  services: Partial<Record<Provider, string>>;
  /**
   * Marks a concept whose lesson is still being written. Drives a "WIP" badge
   * in navigation so learners know which lessons are complete. Independent of
   * whether a `components` entry exists — a concept can have draft content and
   * still be flagged in progress.
   */
  wip?: boolean;
  /**
   * Per-provider lesson components; the keys present are the providers whose
   * lesson has been authored. A concept can appear in navigation before any
   * lesson exists (the lesson page renders a "coming soon" state).
   */
  components: Partial<Record<Provider, ConceptComponentLoader>>;
}

/**
 * A guided, end-to-end build that stitches several Concepts into one working
 * system (e.g. a web server on a VM inside a virtual network). Projects are a
 * top-level content type parallel to Concepts: they have their own catalog,
 * route, and navigation section, and their per-provider lesson components are
 * lazy-loaded and free to be fully bespoke, exactly like Concepts (ADR-0003).
 */
export interface Project {
  id: string;
  title: string;
  /** One-line card description, provider-agnostic. */
  short: string;
  /**
   * The ids of the Concepts this project builds on, in the order they come up.
   * Drives the "concepts you'll use" links back into their lessons, so a
   * project reinforces the concepts rather than restating them.
   */
  concepts: string[];
  /**
   * The named Services each provider assembles for this project, in stack order
   * (e.g. ["Amazon VPC", "Amazon EC2"]). Lightweight metadata so the shell can
   * show the cross-provider stack without loading a lesson component.
   */
  stack: Partial<Record<Provider, string[]>>;
  /**
   * Marks a project whose lesson is still being written. Drives a "WIP" badge
   * in navigation, independent of whether a `components` entry exists.
   */
  wip?: boolean;
  /**
   * Per-provider lesson components; the keys present are the providers whose
   * build has been authored. A project can appear in navigation before any
   * lesson exists (the project page renders a "coming soon" state).
   */
  components: Partial<Record<Provider, ConceptComponentLoader>>;
}
