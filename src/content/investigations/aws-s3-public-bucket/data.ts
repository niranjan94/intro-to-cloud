import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "S3 Bucket Made Public" catalog event (AWS-S3-001): Critical,
 * detected via CloudTrail, Config, and S3 access logs, mapped to Transfer Data
 * to Cloud Account (T1537). A bucket policy opened to Principal "*" is a top
 * cause of data breaches. All instance data below is fictional (ADR-0005): the
 * organization is "Meridian", the domain is meridian.example, and every address
 * is from an RFC 5737 documentation range.
 */
const investigation: Investigation = {
  id: "aws-s3-public-bucket",
  title: "Bucket turned public",
  short:
    "A bucket holding customer exports went public at 23:41, and anonymous downloads started minutes later. Real exposure, or a controlled change?",
  sourcePlatform: "aws",
  difficulty: "standard",
  severity: "critical",
  eventType: "S3 Bucket Made Public",
  mitre: "Transfer Data to Cloud Account (T1537)",
  detectionSource: "CloudTrail / Config / S3 Access Logs",
  evidence: {
    signal: {
      title: "S3 bucket policy opened to the public",
      source: "CloudTrail / Config / S3 Access Logs",
      time: "2026-05-02 23:41:18 UTC",
      description:
        'The bucket meridian-customer-exports had Block Public Access removed and a bucket policy attached granting s3:GetObject to Principal "*". Server access logs record anonymous GET requests from external addresses beginning three minutes later.',
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
            { label: "Bucket", value: "meridian-customer-exports", wide: true },
            { label: "Events", value: "PutPublicAccessBlock, PutBucketPolicy" },
            {
              label: "Policy grant",
              value: 'Principal "*" on s3:GetObject',
            },
            {
              label: "Block Public Access",
              value: "Removed (acls, policy, restrict all false)",
              wide: true,
            },
            { label: "Actor", value: "IAM user svc-reporting (access key)" },
            { label: "Access key id", value: "AKIA5MERIDIANEXPORTS" },
            { label: "Source IP", value: "192.0.2.88" },
            {
              label: "Geolocation",
              value: "Da Nang, VN (never seen for this principal)",
              wide: true,
            },
            {
              label: "User agent",
              value: "aws-cli/2.15.30 Python/3.11",
              wide: true,
            },
          ],
        },
        {
          heading: "Post-change access log",
          rows: [
            {
              label: "23:44:02",
              value:
                "anonymous GET exports/2026-04-q1.csv (200) from 203.0.113.201",
              wide: true,
            },
            {
              label: "23:44:51",
              value:
                "anonymous GET exports/pii-index.json (200) from 198.51.100.240",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Transfer Data to Cloud Account (T1537)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Bucket purpose",
              value:
                "Holds nightly customer data exports; meant to stay fully private",
              wide: true,
            },
            {
              label: "Admin baseline",
              value:
                "Admins operate through SSO roles from 198.51.100.0/24, never long-lived IAM keys",
              wide: true,
            },
            {
              label: "Change ticket",
              value: "None references opening this bucket",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-S3-001" },
            { label: "Category", value: "Data exposure" },
            {
              label: "Detection source",
              value: "CloudTrail / Config / S3 Access Logs",
              wide: true,
            },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "Encryption at rest", value: "SSE-S3" },
            { label: "Versioning", value: "Enabled" },
            { label: "Event time", value: "2026-05-02 23:41:18 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "Critical",
  "actor": { "user": { "type": "IAMUser", "name": "svc-reporting" } },
  "src_endpoint": { "ip": "192.0.2.88" },
  "finding_info": {
    "title": "S3 bucket policy opened to the public",
    "attacks": [{ "technique": { "uid": "T1537", "name": "Transfer Data to Cloud Account" } }]
  },
  "resources": [
    { "uid": "meridian-customer-exports", "type": "AWS::S3::Bucket" }
  ],
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "raw_event": {
      "eventName": "PutPublicAccessBlock",
      "requestParameters": {
        "bucketName": "meridian-customer-exports",
        "PublicAccessBlockConfiguration": { "BlockPublicAcls": false, "BlockPublicPolicy": false, "RestrictPublicBuckets": false }
      },
      "userIdentity": { "type": "IAMUser", "userName": "svc-reporting", "accessKeyId": "AKIA5MERIDIANEXPORTS" }
    },
    "follow_up_event": {
      "eventName": "PutBucketPolicy",
      "requestParameters": {
        "bucketName": "meridian-customer-exports",
        "bucketPolicy": { "Statement": [{ "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::meridian-customer-exports/*" }] }
      }
    },
    "access_log": [
      "23:44:02 203.0.113.201 REST.GET.OBJECT exports/2026-04-q1.csv 200 anonymous",
      "23:44:51 198.51.100.240 REST.GET.OBJECT exports/pii-index.json 200 anonymous"
    ]
  }
}`,
    },
  },
  aspects: [
    {
      id: "public-principal",
      label: 'The new bucket policy grants s3:GetObject to Principal "*"',
      signal: true,
      reasoning: {
        prompt: 'Why is Principal "*" on s3:GetObject the core problem?',
        options: [
          "It only allows other AWS accounts you have whitelisted to read the bucket",
          "It lets anyone on the internet, with no credentials, read every object in the bucket",
          "It applies solely to the bucket owner and changes nothing about access",
        ],
        correct: 1,
      },
      note: "A wildcard Principal on GetObject makes every object anonymously readable. For a bucket of customer exports that is direct data exposure.",
    },
    {
      id: "bpa-disabled",
      label: "Block Public Access was turned off just before the policy change",
      signal: true,
      reasoning: {
        prompt: "What is the significance of the PutPublicAccessBlock call?",
        options: [
          "Block Public Access is cosmetic and disabling it has no real effect",
          "Block Public Access is the account safety net that would have overridden a public policy, so disabling it first was a deliberate step to make the exposure take effect",
          "It automatically re-encrypts the bucket, improving security",
        ],
        correct: 1,
      },
      note: "Block Public Access exists precisely to neutralize a public bucket policy. Removing it first shows the public grant was intended to actually work, not a misconfiguration that would have been caught.",
    },
    {
      id: "iam-key-actor",
      label:
        "The change was made with a long-lived IAM access key, not an admin via SSO",
      signal: true,
      reasoning: {
        prompt: "Why does the actor being an IAM access key matter?",
        options: [
          "IAM access keys are more secure than SSO, so this is reassuring",
          "Meridian admins work through short-lived SSO role sessions, so a static service-account key making this change is off-pattern and consistent with a leaked credential",
          "Access keys cannot call PutBucketPolicy, so the log must be wrong",
        ],
        correct: 1,
      },
      note: "A service account key performing a sensitive policy change that humans normally make through SSO is a strong sign the key was stolen and is being used by someone else.",
    },
    {
      id: "unknown-ip",
      label: "The source IP is outside Meridian's known ranges",
      signal: true,
      reasoning: {
        prompt: "What makes 192.0.2.88 suspicious here?",
        options: [
          "It is inside the office egress range, which is expected",
          "It sits outside Meridian's egress range and geolocates to a place this principal has never operated from",
          "It is a private address and therefore cannot reach S3",
        ],
        correct: 1,
      },
      note: "Legitimate changes come from 198.51.100.0/24. A first-ever source and geolocation for this key reinforces credential theft.",
    },
    {
      id: "anonymous-downloads",
      label: "Access logs show anonymous external GETs right after the change",
      signal: true,
      reasoning: {
        prompt: "Why do the anonymous GET entries raise the severity?",
        options: [
          "They are health checks AWS runs on every bucket and can be ignored",
          "They show unauthenticated external clients already pulling objects, so this is active exfiltration in progress, not just a risky configuration",
          "They prove the bucket is still private because the requests succeeded",
        ],
        correct: 1,
      },
      note: "Anonymous 200 responses from external IPs mean data is already leaving. The window between exposure and download is where a data breach becomes a reportable incident.",
    },
    {
      id: "region-us-east-1",
      label: "The API calls were recorded in region us-east-1",
      signal: false,
      note: "S3 bucket-level control-plane events commonly surface in us-east-1. The region tells you nothing about intent and is noise here.",
    },
    {
      id: "sse-s3",
      label: "The bucket uses SSE-S3 default encryption at rest",
      signal: false,
      note: "Encryption at rest protects against disk-level theft. It does nothing to stop an authorized-looking public GetObject, so it is irrelevant to this exposure.",
    },
    {
      id: "versioning",
      label: "The bucket has versioning enabled",
      signal: false,
      note: "Versioning helps recover overwritten or deleted objects. It has no bearing on who can read the bucket and is a distractor.",
    },
  ],
  extract: [
    {
      id: "source-ip",
      label: "Source IP that made the change",
      hint: "the address in the PutBucketPolicy event",
      accept: ["192.0.2.88"],
      normalize: "ip",
    },
    {
      id: "bucket-name",
      label: "Affected bucket name",
      hint: "the exposed bucket",
      accept: ["meridian-customer-exports"],
      normalize: "text",
    },
    {
      id: "access-key",
      label: "IAM access key id used for the change",
      hint: "the AKIA... id from the actor",
      accept: ["AKIA5MERIDIANEXPORTS"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "This is a live data-exposure incident. A service-account key, used from an unfamiliar address outside any change window, disabled Block Public Access and attached a policy making customer exports world-readable, and anonymous external clients began downloading within minutes. Escalate on the AWS-S3-001 path, re-enable Block Public Access to shut the exposure, disable the compromised key, and begin data-breach assessment for the objects that were pulled.",
  },
};

export default investigation;
