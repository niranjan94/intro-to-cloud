import type { ComponentType } from "react";

/** A cloud vendor the learner can choose between. */
export type Provider = "aws" | "azure";

/** All supported providers, in display order. */
export const PROVIDERS: readonly Provider[] = ["aws", "azure"] as const;

/** Human-readable provider labels for UI (logo/label-led, per ADR-0002). */
export const PROVIDER_LABELS: Record<Provider, string> = {
  aws: "AWS",
  azure: "Azure",
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
 * and split from the (lazy-loaded) per-provider components (ADR-0003).
 */
export interface Concept {
  id: string;
  title: string;
  category: Category;
  /** Per-provider components; the keys present are the supported providers. */
  components: Partial<Record<Provider, ConceptComponentLoader>>;
}
