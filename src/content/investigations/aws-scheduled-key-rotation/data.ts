import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Anomalous IAM Credential Creation" catalog event: an IAM
 * CreateAccessKey call recorded by AWS CloudTrail and flagged by Amazon
 * GuardDuty's anomaly-detection model (finding type
 * Persistence:IAMUser/AnomalousBehavior). Medium severity, detected via
 * CloudTrail / GuardDuty, mapped to Account Manipulation: Additional Cloud
 * Credentials (T1098.001). This is a benign true positive: the detection fired
 * correctly, but the activity is the scheduled service-account key rotation
 * acting in its window, immediately deactivating the previous key, so the
 * correct call is to close it. It is the same CreateAccessKey persistence
 * signal as the root-takeover case with the opposite verdict. All instance data
 * is fictional (ADR-0005): the organization is "Meridian", the domain is
 * meridian.example, the account is 400123456789, and every address is from an
 * RFC 5737 documentation range.
 */
const investigation: Investigation = {
  id: "aws-scheduled-key-rotation",
  title: "A new access key at 03:00",
  short:
    "GuardDuty flags an anomalous CreateAccessKey overnight. A persistence foothold, or routine automation?",
  sourcePlatform: "aws",
  difficulty: "standard",
  severity: "medium",
  eventType: "Anomalous IAM Credential Creation",
  mitre: "Account Manipulation: Additional Cloud Credentials (T1098.001)",
  detectionSource: "CloudTrail / GuardDuty",
  evidence: {
    signal: {
      title: "Anomalous IAM access key creation",
      source: "CloudTrail / GuardDuty",
      time: "2026-07-20 03:07:12 UTC",
      description:
        "Amazon GuardDuty's anomaly-detection model flagged a CreateAccessKey call by an IAM user identity in the Meridian production account (id 400123456789) as unusual for that principal. GuardDuty reports that the API and the identity that invoked it deviate from the learned baseline; it does not determine whether the activity is authorized. A UpdateAccessKey call on the same session followed seven seconds later.",
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
            { label: "Acting identity", value: "svc-key-rotator (IAMUser)" },
            { label: "Event", value: "CreateAccessKey" },
            { label: "Key created for", value: "svc-reporting" },
            {
              label: "New access key",
              value: "AKIAV7QMEXAMPLE7NEWK (Active)",
              wide: true,
            },
            {
              label: "Follow-up call",
              value:
                "UpdateAccessKey set AKIAV7QMEXAMPLE2OLDK to Inactive (+7s)",
              wide: true,
            },
            { label: "Source IP", value: "198.51.100.32" },
            {
              label: "User agent",
              value: "aws-sdk-go/1.55.5 exec-env/AWS_Lambda",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: [
            "Account Manipulation: Additional Cloud Credentials (T1098.001)",
          ],
          rows: [
            {
              label: "GuardDuty finding type",
              value: "Persistence:IAMUser/AnomalousBehavior",
              wide: true,
            },
            {
              label: "Anomaly factor",
              value:
                "CreateAccessKey rarely observed for this identity (acts roughly once per quarter)",
              wide: true,
            },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Acting identity",
              value:
                "svc-key-rotator: programmatic-only rotation account, created by terraform-ci with the standard boundary",
              wide: true,
            },
            {
              label: "Rotation schedule",
              value:
                "Quarterly (90-day) service-account key rotation; previous rotation 2026-04-21",
              wide: true,
            },
            {
              label: "Change ticket",
              value:
                "CHG-6210 (standing quarterly service-account key rotation)",
              wide: true,
            },
            {
              label: "Key owner",
              value:
                "svc-reporting: read-only reporting account, one programmatic key by design",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-IAM-6041" },
            { label: "Category", value: "Identity" },
            { label: "Detection source", value: "CloudTrail / GuardDuty" },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "Event time", value: "2026-07-20 03:07:12 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "severity": "Medium",
  "activity_id": 1,
  "finding_info": {
    "title": "Anomalous IAM access key creation",
    "uid": "GD-2b91c4a7e0",
    "attacks": [
      {
        "tactic": { "name": "Persistence" },
        "technique": { "uid": "T1098.001", "name": "Account Manipulation: Additional Cloud Credentials" }
      }
    ]
  },
  "actor": { "user": { "type": "IAMUser", "name": "svc-key-rotator", "account_uid": "400123456789" } },
  "api": { "operation": "CreateAccessKey", "service": { "name": "iam.amazonaws.com" } },
  "src_endpoint": { "ip": "198.51.100.32" },
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "guardduty_finding_type": "Persistence:IAMUser/AnomalousBehavior",
    "anomaly": {
      "profile": "svc-key-rotator",
      "unusual_behaviors": ["api_call_rarely_seen_for_identity", "identity_active_roughly_every_90_days"]
    },
    "raw_event": {
      "eventName": "CreateAccessKey",
      "eventSource": "iam.amazonaws.com",
      "eventTime": "2026-07-20T03:07:12Z",
      "requestParameters": { "userName": "svc-reporting" },
      "responseElements": {
        "accessKey": {
          "userName": "svc-reporting",
          "accessKeyId": "AKIAV7QMEXAMPLE7NEWK",
          "status": "Active",
          "createDate": "Jul 20, 2026 3:07:12 AM"
        }
      },
      "userAgent": "aws-sdk-go/1.55.5 exec-env/AWS_Lambda"
    },
    "follow_up_event": {
      "eventName": "UpdateAccessKey",
      "eventSource": "iam.amazonaws.com",
      "eventTime": "2026-07-20T03:07:19Z",
      "requestParameters": { "userName": "svc-reporting", "accessKeyId": "AKIAV7QMEXAMPLE2OLDK", "status": "Inactive" },
      "responseElements": null
    }
  }
}`,
      unmapped: [
        {
          label: "guardduty_finding_type",
          value: "Persistence:IAMUser/AnomalousBehavior",
          wide: true,
        },
        {
          label: "anomaly_reason",
          value:
            "CreateAccessKey rarely seen for svc-key-rotator (identity active ~every 90 days)",
          wide: true,
        },
        {
          label: "follow_up_event",
          value:
            "UpdateAccessKey set AKIAV7QMEXAMPLE2OLDK to Inactive, 7 seconds after the create",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "new-access-key",
      label: "A new long-lived IAM access key was created (CreateAccessKey)",
      signal: true,
      reasoning: {
        prompt:
          "Why flag the creation of a new long-lived access key even before you know who created it?",
        options: [
          "Because creating an access key is always the first step of an account takeover",
          "Because a long-lived key is a persistence-capable credential, so its creation is worth verifying against an authorized change before the alert is cleared",
          "Because CreateAccessKey can only be invoked by an already-compromised identity",
        ],
        correct: 1,
      },
      note: "You were right to flag it. Minting a long-lived key is exactly the action an attacker uses for persistence, so it earns a look every time. Flagging it means you verify the authorization behind it, not that you escalate.",
    },
    {
      id: "guardduty-anomaly",
      label:
        "GuardDuty's anomaly model flagged the call as unusual for this identity",
      signal: true,
      reasoning: {
        prompt:
          "What does GuardDuty's anomalous-behavior flag actually tell you here?",
        options: [
          "That the identity is confirmed compromised, because the model only fires on real threats",
          "That the call deviated from the learned baseline for this principal, which is worth explaining but is not by itself proof of compromise",
          "That the API call failed and was automatically retried",
        ],
        correct: 1,
      },
      note: "The anomaly flag means the behavior was statistically rare for this principal, not that it was malicious. An identity that only acts once a quarter will look anomalous every time it runs. The flag is a prompt to explain the deviation, and here the rotation schedule explains it.",
    },
    {
      id: "key-deactivated",
      label:
        "Seconds later, the identity deactivated the previous access key (UpdateAccessKey to Inactive)",
      signal: false,
      note: "This is the tell that resolves the alert, not a second persistence action. An attacker adds a key and leaves the old one active; a rotation creates the new key and immediately retires the old one. A create-then-deactivate pair within seconds is the signature of a legitimate rotation.",
    },
    {
      id: "programmatic-no-human",
      label:
        "The key was created programmatically, with no interactive console session or human in the loop",
      signal: false,
      note: "For this identity that is the expected case, not a red flag. Service accounts here are programmatic-only by design, and key rotation is inherently automated. 'No human did it' is how routine automation looks, not evidence of intrusion.",
    },
    {
      id: "persistence-category",
      label:
        "The finding is categorized under the Persistence tactic (T1098.001)",
      signal: false,
      note: "The ATT&CK label classifies what the API could be used for, not what happened here. CreateAccessKey is tagged Persistence whenever it fires, on a benign rotation as much as on a takeover. The tactic name is a category, not a verdict.",
    },
    {
      id: "trusted-egress",
      label: "The call originated from 198.51.100.0/24",
      signal: false,
      note: "That range is Meridian's trusted CI/CD egress in the baseline, exactly where this automation is expected to run from. An address that matches known-good egress lowers suspicion; it is not something to flag.",
    },
  ],
  extract: [
    {
      id: "new-key",
      label: "New access key created",
      hint: "the AKIA... id in the CreateAccessKey response",
      accept: ["AKIAV7QMEXAMPLE7NEWK"],
      normalize: "text",
    },
    {
      id: "old-key",
      label: "Access key deactivated in the follow-up call",
      hint: "the AKIA... id set to Inactive by UpdateAccessKey",
      accept: ["AKIAV7QMEXAMPLE2OLDK"],
      normalize: "text",
    },
    {
      id: "actor",
      label: "Identity that performed the rotation",
      hint: "the IAM user name in the actor field",
      accept: ["svc-key-rotator"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "This is a real detection that resolves to authorized activity, so there is nothing to hand off: close it. The evidence chain is a textbook key rotation. The scheduled rotation account svc-key-rotator created a new long-lived key for svc-reporting and, seven seconds later, deactivated the previous key; it ran from Meridian's trusted CI/CD egress and matches the standing quarterly rotation change CHG-6210. The create-then-deactivate swap is the signature of a rotation: an actor seeking persistence adds a credential and leaves the old one active, whereas a rotation retires it. Escalating is the tempting wrong call. CreateAccessKey is the same API that made the root-takeover case an incident, and GuardDuty genuinely did flag this as anomalous, but the only thing anomalous is that this principal acts about once a quarter, so it looks rare every time it runs. Routing is wrong too: nothing is broken and no other team has work to do, because the automation performed exactly as designed. The lesson: the same credential-creation API can be an incident or a non-event, and the actor, the authorizing change, and what happens to the old key decide which; an anomaly score measures rarity, not intent.",
  },
};

export default investigation;
