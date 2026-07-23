import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Dormant Privileged Guest Account" catalog event, surfaced by a
 * Microsoft Entra PIM access review of standing privileged role assignments
 * (OCSF Compliance Finding, class 2003). The review recertifies who holds
 * privileged roles; here it flags an external guest from a partner organization
 * that still holds an active, permanent Contributor assignment at subscription
 * scope but has not signed in for 200 days. This is a real standing risk, not an
 * active incident: nothing has been abused, so the correct call is to route it to
 * identity governance for removal, not to escalate and not to close. It teaches
 * that dormancy is not safety, and that unused standing privilege on an
 * externally-controlled identity is pure attack surface with no offsetting value.
 *
 * The event type is anchored to a real detection concept; the severity (Medium),
 * detection source (PIM access review), and OCSF class are honest. No clean MITRE
 * ATT&CK technique applies to a governance finding with no observed adversary
 * behavior, so `mitre` is left undefined rather than invented. All instance data
 * is fictional (ADR-0005): org "Meridian" (tenant meridian.onmicrosoft.com),
 * partner "Blue Harbor" (blueharbor.example), subscription id
 * 7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41, and a placeholder change ticket.
 */
const investigation: Investigation = {
  id: "entra-stale-guest-admin",
  title: "A guest who never left",
  short:
    "An external guest still holds a privileged role, 200 days since its last sign-in. Leave it, or act on it?",
  sourcePlatform: "entra",
  difficulty: "standard",
  severity: "medium",
  eventType: "Dormant Privileged Guest Account",
  detectionSource: "PIM access review",
  evidence: {
    signal: {
      title: "Dormant guest retains a standing privileged role",
      source: "PIM access review",
      time: "2026-07-20 09:00:00 UTC",
      description:
        "A scheduled Microsoft Entra PIM access review of standing privileged role assignments flagged an external guest account for recertification. The account holds an active, permanent Contributor assignment at the scope of the meridian-prod subscription and has not signed in to the tenant for 200 days. The review surfaces the assignment for a decision; it does not assert that the account was misused.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The access review applied the catalog severity and routed this to an analyst for a recertification decision.",
      },
      sections: [
        {
          heading: "Assignment under review",
          rows: [
            { label: "Role", value: "Contributor" },
            {
              label: "Scope",
              value: "/subscriptions/7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41",
              wide: true,
            },
            {
              label: "Assignment type",
              value:
                "Active, permanent (not a PIM eligible, time-bound activation)",
              wide: true,
            },
            { label: "Granted", value: "2025-06-15 (about 400 days ago)" },
            {
              label: "Last interactive sign-in",
              value: "2026-01-01 (200 days ago)",
            },
            { label: "Days inactive", value: "200" },
          ],
        },
        {
          heading: "Identity",
          rows: [
            {
              label: "Guest account",
              value:
                "r.calder_blueharbor.example#EXT#@meridian.onmicrosoft.com",
              wide: true,
            },
            {
              label: "Source mail",
              value: "r.calder@blueharbor.example",
              wide: true,
            },
            {
              label: "User type",
              value: "Guest (external, B2B collaboration)",
            },
            {
              label: "Home tenant",
              value: "Blue Harbor (blueharbor.example), a partner organization",
              wide: true,
            },
            { label: "MFA", value: "Registered and enforced" },
            { label: "Account status", value: "Enabled" },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Privileged-access policy",
              value:
                "Standing privileged roles are granted only through PIM as time-bound, approval-gated activations; permanent standing grants are against policy",
              wide: true,
            },
            {
              label: "Original change ticket",
              value:
                "CHG-3902 onboarded this guest for the 2025 data-migration engagement",
              wide: true,
            },
            {
              label: "Engagement status",
              value:
                "The migration engagement closed in early 2026; access was never revoked",
              wide: true,
            },
            {
              label: "Recent activity",
              value:
                "No sign-ins and no role-scoped actions in the last 200 days",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "ENTRA-PIM-007" },
            { label: "Category", value: "Identity governance" },
            { label: "Detection source", value: "PIM access review" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            { label: "Subscription", value: "meridian-prod" },
            {
              label: "Review",
              value: "Quarterly privileged-role recertification",
            },
            { label: "Event time", value: "2026-07-20 09:00:00 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2003,
  "class_name": "Compliance Finding",
  "category_uid": 2,
  "category_name": "Findings",
  "severity": "Medium",
  "severity_id": 3,
  "time": "2026-07-20T09:00:00Z",
  "finding_info": {
    "title": "Dormant guest retains a standing privileged role",
    "desc": "External guest holds an active, permanent Contributor assignment at subscription scope with no sign-in for 200 days"
  },
  "compliance": {
    "control": "Privileged-role recertification (guest and external identities)",
    "standards": ["Meridian PIM policy"],
    "status": "Fail"
  },
  "actor": {
    "user": {
      "name": "r.calder_blueharbor.example#EXT#@meridian.onmicrosoft.com",
      "type": "Guest",
      "email_addr": "r.calder@blueharbor.example"
    }
  },
  "resources": [
    {
      "type": "Microsoft.Authorization/roleAssignments",
      "uid": "/subscriptions/7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41",
      "data": { "roleName": "Contributor", "assignmentType": "Permanent" }
    }
  ],
  "cloud": {
    "provider": "azure",
    "tenant": { "uid": "meridian.onmicrosoft.com" },
    "account": { "uid": "7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41" }
  },
  "remediation": {
    "desc": "Remove the standing Contributor assignment. Re-provision through PIM as a time-bound eligible assignment only if the access is still required and ticketed."
  },
  "unmapped": {
    "user_type": "Guest",
    "external_tenant": "blueharbor.example",
    "assignment_type": "Active, permanent (not PIM eligible)",
    "last_interactive_sign_in": "2026-01-01T00:00:00Z",
    "days_inactive": 200,
    "mfa_registered": true,
    "original_change_ticket": "CHG-3902",
    "engagement_status": "closed"
  }
}`,
      unmapped: [
        { label: "user_type", value: "Guest (external B2B)" },
        {
          label: "assignment_type",
          value: "Active, permanent (not PIM eligible)",
          wide: true,
        },
        { label: "days_inactive", value: "200" },
        { label: "mfa_registered", value: "true" },
        { label: "engagement_status", value: "closed" },
      ],
    },
  },
  aspects: [
    {
      id: "external-guest-privileged",
      label:
        "An external guest from a partner organization holds a privileged role in the tenant",
      signal: true,
      reasoning: {
        prompt:
          "Why is an external guest holding a standing privileged role a risk worth acting on, even with no sign of misuse?",
        options: [
          "Because guest accounts can never legitimately be assigned Azure roles, so this must be a misconfiguration to reverse",
          "Because the account is controlled by a partner Meridian does not manage, so its credential hygiene, device posture, and offboarding sit outside Meridian's control while it retains privilege inside Meridian's tenant",
          "Because any guest with a role assignment is an active intrusion until proven otherwise",
        ],
        correct: 1,
      },
      note: "You were right to flag it. The risk is not that a guest can hold a role, but that this one is an outside, unmanaged identity holding standing privilege. If Blue Harbor is breached or the person leaves that firm, Meridian inherits the exposure and may never hear about it.",
    },
    {
      id: "permanent-not-pim",
      label:
        "The assignment is an active, permanent grant, not a time-bound PIM activation",
      signal: true,
      reasoning: {
        prompt:
          "Why does the assignment being permanent rather than a time-bound PIM activation matter here?",
        options: [
          "It does not matter, because the effective permissions are identical either way",
          "Because Meridian requires standing privileged access to arrive through PIM as time-bound, approval-gated activations, so a permanent grant never lapses on its own and sits outside the expiry and recertification controls that would have caught it sooner",
          "Because permanent assignments are automatically removed after 90 days of inactivity, so it should already be gone",
        ],
        correct: 1,
      },
      note: "Correct to flag. The baseline mandates PIM time-bound activations for standing privileged roles. A permanent grant is access that outlives its purpose by default: nothing expires it, which is exactly how a guest ends up holding Contributor 400 days later.",
    },
    {
      id: "dormant-200-days",
      label:
        "The account has not signed in for 200 days while retaining the role",
      signal: true,
      reasoning: {
        prompt:
          "Why is 200 days of no sign-in a reason to remove the role rather than a reason to relax?",
        options: [
          "Because a dormant account has definitively been compromised, which the absence of sign-ins proves",
          "Because the access has outlived the work that justified it: an unused privileged assignment carries no business value and is pure standing attack surface, so it should be revoked",
          "Because Entra automatically deletes any account after 180 days of inactivity, so the finding will resolve itself",
        ],
        correct: 1,
      },
      note: "The dormancy is the point. The engagement that justified this access closed and the account went silent, yet the privilege remained. Unused standing privilege on an external identity is cost with no benefit, and removing it shrinks the attack surface for free.",
    },
    {
      id: "mfa-enforced",
      label: "MFA is registered and enforced on the guest account",
      signal: false,
      note: "MFA lowers the odds of the credential being taken over, but it does nothing about the account holding privilege it no longer needs. Strong authentication on an assignment that should not exist is not a reason to leave it in place.",
    },
    {
      id: "original-ticket",
      label:
        "The original grant was covered by an approved change ticket (CHG-3902)",
      signal: false,
      note: "The ticket explains why the access was granted 400 days ago and is exactly why this is not an intrusion to escalate. But CHG-3902 authorized access for an engagement that has since closed. A ticket that justified a past grant does not authorize the access to persist indefinitely, so this is a reason not to escalate, not a reason to close.",
    },
    {
      id: "no-malicious-activity",
      label:
        "There are no anomalous or malicious sign-ins associated with the account",
      signal: false,
      note: "Absence of active abuse is why this is not an incident to escalate. It is not evidence that the standing access is safe: a dormant external identity holding privilege is a risk whether or not it has been abused yet. Do not read 'not yet abused' as 'safe to ignore'.",
    },
    {
      id: "many-guests",
      label: "The tenant contains many other external guest accounts",
      signal: false,
      note: "The size of the guest population is background scale. It describes Meridian's collaboration footprint, not whether this specific identity should hold a privileged role. It is a reason to run access reviews, not a fact about this finding.",
    },
  ],
  extract: [
    {
      id: "guest-account",
      label: "Guest account under review",
      hint: "the #EXT# UPN, or the partner email it maps to",
      accept: [
        "r.calder_blueharbor.example#EXT#@meridian.onmicrosoft.com",
        "r.calder@blueharbor.example",
        "r.calder",
      ],
      normalize: "text",
    },
    {
      id: "partner-domain",
      label: "Partner domain the guest belongs to",
      hint: "the external home organization's domain",
      accept: ["blueharbor.example"],
      normalize: "domain",
    },
    {
      id: "role-held",
      label: "Privileged role the guest holds",
      hint: "the roleName on the assignment",
      accept: ["Contributor"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "route",
    why: "This is a genuine standing risk but not an active incident, so it routes to identity governance rather than escalating or closing. An external guest Meridian does not manage holds an active, permanent Contributor assignment at subscription scope, granted 400 days ago and unused for 200. The baseline requires standing privileged access to arrive through time-bound PIM activations, so a permanent guest grant is out of policy on its face, and the engagement that justified it has closed. The correct call is to route it to identity governance to revoke the assignment (re-provisioning through PIM as a time-bound eligible role only if it is still genuinely needed and ticketed), which closes it for SOC purposes while ensuring the access is actually removed. Escalate is the wrong call: nothing has been abused, there is no sign-in from a hostile address, and the original grant was sanctioned, so there is no incident to hand up the response path. A plain Close is the more tempting error and is also wrong: the account being dormant and MFA-protected feels like 'nothing is happening', but that leaves an externally-controlled, over-privileged identity in the tenant indefinitely, so the exposure is never removed and the access review's whole purpose is defeated. The lesson: dormancy is not safety. Unused standing privilege on an outside identity is pure attack surface, and a real governance finding gets routed for remediation, not closed as noise.",
  },
};

export default investigation;
