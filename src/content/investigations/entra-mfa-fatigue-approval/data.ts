import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Suspicious MFA authentication approval" catalog event
 * (Entra ID Protection sign-in risk detection, riskEventType authenticatorPhishing):
 * High, detected in real time by Entra ID Protection, mapped to Multi-Factor
 * Authentication Request Generation (T1621). The detection fires on a
 * Password + Authenticator sign-in whose unfamiliar properties (ASN, device,
 * location) and the distance between the requesting device and the approving
 * device indicate social engineering, the signature of an MFA-fatigue / push-
 * bombing success. Modelled as an OCSF Detection Finding (class_uid 2004). All
 * instance data is fictional (ADR-0005): the organization is "Meridian", the
 * tenant is meridian.onmicrosoft.com, and every address is from an RFC 5737
 * documentation range.
 */
const investigation: Investigation = {
  id: "entra-mfa-fatigue-approval",
  title: "An MFA prompt finally approved",
  short:
    "Fourteen denied push prompts, then one approval from a new device. Tired user, or push bombing?",
  sourcePlatform: "entra",
  difficulty: "challenge",
  severity: "high",
  eventType: "Suspicious MFA authentication approval",
  mitre: "Multi-Factor Authentication Request Generation (T1621)",
  detectionSource: "Entra ID Protection",
  evidence: {
    signal: {
      title: "Suspicious MFA authentication approval on a user sign-in",
      source: "Entra ID Protection",
      time: "2026-07-02 03:41:17 UTC",
      description:
        "Entra ID Protection raised a Suspicious MFA authentication approval risk for r.demir@meridian.example. A Password + Microsoft Authenticator sign-in was approved after a rapid burst of denied push prompts, and the sign-in carries unfamiliar properties: a new device, a hosting-ASN address in a location with no history for this account, and a large distance between the device requesting the sign-in and the phone that approved it.",
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
            { label: "User", value: "r.demir@meridian.example" },
            {
              label: "Risk detection",
              value: "Suspicious MFA authentication approval (High)",
              wide: true,
            },
            {
              label: "MFA method",
              value: "Password + Microsoft Authenticator (push)",
              wide: true,
            },
            {
              label: "Push prompts",
              value: "14 denied between 03:35 and 03:41 UTC, then 1 approved",
              wide: true,
            },
            {
              label: "Approved at",
              value: "2026-07-02 03:41:09 UTC",
            },
            {
              label: "Requesting device",
              value:
                "Windows 10, browser sign-in, not registered or Intune-enrolled (first seen)",
              wide: true,
            },
            {
              label: "Requesting IP",
              value: "203.0.113.88 (hosting/datacenter ASN)",
              wide: true,
            },
            {
              label: "Requesting location",
              value: "City F, ~7,400 km from the account's usual sign-ins",
              wide: true,
            },
            {
              label: "Approving device",
              value: "User's enrolled iPhone (Microsoft Authenticator)",
              wide: true,
            },
            {
              label: "Approving location",
              value: "192.0.2.45 · mobile carrier · the user's home metro",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Multi-Factor Authentication Request Generation (T1621)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Trusted egress",
              value:
                "Meridian staff reach in from 198.51.100.0/24 or the published VPN egress; 203.0.113.88 is neither",
              wide: true,
            },
            {
              label: "Account",
              value:
                "Standard user in Sales, no admin or privileged directory roles",
              wide: true,
            },
            {
              label: "Travel history",
              value:
                "Has signed in from other cities on past trips, none matching City F",
              wide: true,
            },
            {
              label: "Change ticket",
              value:
                "None references a new device or location for this account",
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
            { label: "riskEventType", value: "authenticatorPhishing" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            {
              label: "Correlation ID",
              value: "b7c4e2a9-3f18-4d6a-9e52-1a0c7d84f6b3",
              wide: true,
            },
            { label: "Event time", value: "2026-07-02 03:41:17 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "activity_id": 1,
  "severity": "High",
  "actor": { "user": { "name": "r.demir@meridian.example" } },
  "src_endpoint": { "ip": "203.0.113.88", "location": { "city": "City F" } },
  "device": { "is_managed": false, "is_compliant": false, "type": "Desktop", "os": { "name": "Windows 10" } },
  "finding_info": {
    "title": "Suspicious MFA authentication approval",
    "attacks": [{ "technique": { "uid": "T1621", "name": "Multi-Factor Authentication Request Generation" } }],
    "correlation_uid": "b7c4e2a9-3f18-4d6a-9e52-1a0c7d84f6b3"
  },
  "cloud": { "provider": "azure", "tenant_uid": "meridian.onmicrosoft.com" },
  "unmapped": {
    "risk_event_type": "authenticatorPhishing",
    "risk_level": "high",
    "auth_method": "Password + Microsoft Authenticator push",
    "mfa_denials_before_approval": 14,
    "denial_window": "03:35:02Z to 03:40:55Z",
    "approval_time": "2026-07-02T03:41:09Z",
    "requesting_device_registered": false,
    "approving_device": "enrolled iPhone, Microsoft Authenticator",
    "device_proximity_km": 7400
  }
}`,
      unmapped: [
        { label: "risk_event_type", value: "authenticatorPhishing" },
        { label: "risk_level", value: "high" },
        {
          label: "mfa_denials_before_approval",
          value: "14 (03:35 to 03:41 UTC)",
          wide: true,
        },
        { label: "requesting_device_registered", value: "false" },
        {
          label: "device_proximity_km",
          value: "7400 (requesting device to approving phone)",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "denial-burst",
      label:
        "Fourteen push prompts were denied in the six minutes before the one approval",
      signal: true,
      reasoning: {
        prompt:
          "Why does the burst of denials right before the approval matter?",
        options: [
          "A run of denials means the user's phone was malfunctioning and firing prompts on its own",
          "Repeated unsolicited prompts that the user kept denying, ending in a single approval, is the signature of MFA fatigue: an attacker who already has the password generates prompts until the user relents",
          "Denied prompts prove the attacker never got in, so the approval that followed is unrelated to them",
        ],
        correct: 1,
      },
      note: "One approval on its own is unremarkable. Fourteen denials in the six minutes before it are not. That pattern is push bombing: the attacker holds the password and hammers prompts until the user taps Approve to make them stop.",
    },
    {
      id: "new-device",
      label:
        "The approved sign-in was on a device never seen for this account and not registered or enrolled",
      signal: true,
      reasoning: {
        prompt: "Why does the new, unregistered device matter here?",
        options: [
          "Unregistered devices cannot complete MFA, so the record must be a logging error",
          "The session was created on an attacker-controlled device while the user approved from their own phone: the person who got the session is not the person who approved it",
          "New devices are always blocked by Conditional Access, so the sign-in is safe by definition",
        ],
        correct: 1,
      },
      note: "The prompt was approved from the user's enrolled phone, but the sign-in it authorized ran on a brand-new, unmanaged Windows device. That split, victim approves and the attacker's device gets the session, is exactly what push bombing produces.",
    },
    {
      id: "atypical-origin",
      label:
        "The sign-in came from a hosting-ASN address in a city with no history for this account, outside trusted egress",
      signal: true,
      reasoning: {
        prompt: "What makes the requesting address suspicious?",
        options: [
          "It is outside office hours, and any sign-in at 03:41 is an anomaly",
          "It is a hosting/datacenter address in an unfamiliar location that matches neither Meridian's trusted egress nor the account's travel history, so it is not the user's normal path in",
          "Datacenter addresses are always malicious regardless of who is behind them",
        ],
        correct: 1,
      },
      note: "Meridian's people reach in from 198.51.100.0/24 or the published VPN egress. A hosting-ASN address in a city this account has never used is neither, and paired with the new device it places the session in an attacker's hands.",
    },
    {
      id: "device-proximity",
      label:
        "The device requesting the sign-in and the phone that approved it are far apart geographically",
      signal: true,
      reasoning: {
        prompt:
          "Why does the distance between the requesting and approving device matter?",
        options: [
          "The gap is a normal artifact of routing the sign-in through a corporate VPN",
          "The host that triggered the login sits thousands of kilometres from the phone that approved it, so the requester and the approver are almost certainly different people",
          "Entra always reports the requesting and approving devices in different cities, so the gap is expected",
        ],
        correct: 1,
      },
      note: "The Suspicious MFA authentication approval detection compares where a sign-in is requested against where it is approved. A large gap means the requester and approver are different people: the attacker requests from City F, the victim approves from home.",
    },
    {
      id: "standard-mfa-method",
      label:
        "The sign-in used the tenant's standard Password plus Microsoft Authenticator push method",
      signal: false,
      note: "That is Meridian's sanctioned MFA method for everyone. The channel is normal; what is off is the flood of denials, the new device, and the origin, not the method itself.",
    },
    {
      id: "not-privileged",
      label: "The account is a standard user with no admin or privileged roles",
      signal: false,
      note: "Low privilege limits the blast radius; it does not make the compromise benign. Attackers land on whatever account they can and pivot from there, so a non-privileged foothold is still worth escalating, not a reason to stand down.",
    },
    {
      id: "travels-sometimes",
      label: "The user has signed in from other cities before while travelling",
      signal: false,
      note: "Real travel history exists, but it does not match City F and, more to the point, travel never explains a burst of denied pushes. Using 'they travel' to wave off a push-bombing pattern is the trap this case is built on.",
    },
    {
      id: "mfa-satisfied",
      label:
        "Multi-factor authentication was ultimately satisfied on the sign-in",
      signal: false,
      note: "A satisfied factor is not proof of consent. Here it was satisfied by wearing the user down until they tapped Approve to stop the prompts. An MFA satisfied through fatigue is the compromise, not evidence against it.",
    },
  ],
  extract: [
    {
      id: "user",
      label: "Account the risk was raised for",
      hint: "the user in the sign-in event",
      accept: ["r.demir@meridian.example", "r.demir"],
      normalize: "text",
    },
    {
      id: "requesting-ip",
      label: "Source IP of the approved sign-in",
      hint: "the hosting-ASN address the sign-in was requested from",
      accept: ["203.0.113.88"],
      normalize: "ip",
    },
    {
      id: "correlation-id",
      label: "Correlation ID of the risky sign-in",
      hint: "the GUID that pulls the full sign-in record",
      accept: ["b7c4e2a9-3f18-4d6a-9e52-1a0c7d84f6b3"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "The chain is unambiguous: fourteen denied Authenticator prompts in six minutes, then one approval, and the session it authorized landed on a brand-new unmanaged device from a hosting-ASN address in a city the account has never used, thousands of kilometres from the phone that approved it. That is a successful MFA-fatigue / push-bombing attack (T1621): the attacker already held the password and generated prompts until the user relented. Escalate on the identity-compromise path: revoke the user's sessions and refresh tokens, force a password reset and MFA re-registration, and review what the new-device session reached. The tempting wrong call is Close, on the reasoning that MFA was satisfied, the user approved it, the account is not privileged, and the user travels. Every one of those is true and none of them clears the alert: a factor satisfied by fatigue is not consent, a non-privileged account is still a foothold to pivot from, and travel does not produce a denial burst. Routing it to the helpdesk as a user-awareness issue is wrong for the same reason, it leaves the attacker's session live while treating an active compromise as coaching. The principle: an MFA approval records that a prompt was tapped, not that the right person tapped it, and an approval that follows a barrage of denials from a new device and place means the account is compromised.",
  },
};

export default investigation;
