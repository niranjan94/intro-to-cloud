import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the Microsoft Defender for Cloud recommendation "Management ports
 * of virtual machines should be protected with just-in-time network access
 * control" (High severity, secure-management-ports control), surfaced as an OCSF
 * Compliance Finding (class 2003). The detector reports the configuration
 * exposure: a network security group with an overly permissive inbound rule for
 * a management port and no just-in-time (JIT) VM access configured. It does not
 * determine whether the port has actually been accessed by an unauthorized
 * party.
 *
 * mitre is left undefined on purpose. External Remote Services (T1133) describes
 * an adversary leveraging an exposed remote service, but this is a posture
 * finding, not observed technique use, and Defender recommendations do not carry
 * an ATT&CK technique tag. Attaching one would imply an intrusion the evidence
 * does not show, which is the exact confusion this case exists to correct.
 *
 * This is a route case. An NSG opening RDP to the internet with JIT off is a real
 * exposure, but with no successful anomalous sign-in, no failed-login spike beyond
 * ambient internet scanning, and no post-access activity, it is a configuration
 * gap owned by the VM/platform team, not a SOC incident. The exercise is choosing
 * route (real finding, hand to the owner) over escalate (treat as active
 * intrusion) and over close (nothing to do). The verdict leans on the Meridian
 * baseline, which establishes that administrators reach hosts through trusted VPN
 * egress (198.51.100.0/24) rather than the open internet.
 *
 * All instance data is fictional (ADR-0005): org "Meridian", subscription
 * meridian-prod, tenant meridian.onmicrosoft.com, RFC 5737 public addresses,
 * RFC 1918 internal addresses, placeholder identifiers.
 */
const investigation: Investigation = {
  id: "azure-open-management-port",
  title: "RDP open to the internet",
  short:
    "Defender flags a VM with RDP reachable from anywhere and no just-in-time access. Break-in, or a door left open?",
  sourcePlatform: "azure",
  difficulty: "standard",
  severity: "high",
  eventType:
    "Management ports of virtual machines should be protected with just-in-time network access control",
  detectionSource: "Defender for Cloud",
  evidence: {
    signal: {
      title:
        "Management port exposed to the internet with no just-in-time access control",
      source: "Defender for Cloud",
      time: "2026-07-22 09:05:11 UTC",
      description:
        "Defender for Cloud identified an overly permissive inbound rule for a management port in the network security group associated with this virtual machine. Just-in-time access control is not configured, so the port is reachable from the internet continuously. Defender for Cloud reports the configuration exposure; it does not determine whether the port has been accessed by an unauthorized party.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Exposure",
          rows: [
            { label: "Network security group", value: "nsg-vm-dev-jump-02" },
            { label: "Rule name", value: "Allow-RDP-Inbound" },
            { label: "Direction", value: "Inbound" },
            {
              label: "Source",
              value: "0.0.0.0/0 (Internet, any address)",
              wide: true,
            },
            { label: "Destination port", value: "3389 (RDP)" },
            { label: "Protocol", value: "TCP" },
            { label: "Access", value: "Allow" },
            {
              label: "Just-in-time access",
              value: "Not configured for this VM",
              wide: true,
            },
            {
              label: "First observed",
              value: "2026-06-24 (rule has been open about four weeks)",
              wide: true,
            },
          ],
        },
        {
          heading: "Affected resource",
          rows: [
            { label: "Virtual machine", value: "vm-dev-jump-02" },
            { label: "Operating system", value: "Windows Server" },
            { label: "Role", value: "Developer jump host" },
            { label: "Resource group", value: "rg-sandbox-dev" },
            {
              label: "Private address",
              value: "10.20.4.12 in snet-sandbox-dev (10.20.4.0/24)",
              wide: true,
            },
            { label: "Public IP", value: "203.0.113.88" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Region", value: "eastus" },
            {
              label: "Reachable internal subnets",
              value:
                "Effective routes and NSG rules leave a path from this host into snet-data-prod (10.10.8.0/24), which holds production databases",
              wide: true,
            },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Observed inbound",
              value:
                "Continuous connection attempts to 3389 from many unrelated internet sources (2,179 in the last 24h), consistent with background scanning of any public address",
              wide: true,
            },
            {
              label: "Successful management logons",
              value: "None recorded through this rule",
              wide: true,
            },
            {
              label: "Public IP",
              value:
                "Assigned to this host by design so developers can reach the jump box remotely",
              wide: true,
            },
            {
              label: "Management access policy",
              value:
                "Meridian administrators reach hosts through trusted VPN egress (198.51.100.0/24); just-in-time access is the sanctioned path for on-demand management, not a standing internet-open port",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Recommendation ID", value: "DFC-NET-0518" },
            {
              label: "Category",
              value: "Network posture (secure management ports)",
            },
            { label: "Detection source", value: "Defender for Cloud" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Assessment time", value: "2026-07-22 09:05:11 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2003,
  "class_name": "Compliance Finding",
  "severity": "High",
  "status": "New",
  "activity_name": "Create",
  "finding_info": {
    "title": "Management ports of virtual machines should be protected with just-in-time network access control",
    "uid": "DFC-NET-0518"
  },
  "compliance": {
    "control": "Secure management ports",
    "standards": ["Microsoft Cloud Security Benchmark"],
    "status": "Fail",
    "status_detail": "Overly permissive inbound rule allows 3389/tcp from the internet; just-in-time access is not configured"
  },
  "resources": [
    { "uid": "vm-dev-jump-02", "type": "Microsoft.Compute/virtualMachines", "group": { "name": "rg-sandbox-dev" }, "region": "eastus" }
  ],
  "cloud": { "provider": "azure", "region": "eastus", "org": { "name": "meridian-prod" } },
  "unmapped": {
    "nsg_name": "nsg-vm-dev-jump-02",
    "rule_name": "Allow-RDP-Inbound",
    "rule_direction": "Inbound",
    "rule_access": "Allow",
    "source_address_prefix": "0.0.0.0/0",
    "destination_port_range": "3389",
    "protocol": "TCP",
    "jit_configured": false,
    "public_ip": "203.0.113.88",
    "first_observed": "2026-06-24T00:00:00Z",
    "inbound_probe_sources_24h": 2179,
    "successful_management_logons": 0,
    "reachable_subnets": ["10.10.8.0/24 (snet-data-prod)"]
  }
}`,
      unmapped: [
        { label: "rule_name", value: "Allow-RDP-Inbound" },
        {
          label: "source_address_prefix",
          value: "0.0.0.0/0 (Internet, any address)",
          wide: true,
        },
        { label: "jit_configured", value: "false" },
        { label: "successful_management_logons", value: "0" },
        {
          label: "reachable_subnets",
          value: "10.10.8.0/24 (snet-data-prod, production databases)",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "rdp-open-internet",
      label:
        "An NSG inbound rule allows RDP (3389) from the internet (0.0.0.0/0) on a management port",
      signal: true,
      reasoning: {
        prompt:
          "Why does an inbound rule opening 3389 to the internet warrant action even with no sign of a break-in?",
        options: [
          "Because an open management port means the host is already compromised and must be isolated at once",
          "Because an internet-exposed RDP port is standing attack surface that gets brute-forced continuously; it is a real exposure to remediate whether or not anyone has succeeded yet",
          "Because RDP is deprecated and Azure blocks port 3389 by default, so any allow rule is a misconfiguration error",
        ],
        correct: 1,
      },
      note: "You were right to flag it. An unrestricted management port is the exposure the recommendation is about. Flagging it means the rule gets tightened, not that an intrusion is assumed: exposure and compromise are different claims.",
    },
    {
      id: "jit-not-configured",
      label: "Just-in-time VM access is not configured for this host",
      signal: true,
      reasoning: {
        prompt: "What does the absence of just-in-time access tell you here?",
        options: [
          "That an attacker disabled JIT to keep their access, so this is post-compromise tampering",
          "That the management port stays open continuously instead of being opened only on approved, time-boxed request, which is the specific control the recommendation asks for",
          "That the VM is unmanaged and sits outside Meridian's subscription and tenant",
        ],
        correct: 1,
      },
      note: "Correct to flag. JIT is the sanctioned path for on-demand management access: it keeps the port closed and opens it only for an approved requester, for a bounded window. Its absence is why the port is standing open, and enabling it is the remediation.",
    },
    {
      id: "path-to-sensitive-subnets",
      label: "The exposed VM has a network path into production data subnets",
      signal: true,
      reasoning: {
        prompt:
          "Why does the host's reach into production data subnets change how you weight this exposure?",
        options: [
          "Because the reachable path means the production data subnets are already breached",
          "Because it raises the blast radius: an internet-exposed host that can pivot into sensitive internal systems is a higher-priority exposure to close, so the owning team should treat it accordingly",
          "Because the SOC must directly rewrite the data subnet's firewall rules itself before doing anything else",
        ],
        correct: 1,
      },
      note: "Correct to flag. Reachability into snet-data-prod is what turns an open port on a dev box into a real pivot risk. It raises the priority of the remediation; it does not, on its own, indicate that a compromise has occurred.",
    },
    {
      id: "dev-resource-group",
      label:
        "The VM lives in a development-looking resource group (rg-sandbox-dev)",
      signal: false,
      note: "A 'dev' or 'sandbox' name is a label, not a control. This host sits in the production subscription and has a path into production data, so its naming does nothing to lower the exposure. Do not let a reassuring resource-group name quiet a real open port.",
    },
    {
      id: "rule-open-for-weeks",
      label:
        "The permissive rule is not new; it has been open for about four weeks",
      signal: false,
      note: "Age is not exculpatory. A long-standing gap is still a gap, and if anything longevity means more time exposed, not less risk. The rule being old is also not evidence that anyone has used it, so it points neither toward escalation nor toward closing.",
    },
    {
      id: "background-scanning",
      label:
        "The port is receiving connection attempts from many internet sources",
      signal: false,
      note: "Every public address on the internet is scanned continuously; a few thousand probe sources in a day is ambient background, not evidence anyone got in. Probing is not authentication. The signal would be a successful anomalous logon, and there is none here.",
    },
    {
      id: "public-ip-by-design",
      label: "The VM has a public IP address",
      signal: false,
      note: "Having a public IP is expected for a host meant to be reached remotely and is not itself the finding. The exposure is the unrestricted 3389 rule with no JIT, not the presence of a public address. Removing the public IP is not the remediation; closing the port and enabling JIT is.",
    },
  ],
  extract: [
    {
      id: "nsg-rule",
      label: "Name of the permissive NSG rule",
      hint: "the rule_name in the exposure facts",
      accept: ["Allow-RDP-Inbound"],
      normalize: "text",
    },
    {
      id: "public-ip",
      label: "Public IP of the exposed VM",
      hint: "the address the port is reachable on",
      accept: ["203.0.113.88"],
      normalize: "ip",
    },
    {
      id: "exposed-port",
      label: "Exposed management port",
      hint: "the destination port in the NSG rule",
      accept: ["3389"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "route",
    why: "This is a real exposure, but it is a posture finding, not an incident. An NSG inbound rule allows RDP (3389) from the internet (0.0.0.0/0) on vm-dev-jump-02, just-in-time access is not configured, and the host has a network path into production data subnets, so the exposure is genuine and worth prioritizing. But nothing in the evidence shows a compromise: there is no successful anomalous sign-in, no failed-login spike beyond the ambient internet scanning every public address receives, and no post-access activity. That makes this a configuration gap to remediate, not an intrusion to respond to. The correct call is to route it to the VM and platform team to remove the permissive rule and enable JIT on their normal cadence, which resolves it for SOC purposes while the fix lands with the team that owns it. Escalate is the tempting wrong call: an internet-exposed management port looks alarming and the blast radius is real, but exposure is not compromise, and there is no evidence anyone has walked through the open door. Spending the incident process on a posture gap burns response capacity without fixing the misconfiguration any faster. Close is equally wrong: the exposure is real and unremediated, so a plain close treats a genuine, exploitable gap as noise and the port stays open. The principle: an open door no one has used is exposure to remediate, and remediation belongs to the owning team, not the incident queue.",
  },
};

export default investigation;
