import type {
  Difficulty,
  Investigation,
  Severity,
  SourcePlatform,
} from "@/components/investigation/types";
import { SOURCE_PLATFORMS } from "@/components/investigation/types";

/**
 * The Investigation catalog: lightweight queue metadata split from the full,
 * lazily-loaded Investigation data (mirrors `registry.ts`). The queue page and
 * navigation read only this metadata, so opening the queue never bundles every
 * answer key; the full `Investigation` for a given id is fetched on demand when
 * its page renders.
 *
 * Array order is the suggested attempt order. Each entry is hand-authored and
 * anchored to a real catalog event type, with all instance data fictional
 * (ADR-0005).
 */
export interface InvestigationMeta {
  id: string;
  title: string;
  /** One-line queue description, neutral and spoiler-free. */
  short: string;
  sourcePlatform: SourcePlatform;
  difficulty: Difficulty;
  severity: Severity;
  /** The anchored catalog event type, shown as the alert's rule name. */
  eventType: string;
  mitre?: string;
  /** Lazily loads the full Investigation payload. */
  data: () => Promise<{ default: Investigation }>;
}

/**
 * The queue metadata without the lazy `data` loader. A loader is a function and
 * therefore not serializable, so this is the shape a Server Component passes to
 * a client card across the RSC boundary. Use {@link toQueueItem} to drop it.
 */
export type InvestigationQueueItem = Omit<InvestigationMeta, "data">;

/** Strip the (non-serializable) loader so metadata can cross to a Client Component. */
export function toQueueItem(meta: InvestigationMeta): InvestigationQueueItem {
  const { data: _data, ...item } = meta;
  return item;
}

export const investigations: readonly InvestigationMeta[] = [
  {
    id: "aws-root-login",
    title: "Root account sign-in",
    short:
      "A root console login lands on the desk. Authorized change, or takeover?",
    sourcePlatform: "aws",
    difficulty: "guided",
    severity: "critical",
    eventType: "Root Account Login",
    mitre: "Valid Accounts (T1078)",
    data: () => import("./investigations/aws-root-login/data"),
  },
  {
    id: "aws-root-breakglass",
    title: "Another root account sign-in",
    short:
      "The same critical root-login rule fires again. This time, read the context before you call it.",
    sourcePlatform: "aws",
    difficulty: "challenge",
    severity: "critical",
    eventType: "Root Account Login",
    mitre: "Valid Accounts (T1078)",
    data: () => import("./investigations/aws-root-breakglass/data"),
  },
  {
    id: "aws-s3-public-bucket",
    title: "Bucket turned public",
    short: "An S3 bucket policy just opened to the world. Trace who and why.",
    sourcePlatform: "aws",
    difficulty: "standard",
    severity: "critical",
    eventType: "S3 Bucket Made Public",
    mitre: "Transfer Data to Cloud Account (T1537)",
    data: () => import("./investigations/aws-s3-public-bucket/data"),
  },
  {
    id: "aws-iam-new-user",
    title: "A new IAM user appears",
    short:
      "A fresh IAM user was provisioned overnight. Onboarding, or a foothold?",
    sourcePlatform: "aws",
    difficulty: "guided",
    severity: "medium",
    eventType: "New IAM User Created",
    mitre: "Create Account (T1136)",
    data: () => import("./investigations/aws-iam-new-user/data"),
  },
  {
    id: "aws-scheduled-key-rotation",
    title: "A new access key at 03:00",
    short:
      "GuardDuty flags an anomalous CreateAccessKey overnight. A persistence foothold, or routine automation?",
    sourcePlatform: "aws",
    difficulty: "standard",
    severity: "medium",
    eventType: "Anomalous IAM Credential Creation",
    mitre: "Account Manipulation: Additional Cloud Credentials (T1098.001)",
    data: () => import("./investigations/aws-scheduled-key-rotation/data"),
  },
  {
    id: "aws-macie-pii-exposure",
    title: "PII found in an application log bucket",
    short:
      "Macie found personal data in a private application log bucket. A real problem, or nothing to do?",
    sourcePlatform: "aws",
    difficulty: "standard",
    severity: "medium",
    eventType: "SensitiveData:S3Object/Personal",
    data: () => import("./investigations/aws-macie-pii-exposure/data"),
  },
  {
    id: "aws-pentest-kali",
    title: "API calls from a Kali Linux host",
    short:
      "GuardDuty flags API calls carrying a Kali Linux signature. Intrusion, or someone you hired?",
    sourcePlatform: "aws",
    difficulty: "standard",
    severity: "medium",
    eventType: "API Invoked from a Kali Linux Machine",
    data: () => import("./investigations/aws-pentest-kali/data"),
  },
  {
    id: "aws-instance-credential-exfil",
    title: "Instance credentials used from outside AWS",
    short:
      "GuardDuty says an EC2 role's temporary credentials are calling AWS from an external IP. Stolen and replayed, or a routing quirk?",
    sourcePlatform: "aws",
    difficulty: "standard",
    severity: "high",
    eventType: "EC2 Instance Credential Exfiltration",
    mitre: "Unsecured Credentials: Cloud Instance Metadata API (T1552.005)",
    data: () => import("./investigations/aws-instance-credential-exfil/data"),
  },
  {
    id: "aws-eicar-test-file",
    title: "A malicious file on a production host",
    short:
      "GuardDuty's malware scanner flags a malicious file on a production instance. Infection, or something you put there?",
    sourcePlatform: "aws",
    difficulty: "standard",
    severity: "high",
    eventType: "Malicious File Detected",
    data: () => import("./investigations/aws-eicar-test-file/data"),
  },
  {
    id: "aws-inspector-cve-noise",
    title: "A critical CVE on a quiet host",
    short:
      "Inspector flags a 9.8 CVE on a production instance. Emergency, or the daily noise?",
    sourcePlatform: "aws",
    difficulty: "standard",
    severity: "critical",
    eventType: "Package Vulnerability Detected",
    data: () => import("./investigations/aws-inspector-cve-noise/data"),
  },
  {
    id: "aws-inspector-cve-exploitable",
    title: "The same CVE, now reachable",
    short:
      "Another 9.8 from Inspector, same score as the last. This time look at where it lives.",
    sourcePlatform: "aws",
    difficulty: "challenge",
    severity: "critical",
    eventType: "Package Vulnerability Detected",
    mitre: "Exploit Public-Facing Application (T1190)",
    data: () => import("./investigations/aws-inspector-cve-exploitable/data"),
  },
  {
    id: "aws-guardduty-threatlist-egress",
    title: "A batch worker calling a flagged address",
    short:
      "GuardDuty says a private instance is beaconing to a threat-listed IP. Command-and-control, or something you own?",
    sourcePlatform: "aws",
    difficulty: "standard",
    severity: "high",
    eventType: "Outbound Traffic to Threat-Listed IP",
    mitre: "Application Layer Protocol: Web Protocols (T1071.001)",
    data: () => import("./investigations/aws-guardduty-threatlist-egress/data"),
  },
  {
    id: "aws-guardduty-dns-stale-intel",
    title: "A worker resolving a flagged domain",
    short:
      "GuardDuty says an instance is resolving a domain tied to a C&C server. Live threat, or stale intel?",
    sourcePlatform: "aws",
    difficulty: "challenge",
    severity: "high",
    eventType: "DNS Query to Known C&C Domain",
    mitre: "Application Layer Protocol: DNS (T1071.004)",
    data: () => import("./investigations/aws-guardduty-dns-stale-intel/data"),
  },
  {
    id: "azure-rbac-owner",
    title: "Owner granted at subscription scope",
    short:
      "Someone assigned a privileged RBAC role over an entire subscription.",
    sourcePlatform: "azure",
    difficulty: "standard",
    severity: "critical",
    eventType: "Privileged RBAC Role Assigned",
    mitre: "Cloud Accounts (T1078.004)",
    data: () => import("./investigations/azure-rbac-owner/data"),
  },
  {
    id: "azure-storage-public",
    title: "Storage account opened up",
    short:
      "A storage account flipped to public access. Careful before you call it.",
    sourcePlatform: "azure",
    difficulty: "standard",
    severity: "critical",
    eventType: "Storage Account Public Access Enabled",
    mitre: "Exfiltration Over Web Service (T1567)",
    data: () => import("./investigations/azure-storage-public/data"),
  },
  {
    id: "azure-authorized-vuln-scan",
    title: "A port scan from outside the network",
    short:
      "Defender flags an external host sweeping ports on the Edge API. Live reconnaissance, or an assessment you scheduled?",
    sourcePlatform: "azure",
    difficulty: "standard",
    severity: "medium",
    eventType: "Network Mapping or Port Scan Detected",
    mitre: "Network Service Discovery (T1046)",
    data: () => import("./investigations/azure-authorized-vuln-scan/data"),
  },
  {
    id: "azure-defender-crypto-mining",
    title: "A production VM starts mining",
    short:
      "Defender for Servers flags a prod VM for coin-mining behavior. Runaway workload, or a hijacked host?",
    sourcePlatform: "azure",
    difficulty: "standard",
    severity: "high",
    eventType: "Digital currency mining related behavior detected",
    mitre: "Resource Hijacking (T1496)",
    data: () => import("./investigations/azure-defender-crypto-mining/data"),
  },
  {
    id: "azure-open-management-port",
    title: "RDP open to the internet",
    short:
      "Defender flags a VM with RDP reachable from anywhere and no just-in-time access. Break-in, or a door left open?",
    sourcePlatform: "azure",
    difficulty: "standard",
    severity: "high",
    eventType:
      "Management ports of virtual machines should be protected with just-in-time network access control",
    data: () => import("./investigations/azure-open-management-port/data"),
  },
  {
    id: "azure-rbac-owner-direct",
    title: "Owner granted the direct way",
    short:
      "A known admin assigns Owner to a colleague from the office. Ordinary access management, or a policy the baseline forbids?",
    sourcePlatform: "azure",
    difficulty: "challenge",
    severity: "critical",
    eventType: "Privileged RBAC Role Assigned",
    mitre: "Cloud Accounts (T1078.004)",
    data: () => import("./investigations/azure-rbac-owner-direct/data"),
  },
  {
    id: "azure-pim-activation",
    title: "Owner activated through PIM",
    short:
      "An administrator activates Owner over production at 02:00. Sanctioned just-in-time access, or a privilege grab?",
    sourcePlatform: "azure",
    difficulty: "challenge",
    severity: "high",
    eventType: "Privileged Role Activated (PIM)",
    mitre: "Cloud Accounts (T1078.004)",
    data: () => import("./investigations/azure-pim-activation/data"),
  },
  {
    id: "azure-guest-agent-powershell",
    title: "Encoded PowerShell on a batch host",
    short:
      "Defender flags an encoded PowerShell command on a production server. Obfuscated intrusion, or something the platform runs on its own?",
    sourcePlatform: "azure",
    difficulty: "challenge",
    severity: "medium",
    eventType: "Suspicious Encoded PowerShell Command Line",
    mitre: "Command and Scripting Interpreter: PowerShell (T1059.001)",
    data: () => import("./investigations/azure-guest-agent-powershell/data"),
  },
  {
    id: "azure-sentinel-parser-error",
    title: "A brute-force spike on one account",
    short:
      "A Sentinel rule reports 200-plus failed sign-ins on one account inside twenty minutes. Real attack, or noise?",
    sourcePlatform: "azure",
    difficulty: "challenge",
    severity: "medium",
    eventType: "Brute Force Sign-in Attempts",
    mitre: "Brute Force (T1110)",
    data: () => import("./investigations/azure-sentinel-parser-error/data"),
  },
  {
    id: "azure-defender-fileless-benign",
    title: "Code running only in memory",
    short:
      "Defender for Servers flags a fileless technique inside a running process. A live implant, or the runtime doing its job?",
    sourcePlatform: "azure",
    difficulty: "challenge",
    severity: "high",
    eventType: "Fileless Attack Technique Detected",
    mitre: "Process Injection (T1055)",
    data: () => import("./investigations/azure-defender-fileless-benign/data"),
  },
  {
    id: "entra-impossible-travel",
    title: "Impossible travel that isn't",
    short:
      "A user signs in from two cities minutes apart. Stolen session, or something duller?",
    sourcePlatform: "entra",
    difficulty: "standard",
    severity: "medium",
    eventType: "Atypical Travel Detected",
    mitre: "Valid Accounts: Cloud Accounts (T1078.004)",
    data: () => import("./investigations/entra-impossible-travel/data"),
  },
  {
    id: "entra-risky-ip-cgnat",
    title: "A flagged address on a phone",
    short:
      "Entra flags a sign-in from an IP a threat feed calls malicious. Account takeover, or a bad reputation call?",
    sourcePlatform: "entra",
    difficulty: "standard",
    severity: "medium",
    eventType: "Sign-in from Malicious IP Address",
    mitre: "Valid Accounts (T1078)",
    data: () => import("./investigations/entra-risky-ip-cgnat/data"),
  },
  {
    id: "entra-stale-guest-admin",
    title: "A guest who never left",
    short:
      "An external guest still holds a privileged role, 200 days since its last sign-in. Leave it, or act on it?",
    sourcePlatform: "entra",
    difficulty: "standard",
    severity: "medium",
    eventType: "Dormant Privileged Guest Account",
    data: () => import("./investigations/entra-stale-guest-admin/data"),
  },
  {
    id: "entra-mfa-fatigue-approval",
    title: "An MFA prompt finally approved",
    short:
      "Fourteen denied push prompts, then one approval from a new device. Tired user, or push bombing?",
    sourcePlatform: "entra",
    difficulty: "challenge",
    severity: "high",
    eventType: "Suspicious MFA authentication approval",
    mitre: "Multi-Factor Authentication Request Generation (T1621)",
    data: () => import("./investigations/entra-mfa-fatigue-approval/data"),
  },
  {
    id: "entra-new-mfa-onboarding",
    title: "A new MFA method on a new account",
    short:
      "A days-old account just registered its first authenticator. Onboarding, or a foothold?",
    sourcePlatform: "entra",
    difficulty: "standard",
    severity: "medium",
    eventType: "New MFA Method Registered",
    mitre: "Account Manipulation: Device Registration (T1098.005)",
    data: () => import("./investigations/entra-new-mfa-onboarding/data"),
  },
  {
    id: "entra-oauth-illicit-consent",
    title: "Consent to a new mail-reading app",
    short:
      "Several users just consented to a brand-new OAuth app that reads their mail. Ordinary adoption, or a phishing campaign?",
    sourcePlatform: "entra",
    difficulty: "challenge",
    severity: "high",
    eventType: "OAuth Application Consent Granted",
    mitre: "Steal Application Access Token (T1528)",
    data: () => import("./investigations/entra-oauth-illicit-consent/data"),
  },
  {
    id: "entra-inbox-forwarding",
    title: "A quiet forwarding rule",
    short:
      "A mailbox rule now copies mail to an outside address. Read it closely.",
    sourcePlatform: "entra",
    difficulty: "challenge",
    severity: "high",
    eventType: "Suspicious Inbox Forwarding",
    mitre: "Email Forwarding Rule (T1114.003)",
    data: () => import("./investigations/entra-inbox-forwarding/data"),
  },
  {
    id: "entra-forwarding-authorized",
    title: "Mail forwarding to an external address",
    short:
      "A new inbox rule forwards mail to an address outside Meridian. Exfiltration channel, or an approved handoff?",
    sourcePlatform: "entra",
    difficulty: "challenge",
    severity: "high",
    eventType: "External Mail Forwarding Rule Created",
    mitre: "Email Forwarding Rule (T1114.003)",
    data: () => import("./investigations/entra-forwarding-authorized/data"),
  },
  {
    id: "entra-workload-identity-anomaly",
    title: "A known service principal reaches further",
    short:
      "A first-party service principal signed in and pulled a broad scope. Routine automation, or a stolen credential?",
    sourcePlatform: "entra",
    difficulty: "challenge",
    severity: "high",
    eventType: "Workload Identity Sign-in Anomaly",
    mitre: "Valid Accounts: Cloud Accounts (T1078.004)",
    data: () => import("./investigations/entra-workload-identity-anomaly/data"),
  },
  {
    id: "linux-ssh-success",
    title: "The failures stopped",
    short:
      "A burst of SSH failures on a host ended with one success. Then what?",
    sourcePlatform: "linux",
    difficulty: "challenge",
    severity: "high",
    eventType: "Successful SSH login after failures",
    mitre: "Brute Force: Password Cracking (T1110.003)",
    data: () => import("./investigations/linux-ssh-success/data"),
  },
];

/** Look up an Investigation's metadata by id. */
export function getInvestigation(id: string): InvestigationMeta | undefined {
  return investigations.find((investigation) => investigation.id === id);
}

/** A source platform paired with its Investigations, in catalog order. */
export interface PlatformGroup {
  platform: SourcePlatform;
  items: InvestigationMeta[];
}

/** Group Investigations by source platform for the queue and sidebar. */
export function investigationsByPlatform(): PlatformGroup[] {
  return SOURCE_PLATFORMS.map((platform) => ({
    platform,
    items: investigations.filter(
      (investigation) => investigation.sourcePlatform === platform,
    ),
  })).filter((group) => group.items.length > 0);
}
