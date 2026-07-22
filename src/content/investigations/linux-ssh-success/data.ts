import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Successful SSH login after failures" catalog event
 * (LINUX-AUTH-002): High, detected from /var/log/auth.log shipped to CloudWatch
 * Logs, mapped to Brute Force: Password Cracking (T1110.003). A burst of failed
 * password attempts that ends in an Accepted login from the same source is a
 * brute force that succeeded. All instance data below is fictional (ADR-0005):
 * the organization is "Meridian", and every address is from an RFC 5737
 * documentation range (203.0.113.0/24 is the attacker, 198.51.100.0/24 is the
 * Meridian office egress).
 */
const investigation: Investigation = {
  id: "linux-ssh-success",
  title: "The failures stopped",
  short:
    "Dozens of SSH password failures on a host ended with a single Accepted login. The noise went quiet. Then what?",
  sourcePlatform: "linux",
  difficulty: "challenge",
  severity: "high",
  eventType: "Successful SSH login after failures",
  mitre: "Brute Force: Password Cracking (T1110.003)",
  detectionSource: "/var/log/auth.log (CloudWatch Logs)",
  evidence: {
    signal: {
      title: "Successful SSH login after repeated failures",
      source: "Linux auth (auth.log)",
      time: "2026-03-14 23:41:52 UTC",
      description:
        "sshd on app-ionode-03 recorded fifty-one failed password attempts for user deploy from 203.0.113.202 over eight minutes, ending in one Accepted password for the same account from the same address. The session then wrote to authorized_keys and probed for privileges.",
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
            { label: "Host", value: "app-ionode-03" },
            { label: "Account", value: "deploy" },
            { label: "Source IP", value: "203.0.113.202" },
            { label: "Failures before success", value: "51" },
            { label: "Auth method that succeeded", value: "password" },
            { label: "SSH exposure", value: "port 22 open to 0.0.0.0/0" },
            {
              label: "Expected auth for deploy",
              value: "publickey only (password disabled by policy)",
              wide: true,
            },
          ],
        },
        {
          heading: "Session activity after login",
          rows: [
            { label: "23:42:07", value: "whoami" },
            { label: "23:42:09", value: "id" },
            {
              label: "23:42:26",
              value:
                "appended an attacker key to /home/deploy/.ssh/authorized_keys",
              wide: true,
            },
            {
              label: "23:42:41",
              value: "sudo to root attempted (command not allowed)",
              wide: true,
            },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Brute Force: Password Cracking (T1110.003)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Host exposure",
              value: "app-ionode-03 is an internet-reachable application node",
              wide: true,
            },
            {
              label: "Auth policy",
              value:
                "Password auth is disabled for service accounts like deploy; admin SSH is restricted to 198.51.100.0/24",
              wide: true,
            },
            {
              label: "Change ticket",
              value: "None references maintenance on this host tonight",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "LINUX-AUTH-002" },
            { label: "Category", value: "Authentication" },
            {
              label: "Detection source",
              value: "/var/log/auth.log (CloudWatch Logs)",
              wide: true,
            },
            { label: "SSH client", value: "OpenSSH" },
            {
              label: "Earlier activity",
              value:
                "Scattered failures for other usernames from various IPs earlier in the day",
              wide: true,
            },
            { label: "Event time", value: "2026-03-14 23:41:52 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "High",
  "actor": { "user": { "name": "deploy" } },
  "src_endpoint": { "ip": "203.0.113.202" },
  "finding_info": {
    "title": "Successful SSH login after failures",
    "attacks": [{ "technique": { "uid": "T1110.003", "name": "Password Cracking" } }]
  },
  "resources": [
    { "uid": "app-ionode-03", "type": "Host" }
  ],
  "unmapped": {
    "auth_log": [
      "Mar 14 23:33:10 app-ionode-03 sshd[20418]: Failed password for deploy from 203.0.113.202 port 51044 ssh2",
      "... 49 more failures for deploy from 203.0.113.202 ...",
      "Mar 14 23:41:52 app-ionode-03 sshd[20655]: Accepted password for deploy from 203.0.113.202 port 51993 ssh2",
      "Mar 14 23:41:52 app-ionode-03 sshd[20655]: pam_unix(sshd:session): session opened for user deploy(uid=1002)"
    ],
    "session_activity": [
      "23:42:07 deploy: whoami",
      "23:42:09 deploy: id",
      "23:42:26 deploy: appended ssh-ed25519 key (attacker@offbox) to authorized_keys",
      "23:42:41 sudo: deploy attempted USER=root COMMAND=/bin/bash (command not allowed)"
    ]
  }
}`,
    },
  },
  aspects: [
    {
      id: "same-ip-success",
      label:
        "The Accepted login came from the same IP that generated all the failures",
      signal: true,
      reasoning: {
        prompt: "Why does the shared source IP change the picture?",
        options: [
          "It proves the failures and the success are unrelated coincidences",
          "It means the brute force from that address finally guessed the password, so the success is the attack landing rather than a normal login",
          "It shows the user simply mistyped their password many times before getting it right",
        ],
        correct: 1,
      },
      note: "Failures and the success sharing one external address is the signature of a brute force that succeeded. Treat the Accepted line as the compromise, not a recovery.",
    },
    {
      id: "password-not-key",
      label:
        "Password authentication succeeded on an account that should use keys only",
      signal: true,
      reasoning: {
        prompt: "Why is the password success itself suspicious here?",
        options: [
          "Password auth is faster than key auth, so the account was configured for convenience",
          "Policy disables password auth for the deploy account, so a successful password login means the control was missing or bypassed on this host",
          "Password and key authentication are interchangeable and the method never matters",
        ],
        correct: 1,
      },
      note: "The deploy account is meant to accept publickey only. A password success contradicts the hardened baseline and means this host drifted, which is exactly what let the guessing work.",
    },
    {
      id: "authorized-keys-write",
      label: "A new key was appended to the deploy account's authorized_keys",
      signal: true,
      reasoning: {
        prompt:
          "What does writing to authorized_keys accomplish for the actor?",
        options: [
          "It logs the actor out and ends their access immediately",
          "It plants persistent key-based access that survives a password reset, so the actor keeps getting in even after the account is locked",
          "It is a routine step every SSH client performs on first login",
        ],
        correct: 1,
      },
      note: "Adding an attacker-controlled public key is a classic persistence move. Rotating the password alone will not evict them; the injected key has to be removed too.",
    },
    {
      id: "internet-exposed-ssh",
      label: "SSH on this host is reachable from the entire internet",
      signal: true,
      reasoning: {
        prompt: "Why does the 0.0.0.0/0 exposure matter to this alert?",
        options: [
          "It is irrelevant because strong passwords make exposure harmless",
          "It gave the attacker unlimited attempts from anywhere, which is what made an online password brute force viable in the first place",
          "It only matters for RDP, not for SSH",
        ],
        correct: 1,
      },
      note: "Internet-facing SSH turns credential guessing into a numbers game. Restricting port 22 to the office egress range would have removed the attack surface entirely.",
    },
    {
      id: "recon-and-sudo",
      label: "The session ran whoami and id and then attempted sudo to root",
      signal: true,
      reasoning: {
        prompt: "Why do the whoami, id, and sudo attempts matter?",
        options: [
          "They are harmless shell defaults that run automatically at login",
          "They are hands-on-keyboard reconnaissance and a privilege-escalation attempt, confirming an interactive actor probing for more access",
          "They prove the login was the legitimate deploy user doing normal work",
        ],
        correct: 1,
      },
      note: "Immediate identity checks followed by a sudo attempt are what an operator does after landing on a new box. This is an active intrusion, not an idle session.",
    },
    {
      id: "openssh-client",
      label: "The connection was made with an OpenSSH client",
      signal: false,
      note: "OpenSSH is the ordinary client for reaching a Linux host. The client software is not the signal; the guessing, the method, and the post-login activity are.",
    },
    {
      id: "logs-to-cloudwatch",
      label: "auth.log is forwarded to CloudWatch Logs",
      signal: false,
      note: "Shipping auth.log to CloudWatch is the detection pipeline that surfaced this alert. It is how you can see the event, not evidence of the attack.",
    },
    {
      id: "earlier-noise",
      label:
        "Other usernames saw scattered failures earlier in the day from different IPs",
      signal: false,
      note: "Low-volume failures across assorted accounts from many addresses are internet background scanning. They are unrelated to the focused, single-source burst that succeeded here.",
    },
  ],
  extract: [
    {
      id: "source-ip",
      label: "Attacker source IP",
      hint: "the address behind the failures and the success",
      accept: ["203.0.113.202"],
      normalize: "ip",
    },
    {
      id: "username",
      label: "Compromised account",
      hint: "the user in the Accepted line",
      accept: ["deploy"],
      normalize: "text",
    },
    {
      id: "hostname",
      label: "Affected host",
      hint: "the hostname in the log lines",
      accept: ["app-ionode-03"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "The failures did not stop because the attacker gave up. They stopped because the attacker got in: fifty-one guesses from 203.0.113.202 ended in an Accepted password for deploy from that same address, on a host that never should have accepted a password and never should have been reachable from the whole internet. The actor then planted a persistent key and probed for root. This is a confirmed brute-force compromise with an active foothold. Escalate, isolate app-ionode-03, remove the injected authorized_keys entry, rotate the deploy credentials, and restrict SSH exposure.",
  },
};

export default investigation;
