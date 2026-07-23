import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "User registered security info" Microsoft Entra ID audit event
 * (Authentication Methods service, operationType Update), surfaced here as a
 * "New MFA Method Registered" detection. Detector-assigned severity Medium;
 * detection source Entra Audit Logs; MITRE mapping Account Manipulation: Device
 * Registration (T1098.005). The raw payload is modelled as an OCSF Account Change
 * (class_uid 3001), activity MFA Factor Enable (activity_id 10, type_uid 300110).
 *
 * This is a benign true positive: a new MFA method registration is the same
 * persistence signal an attacker leaves, but here it attributes cleanly to a new
 * hire's onboarding, from trusted egress, on a managed device, with no risky
 * sign-in and a verified helpdesk ticket. The event is real and authorized, so
 * the correct call is close (not escalate). It is the deliberate contrast to an
 * MFA-fatigue or credential-theft takeover, where the same event would escalate.
 *
 * All instance data is fictional (ADR-0005): org "Meridian",
 * meridian.onmicrosoft.com, RFC 5737 addresses, synthetic identifiers.
 */
const investigation: Investigation = {
  id: "entra-new-mfa-onboarding",
  title: "A new MFA method on a new account",
  short:
    "A days-old account just registered its first authenticator. Onboarding, or a foothold?",
  sourcePlatform: "entra",
  difficulty: "standard",
  severity: "medium",
  eventType: "New MFA Method Registered",
  mitre: "Account Manipulation: Device Registration (T1098.005)",
  detectionSource: "Entra Audit Logs",
  evidence: {
    signal: {
      title: "New security information registered on a user account",
      source: "Entra Audit Logs",
      time: "2026-07-20 14:36:12 UTC",
      description:
        "The Authentication Methods service recorded a user registering a new authentication method (security information) for their account. The entry reports that a method was added and that the operation succeeded; it does not by itself assess whether the registration was authorized.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Registration",
          rows: [
            { label: "User", value: "r.delacruz@meridian.example" },
            { label: "Activity", value: "User registered security info" },
            {
              label: "Method registered",
              value: "Microsoft Authenticator (push + passwordless)",
              wide: true,
            },
            { label: "Result", value: "Success" },
            { label: "Logged by service", value: "Authentication Methods" },
            { label: "Source IP", value: "198.51.100.55" },
            {
              label: "Prior methods on account",
              value: "None (this is the first strong-auth method)",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Account Manipulation: Device Registration (T1098.005)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Source network",
              value:
                "198.51.100.55 is within Meridian's trusted egress range 198.51.100.0/24 (offices, VPN, CI runners)",
              wide: true,
            },
            {
              label: "Account age",
              value:
                "Account created 2026-07-17, three days before this event; r.delacruz is a new hire in the onboarding window",
              wide: true,
            },
            {
              label: "Device",
              value:
                "Session on an Intune-enrolled, compliant device issued to the user (MERID-LT-2287)",
              wide: true,
            },
            {
              label: "Sign-in risk",
              value:
                "No Identity Protection risk and no risky sign-in on the account in the surrounding window",
              wide: true,
            },
            {
              label: "Helpdesk",
              value:
                "IT onboarding ticket HD-5561 records first-day MFA enrollment for this hire; identity verified by the service desk",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "ENTRA-AUD-207" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "Entra Audit Logs" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            { label: "Operation type", value: "Update" },
            { label: "Event time", value: "2026-07-20 14:36:12 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 3001,
  "class_name": "Account Change",
  "activity_id": 10,
  "activity_name": "MFA Factor Enable",
  "type_uid": 300110,
  "severity": "Medium",
  "time": "2026-07-20T14:36:12Z",
  "status": "Success",
  "actor": {
    "user": { "name": "r.delacruz@meridian.example", "uid": "9f2c7d18-3b4a-4e61-8c02-5a7e1f6d0b93" }
  },
  "user": {
    "name": "r.delacruz@meridian.example",
    "uid": "9f2c7d18-3b4a-4e61-8c02-5a7e1f6d0b93",
    "account": { "type": "Entra ID", "created_time": "2026-07-17T09:02:00Z" }
  },
  "auth_factors": [
    { "factor_type": "Authenticator app", "device": { "name": "Microsoft Authenticator" } }
  ],
  "src_endpoint": { "ip": "198.51.100.55" },
  "device": { "name": "MERID-LT-2287", "is_managed": true, "is_compliant": true },
  "metadata": {
    "product": { "name": "Microsoft Entra ID", "feature": { "name": "Authentication Methods" } },
    "log_name": "AuditLogs",
    "event_code": "User registered security info"
  },
  "unmapped": {
    "activityDisplayName": "User registered security info",
    "loggedByService": "Authentication Methods",
    "operationType": "Update",
    "resultReason": "User registered Microsoft Authenticator method",
    "riskState": "none",
    "riskDetail": "none"
  }
}`,
      unmapped: [
        {
          label: "activityDisplayName",
          value: "User registered security info",
          wide: true,
        },
        { label: "loggedByService", value: "Authentication Methods" },
        {
          label: "resultReason",
          value: "User registered Microsoft Authenticator method",
          wide: true,
        },
        { label: "riskState", value: "none" },
        { label: "riskDetail", value: "none" },
      ],
    },
  },
  aspects: [
    {
      id: "method-registered",
      label: "A new MFA method was registered on the account",
      signal: true,
      reasoning: {
        prompt:
          "Why flag a new MFA-method registration before deciding it is routine?",
        options: [
          "Because a new authenticator registration by itself confirms the account's password was phished",
          "Because enrolling a new factor is a documented persistence step: an attacker who has the password registers their own authenticator to satisfy future MFA and survive a reset, so it must be attributed to a real user action",
          "Because a registered method can never be removed later, so it has to be caught at the moment of registration",
        ],
        correct: 1,
      },
      note: "Correct to flag. A new MFA-method registration is a real persistence-relevant event and must be attributed before it is closed. Here it attributes cleanly to the user's own onboarding and resolves benign, but skipping the attribution step is how a real takeover gets waved through.",
    },
    {
      id: "first-method-fresh-account",
      label:
        "This is the first strong-auth method, on an account created only days ago",
      signal: true,
      reasoning: {
        prompt:
          "Why does a first-time enrollment on a days-old account deserve a look rather than an automatic pass?",
        options: [
          "Because a days-old account has no behavior baseline yet, so any MFA action on it is automatically an incident",
          "Because first-device self-enrollment is the exact window attackers abuse: enrolling the first factor on a fresh or dormant account can require only a username and password, so who enrolled it must be confirmed",
          "Because Entra requires SOC approval before a new account can register its first method",
        ],
        correct: 1,
      },
      note: "Correct to flag. A first enrollment on a days-old account is the window attackers abuse, so confirming who enrolled it is the right move. Here the account is a genuine new hire in their onboarding window, which is exactly the benign version of this pattern.",
    },
    {
      id: "known-persistence-technique",
      label:
        "The event maps to a known persistence technique (T1098.005, Device Registration)",
      signal: false,
      note: "The ATT&CK mapping describes the mechanism an attacker would use, not whether this registration was authorized. The identical event is benign onboarding or hostile persistence depending on who did it and whether it attributes to a real user action, which is what the rest of the evidence settles. A technique tag is a reason to attribute, not a verdict.",
    },
    {
      id: "trusted-egress",
      label: "The registration came from 198.51.100.55",
      signal: false,
      note: "198.51.100.55 sits inside Meridian's trusted egress range 198.51.100.0/24, its offices, VPN, and CI runners. A legitimate origin lowers suspicion; flagging the corporate egress as the signal has the logic backwards. A hostile registration would more likely originate from outside this range.",
    },
    {
      id: "no-risk-detection",
      label:
        "No Identity Protection risk or risky sign-in accompanied the registration",
      signal: false,
      note: "The absence of any sign-in risk around the event is exculpatory. It is one of the facts that makes a credential-theft explanation less likely, not a reason to escalate.",
    },
    {
      id: "compliant-device",
      label: "The session ran on an Intune-enrolled, compliant device",
      signal: false,
      note: "A managed, compliant device issued to the user argues for one legitimate owner performing the enrollment. It lowers suspicion rather than raising it.",
    },
    {
      id: "logged-by-authmethods",
      label:
        "The event was recorded by the Authentication Methods service in the audit log",
      signal: false,
      note: "Every security-info registration is logged this way by the Authentication Methods service. The presence of the audit entry is how you see the event at all; it is expected for this event type and says nothing about whether it is malicious.",
    },
  ],
  extract: [
    {
      id: "user",
      label: "Account the method was registered on",
      hint: "the user principal in the registration event",
      accept: ["r.delacruz@meridian.example", "r.delacruz"],
      normalize: "text",
    },
    {
      id: "source-ip",
      label: "Source IP of the registration",
      hint: "the src_endpoint address",
      accept: ["198.51.100.55"],
      normalize: "ip",
    },
    {
      id: "method",
      label: "Authentication method that was registered",
      hint: "the method named in the registration and auth_factors",
      accept: [
        "Microsoft Authenticator",
        "microsoft authenticator app",
        "authenticator app",
        "authenticator",
      ],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "The new MFA method and the fresh-account first enrollment were both correct to flag: registering a new factor is a documented persistence step (T1098.005), and first-device enrollment on a days-old account is exactly the window an attacker abuses. Both resolve on attribution. The registration came from 198.51.100.55, inside Meridian's trusted egress range; the session ran on an Intune-enrolled, compliant device issued to the user; no Identity Protection risk or risky sign-in accompanied it; and onboarding ticket HD-5561 records first-day MFA enrollment for r.delacruz, a genuine new hire whose identity the service desk verified. This is a real event, not a false positive: a method really was registered. It is simply an authorized one, a benign true positive, so there is nothing to hand off and the call is to close it with the onboarding attribution noted. Escalating is the tempting wrong call: the event carries the same persistence-technique tag an attacker's registration would, but the tag describes the mechanism, not authorization, and every corroborating fact here points to legitimate onboarding. The caveat that keeps this honest: the close is earned only because the registration attributes to the verified onboarding. An unattributed first-device enrollment, or one from outside trusted egress alongside a risky sign-in, would be an escalate, because an attacker's registered factor is durable persistence that survives a password reset.",
  },
};

export default investigation;
