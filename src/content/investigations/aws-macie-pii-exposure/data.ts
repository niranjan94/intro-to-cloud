import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "SensitiveData:S3Object/Personal" catalog event (Amazon Macie,
 * OCSF Data Security Finding, class 2006). Macie's automated sensitive data
 * discovery matched personally identifiable information (PII) in an S3 object.
 * Severity is Medium: Macie scores sensitive data findings from the type and
 * occurrence count of the data it detected (Full name, Phone number, and Mailing
 * address at moderate counts each score Medium), not from any exposure or
 * misuse. There is no honest ATT&CK mapping for a data-classification finding,
 * so `mitre` is deliberately absent. The finding is a real data-governance
 * problem with no attacker and no incident, so the correct call is to route it
 * to the owning team rather than escalate or close. All instance data is
 * fictional (ADR-0005): org "Meridian", account 400123456789, bucket
 * meridian-app-logs, illustrative finding id.
 */
const investigation: Investigation = {
  id: "aws-macie-pii-exposure",
  title: "PII found in an application log bucket",
  short:
    "Macie found personal data in a private application log bucket. A real problem, or nothing to do?",
  sourcePlatform: "aws",
  difficulty: "standard",
  severity: "medium",
  eventType: "SensitiveData:S3Object/Personal",
  detectionSource: "Macie",
  evidence: {
    signal: {
      title: "Personal information detected in an S3 object",
      source: "Macie",
      time: "2026-07-21 06:12:44 UTC",
      description:
        "Amazon Macie's automated sensitive data discovery matched personally identifiable information in an application log object. Macie reports the data types it found and their occurrence counts, and scores severity from those alone. It does not evaluate who can reach the object or whether the data has been accessed.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Sensitive data",
          rows: [
            {
              label: "Finding type",
              value: "SensitiveData:S3Object/Personal",
              wide: true,
            },
            { label: "Category", value: "Personal information (PII)" },
            {
              label: "Data types found",
              value: "Full name, Phone number, Mailing address",
              wide: true,
            },
            { label: "Occurrences", value: "107 across the object" },
            { label: "Macie severity", value: "Medium (score 2 of 3)" },
          ],
        },
        {
          heading: "Affected resource",
          rows: [
            {
              label: "Bucket",
              value: "s3://meridian-app-logs",
              wide: true,
            },
            {
              label: "Object",
              value: "app-logs/api-service/2026/07/21/app-06.log.gz",
              wide: true,
            },
            { label: "Bucket purpose", value: "Application and access logs" },
            { label: "Data classification tag", value: "None set" },
            {
              label: "Block Public Access",
              value: "Enabled (all four settings on)",
              wide: true,
            },
            { label: "Encryption at rest", value: "SSE-KMS" },
            {
              label: "Bucket policy",
              value: "No anonymous or external grants",
              wide: true,
            },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Recent readers",
              value:
                "app-ingest-task role (writes) and the Macie scan role only; no external principal",
              wide: true,
            },
            {
              label: "Access anomalies",
              value: "None in CloudTrail for this object",
              wide: true,
            },
            { label: "Object lifecycle", value: "Logs retained 395 days" },
            {
              label: "Sanctioned PII stores",
              value:
                "The customer database and s3://meridian-customer-exports; log buckets are not among them",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-MACIE-3391" },
            { label: "Category", value: "Sensitive data discovery" },
            { label: "Detection source", value: "Macie" },
            {
              label: "Discovery type",
              value: "Automated sensitive data discovery",
            },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "Event time", value: "2026-07-21 06:12:44 UTC" },
            {
              label: "Open sensitive-data findings",
              value: "148 across the account this quarter",
            },
          ],
        },
      ],
      raw: `{
  "class_uid": 2006,
  "class_name": "Data Security Finding",
  "category_uid": 2,
  "category_name": "Findings",
  "activity_id": 1,
  "type_uid": 200601,
  "severity_id": 3,
  "severity": "Medium",
  "time": "2026-07-21T06:12:44Z",
  "metadata": {
    "product": { "name": "Amazon Macie", "vendor_name": "AWS" },
    "profiles": ["cloud", "data_classification"]
  },
  "finding_info": {
    "uid": "3391a0c7b4e2f8d15c9e0a2b6f4d8e10",
    "title": "The S3 object contains personal information",
    "types": ["SensitiveData:S3Object/Personal"]
  },
  "data_security": {
    "category": "Personal Information",
    "classification": "PII",
    "confidentiality": "Private",
    "data_lifecycle_state": "Data-at-Rest",
    "detection_system": "Data Classification"
  },
  "resources": [
    {
      "type": "AWS::S3::Object",
      "name": "s3://meridian-app-logs/app-logs/api-service/2026/07/21/app-06.log.gz",
      "data": { "bucket": "meridian-app-logs", "public_access": "BLOCKED" }
    }
  ],
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "finding_type": "SensitiveData:S3Object/Personal",
    "origin_type": "AUTOMATED_SENSITIVE_DATA_DISCOVERY",
    "severity": { "description": "Medium", "score": 2 },
    "classification_details": {
      "result": {
        "mime_type": "text/plain",
        "sensitive_data": [
          {
            "category": "PERSONAL_INFORMATION",
            "total_count": 107,
            "detections": [
              { "type": "NAME", "count": 47 },
              { "type": "PHONE_NUMBER", "count": 38 },
              { "type": "ADDRESS", "count": 22 }
            ]
          }
        ]
      }
    },
    "bucket_public_access": { "effective_permission": "NOT_PUBLIC" },
    "server_side_encryption": { "encryption_type": "aws:kms" }
  }
}`,
      unmapped: [
        {
          label: "finding_type",
          value: "SensitiveData:S3Object/Personal",
          wide: true,
        },
        { label: "origin_type", value: "AUTOMATED_SENSITIVE_DATA_DISCOVERY" },
        {
          label: "sensitive_data",
          value:
            "PERSONAL_INFORMATION: NAME x47, PHONE_NUMBER x38, ADDRESS x22",
          wide: true,
        },
        { label: "severity.score", value: "2 of 3 (Medium)" },
        {
          label: "bucket_public_access",
          value: "NOT_PUBLIC",
        },
      ],
    },
  },
  aspects: [
    {
      id: "pii-in-logs",
      label:
        "Customer PII is sitting in an application log bucket that is not a sanctioned store for personal data",
      signal: true,
      reasoning: {
        prompt:
          "Why does PII in a log bucket matter when there is no sign anyone misused it?",
        options: [
          "Because any personal data found outside a database is automatically a reportable breach",
          "Because personal data has landed in a store never designed or governed for it, which is a real data-protection problem the owning team must fix regardless of whether anyone accessed it",
          "Because Macie only scans buckets that have already been compromised",
        ],
        correct: 1,
      },
      note: "You were right to flag it. PII in an unsanctioned store is a genuine governance gap: the data is outside the controls, retention, and access model built for personal data, and that has to be fixed even with no intrusion.",
    },
    {
      id: "ongoing-source",
      label:
        "The finding comes from automated discovery of live application logs, so the app keeps writing new PII into the bucket",
      signal: true,
      reasoning: {
        prompt: "Why does the source being an ongoing log stream matter?",
        options: [
          "Because a continuous write pattern proves the logging pipeline has been hijacked",
          "Because the leak will keep recurring until the application stops logging personal data, so it needs an owner to fix the logging, not a one-time object cleanup",
          "Because automated-discovery findings are always more severe than discovery-job findings",
        ],
        correct: 1,
      },
      note: "Correct. Deleting this one object does not solve anything if the service keeps writing names and phone numbers into every new log file. The fix belongs to the team that owns the application's logging.",
    },
    {
      id: "no-classification-owner",
      label:
        "The bucket carries no data-classification tag and no mapped data owner",
      signal: true,
      reasoning: {
        prompt: "Why does the missing classification and ownership matter?",
        options: [
          "Because an untagged bucket cannot be encrypted or made private",
          "Because if the store is not recorded as holding personal data, it falls outside the data map that drives access reviews, retention, and subject-access handling, so the exposure goes unmanaged",
          "Because Macie refuses to scan buckets that have no classification tag",
        ],
        correct: 1,
      },
      note: "Right to flag. A store that holds PII but is not registered as one is invisible to the very processes meant to protect that data. Establishing the owner and classification is part of the remediation.",
    },
    {
      id: "bucket-private",
      label:
        "The bucket has Block Public Access fully enabled and no external grants",
      signal: false,
      note: "This lowers risk and is exactly why the finding is not an incident. But a private bucket holding PII that does not belong there is still a real problem to fix. A fact that reduces exposure is not a suspicious aspect.",
    },
    {
      id: "no-unusual-access",
      label:
        "CloudTrail shows the object was touched only by the app writer role and the Macie scan role",
      signal: false,
      note: "No sign of misuse rules out an active incident, which is why this is not escalated. Absence of misuse does not make misplaced personal data acceptable, so it is a reason not to escalate, not a reason to close.",
    },
    {
      id: "encrypted-at-rest",
      label: "The object is encrypted at rest with SSE-KMS",
      signal: false,
      note: "Encryption at rest is a baseline control and does not touch the core issue: the personal data should not be in application logs at all. It neither raises the finding nor resolves it.",
    },
    {
      id: "medium-severity",
      label: "Macie rated the finding only Medium",
      signal: false,
      note: "Macie's severity is a context-free score from the data type and occurrence count. It is shown, not a verdict. A Medium rating is not a reason to close, just as a High one would not be a reason to escalate.",
    },
    {
      id: "many-findings",
      label:
        "Macie has 148 other open sensitive-data findings across the account this quarter",
      signal: false,
      note: "The size of the discovery backlog is background scale. It describes the data-governance workload, not whether this specific object is an incident.",
    },
  ],
  extract: [
    {
      id: "finding-type",
      label: "Macie finding type",
      hint: "the SensitiveData:S3Object/... type string",
      accept: ["SensitiveData:S3Object/Personal"],
      normalize: "text",
    },
    {
      id: "bucket",
      label: "Affected S3 bucket",
      hint: "the bucket the object lives in",
      accept: ["meridian-app-logs", "s3://meridian-app-logs"],
      normalize: "text",
    },
    {
      id: "alert-id",
      label: "Alert identifier",
      hint: "the AWS-MACIE-... id in the details",
      accept: ["AWS-MACIE-3391"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "route",
    why: "Macie found genuine personal data (names, phone numbers, and mailing addresses) in an application log bucket that was never meant to hold it. That is a real data-governance problem, but nothing here is an incident: the bucket is private with Block Public Access on, it is encrypted, there are no external grants, and CloudTrail shows only the app's own writer role and Macie's scan touching the object. There is no attacker, no exposure, and no exfiltration to escalate. The correct call is to route it to the team that owns the application and its logging, together with data governance, so they stop the service from logging PII, remediate the retained data, and register and control the store properly. That closes it for SOC purposes while the fix lands with the people who can make it. A plain Close would be the wrong call: the clean access posture makes it tempting to treat this as a non-event, but the personal data still does not belong there and the logging will keep producing more of it until someone fixes it, and a close means that never reaches the owning team. The lesson: a clean access posture rules out an incident, it does not make misplaced sensitive data a non-issue. Data-classification findings get an owner, not an alarm and not a shrug.",
  },
};

export default investigation;
