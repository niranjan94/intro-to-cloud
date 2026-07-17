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

/** A grouping of related Concepts used for wayfinding. Provider-agnostic. */
export type Category = "Storage" | "Compute" | "Networking" | "Databases";

/** Category display order for the sidebar and overview grids. */
export const CATEGORIES: readonly Category[] = [
  "Storage",
  "Compute",
  "Networking",
  "Databases",
] as const;

/**
 * Per-category presentation metadata. `accent` is a CSS custom property that
 * resolves to the category's wayfinding-dot color (see globals.css).
 */
export const CATEGORY_META: Record<Category, { accent: string }> = {
  Storage: { accent: "var(--color-cat-storage)" },
  Compute: { accent: "var(--color-cat-compute)" },
  Networking: { accent: "var(--color-cat-networking)" },
  Databases: { accent: "var(--color-cat-databases)" },
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
  category: Category;
  /** One-line card description, provider-agnostic. */
  short: string;
  /**
   * The named Service each provider maps this concept to (e.g. Amazon S3).
   * Lightweight metadata so the shell can show the cross-provider equivalence
   * without loading a lesson component.
   */
  services: Partial<Record<Provider, string>>;
  /**
   * Per-provider lesson components; the keys present are the providers whose
   * lesson has been authored. A concept can appear in navigation before any
   * lesson exists (the lesson page renders a "coming soon" state).
   */
  components: Partial<Record<Provider, ConceptComponentLoader>>;
}
