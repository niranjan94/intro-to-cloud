import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Suspicious Encoded PowerShell Command Line" catalog event
 * (AZ-DEF-3310): Medium, detected by Microsoft Defender for Servers (Plan 2),
 * mapped to Command and Scripting Interpreter: PowerShell (T1059.001). Defender
 * for Servers raises alerts on encoded and obfuscated command lines (for example
 * "Detected encoded executable in command line data"), and its own descriptions
 * note the pattern "could be legitimate activity, or an indication of a
 * compromised host". This case is the legitimate side of that coin: the encoded
 * PowerShell is the signed Azure VM guest agent (WindowsAzureGuestAgent) running
 * a routine extension health task on the VM itself. The decoded command and the
 * trusted Microsoft signer exonerate it, so the correct call is to close it as a
 * false positive. It teaches that an "encoded PowerShell" heuristic firing on a
 * signed platform binary is a misattribution: decode the payload and attribute
 * the launcher before judging the wrapper.
 *
 * The raw payload is a plausible OCSF Detection Finding (class 2004) carrying the
 * process as an evidence artifact; enrichment (decoded command, signer) rides in
 * the unmapped block. All instance data is fictional (ADR-0005): org "Meridian",
 * subscription id 7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41, RFC 1918 host address,
 * synthetic host and alert ids.
 */
const investigation: Investigation = {
  id: "azure-guest-agent-powershell",
  title: "Encoded PowerShell on a batch host",
  short:
    "Defender flags an encoded PowerShell command on a production server. Obfuscated intrusion, or something the platform runs on its own?",
  sourcePlatform: "azure",
  difficulty: "challenge",
  severity: "medium",
  eventType: "Suspicious Encoded PowerShell Command Line",
  mitre: "Command and Scripting Interpreter: PowerShell (T1059.001)",
  detectionSource: "Defender for Servers",
  evidence: {
    signal: {
      title: "Encoded PowerShell command line executed on a server",
      source: "Defender for Servers",
      time: "2026-07-19 02:47:11 UTC",
      description:
        "Microsoft Defender for Servers observed powershell.exe launched with a base-64 -EncodedCommand argument on MRDN-BATCH-03. Encoded command lines can be used to conceal instructions from inspection; the detector reports the pattern and notes it could be legitimate activity or an indication of a compromised host. It does not decode the payload or attribute the launching process.",
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
            { label: "Process", value: "powershell.exe" },
            {
              label: "Command line",
              value:
                "powershell.exe -NonInteractive -NoProfile -ExecutionPolicy Bypass -EncodedCommand JABFAHIAcgBvAHIAQQBjAHQAaQBvAG4AUAByAGUAZgBlAHIAZQBuAGMAZQA9ACcAUwB0AG8AcAAnADsAIAAkAHMAIAA9ACAARwBlAHQALQBTAGUAcgB2AGkAYwBlACAALQBOAGEAbQBlACAAUgBkAEEAZwBlAG4AdAAsAFcAaQBuAGQAbwB3AHMAQQB6AHUAcgBlAEcAdQBlAHMAdABBAGcAZQBuAHQAIAB8ACAAUwBlAGwAZQBjAHQALQBPAGIAagBlAGMAdAAgAE4AYQBtAGUALABTAHQAYQB0AHUAcwA7ACAAJABzACAAfAAgAEMAbwBuAHYAZQByAHQAVABvAC0ASgBzAG8AbgAgAC0AQwBvAG0AcAByAGUAcwBzAA==",
              wide: true,
            },
            {
              label: "Image path",
              value:
                "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
              wide: true,
            },
            {
              label: "Signer",
              value: "Microsoft Windows Publisher (signature valid)",
              wide: true,
            },
            {
              label: "Parent process",
              value: "WindowsAzureGuestAgent.exe",
            },
            {
              label: "Parent image path",
              value:
                "C:\\WindowsAzure\\GuestAgent_2.7.41491.1119\\WindowsAzureGuestAgent.exe",
              wide: true,
            },
            {
              label: "Parent signer",
              value: "Microsoft Corporation (signature valid)",
              wide: true,
            },
            { label: "Run as", value: "NT AUTHORITY\\SYSTEM" },
            { label: "Network connections", value: "None opened by process" },
          ],
        },
        {
          heading: "Decoded payload",
          rows: [
            {
              label: "Decoded command",
              value:
                "$ErrorActionPreference='Stop'; $s = Get-Service -Name RdAgent,WindowsAzureGuestAgent | Select-Object Name,Status; $s | ConvertTo-Json -Compress",
              wide: true,
            },
            {
              label: "What it does",
              value:
                "Reads the run state of the two guest-agent services and returns it as JSON. No download, no file write, no registry change, no network call.",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Command and Scripting Interpreter: PowerShell (T1059.001)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Host role",
              value:
                "Internal batch worker, private subnet, no inbound internet path",
              wide: true,
            },
            {
              label: "Guest agent",
              value:
                "The Azure VM guest agent runs extension and health tasks on the VM as SYSTEM, invoking powershell.exe with encoded arguments as a routine matter",
              wide: true,
            },
            {
              label: "Activity window",
              value:
                "Meridian runs no office-hours window; batch hosts and platform agents run continuously",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AZ-DEF-3310" },
            { label: "Category", value: "Execution" },
            { label: "Detection source", value: "Defender for Servers" },
            { label: "Host", value: "MRDN-BATCH-03" },
            { label: "Host IP", value: "10.20.4.31 (private)" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Region", value: "eastus" },
            { label: "Event time", value: "2026-07-19 02:47:11 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "category_uid": 2,
  "severity": "Medium",
  "severity_id": 3,
  "time": "2026-07-19T02:47:11Z",
  "finding_info": {
    "uid": "AZ-DEF-3310",
    "title": "Suspicious encoded PowerShell command line",
    "types": ["Execution"]
  },
  "attacks": [
    {
      "technique": { "uid": "T1059.001", "name": "Command and Scripting Interpreter: PowerShell" },
      "tactic": { "name": "Execution" }
    }
  ],
  "evidences": [
    {
      "process": {
        "name": "powershell.exe",
        "cmd_line": "powershell.exe -NonInteractive -NoProfile -ExecutionPolicy Bypass -EncodedCommand JABFAHIAcgBvAHIAQQBjAHQAaQBvAG4AUAByAGUAZgBlAHIAZQBuAGMAZQA9ACcAUwB0AG8AcAAnADsAIAAkAHMAIAA9ACAARwBlAHQALQBTAGUAcgB2AGkAYwBlACAALQBOAGEAbQBlACAAUgBkAEEAZwBlAG4AdAAsAFcAaQBuAGQAbwB3AHMAQQB6AHUAcgBlAEcAdQBlAHMAdABBAGcAZQBuAHQAIAB8ACAAUwBlAGwAZQBjAHQALQBPAGIAagBlAGMAdAAgAE4AYQBtAGUALABTAHQAYQB0AHUAcwA7ACAAJABzACAAfAAgAEMAbwBuAHYAZQByAHQAVABvAC0ASgBzAG8AbgAgAC0AQwBvAG0AcAByAGUAcwBzAA==",
        "file": {
          "path": "C:\\\\Windows\\\\System32\\\\WindowsPowerShell\\\\v1.0\\\\powershell.exe",
          "signature": { "certificate": { "issuer": "Microsoft Windows Production PCA 2011" }, "state": "Valid" }
        },
        "user": { "name": "NT AUTHORITY\\\\SYSTEM" },
        "parent_process": {
          "name": "WindowsAzureGuestAgent.exe",
          "file": {
            "path": "C:\\\\WindowsAzure\\\\GuestAgent_2.7.41491.1119\\\\WindowsAzureGuestAgent.exe",
            "signature": { "certificate": { "issuer": "Microsoft Corporation" }, "state": "Valid" }
          }
        }
      }
    }
  ],
  "device": {
    "hostname": "MRDN-BATCH-03",
    "ip": "10.20.4.31",
    "os": { "name": "Windows Server 2022", "type": "Windows" },
    "type": "Virtual Machine"
  },
  "cloud": { "provider": "azure", "region": "eastus", "account": { "uid": "7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41" } },
  "unmapped": {
    "decoded_command": "$ErrorActionPreference='Stop'; $s = Get-Service -Name RdAgent,WindowsAzureGuestAgent | Select-Object Name,Status; $s | ConvertTo-Json -Compress",
    "publisher": "Microsoft Windows Publisher",
    "launched_by": "Azure VM guest agent (platform extension host)",
    "process_network_connections": 0,
    "run_context": "local, no remote session"
  }
}`,
      unmapped: [
        {
          label: "decoded_command",
          value:
            "Get-Service RdAgent,WindowsAzureGuestAgent | ConvertTo-Json (health read)",
          wide: true,
        },
        { label: "publisher", value: "Microsoft Windows Publisher" },
        {
          label: "launched_by",
          value: "Azure VM guest agent (platform extension host)",
          wide: true,
        },
        { label: "process_network_connections", value: "0" },
      ],
    },
  },
  aspects: [
    {
      id: "encoded-command",
      label: "PowerShell was executed with a base-64 -EncodedCommand argument",
      signal: true,
      reasoning: {
        prompt:
          "Why is an encoded command line worth flagging even though it is often benign?",
        options: [
          "Because the -EncodedCommand switch is available only to malware and never to legitimate software",
          "Because the encoding hides the actual instructions, so the payload has to be decoded and read on its contents before the activity can be judged either way",
          "Because an encoded argument always means an execution-policy bypass is underway",
        ],
        correct: 1,
      },
      note: "Right to flag it. Encoding conceals the instructions, so the only sound move is to decode and read the payload. Here it decodes to a guest-agent service-status read, which is what clears it, not the fact that it was encoded.",
    },
    {
      id: "code-exec-prod",
      label: "Arbitrary PowerShell code ran on a production server",
      signal: true,
      reasoning: {
        prompt:
          "Why does code execution on a production host warrant triage even when it may be routine?",
        options: [
          "Because production servers should never run PowerShell under any circumstances",
          "Because arbitrary execution on production is high-impact if it is hostile, so it must be tied back to a known, legitimate launcher before it is dismissed",
          "Because any process on a production host is an incident until a change ticket is produced for it",
        ],
        correct: 1,
      },
      note: "Correct to note. Execution on production earns a look every time. The look resolves it here: the code is a read-only health check launched by the platform, not attacker activity.",
    },
    {
      id: "spawned-by-parent",
      label:
        "The PowerShell process was spawned by another process, whose legitimacy must be established",
      signal: true,
      reasoning: {
        prompt: "Why identify the parent process before judging the child?",
        options: [
          "Because a child process inherits its parent's file hash, so they are interchangeable",
          "Because a process is only as trustworthy as what launched it: attribution to a signed platform binary versus an unknown process is what separates benign automation from an intrusion",
          "Because a process running as SYSTEM is always safe regardless of what spawned it",
        ],
        correct: 1,
      },
      note: "This is the crux. The parent is WindowsAzureGuestAgent.exe, a Microsoft-signed platform binary running from the guest-agent install path. That attribution, plus the decoded payload, is what turns the alert benign.",
    },
    {
      id: "runs-as-system",
      label: "The process ran as NT AUTHORITY\\SYSTEM",
      signal: false,
      note: "Azure VM extensions and guest-agent tasks run under the Local System account by design. SYSTEM here is the expected context for a platform task, not evidence of privilege escalation. Who launched it, not the token it ran under, is the question.",
    },
    {
      id: "long-command",
      label: "The command line is unusually long",
      signal: false,
      note: "Length is a function of the base-64 payload: any encoded command looks long. The size of the string tells you nothing about intent once you have decoded what it actually contains.",
    },
    {
      id: "off-hours",
      label: "The command executed off-hours, at 02:47 UTC",
      signal: false,
      note: "Per the Meridian baseline there is no office-hours window, and platform agents and batch hosts run continuously. Time of day on its own is not an anomaly here; it is scored on who acted and from where.",
    },
    {
      id: "rule-fired",
      label: "A Defender for Servers rule flagged the command as suspicious",
      signal: false,
      note: "The detector's own description says the pattern could be legitimate activity or a sign of compromise. A rule firing is the reason to investigate, not a verdict. Treating the alert's existence as its own proof is how a false positive gets escalated.",
    },
    {
      id: "many-alerts",
      label:
        "The subscription raised many Defender for Servers alerts this week",
      signal: false,
      note: "The volume of alerts across the subscription is background scale. It describes how busy the queue is, not whether this specific execution is malicious.",
    },
  ],
  extract: [
    {
      id: "host",
      label: "Host the command ran on",
      hint: "the device hostname in the finding",
      accept: ["MRDN-BATCH-03", "MRDN-BATCH-03.meridian.example"],
      normalize: "text",
    },
    {
      id: "parent-process",
      label: "Parent process that launched PowerShell",
      hint: "the parent_process name in the evidence",
      accept: ["WindowsAzureGuestAgent.exe", "WindowsAzureGuestAgent"],
      normalize: "text",
    },
    {
      id: "process",
      label: "Process the detector flagged",
      hint: "the flagged process image name",
      accept: ["powershell.exe", "powershell"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "This is a false positive and closes as benign. The encoded command line is what the rule fired on, but the encoding is only a wrapper: decoded, it reads the run state of the two guest-agent services and returns JSON, with no download, file write, registry change, or network call. The launcher is WindowsAzureGuestAgent.exe, a Microsoft-signed platform binary running from the guest-agent install path, and powershell.exe is the signed Microsoft binary at its standard System32 location, running as SYSTEM on the VM itself with no remote session. Every attribute the detector could not see, the decoded payload and the trusted signer, points to the Azure VM guest agent doing routine work. The tempting wrong call is escalate: the command is encoded, uses -ExecutionPolicy Bypass, runs as SYSTEM, and fired off-hours, which reads like obfuscated intrusion at a glance. But each of those is expected for a platform extension task, and none survives decoding the payload and attributing the parent. Route would be wrong too: there is no real finding to hand to an owning team, nothing to patch or remediate, only a heuristic that misattributed a signed platform binary. The lesson: an 'encoded PowerShell' heuristic is a prompt to decode and attribute, not a verdict. Judge the decoded instructions and the launching process, not the encoding, the length, the privilege, or the hour.",
  },
};

export default investigation;
