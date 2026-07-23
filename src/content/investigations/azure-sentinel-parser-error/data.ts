import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Brute Force Sign-in Attempts" catalog event, a Microsoft
 * Sentinel scheduled analytics rule (modelled on the shipped "Brute force attack
 * against user credentials" rule): Medium severity, mapped to Brute Force (T1110)
 * under Credential Access, raised over ASIM-normalized authentication records
 * (OCSF Authentication, class 3002) and delivered as a Detection Finding
 * (class 2004). The rule fires when failed sign-ins for one account cross a
 * threshold alongside a success in the same window.
 *
 * This case teaches the first triage question: does the alert reflect a real
 * event? The reported spike is an ingestion artifact. A revised parser
 * duplicated a single sign-in record, so the "214 failures" are 214 copies of
 * one event. Validated against the raw records, there is nothing to hand off, so
 * the correct call is to close it as a false positive and file the parser bug.
 *
 * All instance data is fictional (ADR-0005): org "Meridian", tenant
 * meridian.onmicrosoft.com, RFC 5737 addresses, placeholder ids and correlation
 * uid. Consistent with the Meridian baseline (office egress 198.51.100.0/24,
 * CHG-#### change tickets).
 */
const investigation: Investigation = {
  id: "azure-sentinel-parser-error",
  title: "A brute-force spike on one account",
  short:
    "A Sentinel rule reports 200-plus failed sign-ins on one account inside twenty minutes. Real attack, or noise?",
  sourcePlatform: "azure",
  difficulty: "challenge",
  severity: "medium",
  eventType: "Brute Force Sign-in Attempts",
  mitre: "Brute Force (T1110)",
  detectionSource: "Microsoft Sentinel analytics rule",
  evidence: {
    signal: {
      title: "Brute-force sign-in pattern on a single account",
      source: "Microsoft Sentinel analytics rule",
      time: "2026-07-21 14:52:00 UTC",
      description:
        "A Microsoft Sentinel scheduled analytics rule reported brute-force activity against t.varga@meridian.example: 214 failed sign-ins and one success within a 20-minute window, over the rule's failure threshold. The rule counts normalized authentication records; it does not verify that each counted record is a distinct sign-in attempt.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Rule match",
          rows: [
            {
              label: "Rule",
              value: "Brute force attack against user credentials",
              wide: true,
            },
            { label: "Reported failures", value: "214 in a 20-minute window" },
            { label: "Reported success", value: "1" },
            {
              label: "Threshold",
              value: "10 failures plus 1 success in the window",
              wide: true,
            },
            { label: "Target user", value: "t.varga@meridian.example" },
            { label: "Application", value: "Microsoft 365" },
          ],
        },
        {
          heading: "Raw records behind the count",
          rows: [
            {
              label: "Distinct correlation ids",
              value: "1 across all 214 failure rows",
              wide: true,
            },
            {
              label: "Distinct timestamps",
              value: "1 (every row at 2026-07-21 14:32:09.427 UTC)",
              wide: true,
            },
            { label: "Distinct source IPs", value: "1 (198.51.100.24)" },
            {
              label: "Failure result code",
              value: "50126 on every row (invalid username or password)",
              wide: true,
            },
            {
              label: "User agent and device",
              value: "Identical on every one of the 214 rows",
              wide: true,
            },
            {
              label: "Genuine success",
              value: "1 at 14:32:41 UTC, ResultType 0, from the same device",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Brute Force (T1110)"],
          rows: [{ label: "Tactic", value: "Credential Access" }],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Source network",
              value:
                "198.51.100.24 sits inside Meridian office egress 198.51.100.0/24 (trusted)",
              wide: true,
            },
            {
              label: "Ingestion change",
              value:
                "CHG-5288 deployed a revised ASIM authentication parser at 14:30 UTC; duplicate normalized records begin at that time",
              wide: true,
            },
            {
              label: "Scope",
              value:
                "No other account shows the pattern; only analytics-rule counts inflated after the change",
              wide: true,
            },
            {
              label: "Target user",
              value:
                "t.varga is an active employee; the account carries no other risk detections",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "SENT-AR-2291" },
            { label: "Category", value: "Identity" },
            {
              label: "Detection source",
              value: "Microsoft Sentinel analytics rule",
            },
            { label: "Workspace", value: "meridian-sentinel (Log Analytics)" },
            { label: "Tenant", value: "meridian.onmicrosoft.com" },
            { label: "Event time", value: "2026-07-21 14:52:00 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "activity_id": 1,
  "severity": "Medium",
  "time": "2026-07-21T14:52:00Z",
  "finding_info": {
    "uid": "SENT-AR-2291",
    "title": "Brute force attack against user credentials",
    "analytic": { "name": "Brute force attack against user credentials", "type": "Scheduled", "product": "Microsoft Sentinel" },
    "attacks": [
      { "tactic": { "name": "Credential Access" }, "technique": { "uid": "T1110", "name": "Brute Force" } }
    ]
  },
  "count": 214,
  "evidences": [
    {
      "class_uid": 3002,
      "class_name": "Authentication",
      "activity_id": 1,
      "status_id": 2,
      "status": "Failure",
      "time": "2026-07-21T14:32:09.427Z",
      "user": { "name": "t.varga@meridian.example" },
      "src_endpoint": { "ip": "198.51.100.24" },
      "metadata": { "correlation_uid": "9f1c7d20-4b8e-4e8a-b3c1-2a5c7e0d9abc" },
      "status_detail": "50126",
      "app_name": "Microsoft 365"
    },
    {
      "class_uid": 3002,
      "class_name": "Authentication",
      "activity_id": 1,
      "status_id": 2,
      "status": "Failure",
      "time": "2026-07-21T14:32:09.427Z",
      "user": { "name": "t.varga@meridian.example" },
      "src_endpoint": { "ip": "198.51.100.24" },
      "metadata": { "correlation_uid": "9f1c7d20-4b8e-4e8a-b3c1-2a5c7e0d9abc" },
      "status_detail": "50126",
      "app_name": "Microsoft 365"
    }
  ],
  "unmapped": {
    "query_summary": "imAuthentication | summarize FailureCount=countif(EventResult=='Failure'), SuccessCount=countif(EventResult=='Success') by TargetUserId",
    "FailureCount": 214,
    "SuccessCount": 1,
    "distinct_CorrelationId": 1,
    "distinct_SrcIp": 1,
    "distinct_TimeGenerated_ms": 1,
    "distinct_ResultType_failure": 1,
    "failure_ResultType": "50126 (invalid username or password)",
    "success_ResultType": "0 (success at 2026-07-21T14:32:41Z)",
    "sample_evidence": "2 of 214 identical records shown",
    "ingestion_change": "CHG-5288 deployed revised ASIM imAuthentication parser at 2026-07-21T14:30:00Z"
  }
}`,
      unmapped: [
        { label: "FailureCount", value: "214 (as reported by the rule)" },
        {
          label: "distinct_CorrelationId",
          value: "1 (all 214 failure rows share one id)",
          wide: true,
        },
        {
          label: "distinct_TimeGenerated_ms",
          value: "1 (every row stamped 14:32:09.427)",
          wide: true,
        },
        { label: "distinct_SrcIp", value: "1 (198.51.100.24)" },
        {
          label: "ingestion_change",
          value: "CHG-5288 deployed a revised ASIM parser at 14:30 UTC",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "shared-correlation-id",
      label: "All 214 failure records carry a single, identical CorrelationId",
      signal: true,
      reasoning: {
        prompt:
          "Why does one shared CorrelationId across all 214 failure records matter?",
        options: [
          "A shared CorrelationId proves the attempts were scripted from one attack tool",
          "Entra assigns a fresh CorrelationId to each sign-in interaction, so 214 rows under one id are copies of a single event, not 214 attempts",
          "CorrelationId is assigned per account, so one value for one user is expected",
        ],
        correct: 1,
      },
      note: "You were right to flag it. Each distinct sign-in interaction gets its own CorrelationId. Two hundred independent attempts would carry two hundred different ids; one id across every row means the pipeline duplicated a single event.",
    },
    {
      id: "identical-timestamps",
      label:
        "Every failure record shares the same timestamp down to the millisecond",
      signal: true,
      reasoning: {
        prompt:
          "What does it tell you that all 214 failures are stamped at the same millisecond?",
        options: [
          "That the attacker used a high-speed credential-stuffing tool",
          "That Sentinel batches events and stamps them with one shared ingestion time, so this is expected",
          "That the records cannot be independent attempts: separate sign-ins arrive at different instants, so identical millisecond timestamps are the fingerprint of a duplicated record",
        ],
        correct: 2,
      },
      note: "Correct to flag. Even the fastest attack tool spreads attempts across time. Two hundred events at one instant is not fast typing, it is one event written many times.",
    },
    {
      id: "parser-coincidence",
      label:
        "The inflated count begins exactly when a new ingestion parser was deployed",
      signal: true,
      reasoning: {
        prompt: "Why does the timing against the parser deployment matter?",
        options: [
          "It does not; a parser change cannot affect an analytics rule's results",
          "It shows the attacker timed the intrusion to coincide with a maintenance window",
          "The inflation starts precisely when CHG-5288 shipped a revised parser and appears for no other account, which points at a pipeline mapping bug rather than adversary activity",
        ],
        correct: 2,
      },
      note: "Right to flag. When an anomaly starts at the exact moment of a pipeline change and is isolated to what that change touched, the change is the first suspect. Confirm against the raw records before blaming an adversary.",
    },
    {
      id: "high-failure-count",
      label:
        "The rule reports 214 failed sign-ins, more than twenty times its threshold",
      signal: false,
      note: "A large number is only alarming if the records behind it are real. This count is one event multiplied by a duplication bug, so its size measures the bug, not an attack.",
    },
    {
      id: "brute-force-is-real",
      label:
        "Brute force against cloud identities is a common, real credential-access technique",
      signal: false,
      note: "The technique is real, but that says nothing about this instance. The question is whether the data in front of you reflects real attempts, and here it does not.",
    },
    {
      id: "target-account-exists",
      label: "The targeted account is a real, active Meridian user",
      signal: false,
      note: "Every sign-in alert names a real account. A valid target is expected and neither confirms nor denies an attack.",
    },
    {
      id: "success-after-failures",
      label:
        "A successful sign-in accompanied the failures, which is the rule's trigger condition",
      signal: false,
      note: "Success-after-failures is what the rule keys on, but deduplicated this is one legitimate login after a single mistyped password, from the user's own device.",
    },
    {
      id: "trusted-egress-origin",
      label:
        "All of the sign-ins originate from Meridian's office egress range",
      signal: false,
      note: "Origin from 198.51.100.0/24 is exculpatory, not suspicious. It is one of the facts that makes a real external brute force less likely, not more.",
    },
    {
      id: "rule-fired-medium",
      label:
        "The Sentinel analytics rule fired at Medium severity and mapped the activity to T1110",
      signal: false,
      note: "The rule firing is why the alert reached you, not evidence that it is correct. An analytics rule is only as accurate as the records it runs over.",
    },
  ],
  extract: [
    {
      id: "user",
      label: "Account the rule flagged",
      hint: "the UPN in the authentication records",
      accept: ["t.varga@meridian.example", "t.varga"],
      normalize: "text",
    },
    {
      id: "correlation-id",
      label: "CorrelationId shared by the duplicated records",
      hint: "the correlation_uid on every failure row",
      accept: ["9f1c7d20-4b8e-4e8a-b3c1-2a5c7e0d9abc"],
      normalize: "text",
    },
    {
      id: "source-ip",
      label: "Source IP of the sign-ins",
      hint: "the single src_endpoint address on every row",
      accept: ["198.51.100.24"],
      normalize: "ip",
    },
  ],
  verdict: {
    correct: "close",
    why: "The alert's premise is 214 failed sign-ins, but the records behind that count are 214 copies of one event: every failure row shares a single CorrelationId, an identical timestamp to the millisecond, and the same source IP, device, and failure code. A set of independent password attempts cannot look like that. The inflation begins exactly when CHG-5288 deployed a revised ASIM authentication parser, which duplicated each normalized sign-in record, and no other account is affected. Deduplicated, the log holds one failed sign-in followed by one success from t.varga's usual device and Meridian's office egress (198.51.100.0/24): the ordinary pattern of a user who mistyped a password once. There is no brute force here, so close it as a false positive and file the parser bug with detection engineering. The tempting call is Escalate: the count is alarming, brute force is a real technique, and the rule fired at Medium. But a count is only as trustworthy as the records it is computed from, and these fail the first triage question: does the alert reflect a real event? Validate the raw data before you believe the aggregate. This is also not a Route: there is no genuine security finding to refer to an owning team, only a data-quality bug to fix, which is why the SOC call is Close. The lesson: an aggregate is a claim about the underlying records, so confirm the records are real and distinct before you act on the number.",
  },
};

export default investigation;
