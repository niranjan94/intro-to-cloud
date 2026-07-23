import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "External Mail Forwarding Rule Created" catalog event (an
 * Exchange Online New-InboxRule operation surfaced through the Entra / Exchange
 * audit log): High severity, mapped to Email Collection: Email Forwarding Rule
 * (T1114.003), raw payload modeled as OCSF API Activity (class 6003, Create).
 * This is the benign twin of entra-inbox-forwarding: the same alert shape (a new
 * rule auto-forwarding all incoming mail to an outside address) but an authorized
 * shared-mailbox delegation to an approved partner, created interactively by the
 * mailbox owner from trusted egress under a change ticket. A real rule, but not an
 * incident, so the correct call is to close it. It teaches that the mechanics of a
 * forwarding rule cannot tell you whether it is malicious; attribution can. All
 * instance data is fictional (ADR-0005): org "Meridian", meridian.example, the
 * approved partner brightpath-bpo.example, RFC 5737 addresses, illustrative ids.
 */
const investigation: Investigation = {
  id: "entra-forwarding-authorized",
  title: "Mail forwarding to an external address",
  short:
    "A new inbox rule forwards mail to an address outside Meridian. Exfiltration channel, or an approved handoff?",
  sourcePlatform: "entra",
  difficulty: "challenge",
  severity: "high",
  eventType: "External Mail Forwarding Rule Created",
  mitre: "Email Forwarding Rule (T1114.003)",
  detectionSource: "Entra / Exchange audit",
  evidence: {
    signal: {
      title: "New inbox rule forwarding mail to an external address",
      source: "Entra / Exchange audit",
      time: "2026-07-16 10:12:47 UTC",
      description:
        "The Exchange Online audit log recorded a New-InboxRule operation that created a client-side rule auto-forwarding all incoming mail from a shared mailbox to a recipient outside the organization's domains. The audit records the operation and its parameters; it does not determine whether the forwarding was authorized.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Inbox rule",
          rows: [
            {
              label: "Rule name",
              value: "Forward AP mail to BrightPath (CHG-4712)",
              wide: true,
            },
            { label: "Mailbox", value: "ap-billing@meridian.example" },
            { label: "When", value: "a message arrives (all messages)" },
            {
              label: "Do",
              value: "forward to ap-intake@brightpath-bpo.example",
              wide: true,
            },
            {
              label: "Keeps a copy",
              value: "Yes (original stays in the mailbox)",
            },
            {
              label: "Concealment actions",
              value: "None (no mark-read, move, delete, or stop-processing)",
              wide: true,
            },
            { label: "Created via", value: "Outlook on the web" },
          ],
        },
        {
          heading: "Actor and session",
          rows: [
            {
              label: "User",
              value: "d.mensah@meridian.example (mailbox owner)",
            },
            {
              label: "Source IP",
              value: "198.51.100.32 (Manchester, GB)",
              wide: true,
            },
            {
              label: "Device",
              value: "Enrolled, Intune-compliant, the owner's daily device",
              wide: true,
            },
            {
              label: "Authentication",
              value: "Interactive MFA challenge satisfied (no token replay)",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Email Collection: Email Forwarding Rule (T1114.003)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Destination",
              value:
                "ap-intake@brightpath-bpo.example is on Meridian's approved forwarding-partner allowlist (managed billing partner BrightPath BPO)",
              wide: true,
            },
            {
              label: "Change ticket",
              value:
                "CHG-4712 sanctioned routing accounts-payable mail to the managed billing partner",
              wide: true,
            },
            {
              label: "Mailbox purpose",
              value:
                "ap-billing is a shared intake mailbox for supplier invoices, delegated to the finance-ops team; routing all of its mail to the partner is the point of the delegation",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "EXO-AUD-051" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "Entra / Exchange audit" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            { label: "Event time", value: "2026-07-16 10:12:47 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 6003,
  "class_name": "API Activity",
  "category_uid": 6,
  "category_name": "Application Activity",
  "activity_id": 1,
  "activity_name": "Create",
  "type_uid": 600301,
  "severity": "High",
  "time": "2026-07-16T10:12:47Z",
  "actor": { "user": { "name": "d.mensah@meridian.example", "type": "User" } },
  "api": {
    "operation": "New-InboxRule",
    "service": { "name": "Exchange Online" }
  },
  "src_endpoint": { "ip": "198.51.100.32", "location": { "city": "Manchester", "country": "GB" } },
  "resources": [
    { "type": "Mailbox", "name": "ap-billing@meridian.example" }
  ],
  "unmapped": {
    "rule_name": "Forward AP mail to BrightPath (CHG-4712)",
    "forward_to": "ap-intake@brightpath-bpo.example",
    "conditions": "all incoming mail (no keyword filter)",
    "keep_copy_in_mailbox": true,
    "delete_message": false,
    "mark_as_read": false,
    "stop_processing_rules": false,
    "client": "Outlook on the web",
    "auth": "interactive MFA satisfied",
    "device_compliant": true,
    "partner_allowlisted": true,
    "change_ref": "CHG-4712"
  }
}`,
      unmapped: [
        {
          label: "forward_to",
          value: "ap-intake@brightpath-bpo.example",
          wide: true,
        },
        { label: "conditions", value: "all incoming mail (no keyword filter)" },
        { label: "keep_copy_in_mailbox", value: "true" },
        { label: "stop_processing_rules", value: "false" },
        {
          label: "partner_allowlisted",
          value: "true (approved forwarding partner)",
          wide: true,
        },
        { label: "change_ref", value: "CHG-4712" },
      ],
    },
  },
  aspects: [
    {
      id: "external-destination",
      label: "The rule forwards to an address outside Meridian's own domains",
      signal: true,
      reasoning: {
        prompt:
          "Why flag an external forwarding destination even before you know who set it up?",
        options: [
          "Because forwarding to any address outside the company is always a compromise",
          "Because external auto-forwarding is a real data-exfiltration channel, so it must be tied to an authorized request before the alert can be closed",
          "Because Exchange blocks external forwarding by default, so its presence proves a policy bypass",
        ],
        correct: 1,
      },
      note: "You were right to flag it. An external forward is the exfiltration channel in a business email compromise, so it must be attributed before you close. Flagging it means it gets confirmed against an authorization, not that forwarding is malicious on its own. Here it attributes cleanly to an approved partner under a change ticket.",
    },
    {
      id: "forward-all-no-filter",
      label: "The rule forwards every incoming message, with no keyword filter",
      signal: true,
      reasoning: {
        prompt: "Why does a forward-everything rule deserve a look?",
        options: [
          "Because forwarding all mail unconditionally is the shape attackers use to capture everything, so it needs a legitimate reason",
          "Because a rule without a keyword filter is invalid and cannot be saved",
          "Because only filtered rules can be benign; an unfiltered rule is malicious by definition",
        ],
        correct: 0,
      },
      note: "Correct to check. Forward-everything is the classic exfil shape and is worth confirming. Here the mailbox is a shared supplier-invoice intake box whose whole purpose is to route all of its mail to the billing partner, so forwarding all of it is expected rather than alarming.",
    },
    {
      id: "auto-forward-persistence",
      label:
        "A new auto-forwarding rule is a persistence and collection mechanism",
      signal: true,
      reasoning: {
        prompt:
          "Why treat a new auto-forward rule as a persistence mechanism worth reviewing?",
        options: [
          "Because it keeps feeding an outsider mail even after the password is reset, so it outlives credential remediation",
          "Because inbox rules run with domain-administrator privileges",
          "Because auto-forward rules disable the mailbox owner's MFA",
        ],
        correct: 0,
      },
      note: "Right to raise it. An auto-forward rule survives a credential reset and needs no further access, which is exactly why attackers plant them. That is why a new external-forward rule is reviewed on principle: if you cannot tie it to an approved request, you treat it as compromise.",
    },
    {
      id: "trusted-egress",
      label:
        "The rule was created from an address in Meridian's office egress range",
      signal: false,
      note: "198.51.100.0/24 is Meridian's trusted egress in the baseline. An action originating there is the expected case, not a suspicious one. This fact lowers suspicion; it is part of what attributes the rule to a legitimate user.",
    },
    {
      id: "interactive-mfa",
      label:
        "The session that created the rule passed an interactive MFA prompt",
      signal: false,
      note: "An interactive MFA challenge, actually answered, is exculpatory. Contrast it with the covert twin, where MFA was satisfied by a replayed token with no interactive prompt. A satisfied factor that the owner personally approved argues for a legitimate session, not against one.",
    },
    {
      id: "owner-known-device",
      label:
        "The rule was created by the mailbox owner from her enrolled, compliant device",
      signal: false,
      note: "The owner acting from her own managed, compliant device is the normal channel for managing a mailbox she controls. It is a reason this is benign, not a reason to escalate.",
    },
    {
      id: "high-severity",
      label: "The alert is rated High severity",
      signal: false,
      note: "High is the catalog's context-free rating for external-forwarding rules, applied before anyone looked at this instance. The detector's severity is an input, not a verdict; deferring to it is the habit these exercises are built to break.",
    },
    {
      id: "owa-channel",
      label: "The rule was created through Outlook on the web",
      signal: false,
      note: "Outlook on the web is an ordinary way to manage inbox rules. The client is not the signal; who created the rule, from where, and to what destination are.",
    },
  ],
  extract: [
    {
      id: "forward-address",
      label: "External address the rule forwards to",
      hint: "the destination in the rule's forward action",
      accept: ["ap-intake@brightpath-bpo.example"],
      normalize: "text",
    },
    {
      id: "mailbox",
      label: "Mailbox the rule was created on",
      hint: "the shared mailbox in the audit event",
      accept: ["ap-billing@meridian.example", "ap-billing"],
      normalize: "text",
    },
    {
      id: "source-ip",
      label: "Source IP the rule was created from",
      hint: "the address in src_endpoint",
      accept: ["198.51.100.32"],
      normalize: "ip",
    },
    {
      id: "change-ticket",
      label: "Change ticket that authorizes the forwarding",
      hint: "the CHG-... reference in the context and rule name",
      accept: ["CHG-4712"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "External auto-forwarding is a real exfiltration channel, and every signal here was correct to raise: the rule forwards all incoming mail, unfiltered, to an address outside Meridian's domains, and a new auto-forward rule is a persistence mechanism that survives a password reset. What makes this benign is that all of it attributes cleanly to an authorized change. The mailbox owner created the rule interactively from Meridian's trusted office egress (198.51.100.0/24) on her enrolled, compliant device, passing an interactive MFA challenge rather than a replayed token. The destination, ap-intake@brightpath-bpo.example, is on Meridian's approved forwarding-partner allowlist, and the rule references CHG-4712, the change that sanctioned routing accounts-payable mail to the managed billing partner BrightPath. The rule is named for its purpose, keeps a copy in the mailbox, and takes none of the mark-read, move, or stop-processing actions used to hide forwarded mail. Close it and record the ticket. Escalate is the tempting wrong call: this is the exact shape of the covert rule in 'A quiet forwarding rule', where an attacker who replayed a token from an unfamiliar address planted a hidden forward to a lookalike domain. The shape is identical; the attribution is opposite. It is not a route either: a route is for a genuine finding another team must remediate on its own cadence, and there is nothing here to fix. One caveat that matters: this close is earned only because the destination matched the allowlist and the change ticket checked out. If the partner address were not on the list, or no ticket existed, you could not rule out an authorized-looking exfil rule, and the right move would be to escalate. The lesson: the mechanics of a forwarding rule cannot tell you whether it is malicious; who created it, from where, and against which authorization can.",
  },
};

export default investigation;
