import {
  CATEGORIES,
  type Category,
  type Concept,
  type Provider,
} from "./types";

/**
 * The concept catalog. Every concept appears in navigation; a lesson component
 * is wired in `components` only once it has been authored. Concepts without a
 * component for the active provider render a "coming soon" lesson state.
 */
export const concepts: readonly Concept[] = [
  {
    id: "object-storage",
    title: "Object Storage",
    category: "Storage",
    short: "Files as objects in a flat namespace, over HTTP.",
    services: { aws: "Amazon S3", azure: "Azure Blob Storage" },
    components: {
      aws: () => import("./concepts/object-storage/aws"),
      azure: () => import("./concepts/object-storage/azure"),
    },
  },
  {
    id: "block-storage",
    title: "Block Storage",
    category: "Storage",
    short: "Raw disk volumes you attach to a machine.",
    services: { aws: "Amazon EBS", azure: "Azure Managed Disks" },
    components: {},
  },
  {
    id: "virtual-machines",
    title: "Virtual Machines",
    category: "Compute",
    short: "A whole server you rent by the hour.",
    services: { aws: "Amazon EC2", azure: "Azure Virtual Machines" },
    components: {
      aws: () => import("./concepts/virtual-machines/aws"),
      azure: () => import("./concepts/virtual-machines/azure"),
    },
  },
  {
    id: "serverless",
    title: "Serverless Functions",
    category: "Compute",
    short: "Run code on events, no servers to manage.",
    services: { aws: "AWS Lambda", azure: "Azure Functions" },
    components: {},
  },
  {
    id: "containers",
    title: "Containers",
    category: "Compute",
    short: "Portable app images run as managed containers.",
    services: { aws: "Amazon ECS", azure: "Azure Container Apps" },
    components: {},
  },
  {
    id: "virtual-network",
    title: "Virtual Network",
    category: "Networking",
    short: "A private, isolated slice of cloud network.",
    services: { aws: "Amazon VPC", azure: "Azure Virtual Network" },
    components: {
      aws: () => import("./concepts/virtual-network/aws"),
      azure: () => import("./concepts/virtual-network/azure"),
    },
  },
  {
    id: "dns",
    title: "DNS",
    category: "Networking",
    short: "Map domain names to your resources.",
    services: { aws: "Amazon Route 53", azure: "Azure DNS" },
    components: {},
  },
  {
    id: "cdn",
    title: "Content Delivery",
    category: "Networking",
    short: "Cache content at the edge, close to users.",
    services: { aws: "Amazon CloudFront", azure: "Azure Front Door" },
    components: {},
  },
  {
    id: "relational",
    title: "Relational Database",
    category: "Databases",
    short: "A managed SQL database with backups handled.",
    services: { aws: "Amazon RDS", azure: "Azure SQL Database" },
    components: {},
  },
  {
    id: "nosql",
    title: "NoSQL Database",
    category: "Databases",
    short: "Key-value / document store, built for scale.",
    services: { aws: "Amazon DynamoDB", azure: "Azure Cosmos DB" },
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

/** A category paired with its concepts, in canonical display order. */
export interface CategoryGroup {
  category: Category;
  concepts: Concept[];
}

/** Group concepts by category for sidebar / overview rendering. */
export function conceptsByCategory(): CategoryGroup[] {
  return CATEGORIES.map((category) => ({
    category,
    concepts: concepts.filter((concept) => concept.category === category),
  })).filter((group) => group.concepts.length > 0);
}
