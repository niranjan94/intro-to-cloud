import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Malicious IP address" catalog event (Entra ID Protection risk
 * detection, riskEventType maliciousIPAddress): Medium, detected by Entra ID
 * Protection, mapped to Valid Accounts (T1078), carried as an OCSF Detection
 * Finding (class 2004). Entra lists an address as malicious from IP-reputation
 * sources and high authentication-failure rates. Here the flagged address is a
 * mobile carrier's carrier-grade NAT (CGNAT) egress that the feed misclassifies:
 * thousands of subscribers share it, so it carries a poor reputation earned by
 * other people's traffic. The registered device, satisfied MFA, and clean
 * follow-on attribute the sign-in to the account owner, so the correct call is to
 * close it as a false positive. Unlike an atypical-travel alert, there is no
 * second location to reconcile: the whole case rests on one IP's reputation. All
 * instance data is fictional (ADR-0005): org "Meridian", meridian.example, and
 * every address is from an RFC 5737 documentation range.
 */
const investigation: Investigation = {
  id: "entra-risky-ip-cgnat",
  title: "A flagged address on a phone",
  short:
    "Entra flags a sign-in from an IP a threat feed calls malicious. Account takeover, or a bad reputation call?",
  sourcePlatform: "entra",
  difficulty: "standard",
  severity: "medium",
  eventType: "Sign-in from Malicious IP Address",
  mitre: "Valid Accounts (T1078)",
  detectionSource: "Entra ID Protection",
  evidence: {
    signal: {
      title: "Sign-in from an IP flagged as malicious",
      source: "Entra ID Protection",
      time: "2026-07-09 08:36:12 UTC",
      description:
        "Microsoft Entra ID Protection raised a Malicious IP address risk for r.santos@meridian.example. An address is rated malicious from IP-reputation sources and high authentication-failure rates observed from it; the detection is offline and does not assess whether the address is shared infrastructure or dedicated to an actor.",
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
            { label: "User", value: "r.santos@meridian.example" },
            { label: "Risk detection", value: "Malicious IP address (Medium)" },
            { label: "Result", value: "Success (session established)" },
            { label: "Source IP", value: "203.0.113.88" },
            {
              label: "Network",
              value: "Cascadia Mobile (cellular), ASN AS64500",
              wide: true,
            },
            { label: "MFA", value: "Satisfied (Authenticator, number match)" },
            {
              label: "Device",
              value:
                "Enrolled, Intune-compliant, known device (deviceId d7c1a9e4-3b62-4f08-9a1c-2e5f7b04c8d1)",
              wide: true,
            },
            { label: "Client app", value: "Browser (modern authentication)" },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Valid Accounts (T1078)"],
          rows: [
            {
              label: "Reputation basis",
              value:
                "Third-party feed: high authentication-failure rate observed from this address",
              wide: true,
            },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Address type",
              value:
                "203.0.113.88 is a carrier-grade NAT egress for Cascadia Mobile (ASN AS64500); many subscribers share it",
              wide: true,
            },
            {
              label: "Other accounts",
              value:
                "2 other Meridian accounts signed in from 203.0.113.88 in the last 24h, all remote staff on the same carrier",
              wide: true,
            },
            {
              label: "User",
              value:
                "r.santos is a remote employee whose device roams between home wifi and mobile data",
              wide: true,
            },
            {
              label: "Session follow-up",
              value:
                "No new MFA methods, no role or policy changes, no mass downloads after the sign-in",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "ENTRA-IDP-021" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "Entra ID Protection" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            { label: "Risk state", value: "At risk (offline detection)" },
            { label: "Event time", value: "2026-07-09 08:36:12 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "category_uid": 2,
  "severity": "Medium",
  "severity_id": 3,
  "status": "New",
  "time": "2026-07-09T08:36:12Z",
  "actor": { "user": { "name": "r.santos@meridian.example", "type": "User" } },
  "src_endpoint": { "ip": "203.0.113.88", "location": { "country": "US" } },
  "finding_info": {
    "title": "Malicious IP address",
    "attacks": [
      { "tactic": { "uid": "TA0001", "name": "Initial Access" }, "technique": { "uid": "T1078", "name": "Valid Accounts" } }
    ]
  },
  "unmapped": {
    "risk_event_type": "maliciousIPAddress",
    "risk_level": "medium",
    "risk_state": "atRisk",
    "detection_timing": "offline",
    "ip_reputation": { "source": "third_party_feed", "reason": "high_failure_rate" },
    "asn": "AS64500",
    "asn_org": "Cascadia Mobile",
    "network_type": "cellular / CGNAT (shared egress)",
    "mfa": "satisfied",
    "authentication_requirement": "multiFactorAuthentication",
    "device_compliant": true
  }
}`,
      unmapped: [
        { label: "risk_event_type", value: "maliciousIPAddress" },
        { label: "risk_level", value: "medium" },
        { label: "asn", value: "AS64500 (Cascadia Mobile)", wide: true },
        {
          label: "network_type",
          value: "cellular / CGNAT (shared egress)",
          wide: true,
        },
        {
          label: "ip_reputation",
          value: "third-party feed, high failure rate",
          wide: true,
        },
        { label: "mfa", value: "satisfied" },
        { label: "device_compliant", value: "true" },
      ],
    },
  },
  aspects: [
    {
      id: "flagged-ip",
      label:
        "A successful sign-in came from an IP a threat feed lists as malicious",
      signal: true,
      reasoning: {
        prompt:
          "Why flag a successful sign-in from a threat-listed IP even if you suspect the listing is wrong?",
        options: [
          "Because any sign-in from a listed address is a confirmed compromise",
          "Because a threat-intel hit on a live session must be attributed to a known cause before the alert is closed, never simply ignored",
          "Because Entra only lists an address after the account has already been breached",
        ],
        correct: 1,
      },
      note: "You were right to flag it. A reputation hit on a successful sign-in is not something you dismiss; you attribute it. Here it attributes to a shared mobile carrier egress, which is what resolves it to a false positive rather than an incident.",
    },
    {
      id: "multiple-accounts",
      label:
        "Several Meridian accounts signed in from this same flagged address",
      signal: true,
      reasoning: {
        prompt:
          "Why is more than one account appearing from the same flagged address worth flagging before you interpret it?",
        options: [
          "Because multiple accounts from one malicious IP can indicate a password-spray or shared-relay campaign, so it has to be explained",
          "Because it proves each of those accounts is independently compromised",
          "Because Entra merges every account seen on one IP into a single risky user",
        ],
        correct: 0,
      },
      note: "Correct to check. Many accounts from one address looks like a campaign at first glance. Here it is the opposite tell: they are all remote staff behind the same carrier CGNAT, which is exactly what confirms the address is shared infrastructure and not an actor's host.",
    },
    {
      id: "unfamiliar-asn",
      label: "The sign-in came from an ASN the account has never used before",
      signal: false,
      note: "A remote user moving from home wifi or the VPN onto mobile data legitimately appears from the carrier's ASN. An ASN the account has not used before is expected when someone switches networks; novelty alone is not compromise.",
    },
    {
      id: "first-seen-ip",
      label: "This exact IP address has never been seen for the account",
      signal: false,
      note: "Carrier-grade NAT addresses are shared and rotate between subscribers, so a first-seen public IP is the norm on cellular, not an indicator. The address being new says nothing about who was behind it.",
    },
    {
      id: "medium-risk-rating",
      label: "Entra ID Protection rated the sign-in Medium risk",
      signal: false,
      note: "The tool's risk score is an input to your analysis, not the verdict. This Medium rating rests entirely on the IP reputation the rest of the evidence overturns; deferring to it is the habit this alert is built to break.",
    },
    {
      id: "mfa-satisfied",
      label: "Multi-factor authentication was satisfied on the sign-in",
      signal: false,
      note: "Satisfied MFA is exculpatory, not suspicious. An interactive factor approved by the user argues the account owner was present, and it is one of the facts that lets you close this.",
    },
    {
      id: "registered-device",
      label:
        "The sign-in came from the user's enrolled, Intune-compliant device",
      signal: false,
      note: "A known, enrolled, compliant device is one of the strongest attributions to the legitimate owner. Flagging it inverts the logic: it lowers suspicion rather than raising it.",
    },
  ],
  extract: [
    {
      id: "user",
      label: "User the risk was raised for",
      hint: "the account in the sign-in event",
      accept: ["r.santos@meridian.example", "r.santos"],
      normalize: "text",
    },
    {
      id: "source-ip",
      label: "Source IP of the flagged sign-in",
      hint: "the address the reputation feed listed",
      accept: ["203.0.113.88"],
      normalize: "ip",
    },
    {
      id: "carrier-asn",
      label: "ASN of the source network",
      hint: "the AS... number in the enrichment",
      accept: ["AS64500", "64500"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "The alert rests on a single fact: a reputation feed lists 203.0.113.88 as malicious. Everything else overturns it. The address is a carrier-grade NAT egress for a mobile network (ASN AS64500): many subscribers share it, so it earns a poor reputation and a high failure rate from other people's traffic, not from this account. The sign-in itself attributes cleanly to r.santos. It came from the user's enrolled, Intune-compliant device, satisfied MFA with an interactive number-match approval, produced no anomalous follow-on, and two other Meridian remote staff signed in from the same carrier egress in the same window. This is a false positive: close it and note the CGNAT attribution. There is nothing to hand to another team either, so it closes rather than routes: a feed misclassification is not a Meridian defect for anyone to remediate. Escalate is the tempting wrong call. On the surface this looks like Valid Accounts (T1078): a successful sign-in from a threat-listed IP, a never-before-seen address, and an unfamiliar ASN. But the reputation hit, the first-seen IP, and the unfamiliar ASN are all artifacts of shared mobile egress, and Entra's Medium rating rests entirely on that one reputation signal. Escalating would burn the incident path on a carrier NAT address. Unlike an atypical-travel alert, there is no second location to reconcile: the whole case turns on one IP's reputation, and that reputation does not describe this user. One caveat that matters: this close is earned only because the device, the MFA, and the carrier attribution all hold. If the device were unmanaged, MFA had not been satisfied, or the session had touched sensitive resources, the reputation hit would stand unexplained and the right move would be to escalate. A reputation feed describes an address; the device and the factor describe the person, and only the second decides this call.",
  },
};

export default investigation;
