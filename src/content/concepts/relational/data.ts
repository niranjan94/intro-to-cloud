import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the Relational Database lesson. The
 * interactive components under this folder are provider-agnostic and read
 * everything they render from here, so the AWS and Azure lessons stay bespoke
 * (they diverge in engine choice, high-availability shape, and backup model)
 * without duplicating the interaction machinery.
 *
 * Facts verified against the Amazon RDS User Guide and Microsoft Learn Azure
 * SQL Database documentation. Prose is kept neutral and professional; no em
 * dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* -------------------------- Chapter 0 · anatomy --------------------------- */

export interface AnatomyPart {
  key: string;
  label: string;
  sub: string;
  tone: Tone;
}

export interface AnatomyGroup {
  label: string;
  parts: AnatomyPart[];
}

export interface AnatomyHotspot {
  title: string;
  /** Plain-language relation, e.g. "the database engine". */
  rel: string;
  body: string;
}

export interface AnatomyContent {
  region: string;
  /** The boundary the database sits inside (subnet group / logical server). */
  boundary: string;
  /** The central database node (clickable, keyed "db"). */
  db: { label: string; sub: string };
  groups: AnatomyGroup[];
  hotspots: Record<string, AnatomyHotspot>;
  hint: string;
  /** The single-line create command shown under the map. */
  cli: string;
}

/* ------------------------ Chapter 1 · availability ------------------------ */

/** One node in an availability topology, colored by the role it plays. */
export interface TopoNode {
  role: Extract<Tone, "primary" | "standby" | "read" | "offline">;
  label: string;
  sub: string;
  /** The placement label, e.g. "us-east-1a" or "Zone 2". */
  zone: string;
}

export interface TopoMode {
  id: string;
  navLabel: string;
  title: string;
  intro: string;
  nodes: TopoNode[];
  /** Whether replication between nodes is synchronous or asynchronous. */
  sync: "sync" | "async" | "none";
}

export interface AvailabilityContent {
  modes: TopoMode[];
  callouts: CalloutData[];
}

/* -------------------------- Chapter 2 · recovery -------------------------- */

/** A component of an automated backup, shown as a chip. */
export interface BackupPiece {
  label: string;
  sub: string;
}

export interface RecoveryContent {
  /** Default retention window shown on the timeline, in days. */
  windowDays: number;
  /** Human copy for the settable retention range, e.g. "0 to 35 days". */
  rangeLabel: string;
  /** How fine-grained recovery is, e.g. "any second". */
  granularity: string;
  pieces: BackupPiece[];
  /** What a restore produces (both providers restore to a NEW resource). */
  restoreNote: string;
  /** What is available beyond the retention window. */
  beyond: string;
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 3 · quiz ---------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/* ------------------------------ The bundle -------------------------------- */

export interface LessonContent {
  chapters: ChapterMeta[];
  anatomy: AnatomyContent;
  availability: AvailabilityContent;
  recovery: RecoveryContent;
  quiz: QuizQ[];
}

/* ================================ AWS ==================================== */

const AWS: LessonContent = {
  chapters: [
    {
      navLabel: "anatomy",
      kicker: "Chapter 1",
      title: "What you actually rent",
      intro:
        "Amazon RDS gives you a database, not a server to babysit. It still has real parts: an engine, storage, a network position, backups, and a way in. Tap each piece to see what RDS runs for you and what you still choose.",
    },
    {
      navLabel: "availability",
      kicker: "Chapter 2",
      title: "Staying up when things fail",
      intro:
        "One database in one place is a single point of failure. RDS adds a synchronous standby for failover and read replicas for scale. Switch between the shapes to see how the topology changes and what each part is for.",
    },
    {
      navLabel: "backups",
      kicker: "Chapter 3",
      title: "Going back in time",
      intro:
        "Managed backups run without you, and they buy you a superpower: restoring the database to any second inside a retention window. Drag the marker to pick a moment to recover to.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 4",
      title: "Check yourself",
      intro:
        "Five questions on the managed database you just explored. Answer to reveal the explanation.",
    },
  ],
  anatomy: {
    region: "Region · us-east-1",
    boundary: "DB subnet group · spans 2+ Availability Zones",
    db: { label: "DB instance", sub: "database-1 · db.t3.micro" },
    groups: [
      {
        label: "Engine",
        parts: [
          {
            key: "engine",
            label: "MySQL 8.0",
            sub: "6 engines + Aurora",
            tone: "compute",
          },
        ],
      },
      {
        label: "Storage",
        parts: [
          {
            key: "storage",
            label: "gp3 SSD volume",
            sub: "20 GiB, grows online",
            tone: "storage",
          },
        ],
      },
      {
        label: "Backups",
        parts: [
          {
            key: "backups",
            label: "Automated backups",
            sub: "snapshot + tx logs",
            tone: "backup",
          },
        ],
      },
      {
        label: "Network",
        parts: [
          {
            key: "endpoint",
            label: "Endpoint",
            sub: "…rds.amazonaws.com:3306",
            tone: "network",
          },
          {
            key: "firewall",
            label: "VPC security group",
            sub: "sg-903004f8",
            tone: "security",
          },
        ],
      },
      {
        label: "Access",
        parts: [
          {
            key: "user",
            label: "Master user",
            sub: "admin · no SSH",
            tone: "identity",
          },
        ],
      },
    ],
    hotspots: {
      db: {
        title: "The DB instance",
        rel: "the database itself",
        body: "One isolated database environment: the basic building block of RDS. Its DB instance identifier (database-1) forms part of a DNS endpoint like database-1.abcdefgh.us-east-1.rds.amazonaws.com, and its DB instance class (db.t3.micro here) fixes CPU and memory. You never get shell access to the host, because RDS runs the operating system for you.",
      },
      engine: {
        title: "The database engine",
        rel: "the SQL engine it runs",
        body: "The engine the instance runs. RDS supports Db2, MySQL, MariaDB, PostgreSQL, Oracle, and Microsoft SQL Server, plus Amazon Aurora. You pick one engine per instance at create time, and RDS patches it for you. This example runs MySQL 8.0.",
      },
      storage: {
        title: "gp3 SSD volume",
        rel: "the disk, sized separately",
        body: "Storage is allocated separately from compute (20 GiB here) and can grow while the database stays online. General Purpose SSD (gp3) suits most workloads; Provisioned IOPS SSD (io1 / io2) is there when you need guaranteed throughput. Encryption at rest must be enabled at create time and cannot be added later without a snapshot restore.",
      },
      backups: {
        title: "Automated backups",
        rel: "the safety net",
        body: "RDS takes a daily storage-volume snapshot and streams the transaction logs continuously. Together they let you restore to any second inside the retention window (0 to 35 days). Automated backups are on by default; manual snapshots you take yourself persist until you delete them.",
      },
      endpoint: {
        title: "The endpoint",
        rel: "where apps connect",
        body: "The DNS endpoint and port applications connect to (port 3306 for MySQL). It stays stable across a failover: when a standby is promoted, RDS repoints the same DNS name, so your connection string does not change.",
      },
      firewall: {
        title: "VPC security group",
        rel: "the firewall",
        body: "The stateful firewall around the instance: it controls which source addresses and ports can reach the database. The instance lives inside a DB subnet group, which must span at least two Availability Zones so a standby can be placed in a different one.",
      },
      user: {
        title: "The master user",
        rel: "how you log in",
        body: "The administrative database user created with the instance. You authenticate as a database user over the SQL protocol; there is no SSH or RDP into the host, because AWS runs the operating system. IAM database authentication is an option for some engines.",
      },
    },
    hint: "Every box is clickable. Start with the DB instance in the middle, then follow what plugs into it.",
    cli: "aws rds create-db-instance --db-instance-identifier database-1 --db-instance-class db.t3.micro --engine mysql --master-username admin --master-user-password <password> --allocated-storage 20",
  },
  availability: {
    modes: [
      {
        id: "single",
        navLabel: "Single-AZ",
        title: "One instance, one zone",
        intro:
          "A single-AZ instance is one database in one Availability Zone. Cheapest, but if that zone or the instance fails, the database is down until it recovers. Fine for dev and test, risky for production.",
        sync: "none",
        nodes: [
          {
            role: "primary",
            label: "DB instance",
            sub: "db.t3.micro",
            zone: "us-east-1a",
          },
        ],
      },
      {
        id: "multi-az",
        navLabel: "Multi-AZ",
        title: "A standby ready to take over",
        intro:
          "A Multi-AZ deployment keeps a synchronous standby in a second Availability Zone. Every write is committed to both before it is acknowledged. If the primary fails, RDS promotes the standby and repoints the endpoint automatically, typically in 60 to 120 seconds. The standby is not readable: it exists for durability, not scale.",
        sync: "sync",
        nodes: [
          {
            role: "primary",
            label: "Primary",
            sub: "serves reads + writes",
            zone: "us-east-1a",
          },
          {
            role: "standby",
            label: "Synchronous standby",
            sub: "failover target, not readable",
            zone: "us-east-1b",
          },
        ],
      },
      {
        id: "read",
        navLabel: "Read replicas",
        title: "Copies that share the read load",
        intro:
          "Read replicas are asynchronous copies you can direct read queries to, offloading the primary. MySQL, MariaDB, and PostgreSQL support up to 15 read replicas per source. Because replication is asynchronous, a replica can lag slightly behind the primary.",
        sync: "async",
        nodes: [
          {
            role: "primary",
            label: "Primary",
            sub: "takes all writes",
            zone: "us-east-1a",
          },
          {
            role: "read",
            label: "Read replica 1",
            sub: "read-only queries",
            zone: "us-east-1b",
          },
          {
            role: "read",
            label: "Read replica 2",
            sub: "read-only queries",
            zone: "us-east-1c",
          },
        ],
      },
      {
        id: "cross-region",
        navLabel: "Cross-Region",
        title: "A copy in another Region",
        intro:
          "A cross-Region read replica copies data asynchronously to a different Region. It serves reads close to distant users and can be promoted to a standalone primary for disaster recovery if the source Region is lost.",
        sync: "async",
        nodes: [
          {
            role: "primary",
            label: "Primary",
            sub: "us-east-1",
            zone: "N. Virginia",
          },
          {
            role: "read",
            label: "Cross-Region replica",
            sub: "eu-west-1, promotable",
            zone: "Ireland",
          },
        ],
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "The Multi-AZ standby doubles my read capacity.",
        body: "The synchronous standby is not readable. It exists to take over on failure, not to serve traffic. To scale reads you add read replicas, which are a separate feature with their own endpoints.",
      },
      {
        kind: "note",
        tag: "Newer option",
        title: "Multi-AZ DB cluster.",
        body: "For MySQL and PostgreSQL, a Multi-AZ DB cluster runs one primary and two readable standbys across three Availability Zones, with failover typically under 35 seconds. It combines the failover of Multi-AZ with some read capacity.",
      },
    ],
  },
  recovery: {
    windowDays: 7,
    rangeLabel: "0 to 35 days (0 turns backups off)",
    granularity: "any second",
    pieces: [
      { label: "Daily snapshot", sub: "full volume, once a day" },
      { label: "Transaction logs", sub: "streamed continuously" },
    ],
    restoreNote:
      "A point-in-time restore always creates a brand-new DB instance at the moment you pick. The original keeps running, so recovery is non-destructive: you verify the new instance, then repoint your application.",
    beyond:
      "Older than the retention window, you can only restore from a manual snapshot, which you take on demand and which lives until you delete it.",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Backups are on, so deleting the instance is safe.",
        body: "Deleting a DB instance offers a final snapshot, but if you skip it (--skip-final-snapshot) the automated backups are deleted with the instance. Take or keep a snapshot before deleting anything you might need again.",
      },
      {
        kind: "note",
        tag: "Watch the default",
        title: "Console and CLI defaults differ.",
        body: "Automated backups default to a 7-day retention when you create an instance in the console, but only 1 day from the CLI or API. Set the retention explicitly so it is never a surprise.",
      },
    ],
  },
  quiz: [
    {
      q: "You need to offload read-heavy reporting queries from your production RDS database. What do you add?",
      opts: [
        "A Multi-AZ standby",
        "A read replica",
        "A larger instance class only",
        "More provisioned IOPS",
      ],
      answer: 1,
      explain:
        "Read replicas are asynchronous copies you can direct read traffic to. The Multi-AZ standby is not readable; it only takes over on failure.",
    },
    {
      q: "How far back can automated backups let you restore to a point in time?",
      opts: [
        "Always exactly 7 days",
        "Any second within a window of 0 to 35 days",
        "Only the last hour",
        "Any second in the last 90 days",
      ],
      answer: 1,
      explain:
        "Automated backups support point-in-time recovery to any second within a retention window you set from 0 to 35 days (0 disables them). The default is 7 days in the console.",
    },
    {
      q: "Your Multi-AZ primary fails. What do applications have to do?",
      opts: [
        "Reconnect using a brand-new endpoint",
        "Nothing; RDS promotes the standby and keeps the endpoint",
        "Restore from a snapshot first",
        "Switch permanently to read-only",
      ],
      answer: 1,
      explain:
        "RDS promotes the synchronous standby and repoints the same DNS endpoint automatically, typically within 60 to 120 seconds, so the connection string does not change.",
    },
    {
      q: "How do you get shell access to the server running your RDS database?",
      opts: [
        "SSH in with a key pair",
        "RDP in as administrator",
        "You cannot; RDS manages the operating system",
        "Through the VPC security group",
      ],
      answer: 2,
      explain:
        "RDS is fully managed: there is no SSH or RDP to the host. You connect only as a database user over the SQL protocol.",
    },
    {
      q: "A DB subnet group must contain subnets in:",
      opts: [
        "A single Availability Zone",
        "At least two Availability Zones",
        "Every Region you use",
        "Two separate VPCs",
      ],
      answer: 1,
      explain:
        "A DB subnet group must span at least two Availability Zones so RDS can place a standby in a different AZ from the primary.",
    },
  ],
};

/* =============================== Azure =================================== */

const AZURE: LessonContent = {
  chapters: [
    {
      navLabel: "anatomy",
      kicker: "Chapter 1",
      title: "What you actually rent",
      intro:
        "Azure SQL Database gives you a database on a fully managed SQL Server engine, not a server to run. It still has real parts: an engine, storage, a network position behind a logical server, backups, and a way in. Tap each piece to see what Azure runs for you.",
    },
    {
      navLabel: "availability",
      kicker: "Chapter 2",
      title: "Staying up when things fail",
      intro:
        "One database in one zone is a single point of failure. Azure SQL Database adds zone-redundant replicas for failover and read-only replicas for scale. Switch between the shapes to see how the topology changes and what each part is for.",
    },
    {
      navLabel: "backups",
      kicker: "Chapter 3",
      title: "Going back in time",
      intro:
        "Automated backups run without you, and they buy you a superpower: restoring the database to any second inside a retention window. Drag the marker to pick a moment to recover to.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 4",
      title: "Check yourself",
      intro:
        "Five questions on the managed database you just explored. Answer to reveal the explanation.",
    },
  ],
  anatomy: {
    region: "Region · eastus",
    boundary: "Logical server · sqlsrv-01.database.windows.net",
    db: { label: "SQL database", sub: "appdb · General Purpose" },
    groups: [
      {
        label: "Engine",
        parts: [
          {
            key: "engine",
            label: "SQL Server engine",
            sub: "latest stable, patched",
            tone: "compute",
          },
        ],
      },
      {
        label: "Storage",
        parts: [
          {
            key: "storage",
            label: "Managed storage",
            sub: "sized by the tier",
            tone: "storage",
          },
        ],
      },
      {
        label: "Backups",
        parts: [
          {
            key: "backups",
            label: "Automated backups",
            sub: "PITR + long-term",
            tone: "backup",
          },
        ],
      },
      {
        label: "Network",
        parts: [
          {
            key: "endpoint",
            label: "Server endpoint",
            sub: "…database.windows.net:1433",
            tone: "network",
          },
          {
            key: "firewall",
            label: "Firewall rules",
            sub: "IP allow-list",
            tone: "security",
          },
        ],
      },
      {
        label: "Access",
        parts: [
          {
            key: "user",
            label: "Server admin",
            sub: "sqladmin · no OS",
            tone: "identity",
          },
        ],
      },
    ],
    hotspots: {
      db: {
        title: "The SQL database",
        rel: "the database itself",
        body: "A single fully managed database running the latest stable Microsoft SQL Server engine. It is hosted on a logical server but scaled and billed on its own. You choose a service tier (General Purpose here) that fixes its compute and storage. There is no operating system to manage or log into.",
      },
      engine: {
        title: "The SQL Server engine",
        rel: "the SQL engine it runs",
        body: "Azure SQL Database always runs the Microsoft SQL Server engine (the latest stable version, patched for you). Unlike RDS you do not choose among engines. If you need MySQL or PostgreSQL, those are separate Azure services: Azure Database for MySQL and Azure Database for PostgreSQL.",
      },
      storage: {
        title: "Managed storage",
        rel: "the disk, sized by tier",
        body: "Storage is managed for you and sized by your service tier and purchasing model. In the vCore model you pick General Purpose, Business Critical, or Hyperscale; the older DTU model bundles compute and storage into Basic, Standard, and Premium. Transparent Data Encryption protects data at rest and is on by default.",
      },
      backups: {
        title: "Automated backups",
        rel: "the safety net",
        body: "Full, differential, and transaction-log backups are taken automatically and stored in geo-redundant storage by default. Point-in-time restore covers 1 to 35 days (7 by default). Long-term retention policies can keep weekly, monthly, and yearly backups for up to 10 years.",
      },
      endpoint: {
        title: "The server endpoint",
        rel: "where apps connect",
        body: "Databases are reached through their logical server's endpoint (sqlsrv-01.database.windows.net, port 1433). The server is a management and connection gateway, not a machine: it holds the admin login, the firewall, and auditing settings for every database on it.",
      },
      firewall: {
        title: "Firewall rules",
        rel: "the firewall",
        body: "By default the logical server blocks all traffic. Server-level IP firewall rules open access for whole ranges across every database; database-level rules (set in T-SQL) scope to one database. For private access, a private endpoint places the server on your virtual network.",
      },
      user: {
        title: "The server admin",
        rel: "how you log in",
        body: "The server admin login set when the logical server is created, with full rights over its databases. You connect as a database principal over the SQL (TDS) protocol; there is no OS to reach, because Azure runs it as a platform service. Microsoft Entra authentication is also supported.",
      },
    },
    hint: "Every box is clickable. Start with the SQL database in the middle, then follow what plugs into it.",
    cli: "az sql db create --resource-group intro-cloud --server sqlsrv-01 --name appdb --edition GeneralPurpose --family Gen5 --capacity 2",
  },
  availability: {
    modes: [
      {
        id: "single",
        navLabel: "Local",
        title: "One database, one zone",
        intro:
          "The default locally redundant configuration keeps your database in a single availability zone. If that zone has an outage, the database is unavailable until it recovers. Fine for dev and test, risky for production.",
        sync: "none",
        nodes: [
          {
            role: "primary",
            label: "SQL database",
            sub: "General Purpose",
            zone: "eastus · one zone",
          },
        ],
      },
      {
        id: "zone",
        navLabel: "Zone-redundant",
        title: "Replicas spread across zones",
        intro:
          "Zone-redundant configuration spreads replicas across availability zones inside one region, so a single zone outage does not take the database down. It is available in General Purpose, Business Critical, and Hyperscale (vCore) and Premium (DTU). The platform handles failover with no change to your connection string.",
        sync: "sync",
        nodes: [
          {
            role: "primary",
            label: "Primary replica",
            sub: "serves reads + writes",
            zone: "Zone 1",
          },
          {
            role: "standby",
            label: "Hot standby",
            sub: "failover target",
            zone: "Zone 2",
          },
          {
            role: "standby",
            label: "Hot standby",
            sub: "failover target",
            zone: "Zone 3",
          },
        ],
      },
      {
        id: "read",
        navLabel: "Read scale-out",
        title: "A read-only replica for queries",
        intro:
          "In Premium, Business Critical, and Hyperscale, a read-only replica is kept in sync and used for read-only queries. Clients opt in by adding ApplicationIntent=ReadOnly to the connection string, sending reporting and read traffic off the primary at no extra charge.",
        sync: "sync",
        nodes: [
          {
            role: "primary",
            label: "Read-write replica",
            sub: "takes all writes",
            zone: "primary",
          },
          {
            role: "read",
            label: "Read-only replica",
            sub: "ApplicationIntent=ReadOnly",
            zone: "read scale-out",
          },
        ],
      },
      {
        id: "geo",
        navLabel: "Geo-replication",
        title: "A secondary in another Region",
        intro:
          "Active geo-replication keeps up to four readable secondaries, which can be in other Regions, in sync with the primary. A failover group wraps this with automatic failover and a stable listener endpoint, so an application fails over to another Region without a connection-string change.",
        sync: "async",
        nodes: [
          {
            role: "primary",
            label: "Primary",
            sub: "read + write",
            zone: "eastus",
          },
          {
            role: "read",
            label: "Geo-secondary",
            sub: "readable, promotable",
            zone: "westus",
          },
        ],
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Locally redundant survives a zone outage.",
        body: "The default locally redundant configuration lives in one availability zone. To survive a single zone failure within the region, enable zone-redundant configuration, which spreads replicas across zones.",
      },
      {
        kind: "note",
        tag: "Where reads scale",
        title: "Read scale-out is tier-dependent.",
        body: "Read scale-out is on by default in Premium, Business Critical, and Hyperscale, and is not available in Basic, Standard, or General Purpose. Reaching the read-only replica is a connection-string setting, not a separate resource.",
      },
    ],
  },
  recovery: {
    windowDays: 7,
    rangeLabel: "1 to 35 days (7 by default)",
    granularity: "any second",
    pieces: [
      { label: "Full backup", sub: "weekly" },
      { label: "Differential", sub: "every 12 to 24 hours" },
      { label: "Transaction log", sub: "about every 10 minutes" },
    ],
    restoreNote:
      "A point-in-time restore always creates a new database on the same logical server. The original is left untouched, so you verify the restored copy, then rename or repoint your application to it.",
    beyond:
      "Older than the retention window, long-term retention (LTR) policies can keep weekly, monthly, and yearly backups for up to 10 years.",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A restore overwrites my database in place.",
        body: "A point-in-time restore always creates a new database. The original stays available while you verify the restore, then you rename or repoint your application to the recovered copy.",
      },
      {
        kind: "note",
        tag: "Built-in durability",
        title: "Backups are geo-redundant by default.",
        body: "Automated backups are stored in read-access geo-redundant storage by default, so they survive a regional outage even before you configure active geo-replication.",
      },
    ],
  },
  quiz: [
    {
      q: "Which Azure SQL Database configuration survives a single availability-zone outage within a region?",
      opts: [
        "Locally redundant (the default)",
        "Zone-redundant configuration",
        "A larger DTU tier",
        "Long-term retention",
      ],
      answer: 1,
      explain:
        "Zone-redundant configuration spreads replicas across availability zones in the region. The default locally redundant configuration lives in one zone.",
    },
    {
      q: "You want reporting queries to run off a read-only copy at no extra charge. What do you use?",
      opts: [
        "Active geo-replication",
        "Read scale-out with ApplicationIntent=ReadOnly",
        "A second logical server",
        "An elastic pool",
      ],
      answer: 1,
      explain:
        "In Premium, Business Critical, and Hyperscale, read scale-out routes read-only connections (ApplicationIntent=ReadOnly) to a built-in replica at no extra cost.",
    },
    {
      q: "What is the logical server in Azure SQL Database?",
      opts: [
        "A virtual machine you manage",
        "A management and connection gateway for databases",
        "The physical host the database runs on",
        "A backup vault",
      ],
      answer: 1,
      explain:
        "The logical server is a container that holds the admin login, firewall, and endpoint for one or more databases. It is not a VM and has no operating system you manage.",
    },
    {
      q: "A point-in-time restore in Azure SQL Database:",
      opts: [
        "Overwrites the database in place",
        "Creates a new database at the chosen time",
        "Only works within the last hour",
        "Requires long-term retention to be on",
      ],
      answer: 1,
      explain:
        "Point-in-time restore always creates a new database (default retention 7 days, up to 35), leaving the original untouched.",
    },
    {
      q: "You need MySQL rather than SQL Server on Azure. Azure SQL Database:",
      opts: [
        "Runs any engine you choose",
        "Runs only the Microsoft SQL Server engine",
        "Runs MySQL in a compatibility mode",
        "Cannot host relational data",
      ],
      answer: 1,
      explain:
        "Azure SQL Database runs only the SQL Server engine. For MySQL or PostgreSQL, Azure offers separate managed services: Azure Database for MySQL and Azure Database for PostgreSQL.",
    },
  ],
};

/* ================================ Export ================================= */

export const CONTENT: Record<Provider, LessonContent> = {
  aws: AWS,
  azure: AZURE,
};
