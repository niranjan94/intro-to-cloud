import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the GuardDuty finding type
 * "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS":
 * default severity High, detected via GuardDuty, mapped to Unsecured Credentials:
 * Cloud Instance Metadata API (T1552.005) with Valid Accounts: Cloud Accounts
 * (T1078.004) on the replay. Temporary credentials minted for an EC2 instance
 * through its instance role are scoped to that instance; when GuardDuty sees the
 * same credentials calling AWS APIs from an IP outside AWS, the instance role has
 * been stolen and is being replayed remotely. The raw payload is modeled as an
 * OCSF Detection Finding (class 2004) carrying the original GuardDuty event in
 * `unmapped.raw_event`. All instance data below is fictional (ADR-0005): the
 * organization is "Meridian", the domain is meridian.example, external addresses
 * are from RFC 5737 documentation ranges and internal ones from RFC 1918, and the
 * account, instance, role, and access-key ids are synthetic placeholders.
 */
const investigation: Investigation = {
  id: "aws-instance-credential-exfil",
  title: "Instance credentials used from outside AWS",
  short:
    "GuardDuty says an EC2 role's temporary credentials are calling AWS from an external IP. Stolen and replayed, or a routing quirk?",
  sourcePlatform: "aws",
  difficulty: "standard",
  severity: "high",
  eventType: "EC2 Instance Credential Exfiltration",
  mitre: "Unsecured Credentials: Cloud Instance Metadata API (T1552.005)",
  detectionSource: "GuardDuty",
  evidence: {
    signal: {
      title:
        "EC2 instance-role credentials used from an IP address outside AWS",
      source: "GuardDuty",
      time: "2026-07-02 14:38:22 UTC",
      description:
        "Amazon GuardDuty observed temporary credentials that were created for an EC2 instance through its instance role being used to call AWS APIs from an IP address outside the AWS network. The instance is i-05f9a3c1e8b7d2064 in the Meridian production account (id 400123456789). GuardDuty reports the anomaly; it does not decide whether the external caller is one you own.",
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
              label: "Finding type",
              value:
                "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS",
              wide: true,
            },
            {
              label: "Credential type",
              value: "Temporary (STS, instance role)",
            },
            { label: "Access key", value: "ASIAV7QMEXAMPLE7DEV" },
            {
              label: "Principal",
              value:
                "arn:aws:sts::400123456789:assumed-role/meridian-dev-metrics-reader/i-05f9a3c1e8b7d2064",
              wide: true,
            },
            { label: "Caller type", value: "Remote IP (not an AWS address)" },
            { label: "Caller IP", value: "192.0.2.77" },
            {
              label: "Caller network",
              value: "Vilnius, LT · AS-EXAMPLE Example Hosting LLC (non-AWS)",
              wide: true,
            },
            {
              label: "API calls from caller",
              value:
                "sts:GetCallerIdentity, iam:ListRoles, s3:ListBuckets, ec2:DescribeInstances",
              wide: true,
            },
            {
              label: "Matching activity from the instance",
              value: "None (the instance made no such calls in this window)",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: [
            "Unsecured Credentials: Cloud Instance Metadata API (T1552.005)",
            "Valid Accounts: Cloud Accounts (T1078.004)",
          ],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Instance role scope",
              value:
                "Instance-role credentials are minted through the metadata service and are meant to be used only from the instance itself",
              wide: true,
            },
            {
              label: "Trusted egress",
              value:
                "Meridian egress is 198.51.100.0/24; 192.0.2.77 is not Meridian's and has never been seen for this workload",
              wide: true,
            },
            {
              label: "Egress path",
              value:
                "Instance routes internet traffic through a standard VPC internet gateway (no Outposts or on-prem VPN egress)",
              wide: true,
            },
            {
              label: "Change ticket",
              value: "None authorizes exporting this instance's credentials",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-GD-6157" },
            { label: "Category", value: "Credential access" },
            { label: "Detection source", value: "GuardDuty" },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "Instance", value: "i-05f9a3c1e8b7d2064" },
            { label: "Instance type", value: "t3.small (dev-tier)" },
            { label: "Event time", value: "2026-07-02 14:38:22 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "severity": "High",
  "time": "2026-07-02T14:38:22Z",
  "finding_info": {
    "uid": "AWS-GD-6157",
    "title": "Credentials created for an EC2 instance are being used from an external IP address",
    "types": ["UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS"]
  },
  "actor": {
    "user": {
      "type": "AssumedRole",
      "name": "meridian-dev-metrics-reader",
      "uid": "AROAV7QMEXAMPLE7ROLE:i-05f9a3c1e8b7d2064",
      "credential_uid": "ASIAV7QMEXAMPLE7DEV",
      "account": { "uid": "400123456789" }
    }
  },
  "src_endpoint": {
    "ip": "192.0.2.77",
    "location": { "city": "Vilnius", "country": "LT" }
  },
  "api": { "operation": "ListBuckets", "service": { "name": "s3.amazonaws.com" } },
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "attacks": [
    { "technique": { "uid": "T1552.005", "name": "Cloud Instance Metadata API" }, "tactic": { "name": "Credential Access" } },
    { "technique": { "uid": "T1078.004", "name": "Cloud Accounts" }, "tactic": { "name": "Defense Evasion" } }
  ],
  "resources": [
    { "uid": "i-05f9a3c1e8b7d2064", "type": "AWS::EC2::Instance" }
  ],
  "unmapped": {
    "raw_event": {
      "type": "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS",
      "resource": {
        "resourceType": "AccessKey",
        "accessKeyDetails": {
          "accessKeyId": "ASIAV7QMEXAMPLE7DEV",
          "principalId": "AROAV7QMEXAMPLE7ROLE:i-05f9a3c1e8b7d2064",
          "userType": "AssumedRole",
          "userName": "meridian-dev-metrics-reader"
        }
      },
      "service": {
        "action": {
          "actionType": "AWS_API_CALL",
          "awsApiCallAction": {
            "api": "ListBuckets",
            "serviceName": "s3.amazonaws.com",
            "callerType": "Remote IP",
            "remoteIpDetails": {
              "ipAddressV4": "192.0.2.77",
              "organization": { "asn": "64500", "asnOrg": "Example Hosting LLC", "isp": "Example Hosting" },
              "geoLocation": { "lat": 54.6872, "lon": 25.2797 },
              "country": { "countryName": "Lithuania" }
            }
          }
        },
        "additionalInfo": {
          "recentApiCalls": [
            { "api": "GetCallerIdentity", "count": 1 },
            { "api": "ListRoles", "count": 1 },
            { "api": "ListBuckets", "count": 1 },
            { "api": "DescribeInstances", "count": 1 }
          ]
        }
      }
    }
  }
}`,
      unmapped: [
        {
          label: "type",
          value:
            "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS",
          wide: true,
        },
        { label: "callerType", value: "Remote IP" },
        {
          label: "remoteIpDetails.asnOrg",
          value: "Example Hosting LLC (non-AWS)",
          wide: true,
        },
        {
          label: "accessKeyDetails.userType",
          value: "AssumedRole (instance role, temporary credentials)",
          wide: true,
        },
      ],
    },
  },
  aspects: [
    {
      id: "creds-outside-aws",
      label:
        "The instance's temporary role credentials are being used from an IP outside AWS",
      signal: true,
      reasoning: {
        prompt:
          "Why is instance-role credentials being used from outside AWS the core signal?",
        options: [
          "Because AWS API calls are only valid from inside AWS, so any external call is automatically blocked",
          "Because those credentials are minted through the instance metadata service for the instance to use; seeing them off the instance, from outside AWS, means they were exfiltrated and are being replayed",
          "Because temporary credentials cannot be used more than once, so a second use is always an error",
        ],
        correct: 1,
      },
      note: "Instance-role credentials are scoped to the instance that requested them. AWS itself does not stop them being used elsewhere, which is exactly why an external caller matters: it is the evidence the credentials left the instance.",
    },
    {
      id: "unfamiliar-external-ip",
      label:
        "The caller IP is external, not Meridian trusted egress, and never seen for this workload",
      signal: true,
      reasoning: {
        prompt: "What makes 192.0.2.77 suspicious for this credential?",
        options: [
          "It is a private RFC 1918 address, which can never call AWS",
          "It sits outside Meridian's trusted egress (198.51.100.0/24), belongs to an unrelated hosting provider, and has no prior association with this instance or role",
          "It is in a different country from the account's home region, and cross-region calls are prohibited",
        ],
        correct: 1,
      },
      note: "The instance's own calls originate inside AWS. A hosting-provider address in another country, outside trusted egress and with no history for this role, is where the stolen credential is now being used from.",
    },
    {
      id: "recon-enumeration",
      label:
        "The external session ran permission-enumeration calls (GetCallerIdentity, ListRoles, ListBuckets)",
      signal: true,
      reasoning: {
        prompt: "Why do these read-only calls raise rather than lower concern?",
        options: [
          "Because read-only calls consume more permissions than write calls do",
          "Because GetCallerIdentity, ListRoles, and ListBuckets are the classic first moves an attacker makes to learn what a freshly stolen credential can reach before acting on it",
          "Because these APIs are deprecated and their use always signals a misconfigured client",
        ],
        correct: 1,
      },
      note: "Enumerating identity, roles, and buckets is reconnaissance: the actor is mapping the blast radius of the credential. Read-only now does not mean read-only next.",
    },
    {
      id: "no-benign-routing",
      label:
        "There is no benign routing or change-ticket explanation for the external egress",
      signal: true,
      reasoning: {
        prompt:
          "GuardDuty documents a false-positive cause for this finding. What rules it out here?",
        options: [
          "The finding is High severity, and High-severity findings are never false positives",
          "The known false positive is traffic egressing through an on-prem gateway (Outposts or VPC VPN); this instance uses a standard VPC internet gateway and no change ticket authorizes exporting its credentials",
          "GuardDuty only reports this finding after it has already confirmed a compromise, so no analysis is needed",
        ],
        correct: 1,
      },
      note: "The documented benign case is a network artifact: internet traffic routed out through an on-prem gateway makes AWS-internal calls look external. That is not this instance's egress path, and nothing sanctioned the credential leaving the box.",
    },
    {
      id: "dev-tier-instance",
      label: "The affected instance is a small, dev-tier t3.small",
      signal: false,
      note: "Instance size does not bound the credential's reach. This is a role in the single production account, and its permissions are whatever the role grants regardless of how small the box is. Treating a dev-tier instance as low stakes is how a foothold gets underweighted.",
    },
    {
      id: "read-only-calls",
      label: "All API calls observed from the caller were read-only",
      signal: false,
      note: "Read-only looks reassuring, but the harm already happened when the credential left the instance. Enumeration is the first stage of misuse, not the end of it, and the same credential can be used for write actions at any time. Read-only is not exculpatory here.",
    },
    {
      id: "routine-role-name",
      label:
        "The role name (meridian-dev-metrics-reader) looks routine and follows naming conventions",
      signal: false,
      note: "A legitimate, well-named role is expected: these credentials were minted by a real role doing real work. The role being genuine says nothing about where the credential is now being used from, which is the anomaly.",
    },
    {
      id: "no-host-alerts",
      label:
        "The instance itself has no other alerts (no malware or login flags)",
      signal: false,
      note: "Absence of a host alert does not clear the instance. Instance credentials are often stolen through application-layer flaws such as SSRF that leave no host IOC, so this GuardDuty finding may be the only evidence of the compromise. A quiet host is not a clean one.",
    },
  ],
  extract: [
    {
      id: "caller-ip",
      label: "External IP the credentials were used from",
      hint: "the remote caller address in the finding",
      accept: ["192.0.2.77"],
      normalize: "ip",
    },
    {
      id: "access-key",
      label: "Temporary access key that was replayed",
      hint: "the ASIA... credential id in accessKeyDetails",
      accept: ["ASIAV7QMEXAMPLE7DEV"],
      normalize: "text",
    },
    {
      id: "instance",
      label: "Instance whose role credentials were exfiltrated",
      hint: "the i-... resource uid",
      accept: ["i-05f9a3c1e8b7d2064"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "Temporary instance-role credentials are minted through the metadata service for one instance to use, so they should only ever be seen calling AWS from that instance, inside AWS. Here the same credential is calling from 192.0.2.77, a hosting-provider address outside AWS, outside Meridian's trusted egress, running identity and permission enumeration, with no matching activity on the instance and no change ticket. That is a stolen instance credential being replayed: a live compromise. Escalate on the incident path, revoke the role's active sessions, and isolate or rebuild the instance. A Close would be the wrong call: the tempting excuses (a small dev-tier box, read-only calls, a routine role name, no other host alerts) each describe something normal and none of them explains the credential being used from outside AWS, and the one benign cause GuardDuty documents, egress through an on-prem gateway, does not apply because this instance uses a standard VPC internet gateway. Route is also wrong: this is not a posture gap to hand a team on its patch cadence, it is an intrusion in progress that needs incident response now. The lesson: instance-role credentials are bound to the instance, so their use from outside AWS is proof of theft, not a rating to reassess.",
  },
};

export default investigation;
