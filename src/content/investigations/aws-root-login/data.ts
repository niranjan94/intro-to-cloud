import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Root Account Login" catalog event (AWS-IAM-001): Critical,
 * detected via CloudTrail, mapped to Valid Accounts (T1078). Root console
 * sign-ins are suspicious by default because root is never used for day-to-day
 * work. All instance data below is fictional (ADR-0005): the organization is
 * "Meridian", the domain is meridian.example, and every address is from an
 * RFC 5737 documentation range.
 */
const investigation: Investigation = {
  id: "aws-root-login",
  title: "Root account sign-in",
  short:
    "A root console login lands on the desk at 02:14. Authorized change, or a takeover in progress?",
  sourcePlatform: "aws",
  difficulty: "guided",
  severity: "critical",
  eventType: "Root Account Login",
  mitre: "Valid Accounts (T1078)",
  detectionSource: "CloudTrail",
  evidence: {
    signal: {
      title: "Root account console sign-in",
      source: "CloudTrail",
      time: "2026-03-14 02:14:07 UTC",
      description:
        "AWS CloudTrail recorded a console sign-in using the account root user in the Meridian production account (id 400123456789). A CreateAccessKey call followed on the same session ninety seconds later.",
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
            { label: "MFA used", value: "No" },
            { label: "Channel", value: "AWS Management Console" },
            { label: "Source IP", value: "203.0.113.47" },
            {
              label: "Geolocation",
              value: "Skopje, MK (never seen for this account)",
              wide: true,
            },
            {
              label: "User agent",
              value: "python-requests/2.31.0",
              wide: true,
            },
            {
              label: "Session follow-up",
              value: "CreateAccessKey created AKIAV7QMEXAMPLE3ROOT (Active)",
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
              value: "None references root access tonight",
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
            { label: "Event time", value: "2026-03-14 02:14:07 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "Critical",
  "actor": { "user": { "type": "Root", "account_uid": "400123456789" } },
  "src_endpoint": { "ip": "203.0.113.47" },
  "finding_info": {
    "title": "Root account console sign-in",
    "attacks": [{ "technique": { "uid": "T1078", "name": "Valid Accounts" } }]
  },
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "raw_event": {
      "eventName": "ConsoleLogin",
      "additionalEventData": { "MFAUsed": "No" },
      "responseElements": { "ConsoleLogin": "Success" },
      "userAgent": "python-requests/2.31.0"
    },
    "follow_up_event": {
      "eventName": "CreateAccessKey",
      "eventTime": "2026-03-14T02:15:39Z",
      "responseElements": { "accessKey": { "accessKeyId": "AKIAV7QMEXAMPLE3ROOT", "status": "Active" } }
    }
  }
}`,
    },
  },
  aspects: [
    {
      id: "root-used",
      label: "The root account itself was used to sign in",
      signal: true,
      reasoning: {
        prompt: "Why does a root sign-in matter on its own?",
        options: [
          "Root has no permissions, so the session cannot do anything",
          "Root bypasses IAM guardrails and can do anything in the account, so it should essentially never be used",
          "Root logins are always automated and therefore always safe",
        ],
        correct: 1,
      },
      note: "Root sits above every IAM policy, SCP, and permission boundary. A day-to-day root login is an anomaly regardless of anything else in the event.",
    },
    {
      id: "unknown-ip",
      label: "The source IP and geolocation are unfamiliar for this account",
      signal: true,
      reasoning: {
        prompt: "What makes the source address suspicious here?",
        options: [
          "It is a private RFC 1918 address, which is never valid",
          "It sits outside Meridian's known office egress range and geolocates somewhere the account has never signed in from",
          "It is an IPv6 address and root only supports IPv4",
        ],
        correct: 1,
      },
      note: "Root is expected only from 198.51.100.0/24. A first-ever geolocation for a root sign-in is a strong takeover indicator.",
    },
    {
      id: "no-mfa",
      label: "MFA was not used on the sign-in",
      signal: true,
      reasoning: {
        prompt: "Why is the missing MFA significant?",
        options: [
          "MFA is optional for root, so its absence is expected",
          "Policy enforces hardware MFA on root, so a successful sign-in without it means the factor was bypassed or the password alone was enough",
          "MFA only applies to IAM users, never to root",
        ],
        correct: 1,
      },
      note: "A successful root login with MFAUsed=No contradicts the enforced control and points at stolen credentials rather than a legitimate operator.",
    },
    {
      id: "access-key-created",
      label: "The session created a new root access key moments later",
      signal: true,
      reasoning: {
        prompt: "Why does the CreateAccessKey call raise the stakes?",
        options: [
          "It is routine cleanup that AWS performs after every login",
          "A long-lived root access key is a persistence mechanism: it lets the actor keep programmatic access even after the password is reset",
          "Access keys expire in five minutes, so it is harmless",
        ],
        correct: 1,
      },
      note: "Creating a root access key turns a single interactive login into durable, scriptable access. This is classic post-compromise persistence.",
    },
    {
      id: "console-channel",
      label: "The sign-in came through the AWS Management Console",
      signal: false,
      note: "The console is the normal interactive channel for a sign-in. The channel itself is not the signal; who signed in, from where, and without MFA are.",
    },
    {
      id: "us-east-1",
      label: "The event was recorded in region us-east-1",
      signal: false,
      note: "Global and root events are always recorded in us-east-1. Seeing it here is expected and tells you nothing about intent.",
    },
    {
      id: "support-plan",
      label: "The account is on the Business support plan",
      signal: false,
      note: "The support tier is unrelated to the sign-in and is noise included to distract.",
    },
  ],
  extract: [
    {
      id: "source-ip",
      label: "Source IP of the sign-in",
      hint: "the address in the ConsoleLogin event",
      accept: ["203.0.113.47"],
      normalize: "ip",
    },
    {
      id: "access-key",
      label: "Access key created during the session",
      hint: "the AKIA... id from CreateAccessKey",
      accept: ["AKIAV7QMEXAMPLE3ROOT"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "Every real signal points one way: root was used with no MFA, from an address and location the account has never seen, with no change ticket, and the session immediately minted a long-lived access key. That is an account takeover in progress. Escalate on the AWS-IAM-001 path (SOC Analyst to SOC Lead to CISO), rotate root credentials, and revoke the new key.",
  },
};

export default investigation;
