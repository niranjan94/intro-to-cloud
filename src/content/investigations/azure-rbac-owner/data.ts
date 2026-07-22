import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Privileged RBAC Role Assigned" catalog event (AZ-RBAC-001):
 * Critical, detected via the Azure Activity Log, mapped to Valid Accounts: Cloud
 * Accounts (T1078.004). Owner at subscription scope grants full control over
 * every resource in the subscription. All instance data below is fictional
 * (ADR-0005): the organization is "Meridian", the Azure AD tenant domain is
 * meridian.onmicrosoft.com, and every address is from an RFC 5737 documentation
 * range.
 */
const investigation: Investigation = {
  id: "azure-rbac-owner",
  title: "Owner granted at subscription scope",
  short:
    "The Activity Log shows an Owner assignment over an entire production subscription. Sanctioned change, or a privilege grab?",
  sourcePlatform: "azure",
  difficulty: "standard",
  severity: "critical",
  eventType: "Privileged RBAC Role Assigned",
  mitre: "Cloud Accounts (T1078.004)",
  detectionSource: "Activity Log",
  evidence: {
    signal: {
      title: "Owner role assigned at subscription scope",
      source: "Azure Activity Log",
      time: "2026-04-02 23:47:12 UTC",
      description:
        "The Azure Activity Log recorded a roleAssignments/write creating a permanent Owner assignment at the scope of the meridian-prod subscription (id 7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41). The principal receiving it is an external guest account, and the assignment was made by a service principal.",
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
            { label: "Operation", value: "roleAssignments/write" },
            { label: "Role", value: "Owner" },
            {
              label: "Scope",
              value: "/subscriptions/7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41",
              wide: true,
            },
            {
              label: "Assignment type",
              value: "Permanent (not a PIM eligible activation)",
              wide: true,
            },
            {
              label: "Grantee",
              value:
                "brett.h_freemail.example#EXT#@meridian.onmicrosoft.com (Guest)",
              wide: true,
            },
            {
              label: "Actor",
              value:
                "sp-terraform-legacy (service principal, dormant 8 months)",
              wide: true,
            },
            { label: "Source IP", value: "192.0.2.161" },
            {
              label: "Geolocation",
              value: "Lagos, NG (never seen for this tenant)",
              wide: true,
            },
            { label: "Status", value: "Succeeded" },
            { label: "Channel", value: "Azure Portal" },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Cloud Accounts (T1078.004)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Privileged-access policy",
              value:
                "Standing privileged roles are granted only through PIM as time-bound, approval-gated activations from 198.51.100.0/24; permanent Owner is prohibited",
              wide: true,
            },
            {
              label: "Change ticket",
              value: "None references this grant",
              wide: true,
            },
            {
              label: "Role definition",
              value:
                "8e3af657-a8ff-443c-a75c-2fe8c4bcb635 is the built-in Owner role",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AZ-RBAC-001" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "Activity Log" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Event time", value: "2026-04-02 23:47:12 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "Critical",
  "actor": { "app": { "name": "sp-terraform-legacy" } },
  "src_endpoint": { "ip": "192.0.2.161" },
  "finding_info": {
    "title": "Privileged RBAC role assigned",
    "attacks": [{ "technique": { "uid": "T1078.004", "name": "Cloud Accounts" } }]
  },
  "cloud": { "provider": "azure", "account": { "uid": "7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41" } },
  "unmapped": {
    "raw_event": {
      "operationName": "Microsoft.Authorization/roleAssignments/write",
      "resultType": "Success",
      "callerIpAddress": "192.0.2.161",
      "claims": { "appid": "sp-terraform-legacy" },
      "properties": {
        "roleName": "Owner",
        "roleDefinitionId": "8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
        "principalType": "Guest",
        "scope": "/subscriptions/7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41"
      }
    }
  }
}`,
    },
  },
  aspects: [
    {
      id: "owner-subscription-scope",
      label: "The role granted is Owner at subscription scope",
      signal: true,
      reasoning: {
        prompt: "Why is Owner at subscription scope so serious?",
        options: [
          "Owner is a read-only role, so it only allows viewing resources",
          "Owner confers full control over every resource in the subscription, including the ability to grant further access to others",
          "Scope does not matter for RBAC because all roles apply tenant-wide",
        ],
        correct: 1,
      },
      note: "Owner at subscription scope is the broadest practical blast radius in Azure: full management of every resource plus the power to hand out more access. It is exactly the grant an attacker wants.",
    },
    {
      id: "external-guest",
      label: "The principal receiving the role is an external guest account",
      signal: true,
      reasoning: {
        prompt: "Why does the guest (#EXT#) principal raise concern?",
        options: [
          "Guest accounts cannot hold RBAC roles, so the event must be a logging error",
          "An external identity outside the organization now holds full control of a production subscription, which is rarely a legitimate arrangement",
          "Guest accounts are always more trustworthy because they are managed by another tenant",
        ],
        correct: 1,
      },
      note: "The #EXT# suffix marks a B2B guest federated from an outside identity. Handing production Owner to an external free-mail guest is a hallmark of account takeover or a rogue insider, not routine administration.",
    },
    {
      id: "permanent-not-pim",
      label: "The assignment is permanent, not a time-bound PIM activation",
      signal: true,
      reasoning: {
        prompt:
          "Why does the permanent assignment matter given Meridian's policy?",
        options: [
          "Permanent assignments expire automatically after one hour, so they are safer",
          "Policy requires privileged access through PIM as approval-gated, time-bound activations, so a standing permanent grant bypasses that control and leaves access that never lapses",
          "PIM and permanent assignments are identical, so the distinction is cosmetic",
        ],
        correct: 1,
      },
      note: "Bypassing PIM removes approval, time limits, and the activation audit trail. A permanent grant is durable access an attacker can rely on long after the initial intrusion.",
    },
    {
      id: "dormant-service-principal",
      label:
        "The grant was made by a dormant service principal, not a known admin",
      signal: true,
      reasoning: {
        prompt: "Why is the identity of the actor a signal?",
        options: [
          "Service principals cannot assign roles, so this proves nothing",
          "A service principal idle for months suddenly assigning Owner suggests its credentials were compromised and are being abused for privilege escalation",
          "Service principals are exempt from monitoring, so their actions are always safe",
        ],
        correct: 1,
      },
      note: "A long-dormant automation identity waking up only to grant Owner is a classic sign of a stolen client secret or certificate being used to escalate.",
    },
    {
      id: "unfamiliar-ip",
      label: "The caller IP and geolocation are unfamiliar for this tenant",
      signal: true,
      reasoning: {
        prompt: "What makes the caller address suspicious here?",
        options: [
          "It is an IPv6 address and Azure only accepts IPv4 for RBAC changes",
          "It sits outside Meridian's known office egress range and geolocates somewhere the tenant has never operated from",
          "It is a private RFC 1918 address, which can never appear in the Activity Log",
        ],
        correct: 1,
      },
      note: "Privileged changes are expected only from 198.51.100.0/24. A first-ever geolocation for a role assignment correlates the grant with an external actor.",
    },
    {
      id: "status-succeeded",
      label: "The operation status is Succeeded",
      signal: false,
      note: "Whether the assignment succeeded or failed is not itself the signal. A failed attempt could indicate reconnaissance, but success here just confirms the grant took effect; the risk comes from what was granted and to whom.",
    },
    {
      id: "portal-channel",
      label: "The change was made through the Azure Portal",
      signal: false,
      note: "The portal is a normal channel for RBAC changes. The channel does not tell you whether the change was authorized.",
    },
    {
      id: "subscription-name",
      label: "The subscription is named meridian-prod",
      signal: false,
      note: "The subscription name is just a label. It confirms the environment is production but is not an indicator of compromise on its own.",
    },
  ],
  extract: [
    {
      id: "caller-ip",
      label: "Caller IP of the role assignment",
      hint: "the callerIpAddress in the event",
      accept: ["192.0.2.161"],
      normalize: "ip",
    },
    {
      id: "grantee-upn",
      label: "Grantee principal (UPN)",
      hint: "the external guest that received Owner",
      accept: ["brett.h_freemail.example#EXT#@meridian.onmicrosoft.com"],
      normalize: "text",
    },
    {
      id: "role-name",
      label: "Role definition granted",
      hint: "the roleName in the event",
      accept: ["Owner"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "The signals converge on privilege escalation: a permanent Owner grant over a production subscription, given to an external guest, made by a dormant service principal from an address and location the tenant has never used, with no change ticket and PIM bypassed entirely. Escalate on the AZ-RBAC-001 path (SOC Analyst to SOC Lead to CISO), remove the role assignment immediately, disable the guest and the service principal, rotate the service principal's credentials, and review the Activity Log for anything the assignee did after the grant.",
  },
};

export default investigation;
