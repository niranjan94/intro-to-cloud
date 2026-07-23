import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the AWS GuardDuty finding type Backdoor:EC2/C&CActivity.B!DNS
 * ("An EC2 instance is querying a domain name that is associated with a known
 * command and control server"), default severity High, data source DNS logs,
 * mapped to Application Layer Protocol: DNS (T1071.004) under the Command and
 * Control tactic. Modeled as an OCSF Detection Finding (class_uid 2004).
 *
 * This is a false-positive teaching case. The flagged domain is genuinely on
 * threat intelligence as a former command-and-control (C&C) domain, but the
 * entry is stale: the domain lapsed and was re-registered to an approved SaaS
 * vendor, and it now resolves to that vendor's legitimate infrastructure. The
 * application's feature-flag client polls it on a schedule, which produces the
 * beacon-like periodicity. Present ownership exonerates the lookup, so the
 * correct call is to close it as a false positive rather than escalate as C2.
 *
 * All instance data is fictional (ADR-0005): org "Meridian", account
 * 400123456789, RFC 1918/5737 addresses, and .example domains. The approved
 * vendor "Flagfleet" and the re-registered domain cachegrid.example are invented.
 */
const investigation: Investigation = {
  id: "aws-guardduty-dns-stale-intel",
  title: "A worker resolving a flagged domain",
  short:
    "GuardDuty says an instance is resolving a domain tied to a C&C server. Live threat, or stale intel?",
  sourcePlatform: "aws",
  difficulty: "challenge",
  severity: "high",
  eventType: "DNS Query to Known C&C Domain",
  mitre: "Application Layer Protocol: DNS (T1071.004)",
  detectionSource: "GuardDuty",
  evidence: {
    signal: {
      title: "EC2 instance querying a C&C-associated domain",
      source: "GuardDuty",
      time: "2026-07-16 09:41:22 UTC",
      description:
        "Amazon GuardDuty observed the listed EC2 instance querying a domain name that appears on GuardDuty's threat intelligence as associated with a known command and control (C&C) server. The instance issued repeated DNS lookups for cfg.cachegrid.example over the past day. GuardDuty reports the domain's presence on its threat intelligence; it does not evaluate the domain's current ownership or resolution.",
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
              value: "Backdoor:EC2/C&CActivity.B!DNS",
              wide: true,
            },
            { label: "Action type", value: "DNS_REQUEST" },
            {
              label: "Queried domain",
              value: "cfg.cachegrid.example",
              wide: true,
            },
            { label: "Query protocol", value: "UDP/53 (A record)" },
            { label: "Blocked", value: "No" },
            {
              label: "Query pattern",
              value: "288 lookups in 24h, roughly one every 5 minutes",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Application Layer Protocol: DNS (T1071.004)"],
          rows: [
            {
              label: "Intel source",
              value: "GuardDuty managed threat intelligence",
              wide: true,
            },
            { label: "Threat name", value: "Wraithbot" },
            {
              label: "Domain on feed",
              value: "cachegrid.example (apex)",
              wide: true,
            },
            { label: "First listed", value: "2024-03-08" },
            { label: "Last confirmed active", value: "2024-09-19" },
          ],
        },
        {
          heading: "Domain reputation (current)",
          rows: [
            {
              label: "WHOIS registrant",
              value: "Flagfleet, Inc.",
              wide: true,
            },
            { label: "Registered", value: "2026-04-12 (re-registered)" },
            {
              label: "Current resolution",
              value: "192.0.2.40, 192.0.2.41",
              wide: true,
            },
            {
              label: "Historical resolution",
              value: "203.0.113.88 (2024, during listing)",
              wide: true,
            },
          ],
        },
        {
          heading: "Affected resource",
          rows: [
            { label: "Instance", value: "i-04f9a2c7e6b13d80" },
            { label: "Role", value: "Batch worker" },
            { label: "Network", value: "vpc-0c11 / subnet-0e93 (private)" },
            { label: "Private IP", value: "10.42.6.51" },
            { label: "Public IP", value: "None (NAT gateway egress)" },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Domain attribution",
              value:
                "cachegrid.example is the config-delivery edge for Flagfleet, an approved feature-flag and remote-config SaaS vendor",
              wide: true,
            },
            {
              label: "Integration",
              value:
                "The application's feature-flag client polls cfg.cachegrid.example on a 5-minute refresh to fetch flag configuration; onboarded under CHG-5310",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-GD-3391" },
            { label: "Category", value: "Network / DNS" },
            { label: "Detection source", value: "GuardDuty" },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "Event time", value: "2026-07-16 09:41:22 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "severity": "High",
  "activity_name": "Create",
  "src_endpoint": { "ip": "10.42.6.51", "instance_uid": "i-04f9a2c7e6b13d80" },
  "finding_info": {
    "title": "EC2 instance querying a C&C-associated domain",
    "types": ["Backdoor:EC2/C&CActivity.B!DNS"],
    "attacks": [
      {
        "technique": { "uid": "T1071.004", "name": "Application Layer Protocol: DNS" },
        "tactic": { "name": "Command and Control" }
      }
    ]
  },
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "raw_event": {
      "resourceRole": "TARGET",
      "action": {
        "actionType": "DNS_REQUEST",
        "dnsRequestAction": { "domain": "cfg.cachegrid.example", "protocol": "UDP", "blocked": false }
      }
    },
    "threat_intel": {
      "source": "GuardDuty managed threat intelligence",
      "threat_name": "Wraithbot",
      "domain_listed": "cachegrid.example",
      "first_listed": "2024-03-08",
      "last_confirmed_active": "2024-09-19"
    },
    "domain_reputation": {
      "whois_registrant": "Flagfleet, Inc.",
      "whois_created": "2026-04-12",
      "current_resolution": ["192.0.2.40", "192.0.2.41"],
      "historical_resolution": ["203.0.113.88"]
    },
    "query_count_24h": 288,
    "query_interval": "~300s"
  }
}`,
      unmapped: [
        { label: "threat_name", value: "Wraithbot (historical C&C family)" },
        { label: "first_listed", value: "2024-03-08" },
        { label: "last_confirmed_active", value: "2024-09-19" },
        { label: "whois_registrant", value: "Flagfleet, Inc." },
        { label: "whois_created", value: "2026-04-12 (re-registered)" },
        {
          label: "current_resolution",
          value: "192.0.2.40, 192.0.2.41 (Flagfleet edge)",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "private-worker-dns",
      label:
        "A private-subnet instance is issuing repeated automated DNS lookups for an external domain",
      signal: true,
      reasoning: {
        prompt:
          "Why flag automated DNS lookups from a private batch worker before you know the domain's status?",
        options: [
          "Because private instances cannot legitimately resolve external domains, so any lookup is malware",
          "Because DNS is a common covert channel for C&C and tunneling, so an unfamiliar external domain must be attributed before the alert is closed",
          "Because a lookup repeated every five minutes is proof of beaconing on its own",
        ],
        correct: 1,
      },
      note: "You were right to flag it. DNS is a favored covert channel, so a worker resolving an unfamiliar external domain is worth attributing. Flagging means you must identify the domain's current owner, not that the activity is automatically malicious; here it attributes to an approved vendor.",
    },
    {
      id: "c2-feed-match",
      label:
        "The queried domain matched threat intelligence as a known C&C domain",
      signal: true,
      reasoning: {
        prompt:
          "A domain matches a C&C threat feed. What does that match actually tell you?",
        options: [
          "That the domain is malicious right now and the instance is compromised, so escalate immediately",
          "That the domain was flagged at some point: a feed entry is a point-in-time claim, so you must confirm the domain's present ownership and resolution before trusting it",
          "That the feed is unreliable and the match can be ignored",
        ],
        correct: 1,
      },
      note: "Correct to check. A feed hit earns a look. But intel ages: this entry was added in 2024 when the domain served the Wraithbot C&C, and the domain has since lapsed and been re-registered. Present ownership, not the historical entry, settles it.",
    },
    {
      id: "whois-reregistered",
      label: "WHOIS shows the domain was re-registered only three months ago",
      signal: false,
      note: "A newly seen registration can be a real risk heuristic, since newly registered domains are often abused, which is why this looks suspicious. But the registrant here is a named, verifiable party, the approved vendor Flagfleet, and it matches the current resolution. Recent re-registration to a known-good owner is what exonerates the domain, not what indicts it.",
    },
    {
      id: "passive-dns-vendor",
      label:
        "Passive DNS shows the domain currently resolves to the vendor's published address range",
      signal: false,
      note: "This is exculpatory. The domain resolving to the approved vendor's own documented infrastructure is the attribution that clears the lookup. A fact that confirms benign ownership is not a suspicious aspect.",
    },
    {
      id: "periodic-lookups",
      label:
        "The lookups repeat at a fixed five-minute interval, resembling DNS beaconing",
      signal: false,
      note: "Fixed-interval lookups are equally consistent with a client polling a service on a schedule. The feature-flag SDK refreshes configuration every five minutes by design; periodicity alone does not distinguish a poll from a beacon.",
    },
    {
      id: "guardduty-high",
      label: "GuardDuty rated the finding High severity",
      signal: false,
      note: "The detector's severity is an input to your analysis, not the verdict. GuardDuty rated the match against its threat intelligence, which cannot know the domain changed hands; the rating does not reflect the domain's current ownership.",
    },
    {
      id: "standard-resolver",
      label:
        "The query was a normal A-record lookup over the VPC resolver on port 53",
      signal: false,
      note: "Standard DNS resolution over the VPC resolver is how every application finds a host. The channel and the record type are unremarkable; neither is evidence of intent here.",
    },
  ],
  extract: [
    {
      id: "domain",
      label: "Domain the instance queried",
      hint: "the fully qualified domain in the DNS_REQUEST action",
      accept: ["cfg.cachegrid.example"],
      normalize: "domain",
    },
    {
      id: "instance",
      label: "Instance that made the queries",
      hint: "the i-... source instance",
      accept: ["i-04f9a2c7e6b13d80"],
      normalize: "text",
    },
    {
      id: "threat-name",
      label: "Threat name the domain was listed under",
      hint: "the historical C&C family named in the threat intel",
      accept: ["Wraithbot"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "Flagging the automated DNS lookups and the C&C feed match was the right instinct, and both resolve once you check the domain's present state. The threat-intelligence entry for cachegrid.example is stale: it was added in 2024 when the domain hosted the Wraithbot C&C, but the registration then lapsed and the domain was re-registered on 2026-04-12 to Flagfleet, Inc., the approved feature-flag vendor Meridian onboarded under CHG-5310. WHOIS and passive DNS agree that cfg.cachegrid.example now resolves to Flagfleet's published edge range (192.0.2.40, 192.0.2.41), and the five-minute lookup interval is the feature-flag client refreshing configuration on schedule, not a beacon. This is a false positive, so close it. Escalating as command-and-control is the tempting wrong call, but it trusts a point-in-time feed entry as a current verdict and ignores that the domain has changed hands. It is also not a route: unlike a real-but-unreachable vulnerability, there is no genuine security finding to hand to an owning team, only a benign vendor lookup. The one follow-up is detection-engineering hygiene, pruning or aging out the stale intel entry so the re-registered domain stops re-alerting, which does not change the disposition. The lesson: a threat feed records what a domain was, not what it is; validate present ownership and resolution before you believe a list.",
  },
};

export default investigation;
