import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the Object Storage lesson. The interactive
 * components under this folder are provider-agnostic and read everything they
 * render from here, so the AWS and Azure lessons stay bespoke without
 * duplicating the interaction machinery. The two providers genuinely diverge in
 * the namespace layering (Azure adds a storage account above the container), the
 * tier vocabulary (S3 storage classes vs Azure access tiers), and the
 * signed-access model (presigned URL vs shared access signature).
 *
 * Facts verified against Amazon S3 documentation (docs.aws.amazon.com) and
 * Microsoft Learn (learn.microsoft.com). Relative cost bars are illustrative,
 * not price quotes. Prose is neutral and professional; no em dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* -------------------------- Chapter 0 · namespace ------------------------- */

export interface NamespaceObject {
  /** The full object key, e.g. "photos/2024/aria.jpg". */
  key: string;
  size: string;
}

export interface NamespaceContent {
  /** Azure only: the storage account layer above the container. */
  account?: { term: string; name: string; sub: string };
  containerTerm: string;
  containerName: string;
  containerSub: string;
  objectTerm: string;
  keyTerm: string;
  /** The separator that fakes a folder hierarchy, almost always "/". */
  delimiter: string;
  /** URL with a literal "{key}" placeholder, filled per selected object. */
  urlTemplate: string;
  objects: NamespaceObject[];
  hint: string;
  note: string;
  /** A single upload command showing the key is the whole path. */
  cli: string;
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 1 · tiers --------------------------- */

export interface TierFact {
  label: string;
  value: string;
}

export interface Tier {
  id: string;
  /** The provider's name for the tier, e.g. "S3 Standard" or "Hot". */
  name: string;
  tone: Tone;
  tagline: string;
  /** Illustrative relative storage price, 1 = the hottest tier. Not a quote. */
  storageRel: number;
  facts: TierFact[];
  use: string;
}

export interface TiersContent {
  /** What the provider calls this setting, e.g. "Storage class". */
  label: string;
  tiers: Tier[];
  note: string;
  callouts: CalloutData[];
}

/* ----------------------- Chapter 2 · access layers ------------------------ */

/**
 * The role a mechanism plays, which drives its color and chip label:
 * recommended (the path to prefer), legacy (discouraged, kept for edge cases),
 * guardrail (an override that blocks public exposure), delegation (a temporary,
 * signed grant).
 */
export type LayerStatus = "recommended" | "legacy" | "guardrail" | "delegation";

export interface AccessLayer {
  id: string;
  /** The mechanism name, e.g. "Bucket policy". */
  name: string;
  status: LayerStatus;
  /** What the mechanism is attached to. */
  attachesTo: string;
  /** What it can grant, and how far it reaches. */
  scope: string;
  /** Its state on a brand-new bucket or account. */
  default: string;
  body: string;
}

export interface AccessLayersContent {
  /** Plain-language statement of the default security posture. */
  defaultPosture: string;
  layers: AccessLayer[];
  /** A bridge line into the decision chapter. */
  note: string;
  callouts: CalloutData[];
}

/* ---------------------- Chapter 3 · access decision ----------------------- */

/** One mechanism's contribution to a decision, colored by its effect. */
export interface DecisionInput {
  layer: string;
  /** The mechanism's state in this scenario, e.g. "Allows s3:GetObject". */
  state: string;
  effect: "allow" | "deny" | "neutral";
}

export interface DecisionScenario {
  id: string;
  label: string;
  /** The request being attempted, in one line. */
  request: string;
  inputs: DecisionInput[];
  allowed: boolean;
  /** Which layer produced the outcome. */
  decidedBy: string;
  /** Short outcome, e.g. "Allowed" or "Denied". */
  verdict: string;
  why: string;
}

export interface AccessDecisionContent {
  /** The evaluation rule this provider applies. */
  rule: string;
  scenarios: DecisionScenario[];
  callouts: CalloutData[];
}

/* -------------------------- Chapter 4 · lifecycle ------------------------- */

export interface LifecycleStep {
  /** A point in the object's life, e.g. "Day 0". */
  day: string;
  /** What the rule does at this point, e.g. "Transition to Cool". */
  action: string;
  /** The tier the object sits in after this step. */
  tier: string;
  tone: Tone;
  /** Illustrative relative monthly storage cost, 1 = the hottest tier. */
  costRel: number;
  note: string;
}

export interface LifecycleContent {
  ruleSummary: string;
  /** What the provider calls the rule set. */
  policyLabel: string;
  steps: LifecycleStep[];
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 5 · quiz ---------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/* ------------------------------ The bundle -------------------------------- */

export interface LessonContent {
  chapters: ChapterMeta[];
  namespace: NamespaceContent;
  tiers: TiersContent;
  accessLayers: AccessLayersContent;
  accessDecision: AccessDecisionContent;
  lifecycle: LifecycleContent;
  quiz: QuizQ[];
}

/* ================================ AWS ==================================== */

const AWS: LessonContent = {
  chapters: [
    {
      navLabel: "namespace",
      kicker: "Chapter 1",
      title: "Buckets, objects, and the folder illusion",
      intro:
        "Object storage is not a filesystem. You put objects into a bucket, each under a unique key, and that is the whole structure: one flat namespace. The folders you see in the console are a trick played with the key names. Explore both views to see it.",
    },
    {
      navLabel: "tiers",
      kicker: "Chapter 2",
      title: "Storage classes: cost against access",
      intro:
        "Not all data is read equally often. S3 lets you set a storage class per object, trading cheaper storage for slower or costlier retrieval. Walk the ladder from frequent access down to deep archive.",
    },
    {
      navLabel: "access",
      kicker: "Chapter 3",
      title: "The layers of access",
      intro:
        "A new bucket is private: public access blocked, ACLs off. Access is then built from a few separate layers, each attached to something different. Explore what each one is and when to reach for it.",
    },
    {
      navLabel: "decision",
      kicker: "Chapter 4",
      title: "How a request is decided",
      intro:
        "Those layers do not act alone. S3 combines them into a single yes or no with one firm rule: an explicit deny always wins. Run a few requests and watch which layer decides.",
    },
    {
      navLabel: "lifecycle",
      kicker: "Chapter 5",
      title: "Letting objects age on their own",
      intro:
        "You rarely move objects by hand. A lifecycle configuration ages them automatically: hot at first, cooler as access drops, and finally expired. Step an object through its life.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Twelve questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  namespace: {
    containerTerm: "Bucket",
    containerName: "amzn-s3-demo-media",
    containerSub: "one flat namespace, globally named",
    objectTerm: "Object",
    keyTerm: "Key",
    delimiter: "/",
    urlTemplate: "https://amzn-s3-demo-media.s3.us-east-1.amazonaws.com/{key}",
    objects: [
      { key: "index.html", size: "4 KB" },
      { key: "photos/2024/aria.jpg", size: "2.4 MB" },
      { key: "photos/2024/leo.jpg", size: "3.1 MB" },
      { key: "photos/2023/trip.jpg", size: "1.8 MB" },
      { key: "logs/app-2024-06.log", size: "820 KB" },
    ],
    hint: "Switch between the flat and folder views. The folder tree is built entirely from the slashes in the keys on the left.",
    note: "The bucket has no real directories. The console renders a tree by splitting each key on the / delimiter, but S3 stores a flat list of keys.",
    cli: "aws s3 cp aria.jpg s3://amzn-s3-demo-media/photos/2024/aria.jpg",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "S3 has folders.",
        body: "It does not. photos/2024/ is just a shared prefix on object keys. When you create a folder in the console, S3 writes a zero-byte object whose key ends in a slash. Deleting every object under a prefix makes the folder disappear, because it was never a real container.",
      },
      {
        kind: "note",
        tag: "Naming",
        title: "The bucket name is the globally unique part.",
        body: "A bucket name must be unique across all AWS accounts and Regions (within a partition), 3 to 63 characters, and DNS-compliant, because it appears in the hostname of the object URL. The key can then be any path-like string you like.",
      },
    ],
  },
  tiers: {
    label: "Storage class",
    tiers: [
      {
        id: "standard",
        name: "S3 Standard",
        tone: "frequent",
        tagline: "Frequent access, millisecond reads.",
        storageRel: 1,
        facts: [
          { label: "Retrieval", value: "Milliseconds" },
          { label: "Placement", value: "3+ Availability Zones" },
          { label: "Retrieval fee", value: "None" },
        ],
        use: "Active data: websites, apps, content being served right now.",
      },
      {
        id: "intelligent",
        name: "S3 Intelligent-Tiering",
        tone: "auto",
        tagline: "Unknown or changing access, tiered for you.",
        storageRel: 1,
        facts: [
          { label: "Retrieval", value: "Milliseconds" },
          { label: "Placement", value: "3+ Availability Zones" },
          { label: "Tiering", value: "Automatic by access" },
        ],
        use: "Data with unpredictable patterns you do not want to manage by hand.",
      },
      {
        id: "standard-ia",
        name: "S3 Standard-IA",
        tone: "infrequent",
        tagline: "Infrequent access, still millisecond reads.",
        storageRel: 0.55,
        facts: [
          { label: "Retrieval", value: "Milliseconds" },
          { label: "Placement", value: "3+ Availability Zones" },
          { label: "Retrieval fee", value: "Per GB" },
        ],
        use: "Data you keep but read rarely, and still need back instantly.",
      },
      {
        id: "onezone-ia",
        name: "S3 One Zone-IA",
        tone: "infrequent",
        tagline: "Infrequent access in a single zone.",
        storageRel: 0.44,
        facts: [
          { label: "Retrieval", value: "Milliseconds" },
          { label: "Placement", value: "Single Availability Zone" },
          { label: "Retrieval fee", value: "Per GB" },
        ],
        use: "Re-creatable infrequent data where single-zone risk is acceptable.",
      },
      {
        id: "glacier-ir",
        name: "S3 Glacier Instant Retrieval",
        tone: "archive",
        tagline: "Archive price, instant reads.",
        storageRel: 0.18,
        facts: [
          { label: "Retrieval", value: "Milliseconds" },
          { label: "Placement", value: "3+ Availability Zones" },
          { label: "Retrieval fee", value: "Per GB" },
        ],
        use: "Archives read maybe once a quarter but needed immediately.",
      },
      {
        id: "glacier-flex",
        name: "S3 Glacier Flexible Retrieval",
        tone: "archive",
        tagline: "Cheap archive, restore before reading.",
        storageRel: 0.15,
        facts: [
          { label: "Retrieval", value: "Minutes to hours (restore first)" },
          { label: "Placement", value: "3+ Availability Zones" },
        ],
        use: "Backups and archives you can wait minutes or hours to restore.",
      },
      {
        id: "glacier-deep",
        name: "S3 Glacier Deep Archive",
        tone: "archive",
        tagline: "Lowest cost, hours to restore.",
        storageRel: 0.04,
        facts: [
          { label: "Retrieval", value: "Hours (restore first)" },
          { label: "Placement", value: "3+ Availability Zones" },
        ],
        use: "Long-term retention and compliance data touched once a year or less.",
      },
    ],
    note: "Bars show illustrative relative storage price, not a quote. Colder classes store cheaply but add a retrieval fee, retrieval delay, or both. S3 also offers S3 Express One Zone, a high-performance single-zone class for latency-sensitive workloads rather than a step on this cost ladder.",
    callouts: [
      {
        kind: "fix",
        tag: "Durability",
        title: "Every class is designed for eleven 9s of durability.",
        body: "S3 is designed for 99.999999999% durability of objects over a year. The classes differ in how many Availability Zones hold the data and how fast you can read it, not in how safely it is stored: One Zone-IA and Express One Zone use a single zone, the rest span three or more.",
      },
    ],
  },
  accessLayers: {
    defaultPosture:
      "Private by default. A new bucket blocks public access and has ACLs disabled, so nothing is reachable until you deliberately grant it. Access is assembled from a few separate layers, each attached to something different.",
    layers: [
      {
        id: "iam",
        name: "IAM identity policy",
        status: "recommended",
        attachesTo: "An IAM user, group, or role",
        scope: "Any bucket or object the statements name, in this account",
        default: "No permissions until granted",
        body: "A JSON policy on the identity that says what that principal may do. This is how you grant your own users, roles, and services access to S3.",
      },
      {
        id: "bucket-policy",
        name: "Bucket policy",
        status: "recommended",
        attachesTo: "The bucket itself (resource-based)",
        scope:
          "The bucket and its objects, via the bucket/* ARN; can grant other AWS accounts",
        default: "None until you add one",
        body: "A JSON policy on the bucket, in the same grammar as IAM. It is the usual way to state broad rules for a whole bucket or to grant cross-account access.",
      },
      {
        id: "acl",
        name: "Object & bucket ACL",
        status: "legacy",
        attachesTo: "A bucket or an individual object",
        scope: "Grants to specific accounts or predefined groups",
        default: "Disabled (Object Ownership: bucket owner enforced)",
        body: "The original S3 access mechanism. AWS now disables ACLs by default and steers you to policies; they remain only for the rare need to control access object by object.",
      },
      {
        id: "bpa",
        name: "Block Public Access",
        status: "guardrail",
        attachesTo: "The account, bucket, or access point",
        scope: "Four switches that block public-granting ACLs and policies",
        default: "On for new buckets",
        body: "A guardrail that overrides everything else: if a setting forbids public access, S3 refuses the request even when a policy or ACL would have allowed it.",
      },
      {
        id: "presigned",
        name: "Presigned URL",
        status: "delegation",
        attachesTo: "A single link you generate on demand",
        scope: "One object and operation, for a limited time",
        default: "Created when you need one",
        body: "Not a policy but a delegation: a link signed with your own credentials that lets the holder act as you for a while, up to 12 hours from the console or 7 days from the CLI and SDKs.",
      },
    ],
    note: "These layers are evaluated together, not in isolation. The next chapter walks through how S3 turns them into one yes or no.",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "S3 has a separate per-object policy.",
        body: "It does not. To control a single object you write a bucket policy or IAM statement whose resource ARN points at that key (for example bucket/photos/*), or, in the rare legacy case, set an object ACL. The only thing attached to an individual object is its ACL, not a policy document.",
      },
    ],
  },
  accessDecision: {
    rule: "S3 starts from an implicit deny. An explicit Deny in any policy always wins. Otherwise the request is allowed if any identity or resource policy allows it, and Block Public Access is checked first, overriding everything for public requests.",
    scenarios: [
      {
        id: "anon-plain",
        label: "Anonymous read, new bucket",
        request: "GET an object URL with no credentials",
        inputs: [
          { layer: "Block Public Access", state: "On", effect: "deny" },
          { layer: "Bucket policy", state: "None", effect: "neutral" },
          { layer: "Object ACL", state: "Disabled", effect: "neutral" },
        ],
        allowed: false,
        decidedBy: "Block Public Access",
        verdict: "Denied",
        why: "Nothing grants public access, and Block Public Access would override it anyway. The anonymous request is refused.",
      },
      {
        id: "iam-allow",
        label: "Your role reads an object",
        request: "GetObject as a role with s3:GetObject allowed",
        inputs: [
          {
            layer: "IAM identity policy",
            state: "Allows s3:GetObject",
            effect: "allow",
          },
          { layer: "Explicit deny", state: "None", effect: "neutral" },
        ],
        allowed: true,
        decidedBy: "IAM identity policy",
        verdict: "Allowed",
        why: "An identity policy allows the action and no policy denies it, so the request is authorized.",
      },
      {
        id: "explicit-deny",
        label: "Allowed by IAM, denied by bucket policy",
        request: "GetObject as a role the bucket policy explicitly denies",
        inputs: [
          {
            layer: "IAM identity policy",
            state: "Allows s3:GetObject",
            effect: "allow",
          },
          { layer: "Bucket policy", state: "Explicit Deny", effect: "deny" },
        ],
        allowed: false,
        decidedBy: "Explicit Deny (bucket policy)",
        verdict: "Denied",
        why: "An explicit Deny always wins, even when another policy allows the same action. The request is refused.",
      },
      {
        id: "cross-account",
        label: "Another account uploads",
        request: "PutObject from a different AWS account",
        inputs: [
          {
            layer: "Bucket policy",
            state: "Allows the other account",
            effect: "allow",
          },
          {
            layer: "Their IAM policy",
            state: "Allows s3:PutObject",
            effect: "allow",
          },
        ],
        allowed: true,
        decidedBy: "Bucket policy + their IAM",
        verdict: "Allowed",
        why: "Cross-account access needs both sides to allow it: the other account's identity policy and this bucket's policy. Both do, so it succeeds.",
      },
      {
        id: "presigned",
        label: "Presigned URL",
        request: "GET a presigned URL before it expires",
        inputs: [
          {
            layer: "Presigned signature",
            state: "Valid, from an allowed principal",
            effect: "allow",
          },
        ],
        allowed: true,
        decidedBy: "Presigned URL",
        verdict: "Allowed",
        why: "The URL is signed with the credentials of a principal allowed to read the object and has not expired, so the holder gets it without their own AWS account.",
      },
    ],
    callouts: [
      {
        kind: "fix",
        tag: "The rule that trips people",
        title: "One explicit Deny beats every Allow.",
        body: "S3 does not add up allows and denies. If any applicable policy has an explicit Deny for the action, the request is denied no matter how many other policies allow it. Allows only decide the outcome when there is no explicit deny.",
      },
    ],
  },
  lifecycle: {
    ruleSummary:
      "A lifecycle configuration is a set of rules that transition objects to cheaper storage classes as they age and expire them when they are no longer needed. No code runs; S3 applies the rules for you.",
    policyLabel: "Lifecycle configuration",
    steps: [
      {
        day: "Day 0",
        action: "Uploaded to S3 Standard",
        tier: "S3 Standard",
        tone: "frequent",
        costRel: 1,
        note: "Fresh data is accessed often, so it starts in the frequent-access class with instant reads.",
      },
      {
        day: "Day 30",
        action: "Transition to Standard-IA",
        tier: "S3 Standard-IA",
        tone: "infrequent",
        costRel: 0.55,
        note: "Access has dropped. A transition rule moves the object to infrequent-access storage: cheaper to keep, still instant to read.",
      },
      {
        day: "Day 90",
        action: "Transition to Glacier Flexible Retrieval",
        tier: "S3 Glacier Flexible Retrieval",
        tone: "archive",
        costRel: 0.15,
        note: "Now rarely touched, it is archived. Storage is cheap, but reading it now requires a restore that takes minutes to hours.",
      },
      {
        day: "Day 365",
        action: "Expire (delete)",
        tier: "Deleted",
        tone: "deny",
        costRel: 0,
        note: "An expiration action deletes the object once it is no longer needed, so you stop paying to store it.",
      },
    ],
    callouts: [
      {
        kind: "fix",
        tag: "Automatic, not manual",
        title: "You set the rules once; S3 does the moving.",
        body: "Lifecycle rules match objects by prefix, tag, or age and apply transitions and expirations on a schedule. It is the standard way to control storage cost at scale instead of re-uploading or copying objects by hand.",
      },
    ],
  },
  quiz: [
    {
      q: "How are folders represented in an S3 bucket?",
      opts: [
        "As real directories in a tree",
        "As a naming convention: keys share a prefix in a flat namespace",
        "As a separate folder service you enable",
        "As symbolic links between objects",
      ],
      answer: 1,
      explain:
        "The namespace is flat. photos/2024/ is just a shared key prefix; the console renders a tree by splitting keys on the / delimiter. A console folder is a zero-byte object whose key ends in a slash.",
    },
    {
      q: "You upload an object with the key reports/q1.pdf. What is the key?",
      opts: [
        "Just q1.pdf, the file name",
        "The folder reports",
        "The full string reports/q1.pdf, its unique id in the bucket",
        "A random id S3 assigns",
      ],
      answer: 2,
      explain:
        "The key is the object's unique identifier within the bucket: the entire reports/q1.pdf string, slashes included. There is no separate folder object.",
    },
    {
      q: "Two teams in different AWS accounts each try to create a bucket named acme-media. What happens?",
      opts: [
        "Both succeed; bucket names only need to be unique within an account",
        "Both succeed as long as they pick different Regions",
        "The second fails; a bucket name must be unique across all AWS accounts and Regions because it appears in the object URL hostname",
        "AWS silently renames the second bucket",
      ],
      answer: 2,
      explain:
        "A bucket name must be unique across all AWS accounts and Regions (within a partition), 3 to 63 characters and DNS-compliant, because it forms part of the hostname in the object URL. Only one account can hold a given name.",
    },
    {
      q: "You keep archive data read about once a quarter but need it back within milliseconds. Which class fits best?",
      opts: [
        "S3 Standard",
        "S3 Glacier Deep Archive",
        "S3 Glacier Instant Retrieval",
        "S3 One Zone-IA",
      ],
      answer: 2,
      explain:
        "S3 Glacier Instant Retrieval is designed for archive data that is rarely accessed but must be retrieved immediately, with millisecond reads across three or more Availability Zones.",
    },
    {
      q: "What durability is Amazon S3 designed for?",
      opts: [
        "Ninety-nine percent",
        "Three 9s (99.9%)",
        "Eleven 9s (99.999999999%)",
        "It depends on the Region",
      ],
      answer: 2,
      explain:
        "S3 is designed for 99.999999999% durability of objects over a year across its storage classes. Classes differ in how many Availability Zones hold the data and how fast you can read it, not in designed durability.",
    },
    {
      q: "You have infrequently accessed data you could re-create if it were lost, and you accept it living in a single Availability Zone. Which class matches that trade-off?",
      opts: [
        "S3 Standard-IA",
        "S3 One Zone-IA",
        "S3 Standard",
        "S3 Glacier Deep Archive",
      ],
      answer: 1,
      explain:
        "S3 One Zone-IA stores the data in a single Availability Zone rather than three or more, which suits re-creatable infrequent data where single-zone risk is acceptable. Both it and Standard-IA still read in milliseconds.",
    },
    {
      q: "An object sits in S3 Glacier Flexible Retrieval and a user asks to read it right now. What happens?",
      opts: [
        "It returns in milliseconds, the same as S3 Standard",
        "You must restore it first, which takes minutes to hours, before it can be read",
        "The request fails permanently",
        "S3 automatically upgrades it to Standard and serves it",
      ],
      answer: 1,
      explain:
        "Glacier Flexible Retrieval requires a restore before reading, taking minutes to hours. Glacier Instant Retrieval, by contrast, reads in milliseconds without a restore.",
    },
    {
      q: "A bucket policy grants public read on an object, but Block Public Access is on for the bucket. Can an anonymous user read it?",
      opts: [
        "Yes, the bucket policy grants the access",
        "No, Block Public Access overrides the policy and refuses the public request",
        "Yes, but only over HTTPS",
        "Only if object ACLs are enabled",
      ],
      answer: 1,
      explain:
        "Block Public Access is a guardrail that overrides everything else. If a setting forbids public access, S3 refuses the request even when a policy or ACL would have allowed it.",
    },
    {
      q: "You need to let someone with no AWS account download one private object for the next hour. What is the right tool?",
      opts: [
        "Turn off Block Public Access for the bucket",
        "Generate a presigned URL for that object",
        "Email them one of the account credentials",
        "Add an object ACL granting everyone read",
      ],
      answer: 1,
      explain:
        "A presigned URL is a delegation: a link signed with your credentials that lets the holder act as you for a limited time, up to 12 hours from the console or 7 days from the CLI and SDKs, for one object and operation.",
    },
    {
      q: "On a brand-new bucket, someone pastes the plain object URL into a browser. What happens by default?",
      opts: [
        "It downloads, URLs are public",
        "It is denied; objects are private and Block Public Access is on",
        "It prompts for an AWS password",
        "It downloads only on the same network",
      ],
      answer: 1,
      explain:
        "New buckets are private with Block Public Access enabled, so an anonymous plain-URL request is denied. Share a single object with a presigned URL instead.",
    },
    {
      q: "An IAM policy allows s3:GetObject for a role, but a bucket policy has an explicit Deny for that action and principal. What is the result?",
      opts: [
        "Allowed; the allow and the deny cancel out",
        "Allowed; IAM identity policies outrank bucket policies",
        "Denied; an explicit Deny always wins over any Allow",
        "It depends on which policy was written first",
      ],
      answer: 2,
      explain:
        "S3 does not add up allows and denies. If any applicable policy has an explicit Deny for the action, the request is denied no matter how many other policies allow it.",
    },
    {
      q: "You want objects to move to colder storage classes as they age and be deleted after a year, without writing code or copying files by hand. What do you configure?",
      opts: [
        "A cron job on an EC2 instance that copies objects around",
        "A lifecycle configuration: rules that transition and expire objects on a schedule",
        "You move each object in the console yourself",
        "A presigned URL for each object",
      ],
      answer: 1,
      explain:
        "A lifecycle configuration matches objects by prefix, tag, or age and applies transitions and expirations automatically. No code runs; S3 applies the rules for you.",
    },
  ],
};

/* =============================== Azure =================================== */

const AZURE: LessonContent = {
  chapters: [
    {
      navLabel: "namespace",
      kicker: "Chapter 1",
      title: "Accounts, containers, and the folder illusion",
      intro:
        "Blob storage is not a filesystem. A storage account holds containers, a container holds blobs, and each blob has a name that is unique in the container: one flat namespace. The folders you see are a trick played with the blob names. Explore both views to see it.",
    },
    {
      navLabel: "tiers",
      kicker: "Chapter 2",
      title: "Access tiers: cost against access",
      intro:
        "Not all data is read equally often. Azure lets you set an access tier per blob, trading cheaper storage for costlier or slower retrieval. Walk the ladder from hot down to offline archive.",
    },
    {
      navLabel: "access",
      kicker: "Chapter 3",
      title: "The layers of access",
      intro:
        "A new storage account is private: anonymous access is off. Access is then built from a few separate mechanisms, one of which authorizes each request. Explore what each one is and when to reach for it.",
    },
    {
      navLabel: "decision",
      kicker: "Chapter 4",
      title: "How a request is decided",
      intro:
        "Each request is authorized by exactly one mechanism, and account-level switches act as hard denies. Run a few requests and watch which mechanism decides.",
    },
    {
      navLabel: "lifecycle",
      kicker: "Chapter 5",
      title: "Letting blobs age on their own",
      intro:
        "You rarely move blobs by hand. A lifecycle management policy ages them automatically: hot at first, cooler as access drops, and finally deleted. Step a blob through its life.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Twelve questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  namespace: {
    account: {
      term: "Storage account",
      name: "acmemedia",
      sub: "globally unique, the URL host",
    },
    containerTerm: "Container",
    containerName: "media",
    containerSub: "one flat namespace of blobs",
    objectTerm: "Blob",
    keyTerm: "Blob name",
    delimiter: "/",
    urlTemplate: "https://acmemedia.blob.core.windows.net/media/{key}",
    objects: [
      { key: "index.html", size: "4 KB" },
      { key: "photos/2024/aria.jpg", size: "2.4 MB" },
      { key: "photos/2024/leo.jpg", size: "3.1 MB" },
      { key: "photos/2023/trip.jpg", size: "1.8 MB" },
      { key: "logs/app-2024-06.log", size: "820 KB" },
    ],
    hint: "Switch between the flat and folder views. The folder tree is built entirely from the slashes in the blob names on the left.",
    note: "The container has no real directories by default. The portal renders a tree by splitting each blob name on the / delimiter, but the container stores a flat list of blobs.",
    cli: "az storage blob upload --account-name acmemedia --container-name media --name photos/2024/aria.jpg --file aria.jpg --auth-mode login",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Blob containers have folders.",
        body: "By default they do not. photos/2024/ is just a virtual directory: a shared prefix on blob names split by the / delimiter. To get real directories with atomic rename and delete, enable the hierarchical namespace (Azure Data Lake Storage Gen2) on the account, which cannot be turned off later.",
      },
      {
        kind: "note",
        tag: "Naming",
        title: "The storage account name is the globally unique part.",
        body: "The account name must be globally unique across Azure, 3 to 24 lowercase alphanumeric characters, because it forms the host acmemedia.blob.core.windows.net. Container names only need to be unique within the account, and the blob name can be any path-like string.",
      },
    ],
  },
  tiers: {
    label: "Access tier",
    tiers: [
      {
        id: "hot",
        name: "Hot",
        tone: "frequent",
        tagline: "Frequent access, lowest access cost.",
        storageRel: 1,
        facts: [
          { label: "Read", value: "Immediate" },
          { label: "Access cost", value: "Lowest" },
          { label: "Minimum stay", value: "None" },
        ],
        use: "Active data in regular use: apps, content being served now.",
      },
      {
        id: "cool",
        name: "Cool",
        tone: "infrequent",
        tagline: "Infrequent access, still online.",
        storageRel: 0.5,
        facts: [
          { label: "Read", value: "Immediate" },
          { label: "Minimum stay", value: "30 days" },
          { label: "Access cost", value: "Higher than Hot" },
        ],
        use: "Short-term backups and data read only now and then.",
      },
      {
        id: "cold",
        name: "Cold",
        tone: "archive",
        tagline: "Rarely accessed, still online.",
        storageRel: 0.25,
        facts: [
          { label: "Read", value: "Immediate" },
          { label: "Minimum stay", value: "90 days" },
          { label: "Access cost", value: "Higher than Cool" },
        ],
        use: "Rarely read data you still want back instantly, without rehydration.",
      },
      {
        id: "archive",
        name: "Archive",
        tone: "archive",
        tagline: "Offline, cheapest, rehydrate to read.",
        storageRel: 0.09,
        facts: [
          { label: "Read", value: "Rehydrate first (up to ~15 h)" },
          { label: "Minimum stay", value: "180 days" },
          { label: "State", value: "Offline" },
        ],
        use: "Long-term retention you can wait hours to bring back online.",
      },
    ],
    note: "Bars show illustrative relative storage price, not a quote. Colder tiers store cheaply but raise access costs, and Archive is offline until rehydrated. The access tier (cost vs access) is largely separate from the redundancy option (where copies live): the online tiers pair with any redundancy, though Archive is supported only on LRS, GRS, and RA-GRS.",
    callouts: [
      {
        kind: "fix",
        tag: "Two separate choices",
        title: "Tier and redundancy are mostly independent in Azure.",
        body: "The access tier controls cost against access frequency. The redundancy option (LRS, ZRS, GRS, GZRS) controls how many copies exist and where: LRS keeps three copies in one datacenter (at least eleven 9s of durability), while geo-redundant options copy to a second region for far more. You pick both, with one constraint: the Archive tier is supported only on LRS, GRS, and RA-GRS.",
      },
    ],
  },
  accessLayers: {
    defaultPosture:
      "Private by default. A new storage account disables anonymous access, so nothing is reachable until you deliberately grant it. Access is assembled from a few separate mechanisms, one of which authorizes each request.",
    layers: [
      {
        id: "rbac",
        name: "Microsoft Entra ID + Azure RBAC",
        status: "recommended",
        attachesTo: "A role assignment on the account, container, or group",
        scope: "The blobs under that scope, per the role",
        default: "No data access until a role is assigned",
        body: "The recommended path. You authenticate with Entra ID and hold a data role such as Storage Blob Data Reader or Contributor. Managed identities let services authenticate with no secrets to store.",
      },
      {
        id: "abac",
        name: "Azure ABAC conditions",
        status: "recommended",
        attachesTo: "An RBAC role assignment",
        scope: "Narrows the role using attributes like blob path or tags",
        default: "No conditions (role applies as-is)",
        body: "Attribute-based conditions layered on a role assignment, for example allow read only where a blob has the tag Project=Sierra. It sharpens RBAC without creating more roles.",
      },
      {
        id: "shared-key",
        name: "Shared Key (account keys)",
        status: "legacy",
        attachesTo: "The whole storage account",
        scope: "Full access to all data in the account",
        default: "Allowed unless you disable it",
        body: "The two account keys grant complete access to everything. Microsoft recommends disabling Shared Key (AllowSharedKeyAccess = false) and using Entra ID instead.",
      },
      {
        id: "sas",
        name: "Shared access signature (SAS)",
        status: "delegation",
        attachesTo: "A signed URL you generate on demand",
        scope: "The resources, permissions, and window you specify",
        default: "Created when you need one",
        body: "Delegated, time-limited access in three forms: a user delegation SAS signed with Entra credentials (recommended), and service and account SAS signed with an account key.",
      },
      {
        id: "anonymous",
        name: "Anonymous public access",
        status: "guardrail",
        attachesTo: "The account, then each container",
        scope:
          "Account toggle over the container access level (private, blob, container)",
        default: "Disabled at the account for new accounts",
        body: "An account-level switch that overrides each container's access level. While it is off, no blob is readable without a credential, whatever a container is set to.",
      },
    ],
    note: "Like S3, there is no per-blob policy document. Per-blob granularity comes from the RBAC scope plus ABAC conditions on attributes and tags. The next chapter walks through how a request is authorized.",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "You grant access on each individual blob.",
        body: "You usually do not. Access is a role assigned at the account or container scope, optionally narrowed with an ABAC condition on the blob's path or tags. There is no policy document attached to an individual blob.",
      },
    ],
  },
  accessDecision: {
    rule: "Each request is authorized by exactly one mechanism: Entra ID (RBAC and ABAC), a SAS, Shared Key, or anonymous read. Account-level switches act as hard denies: turning off Shared Key or anonymous access blocks those paths whatever a container or SAS says.",
    scenarios: [
      {
        id: "anon-plain",
        label: "Anonymous read, new account",
        request: "GET a blob URL with no credentials",
        inputs: [
          {
            layer: "Anonymous access",
            state: "Disabled at account",
            effect: "deny",
          },
          {
            layer: "Container access level",
            state: "Private",
            effect: "neutral",
          },
        ],
        allowed: false,
        decidedBy: "Anonymous access (account)",
        verdict: "Denied",
        why: "Anonymous access is off at the account level, which overrides any container setting. With no credential, the request is refused.",
      },
      {
        id: "rbac",
        label: "A user with a data role",
        request: "Read as a principal with Storage Blob Data Reader",
        inputs: [
          { layer: "Entra ID", state: "Authenticated", effect: "allow" },
          {
            layer: "Azure RBAC",
            state: "Storage Blob Data Reader",
            effect: "allow",
          },
        ],
        allowed: true,
        decidedBy: "Entra ID + RBAC",
        verdict: "Allowed",
        why: "The principal is authenticated with Entra ID and holds a role granting blob read, so the request is authorized. This is the recommended path.",
      },
      {
        id: "abac-deny",
        label: "Right role, wrong tag",
        request: "Read a blob as a Reader whose role has an ABAC condition",
        inputs: [
          {
            layer: "Azure RBAC",
            state: "Storage Blob Data Reader",
            effect: "allow",
          },
          {
            layer: "ABAC condition",
            state: "Requires tag Project=Sierra; blob lacks it",
            effect: "deny",
          },
        ],
        allowed: false,
        decidedBy: "ABAC condition",
        verdict: "Denied",
        why: "The role would allow the read, but the ABAC condition on the assignment is not met for this blob, so access is denied.",
      },
      {
        id: "sas",
        label: "SAS URL",
        request: "GET a blob URL with a valid SAS before it expires",
        inputs: [
          {
            layer: "SAS token",
            state: "Valid, read permission",
            effect: "allow",
          },
        ],
        allowed: true,
        decidedBy: "SAS",
        verdict: "Allowed",
        why: "The SAS grants read on this blob until its expiry, so the holder gets it without an Azure identity.",
      },
      {
        id: "shared-key-off",
        label: "Account key after disabling Shared Key",
        request: "Access using the account key with Shared Key disabled",
        inputs: [
          {
            layer: "Shared Key",
            state: "Disabled at account",
            effect: "deny",
          },
        ],
        allowed: false,
        decidedBy: "Shared Key disabled (account)",
        verdict: "Denied",
        why: "With AllowSharedKeyAccess off, any Shared-Key request is rejected, as are the service and account SAS the key signs. Use Entra ID or a user delegation SAS instead.",
      },
    ],
    callouts: [
      {
        kind: "fix",
        tag: "The switch that trips people",
        title: "Account toggles override everything below them.",
        body: "Disabling anonymous access or Shared Key at the account level is a hard deny: it does not matter what a container's access level or a key-signed SAS would allow. Only Entra ID and a user delegation SAS survive Shared Key being turned off.",
      },
    ],
  },
  lifecycle: {
    ruleSummary:
      "A lifecycle management policy is a set of rules that move blobs to cooler tiers as they age and delete them when they are no longer needed. No code runs; Azure applies the rules for you.",
    policyLabel: "Lifecycle management policy",
    steps: [
      {
        day: "Day 0",
        action: "Uploaded to Hot",
        tier: "Hot",
        tone: "frequent",
        costRel: 1,
        note: "Fresh data is accessed often, so it starts in the Hot tier with immediate reads and the lowest access cost.",
      },
      {
        day: "Day 30",
        action: "Tier to Cool",
        tier: "Cool",
        tone: "infrequent",
        costRel: 0.5,
        note: "Access has dropped. A rule moves the blob to Cool: cheaper storage, still online, with a 30-day minimum stay.",
      },
      {
        day: "Day 180",
        action: "Tier to Archive",
        tier: "Archive",
        tone: "archive",
        costRel: 0.09,
        note: "Now rarely touched, it moves to Archive: the cheapest tier, but offline. A read now requires rehydrating it to an online tier first.",
      },
      {
        day: "Day 365",
        action: "Delete",
        tier: "Deleted",
        tone: "deny",
        costRel: 0,
        note: "A delete action removes the blob once it is no longer needed, so you stop paying to store it.",
      },
    ],
    callouts: [
      {
        kind: "fix",
        tag: "Automatic, not manual",
        title: "You set the rules once; Azure does the moving.",
        body: "Lifecycle rules match blobs by prefix, blob type, or age, and apply tiering and deletion on a schedule. It is the standard way to control storage cost at scale instead of moving blobs by hand.",
      },
    ],
  },
  quiz: [
    {
      q: "How are folders represented in a blob container by default?",
      opts: [
        "As real directories in a tree",
        "As virtual directories: a shared prefix on blob names split by the / delimiter",
        "As a separate folder service you enable",
        "As symbolic links between blobs",
      ],
      answer: 1,
      explain:
        "By default the namespace is flat. photos/2024/ is a virtual directory built from the / delimiter. Real directories with atomic rename and delete require enabling the hierarchical namespace (Azure Data Lake Storage Gen2), which cannot be turned off later.",
    },
    {
      q: "What is the correct containment order in Azure Blob Storage?",
      opts: [
        "Container → storage account → blob",
        "Storage account → container → blob",
        "Blob → container → storage account",
        "Storage account → blob → container",
      ],
      answer: 1,
      explain:
        "A storage account holds containers, and a container holds blobs. The storage account is the extra layer S3 has no equivalent of: it is the endpoint and redundancy boundary above the container.",
    },
    {
      q: "Two teams in different Azure subscriptions each try to create a storage account named acmemedia. What happens?",
      opts: [
        "Both succeed; account names only need to be unique within a subscription",
        "Both succeed as long as they pick different regions",
        "The second fails; the account name must be globally unique across Azure because it forms the URL host",
        "Azure silently appends random digits to the second name",
      ],
      answer: 2,
      explain:
        "The account name forms the host acmemedia.blob.core.windows.net, so it must be globally unique across Azure, 3 to 24 lowercase alphanumeric characters. Container names only need to be unique within the account.",
    },
    {
      q: "You have data read only rarely, but when it is read it must return immediately with no rehydration. Which online tier fits?",
      opts: ["Hot", "Cool", "Cold", "Archive"],
      answer: 2,
      explain:
        "Cold is online with immediate reads for rarely accessed data, so nothing needs rehydrating. Archive is offline and requires rehydration; Hot and Cool suit more frequent access.",
    },
    {
      q: "With Locally Redundant Storage (LRS), how many copies of your data exist and where?",
      opts: [
        "A single copy in one datacenter",
        "Three copies in a single datacenter, designed for at least eleven 9s of durability",
        "Three copies spread across two regions",
        "One copy in every Azure region",
      ],
      answer: 1,
      explain:
        "LRS keeps three copies in one datacenter, designed for at least eleven 9s of durability. Geo-redundant options such as GRS and GZRS copy to a second region for far more.",
    },
    {
      q: "In Azure, the access tier and the redundancy option are:",
      opts: [
        "The same setting under two names",
        "Chosen independently: the tier trades storage cost against access, redundancy sets where copies live",
        "Both fixed once the account is created",
        "Only available on the Hot tier",
      ],
      answer: 1,
      explain:
        "They are separate choices. The access tier (Hot, Cool, Cold, Archive) trades storage cost against access frequency, while the redundancy option (LRS, ZRS, GRS, GZRS) sets how many copies exist and where. The one constraint is that Archive is supported only on LRS, GRS, and RA-GRS.",
    },
    {
      q: "A blob is in the Archive tier and you need to read it. What must happen first?",
      opts: [
        "Nothing, Archive reads are immediate",
        "Rehydrate it to an online tier (Hot, Cool, or Cold)",
        "Move it to a different container",
        "Change the account redundancy",
      ],
      answer: 1,
      explain:
        "Archive is offline. Reading a blob from Archive requires rehydrating it to an online tier first, which can take up to about 15 hours. Cold, by contrast, is online and read immediately.",
    },
    {
      q: "A container's access level allows public blob read, but anonymous access is disabled at the storage account. Can an anonymous user read a blob?",
      opts: [
        "Yes, the container's access level grants it",
        "No, the account switch overrides the container; while anonymous access is off nothing is readable without a credential",
        "Yes, but only from inside Azure",
        "Only for blobs under a certain size",
      ],
      answer: 1,
      explain:
        "The account-level anonymous access switch overrides each container's access level. While it is off, no blob is readable without a credential, whatever a container is set to.",
    },
    {
      q: "You need to let someone with no Azure identity download one blob for the next hour. What is the right tool?",
      opts: [
        "Turn off anonymous access for the account",
        "Generate a shared access signature (SAS) for that blob",
        "Email them one of the account keys",
        "Assign them Storage Blob Data Reader",
      ],
      answer: 1,
      explain:
        "A SAS is delegated, time-limited access to exactly the resources, permissions, and window you specify. A user delegation SAS signed with Entra credentials is the recommended form.",
    },
    {
      q: "On a brand-new storage account, someone pastes the plain blob URL into a browser. What happens by default?",
      opts: [
        "It downloads, blob URLs are public",
        "It is denied; blobs are private and anonymous access is disabled",
        "It prompts for an Azure password",
        "It downloads only from inside Azure",
      ],
      answer: 1,
      explain:
        "New accounts disable anonymous public access and blobs are private, so an anonymous plain-URL request is denied. Share a single blob with a SAS URL instead.",
    },
    {
      q: "An app authenticates with an account key, but the account has AllowSharedKeyAccess set to false. What happens?",
      opts: [
        "It works; account keys always work",
        "It is rejected; disabling Shared Key is a hard deny for any key-signed request, including the service and account SAS the key signs",
        "It works, but read-only",
        "It works only from the portal",
      ],
      answer: 1,
      explain:
        "With Shared Key disabled, any Shared-Key request is rejected, as are the service and account SAS the key signs. Only Entra ID and a user delegation SAS survive.",
    },
    {
      q: "You want blobs to move to cooler tiers as they age and be deleted after a year, without writing code or moving blobs by hand. What do you configure?",
      opts: [
        "A scheduled function that copies blobs around",
        "A lifecycle management policy: rules that tier and delete blobs on a schedule",
        "Manual moves in the portal",
        "A SAS token for each blob",
      ],
      answer: 1,
      explain:
        "A lifecycle management policy matches blobs by prefix, blob type, or age and applies tiering and deletion automatically. No code runs; Azure applies the rules for you.",
    },
  ],
};

/* ================================ Export ================================= */

export const CONTENT: Record<Provider, LessonContent> = {
  aws: AWS,
  azure: AZURE,
};
