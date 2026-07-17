import { type Concept, type Provider, STAGES, type Stage } from "./types";

/**
 * The concept catalog, ordered as a learning path. Concepts are grouped into
 * `stage`s (see `Stage`) that run in dependency order — you stand up the
 * network and a server, then store data, then make it reachable, then go
 * deeper. Array order sets the sequence within each stage. Every concept
 * appears in navigation; a lesson component is wired in `components` only once
 * it has been authored, and `wip` flags the ones still being written. Concepts
 * without a component for the active provider render a "coming soon" state.
 */
export const concepts: readonly Concept[] = [
  {
    id: "virtual-network",
    title: "Virtual Network",
    stage: "Foundations",
    short: "A private, isolated slice of cloud network.",
    services: { aws: "Amazon VPC", azure: "Azure Virtual Network" },
    components: {
      aws: () => import("./concepts/virtual-network/aws"),
      azure: () => import("./concepts/virtual-network/azure"),
    },
  },
  {
    id: "virtual-machines",
    title: "Virtual Machines",
    stage: "Foundations",
    short: "A whole server you rent by the hour.",
    services: { aws: "Amazon EC2", azure: "Azure Virtual Machines" },
    components: {
      aws: () => import("./concepts/virtual-machines/aws"),
      azure: () => import("./concepts/virtual-machines/azure"),
    },
  },
  {
    id: "object-storage",
    title: "Object Storage",
    stage: "Storing data",
    short: "Files as objects in a flat namespace, over HTTP.",
    services: { aws: "Amazon S3", azure: "Azure Blob Storage" },
    components: {
      aws: () => import("./concepts/object-storage/aws"),
      azure: () => import("./concepts/object-storage/azure"),
    },
  },
  {
    id: "relational",
    title: "Relational Database",
    stage: "Storing data",
    short: "A managed SQL database with backups handled.",
    services: { aws: "Amazon RDS", azure: "Azure SQL Database" },
    components: {
      aws: () => import("./concepts/relational/aws"),
      azure: () => import("./concepts/relational/azure"),
    },
  },
  {
    id: "dns",
    title: "DNS",
    stage: "Reaching users",
    short: "Map domain names to your resources.",
    services: { aws: "Amazon Route 53", azure: "Azure DNS" },
    components: {
      aws: () => import("./concepts/dns/aws"),
      azure: () => import("./concepts/dns/azure"),
    },
  },
  {
    id: "cdn",
    title: "Content Delivery",
    stage: "Reaching users",
    short: "Cache content at the edge, close to users.",
    services: { aws: "Amazon CloudFront", azure: "Azure Front Door" },
    components: {
      aws: () => import("./concepts/cdn/aws"),
      azure: () => import("./concepts/cdn/azure"),
    },
  },
  {
    id: "block-storage",
    title: "Block Storage",
    stage: "Going further",
    short: "Raw disk volumes you attach to a machine.",
    services: { aws: "Amazon EBS", azure: "Azure Managed Disks" },
    components: {
      aws: () => import("./concepts/block-storage/aws"),
      azure: () => import("./concepts/block-storage/azure"),
    },
  },
  {
    id: "containers",
    title: "Containers",
    stage: "Going further",
    short: "Portable app images run as managed containers.",
    services: { aws: "Amazon ECS", azure: "Azure Container Apps" },
    wip: true,
    components: {},
  },
  {
    id: "serverless",
    title: "Serverless Functions",
    stage: "Going further",
    short: "Run code on events, no servers to manage.",
    services: { aws: "AWS Lambda", azure: "Azure Functions" },
    wip: true,
    components: {},
  },
  {
    id: "nosql",
    title: "NoSQL Database",
    stage: "Going further",
    short: "Key-value / document store, built for scale.",
    services: { aws: "Amazon DynamoDB", azure: "Azure Cosmos DB" },
    wip: true,
    components: {},
  },
];

/** Look up a concept by its id. */
export function getConcept(id: string): Concept | undefined {
  return concepts.find((concept) => concept.id === id);
}

/** The providers a concept has an authored lesson for. */
export function supportedProviders(concept: Concept): Provider[] {
  return Object.keys(concept.components) as Provider[];
}

/** Whether a concept has an authored lesson for a given provider. */
export function conceptSupportsProvider(
  concept: Concept,
  provider: Provider,
): boolean {
  return provider in concept.components;
}

/** A stage paired with its concepts, in learning-path order. */
export interface StageGroup {
  stage: Stage;
  concepts: Concept[];
}

/** Group concepts by learning stage for sidebar / overview rendering. */
export function conceptsByStage(): StageGroup[] {
  return STAGES.map((stage) => ({
    stage,
    concepts: concepts.filter((concept) => concept.stage === stage),
  })).filter((group) => group.concepts.length > 0);
}
