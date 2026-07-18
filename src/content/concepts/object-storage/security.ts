import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the object-storage lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "Every S3 bucket ships private with Block Public Access enabled, ACLs disabled (Object Ownership set to bucket owner enforced), and SSE-S3 default encryption on, so the sharp edges you own are your bucket and IAM policies, enforcing HTTPS in transit, and never handing out long-term access keys.",
    practices: [
      {
        risk: "Public data exposure",
        label:
          "Keep S3 Block Public Access enabled and confirm no bucket policy or ACL makes the bucket public.",
        why: 'S3 Block Public Access is a bucket and account level guardrail that overrides any policy or ACL that would grant public read or write, so a mistaken `"Principal": "*"` statement cannot silently expose objects. New buckets enable it by default. If you turn it off to serve one public prefix, the whole bucket becomes reachable by anyone on the internet, which is the classic cause of leaked S3 data.',
      },
      {
        risk: "Credential compromise",
        label:
          "Grant access with least-privilege IAM and use IAM roles for apps and AWS services, never embedded long-term keys.",
        why: "S3 access is decided by IAM identity policies and S3 bucket resource policies, so scoping actions and resources to only what a task needs limits the blast radius of a mistake or a stolen credential. An IAM role hands EC2, Lambda, or ECS short-lived, auto-rotated credentials through the instance or task metadata service instead of static access keys baked into code. Long-term keys do not rotate and, if leaked, give an attacker durable access until you manually revoke them.",
      },
      {
        risk: "Traffic interception",
        label:
          "Deny non-HTTPS requests with an `aws:SecureTransport` false condition in the bucket policy.",
        why: "S3 endpoints accept both HTTP and HTTPS, so encryption in transit is only guaranteed once you add a bucket policy statement that denies requests where the `aws:SecureTransport` Boolean condition is false. Without it a client can still send objects and Signature credentials over plaintext HTTP, where an on-path attacker can eavesdrop or tamper with the traffic. AWS also recommends against pinning S3 TLS certificates because S3 renews them automatically and each renewal generates a new key pair.",
      },
      {
        risk: "Data at rest exposure",
        label:
          "Rely on default SSE-S3 encryption and move sensitive buckets to SSE-KMS for auditable key control.",
        why: "Since January 5, 2023 every bucket has server-side encryption on by default (SSE-S3), so all new object uploads are encrypted at rest automatically at no additional cost. Switching a bucket's default encryption to SSE-KMS with a customer managed KMS key gives you CloudTrail logging of every decrypt call and the ability to revoke access by disabling the key. Without KMS you lose that per-key audit trail and cannot cut off access to the ciphertext independently of the bucket policy.",
      },
      {
        risk: "Permission sprawl",
        label:
          "Keep ACLs disabled by applying the bucket owner enforced setting for S3 Object Ownership.",
        why: "S3 Object Ownership set to bucket owner enforced turns off ACLs entirely, so access is decided solely by IAM and bucket policies in one place instead of thousands of per-object ACLs. This is the default for new buckets. Legacy object ACLs are easy to misconfigure and can grant access, even to other AWS accounts, that your central bucket policy does not reflect, making audits unreliable.",
      },
      {
        risk: "Network exposure",
        label:
          "Route in-VPC access through a gateway VPC endpoint for S3 and restrict the bucket policy to that endpoint or VPC.",
        why: "A gateway VPC endpoint lets resources in your VPC reach S3 over the private AWS network instead of traversing the public internet, and a bucket policy `aws:SourceVpce` or `aws:SourceVpc` condition can require that path. This isolates the bucket so requests from anywhere else are denied, shrinking the exposed surface even if credentials leak. Without it, valid credentials plus the public S3 API endpoint are reachable from any network location.",
      },
    ],
  },
  azure: {
    posture:
      "A storage account encrypts all data at rest by default with Microsoft-managed keys and, for accounts created since late 2023, ships with Secure transfer required on and anonymous blob access disallowed, but Shared Key access, public network reachability, and older TLS versions can still be enabled, so disabling those and preferring Microsoft Entra ID identities are the edges you own.",
    practices: [
      {
        risk: "Key-based compromise",
        label:
          "Authorize with Microsoft Entra ID and Azure RBAC, then disallow Shared Key authorization on the account.",
        why: "Microsoft Entra ID authorizes each request against Azure RBAC role assignments and returns a short-lived OAuth 2.0 token, so there is no shared secret to leak, unlike the two account keys that grant full control of the whole account. Setting `allowSharedKeyAccess` to false makes Azure reject every request signed with an account key, and the account and service SAS tokens derived from it, leaving only Entra-authorized calls. If you leave Shared Key enabled, one leaked account key bypasses all RBAC role assignments and conditions.",
      },
      {
        risk: "Anonymous data exposure",
        label:
          "Disallow anonymous (public) read access to blobs and containers at the account level.",
        why: "When the account allows it, a user with the right permission can set a container's access level to public, granting read-only internet access to every blob inside with no authentication. Setting `allowBlobPublicAccess` to false at the account level overrides every container setting and makes anonymous access impossible to enable, closing the leak path. This is the Azure analogue of a public S3 bucket and a common cause of exposed blob data.",
      },
      {
        risk: "Traffic interception",
        label:
          "Keep Secure transfer required on and set the account minimum TLS version to 1.2.",
        why: "With the Secure transfer required property on (`supportsHttpsTrafficOnly`), the account rejects any request made over plain HTTP, so data and SAS tokens cannot travel unencrypted where an on-path attacker could read or alter them. Setting the minimum TLS version to 1.2 additionally refuses TLS 1.0 and 1.1 clients, which lack modern cipher suites. Secure transfer is enabled by default on new accounts, but the API-level minimum TLS default is still 1.0, so older or misconfigured clients can connect over weak channels until you raise it.",
      },
      {
        risk: "Network exposure",
        label:
          "Disable public network access and reach the account through a Private Endpoint plus firewall rules.",
        why: "A Private Endpoint assigns the storage account a private IP inside your virtual network so all traffic flows over the Microsoft backbone via Private Link instead of the public endpoint. Combined with setting the default public network access rule to deny and adding firewall allow-lists, this starts the account at zero public access and admits only named VNets or IP ranges. Without it the account's public endpoint is reachable from the entire internet and relies solely on credentials to hold.",
      },
      {
        risk: "Data at rest control",
        label:
          "Keep default encryption at rest and use customer-managed keys in Azure Key Vault for sensitive accounts.",
        why: "Azure Storage encrypts all data at rest by default with Microsoft-managed keys, so no action is needed for baseline protection. Configuring a customer-managed key in Azure Key Vault lets you control the key lifecycle, rotate on a schedule, and revoke it to render the data unreadable independently of the account. Without a CMK you cannot cut off cryptographic access or produce a key-level audit trail for compliance.",
      },
      {
        risk: "Over-broad SAS tokens",
        label:
          "If you must delegate access, issue short-lived user delegation SAS tokens and keep a revocation plan.",
        why: "A user delegation SAS is signed with Microsoft Entra ID credentials rather than the account key, so it inherits RBAC-based security and can be invalidated by revoking the user delegation key, instantly killing every signature made from it. Account-key-based SAS tokens cannot be revoked short of rotating the account key, and an over-long or leaked token grants standing access. Defining a SAS expiration policy keeps tokens short-lived and flags out-of-policy ones.",
      },
    ],
  },
};
