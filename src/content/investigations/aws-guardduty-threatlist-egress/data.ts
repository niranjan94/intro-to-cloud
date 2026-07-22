import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Outbound Traffic to Threat-Listed IP" catalog event (AWS
 * GuardDuty, finding type UnauthorizedAccess:EC2/MaliciousIPCaller.Custom),
 * mapped to Application Layer Protocol: Web Protocols (T1071.001). A private
 * instance repeatedly reaching a public address on a custom threat list looks
 * like command-and-control beaconing on its face.
 *
 * Its verdict depends on the Meridian baseline. The destination, 203.0.113.61,
 * is Meridian's own Edge API public address; the custom threat list bulk-added
 * the surrounding 203.0.113.0/24 after an unrelated hostile host appeared in that
 * block. This is the "a range is not a verdict" case: the same documentation
 * range holds both a Meridian asset and attacker space, so the specific address,
 * not its range membership, decides the call. Without the baseline an analyst
 * cannot know 203.0.113.61 is a Meridian service, and the finding looks like C2.
 *
 * All instance data is fictional (ADR-0005): org "Meridian", account
 * 400123456789, RFC 1918/5737 addresses.
 */
const investigation: Investigation = {
  id: "aws-guardduty-threatlist-egress",
  title: "A batch worker calling a flagged address",
  short:
    "GuardDuty says a private instance is beaconing to a threat-listed IP. Command-and-control, or something you own?",
  sourcePlatform: "aws",
  difficulty: "standard",
  severity: "high",
  eventType: "Outbound Traffic to Threat-Listed IP",
  mitre: "Application Layer Protocol: Web Protocols (T1071.001)",
  detectionSource: "GuardDuty",
  evidence: {
    signal: {
      title: "EC2 instance communicating with a threat-listed address",
      source: "GuardDuty",
      time: "2026-06-25 14:03:11 UTC",
      description:
        "Amazon GuardDuty matched outbound connections from a production EC2 instance against an address on a customer-managed threat list. The instance made repeated HTTPS connections to 203.0.113.61 over the past day. GuardDuty reports the threat-list match; it does not identify what the destination address actually is.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Evidence",
          rows: [
            {
              label: "Finding type",
              value: "UnauthorizedAccess:EC2/MaliciousIPCaller.Custom",
              wide: true,
            },
            { label: "Direction", value: "Outbound (instance initiated)" },
            { label: "Remote address", value: "203.0.113.61" },
            { label: "Remote port", value: "443 (HTTPS)" },
            {
              label: "Connection pattern",
              value: "288 connections in 24h, roughly one every 5 minutes",
              wide: true,
            },
            {
              label: "Threat list",
              value: "meridian-suspect-hosts (customer-managed)",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Application Layer Protocol: Web Protocols (T1071.001)"],
          rows: [
            {
              label: "List entry",
              value: "203.0.113.0/24 added 2026-05-30",
              wide: true,
            },
            {
              label: "Entry reason",
              value:
                "Unrelated host 203.0.113.209 in this block was seen serving malware; the whole /24 was added in bulk",
              wide: true,
            },
          ],
        },
        {
          heading: "Affected resource",
          rows: [
            { label: "Instance", value: "i-0c5e83a1f4d29b76" },
            { label: "Role", value: "Batch worker" },
            { label: "Network", value: "vpc-0c11 / subnet-0e93 (private)" },
            { label: "Private IP", value: "10.42.7.23" },
            { label: "Public IP", value: "None (NAT gateway egress)" },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Destination attribution",
              value:
                "203.0.113.61 is the published public address of Meridian's internet-facing Edge API",
              wide: true,
            },
            {
              label: "Integration",
              value:
                "Batch workers call the Edge API's public endpoint on a fixed poll interval to fetch work items",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-GD-2207" },
            { label: "Category", value: "Network" },
            { label: "Detection source", value: "GuardDuty" },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "Event time", value: "2026-06-25 14:03:11 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "High",
  "actor": { "process": { "name": "worker-agent" } },
  "src_endpoint": { "ip": "10.42.7.23", "instance_uid": "i-0c5e83a1f4d29b76" },
  "dst_endpoint": { "ip": "203.0.113.61", "port": 443 },
  "finding_info": {
    "title": "EC2 instance communicating with a threat-listed IP",
    "types": ["UnauthorizedAccess:EC2/MaliciousIPCaller.Custom"],
    "attacks": [{ "technique": { "uid": "T1071.001", "name": "Web Protocols" } }]
  },
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "threat_list_name": "meridian-suspect-hosts",
    "threat_list_entry": "203.0.113.0/24",
    "threat_list_added": "2026-05-30",
    "connection_count_24h": 288,
    "connection_interval": "~300s",
    "resource_public_ip": null
  }
}`,
      unmapped: [
        { label: "threat_list_name", value: "meridian-suspect-hosts" },
        {
          label: "threat_list_entry",
          value: "203.0.113.0/24 (whole range, not a single host)",
          wide: true,
        },
        { label: "threat_list_added", value: "2026-05-30" },
        { label: "connection_count_24h", value: "288 (~1 every 5 min)" },
      ],
    },
  },
  aspects: [
    {
      id: "private-host-outbound",
      label:
        "A private-subnet instance is initiating repeated outbound connections to a public address",
      signal: true,
      reasoning: {
        prompt:
          "Why flag outbound traffic from a private batch worker even before you know the destination?",
        options: [
          "Because private instances are physically incapable of reaching the internet, so any outbound traffic is a logging error",
          "Because a private worker beaconing out to an unknown external host can be command-and-control or exfiltration, so the destination must be attributed before the alert is closed",
          "Because outbound traffic on port 443 is always malicious",
        ],
        correct: 1,
      },
      note: "You were right to flag it. A private worker reaching out to an unfamiliar public host is exactly what C2 looks like. Flagging means the destination must be attributed, not that it is automatically an incident; here it attributes to Meridian's own Edge API.",
    },
    {
      id: "threatlist-hit",
      label: "The destination address is on a threat-intelligence list",
      signal: true,
      reasoning: {
        prompt: "What should a threat-list match prompt you to do first?",
        options: [
          "Immediately block the address and escalate, because any list entry is authoritative",
          "Attribute the specific address, because a list can be over-broad and a match is a reason to look, not a verdict on its own",
          "Ignore it, because customer-managed lists are never reliable",
        ],
        correct: 1,
      },
      note: "Correct to check. A list hit earns a look. Here the list entry is the entire 203.0.113.0/24, added in bulk after an unrelated host in that block served malware, and it swept up Meridian's own Edge API address with it.",
    },
    {
      id: "range-membership",
      label:
        "The destination falls inside a range previously tied to malicious hosts",
      signal: false,
      note: "This is the trap. Per the Meridian baseline, 203.0.113.0/24 holds both a Meridian asset (the Edge API at .61) and attacker space, so range membership is not a verdict. The specific address, 203.0.113.61, is the Edge API; the range around it does not change that.",
    },
    {
      id: "beacon-periodicity",
      label:
        "The connections occur at a regular interval, resembling C2 beaconing",
      signal: false,
      note: "Fixed-interval connections are equally consistent with a client polling an API on a schedule. Periodicity alone does not distinguish a heartbeat from a beacon; here it is the batch worker's fixed poll to the Edge API.",
    },
    {
      id: "guardduty-severity",
      label: "GuardDuty rated the finding High severity",
      signal: false,
      note: "The detector's severity is an input to your analysis, not the verdict. GuardDuty rated the threat-list match, not this environment's exposure; the rating cannot know the destination is a Meridian service.",
    },
    {
      id: "port-443",
      label: "The traffic used HTTPS on port 443",
      signal: false,
      note: "Port 443 is the normal port for an API call, and encrypted transport is expected. Neither the port nor the encryption is evidence of intent here.",
    },
  ],
  extract: [
    {
      id: "dst-ip",
      label: "Destination address of the connections",
      hint: "the remote IP GuardDuty flagged",
      accept: ["203.0.113.61"],
      normalize: "ip",
    },
    {
      id: "instance",
      label: "Instance that initiated the traffic",
      hint: "the i-... source instance",
      accept: ["i-0c5e83a1f4d29b76"],
      normalize: "text",
    },
    {
      id: "threat-list",
      label: "Name of the threat list that matched",
      hint: "the customer-managed list in the finding",
      accept: ["meridian-suspect-hosts"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "Flagging the outbound traffic and the threat-list hit was the right instinct, and both resolve on attribution. Per the Meridian baseline, 203.0.113.61 is the published public address of Meridian's own internet-facing Edge API, and the batch workers call that endpoint on a fixed poll interval by design, which produced the regular connection pattern. The threat-list match is an artifact of the meridian-suspect-hosts list adding the entire 203.0.113.0/24 in bulk after an unrelated host in that block served malware. This is the baseline's 'a range is not a verdict' rule in practice: the same documentation range holds both a Meridian asset and attacker space, so the specific address, not the range, decides the call. Close the alert, note the Edge API attribution, and narrow the threat-list entry so it no longer covers Meridian's own addresses. The lesson: a threat-list or range match is a reason to look, and the specific address is what settles it.",
  },
};

export default investigation;
