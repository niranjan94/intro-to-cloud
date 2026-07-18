import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the dns lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "Route 53 runs on AWS-managed infrastructure and requires TLS 1.2 or higher for its control-plane APIs, but public hosted zones are internet-visible and unsigned by default, and it is entirely your responsibility to lock down who can edit records, whether zones are signed with DNSSEC, and whether queries and API calls are logged.",
    practices: [
      {
        risk: "DNS record hijack",
        label:
          "Scope Route 53 IAM permissions to least privilege and keep the root user out of daily record editing.",
        why: "Route 53 access is governed by identity-based IAM policies, so anyone holding route53:ChangeResourceRecordSets on a hosted zone can silently repoint your domain to an attacker's server. Grant record-level permissions using IAM policy conditions for fine-grained access control instead of account-wide wildcards, require human users to federate for temporary credentials via IAM Identity Center, and reserve the root user for tasks that truly need it. Skip this and a single leaked long-lived key becomes full control over where your traffic resolves.",
      },
      {
        risk: "DNS spoofing / tampering",
        label:
          "Enable DNSSEC signing on public hosted zones so resolvers can validate responses.",
        why: "Without DNSSEC, a resolver cannot tell a genuine Route 53 answer from a forged one injected by an on-path attacker or a poisoned cache, so users can be steered to malicious IPs. Turning on DNSSEC signing makes Route 53 sign every response for the zone with public-key cryptography using a key-signing key (KSK) based on an asymmetric AWS KMS customer managed key that you own and are responsible for rotating. You must also publish the Delegation Signer (DS) record at the parent zone, or validation never activates.",
      },
      {
        risk: "Internal name exposure",
        label:
          "Use private hosted zones for internal names instead of publishing them in public zones.",
        why: "A private hosted zone answers only for queries originating inside the associated VPCs (or through a hybrid inbound endpoint), so internal hostnames like db.example.com never appear in public DNS. Putting internal records in a public zone hands attackers a free map of your infrastructure for reconnaissance. Queries from outside the associated VPCs or hybrid setup fall through to recursive resolution on the internet and simply do not see the private records.",
      },
      {
        risk: "Credential interception",
        label:
          "Require TLS 1.2 or higher (TLS 1.3 recommended) with forward-secret ciphers for all Route 53 API calls.",
        why: "Every Route 53 configuration change travels over AWS published API calls, and the service requires TLS 1.2 as a minimum and recommends TLS 1.3, with cipher suites offering perfect forward secrecy such as DHE or ECDHE. This keeps SigV4-signed requests and responses confidential and integrity-protected in transit. Pinning clients and SDKs to modern TLS prevents downgrade attacks that could expose or alter API traffic.",
      },
      {
        risk: "Undetected changes",
        label:
          "Turn on CloudTrail for API activity and DNS query logging for public zones.",
        why: "CloudTrail records who changed which hosted zone or record, from what IP address, and when, giving you the audit trail needed to spot and investigate unauthorized modifications. Public DNS query logging captures the domains, timestamps, and record types resolvers ask for, which surfaces abnormal patterns such as DNS tunneling or lookups of newly registered malicious names. Query logging is not on by default, so without it a compromise leaves no forensic evidence.",
      },
      {
        risk: "Signed-zone outage",
        label:
          "Alarm on DNSSEC key failures with CloudWatch once signing is enabled.",
        why: "DNSSEC turns a silent misconfiguration into a hard failure: if a key-signing key breaks or your KMS key becomes inaccessible, resolvers that validate signatures will refuse every answer and the whole zone goes dark. AWS strongly recommends a CloudWatch alarm that fires whenever a DNSSECInternalFailure or DNSSECKeySigningKeysNeedingAction error is detected, so you can react before the zone becomes unresolvable. This is the sharp edge that catches teams who enable DNSSEC and walk away.",
      },
    ],
  },
  azure: {
    posture:
      "Azure DNS is governed entirely by Azure RBAC on the Resource Manager control plane and stores no customer content that needs data-plane authentication, which means the security you actually get is exactly the RBAC scoping, resource locks, private zones, Defender, security policies, and logging that you choose to configure, since none of it is enforced by default.",
    practices: [
      {
        risk: "Unauthorized DNS edits",
        label:
          "Assign granular DNS roles at the narrowest scope instead of broad administrative roles.",
        why: "Azure DNS access is controlled through Azure RBAC, and a role like DNS Zone Contributor or Private DNS Zone Contributor lets you delegate record management without handing over subscription-wide power. Assign these at the DNS zone or individual record-set scope, and use custom roles when you need to restrict management to specific record types. Granting Owner or Contributor on the whole subscription means anyone managing one app can rewrite every domain's records.",
      },
      {
        risk: "Internal name exposure",
        label:
          "Use Azure Private DNS zones for internal name resolution so records never reach public DNS.",
        why: "Azure Private DNS zones resolve names only within linked virtual networks, keeping internal hostnames and IP layout hidden from external reconnaissance. Separating public and private resolution isolates the internal resolution path from the internet so external DNS servers never see the records. Publishing internal endpoints in a public zone gives attackers a ready-made inventory of your environment.",
      },
      {
        risk: "Accidental / malicious deletion",
        label:
          "Apply Resource Manager locks (CanNotDelete or ReadOnly) to critical DNS zones and record sets.",
        why: "A single deleted or edited zone can take an entire domain offline or open the door to subdomain takeover, and RBAC alone does not stop a legitimately privileged admin from a fatal mistake. A CanNotDelete lock blocks removal while a ReadOnly lock blocks all changes, and Microsoft recommends resource locks alongside granular RBAC as defense in depth so critical zones survive both accidents and compromised accounts. This is the low-cost guardrail teams most often skip.",
      },
      {
        risk: "DNS-based attacks",
        label:
          "Enable Microsoft Defender for DNS to detect suspicious query activity.",
        why: "Defender for DNS monitors queries sent to Azure-provided name resolution without deploying any agents and raises alerts for data exfiltration via DNS tunneling, malware communicating with command-and-control servers, and resolution of known malicious or phishing domains. For new subscriptions this coverage is bundled into the Defender for Servers Plan 2 rather than a standalone plan, and it stays off until you enable that plan. Without it, DNS-channel abuse blends into normal traffic and goes unnoticed.",
      },
      {
        risk: "Malicious domain resolution",
        label:
          "Deploy DNS security policies with the threat intelligence feed to block malicious domains at the VNet level.",
        why: "A DNS security policy filters and logs DNS queries for both public and private traffic within a linked virtual network, letting you allow, alert, or block name resolution by domain list. Enabling Microsoft's threat intelligence feed as a managed domain list blocks resolution of domains that the Microsoft Security Response Center (MSRC) flags as malicious before a client ever connects. Note that a VNet can be linked to only one security policy at a time and rules are processed by priority following DNS hierarchy, so plan blocklists carefully to avoid blocking required Azure services.",
      },
      {
        risk: "No audit trail",
        label:
          "Enable Azure resource logs, metrics, and Monitor alerts for DNS zones.",
        why: "Azure DNS emits resource logs and metrics that you route via a diagnostic setting to a storage account, Log Analytics workspace, or event hub, while the Azure activity log captures subscription-level administrative changes to zones and record sets. Configure Azure Monitor alerts on unexpected changes so unauthorized edits are caught quickly rather than after an outage. Resource log collection is customer configured and off until you create a diagnostic setting, so without it you have no visibility into which lookups your infrastructure made.",
      },
    ],
  },
};
