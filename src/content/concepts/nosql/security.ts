import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the nosql lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "DynamoDB is a fully managed service with no host to patch: all data is encrypted at rest by default and every request travels over TLS, but the sharp edges you own are IAM authorization scope, choosing your KMS key, keeping traffic off the public internet, and not baking sensitive data into keys.",
    practices: [
      {
        risk: "Long-term key leak",
        label:
          "Authenticate with IAM roles and temporary credentials, never embedded access keys.",
        why: "DynamoDB has no database logins: every request must be signed with valid AWS credentials tied to an IAM principal. An IAM role vends short-lived, automatically rotated credentials to your application or compute, so a leaked artifact expires quickly. Hardcoding long-term access keys in code or on an instance leaves a permanent, unrotated secret that grants full table access if it is ever exposed.",
      },
      {
        risk: "Over-broad access",
        label:
          "Grant least-privilege IAM policies and scope items with policy conditions like dynamodb:LeadingKeys.",
        why: "IAM policies decide which principals can call which DynamoDB APIs on which tables, and Condition elements narrow that further to specific items and attributes. The dynamodb:LeadingKeys condition key ties a caller to only the items whose partition key matches their identity, enforcing per-user isolation. Without this, any granted principal can read or write the entire table, so one compromised credential or app bug exposes all tenants' data.",
      },
      {
        risk: "At-rest key control",
        label:
          "Keep encryption at rest on and select a customer managed KMS key when you need audit and revocation.",
        why: "DynamoDB encrypts all tables, indexes, streams, and backups at rest using AWS KMS, defaulting to an AWS owned key you cannot see or audit. Choosing a customer managed key gives you a CloudTrail record of every decrypt call plus the ability to rotate or disable the key, which instantly cuts access to the data. If you never opt up from the default key you lose that audit trail and the emergency kill switch.",
      },
      {
        risk: "Public internet exposure",
        label:
          "Reach DynamoDB through a VPC endpoint and pin access with the aws:sourceVpce condition.",
        why: "By default DynamoDB is called over its public regional endpoint, so traffic can traverse the open internet. A VPC endpoint lets instances use their private IP addresses to reach DynamoDB entirely within the AWS network, and an IAM policy using the aws:sourceVpce condition refuses any request that did not arrive through that endpoint. Skipping this leaves valid credentials usable from anywhere on the internet, widening the blast radius of a leak.",
      },
      {
        risk: "In-transit eavesdropping",
        label:
          "Enforce TLS 1.2 or 1.3 with forward-secrecy cipher suites on every client.",
        why: "All DynamoDB communication uses HTTPS, and clients must negotiate TLS 1.2 or 1.3 with cipher suites that support perfect forward secrecy such as ECDHE. Forward secrecy means a future compromise of a server key cannot decrypt previously captured sessions. Allowing clients to fall back to weak or outdated TLS reopens the door to interception and downgrade attacks on data in motion.",
      },
      {
        risk: "Sensitive data in logs",
        label:
          "Keep secrets out of primary keys and client-side encrypt sensitive attributes with the AWS Database Encryption SDK.",
        why: "Primary key names appear in the table definition to anyone who can call DescribeTable, and key values can surface in CloudTrail and other logs and are observed by the service to route and distribute data, so a plaintext SSN or email in a key leaks into places server-side encryption never protects. Use generic key names like pk and sk, and encrypt sensitive attributes before they leave your application with the AWS Database Encryption SDK so DynamoDB only ever stores ciphertext. Storing sensitive plaintext in keys means that data is exposed in logs to anyone with read access to them.",
      },
    ],
  },
  azure: {
    posture:
      "A Cosmos DB account encrypts data at rest by default and supports TLS in transit, but out of the box it is reachable over its public endpoint and ships with full-access account keys enabled, so the network exposure and the shared-secret keys are yours to lock down.",
    practices: [
      {
        risk: "Full-access shared keys",
        label:
          "Authenticate with Microsoft Entra ID and managed identities instead of account keys.",
        why: "Every Cosmos DB account is created with primary and secondary account keys that grant unrestricted read-write access to all data with no per-user attribution. A managed identity gives an Azure service an Entra ID identity with no secret to store, leak, or rotate. Passing account keys around in config or code spreads an all-powerful, hard-to-revoke secret whose leak compromises the entire account.",
      },
      {
        risk: "Public network exposure",
        label:
          "Disable public network access and connect only through Private Endpoints.",
        why: "A new account is exposed on a public endpoint reachable from the internet, gated only by credentials. Configuring a private endpoint places the account on a private IP inside your virtual network, and disabling public network access rejects everything that does not arrive through it. Leaving public access on means a stolen key or token can be used from anywhere in the world.",
      },
      {
        risk: "Over-broad data access",
        label:
          "Enforce least privilege with native data-plane RBAC and separate control-plane and data-plane identities.",
        why: "Cosmos DB exposes native data-plane role definitions that scope actions such as read, query, and item write down to the container level, distinct from Azure control-plane RBAC that manages the account itself. Using data-plane RBAC replaces the all-or-nothing account key with granular per-identity permissions, and keeping control-plane and data-plane identities separate prevents an app credential from also reconfiguring or deleting the account. Reusing one broadly-scoped identity turns any app compromise into a path to privilege escalation.",
      },
      {
        risk: "At-rest key control",
        label:
          "Keep encryption at rest on and add customer-managed keys in Azure Key Vault when you need to control the key lifecycle.",
        why: "All data in Cosmos DB is automatically encrypted at rest by default with service-managed keys, requiring no action to be protected. Adding a customer-managed key stored in Azure Key Vault layers on a second key you can rotate, audit, and revoke, so you can cut access to the stored data on demand. Relying only on service-managed keys means you have no independent lever to disable data access during an incident.",
      },
      {
        risk: "In-transit eavesdropping",
        label:
          "Set the account minimalTlsVersion floor to Tls12 and use TLS 1.3-capable client SDKs.",
        why: "Cosmos DB enforces a minimum TLS version at the application layer through the account minimalTlsVersion property, which defaults to Tls12 for new accounts, and TLS 1.0 and 1.1 are retired. TLS 1.3 is enabled across the platform and modern SDKs negotiate it automatically, giving faster handshakes and cipher suites that all provide forward secrecy. Running old clients that cannot meet the account floor breaks connections, and permitting deprecated protocols where still supported exposes data in transit to downgrade and interception.",
      },
      {
        risk: "Sensitive field exposure",
        label:
          "Encrypt sensitive fields client-side with Always Encrypted before they reach the service.",
        why: "Always Encrypted encrypts designated sensitive properties inside your application using keys you hold in Azure Key Vault, so the plaintext and the keys never reach Cosmos DB and the service and its operators only ever see ciphertext. This protects high-value fields even from a compromised account key or an over-privileged administrator. Storing such fields in the clear leaves them readable to anyone who gains data-plane access, which server-side encryption at rest alone does not prevent.",
      },
    ],
  },
};
