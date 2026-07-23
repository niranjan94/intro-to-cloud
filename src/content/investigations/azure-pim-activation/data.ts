import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Privileged Role Activated (PIM)" catalog event (AZ-PIM-002):
 * High, detected via Entra Privileged Identity Management and the Azure Activity
 * Log, mapped to Valid Accounts: Cloud Accounts (T1078.004). The Azure resource
 * role activation is recorded as a Microsoft.Authorization/
 * roleAssignmentScheduleRequests/write with requestType SelfActivate, carrying a
 * scheduleInfo expiration, an approvalId, and ticketInfo, matching the ARM PIM
 * schedule-request shape.
 *
 * This is the benign true-positive counterpart to azure-rbac-owner-direct. Both
 * put Owner at subscription scope in the same hands; the calls diverge on the
 * path. Where the direct case is a permanent, standing grant with no PIM, no
 * approval, and no ticket (an incident to escalate), this one is a self-activation
 * of an eligible role: a recorded approver signed off, the assignment is
 * time-bound and expires automatically after eight hours, and it references a
 * change ticket. That is exactly the sanctioned just-in-time path the Meridian
 * baseline mandates for standing privilege, so the correct call is to close it as
 * authorized activity, recording the attribution.
 *
 * Its verdict depends on the Meridian baseline, which states that standing
 * privileged roles arrive only through PIM as time-bound, approval-gated
 * activations, that permanent Owner is prohibited, and that a sanctioned change
 * announces itself with a CHG ticket. It teaches that the difference between the
 * two twins is the path, not the power: blast radius, recency, and the clock are
 * the same whether an activation is authorized or not.
 *
 * All instance data is fictional (ADR-0005): org "Meridian", tenant
 * meridian.onmicrosoft.com, subscription id 7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41,
 * RFC 5737 addresses, placeholder identifiers.
 */
const investigation: Investigation = {
  id: "azure-pim-activation",
  title: "Owner activated through PIM",
  short:
    "An administrator activates Owner over production at 02:00. Sanctioned just-in-time access, or a privilege grab?",
  sourcePlatform: "azure",
  difficulty: "challenge",
  severity: "high",
  eventType: "Privileged Role Activated (PIM)",
  mitre: "Cloud Accounts (T1078.004)",
  detectionSource: "Entra PIM",
  evidence: {
    signal: {
      title: "Eligible Owner role activated at subscription scope",
      source: "Entra PIM audit log",
      time: "2026-07-18 02:14:37 UTC",
      description:
        "Privileged Identity Management recorded a self-activation of the eligible Owner role at the scope of the meridian-prod subscription (id 7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41). The activation was requested by a recognized internal administrator, approved by a separate party, and provisioned as a time-bound assignment.",
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
              label: "Operation",
              value: "roleAssignmentScheduleRequests/write",
              wide: true,
            },
            { label: "Request type", value: "SelfActivate" },
            { label: "Role", value: "Owner" },
            {
              label: "Scope",
              value: "/subscriptions/7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41",
              wide: true,
            },
            {
              label: "Assignment type",
              value: "PIM eligible activation, time-bound (not permanent)",
              wide: true,
            },
            {
              label: "Principal",
              value: "a.mehta@meridian.example (self-activated)",
              wide: true,
            },
            {
              label: "Actor",
              value:
                "a.mehta@meridian.example (recognized administrator, standing Owner eligibility)",
              wide: true,
            },
            {
              label: "Source IP",
              value: "198.51.100.52 (Meridian trusted egress)",
            },
            { label: "MFA", value: "Satisfied" },
            { label: "Status", value: "Provisioned (Succeeded)" },
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
              label: "Approval",
              value: "Approved by k.novak@meridian.example (separate approver)",
              wide: true,
            },
            {
              label: "Expiry",
              value:
                "Automatic after 8 hours (expires 2026-07-18 10:14:37 UTC)",
              wide: true,
            },
            {
              label: "Change ticket",
              value:
                "CHG-4890 referenced (payments service incident response, INC-2261)",
              wide: true,
            },
            {
              label: "Eligibility",
              value:
                "a.mehta holds a standing PIM-eligible Owner assignment on meridian-prod",
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
            { label: "Alert ID", value: "AZ-PIM-002" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "Entra PIM" },
            { label: "Subscription", value: "meridian-prod" },
            { label: "Event time", value: "2026-07-18 02:14:37 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "High",
  "actor": { "user": { "name": "a.mehta@meridian.example" } },
  "src_endpoint": { "ip": "198.51.100.52" },
  "finding_info": {
    "title": "Privileged role activated via PIM",
    "attacks": [{ "technique": { "uid": "T1078.004", "name": "Cloud Accounts" } }]
  },
  "cloud": { "provider": "azure", "account": { "uid": "7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41" } },
  "unmapped": {
    "raw_event": {
      "operationName": "Microsoft.Authorization/roleAssignmentScheduleRequests/write",
      "resultType": "Success",
      "callerIpAddress": "198.51.100.52",
      "claims": { "name": "a.mehta@meridian.example", "mfa": "1" },
      "properties": {
        "requestType": "SelfActivate",
        "roleName": "Owner",
        "roleDefinitionId": "8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
        "principalType": "User",
        "principalName": "a.mehta@meridian.example",
        "scope": "/subscriptions/7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41",
        "status": "Provisioned",
        "scheduleInfo": {
          "startDateTime": "2026-07-18T02:14:37Z",
          "expiration": { "type": "AfterDuration", "duration": "PT8H", "endDateTime": "2026-07-18T10:14:37Z" }
        },
        "approvalId": "b2f8c1a4-6d3e-4f21-9c07-3a5e1b8d4f60",
        "approval": { "stages": [{ "approver": "k.novak@meridian.example", "result": "Approved" }] },
        "ticketInfo": { "ticketNumber": "CHG-4890", "ticketSystem": "Meridian Change" },
        "justification": "Investigating elevated error rates on the payments service (INC-2261)"
      }
    }
  }
}`,
      unmapped: [
        { label: "requestType", value: "SelfActivate" },
        {
          label: "scheduleInfo.expiration",
          value: "AfterDuration PT8H (expires 2026-07-18T10:14:37Z)",
          wide: true,
        },
        {
          label: "approval.stages[0].approver",
          value: "k.novak@meridian.example (Approved)",
          wide: true,
        },
        { label: "ticketInfo.ticketNumber", value: "CHG-4890" },
      ],
    },
  },
  aspects: [
    {
      id: "owner-activated",
      label:
        "Owner over the entire production subscription was activated and taken up",
      signal: true,
      reasoning: {
        prompt:
          "Why flag a privileged-role activation even when it looks routine?",
        options: [
          "Because any PIM activation is unauthorized until an administrator re-approves it after the fact",
          "Because Owner at subscription scope is the broadest access in the environment, so every activation of it is confirmed against the sanctioned path before the alert is closed, not assumed",
          "Because PIM activations bypass MFA and approval, so they are inherently riskier than a direct grant",
        ],
        correct: 1,
      },
      note: "Correct to flag. Owner at subscription scope is the broadest practical blast radius in Azure, so a live activation of it is confirmed rather than rubber-stamped. Here it resolves cleanly: the access came through PIM with a recorded approver, a bounded expiry, and a change ticket.",
    },
    {
      id: "elevation-event",
      label:
        "The activation elevates the user above the standing access they hold day to day",
      signal: true,
      reasoning: {
        prompt:
          "Why does a just-in-time elevation deserve a check before you close?",
        options: [
          "Because an activation is a real, if temporary, privilege escalation, so you confirm it was an eligible, approved, time-bound activation and not an unsanctioned standing grant",
          "Because activated roles never expire, so the elevation is effectively permanent",
          "Because a user cannot hold an eligibility without already being a standing Owner",
        ],
        correct: 0,
      },
      note: "Correct to flag. An activation is a genuine elevation for its window, which is why the baseline requires it to go through PIM. The axis that decides this case is standing versus time-bound: here the access is an eligible role activated for a bounded window under an approval, not a permanent grant.",
    },
    {
      id: "recent",
      label: "The activation happened only minutes before the alert fired",
      signal: false,
      note: "Recency is not a signal. PIM activations are just-in-time and take effect immediately by design, so a fresh timestamp is the expected case. When it happened tells you nothing about whether it was authorized.",
    },
    {
      id: "off-hours",
      label: "The activation occurred at 02:14 UTC, outside business hours",
      signal: false,
      note: "The baseline records Meridian as a fully remote workforce with no meaningful office-hours window, so time of day alone is not an anomaly. A privileged action is judged on who did it, from where, and whether it was sanctioned, never on the clock.",
    },
    {
      id: "self-service",
      label:
        "The user activated their own eligible role rather than an administrator assigning it",
      signal: false,
      note: "Self-service activation is exactly how PIM just-in-time access works: the eligibility is pre-provisioned and each activation is approval-gated. The absence of a second administrator performing an assignment is the normal channel, not a missing control.",
    },
    {
      id: "ticket-referenced",
      label: "The activation references change ticket CHG-4890",
      signal: false,
      note: "A referenced ticket lowers risk; it is how a sanctioned change announces itself at Meridian. Flagging the presence of a ticket inverts the logic: a missing ticket is the red flag, not a present one.",
    },
    {
      id: "time-bound-approved",
      label:
        "The activation was approved by a separate party and expires automatically after 8 hours",
      signal: false,
      note: "An approval in the loop and an automatic expiry are the sanctioned-path controls, and they reduce risk. These are precisely the controls whose absence makes the standing direct grant in the twin case an incident.",
    },
  ],
  extract: [
    {
      id: "activator",
      label: "Administrator who activated the role",
      hint: "the principal that self-activated in the event",
      accept: ["a.mehta@meridian.example", "a.mehta"],
      normalize: "text",
    },
    {
      id: "role-name",
      label: "Role that was activated",
      hint: "the roleName in the event",
      accept: ["Owner"],
      normalize: "text",
    },
    {
      id: "ticket",
      label: "Change ticket referenced by the activation",
      hint: "the ticketNumber in ticketInfo",
      accept: ["CHG-4890"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "This is a genuine privileged activation, and it is authorized. A user activated Owner at subscription scope, which is the broadest access in the environment and always worth confirming, but every control the Meridian baseline requires for standing privilege is present: the access was taken up through PIM as a self-activation of an eligible role, a separate approver signed off, it is time-bound and expires automatically after eight hours, and it references change ticket CHG-4890. That is the sanctioned just-in-time path the baseline mandates, so this is a benign true positive. Close it and record the attribution. The tempting wrong call is escalate, because the surface facts look alarming: Owner over production, activated minutes ago, at 02:14 in the morning. None of those decide it. Blast radius is the same whether an activation is authorized or not, PIM activations are just-in-time and take effect immediately by design, and Meridian is a fully remote workforce with no office-hours window, so the clock is not an anomaly. Contrast this with the standing direct grant in azure-rbac-owner-direct: identical role and scope, but a permanent assignment with no PIM, no approval, and no ticket, which is an incident. The difference is the path, not the power. A plain escalate here would spend the incident process on sanctioned access management. Note that the close is earned only because those controls are present and verifiable: an activation you could not tie to an approval and a ticket would not clear, and the right move then would be to escalate.",
  },
};

export default investigation;
