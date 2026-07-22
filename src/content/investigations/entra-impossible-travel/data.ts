import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Atypical Travel Detected" catalog event (Entra ID Protection
 * risk detection, surfaced through Entra Sign-in Logs). The detection fires on a
 * geographic jump that is physically impossible in the elapsed time, but the jump
 * is an artifact of a corporate VPN egress, so it is a false positive. It is the
 * one case in the set where the automated pipeline reached a verdict (suspicious)
 * and the analyst must overturn it, teaching that the tool's score is an input,
 * not the decision. It also carries the escalate-when-unsure caveat: the close is
 * only earned once the second address is attributed. All instance data is
 * fictional (ADR-0005): org "Meridian", meridian.example, RFC 5737 addresses.
 */
const investigation: Investigation = {
  id: "entra-impossible-travel",
  title: "Impossible travel that isn't",
  short:
    "A user signs in from two cities minutes apart. Stolen session, or something duller?",
  sourcePlatform: "entra",
  difficulty: "standard",
  severity: "medium",
  eventType: "Atypical Travel Detected",
  mitre: "Valid Accounts: Cloud Accounts (T1078.004)",
  detectionSource: "Entra Sign-in Logs",
  evidence: {
    signal: {
      title: "Atypical travel risk on a user sign-in",
      source: "Entra Sign-in Logs",
      time: "2026-06-18 21:47:03 UTC",
      description:
        "Entra ID Protection raised an Atypical Travel risk for j.okafor@meridian.example: two successful sign-ins about 25 minutes apart from locations roughly 950 km apart, a distance that cannot be travelled in the time between them.",
      triage: {
        source: "llm",
        disposition: "suspicious",
        confidence: 55,
        note: "The model flagged the travel pattern but could not attribute the second location on its own. Confirm or overturn its call.",
      },
      sections: [
        {
          heading: "The two sign-ins",
          rows: [
            { label: "User", value: "j.okafor@meridian.example" },
            { label: "Risk detection", value: "Atypical travel (Medium)" },
            {
              label: "First sign-in",
              value: "21:22 UTC · 198.51.100.72 · residential ISP, city A",
              wide: true,
            },
            {
              label: "Second sign-in",
              value:
                "21:47 UTC · 203.0.113.140 · hosting/datacenter ASN, city B",
              wide: true,
            },
            { label: "Time between", value: "25 minutes" },
            { label: "MFA", value: "Satisfied on both sign-ins" },
            {
              label: "Device",
              value: "Enrolled, Intune-compliant, same device id",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Valid Accounts: Cloud Accounts (T1078.004)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "VPN attribution",
              value:
                "203.0.113.140 is on Meridian's published VPN concentrator egress list (a datacenter in city B)",
              wide: true,
            },
            {
              label: "User",
              value:
                "j.okafor is a remote employee who connected to the VPN after the first sign-in",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "ENTRA-IDP-014" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "Entra Sign-in Logs" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            { label: "Event time", value: "2026-06-18 21:47:03 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "Medium",
  "actor": { "user": { "name": "j.okafor@meridian.example" } },
  "finding_info": {
    "title": "Atypical travel",
    "attacks": [{ "technique": { "uid": "T1078.004", "name": "Cloud Accounts" } }]
  },
  "sign_ins": [
    { "time": "2026-06-18T21:22:00Z", "ip": "198.51.100.72", "location": "city A", "mfa": "satisfied", "device_compliant": true },
    { "time": "2026-06-18T21:47:00Z", "ip": "203.0.113.140", "location": "city B", "mfa": "satisfied", "device_compliant": true }
  ],
  "unmapped": {
    "risk_level": "medium",
    "risk_detail": "atypical travel between two geographies",
    "second_ip_asn": "hosting/datacenter"
  }
}`,
      unmapped: [
        { label: "risk_level", value: "medium" },
        {
          label: "risk_detail",
          value: "atypical travel between two geographies",
          wide: true,
        },
        { label: "second_ip_asn", value: "hosting/datacenter", wide: true },
      ],
    },
  },
  aspects: [
    {
      id: "impossible-travel",
      label:
        "Two sign-ins from locations too far apart to travel between in the elapsed time",
      signal: true,
      reasoning: {
        prompt:
          "Why is an impossible-travel pattern worth flagging even before you explain it?",
        options: [
          "Because it always means the account is compromised",
          "Because it can indicate a stolen session or credential used from a second location, so it must be explained before the alert is closed",
          "Because Entra only raises it when MFA has failed",
        ],
        correct: 1,
      },
      note: "You were right to flag it. Impossible travel is a legitimate takeover indicator. Flagging means it must be attributed, not that it is automatically an incident; here it attributes cleanly to the VPN.",
    },
    {
      id: "datacenter-ip",
      label:
        "The second sign-in came from a hosting/datacenter network, not a home or mobile ISP",
      signal: true,
      reasoning: {
        prompt:
          "Why does a datacenter-origin sign-in for an interactive user deserve a look?",
        options: [
          "Because datacenter addresses are always malicious",
          "Because attackers often relay through hosting infrastructure, so an interactive user appearing from one needs to be attributed to something known",
          "Because users can never legitimately sign in from a datacenter address",
        ],
        correct: 1,
      },
      note: "Correct to check. A datacenter origin can mean a proxy or relay, or it can mean a corporate VPN concentrator. Here it matches Meridian's published VPN egress, which is exactly what explains the geographic jump.",
    },
    {
      id: "mfa-both",
      label: "Multi-factor authentication was satisfied on both sign-ins",
      signal: false,
      note: "Satisfied MFA on both events is exculpatory, not suspicious. It is one of the facts that makes a session-hijack explanation less likely.",
    },
    {
      id: "device-compliant",
      label: "The sign-ins came from the same enrolled, compliant device",
      signal: false,
      note: "A single managed, compliant device across both sign-ins argues for one legitimate user, not two locations. It lowers suspicion rather than raising it.",
    },
    {
      id: "entra-medium-risk",
      label: "Entra rated the sign-in Medium risk",
      signal: false,
      note: "The tool's own risk score is an input to your analysis, not a verdict. Treating the Medium rating, or the pipeline's suspicious call, as the answer is exactly the habit this alert is built to break.",
    },
    {
      id: "off-hours",
      label:
        "The sign-ins happened at 21:22 and 21:47 local, outside office hours",
      signal: false,
      note: "Time of day alone is not a signal for a distributed, remote workforce. Plenty of legitimate work happens in the evening.",
    },
  ],
  extract: [
    {
      id: "user",
      label: "User the risk was raised for",
      hint: "the account in the sign-in events",
      accept: ["j.okafor@meridian.example", "j.okafor"],
      normalize: "text",
    },
    {
      id: "first-ip",
      label: "Source IP of the first sign-in",
      hint: "the residential-ISP address",
      accept: ["198.51.100.72"],
      normalize: "ip",
    },
    {
      id: "second-ip",
      label: "Source IP of the second sign-in",
      hint: "the datacenter address that triggered the travel jump",
      accept: ["203.0.113.140"],
      normalize: "ip",
    },
  ],
  verdict: {
    correct: "close",
    why: "The impossible travel and the datacenter-origin IP were both correct to flag, and both resolve on attribution. The second address, 203.0.113.140, is on Meridian's published VPN concentrator egress list: remote staff routing through the VPN legitimately appear to sign in from the concentrator's datacenter location, which produced the geographic jump. MFA was satisfied on both sign-ins and the same compliant device was used throughout. The detection's premise, physical travel between two places, is defeated by a known VPN egress, so this is a false positive. Close it and note the VPN attribution, and do not defer to the pipeline's suspicious call. One caveat that matters: this close is earned only because the second IP matched the known egress list. If you could not attribute that address, you could not rule out a session hijack, and the right move would be to escalate. Uncertainty about attribution is a reason to escalate, never a reason to close.",
  },
};

export default investigation;
