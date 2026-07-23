import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Fileless Attack Technique Detected" catalog event (Microsoft
 * Defender for Servers, alert type VM_FilelessAttackTechnique.Windows): High
 * severity, detected via Defender for Servers memory forensics, mapped to Process
 * Injection (T1055) and reported as OCSF Detection Finding (class 2004). The
 * heuristic fires on a thread executing from a dynamically allocated,
 * non-image-backed RWX memory region, the defining trait of reflective injection.
 * Here that region is the .NET CLR just-in-time compiler emitting native code at
 * runtime on a healthy application server, which is indistinguishable at the page
 * level from an in-memory implant. No dropped file, no outbound connection, a
 * signed runtime, and the identical alert fleet-wide after a deploy: this is a
 * false positive and the correct call is Close, with a detection-tuning note. All
 * instance data is fictional (ADR-0005): org "Meridian", subscription
 * meridian-prod, RFC 1918 addresses, placeholder identifiers.
 */
const investigation: Investigation = {
  id: "azure-defender-fileless-benign",
  title: "Code running only in memory",
  short:
    "Defender for Servers flags a fileless technique inside a running process. A live implant, or the runtime doing its job?",
  sourcePlatform: "azure",
  difficulty: "challenge",
  severity: "high",
  eventType: "Fileless Attack Technique Detected",
  mitre: "Process Injection (T1055)",
  detectionSource: "Defender for Servers",
  evidence: {
    signal: {
      title: "Fileless attack technique detected in a running process",
      source: "Defender for Servers",
      time: "2026-07-02 02:14:37 UTC",
      description:
        "Microsoft Defender for Servers found, in the memory of the process below, a behavior commonly associated with fileless attacks: a thread executing from a dynamically allocated, non-image-backed executable memory region marked read-write-execute. Defender reports the in-memory behavior it observed through memory forensics; it does not determine which component allocated the region.",
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
              label: "Detection type",
              value: "VM_FilelessAttackTechnique.Windows",
              wide: true,
            },
            { label: "Process", value: "dotnet.exe (PID 4812)" },
            {
              label: "Process image",
              value: "C:\\Program Files\\dotnet\\dotnet.exe",
              wide: true,
            },
            {
              label: "Command line",
              value: "dotnet MeridianBilling.dll",
              wide: true,
            },
            {
              label: "Memory region",
              value: "Dynamically allocated, not backed by a file on disk",
              wide: true,
            },
            { label: "Page protection", value: "RWX (PAGE_EXECUTE_READWRITE)" },
            {
              label: "Executing module",
              value: "coreclr.dll (.NET CLR JIT engine)",
              wide: true,
            },
            { label: "Dropped files", value: "None" },
            { label: "Outbound connections", value: "None" },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Process Injection (T1055)"],
          rows: [
            {
              label: "MITRE tactics",
              value: "Defense Evasion, Execution",
              wide: true,
            },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Host role",
              value:
                "Internal .NET (ASP.NET Core) application server, app tier",
              wide: true,
            },
            {
              label: "Runtime behavior",
              value:
                "The .NET CLR compiles intermediate language to native code at runtime, writing it into dynamically allocated executable memory. This is normal just-in-time compilation.",
              wide: true,
            },
            {
              label: "Change ticket",
              value:
                "CHG-5233 (approved): nightly application release; app pools recycled fleet-wide at 02:00 UTC",
              wide: true,
            },
            {
              label: "Fleet pattern",
              value:
                "The identical alert fired on all four app-tier VMs within the same minute, right after the recycle",
              wide: true,
            },
            {
              label: "Binary signature",
              value: "dotnet.exe signed by Microsoft Corporation, unmodified",
              wide: true,
            },
            {
              label: "Network exposure",
              value: "Private subnet, no inbound internet path",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AZ-VM-3391" },
            { label: "Category", value: "Suspicious process activity" },
            { label: "Detection source", value: "Defender for Servers" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Region", value: "eastus" },
            { label: "Event time", value: "2026-07-02 02:14:37 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "category_uid": 2,
  "category_name": "Findings",
  "activity_id": 1,
  "severity": "High",
  "time": "2026-07-02T02:14:37Z",
  "finding_info": {
    "title": "Fileless attack technique detected",
    "uid": "AZ-VM-3391",
    "attacks": [
      {
        "technique": { "uid": "T1055", "name": "Process Injection" },
        "tactics": [{ "name": "Defense Evasion" }, { "name": "Execution" }]
      }
    ]
  },
  "process": {
    "name": "dotnet.exe",
    "pid": 4812,
    "cmd_line": "dotnet MeridianBilling.dll",
    "file": {
      "path": "C:\\\\Program Files\\\\dotnet\\\\dotnet.exe",
      "signature": { "vendor": "Microsoft Corporation", "state": "signed" }
    }
  },
  "resources": [
    { "uid": "vm-app-eastus-04", "type": "Microsoft.Compute/virtualMachines", "region": "eastus" }
  ],
  "cloud": { "provider": "azure", "region": "eastus", "org": { "uid": "meridian-prod" } },
  "unmapped": {
    "alertType": "VM_FilelessAttackTechnique.Windows",
    "productName": "Microsoft Defender for Servers",
    "memoryRegion": { "image_backed": false, "protection": "PAGE_EXECUTE_READWRITE" },
    "executingModule": "coreclr.dll (CLR JIT engine)",
    "networkConnections": [],
    "droppedFiles": [],
    "capabilities": ["dynamic_code_generation"]
  }
}`,
      unmapped: [
        { label: "alertType", value: "VM_FilelessAttackTechnique.Windows" },
        {
          label: "image_backed",
          value: "false (no file backs the executable memory)",
          wide: true,
        },
        {
          label: "protection",
          value: "PAGE_EXECUTE_READWRITE (RWX)",
        },
        {
          label: "executingModule",
          value: "coreclr.dll (CLR JIT engine)",
          wide: true,
        },
        { label: "networkConnections", value: "[] (none)" },
        { label: "droppedFiles", value: "[] (none)" },
      ],
    },
  },
  aspects: [
    {
      id: "nonimage-executable-memory",
      label:
        "A thread is executing from a dynamically allocated executable memory region not backed by any file on disk",
      signal: true,
      reasoning: {
        prompt:
          "Why is a thread running in non-image-backed executable memory worth flagging before you dismiss it?",
        options: [
          "Because non-image-backed executable memory is the defining trait of reflective code injection and in-memory implants, so the region must be attributed to a known component before the alert can be closed",
          "Because legitimate software never allocates executable memory at runtime, so any such region is malicious by definition",
          "Because Windows blocks executable memory that is not backed by a file, so its presence proves the kernel was tampered with",
        ],
        correct: 0,
      },
      note: "Right to flag. Executable memory with no backing file on disk is exactly what reflective injection looks like, so it has to be attributed. Here it attributes to the .NET CLR just-in-time compiler emitting native code, which produces the identical pattern without any injection.",
    },
    {
      id: "rwx-pages",
      label: "The executable memory pages are marked read-write-execute (RWX)",
      signal: true,
      reasoning: {
        prompt:
          "Why do read-write-execute (RWX) memory pages deserve a closer look?",
        options: [
          "Because pages that are both writable and executable let code be written and then run in place, the pattern shellcode and just-in-time compilers both rely on, so you must establish which one produced it",
          "Because RWX pages cannot be created without kernel-level malware, so their presence confirms a rootkit",
          "Because RWX only matters on Linux, so on a Windows host it can be safely ignored",
        ],
        correct: 0,
      },
      note: "Correct to check. RWX is a real injection indicator, but a just-in-time compiler needs the same permissions to write native code and then execute it. The RWX region here is owned by the CLR JIT engine, not an implant.",
    },
    {
      id: "fileless-descriptor",
      label:
        "The technique is fileless, executing in memory with no payload written to disk",
      signal: false,
      note: "Fileless and in-memory describe how a class of attack evades disk-based antivirus. They are a category, not evidence that this instance is malicious. A managed runtime also executes generated code purely in memory. The descriptor tells you how to look, not what you found.",
    },
    {
      id: "no-network",
      label: "The flagged process made no outbound network connections",
      signal: false,
      note: "This lowers risk rather than raising it. An in-memory implant almost always needs a channel to receive commands or exfiltrate. The empty NetworkConnections list is exculpatory, not a reason to escalate.",
    },
    {
      id: "detector-severity",
      label: "Defender for Servers rated the alert High severity",
      signal: false,
      note: "The detector's severity rates the heuristic pattern it matched, not this environment's context. It cannot know the memory region belongs to the .NET JIT. Severity is an input to your analysis, never the verdict.",
    },
    {
      id: "mitre-mapping",
      label: "The alert is mapped to MITRE Process Injection (T1055)",
      signal: false,
      note: "The ATT&CK mapping is the detector's label for the behavior pattern it saw, not confirmation that injection occurred. Legitimate JIT compilation trips the same heuristic, so the tag describes the pattern, not a confirmed technique in use.",
    },
    {
      id: "fleet-wide-timing",
      label:
        "The same alert fired on every app-tier VM shortly after the nightly deployment",
      signal: false,
      note: "A single targeted intrusion does not usually light up an entire homogeneous fleet at the same moment. Identical timing across all app servers right after a deploy points to a shared, benign cause: the app pools recycled and the runtime re-compiled the application. That pattern argues for normal behavior, not against it.",
    },
    {
      id: "signed-host",
      label:
        "A signed Microsoft binary (dotnet.exe) is the process hosting the flagged memory",
      signal: false,
      note: "Attackers do abuse signed system binaries, so a signed host is worth noting. But signing plus the process being the genuine .NET runtime is expected here. There is no living-off-the-land pattern: dotnet.exe is running the application it is meant to run, and the flagged region is its own JIT output.",
    },
  ],
  extract: [
    {
      id: "vm",
      label: "Affected virtual machine",
      hint: "the vm-... resource the alert names",
      accept: ["vm-app-eastus-04"],
      normalize: "text",
    },
    {
      id: "process",
      label: "Process hosting the flagged memory",
      hint: "the image the alert points at",
      accept: ["dotnet.exe", "dotnet"],
      normalize: "text",
    },
    {
      id: "detection-type",
      label: "Defender detection type",
      hint: "the VM_... alert type string",
      accept: [
        "VM_FilelessAttackTechnique.Windows",
        "VM_FilelessAttackTechnique",
      ],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "Flagging the non-image-backed executable memory and the RWX pages was the right instinct, and both attribute to the same benign source. The .NET CLR just-in-time compiler compiles intermediate language into native code at runtime and writes it into dynamically allocated RWX memory. At the page level that is indistinguishable from reflective injection, which is exactly why the memory-forensics heuristic fires. Everything else is exculpatory: no file was dropped, the process opened no outbound connection, dotnet.exe is a signed, unmodified Microsoft runtime running its own application, and the identical alert lit up all four app-tier VMs within a minute of the CHG-5233 nightly recycle, the signature of a shared runtime event rather than a targeted intrusion. Close it as a false positive and raise a detection-tuning note so the pattern is suppressed for the .NET app fleet. Escalate would be the tempting wrong call: the fileless, High severity, and Process Injection labels describe what the heuristic pattern-matched, not evidence that an implant is present. Route is also wrong, because there is no genuine finding for an owning team to remediate: the behavior is legitimate, so the only follow-up is tuning the detector, not fixing a real exposure. The lesson: a memory-forensics heuristic detects a pattern, and a legitimate runtime can produce the same pattern, so attribution of the flagged region, not the alert's labels, decides the call.",
  },
};

export default investigation;
