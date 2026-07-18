import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import type {
  AgentSetup,
  ResponsibilitySplit,
} from "@/components/lesson/lesson-reference";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { NoSqlChapters } from "./chapters";

const concept = getConcept("nosql");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "Core components of Amazon DynamoDB",
      href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html",
      note: "Tables, items, attributes, and the two kinds of primary key.",
    },
    {
      label: "Partitions and data distribution in DynamoDB",
      href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.Partitions.html",
      note: "How the partition key hash places items, and what an item collection is.",
    },
    {
      label: "Improving data access with secondary indexes",
      href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html",
      note: "Global and local secondary indexes for querying non-key attributes.",
    },
    {
      label: "DynamoDB read consistency",
      href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html",
      note: "Eventually consistent (default) versus strongly consistent reads.",
    },
    {
      label: "DynamoDB throughput capacity",
      href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadWriteCapacityMode.html",
      note: "On-demand and provisioned modes, and read and write capacity units.",
    },
  ],
  azure: [
    {
      label: "Databases, containers, and items in Azure Cosmos DB",
      href: "https://learn.microsoft.com/en-us/azure/cosmos-db/resource-model",
      note: "The account, database, container, and item hierarchy.",
    },
    {
      label: "Partitioning and horizontal scaling in Azure Cosmos DB",
      href: "https://learn.microsoft.com/en-us/azure/cosmos-db/partitioning-overview",
      note: "Logical and physical partitions, and choosing a partition key.",
    },
    {
      label: "Overview of indexing in Azure Cosmos DB",
      href: "https://learn.microsoft.com/en-us/azure/cosmos-db/index-overview",
      note: "How every property is automatically indexed by default.",
    },
    {
      label: "Consistency levels in Azure Cosmos DB",
      href: "https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels",
      note: "The five levels from Strong to Eventual, and their tradeoffs.",
    },
    {
      label: "Request Units in Azure Cosmos DB",
      href: "https://learn.microsoft.com/en-us/azure/cosmos-db/request-units",
      note: "RU/s as the throughput currency, and the provisioning modes.",
    },
  ],
};

const BLURB =
  "A NoSQL database trades the fixed tables and joins of SQL for a simpler promise: give it a key and it returns your record fast, at almost any scale. Data is stored as schemaless items spread across many machines by a partition key, so throughput and storage grow by adding partitions rather than by buying a bigger server. You design around the questions you will ask, not around a rigid schema.";

const ELEVATOR = "store records by a key and scale by adding machines";

const TERMS: GlossaryTerm[] = [
  {
    term: "Table / Container",
    definition:
      "The top-level holder your items live in. In Cosmos DB it sits under an account and a database.",
  },
  {
    term: "Item",
    definition:
      "One stored record: a bag of attributes in DynamoDB, a JSON document in Cosmos DB. Schemaless beyond its key.",
  },
  {
    term: "Partition key",
    definition:
      "The attribute hashed to decide which partition stores an item. Choose one with many evenly used values.",
  },
  {
    term: "Sort key / Item id",
    definition:
      "DynamoDB orders items within a partition by the sort key. Cosmos DB uses an id unique within the logical partition.",
  },
  {
    term: "Query / Scan",
    definition:
      "A Query targets a key and is efficient. A Scan or cross-partition query reads far more and costs more.",
  },
  {
    term: "Secondary index / Automatic indexing",
    definition:
      "DynamoDB needs a GSI or LSI to query non-key attributes; Cosmos DB indexes every property by default.",
  },
  {
    term: "RCU / WCU / RU",
    definition:
      "The throughput you pay for. DynamoDB splits reads and writes into capacity units; Cosmos DB uses one Request Unit currency.",
  },
  {
    term: "Read consistency",
    definition:
      "How fresh a read is. DynamoDB offers eventual and strong; Cosmos DB offers five levels from Strong to Eventual.",
  },
];

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "Table and index design, partition and sort key choice",
      "Item attributes and access patterns you query for",
      "Capacity mode: on-demand or provisioned RCU/WCU",
      "IAM policies granting least-privilege table access",
      "Encryption key choice and point-in-time recovery settings",
      "Read consistency chosen per request, eventual or strong",
    ],
    providerManages: [
      "Partitioning, storage growth, and item redistribution",
      "Synchronous replication across three Availability Zones",
      "Engine patching, scaling infrastructure, and host fleet",
      "Durability, availability, and the underlying hardware",
    ],
  },
  azure: {
    youManage: [
      "Database and container design, partition key choice",
      "Items and the indexing policy you tune per container",
      "Throughput mode: provisioned RU/s, autoscale, or serverless",
      "Azure RBAC and Entra ID access to the account",
      "Consistency level from Strong to Eventual, and failover regions",
      "Customer-managed keys and backup policy settings",
    ],
    providerManages: [
      "Logical and physical partition management and splitting",
      "Global distribution and replication across regions",
      "Engine patching, scaling infrastructure, and host fleet",
      "SLA-backed durability, availability, and the hardware",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    prompt:
      "Provision an Amazon DynamoDB table for me using the aws CLI.\nFirst run `aws sts get-caller-identity` and confirm the account and the target region before doing anything else.\nCreate a table named `app-items` with a partition key `pk` (string) and a sort key `sk` (string), using on-demand (PAY_PER_REQUEST) billing so I do not have to size capacity up front.\nEnable point-in-time recovery and server-side encryption with the AWS owned key default.\nBefore you run any command that creates or modifies resources, echo the full plan and the exact commands, and wait for my confirmation.\nWhen the table is active, print its ARN, name, and status.",
  },
  azure: {
    cli: "az",
    prompt:
      "Provision an Azure Cosmos DB account for me using the az CLI.\nFirst run `az account show` and confirm the active subscription and the target region before doing anything else.\nCreate a Core (NoSQL) API account with a sensible unique name, then add a database `appdb` and a container `items` with partition key path `/pk` using autoscale throughput at 1000 RU/s.\nUse the default Session consistency level unless I ask otherwise.\nBefore you run any command that creates or deletes resources, echo the full plan and the exact commands, and wait for my confirmation.\nWhen provisioning completes, print the account id, the document endpoint, and the container name.",
  },
};

/**
 * The NoSQL Database lesson. The interactive body lives in NoSqlChapters and is
 * driven per provider: AWS (Amazon DynamoDB) and Azure (Azure Cosmos DB) diverge
 * in the resource hierarchy, the key model, the indexing story, the number of
 * read-consistency levels, and the throughput currency. This shell provides the
 * shared concept framing, the cross-provider equivalence, the glossary, and
 * links to the authoritative documentation for the active lens.
 */
export function NoSqlLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon DynamoDB", code: "AWS::DynamoDB::Table" }}
        azure={{ service: "Azure Cosmos DB", code: "Microsoft.DocumentDB" }}
        elevator={ELEVATOR}
      />
      <NoSqlChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
