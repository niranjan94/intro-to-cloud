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
import { RelationalChapters } from "./chapters";

const concept = getConcept("relational");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is Amazon Relational Database Service?",
      href: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html",
      note: "The RDS User Guide overview: engines, DB instances, and features.",
    },
    {
      label: "Configuring and managing a Multi-AZ deployment",
      href: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html",
      note: "How the synchronous standby and automatic failover work.",
    },
    {
      label: "Working with backups",
      href: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html",
      note: "Automated backups, retention, and point-in-time recovery.",
    },
  ],
  azure: [
    {
      label: "What is the Azure SQL Database service?",
      href: "https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview",
      note: "The managed PaaS database service and how it is positioned.",
    },
    {
      label: "vCore and DTU purchasing models",
      href: "https://learn.microsoft.com/en-us/azure/azure-sql/database/purchasing-models",
      note: "The first sizing decision: vCore tiers versus DTU tiers.",
    },
    {
      label: "Automated backups in Azure SQL Database",
      href: "https://learn.microsoft.com/en-us/azure/azure-sql/database/automated-backups-overview",
      note: "Backup types, point-in-time restore, and long-term retention.",
    },
  ],
};

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "Schema design, indexes, and query performance",
      "Database engine and version selection",
      "Instance class, storage size, and Multi-AZ choice",
      "Master credentials, users, and grants",
      "VPC security groups and subnet placement",
      "Backup retention window and snapshot policy",
    ],
    providerManages: [
      "Guest OS and database engine patching",
      "Automated backups and point-in-time recovery",
      "Synchronous standby replication and automatic failover",
      "Underlying compute, storage, and hardware",
      "Physical host security and data center operations",
    ],
    mutable: [
      "Allocated storage size (increase only)",
      "DB instance class (compute and memory)",
      "Backup retention period and window",
      "Master user password",
      "Associated VPC security groups",
      "Multi-AZ deployment toggle",
    ],
    immutable: [
      "Storage encryption enablement",
      "KMS key used for encryption",
      "Master username",
      "Database character set name",
    ],
  },
  azure: {
    youManage: [
      "Schema design, indexes, and query performance",
      "Service tier, vCore or DTU, and compute size",
      "Database logins, contained users, and Azure RBAC roles",
      "Logical server firewall rules and private endpoints",
      "Transparent data encryption key choice",
      "Backup retention and long-term retention policy",
    ],
    providerManages: [
      "OS and SQL engine patching and upgrades",
      "Automated backups and point-in-time restore",
      "Zone-redundant replication and automatic failover",
      "Underlying compute, storage, and hardware",
      "Physical host security and data center operations",
    ],
    mutable: [
      "Service tier and edition",
      "Compute size (vCores or DTUs)",
      "Provisioned or serverless compute tier",
      "Maximum data size",
      "Elastic pool membership",
      "Backup storage redundancy (future backups)",
    ],
    immutable: [
      "Database collation",
      "Ledger database setting",
      "Region and logical server placement",
      "Hyperscale origin cannot move to other tiers",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Single-AZ starter",
        blurb:
          "A small single-AZ PostgreSQL instance for a first database or a throwaway sandbox. Reach for this when you want the cheapest managed engine and do not yet need failover or read scaling.",
        prompt:
          "Provision an Amazon RDS database instance using the aws CLI. First run `aws sts get-caller-identity` and confirm the target region so I know which account and region we are working in. Plan a single-AZ PostgreSQL DB instance named `intro-rds-db` on a small instance class (for example db.t3.micro) with 20 GB of gp3 storage, a generated master password stored somewhere I can retrieve, and backups retained for 7 days. Echo the full `aws rds create-db-instance` command and wait for my confirmation before creating, modifying, or deleting anything. After the instance becomes available, print its DB instance ARN, identifier, and connection endpoint.",
      },
      {
        label: "Multi-AZ production",
        blurb:
          "A highly available PostgreSQL instance with a synchronous standby in a second Availability Zone and automatic failover. Reach for this when downtime is expensive and you want the provider to survive a zone loss for you.",
        prompt:
          "Provision a highly available Amazon RDS database instance using the aws CLI. First run `aws sts get-caller-identity` and confirm the target region so I know which account and region we are working in. Plan a Multi-AZ PostgreSQL DB instance named `intro-rds-prod` on a production-grade instance class (for example db.m6g.large) with 100 GB of gp3 storage, `--multi-az` enabled so a synchronous standby runs in a second Availability Zone with automatic failover, `--storage-encrypted`, `--deletion-protection` on, a generated master password stored somewhere I can retrieve, backups retained for 14 days, and a `project=intro-cloud` tag on every resource for easy cleanup. Echo the full `aws rds create-db-instance` command and wait for my confirmation before creating, modifying, or deleting anything. After the instance becomes available, print its DB instance ARN, identifier, connection endpoint, and confirm the Multi-AZ status.",
      },
      {
        label: "Read replica for scaling",
        blurb:
          "A primary instance plus an asynchronous read replica that absorbs reporting and read-heavy traffic. Reach for this when the primary is saturated by reads and you want to offload them without touching writes.",
        prompt:
          "Provision an Amazon RDS primary instance with a read replica using the aws CLI. First run `aws sts get-caller-identity` and confirm the target region so I know which account and region we are working in. Plan a source PostgreSQL DB instance named `intro-rds-primary` on a mid-size instance class (for example db.m6g.large) with 50 GB of gp3 storage, automated backups retained for 7 days (required for replication), a generated master password stored somewhere I can retrieve, and a `project=intro-cloud` tag on every resource for easy cleanup. Then plan a read replica named `intro-rds-replica` created from that source with `aws rds create-db-instance-read-replica`. Echo the full `aws rds create-db-instance` and `aws rds create-db-instance-read-replica` commands and wait for my confirmation before creating, modifying, or deleting anything. After both are available, print each DB instance ARN, identifier, and connection endpoint, and confirm the replica's source.",
      },
      {
        label: "Serverless dev tier",
        blurb:
          "An Aurora Serverless v2 PostgreSQL cluster that scales capacity down toward zero and pauses when idle. Reach for this for intermittent dev or test workloads where you want to stop paying for compute between bursts.",
        prompt:
          "Provision an Amazon Aurora Serverless v2 PostgreSQL cluster using the aws CLI. First run `aws sts get-caller-identity` and confirm the target region so I know which account and region we are working in. Plan an Aurora PostgreSQL cluster named `intro-rds-serverless` created with `aws rds create-db-cluster` using `--engine aurora-postgresql` and a `--serverless-v2-scaling-configuration` that sets a low minimum capacity (for example 0.5 ACU) with auto-pause on idle and a modest maximum, plus a single serverless instance added with `aws rds create-db-instance` using `--db-instance-class db.serverless`, a generated master password stored somewhere I can retrieve, backups retained for 7 days, and a `project=intro-cloud` tag on every resource for easy cleanup. Echo the full `aws rds create-db-cluster` and `aws rds create-db-instance` commands and wait for my confirmation before creating, modifying, or deleting anything. After the cluster is available, print the cluster ARN, the writer endpoint, and the scaling configuration.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Serverless starter",
        blurb:
          "A single General Purpose serverless database on a fresh logical server for a first database or a sandbox. Reach for this when you want the simplest managed SQL Database that scales compute to what you use.",
        prompt:
          "Provision an Azure SQL Database using the az CLI. First run `az account show` and confirm the active subscription and the location I want to deploy into. Plan a logical server named `intro-sql-srv` and a database named `intro-sql-db` on the General Purpose serverless tier with a small vCore setting and 7 day point-in-time restore, placed in a resource group you create called `intro-sql-rg`. Echo the `az sql server create` and `az sql db create` commands and wait for my confirmation before creating, modifying, or deleting anything. When it finishes, print the server fully qualified domain name, the database resource id, and the connection endpoint.",
      },
      {
        label: "Zone-redundant production",
        blurb:
          "A provisioned General Purpose database with zone redundancy so replicas span Availability Zones and failover is automatic. Reach for this when downtime is expensive and you want the provider to survive a zone loss for you.",
        prompt:
          "Provision a highly available Azure SQL Database using the az CLI. First run `az account show` and confirm the active subscription and the location I want to deploy into. Plan a logical server named `intro-sql-prod-srv` and a database named `intro-sql-prod-db` on the General Purpose provisioned tier with a production vCore setting (for example 4 vCores), `--zone-redundant true` so replicas span Availability Zones with automatic failover, `--backup-storage-redundancy Zone`, 14 day point-in-time restore, placed in a resource group you create called `intro-sql-prod-rg`, and a `project=intro-cloud` tag on every resource for easy cleanup. Echo the `az sql server create` and `az sql db create` commands and wait for my confirmation before creating, modifying, or deleting anything. When it finishes, print the server fully qualified domain name, the database resource id, the connection endpoint, and confirm the zone-redundant status.",
      },
      {
        label: "Read scale-out replica",
        blurb:
          "A Business Critical database with a built-in read-only replica that read-intent connections are routed to. Reach for this when reporting and read-heavy traffic is saturating the primary and you want to offload it without touching writes.",
        prompt:
          "Provision an Azure SQL Database with read scale-out using the az CLI. First run `az account show` and confirm the active subscription and the location I want to deploy into. Plan a logical server named `intro-sql-scale-srv` and a database named `intro-sql-scale-db` on the Business Critical tier with a mid-size vCore setting (for example 4 vCores), `--read-scale Enabled` so a built-in read-only replica serves `ApplicationIntent=ReadOnly` connections, 7 day point-in-time restore, placed in a resource group you create called `intro-sql-scale-rg`, and a `project=intro-cloud` tag on every resource for easy cleanup. Echo the `az sql server create` and `az sql db create` commands and wait for my confirmation before creating, modifying, or deleting anything. When it finishes, print the server fully qualified domain name, the database resource id, the connection endpoint, and confirm read scale-out is enabled and the read-only routing string to use.",
      },
      {
        label: "Auto-pausing dev tier",
        blurb:
          "A General Purpose serverless database tuned to auto-pause after a short idle delay so you stop paying for compute between sessions. Reach for this for intermittent dev or test workloads that sit idle much of the day.",
        prompt:
          "Provision an auto-pausing Azure SQL Database using the az CLI. First run `az account show` and confirm the active subscription and the location I want to deploy into. Plan a logical server named `intro-sql-dev-srv` and a database named `intro-sql-dev-db` on the General Purpose serverless tier with a low minimum vCore capacity, `--auto-pause-delay 60` so compute pauses after 60 minutes of inactivity, 7 day point-in-time restore, placed in a resource group you create called `intro-sql-dev-rg`, and a `project=intro-cloud` tag on every resource for easy cleanup. Echo the `az sql server create` and `az sql db create` commands and wait for my confirmation before creating, modifying, or deleting anything. When it finishes, print the server fully qualified domain name, the database resource id, the connection endpoint, and confirm the auto-pause delay and min/max vCore settings.",
      },
    ],
  },
};

const BLURB =
  "Run a SQL database without running a server: the cloud provisions the engine, patches the operating system, replicates for failover, and backs it up on a schedule. You keep the schema, the queries, and the data; the provider keeps the machine alive.";

const ELEVATOR = "a managed SQL database with the operations handled for you";

const TERMS: GlossaryTerm[] = [
  {
    term: "DB instance / SQL database",
    definition: "The managed database you provision and connect to.",
  },
  {
    term: "DB subnet group / Logical server",
    definition: "The network container the database is reached through.",
  },
  {
    term: "Multi-AZ / Zone-redundant",
    definition: "A standby in another zone that takes over on failure.",
  },
  {
    term: "Read replica / Read scale-out",
    definition: "A read-only copy that offloads queries from the primary.",
  },
  {
    term: "Point-in-time recovery",
    definition: "Restoring to any second within the backup retention window.",
  },
  {
    term: "Snapshot / Long-term retention",
    definition: "Backups kept beyond the automatic retention window.",
  },
];

/**
 * The Relational Database lesson. The interactive body lives in
 * RelationalChapters and is driven per provider (AWS offers a choice of engines
 * and Multi-AZ failover; Azure runs only SQL Server behind a logical server
 * with zone-redundant configuration), while this shell provides the shared
 * concept framing, the cross-provider equivalence, and the glossary.
 */
export function RelationalLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon RDS", code: "rds" }}
        azure={{
          service: "Azure SQL Database",
          code: "Microsoft.Sql",
        }}
        elevator={ELEVATOR}
      />
      <RelationalChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
