import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Digital currency mining related behavior detected" catalog
 * event (AZ-DCM-001), the Microsoft Defender for Cloud alert VM_DigitalCurrencyMining
 * raised by Defender for Servers: High severity, detected from host data analysis,
 * mapped to Resource Hijacking (T1496). The detector reports that a process or
 * command normally associated with digital currency mining executed on the host.
 * Normalized into an OCSF Detection Finding (class_uid 2004). All instance data
 * below is fictional (ADR-0005): the organization is "Meridian", the Azure tenant
 * is meridian.onmicrosoft.com, external addresses are from RFC 5737 documentation
 * ranges, internal addresses from RFC 1918, and the mining pool domain is a
 * reserved .example value.
 */
const investigation: Investigation = {
  id: "azure-defender-crypto-mining",
  title: "A production VM starts mining",
  short:
    "Defender for Servers flags a prod VM for coin-mining behavior. Runaway workload, or a hijacked host?",
  sourcePlatform: "azure",
  difficulty: "standard",
  severity: "high",
  eventType: "Digital currency mining related behavior detected",
  mitre: "Resource Hijacking (T1496)",
  detectionSource: "Defender for Servers",
  evidence: {
    signal: {
      title: "Digital currency mining related behavior detected",
      source: "Microsoft Defender for Servers",
      time: "2026-07-18 07:41:33 UTC",
      description:
        "Analysis of host data on vm-invoicing-worker-2 detected the execution of a process normally associated with digital currency mining. The process has held the host at near-maximum CPU for several hours and maintains an outbound Stratum connection to an external pool address.",
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
            { label: "Compromised host", value: "vm-invoicing-worker-2" },
            { label: "OS", value: "Ubuntu 22.04 LTS (Linux)" },
            { label: "Process", value: "httpd (matches coin-miner xmrig)" },
            {
              label: "Process path",
              value: "/tmp/.xmr/httpd",
              wide: true,
            },
            {
              label: "Parent process",
              value: "bash (spawned from /tmp/.xmr/run.sh)",
              wide: true,
            },
            {
              label: "Command line",
              value:
                "/tmp/.xmr/httpd --url stratum+tcp://xmr-eu.hashvault-pool.example:3333 --user MERIDIAN --cpu-max 100 --background",
              wide: true,
            },
            { label: "Running as", value: "svc-invoicing (app service user)" },
            {
              label: "CPU utilization",
              value: "99% sustained (3h 24m average), baseline ~12%",
              wide: true,
            },
            {
              label: "Outbound connection",
              value: "203.0.113.88:3333 (Stratum), established, still open",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Resource Hijacking (T1496)"],
          rows: [
            {
              label: "Destination",
              value:
                "203.0.113.88 listed on a public mining-pool feed (xmr-eu.hashvault-pool.example)",
              wide: true,
            },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "VM workload",
              value:
                "Invoicing batch worker. It processes billing jobs and never runs mining or other compute-for-hire code.",
              wide: true,
            },
            {
              label: "Resource",
              value:
                "/subscriptions/7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41/resourceGroups/rg-sandbox-apps/providers/Microsoft.Compute/virtualMachines/vm-invoicing-worker-2",
              wide: true,
            },
            {
              label: "Recent change",
              value:
                "CHG-5310 deployed a new invoicing-worker build at 05:30 UTC, about two hours before the alert",
              wide: true,
            },
            {
              label: "Autoscale",
              value:
                "vmss-invoicing scaled from 2 to 5 instances at 06:20 UTC when CPU crossed the scale-out threshold",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AZ-DCM-001" },
            { label: "Category", value: "Compute abuse" },
            { label: "Detection source", value: "Defender for Servers" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Region", value: "eastus" },
            { label: "Event time", value: "2026-07-18 07:41:33 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "severity_id": 4,
  "severity": "High",
  "actor": {
    "process": {
      "name": "httpd",
      "cmd_line": "/tmp/.xmr/httpd --url stratum+tcp://xmr-eu.hashvault-pool.example:3333 --user MERIDIAN --cpu-max 100 --background",
      "file": { "path": "/tmp/.xmr/httpd" },
      "parent_process": { "name": "bash", "cmd_line": "/bin/bash /tmp/.xmr/run.sh" }
    }
  },
  "device": { "hostname": "vm-invoicing-worker-2", "os": { "name": "Ubuntu 22.04 LTS", "type": "Linux" } },
  "dst_endpoint": { "ip": "203.0.113.88", "port": 3333, "svc_name": "stratum" },
  "finding_info": {
    "title": "Digital currency mining related behavior detected",
    "attacks": [{ "technique": { "uid": "T1496", "name": "Resource Hijacking" } }]
  },
  "cloud": { "provider": "azure", "region": "eastus", "account": { "uid": "7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41" } },
  "unmapped": {
    "alert_type": "VM_DigitalCurrencyMining",
    "compromised_host": "vm-invoicing-worker-2",
    "resource_group": "rg-sandbox-apps",
    "process_user": "svc-invoicing",
    "cpu_avg_3h": "99%",
    "cpu_baseline": "12%",
    "mining_pool": "xmr-eu.hashvault-pool.example:3333",
    "dst_intel": "203.0.113.88 on public mining-pool feed",
    "change_ticket": "CHG-5310 (invoicing-worker deploy, 05:30 UTC)"
  }
}`,
      unmapped: [
        { label: "alert_type", value: "VM_DigitalCurrencyMining" },
        {
          label: "process_user",
          value: "svc-invoicing (app service user, not root)",
          wide: true,
        },
        { label: "cpu_avg_3h", value: "99% (baseline ~12%)" },
        {
          label: "mining_pool",
          value: "xmr-eu.hashvault-pool.example:3333",
          wide: true,
        },
        {
          label: "dst_intel",
          value: "203.0.113.88 on public mining-pool feed",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "cpu-pegged",
      label:
        "The host has held ~99% CPU for hours, far above its ~12% baseline",
      signal: true,
      reasoning: {
        prompt: "Why is sustained maximum CPU the core impact here?",
        options: [
          "High CPU only ever means the VM has outgrown its SKU and needs resizing",
          "Resource hijacking steals the host's compute for the attacker's profit, so CPU pegged well above baseline for hours is the direct impact of the abuse",
          "CPU utilization is a performance metric and can never be a security signal",
        ],
        correct: 1,
      },
      note: "Mining is compute-for-profit: the impact is measured in the CPU it consumes. Sustained near-100% usage against a ~12% baseline is the abuse itself, not a capacity problem.",
    },
    {
      id: "stratum-pool",
      label:
        "The host holds an outbound Stratum connection to a known mining pool",
      signal: true,
      reasoning: {
        prompt: "What does the outbound Stratum connection to a pool tell you?",
        options: [
          "Stratum is a standard web protocol, so this is ordinary outbound HTTPS traffic",
          "Stratum is the protocol miners use to talk to a pool, so an established session to a known pool address ties this host's compute to an attacker's mining operation",
          "The connection must be inbound, so it is just an external scan hitting the VM",
        ],
        correct: 1,
      },
      note: "Stratum on port 3333 to an address on a mining-pool feed is the miner reporting work and receiving jobs. It links the pegged CPU to an external, attacker-controlled pool rather than any Meridian service.",
    },
    {
      id: "miner-process",
      label:
        "A process matching a known coin-miner (xmrig) is running on the VM",
      signal: true,
      reasoning: {
        prompt: "Why does the miner process matter when CPU is already pegged?",
        options: [
          "It proves nothing, because any binary on the host can be renamed at will",
          "This VM's sanctioned workload is invoicing, not mining, so a coin-miner executing on it is unauthorized code rather than a legitimate compute job",
          "xmrig is a built-in Ubuntu system service, so its presence on the host is expected",
        ],
        correct: 1,
      },
      note: "The pegged CPU could in theory be a busy job; the identity of the process settles it. A coin-miner on a host whose only job is invoicing is code no one authorized to run there.",
    },
    {
      id: "dropped-tmp",
      label:
        "The miner ran from a world-writable temp path under a masqueraded name",
      signal: true,
      reasoning: {
        prompt: "Why are the execution path and disguised name significant?",
        options: [
          "Running from /tmp is how every Linux service starts, so the path is unremarkable",
          "A binary launched from a world-writable temp directory under a name that mimics a normal daemon (httpd) is a common way to stage and hide malware, which points at compromise rather than a sanctioned deployment",
          "The path affects only disk performance and has no bearing on security",
        ],
        correct: 1,
      },
      note: "Legitimate services install to managed paths and run under their own names. A miner sitting in /tmp/.xmr and calling itself httpd is deliberately hidden, a defense-evasion tell that this arrived through compromise.",
    },
    {
      id: "recent-deploy",
      label:
        "A sanctioned deployment (CHG-5310) to this VM completed two hours earlier",
      signal: false,
      note: "The deploy is real and ticketed, which is why it tempts. But a finished deployment does not hold CPU at 99% for hours or open a Stratum session to a mining pool. If anything the timing is a lead on how the miner arrived, not a reason to call the mining benign.",
    },
    {
      id: "autoscale-event",
      label:
        "The scale set added instances when CPU crossed the scale-out threshold",
      signal: false,
      note: "Autoscaling is a reaction to the high CPU, not its cause. Reading it as an explanation inverts the arrow: the scale-out is the platform responding to the load, and it only spreads the mining to more instances.",
    },
    {
      id: "sandbox-rg",
      label: "The VM lives in a resource group named rg-sandbox-apps",
      signal: false,
      note: "A resource group name is an organizational label, not a trust or exposure boundary. This VM is in the production subscription meridian-prod running production invoicing work; the word sandbox does not make an active miner low-priority.",
    },
  ],
  extract: [
    {
      id: "host",
      label: "Compromised host",
      hint: "the hostname Defender analyzed",
      accept: ["vm-invoicing-worker-2"],
      normalize: "text",
    },
    {
      id: "pool-domain",
      label: "Mining pool domain",
      hint: "the pool in the Stratum command line",
      accept: ["xmr-eu.hashvault-pool.example"],
      normalize: "domain",
    },
    {
      id: "pool-ip",
      label: "Mining pool IP address",
      hint: "the Stratum destination address",
      accept: ["203.0.113.88"],
      normalize: "ip",
    },
    {
      id: "miner-process",
      label: "Coin-miner the process matches",
      hint: "the miner the httpd process is identified as",
      accept: ["xmrig"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "The signals converge on an active compromise. The host has held near-100% CPU for over three hours, far off its ~12% baseline, while running a known coin-miner (xmrig) staged in a world-writable temp path under a disguised name and holding an open Stratum session to an address on a mining-pool feed. That is resource hijacking on a machine whose only sanctioned job is invoicing, so escalate on the incident path, isolate the VM from the network, capture the process and binary for forensics, and hunt for how the miner arrived and whether the same code is on the instances the scale set added. The tempting wrong call is to Close it as noise: the recent ticketed deploy, the autoscaling event, and the sandbox-looking resource group all invite you to write the CPU off as a capacity blip on a low-value box. None of them explains a Stratum connection to a mining pool or an unauthorized miner binary, and the resource group name does not change that the VM sits in the production subscription. Routing it to the app team as a performance issue would be just as wrong: there is nothing to tune here, there is an intruder spending your compute. The principle: high CPU is a symptom, and it is the identity of the process and where it is talking that decide whether you are looking at load or at theft.",
  },
};

export default investigation;
