import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "OAuth Application Consent Granted" catalog event (ENTRA-MDA-014),
 * the Entra ID audit operation "Consent to application" (Service "Core Directory",
 * Category "ApplicationManagement") surfaced and flagged by Defender for Cloud Apps
 * app governance: High, mapped to Steal Application Access Token (T1528). A
 * newly-registered, unverified-publisher OAuth app requesting delegated Mail.Read
 * plus offline_access is the fingerprint of a consent-phishing (illicit consent
 * grant) attack: the offline_access scope mints a refresh token, giving the app
 * durable mailbox access that survives a password reset. Microsoft Incident
 * Response reports that mailbox-family scopes such as Mail.* appear in the large
 * majority (about 99%) of consent-phishing cases; offline_access is what turns a
 * one-time consent into a durable refresh token.
 *
 * All instance data below is fictional (ADR-0005): the organization is "Meridian",
 * the tenant is meridian.onmicrosoft.com, users are on meridian.example, the
 * attacker app and reply domain are .example values, and every address is from an
 * RFC 5737 documentation range.
 */
const investigation: Investigation = {
  id: "entra-oauth-illicit-consent",
  title: "Consent to a new mail-reading app",
  short:
    "Several users just consented to a brand-new OAuth app that reads their mail. Ordinary adoption, or a phishing campaign?",
  sourcePlatform: "entra",
  difficulty: "challenge",
  severity: "high",
  eventType: "OAuth Application Consent Granted",
  mitre: "Steal Application Access Token (T1528)",
  detectionSource: "Defender for Cloud Apps",
  evidence: {
    signal: {
      title: "User consent granted to a newly registered OAuth application",
      source: "Defender for Cloud Apps",
      time: "2026-07-22 22:11:38 UTC",
      description:
        "Defender for Cloud Apps app governance flagged an OAuth application, PDF Merge Pro, that four users in meridian.onmicrosoft.com consented to within a 34-minute window. The app was registered hours earlier by an unverified publisher in an external tenant and holds delegated Mail.Read and offline_access permissions. The detection reflects the Entra audit operation Consent to application (Category ApplicationManagement).",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Application",
          rows: [
            { label: "Display name", value: "PDF Merge Pro" },
            {
              label: "Application (client) ID",
              value: "b9d1f4e2-7c3a-4a1e-9f21-8c5d0e6a3b47",
              wide: true,
            },
            { label: "Publisher", value: "Foldr Labs" },
            { label: "Publisher verified", value: "No" },
            { label: "Sign-in audience", value: "Multi-tenant" },
            {
              label: "Home tenant",
              value:
                "c14a77e0-2f9b-4d33-8e5a-6b21f0d9e4c2 (external, not Meridian)",
              wide: true,
            },
            {
              label: "App registered",
              value:
                "2026-07-22 18:04:52 UTC (about 4 hours before first consent)",
              wide: true,
            },
            {
              label: "Reply URL",
              value: "https://auth.pdfmerge-pro.example/oauth2/callback",
              wide: true,
            },
          ],
        },
        {
          heading: "Consent",
          rows: [
            {
              label: "Delegated permissions",
              value: "Mail.Read, offline_access, User.Read",
              wide: true,
            },
            { label: "Consent type", value: "Principal (per-user)" },
            { label: "Admin consent", value: "No (IsAdminConsent = false)" },
            {
              label: "Users consented",
              value:
                "j.okafor@meridian.example, r.delacruz@meridian.example, s.patel@meridian.example, m.novak@meridian.example",
              wide: true,
            },
            {
              label: "Consent window",
              value: "2026-07-22 21:37 UTC to 22:11 UTC (34 minutes, 4 users)",
              wide: true,
            },
            {
              label: "Consent source IP",
              value: "198.51.100.42 (Meridian trusted egress)",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Steal Application Access Token (T1528)"],
          rows: [
            {
              label: "Scope pattern",
              value:
                "Mail.* scopes appear in the large majority of consent-phishing (illicit consent grant) attacks per Microsoft IR; offline_access adds the refresh token that makes the mailbox access durable",
              wide: true,
            },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Change ticket",
              value:
                "No CHG-#### ticket references onboarding this app or a mail integration",
              wide: true,
            },
            {
              label: "Prior sightings",
              value:
                "App unknown to the tenant before 2026-07-22; not on the sanctioned-integration inventory",
              wide: true,
            },
            {
              label: "What offline_access grants",
              value:
                "A refresh token: durable, token-based access that persists after a password reset or MFA change",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "ENTRA-MDA-014" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "Defender for Cloud Apps" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            { label: "Event time", value: "2026-07-22 22:11:38 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "High",
  "actor": { "user": { "name": "j.okafor@meridian.example", "type": "User" } },
  "src_endpoint": { "ip": "198.51.100.42" },
  "finding_info": {
    "title": "User consent granted to a newly registered OAuth application",
    "attacks": [{ "technique": { "uid": "T1528", "name": "Steal Application Access Token" } }]
  },
  "cloud": { "provider": "azure", "account": { "uid": "meridian.onmicrosoft.com" } },
  "unmapped": {
    "raw_event": {
      "service": "Core Directory",
      "category": "ApplicationManagement",
      "activityDisplayName": "Consent to application",
      "isAdminConsent": false,
      "consentType": "Principal"
    },
    "app_display_name": "PDF Merge Pro",
    "app_id": "b9d1f4e2-7c3a-4a1e-9f21-8c5d0e6a3b47",
    "app_home_tenant": "c14a77e0-2f9b-4d33-8e5a-6b21f0d9e4c2",
    "publisher_verified": false,
    "app_created": "2026-07-22T18:04:52Z",
    "reply_url": "https://auth.pdfmerge-pro.example/oauth2/callback",
    "delegated_scopes": ["Mail.Read", "offline_access", "User.Read"],
    "consenting_users_count": 4,
    "consent_window_minutes": 34
  }
}`,
      unmapped: [
        {
          label: "delegated_scopes",
          value: "Mail.Read, offline_access, User.Read",
          wide: true,
        },
        { label: "publisher_verified", value: "false" },
        {
          label: "app_created",
          value: "2026-07-22T18:04:52Z (about 4h earlier)",
          wide: true,
        },
        {
          label: "reply_url",
          value: "https://auth.pdfmerge-pro.example/oauth2/callback",
          wide: true,
        },
        { label: "consent_type", value: "Principal (per-user, not admin)" },
      ],
    },
  },
  aspects: [
    {
      id: "mail-offline-scope",
      label:
        "The app was granted delegated Mail.Read together with offline_access",
      signal: true,
      reasoning: {
        prompt:
          "Why is Mail.Read paired with offline_access the load-bearing signal?",
        options: [
          "Mail.Read is read-only, so pairing it with offline_access is harmless",
          "offline_access issues a refresh token, so the app keeps reading the mailbox long-term and survives a password reset; Mail.Read + offline_access is the exact combination consent-phishing apps request",
          "offline_access only keeps the user signed in for convenience and grants no data access",
        ],
        correct: 1,
      },
      note: "This is the core signal. Mail.Read hands the app the user's mailbox, and offline_access turns a one-time consent into a durable refresh token. Microsoft IR reports mailbox scopes like Mail.* in the large majority of illicit consent grants, and offline_access is what makes that access quiet and persistent.",
    },
    {
      id: "new-unverified-publisher",
      label: "The app was registered hours earlier by an unverified publisher",
      signal: true,
      reasoning: {
        prompt: "Why does a brand-new app from an unverified publisher matter?",
        options: [
          "It does not; every app starts unverified, and Microsoft hosts the consent page so the app is safe",
          "Legitimate mail-reading SaaS are established and publisher-verified; a throwaway app registered hours before it starts collecting consents is classic consent-phishing infrastructure",
          "Unverified only means the developer skipped a paperwork step, which has no bearing on risk",
        ],
        correct: 1,
      },
      note: "Publisher verification is Microsoft's vetting of the app developer. A mailbox-reading app that is only hours old and comes from an unverified publisher has none of the track record a sanctioned integration would, and the freshness is the hallmark of disposable attacker infrastructure.",
    },
    {
      id: "external-unsanctioned",
      label:
        "It is an external multi-tenant app Meridian never onboarded, with no change ticket",
      signal: true,
      reasoning: {
        prompt:
          "Why does the missing change ticket and external origin matter?",
        options: [
          "Multi-tenant apps are always malicious and should be blocked on sight",
          "Sanctioned SaaS integrations at Meridian are onboarded under a CHG-#### ticket; an external app acquiring mailbox scope with no ticket and no prior sighting is unsanctioned by definition",
          "External apps cannot read mailboxes, so the origin is irrelevant",
        ],
        correct: 1,
      },
      note: "Per the Meridian baseline, a legitimate integration announces itself with a change ticket. This app has none, was never on the sanctioned-integration inventory, and lives in an external tenant. That is an unmanaged third party reaching into staff mailboxes.",
    },
    {
      id: "consent-burst",
      label:
        "Four users consented to the same new app within a 34-minute window",
      signal: true,
      reasoning: {
        prompt: "What does the tight cluster of consents indicate?",
        options: [
          "That the app is trusted and popular, since several people adopted it at once",
          "A burst of consents across unrelated users in minutes points to a shared phishing lure, not independent adoption, and tells you multiple mailboxes are already exposed",
          "Nothing, because users routinely discover and install the same app simultaneously",
        ],
        correct: 1,
      },
      note: "Independent, legitimate adoption of a niche tool does not happen in a 34-minute cluster across unrelated users. A burst like this is the signature of a phishing link making the rounds, and it also sizes the incident: four mailboxes, not one.",
    },
    {
      id: "consent-normal-action",
      label:
        "The users granted consent themselves through the standard Microsoft consent page",
      signal: false,
      note: "User consent through the Microsoft-hosted consent prompt is the normal, expected mechanism for adding an app. The channel is not the signal: what the app is, who published it, and what it asked for are. Consent phishing works precisely by riding this legitimate flow.",
    },
    {
      id: "per-user-not-admin",
      label:
        "Consent was per-user (Principal), not a tenant-wide admin consent",
      signal: false,
      note: "It is tempting to downgrade this because the blast radius looks small, but per-user delegated consent to Mail.Read + offline_access still hands each consenting user's entire mailbox to the app with a persistent refresh token. The narrower consent type limits nothing about the mailbox exfiltration; it only means the attacker phished users instead of an admin.",
    },
    {
      id: "no-password-change",
      label: "No password was changed and MFA on the accounts is intact",
      signal: false,
      note: "This looks reassuring and is the opposite. Consent phishing bypasses credential controls entirely: the app holds a token, not the password, so resetting passwords or re-enrolling MFA does not evict it. An untouched password is why this attack class is dangerous, not evidence that nothing happened.",
    },
    {
      id: "trusted-egress",
      label:
        "The consents originated from Meridian trusted egress 198.51.100.0/24",
      signal: false,
      note: "The trusted source only confirms that real Meridian staff, on their normal network, were the ones tricked into consenting. It places the users, not the app. Location is not the signal here: the threat is the application the legitimate users authorized, wherever they authorized it from.",
    },
    {
      id: "familiar-app-name",
      label: "The app's display name resembles an ordinary productivity tool",
      signal: false,
      note: "A trustworthy-sounding name is trivially chosen by whoever registers the app, and consent-phishing apps deliberately mimic familiar products to lower a user's guard. The display name is not evidence of legitimacy; the publisher verification status, age, and requested scopes are.",
    },
  ],
  extract: [
    {
      id: "app-name",
      label: "Display name of the consented application",
      hint: "the app title in the Application section",
      accept: ["PDF Merge Pro"],
      normalize: "text",
    },
    {
      id: "app-id",
      label: "Application (client) ID of the app",
      hint: "the GUID in the Application section",
      accept: ["b9d1f4e2-7c3a-4a1e-9f21-8c5d0e6a3b47"],
      normalize: "text",
    },
    {
      id: "reply-domain",
      label: "Reply URL domain the app redirects to",
      hint: "the domain in the app's reply URL",
      accept: ["pdfmerge-pro.example", "auth.pdfmerge-pro.example"],
      normalize: "domain",
    },
    {
      id: "sensitive-scope",
      label: "Delegated scope that grants persistent access",
      hint: "the scope that mints a refresh token",
      accept: ["offline_access"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "This is an illicit consent grant, the consent-phishing pattern. A throwaway multi-tenant app, registered hours earlier by an unverified publisher in an external tenant, collected delegated Mail.Read and offline_access from four Meridian users inside 34 minutes, with no change ticket and no prior sighting. The offline_access scope mints a refresh token, so the app now has durable, token-based access to four mailboxes that a password reset will not revoke, and the tight consent cluster points to a phishing link doing the rounds. Escalate on the identity incident path: revoke the app's consents and disable the service principal in the tenant, revoke the affected users' refresh tokens and sessions, and review what the app already read. The tempting wrong call is to close it as benign user activity, because users legitimately consented, from the trusted network, without any password compromise and only per-user. That reasoning is backwards: consent phishing is designed to look exactly like ordinary consent, and its whole point is to obtain token-based mailbox access without ever touching a credential. The scope, the publisher, the app's age, and the burst are what decide it, not the fact that the consent flow itself was normal.",
  },
};

export default investigation;
