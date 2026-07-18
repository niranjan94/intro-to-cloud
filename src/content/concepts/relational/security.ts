import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the relational lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "A new RDS DB instance starts with network access turned off (its VPC security group has no ingress rules until you add them), but whether it gets a publicly resolvable DNS name, whether storage is encrypted, and whether connections are forced onto TLS are all choices you own at creation time. The sharpest edge: encryption at rest cannot be enabled on an existing unencrypted instance, so you must decide before launch.",
    practices: [
      {
        risk: "Public data exposure",
        label:
          "Set Public accessibility to No and place the DB instance in private VPC subnets.",
        why: "The Public accessibility setting decides whether RDS assigns the instance a DNS name that resolves to a public IP reachable from the internet. Leave it on and the database is exposed to internet-wide credential stuffing and port scanning the moment a security group rule is loosened. Keep it off, in private subnets, and the only path in is from inside your VPC or over a Site-to-Site VPN or Direct Connect link.",
      },
      {
        risk: "Unrestricted network reach",
        label:
          "Scope the VPC security group to a specific source security group or CIDR range on the database port only.",
        why: "By default network access to a DB instance is turned off: access exists only through the ingress rules you add to its VPC security group. Referencing the application tier's security group as the source, instead of 0.0.0.0/0, means only those app instances can reach the database port, so a compromised host elsewhere has no route in. A single wide-open rule silently undoes the default-deny posture.",
      },
      {
        risk: "Plaintext at rest",
        label:
          "Enable RDS encryption at rest with an AWS KMS key when you create the instance.",
        why: "RDS uses AES-256 to encrypt the underlying storage plus its logs, automated backups, read replicas, and snapshots, transparently to the client. This defends against someone obtaining the raw disk or a copied snapshot. The sharp edge: you cannot enable encryption on an existing unencrypted instance, and you cannot change the KMS key later. To encrypt after the fact you must copy a snapshot with encryption turned on and restore from it, so decide before launch.",
      },
      {
        risk: "Sniffed connections",
        label:
          "Require TLS on every connection, for example by setting rds.force_ssl to 1 in a custom DB parameter group.",
        why: "Clients such as psql and JDBC default to trying SSL first but fall back to an unencrypted connection if the server allows it, letting a network intermediary read or tamper with query traffic including credentials. Setting rds.force_ssl (PostgreSQL and SQL Server) rejects any non-TLS connection at the server. On RDS for PostgreSQL 15 and later the parameter already defaults to 1, but on older majors it is 0, so confirm it per engine and distribute the RDS CA certificate so clients can validate the server against spoofing.",
      },
      {
        risk: "Static DB passwords",
        label:
          "Let RDS manage the master user password in AWS Secrets Manager with automatic rotation, and gate RDS operations with least-privilege IAM.",
        why: "When RDS manages the master credential in Secrets Manager it generates the password, stores it encrypted with a KMS key, and rotates it every seven days by default, so no long-lived password sits in config files or code. Scoped IAM policies then govern who can create, modify, or delete instances, snapshots, and security groups, limiting blast radius if a set of keys leaks. Using one all-powerful principal instead means a single compromise can reconfigure or delete every database.",
      },
      {
        risk: "Embedded connection strings",
        label:
          "Turn on IAM database authentication so applications connect with short-lived tokens instead of stored passwords.",
        why: "IAM database authentication, supported on RDS for MariaDB, MySQL, and PostgreSQL, lets a client authenticate with an IAM auth token generated from its role rather than a database password. Each token is valid for only 15 minutes and its traffic is forced over SSL/TLS, so a leaked connection string is far less useful to an attacker than a permanent password. Access is governed centrally by IAM policy alongside the rest of your AWS identities, so revoking the role revokes database access instantly.",
      },
    ],
  },
  azure: {
    posture:
      "Azure SQL Database is a PaaS logical server. Two protections are on out of the box: Transparent Data Encryption is enabled for every newly deployed database, and the server firewall rejects all connections until you add a server-level or database-level firewall rule. The rest is yours to set: the logical server still exposes a public endpoint, SQL authentication stays enabled until you switch on Microsoft Entra-only authentication, and the minimum TLS version must be pinned. Note that customer-managed TDE keys and Always Encrypted keys are permanently unrecoverable if lost.",
    practices: [
      {
        risk: "Public endpoint exposure",
        label:
          "Set Public network access to Disable and connect over a Private Endpoint (Azure Private Link), keeping any firewall rules narrow.",
        why: "The server firewall denies all connections until you add a rule, but the logical server can still answer on its public endpoint. Setting Public network access to Disable shuts that public door so only Private Endpoint connections are allowed, giving the database a private IP inside your virtual network where traffic never crosses the public internet. If you must keep public access on, avoid the Allow Azure services setting, which permits resources from any Azure tenant rather than only yours.",
      },
      {
        risk: "Weak credential sprawl",
        label:
          "Enable Microsoft Entra-only authentication, which disables SQL logins, and assign access via Entra groups.",
        why: "Microsoft Entra-only authentication centralizes identity so you get Conditional Access, multifactor authentication, and instant deprovisioning instead of standalone SQL passwords scattered per server. It is not on by default: a new server accepts SQL authentication until you explicitly enable this feature, at which point any SQL login, including the SQL admin, is blocked from connecting. Leave SQL authentication on and a leaked SQL login bypasses those org-wide identity controls with no central place to revoke it.",
      },
      {
        risk: "Downgrade attacks",
        label: "Set the server's Minimum TLS version to at least 1.2.",
        why: "The Minimum TLS version setting rejects any client that connects using a protocol below the floor you choose. TLS 1.0 and 1.1 have well-documented weaknesses and are being retired, so allowing them lets an attacker force a downgrade to weaker ciphers on the connection. Pinning the floor at 1.2 ensures every session negotiates modern encryption for data in transit, and clients that cannot meet it fail closed rather than falling back silently.",
      },
      {
        risk: "Plaintext at rest",
        label:
          "Keep Transparent Data Encryption on and, for key control, back TDE with a customer-managed key in Azure Key Vault.",
        why: "TDE encrypts the database, its backups, and its transaction log files at rest in real time and is on by default for newly deployed databases, defending against theft of the underlying storage or backup media. Switching the TDE protector to a customer-managed key (BYOK) in Key Vault lets you own the key lifecycle and revoke Microsoft's access independently. The sharp edge: if you use a customer-managed key, protect and back up that key, because losing it makes the database permanently unrecoverable.",
      },
      {
        risk: "Undetected intrusion",
        label:
          "Enable Microsoft Defender for SQL for vulnerability assessment and threat alerts, and turn on SQL auditing to immutable storage.",
        why: "Microsoft Defender for SQL runs a built-in vulnerability assessment that flags misconfigurations and excessive permissions, and its threat protection raises alerts on anomalies such as potential SQL injection or logins from unusual locations. Auditing records who did what, and when written to immutable (WORM) storage it produces a tamper-proof trail. Without these you get no early warning of an attack in progress and no forensic record after a breach.",
      },
      {
        risk: "Insider data access",
        label:
          "Use Always Encrypted for the most sensitive columns so plaintext is never visible to the database engine or administrators.",
        why: "Always Encrypted encrypts specific columns inside the client driver using column keys the database engine never sees, so highly sensitive values such as national IDs or card numbers stay ciphertext even in server memory. This separates the people who manage the database from the people allowed to read its data, blocking a curious or compromised DBA or cloud operator. Always Encrypted with secure enclaves extends it to support richer queries, such as pattern matching and comparisons, over the encrypted columns.",
      },
    ],
  },
};
