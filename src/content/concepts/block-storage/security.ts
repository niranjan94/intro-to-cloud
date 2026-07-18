import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the block-storage lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "Amazon EBS runs encryption on the servers that host EC2 instances, so it protects data at rest and I/O in transit between the instance and its attached volume, but per-Region encryption-by-default is off until you enable it and snapshots can be shared publicly, so enabling encryption, blocking public snapshot access, governing KMS keys, and scoping IAM are your responsibility.",
    practices: [
      {
        risk: "Unencrypted data at rest",
        label: "Turn on EBS encryption by default for every Region you use.",
        why: "New EBS volumes and snapshot copies are created unencrypted unless you enable encryption at creation or flip the account-wide, Region-specific 'Encryption by default' setting. Once enabled, every new volume and snapshot copy is automatically encrypted with a KMS key and the setting cannot be disabled per volume or snapshot in that Region, so nobody can accidentally provision plaintext block storage. It has no effect on existing volumes or snapshots, so it prevents future gaps rather than fixing current ones.",
      },
      {
        risk: "Public snapshot exposure",
        label: "Enable block public access for EBS snapshots in each Region.",
        why: "An EBS snapshot can be shared publicly with a single ModifySnapshotAttribute call, which would expose an entire disk image (including any secrets baked into it) to every AWS account. Enabling 'block public access for snapshots' at the account and Region level rejects any new public-sharing request, and the 'block all sharing' mode also treats already-public snapshots as private (though their attributes still read as shared). This is a Regional setting, so you must enable it in each Region where you keep snapshots. Without it, one mistaken sharing call leaks your data with no further barrier.",
      },
      {
        risk: "Weak key governance",
        label:
          "Encrypt with a customer managed KMS key instead of the default aws/ebs key.",
        why: "By default EBS uses the AWS managed key aws/ebs, which you cannot rotate, disable, or attach a custom key policy to. A customer managed KMS key lets you control rotation, disable or schedule deletion of the key (which revokes access to the data it protects), and restrict who can decrypt via the key policy and grants. EBS supports only symmetric KMS keys, and principals need explicit kms permissions on the key or volume attach and snapshot restore will fail.",
      },
      {
        risk: "Over-broad access",
        label:
          "Grant least-privilege IAM policies scoped with conditions, and validate them with IAM Access Analyzer.",
        why: "Users and roles have no EBS permissions by default, so access is entirely defined by the identity-based policies you write. Grant only the specific actions needed and tighten them with condition keys (for example aws:RequestTag to force tagging, or ec2:Encrypted to require encrypted volumes) so a compromised principal cannot create, attach, or snapshot arbitrary volumes. IAM Access Analyzer provides more than 100 policy checks to catch overly permissive or malformed policies before they ship.",
      },
      {
        risk: "Network exposure in transit",
        label:
          "Reach the EBS direct APIs over an interface VPC endpoint (AWS PrivateLink) and require TLS 1.2 or higher.",
        why: "The EBS direct APIs, which read and write snapshot block data, otherwise traverse the public internet. An interface VPC endpoint powered by AWS PrivateLink (service name com.amazonaws.<region>.ebs) keeps that traffic on the AWS network without an internet gateway, NAT device, or public IP, and you can attach a VPC endpoint policy to constrain which actions and principals are allowed. AWS requires TLS 1.2 (and recommends TLS 1.3) for all API traffic, and an aws:SecureTransport condition denies any non-TLS request. Without private connectivity, snapshot block data crosses paths you do not control.",
      },
      {
        risk: "Legacy unencrypted volumes",
        label:
          "Remediate existing plaintext volumes by snapshotting and restoring through an encrypted copy.",
        why: "You cannot encrypt an existing volume or snapshot in place, so pre-existing plaintext disks stay plaintext even after you enable encryption by default. To remediate, snapshot the unencrypted volume, create an encrypted copy of that snapshot (or, with encryption by default on, restore so the new volume is encrypted), and build the new volume from it. Skipping this leaves older boot and data volumes readable if a shared snapshot or the underlying media is ever exposed.",
      },
    ],
  },
  azure: {
    posture:
      "Azure Managed Disks are always encrypted at rest with platform-managed keys by default, but temp disks, caches, and compute-to-storage traffic are not covered by that baseline, and import/export network exposure plus key ownership are yours to harden.",
    practices: [
      {
        risk: "Unencrypted temp and cache data",
        label:
          "Enable encryption at host to extend encryption to temp disks, caches, and data in flight.",
        why: "Server-side encryption (SSE) is always on for OS and data disks, but by design it does not encrypt the VM temp disk, the disk caches, or data flowing between the compute host and the storage cluster. Encryption at host is a VM-level option that encrypts all of that: it starts on the Azure host your VM runs on, so temp disk and cache data are encrypted at rest and flow encrypted to storage. Without it, sensitive data can persist in plaintext on the local temp disk and cache, a gap the platform default does not close.",
      },
      {
        risk: "Weak key governance",
        label:
          "Use customer-managed keys via a disk encryption set backed by Azure Key Vault.",
        why: "Default SSE uses platform-managed keys that you cannot rotate or revoke. Configuring a disk encryption set with a customer-managed key in Key Vault gives you lifecycle control: envelope encryption lets you rotate keys (including automatic rotation to the latest version within an hour) without re-encrypting the disk, and disabling or deleting the key blocks access to the data. For higher assurance you can enable double encryption at rest, layering a platform-managed key and a customer-managed key with different algorithms so no single compromised key or algorithm exposes the data.",
      },
      {
        risk: "Public disk exposure",
        label:
          "Set the disk network access policy to DenyAll and disable public network access, using a disk access resource and Private Endpoints for import and export.",
        why: "Managed disk import and export normally generates a SAS URL reachable over the public internet (the default NetworkAccessPolicy is AllowAll). Setting NetworkAccessPolicy to DenyAll blocks all export, or AllowPrivate plus a disk access resource with a Private Endpoint forces traffic onto your virtual network and the Microsoft backbone. Disabling publicNetworkAccess removes the public surface entirely, so a leaked SAS URL cannot be used from the open internet to read or write a disk image.",
      },
      {
        risk: "Unauthorized data export",
        label:
          "Authorize disk operations with Microsoft Entra ID RBAC and avoid SAS tokens and shared keys.",
        why: "SAS tokens and shared keys are bearer credentials: anyone who obtains one can import or export disk data, and they are hard to revoke. Using Azure RBAC with Microsoft Entra ID means each request is authenticated as a user, group, managed identity, or service principal and authorized by an OAuth 2.0 token, so you grant only the export and import permissions needed via a custom role that omits the download and upload actions. If you must use a SAS, scope it tightly and set expiry to 60 days or less to limit the blast radius of a leak.",
      },
      {
        risk: "Undetected anomalies",
        label:
          "Turn on Microsoft Defender for Cloud to alert on suspicious disk activity.",
        why: "Without monitoring, anomalous access or export of a disk can go unnoticed. Microsoft Defender for Cloud triggers security alerts when anomalies in activity occur and notifies subscription administrators by email with details of the suspicious activity and remediation guidance. It also surfaces disk encryption recommendations (for example flagging VMs that do not have encryption at host enabled) so misconfigured disks are caught rather than silently drifting out of policy.",
      },
      {
        risk: "Accidental deletion or data loss",
        label:
          "Apply an Azure Resource Manager lock and enable Azure Backup on important disks.",
        why: "A managed disk deleted by mistake or by a compromised principal takes its data with it, and encryption does nothing to prevent that. An Azure Resource Manager CanNotDelete lock blocks deletion even for principals who otherwise have write access, and Azure Backup (or incremental snapshots and restore points) provides recoverable point-in-time copies. Together they protect against both operational error and destructive attacks.",
      },
    ],
  },
};
