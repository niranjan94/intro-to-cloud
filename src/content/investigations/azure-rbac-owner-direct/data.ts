import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Privileged RBAC Role Assigned" catalog event (AZ-RBAC-001):
 * Critical, detected via the Azure Activity Log, mapped to Valid Accounts: Cloud
 * Accounts (T1078.004). This is the baseline-deciding counterpart to
 * azure-rbac-owner: where that case is a blatant grab (external guest, dormant
 * service principal, foreign IP) that escalates on its own, this one looks
 * entirely routine. A recognized internal administrator, signed in from Meridian
 * trusted egress with MFA satisfied, grants Owner to an internal colleague.
 *
 * Its verdict depends on the Meridian baseline. The grant is a permanent, direct
 * assignment, not a PIM eligible activation, and no change ticket references it.
 * The baseline mandates that standing privileged roles arrive only through PIM as
 * time-bound, approval-gated activations, states that permanent Owner is
 * prohibited, and warns that the path matters as much as the person and that a
 * known-good actor acting outside policy still earns scrutiny. Without the
 * baseline, "an admin granted a colleague Owner from the office" reads as normal
 * access management, which is the wrong call.
 *
 * All instance data is fictional (ADR-0005): org "Meridian", tenant
 * meridian.onmicrosoft.com, subscription id 7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41,
 * RFC 5737 addresses.
 */
const investigation: Investigation = {
  id: "azure-rbac-owner-direct",
  title: "Owner granted the direct way",
  short:
    "A known admin assigns Owner to a colleague from the office. Ordinary access management, or a policy the baseline forbids?",
  sourcePlatform: "azure",
  difficulty: "challenge",
  severity: "critical",
  eventType: "Privileged RBAC Role Assigned",
  mitre: "Cloud Accounts (T1078.004)",
  detectionSource: "Activity Log",
  evidence: {
    signal: {
      title: "Permanent Owner assigned at subscription scope",
      source: "Azure Activity Log",
      time: "2026-07-11 16:22:39 UTC",
      description:
        "The Azure Activity Log recorded a roleAssignments/write creating a permanent Owner assignment at the scope of the meridian-prod subscription (id 7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41). The change was made by a recognized internal administrator and grants the role to an internal employee.",
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
              value: "m.reyes@meridian.example (member, internal)",
              wide: true,
            },
            {
              label: "Actor",
              value: "d.okonkwo@meridian.example (recognized administrator)",
              wide: true,
            },
            {
              label: "Source IP",
              value: "198.51.100.44 (Meridian trusted egress)",
            },
            { label: "MFA", value: "Satisfied" },
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
                "Standing privileged roles are granted only through PIM as time-bound, approval-gated activations; permanent Owner is prohibited",
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
            { label: "Event time", value: "2026-07-11 16:22:39 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "Critical",
  "actor": { "user": { "name": "d.okonkwo@meridian.example" } },
  "src_endpoint": { "ip": "198.51.100.44" },
  "finding_info": {
    "title": "Privileged RBAC role assigned",
    "attacks": [{ "technique": { "uid": "T1078.004", "name": "Cloud Accounts" } }]
  },
  "cloud": { "provider": "azure", "account": { "uid": "7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41" } },
  "unmapped": {
    "raw_event": {
      "operationName": "Microsoft.Authorization/roleAssignments/write",
      "resultType": "Success",
      "callerIpAddress": "198.51.100.44",
      "claims": { "name": "d.okonkwo@meridian.example", "mfa": "1" },
      "properties": {
        "roleName": "Owner",
        "roleDefinitionId": "8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
        "principalType": "User",
        "principalName": "m.reyes@meridian.example",
        "assignmentType": "Permanent",
        "scope": "/subscriptions/7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41"
      }
    }
  }
}`,
      unmapped: [
        {
          label: "assignmentType",
          value: "Permanent (not PIM eligible)",
          wide: true,
        },
        { label: "principalType", value: "User (internal member)" },
        { label: "mfa", value: "1 (satisfied)" },
      ],
    },
  },
  aspects: [
    {
      id: "permanent-not-pim",
      label:
        "The assignment is a permanent, direct grant, not a PIM eligible activation",
      signal: true,
      reasoning: {
        prompt:
          "Why does the permanent, direct path matter given Meridian's policy?",
        options: [
          "It does not matter, because Owner is Owner however it is assigned",
          "The baseline mandates PIM for standing privileged roles and prohibits permanent Owner, so a direct grant bypasses approval, time limits, and the activation audit trail regardless of who made it",
          "Permanent assignments expire after an hour, so they are the safer option",
        ],
        correct: 1,
      },
      note: "This is the core signal, and it is decidable only against the baseline. Meridian requires privileged access through PIM as time-bound, approval-gated activations. A standing Owner grant is a policy violation on its face and leaves access that never lapses.",
    },
    {
      id: "no-change-ticket",
      label: "No change ticket references the grant",
      signal: true,
      reasoning: {
        prompt: "Why is the missing ticket a signal here?",
        options: [
          "Tickets are optional for admins, so its absence means nothing",
          "Every sanctioned change at Meridian carries a CHG ticket, so a sensitive change with none is unauthorized until proven otherwise, even when the actor is known",
          "A ticket is only needed for changes made by external users",
        ],
        correct: 1,
      },
      note: "The baseline treats the ticket as how a legitimate change announces itself. A privileged grant with no ticket is exactly the case the baseline says to distrust until it is explained.",
    },
    {
      id: "owner-subscription-scope",
      label: "The role granted is Owner at subscription scope",
      signal: true,
      reasoning: {
        prompt: "Why is Owner at subscription scope so serious?",
        options: [
          "Owner is a read-only role limited to the resource group it is applied in",
          "Owner confers full control over every resource in the subscription, including the ability to grant further access to others",
          "Subscription scope is narrower than resource scope, so the blast radius is small",
        ],
        correct: 1,
      },
      note: "Owner at subscription scope is the broadest practical blast radius in Azure. A standing grant of it is durable, maximal access, which is why the mandated PIM path exists in the first place.",
    },
    {
      id: "known-admin",
      label: "The change was made by a recognized internal administrator",
      signal: false,
      note: "This is the trap. A legitimate actor does not make an out-of-policy grant acceptable. The baseline is explicit that the path matters as much as the person, and that a known-good identity acting outside its role still earns scrutiny.",
    },
    {
      id: "trusted-egress",
      label: "The change came from Meridian trusted egress with MFA satisfied",
      signal: false,
      note: "A trusted origin and satisfied MFA are expected for an admin and do not sanction the assignment. The baseline notes that trusted egress is narrow: a known-good address doing something outside policy is still off-pattern.",
    },
    {
      id: "internal-grantee",
      label: "The grantee is an internal employee, not an external guest",
      signal: false,
      note: "Internal versus external changes who received the role, not whether the permanent-Owner path is allowed. The baseline prohibits the standing grant regardless of who the grantee is.",
    },
  ],
  extract: [
    {
      id: "actor",
      label: "Administrator who made the assignment",
      hint: "the caller in the event",
      accept: ["d.okonkwo@meridian.example", "d.okonkwo"],
      normalize: "text",
    },
    {
      id: "grantee",
      label: "Principal that received Owner",
      hint: "the internal employee granted the role",
      accept: ["m.reyes@meridian.example", "m.reyes"],
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
    why: "The Meridian baseline is what settles this, because the alert on its own looks like ordinary access management: a recognized administrator, from trusted egress, with MFA satisfied, granting Owner to an internal colleague. The baseline mandates that standing privileged roles arrive only through PIM as time-bound, approval-gated activations, and states plainly that permanent Owner is prohibited, so a permanent, direct Owner grant at subscription scope is a policy violation on its face. No change ticket references it, and the baseline treats a sensitive change with no ticket as unauthorized until explained. The legitimacy of the actor and the trusted origin are exactly what make this look routine, but the baseline is explicit that the path matters as much as the person and that a known-good identity acting outside policy still earns scrutiny. Escalate on the AZ-RBAC-001 path: reverse the assignment, re-provision the access through PIM only if it is genuinely warranted and ticketed, and confirm with the administrator whether the account was misused or the grant was a deliberate policy bypass.",
  },
};

export default investigation;
