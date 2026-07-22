import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Workload Identity Sign-in Anomaly" catalog event (Entra ID
 * Protection risk detection for workload identities, surfaced through Entra
 * Sign-in Logs), mapped to Valid Accounts: Cloud Accounts (T1078.004). A known
 * first-party service principal acquiring an access token reads as routine
 * automation, and the automated pipeline pre-triaged it benign for exactly that
 * reason.
 *
 * Its verdict depends on the Meridian baseline. The principal, web-platform-sp,
 * is a documented automation identity whose remit is the public marketing web
 * platform's web assets and nothing else. Here it acquired directory-wide read
 * scope from an address it has never used, and a new client secret was added to
 * its app registration two days earlier. The baseline is explicit that being on
 * the automation list is not the same as being expected right now, and that a
 * principal acting outside its documented function is off-pattern by definition.
 * Without the baseline, "a known service principal signed in" looks benign, which
 * is the wrong call.
 *
 * All instance data is fictional (ADR-0005): org "Meridian", tenant
 * meridian.onmicrosoft.com, RFC 5737 addresses.
 */
const investigation: Investigation = {
  id: "entra-workload-identity-anomaly",
  title: "A known service principal reaches further",
  short:
    "A first-party service principal signed in and pulled a broad scope. Routine automation, or a stolen credential?",
  sourcePlatform: "entra",
  difficulty: "challenge",
  severity: "high",
  eventType: "Workload Identity Sign-in Anomaly",
  mitre: "Valid Accounts: Cloud Accounts (T1078.004)",
  detectionSource: "Entra Sign-in Logs",
  evidence: {
    signal: {
      title: "Anomalous sign-in by a workload identity",
      source: "Entra Sign-in Logs",
      time: "2026-07-09 02:58:44 UTC",
      description:
        "Entra ID Protection raised a workload-identity risk for the service principal web-platform-sp: an access token was acquired for Microsoft Graph with directory-wide read scope, from an IP the principal has not used before. The detection notes a new credential was added to the app registration two days earlier.",
      triage: {
        source: "llm",
        disposition: "benign",
        confidence: 62,
        note: "The model recognized a known first-party service principal and assessed the sign-in as routine automation. Confirm or overturn its call.",
      },
      sections: [
        {
          heading: "The sign-in",
          rows: [
            {
              label: "Principal",
              value: "web-platform-sp (service principal)",
            },
            {
              label: "Type",
              value: "First-party app in meridian.onmicrosoft.com",
            },
            {
              label: "Resource",
              value: "Microsoft Graph",
              wide: true,
            },
            {
              label: "Scope granted",
              value: "Directory.Read.All (application permission)",
              wide: true,
            },
            { label: "Source IP", value: "192.0.2.77" },
            {
              label: "ASN",
              value: "hosting/datacenter, never seen for this principal",
              wide: true,
            },
            { label: "Result", value: "Success" },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Valid Accounts: Cloud Accounts (T1078.004)"],
          rows: [
            {
              label: "Credential change",
              value:
                "New client secret added to the app registration 2026-07-07 from 192.0.2.77",
              wide: true,
            },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Documented remit",
              value:
                "web-platform-sp operates the public marketing web platform; its activity is scoped to the web assets, not to directory or tenant reads",
              wide: true,
            },
            {
              label: "Usual origin",
              value:
                "Prior sign-ins came from Meridian trusted egress 198.51.100.0/24 only",
              wide: true,
            },
            {
              label: "Change ticket",
              value: "None references a scope or credential change",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "ENTRA-IDP-031" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "Entra Sign-in Logs" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            { label: "Event time", value: "2026-07-09 02:58:44 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "High",
  "actor": { "app": { "name": "web-platform-sp" } },
  "src_endpoint": { "ip": "192.0.2.77" },
  "finding_info": {
    "title": "Anomalous workload identity sign-in",
    "attacks": [{ "technique": { "uid": "T1078.004", "name": "Cloud Accounts" } }]
  },
  "cloud": { "provider": "azure", "account": { "uid": "meridian.onmicrosoft.com" } },
  "unmapped": {
    "principal_type": "service_principal",
    "resource": "Microsoft Graph",
    "scope": "Directory.Read.All",
    "source_asn": "hosting/datacenter",
    "new_credential_added": "2026-07-07T00:00:00Z",
    "new_credential_source_ip": "192.0.2.77",
    "usual_origin": "198.51.100.0/24"
  }
}`,
      unmapped: [
        { label: "resource", value: "Microsoft Graph" },
        { label: "scope", value: "Directory.Read.All", wide: true },
        { label: "source_asn", value: "hosting/datacenter", wide: true },
        {
          label: "new_credential_added",
          value: "2026-07-07 from 192.0.2.77",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "scope-outside-remit",
      label:
        "The token grants directory-wide read, outside the principal's documented function",
      signal: true,
      reasoning: {
        prompt:
          "Why does a scope outside the principal's documented remit matter?",
        options: [
          "It does not matter, because a service principal can request any scope it likes",
          "A workload identity acquiring access beyond its documented job strongly suggests its credentials are being abused, since the automation has no legitimate reason to read the directory",
          "Directory.Read.All is read-only, so it can never be misused",
        ],
        correct: 1,
      },
      note: "This is the core signal. The Meridian baseline scopes web-platform-sp to the marketing web assets. A directory-wide read has nothing to do with that job, which is the fingerprint of a stolen workload credential being used for reconnaissance.",
    },
    {
      id: "new-origin",
      label:
        "The sign-in came from an address and network the principal has never used",
      signal: true,
      reasoning: {
        prompt: "Why is the new origin a signal for a service principal?",
        options: [
          "Service principals are geographic and can only sign in from one country",
          "This principal's prior activity came only from Meridian trusted egress, so a first-ever datacenter origin means the credential is being used from somewhere it should not be",
          "Any datacenter IP is automatically malicious",
        ],
        correct: 1,
      },
      note: "Correct to flag. Per the baseline, web-platform-sp's sign-ins come from Meridian trusted egress 198.51.100.0/24. A first-ever hosting/datacenter origin means the token is being requested from outside the environment the automation runs in.",
    },
    {
      id: "new-credential",
      label:
        "A new client secret was added to the app registration two days earlier",
      signal: true,
      reasoning: {
        prompt: "Why does the freshly added credential raise the stakes?",
        options: [
          "New secrets are rotated automatically and always safe",
          "Adding a credential to an app registration is a persistence technique: it gives an attacker their own long-lived way to authenticate as the principal",
          "App registrations can only ever hold one secret, so this replaced the old one",
        ],
        correct: 1,
      },
      note: "A new secret added from the same unfamiliar address, with no change ticket, is classic workload-identity persistence: the attacker minted their own credential so they can keep authenticating as web-platform-sp.",
    },
    {
      id: "known-principal",
      label: "The principal is a known first-party app in Meridian's tenant",
      signal: false,
      note: "This is the trap, and the pipeline fell for it. The Meridian baseline is explicit that being on the automation list is not the same as being expected right now. A recognized principal doing something outside its documented remit is more concerning, not less.",
    },
    {
      id: "pipeline-benign",
      label: "The automated pipeline already assessed the sign-in benign",
      signal: false,
      note: "The pipeline's call is an input, not the verdict, and here it is wrong: it keyed on the familiar principal name and ignored the scope and origin. Overturning a mistaken benign call is exactly what this alert is built to teach.",
    },
    {
      id: "graph-resource",
      label: "The token was for Microsoft Graph, an API most apps use",
      signal: false,
      note: "That the resource is Graph is unremarkable; almost everything touches Graph. What matters is the permission requested, Directory.Read.All, not the fact that Graph was the resource.",
    },
  ],
  extract: [
    {
      id: "principal",
      label: "Service principal the token was acquired for",
      hint: "the workload identity in the sign-in",
      accept: ["web-platform-sp"],
      normalize: "text",
    },
    {
      id: "source-ip",
      label: "Source IP of the anomalous sign-in",
      hint: "the address the principal has not used before",
      accept: ["192.0.2.77"],
      normalize: "ip",
    },
    {
      id: "scope",
      label: "Scope the token was granted",
      hint: "the application permission on the Graph token",
      accept: ["Directory.Read.All"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "The Meridian baseline settles what the alert alone leaves ambiguous. web-platform-sp is a documented automation identity whose remit is the marketing web platform's web assets, and whose sign-ins come only from Meridian trusted egress. Here it acquired directory-wide read scope, from a hosting/datacenter address it has never used, days after a new client secret was quietly added to its app registration with no change ticket. Each fact is outside the principal's baseline behavior, and together they describe a stolen workload credential being used for reconnaissance and persistence. The familiar principal name is precisely what makes it look routine, and the baseline warns that being on the automation list is not the same as being expected right now. Overturn the pipeline's benign call and escalate on the identity path: revoke the principal's tokens, remove the unauthorized client secret, review what the directory read touched, and confirm how the credential was compromised.",
  },
};

export default investigation;
