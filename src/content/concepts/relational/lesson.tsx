import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
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
      <RelationalChapters provider={provider} />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
