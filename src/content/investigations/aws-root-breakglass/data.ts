import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Root Account Login" catalog event (AWS-IAM-001): Critical,
 * detected via CloudTrail, mapped to Valid Accounts (T1078). This is the
 * deliberate inverse of aws-root-login: the identical critical root-login rule,
 * but from an authorized break-glass context. The sign-in comes from Meridian
 * trusted egress, hardware MFA is used, a change ticket authorizes the root-only
 * task, and no access key or IAM change follows. It is a benign true positive, so
 * the correct call is to close it, and it teaches that a critical root-login alert
 * is not self-evidently an incident: who, from where, with what factor, under what
 * authorization, and what the session did afterward decide the call. All instance
 * data is fictional (ADR-0005): the organization is "Meridian", the domain is
 * meridian.example, and every address is from an RFC 5737 documentation range.
 */
const investigation: Investigation = {
  id: "aws-root-breakglass",
  title: "Another root account sign-in",
  short:
    "The same critical root-login rule fires again. This time, read the context before you call it.",
  sourcePlatform: "aws",
  difficulty: "challenge",
  severity: "critical",
  eventType: "Root Account Login",
  mitre: "Valid Accounts (T1078)",
  detectionSource: "CloudTrail",
  evidence: {
    signal: {
      title: "Root account console sign-in",
      source: "CloudTrail",
      time: "2026-07-04 02:41:56 UTC",
      description:
        "AWS CloudTrail recorded a console sign-in using the account root user in the Meridian production account (id 400123456789). Hardware MFA was used. The session viewed billing and payments pages and signed out about eleven minutes later; no CreateAccessKey call or other IAM change followed on the session.",
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
            { label: "Event", value: "ConsoleLogin" },
            { label: "Identity type", value: "Root" },
            { label: "MFA used", value: "Yes (hardware key)" },
            { label: "Channel", value: "AWS Management Console" },
            { label: "Source IP", value: "198.51.100.37" },
            {
              label: "Geolocation",
              value:
                "Consistent with Meridian corporate egress; seen on prior sanctioned root sessions",
              wide: true,
            },
            {
              label: "User agent",
              value:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
              wide: true,
            },
            {
              label: "Session activity",
              value:
                "Billing and Payments console pages only; signed out 02:53:11 UTC",
              wide: true,
            },
            {
              label: "Session follow-up",
              value: "No CreateAccessKey; no IAM changes",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Valid Accounts (T1078)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Root usage policy",
              value:
                "Hardware MFA required; used only from office egress 198.51.100.0/24",
              wide: true,
            },
            {
              label: "Change ticket",
              value:
                "CHG-6002 authorizes a root-only monthly billing and tax review (break-glass procedure)",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-IAM-001" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "CloudTrail" },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "Support plan", value: "Business" },
            { label: "Event time", value: "2026-07-04 02:41:56 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "Critical",
  "actor": { "user": { "type": "Root", "account_uid": "400123456789" } },
  "src_endpoint": { "ip": "198.51.100.37" },
  "finding_info": {
    "title": "Root account console sign-in",
    "attacks": [{ "technique": { "uid": "T1078", "name": "Valid Accounts" } }]
  },
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "raw_event": {
      "eventName": "ConsoleLogin",
      "additionalEventData": { "MFAUsed": "Yes", "MFAIdentifier": "arn:aws:iam::400123456789:mfa/root-hardware-key" },
      "responseElements": { "ConsoleLogin": "Success" },
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36"
    },
    "change_ticket": "CHG-6002",
    "session_summary": {
      "console_activity": "billing/payments",
      "create_access_key": false,
      "iam_changes": 0,
      "signed_out": "2026-07-04T02:53:11Z"
    }
  }
}`,
      unmapped: [
        {
          label: "change_ticket",
          value: "CHG-6002 (root-only monthly billing review)",
          wide: true,
        },
        { label: "MFAUsed", value: "Yes (hardware key)" },
        {
          label: "create_access_key",
          value: "false (no persistence follow-up)",
        },
      ],
    },
  },
  aspects: [
    {
      id: "root-used",
      label: "The root account itself was used to sign in",
      signal: true,
      reasoning: {
        prompt: "Why flag a root sign-in even when it looks authorized?",
        options: [
          "Because any root sign-in is automatically an incident that must be escalated",
          "Because root sits above every IAM guardrail, so the baseline reviews every root sign-in rather than auto-closing it, and only then attributes it",
          "Because root sign-ins are always automated, so a human one is impossible",
        ],
        correct: 1,
      },
      note: "You were right to flag it. Root has no routine day-to-day use at Meridian and every root sign-in is reviewed rather than suppressed. Flagging means you attribute it before clearing, not that it is automatically an incident. Here it attributes cleanly to CHG-6002.",
    },
    {
      id: "root-privileged-action",
      label:
        "The root session performed account-level actions only root can take",
      signal: true,
      reasoning: {
        prompt:
          "Why confirm what the root session actually did, not just that it happened?",
        options: [
          "Because root acts above IAM, so the session's actions must be checked against the authorized scope before the alert is cleared",
          "Because CloudTrail cannot record what the root user does, so you have to guess from the login alone",
          "Because root actions are always reversible, so verifying them is optional",
        ],
        correct: 0,
      },
      note: "Correct to check. Root's privilege is unbounded, so even an authorized root session gets its activity confirmed against the ticket. Here the session touched only billing and payments pages and created no access key, which matches the scope of CHG-6002.",
    },
    {
      id: "critical-severity",
      label: "The alert is rated Critical severity",
      signal: false,
      note: "Critical is the catalog's context-free rating for the root-login rule, applied before any context is known. It is the same severity the takeover twin carries. Severity describes the rule's worst case, never the verdict for this specific event.",
    },
    {
      id: "off-hours",
      label: "The sign-in happened at 02:41 UTC, outside normal working hours",
      signal: false,
      note: "Meridian is a distributed, fully remote workforce with no meaningful office-hours window, so time of day alone is not an anomaly. A root sign-in at 02:41 is judged on who, from where, with what factor, and whether it was ticketed, not on the clock.",
    },
    {
      id: "mfa-yes",
      label: "Hardware MFA was used on the sign-in",
      signal: false,
      note: "Hardware MFA satisfies the enforced root control. It is exculpatory: it argues the legitimate operator signed in, not that something is wrong. In the takeover twin, MFA was absent.",
    },
    {
      id: "office-egress",
      label: "The source IP sits inside Meridian's trusted egress range",
      signal: false,
      note: "198.51.100.37 is in the office egress range where root is expected to be used. An origin that matches policy lowers suspicion; it is not a signal. In the twin the address was an unfamiliar geolocation the account had never used.",
    },
    {
      id: "ticket-match",
      label: "A change ticket (CHG-6002) references the session",
      signal: false,
      note: "A matching CHG ticket is how a sanctioned change announces itself. Flagging the presence of authorization has the logic backwards: the ticket is exactly what turns this scary-looking alert into a benign true positive.",
    },
    {
      id: "no-followon",
      label: "No access key was created and no IAM change followed the sign-in",
      signal: false,
      note: "The absence of a persistence follow-up is exculpatory. In the takeover twin, this is precisely where a CreateAccessKey appeared to keep durable programmatic access. Its absence here is a reason the session reads as benign, not a reason to flag it.",
    },
  ],
  extract: [
    {
      id: "source-ip",
      label: "Source IP of the sign-in",
      hint: "the address in the ConsoleLogin event",
      accept: ["198.51.100.37"],
      normalize: "ip",
    },
    {
      id: "change-ticket",
      label: "Change ticket that authorizes the session",
      hint: "the CHG-... reference in the context and unmapped fields",
      accept: ["CHG-6002"],
      normalize: "text",
    },
    {
      id: "account",
      label: "Account the root sign-in occurred in",
      hint: "the AWS account id",
      accept: ["400123456789"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "This is the same Critical root-login alert as the takeover case, and it was right to reach an analyst: the baseline reviews every root sign-in and never auto-closes one. But the context clears it. The sign-in came from Meridian trusted egress (198.51.100.37), hardware MFA was used as policy requires, and CHG-6002 authorizes this specific root-only billing task. The session did only billing and payments work and signed out; no CreateAccessKey call or IAM change followed, so there is no persistence and nothing to remediate. That is a benign true positive: close it and record the ticket reference and the session attribution. The tempting wrong call is escalate, driven by the Critical severity, the root account, and the 02:41 timing. But severity is the detector's context-free catalog rating, not a verdict; time of day is not a signal for a distributed workforce; and root usage is expected to be reviewed, not assumed hostile. The takeover twin fires the identical rule but from an unfamiliar address, without MFA, with no ticket, and mints a root access key seconds later. Same alert, opposite context, opposite call. Route is also wrong here: there is no real finding to hand to another team, nothing is broken, exposed, or unpatched, so there is nothing to route. The lesson: a critical root-login alert is not self-evidently an incident. Who signed in, from where, with what factor, under what authorization, and what the session did afterward are what decide the call.",
  },
};

export default investigation;
