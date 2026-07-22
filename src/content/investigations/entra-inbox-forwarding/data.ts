import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Suspicious Inbox Forwarding" catalog event (ENTRA-033):
 * High, detected via Entra Identity Protection / Defender for Cloud Apps, mapped
 * to Email Collection: Email Forwarding Rule (T1114.003). A phished sign-in
 * plants a hidden auto-forward rule to exfiltrate mail: a classic business email
 * compromise. The Evidence uses the bespoke-component escape hatch (ADR-0004) to
 * render the rule and the phishing email it followed. All data is fictional.
 */
const investigation: Investigation = {
  id: "entra-inbox-forwarding",
  title: "A quiet forwarding rule",
  short:
    "A mailbox now copies every incoming message to an outside address, under an innocent name. Read it closely.",
  sourcePlatform: "entra",
  difficulty: "challenge",
  severity: "high",
  eventType: "Suspicious Inbox Forwarding",
  mitre: "Email Forwarding Rule (T1114.003)",
  detectionSource: "Entra Identity Protection / Defender for Cloud Apps",
  evidence: { componentKey: "entra-inbox-forwarding" },
  aspects: [
    {
      id: "external-forward",
      label: "The rule forwards all incoming mail to an external address",
      signal: true,
      reasoning: {
        prompt:
          "Why is auto-forwarding to an outside address the core concern?",
        options: [
          "It doubles the mailbox storage used, which is a billing issue",
          "It silently exfiltrates every message the user receives to an attacker, with no further access needed",
          "It only affects spam, so legitimate mail is unaffected",
        ],
        correct: 1,
      },
      note: "A forward to an external domain turns one compromised mailbox into an ongoing feed of everything that arrives: resets, invoices, internal threads. This is the exfiltration channel.",
    },
    {
      id: "hiding-actions",
      label:
        "An innocuous name hides actions that conceal the mail (mark read, move, stop processing)",
      signal: true,
      reasoning: {
        prompt:
          "Why do the rule's secondary actions matter as much as the forward?",
        options: [
          "They speed up Outlook, which is a performance optimization",
          "Marking read, moving to an unused folder, and stopping other rules keep the owner from ever noticing the forwarded mail",
          "They are required by Exchange for any rule to save",
        ],
        correct: 1,
      },
      note: 'The name "RSS Feeds" and the hide-and-suppress actions are deliberate tradecraft. A legitimate rule has no reason to bury mail the owner never reads.',
    },
    {
      id: "post-signin",
      label:
        "The rule was created right after a sign-in from an unfamiliar location",
      signal: true,
      reasoning: {
        prompt: "What does the timing tell you?",
        options: [
          "Nothing, rules are always created just after sign-in",
          "The rule and the anomalous sign-in are one event: whoever logged in from the new location created the rule",
          "It proves the user was travelling and set it up themselves",
        ],
        correct: 1,
      },
      note: "A first-ever geolocation immediately followed by a persistence action ties the rule to the intruder, not the owner.",
    },
    {
      id: "lookalike-sender",
      label: "The preceding email came from a lookalike sender domain",
      signal: true,
      reasoning: {
        prompt: "Why single out meridian-support.example?",
        options: [
          "It is Meridian's real support domain, so the mail is trusted",
          "It is a lookalike of meridian.example, crafted to pass a quick glance while belonging to the attacker",
          "Subdomains are always malicious and should be blocked wholesale",
        ],
        correct: 1,
      },
      note: "The organization's domain is meridian.example. meridian-support.example is a separate, attacker-controlled domain chosen to look official. This is the phishing lure that started the chain.",
    },
    {
      id: "token-replay",
      label: "MFA was satisfied without an interactive prompt (token replay)",
      signal: true,
      reasoning: {
        prompt: "Why is MFA being satisfied here still a red flag?",
        options: [
          "It means MFA worked perfectly and the login is trustworthy",
          "A satisfied factor with no interactive challenge points at a stolen session token replayed by the attacker, which defeats MFA",
          "Token replay is only possible on-premises, so this must be internal",
        ],
        correct: 1,
      },
      note: "Credential phishing kits capture the session token as well as the password. Replaying it produces a sign-in that looks MFA-satisfied without the user ever approving anything.",
    },
    {
      id: "owa-client",
      label: "The rule was created through Outlook on the web",
      signal: false,
      note: "Outlook on the web is a normal way to manage rules. The client is not the signal; the rule's purpose is.",
    },
    {
      id: "quota-pretext",
      label: "The mailbox was near its storage quota",
      signal: false,
      note: "The quota warning is the phishing pretext, not a real signal. Whether the mailbox is full has no bearing on the forwarding rule.",
    },
    {
      id: "sales-dl",
      label: "The user belongs to the Sales distribution list",
      signal: false,
      note: "Group membership is background context and does not indicate compromise.",
    },
  ],
  extract: [
    {
      id: "forward-address",
      label: "External address the rule forwards to",
      hint: "the destination in the rule",
      accept: ["collector-9f2@mailfence-proxy.example"],
      normalize: "text",
    },
    {
      id: "lookalike-domain",
      label: "Lookalike sender domain of the phishing email",
      hint: "the domain after the @ in the From address",
      accept: ["meridian-support.example"],
      normalize: "domain",
    },
    {
      id: "signin-ip",
      label: "Source IP of the sign-in that created the rule",
      hint: "the unfamiliar address",
      accept: ["192.0.2.77"],
      normalize: "ip",
    },
  ],
  verdict: {
    correct: "escalate",
    why: "This is a business email compromise. A lookalike phishing mail harvested the user's credentials and session token; the attacker replayed the token to sign in from a new location and planted a hidden rule that forwards all mail to an external address while suppressing any trace. Escalate on the ENTRA-033 path: disable the rule, revoke the user's sessions and reset credentials, then hunt for sent mail, other mailboxes with the same rule, and anything the forwarded thread may have already exposed.",
  },
};

export default investigation;
