import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "New IAM User Created" catalog event (AWS-IAM-005): Medium,
 * detected via CloudTrail, mapped to Create Account (T1136). This one is a true
 * negative: everything that is worth flagging traces to an approved, automated
 * onboarding. It teaches that flagging an aspect is not the same as escalating.
 * All instance data is fictional (ADR-0005): org "Meridian", RFC 5737 addresses.
 */
const investigation: Investigation = {
  id: "aws-iam-new-user",
  title: "A new IAM user appears",
  short:
    "A fresh IAM user was provisioned overnight in the production account. Onboarding, or a quiet foothold?",
  sourcePlatform: "aws",
  difficulty: "guided",
  severity: "medium",
  eventType: "New IAM User Created",
  mitre: "Create Account (T1136)",
  detectionSource: "CloudTrail",
  evidence: {
    signal: {
      title: "New IAM user created by an automation role",
      source: "CloudTrail",
      time: "2026-05-02 03:41:55 UTC",
      description:
        "AWS CloudTrail recorded a CreateUser call in the Meridian production account (id 400123456789). A new IAM user was created by an assumed role, then given a scoped policy and one programmatic access key.",
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
            { label: "Event", value: "CreateUser" },
            { label: "New user", value: "svc-reporting" },
            {
              label: "Created by",
              value: "assumed-role/terraform-ci/pipeline-run-8842",
              wide: true,
            },
            { label: "Source IP", value: "198.51.100.20 (Meridian CI egress)" },
            { label: "Access key issued", value: "Yes (programmatic)" },
            { label: "Console access", value: "None" },
            {
              label: "Permissions boundary",
              value:
                "arn:aws:iam::400123456789:policy/boundary-service-accounts",
              wide: true,
            },
            {
              label: "Attached policy",
              value: "read-only, s3://meridian-analytics/reporting/*",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Create Account (T1136)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Change ticket",
              value:
                "CHG-4471 (approved): onboard a quarterly reporting service",
              wide: true,
            },
            {
              label: "Provisioning path",
              value:
                "Service accounts are created by the Terraform pipeline assuming terraform-ci from CI egress 198.51.100.0/24, always with the service-account permissions boundary",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-IAM-005" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "CloudTrail" },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "IAM users in account", value: "200+" },
            { label: "Event time", value: "2026-05-02 03:41:55 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "Medium",
  "actor": { "user": { "type": "AssumedRole", "name": "terraform-ci" } },
  "src_endpoint": { "ip": "198.51.100.20" },
  "finding_info": {
    "title": "New IAM user created",
    "attacks": [{ "technique": { "uid": "T1136", "name": "Create Account" } }]
  },
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "raw_event": {
      "eventName": "CreateUser",
      "userIdentity": {
        "type": "AssumedRole",
        "arn": "arn:aws:sts::400123456789:assumed-role/terraform-ci/pipeline-run-8842"
      },
      "requestParameters": {
        "userName": "svc-reporting",
        "permissionsBoundary": "arn:aws:iam::400123456789:policy/boundary-service-accounts"
      }
    },
    "follow_up_event": {
      "eventName": "AttachUserPolicy",
      "requestParameters": {
        "userName": "svc-reporting",
        "policyArn": "arn:aws:iam::400123456789:policy/reporting-read-only"
      }
    }
  }
}`,
    },
  },
  aspects: [
    {
      id: "new-user-created",
      label: "A new IAM user was created in the production account",
      signal: true,
      reasoning: {
        prompt: "Why flag any new IAM user, even a routine one?",
        options: [
          "New users always mean a breach and should be deleted on sight",
          "A new principal is a new way into the account, so every one must be tied back to an approved request before it is trusted",
          "IAM users cannot be created without root, so this proves root was used",
        ],
        correct: 1,
      },
      note: "You were right to flag it. A new identity is new attack surface. Flagging means verify, not automatically escalate; here it traces cleanly to CHG-4471.",
    },
    {
      id: "access-key-issued",
      label: "The new user was issued a long-lived programmatic access key",
      signal: true,
      reasoning: {
        prompt: "Why is a fresh access key worth checking?",
        options: [
          "Access keys are encrypted, so they carry no risk and never need review",
          "Long-lived keys are a persistence and exfiltration risk if they are unmanaged, so confirm the key is expected and tightly scoped",
          "A user can only ever hold one key, so a new key means an old one was stolen",
        ],
        correct: 1,
      },
      note: "Correct to check. The key is expected for a programmatic service account and is bounded by both a least-privilege policy and a permissions boundary, so the risk is contained.",
    },
    {
      id: "created-by-automation",
      label: "The user was created by the Terraform CI automation role",
      signal: false,
      note: "This is the opposite of a red flag. Provisioning through the sanctioned IaC pipeline from the CI egress range is exactly how Meridian expects service accounts to appear.",
    },
    {
      id: "region-us-east-1",
      label: "The event was recorded in region us-east-1",
      signal: false,
      note: "IAM is global and its events land in us-east-1. The region tells you nothing about intent.",
    },
    {
      id: "username-prefix",
      label: "The username carries the svc- prefix",
      signal: false,
      note: "A naming convention is not evidence. The svc- prefix is Meridian's standard marker for service accounts.",
    },
    {
      id: "many-existing-users",
      label: "The account already contains over two hundred IAM users",
      signal: false,
      note: "The total user count is background scale, unrelated to whether this specific creation is authorized.",
    },
  ],
  extract: [
    {
      id: "username",
      label: "Name of the new IAM user",
      hint: "the userName in CreateUser",
      accept: ["svc-reporting"],
      normalize: "text",
    },
    {
      id: "actor",
      label: "Role that created the user",
      hint: "the assumed automation role",
      accept: ["terraform-ci", "assumed-role/terraform-ci"],
      normalize: "text",
    },
    {
      id: "ticket",
      label: "Change ticket this maps to",
      hint: "referenced in the context",
      accept: ["CHG-4471"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "Flagging the new user and its access key was the right instinct, but both resolve cleanly on verification. The user was created by the sanctioned Terraform pipeline from Meridian's CI egress range, under change ticket CHG-4471, with a least-privilege policy and a permissions boundary, and no console access. There is no anomaly to act on. Close it and note the ticket. The lesson: flagging an aspect for review is not the same as escalating; the evidence decides the call.",
  },
};

export default investigation;
