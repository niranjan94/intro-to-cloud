import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Network Mapping or Port Scan Detected" catalog event
 * (Microsoft Defender for Servers network-traffic analysis, OCSF Detection
 * Finding, class 2004): Medium severity, mapped to Network Service Discovery
 * (T1046) under the Discovery tactic. The detector reports the traffic pattern,
 * a single source enumerating many ports, and does not determine whether the
 * source is authorized. This case is a benign true positive: a real port scan
 * did happen, but it originates from the contracted Approved Scanning Vendor's
 * published egress range, inside the scheduled monthly scan window, with no
 * exploitation follow-up. That makes it an authorized assessment rather than
 * adversary reconnaissance, so the correct call is to close it as benign with
 * the scanner attribution recorded, not to escalate it as recon and not to
 * treat the detection as a false positive. All instance data is fictional
 * (ADR-0005): org "Meridian", subscription meridian-prod, RFC 5737 addresses,
 * and a fictional contracted scanning vendor and change ticket.
 */
const investigation: Investigation = {
  id: "azure-authorized-vuln-scan",
  title: "A port scan from outside the network",
  short:
    "Defender flags an external host sweeping ports on the Edge API. Live reconnaissance, or an assessment you scheduled?",
  sourcePlatform: "azure",
  difficulty: "standard",
  severity: "medium",
  eventType: "Network Mapping or Port Scan Detected",
  mitre: "Network Service Discovery (T1046)",
  detectionSource: "Defender for Servers",
  evidence: {
    signal: {
      title:
        "Possible network mapping or port scan detected against a production host",
      source: "Defender for Servers",
      time: "2026-07-07 03:18:22 UTC",
      description:
        "Microsoft Defender for Servers analyzed network traffic to vm-edge-api-01 and detected a single external source connecting to a large number of distinct ports over a short interval, a pattern consistent with network mapping or a port scan. The detector reports the observed traffic pattern; it does not determine whether the source is a sanctioned scanner.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Scan activity",
          rows: [
            { label: "Source IP", value: "192.0.2.53" },
            {
              label: "Source network",
              value: "192.0.2.0/24 (external, hosting/datacenter ASN)",
              wide: true,
            },
            { label: "Target host", value: "vm-edge-api-01" },
            { label: "Distinct ports probed", value: "1,412" },
            {
              label: "Window",
              value: "03:18:22 to 03:22:10 UTC (about 4 minutes)",
              wide: true,
            },
            { label: "Scan type", value: "TCP SYN sweep" },
            {
              label: "Sessions established",
              value: "None beyond the scan probes",
              wide: true,
            },
            {
              label: "Exploit or auth attempts",
              value: "None observed after the scan",
              wide: true,
            },
          ],
        },
        {
          heading: "Target resource",
          rows: [
            { label: "Host", value: "vm-edge-api-01" },
            {
              label: "Role",
              value: "Internet-facing Edge API (public by design)",
              wide: true,
            },
            { label: "Public IP", value: "203.0.113.61" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Region", value: "eastus" },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Network Service Discovery (T1046)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Scanner attribution",
              value:
                "192.0.2.0/24 is the published scan-egress range of Aegis ASV, Meridian's contracted Approved Scanning Vendor, on the SOC allowlist",
              wide: true,
            },
            {
              label: "Authorization",
              value:
                "Scheduled under CHG-5188 for the monthly external ASV assessment window (first Tuesday, 02:00 to 06:00 UTC)",
              wide: true,
            },
            {
              label: "Follow-up",
              value:
                "No authentication, exploitation, or outbound connection followed the scan on vm-edge-api-01",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "DFC-NET-0342" },
            { label: "Category", value: "Network reconnaissance" },
            { label: "Detection source", value: "Defender for Servers" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Event time", value: "2026-07-07 03:18:22 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "severity": "Medium",
  "activity_name": "Create",
  "finding_info": {
    "title": "Possible network mapping or port scan detected",
    "uid": "DFC-NET-0342",
    "attacks": [{ "technique": { "uid": "T1046", "name": "Network Service Discovery" }, "tactic": { "uid": "TA0007", "name": "Discovery" } }]
  },
  "src_endpoint": { "ip": "192.0.2.53" },
  "dst_endpoint": { "ip": "203.0.113.61", "hostname": "vm-edge-api-01" },
  "cloud": { "provider": "azure", "region": "eastus", "org": { "name": "meridian-prod" } },
  "unmapped": {
    "distinct_ports_scanned": 1412,
    "scan_duration_seconds": 228,
    "scan_type": "tcp_syn",
    "established_sessions": 0,
    "exploit_attempts": 0,
    "src_asn_org": "Aegis ASV",
    "src_asn_type": "hosting/datacenter"
  }
}`,
      unmapped: [
        { label: "distinct_ports_scanned", value: "1412" },
        { label: "scan_duration_seconds", value: "228 (about 4 minutes)" },
        { label: "established_sessions", value: "0" },
        { label: "exploit_attempts", value: "0" },
        {
          label: "src_asn_org",
          value: "Aegis ASV (registered scan-vendor ASN)",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "port-sweep",
      label:
        "A single source probed a large number of distinct ports on the host in a short window",
      signal: true,
      reasoning: {
        prompt:
          "What is the right first move when a port scan is detected against your host?",
        options: [
          "Auto-close it, because port scans are constant background internet noise and rarely mean anything",
          "Attribute the source before you dispose of it: a scan is only benign once you can tie it to a known, authorized origin",
          "Isolate the host immediately, because any detected scan means the host is already compromised",
        ],
        correct: 1,
      },
      note: "You were right to flag it. Enumerating a host's open ports is genuine reconnaissance behavior and must be attributed before it can be dismissed. Here the source resolves to the contracted ASV inside its scheduled window, which is what makes it benign.",
    },
    {
      id: "exposed-target",
      label:
        "The scan was directed at the internet-facing Edge API, an exposed production asset",
      signal: true,
      reasoning: {
        prompt:
          "Why does the target being the internet-facing Edge API deserve a closer look?",
        options: [
          "Because internet-facing assets are out of SOC scope and should be handed to the network team",
          "Because an exposed asset is the most likely first target of a real intrusion, so a scan against it must be confirmed benign and checked for exploitation follow-up before closing",
          "Because public assets cannot be scanned, so the detection must be an error",
        ],
        correct: 1,
      },
      note: "Correct to check. The Edge API is meant to be reachable, which is exactly why a scan against it warrants confirming that nothing exploited what the scan found. Here no authentication or exploit attempt followed, and the scan was an authorized external assessment.",
    },
    {
      id: "mitre-recon-ttp",
      label:
        "The pattern maps to a known ATT&CK reconnaissance technique (Network Service Discovery, T1046)",
      signal: false,
      note: "The MITRE mapping names what the traffic pattern resembles, not who produced it or why. An authorized vulnerability assessment generates the identical T1046 pattern, so the technique tag is a description, not an attribution.",
    },
    {
      id: "high-port-count",
      label: "Over 1,400 distinct ports were probed within about four minutes",
      signal: false,
      note: "A high port count at speed is what any full-range scan looks like, authorized or not. Volume describes how thorough the scan was, not its intent, and does not distinguish a contracted ASV sweep from adversary recon.",
    },
    {
      id: "external-source",
      label:
        "The source address is external and sits outside Meridian's egress ranges",
      signal: false,
      note: "An outside-in assessment is external by definition. External origin is expected for a scan launched by a third-party vendor and is not, on its own, a signal. What matters is whether that specific address is the known, authorized scanner, which here it is.",
    },
    {
      id: "medium-severity",
      label: "Defender for Servers rated the alert Medium severity",
      signal: false,
      note: "The detector's severity is an input, not a verdict. The catalog severity rides on the alert regardless of context. The disposition comes from attributing the source, not from the score.",
    },
  ],
  extract: [
    {
      id: "source-ip",
      label: "Source IP of the scan",
      hint: "the external address enumerating the ports",
      accept: ["192.0.2.53"],
      normalize: "ip",
    },
    {
      id: "target-ip",
      label: "Public IP of the scanned host",
      hint: "the Edge API address in the destination endpoint",
      accept: ["203.0.113.61"],
      normalize: "ip",
    },
    {
      id: "change-ticket",
      label: "Change ticket authorizing the assessment",
      hint: "the CHG-... reference in the context",
      accept: ["CHG-5188"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "This is a benign true positive: the detector was right that a scan happened, and the scan is authorized. A single source did sweep about 1,400 ports on the internet-facing Edge API in four minutes, which is a genuine network-mapping pattern worth flagging. But the source, 192.0.2.53, sits in 192.0.2.0/24, the published scan-egress range of Aegis ASV, Meridian's contracted Approved Scanning Vendor, and the activity falls inside the scheduled monthly assessment window authorized under CHG-5188, with no authentication, exploitation, or outbound connection following. That attributes the scan to a sanctioned assessment rather than adversary reconnaissance. Close it and record the ASV attribution. Escalating as live recon is the tempting wrong call: the T1046 mapping, the high port count, and the external origin all describe what a scan looks like, not who ran it or why, and every one of them is equally true of an authorized ASV sweep, so none of them attributes the activity. It is also not a false positive to be dismissed as a misfire: a real scan did occur, so the right disposition is a benign close with the source attributed, which records that the scan was expected, rather than a close that implies the detection was wrong. And it is not a route, because there is no finding for an owning team to remediate; the activity is sanctioned. The transferable principle: a matching TTP tells you what the traffic resembles, while attribution to a known, authorized source is what tells you whether it is an incident.",
  },
};

export default investigation;
