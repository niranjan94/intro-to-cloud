import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the DNS lesson. The interactive components
 * under this folder are provider-agnostic and read everything they render from
 * here, so the AWS and Azure lessons stay bespoke without duplicating the
 * interaction machinery.
 *
 * The two providers genuinely diverge in one large way: Amazon Route 53 bundles
 * authoritative DNS hosting and traffic routing (routing policies plus health
 * checks) into a single service, so a routing policy is an attribute of the
 * record itself. Azure splits the two: Azure DNS is authoritative hosting only,
 * and traffic routing lives in a separate service, Azure Traffic Manager, that a
 * DNS alias record set points at. They also differ in naming (hosted zone vs
 * DNS zone, record vs record set) and in what an alias record can target.
 *
 * Facts verified against the Amazon Route 53 Developer Guide
 * (docs.aws.amazon.com) and Microsoft Learn (learn.microsoft.com). Example IPs
 * use the documentation ranges (192.0.2.0/24, 203.0.113.0/24). Prose is neutral
 * and professional; no em dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* ------------------------- Chapter 0 · resolution ------------------------- */

/** Which node on the trace the resolver is talking to in this step. */
export type TracePeer = "device" | "root" | "tld" | "auth";

export interface TraceStep {
  peer: TracePeer;
  /** The question travelling out from the recursive resolver. */
  question: string;
  /** The answer or referral travelling back. */
  answer: string;
  /** One line explaining what just happened, shown in the log. */
  caption: string;
}

export interface ResolutionContent {
  /** The name being looked up, e.g. "www.example.com". */
  hostname: string;
  /** The final answer the authoritative server returns. */
  answer: string;
  /** The label for the authoritative tier, e.g. "Amazon Route 53". */
  authLabel: string;
  /** The zone-container noun, e.g. "public hosted zone". */
  authZone: string;
  /** A sample of the four assigned name servers. */
  authNameservers: string;
  steps: TraceStep[];
  callouts: CalloutData[];
}

/* --------------------------- Chapter 1 · records -------------------------- */

export interface RecordRow {
  /** The record type, e.g. "A" or "CNAME". */
  type: string;
  tone: Tone;
  /** One-line purpose. */
  purpose: string;
  /** An example record name relative to the zone. */
  exampleName: string;
  /** An example value for that record. */
  exampleValue: string;
  /** A short note, often provider-flavored. */
  note: string;
}

export interface RecordsContent {
  /** What this provider calls the container, e.g. "public hosted zone". */
  zoneNoun: string;
  /** What this provider calls a single entry, e.g. "record" or "record set". */
  recordNoun: string;
  /** The example domain the zone hosts. */
  zoneName: string;
  /** How records are grouped, one plain-language sentence. */
  grouping: string;
  rows: RecordRow[];
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 2 · apex ---------------------------- */

export type Verdict = "ok" | "warn" | "blocked";

export interface ApexMechanism {
  /** The mechanism tried, e.g. "CNAME record" or "Alias record". */
  label: string;
  verdict: Verdict;
  /** The short outcome, e.g. "Not allowed at the apex". */
  outcome: string;
  /** Why, in one or two sentences. */
  why: string;
}

export interface ApexTarget {
  id: string;
  /** What the apex should point at, e.g. "A load balancer's DNS name". */
  label: string;
  sub: string;
  mechanisms: ApexMechanism[];
}

export interface ApexContent {
  /** The naked/apex domain under test, e.g. "example.com". */
  domain: string;
  /** This provider's alias feature name. */
  aliasNoun: string;
  targets: ApexTarget[];
  callouts: CalloutData[];
}

/* --------------------------- Chapter 3 · routing -------------------------- */

export interface RoutingGoal {
  id: string;
  /** The operational goal, e.g. "Fail over to a standby". */
  goal: string;
  tone: Tone;
  /** The mechanism this provider uses to meet it. */
  mechanism: string;
  /** How it works, one or two sentences. */
  how: string;
}

export interface RoutingContent {
  /** The service that does traffic routing for this provider. */
  service: string;
  /** Where the routing decision lives, one plain sentence. */
  model: string;
  /** How health checking is expressed. */
  health: string;
  goals: RoutingGoal[];
  callouts: CalloutData[];
}

/* ----------------------------- Chapter 4 · ttl ---------------------------- */

export interface TtlPreset {
  /** Seconds. */
  ttl: number;
  label: string;
  /** When this TTL is the sensible choice. */
  use: string;
}

export interface TtlContent {
  recordName: string;
  oldValue: string;
  newValue: string;
  /** The TTL Azure/Route 53 applies by default when you omit one. */
  defaultTtl: number;
  presets: TtlPreset[];
  callouts: CalloutData[];
}

/* ----------------------------- Chapter 5 · quiz --------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  /** Index into opts. */
  answer: number;
  explain: string;
}

/* -------------------------------- Content --------------------------------- */

export interface LessonContent {
  chapters: ChapterMeta[];
  resolution: ResolutionContent;
  records: RecordsContent;
  apex: ApexContent;
  routing: RoutingContent;
  ttl: TtlContent;
  quiz: QuizQ[];
}

const CHAPTERS: ChapterMeta[] = [
  {
    navLabel: "Resolution",
    kicker: "Chapter 1 · How a name is found",
    title: "From a name to an address",
    intro:
      "A domain name is not stored in one place. Resolving it is a walk down a hierarchy, from the root to the top-level domain to the name servers that are authoritative for your zone. Step the query through each hop and watch the answer come back.",
  },
  {
    navLabel: "Records",
    kicker: "Chapter 2 · What lives in a zone",
    title: "The zone and its records",
    intro:
      "Once queries reach your name servers, what they find are records: typed entries that map a name to an address, a mail server, some text, or another name. Explore the common record types and how this provider organizes them.",
  },
  {
    navLabel: "Apex & alias",
    kicker: "Chapter 3 · The naked-domain problem",
    title: "Pointing the apex at a moving target",
    intro:
      "The single most common DNS mistake is trying to put a CNAME on the bare domain. The DNS standard forbids it, and every cloud has the same escape hatch: an alias record. Try each mechanism against a target and see which one is legal.",
  },
  {
    navLabel: "Routing",
    kicker: "Chapter 4 · Sending users to the right place",
    title: "One name, many answers",
    intro:
      "DNS can hand different users different answers to steer them to a failover, a nearby region, or a weighted split. This is where the two clouds diverge the most, so the mechanism shown is the one this provider actually uses.",
  },
  {
    navLabel: "TTL & caching",
    kicker: "Chapter 5 · Why changes are not instant",
    title: "TTL and the caching window",
    intro:
      "Resolvers cache every answer for its time-to-live. That is why a record change is not instant, and why lowering the TTL before a migration is the standard trick. Set a TTL, publish a change, and watch the stale window.",
  },
  {
    navLabel: "Quiz",
    kicker: "Chapter 6 · Check yourself",
    title: "Twelve questions",
    intro:
      "Twelve quick checks on the model you just built. Each reveals its answer and a short why as soon as you choose.",
  },
];

const RESOLUTION_CALLOUTS: CalloutData[] = [
  {
    kind: "myth",
    tag: "Common mix-up",
    title: "Your name servers do not do the walking.",
    body: "The recursive resolver (run by your ISP or your network) walks the hierarchy and caches each answer. Your provider's name servers are authoritative: they only answer for the zones they hold, and they do not resolve other names on your behalf.",
  },
  {
    kind: "fix",
    tag: "Delegation",
    title: "The parent zone points down with NS records.",
    body: "The registrar for the parent domain publishes NS records that name your zone's servers. Until those NS records point at the provider, the walk never reaches your zone, no matter what records you create inside it.",
  },
];

const RECORDS_CALLOUTS_AWS: CalloutData[] = [
  {
    kind: "note",
    tag: "Route 53 term",
    title: "A hosted zone holds the records.",
    body: "Public hosted zones answer on the internet; private hosted zones answer only inside associated VPCs. Creating a hosted zone auto-creates its NS and SOA records, and the NS record lists the four name servers assigned to the zone.",
  },
  {
    kind: "fix",
    tag: "Alias is not a CNAME",
    title: "Alias records are a Route 53 extension.",
    body: "An alias record points at an AWS resource such as a CloudFront distribution or a load balancer, works at the zone apex, and Route 53 does not charge for alias queries to AWS resources. Its TTL is taken from the target, not set by you.",
  },
];

const RECORDS_CALLOUTS_AZURE: CalloutData[] = [
  {
    kind: "note",
    tag: "Azure DNS term",
    title: "Records are grouped into record sets.",
    body: "A record set is every record in a zone with the same name and type, and the TTL is set on the set, not the individual record. SOA and CNAME sets can hold only one record, because the DNS standard forbids duplicates for those types.",
  },
  {
    kind: "fix",
    tag: "Alias record set",
    title: "An alias record set tracks an Azure resource.",
    body: "Alias record sets are available for A, AAAA, and CNAME. They point at a Standard SKU public IP, a Traffic Manager profile, a Front Door endpoint, or another record set, and they update automatically so you never leave a dangling record.",
  },
];

const APEX_CALLOUTS: CalloutData[] = [
  {
    kind: "myth",
    tag: "The classic error",
    title: '"I\'ll just CNAME the root at my load balancer."',
    body: "You cannot. A CNAME must be the only record for its name, but the apex must already carry the zone's SOA and NS records, so the two collide. Every registrar and resolver enforces this.",
  },
  {
    kind: "fix",
    tag: "The fix",
    title: "Alias records were built for exactly this.",
    body: "An alias record lives at the apex like an A record but resolves to a named cloud resource and follows it as its address changes. That is the supported way to put a bare domain in front of a load balancer, CDN, or traffic router.",
  },
];

const AWS_CONTENT: LessonContent = {
  chapters: CHAPTERS,
  resolution: {
    hostname: "www.example.com",
    answer: "A 203.0.113.10",
    authLabel: "Amazon Route 53",
    authZone: "public hosted zone",
    authNameservers: "ns-2048.awsdns-64.com and three more",
    steps: [
      {
        peer: "device",
        question: "www.example.com? (recursion desired)",
        answer: "resolver takes over the walk",
        caption:
          "Your device asks its configured recursive resolver for www.example.com and waits for a single final answer.",
      },
      {
        peer: "root",
        question: "Who is authoritative for .com?",
        answer: "Referral: ask the .com TLD servers",
        caption:
          "The resolver asks a root server. The root does not know www.example.com; it refers the resolver down to the .com top-level-domain servers.",
      },
      {
        peer: "tld",
        question: "Who is authoritative for example.com?",
        answer: "Referral: NS ns-2048.awsdns-64.com and three more",
        caption:
          "The .com servers return the NS records for example.com. Those NS records name the four Route 53 name servers for the hosted zone.",
      },
      {
        peer: "auth",
        question: "What is www.example.com?",
        answer: "Authoritative: A 203.0.113.10",
        caption:
          "Route 53 holds the hosted zone, so it answers authoritatively with the A record. This is the answer the resolver was walking toward.",
      },
      {
        peer: "device",
        question: "Final answer for www.example.com",
        answer: "A 203.0.113.10 (cached for the record's TTL)",
        caption:
          "The resolver returns the address to your device and caches it for the record's TTL, so the next lookup skips the whole walk.",
      },
    ],
    callouts: RESOLUTION_CALLOUTS,
  },
  records: {
    zoneNoun: "public hosted zone",
    recordNoun: "record",
    zoneName: "example.com",
    grouping:
      "Route 53 stores each entry as a record. A weighted or latency record can repeat a name, because the routing policy chooses between them at query time.",
    rows: [
      {
        type: "A",
        tone: "auth",
        purpose: "Map a name to an IPv4 address.",
        exampleName: "www",
        exampleValue: "203.0.113.10",
        note: "The workhorse record. Points a hostname straight at an address.",
      },
      {
        type: "AAAA",
        tone: "auth",
        purpose: "Map a name to an IPv6 address.",
        exampleName: "www",
        exampleValue: "2001:db8::10",
        note: "The IPv6 twin of an A record, used alongside it for dual-stack.",
      },
      {
        type: "CNAME",
        tone: "record",
        purpose: "Alias one name to another name.",
        exampleName: "shop",
        exampleValue: "www.example.com",
        note: "Cannot sit at the zone apex, and Route 53 charges for CNAME queries.",
      },
      {
        type: "Alias",
        tone: "alias",
        purpose: "Point a name at an AWS resource, apex included.",
        exampleName: "example.com",
        exampleValue: "d111.cloudfront.net (a CloudFront distribution)",
        note: "A Route 53 extension. Free for AWS targets and tracks their address.",
      },
      {
        type: "MX",
        tone: "record",
        purpose: "Name the mail servers for the domain.",
        exampleName: "example.com",
        exampleValue: "10 inbound-smtp.example.com",
        note: "The number is a priority; lower is tried first.",
      },
      {
        type: "TXT",
        tone: "record",
        purpose: "Hold arbitrary text, often for verification.",
        exampleName: "example.com",
        exampleValue: '"v=spf1 include:amazonses.com -all"',
        note: "SPF, DKIM, and domain-ownership checks all ride on TXT records.",
      },
      {
        type: "NS",
        tone: "tld",
        purpose: "Name the authoritative servers for the zone.",
        exampleName: "example.com",
        exampleValue: "ns-2048.awsdns-64.com",
        note: "Auto-created with the hosted zone. This is what delegation points at.",
      },
    ],
    callouts: RECORDS_CALLOUTS_AWS,
  },
  apex: {
    domain: "example.com",
    aliasNoun: "Alias record",
    targets: [
      {
        id: "elb",
        label: "An Elastic Load Balancing DNS name",
        sub: "my-alb-123.us-east-1.elb.amazonaws.com",
        mechanisms: [
          {
            label: "CNAME record",
            verdict: "blocked",
            outcome: "Not allowed at the apex",
            why: "A CNAME cannot coexist with the SOA and NS records that every apex must carry, so the zone apex rejects it.",
          },
          {
            label: "A record",
            verdict: "warn",
            outcome: "Legal but brittle",
            why: "A load balancer has no fixed IP. Hard-coding today's address invites an outage the moment AWS moves it.",
          },
          {
            label: "Alias record",
            verdict: "ok",
            outcome: "The supported answer",
            why: "An alias record sits at the apex and resolves to the load balancer, following its addresses automatically.",
          },
        ],
      },
      {
        id: "cloudfront",
        label: "A CloudFront distribution",
        sub: "d111abcdef8.cloudfront.net",
        mechanisms: [
          {
            label: "CNAME record",
            verdict: "blocked",
            outcome: "Not allowed at the apex",
            why: "Same rule: no CNAME at the apex. It would work on a subdomain like www, but not on example.com itself.",
          },
          {
            label: "A record",
            verdict: "blocked",
            outcome: "No address to use",
            why: "CloudFront never gives you a fixed IP to place in an A record, so there is nothing to hard-code.",
          },
          {
            label: "Alias record",
            verdict: "ok",
            outcome: "The supported answer",
            why: "An alias record targets the distribution directly, and Route 53 does not charge for the alias query.",
          },
        ],
      },
      {
        id: "server",
        label: "A server with a fixed public IP",
        sub: "203.0.113.10",
        mechanisms: [
          {
            label: "CNAME record",
            verdict: "blocked",
            outcome: "Not allowed at the apex",
            why: "You still cannot CNAME the apex, even to a name that resolves to that IP.",
          },
          {
            label: "A record",
            verdict: "ok",
            outcome: "Correct here",
            why: "When you truly own a stable IP, a plain A record at the apex is exactly right. No alias needed.",
          },
          {
            label: "Alias record",
            verdict: "warn",
            outcome: "Not applicable",
            why: "Alias records target AWS resources, not an arbitrary IP. For a fixed IP, use the A record above.",
          },
        ],
      },
    ],
    callouts: APEX_CALLOUTS,
  },
  routing: {
    service: "Amazon Route 53",
    model:
      "The routing policy is an attribute of the record itself, so hosting and routing live in one service.",
    health:
      "Route 53 health checks probe endpoints and can pull unhealthy records out of the answer automatically.",
    goals: [
      {
        id: "failover",
        goal: "Fail over to a standby",
        tone: "auth",
        mechanism: "Failover routing policy",
        how: "Mark one record primary and one secondary. A health check on the primary decides which is served, giving active-passive failover.",
      },
      {
        id: "weighted",
        goal: "Split traffic by weight",
        tone: "tld",
        mechanism: "Weighted routing policy",
        how: "Give records the same name different weights and Route 53 hands them out in proportion, useful for canary and blue-green rollouts.",
      },
      {
        id: "latency",
        goal: "Send users to the nearest Region",
        tone: "query",
        mechanism: "Latency routing policy",
        how: "Tag records with an AWS Region and Route 53 returns the Region that gives the querying resolver the lowest latency.",
      },
      {
        id: "geo",
        goal: "Route by user location",
        tone: "root",
        mechanism: "Geolocation routing policy",
        how: "Answer based on the continent, country, or state the query comes from, for localization or data-residency rules.",
      },
      {
        id: "multivalue",
        goal: "Return several healthy answers",
        tone: "alias",
        mechanism: "Multivalue answer routing policy",
        how: "Return up to eight healthy records chosen at random, a simple way to spread load and route around a failed endpoint.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "One service",
        title: "Route 53 does hosting and routing together.",
        body: "Because the policy rides on the record, you never leave the DNS service to add failover or geolocation. Azure splits these into two services, which is the biggest difference between the two clouds here.",
      },
      {
        kind: "fix",
        tag: "Health checks",
        title: "Routing is only as good as its health checks.",
        body: "Failover and multivalue answers depend on Route 53 health checks. Without them, DNS keeps handing out an address long after the endpoint behind it has died.",
      },
    ],
  },
  ttl: {
    recordName: "www.example.com",
    oldValue: "203.0.113.10",
    newValue: "203.0.113.99",
    defaultTtl: 300,
    presets: [
      {
        ttl: 60,
        label: "60 seconds",
        use: "Set this a day before a planned migration so changes take effect fast.",
      },
      {
        ttl: 300,
        label: "5 minutes",
        use: "A common everyday default: responsive without hammering your name servers.",
      },
      {
        ttl: 3600,
        label: "1 hour",
        use: "Fine for records that rarely change and benefit from heavy caching.",
      },
      {
        ttl: 86400,
        label: "1 day",
        use: "Good for stable records like MX, painful if you need to change them quickly.",
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common belief",
        title: '"DNS propagation takes 48 hours."',
        body: "There is no propagation. Authoritative records change the instant you save them. What you are waiting on is resolvers around the world letting their cached copies expire, and that never exceeds the record's TTL.",
      },
      {
        kind: "fix",
        tag: "Alias TTL",
        title: "Alias records inherit their TTL.",
        body: "An alias record to an AWS resource has no TTL you can set. Route 53 uses the target's own TTL, so the caching window is decided by the resource, not by you.",
      },
    ],
  },
  quiz: [
    {
      q: "A user's browser needs an address for www.example.com. Who actually walks the root, TLD, and authoritative servers?",
      opts: [
        "The recursive resolver",
        "The Route 53 name servers",
        "The browser itself",
        "The root servers",
      ],
      answer: 0,
      explain:
        "The recursive resolver does the walking and caches each step. Route 53 name servers are authoritative: they only answer for the zones they hold.",
    },
    {
      q: "A resolver asks the Route 53 name servers for a name in a zone they do not host. What happens?",
      opts: [
        "They walk the hierarchy, resolve it, and cache the answer",
        "They only answer for the zones they hold, so they do not resolve it for you",
        "They forward the query to the root servers on the resolver's behalf",
        "They return the closest matching record they happen to hold",
      ],
      answer: 1,
      explain:
        "Route 53 name servers are authoritative, not recursive. They only answer for the zones they hold and never resolve other names. Walking the hierarchy is the recursive resolver's job.",
    },
    {
      q: "Delegation is complete only when which records point at your provider's name servers?",
      opts: [
        "The NS records in the parent zone at your registrar",
        "The A records in your zone",
        "The SOA record",
        "The MX records",
      ],
      answer: 0,
      explain:
        "The parent zone must publish NS records naming your provider's servers. Until then the resolution walk never reaches your zone, no matter what records you create inside it.",
    },
    {
      q: "You create a public hosted zone for example.com in Route 53 but add no records of your own yet. Which records already exist?",
      opts: [
        "None until you create them",
        "The NS and SOA records, created automatically with the zone",
        "An A record for the apex",
        "The MX records for mail",
      ],
      answer: 1,
      explain:
        "Creating a hosted zone auto-creates its NS and SOA records. The NS record lists the four name servers assigned to the zone, and that is what delegation points at.",
    },
    {
      q: "You want shop.example.com to resolve to the same place as www.example.com, an ordinary hostname. Which record fits, and what should you know?",
      opts: [
        "An alias record, because CNAMEs are not allowed on subdomains",
        "A CNAME record; it works on a subdomain but cannot sit at the zone apex",
        "An A record, because a CNAME cannot point at another name",
        "An NS record delegating shop to www",
      ],
      answer: 1,
      explain:
        "A CNAME aliases one name to another and is fine on a subdomain like shop. It cannot sit at the zone apex, where an alias record is the supported fix.",
    },
    {
      q: "Why can't you create a CNAME for the bare domain example.com?",
      opts: [
        "CNAMEs are deprecated",
        "A CNAME can't coexist with the apex's required SOA and NS records",
        "A CNAME at the apex would create a resolution loop",
        "The apex only accepts TXT records",
      ],
      answer: 1,
      explain:
        "A CNAME must be the only record for its name, but the apex must carry SOA and NS records, so they collide. An alias record is the supported fix.",
    },
    {
      q: "You want the apex example.com to front a CloudFront distribution. What do you use?",
      opts: [
        "A CNAME record",
        "An A record with CloudFront's IP",
        "An alias record",
        "An MX record",
      ],
      answer: 2,
      explain:
        "An alias record works at the apex and targets the distribution directly. CloudFront exposes no fixed IP for an A record.",
    },
    {
      q: "The apex example.com must point at a server you run on a stable, fixed public IP that is not an AWS resource. What is the right record?",
      opts: [
        "An alias record",
        "A CNAME record",
        "A plain A record at the apex",
        "An NS record",
      ],
      answer: 2,
      explain:
        "When you truly own a stable IP, a plain A record at the apex is exactly right and no alias is needed. Alias records target AWS resources, not an arbitrary IP, and a CNAME cannot sit at the apex.",
    },
    {
      q: "In Route 53, where does a weighted or failover routing decision live?",
      opts: [
        "In a separate load-balancing service",
        "In the record itself, as its routing policy",
        "In the resolver's cache",
        "In the registrar",
      ],
      answer: 1,
      explain:
        "Route 53 bundles hosting and routing: the routing policy is an attribute of the record. Azure instead uses a separate Traffic Manager service.",
    },
    {
      q: "You run an active-passive setup and want DNS to serve the standby only when the primary is down. What makes that work in Route 53?",
      opts: [
        "A weighted routing policy with equal weights",
        "A failover routing policy backed by a health check on the primary",
        "A latency routing policy",
        "Lowering the TTL to zero",
      ],
      answer: 1,
      explain:
        "A failover routing policy marks one record primary and one secondary, and a health check on the primary decides which is served. Without health checks, DNS keeps handing out a dead endpoint's address.",
    },
    {
      q: "You lower a record's TTL from 1 hour to 60 seconds, then change its value. What decides how long some users still see the old answer?",
      opts: [
        "The registrar's refresh interval",
        "A fixed 48-hour propagation delay",
        "How much of the old TTL was still cached when you changed it",
        "The number of name servers",
      ],
      answer: 2,
      explain:
        "Resolvers serve a cached answer until its TTL expires. Lowering the TTL ahead of a change shrinks that worst-case stale window.",
    },
    {
      q: "You set an alias record at the apex pointing to a load balancer and go looking for its TTL to tune the caching window. What do you find?",
      opts: [
        "The TTL defaults to 300 seconds and you can change it",
        "There is no TTL to set; Route 53 uses the target's own TTL",
        "The TTL is fixed at 24 hours for every alias record",
        "The alias record is never cached at all",
      ],
      answer: 1,
      explain:
        "An alias record to an AWS resource has no TTL you can set. Route 53 takes the TTL from the target, so the caching window is decided by the resource, not by you.",
    },
  ],
};

const AZURE_CONTENT: LessonContent = {
  chapters: CHAPTERS,
  resolution: {
    hostname: "www.example.com",
    answer: "A 203.0.113.10",
    authLabel: "Azure DNS",
    authZone: "DNS zone",
    authNameservers: "ns1-37.azure-dns.com and three more",
    steps: [
      {
        peer: "device",
        question: "www.example.com? (recursion desired)",
        answer: "resolver takes over the walk",
        caption:
          "Your device asks its configured recursive resolver for www.example.com and waits for a single final answer.",
      },
      {
        peer: "root",
        question: "Who is authoritative for .com?",
        answer: "Referral: ask the .com TLD servers",
        caption:
          "The resolver asks a root server. The root does not know www.example.com; it refers the resolver down to the .com top-level-domain servers.",
      },
      {
        peer: "tld",
        question: "Who is authoritative for example.com?",
        answer: "Referral: NS ns1-37.azure-dns.com and three more",
        caption:
          "The .com servers return the NS records for example.com. Those NS records name the four Azure DNS name servers assigned to the zone.",
      },
      {
        peer: "auth",
        question: "What is www.example.com?",
        answer: "Authoritative: A 203.0.113.10",
        caption:
          "Azure DNS holds the DNS zone, so it answers authoritatively with the A record. Azure DNS is authoritative only; it never resolves other names.",
      },
      {
        peer: "device",
        question: "Final answer for www.example.com",
        answer: "A 203.0.113.10 (cached for the record set's TTL)",
        caption:
          "The resolver returns the address to your device and caches it for the record set's TTL, so the next lookup skips the whole walk.",
      },
    ],
    callouts: RESOLUTION_CALLOUTS,
  },
  records: {
    zoneNoun: "DNS zone",
    recordNoun: "record set",
    zoneName: "example.com",
    grouping:
      "Azure DNS groups every record with the same name and type into a record set with one shared TTL. SOA and CNAME sets are the exception: they can hold only a single record.",
    rows: [
      {
        type: "A",
        tone: "auth",
        purpose: "Map a name to an IPv4 address.",
        exampleName: "www",
        exampleValue: "203.0.113.10",
        note: "A record set can hold several A records to list more than one address.",
      },
      {
        type: "AAAA",
        tone: "auth",
        purpose: "Map a name to an IPv6 address.",
        exampleName: "www",
        exampleValue: "2001:db8::10",
        note: "The IPv6 twin of an A record, used alongside it for dual-stack.",
      },
      {
        type: "CNAME",
        tone: "record",
        purpose: "Alias one name to another name.",
        exampleName: "shop",
        exampleValue: "www.example.com",
        note: "A CNAME set holds exactly one record, and it cannot sit at the zone apex.",
      },
      {
        type: "Alias",
        tone: "alias",
        purpose: "Point a record set at an Azure resource, apex included.",
        exampleName: "example.com",
        exampleValue: "a Traffic Manager or Front Door profile",
        note: "An alias record set for A, AAAA, or CNAME that tracks the Azure target.",
      },
      {
        type: "MX",
        tone: "record",
        purpose: "Name the mail servers for the domain.",
        exampleName: "example.com",
        exampleValue: "10 example-com.mail.protection.outlook.com",
        note: "The number is a priority; lower is tried first.",
      },
      {
        type: "TXT",
        tone: "record",
        purpose: "Hold arbitrary text, often for verification.",
        exampleName: "example.com",
        exampleValue: '"v=spf1 include:spf.protection.outlook.com -all"',
        note: "SPF is stored as a TXT record; Azure DNS has no separate SPF type.",
      },
      {
        type: "NS",
        tone: "tld",
        purpose: "Name the authoritative servers for the zone.",
        exampleName: "example.com",
        exampleValue: "ns1-37.azure-dns.com",
        note: "Created with the zone. Delegate all four to qualify for the SLA.",
      },
    ],
    callouts: RECORDS_CALLOUTS_AZURE,
  },
  apex: {
    domain: "example.com",
    aliasNoun: "Alias record set",
    targets: [
      {
        id: "trafficmanager",
        label: "A Traffic Manager profile",
        sub: "myprofile.trafficmanager.net",
        mechanisms: [
          {
            label: "CNAME record",
            verdict: "blocked",
            outcome: "Not allowed at the apex",
            why: "A CNAME cannot coexist with the SOA and NS records every apex must carry. Traffic Manager normally needs a CNAME, so the apex blocks it.",
          },
          {
            label: "A record",
            verdict: "blocked",
            outcome: "No fixed address",
            why: "A Traffic Manager profile is a name, not a stable IP, so there is nothing to hard-code in an A record.",
          },
          {
            label: "Alias record set",
            verdict: "ok",
            outcome: "The supported answer",
            why: "An A/AAAA alias record set at the apex points at the Traffic Manager profile, the documented way to host a load-balanced app at the naked domain.",
          },
        ],
      },
      {
        id: "publicip",
        label: "A Standard SKU public IP resource",
        sub: "an Azure public IP address",
        mechanisms: [
          {
            label: "CNAME record",
            verdict: "blocked",
            outcome: "Not allowed at the apex",
            why: "Same rule: no CNAME at the apex, even pointing at a resource that has an address.",
          },
          {
            label: "A record",
            verdict: "warn",
            outcome: "Works but can dangle",
            why: "You could paste today's IP into an A record, but if the public IP is reassigned the record silently points at the wrong resource.",
          },
          {
            label: "Alias record set",
            verdict: "ok",
            outcome: "The supported answer",
            why: "An alias record set bound to the public IP resource updates automatically and empties itself if the resource is deleted, preventing a dangling record.",
          },
        ],
      },
      {
        id: "server",
        label: "A server with a fixed public IP",
        sub: "203.0.113.10",
        mechanisms: [
          {
            label: "CNAME record",
            verdict: "blocked",
            outcome: "Not allowed at the apex",
            why: "You still cannot CNAME the apex, even to a name that resolves to that IP.",
          },
          {
            label: "A record",
            verdict: "ok",
            outcome: "Correct here",
            why: "When you own a stable IP that is not an Azure resource, a plain A record at the apex is exactly right.",
          },
          {
            label: "Alias record set",
            verdict: "warn",
            outcome: "Not applicable",
            why: "Alias record sets target Azure resources, not an arbitrary external IP. For a fixed IP, use the A record above.",
          },
        ],
      },
    ],
    callouts: APEX_CALLOUTS,
  },
  routing: {
    service: "Azure Traffic Manager",
    model:
      "Azure DNS only hosts records. Traffic routing is a separate service, Azure Traffic Manager, that a DNS alias record set points at.",
    health:
      "Every Traffic Manager profile includes endpoint health monitoring and automatic failover, independent of the DNS zone.",
    goals: [
      {
        id: "priority",
        goal: "Fail over to a standby",
        tone: "auth",
        mechanism: "Priority routing method",
        how: "List endpoints by priority. Traffic Manager serves the highest-priority healthy endpoint and falls back down the list, giving active-passive failover.",
      },
      {
        id: "weighted",
        goal: "Split traffic by weight",
        tone: "tld",
        mechanism: "Weighted routing method",
        how: "Assign each endpoint a weight from 1 to 1000 and Traffic Manager picks one at random in proportion, useful for canary rollouts.",
      },
      {
        id: "performance",
        goal: "Send users to the nearest Region",
        tone: "query",
        mechanism: "Performance routing method",
        how: "With endpoints in several regions, Traffic Manager returns the one with the lowest network latency for the querying resolver.",
      },
      {
        id: "geographic",
        goal: "Route by user location",
        tone: "root",
        mechanism: "Geographic routing method",
        how: "Direct users to specific endpoints by the geographic location of their DNS query, for data-sovereignty and localization needs.",
      },
      {
        id: "multivalue",
        goal: "Return several healthy answers",
        tone: "alias",
        mechanism: "Multivalue routing method",
        how: "For profiles whose endpoints are IPv4 or IPv6 addresses, return all healthy endpoints in one answer so the client can retry another.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "Two services",
        title: "Azure DNS and Traffic Manager are separate.",
        body: "Azure DNS is authoritative hosting only. To route traffic you create a Traffic Manager profile and point a DNS alias record set at it. This split is the biggest difference from Route 53, which does both in one service.",
      },
      {
        kind: "fix",
        tag: "Apex bridge",
        title: "An alias record set connects the two.",
        body: "Because Traffic Manager hands you a name and the apex cannot hold a CNAME, you use an A/AAAA alias record set at the apex to point the naked domain at the profile.",
      },
    ],
  },
  ttl: {
    recordName: "www.example.com",
    oldValue: "203.0.113.10",
    newValue: "203.0.113.99",
    defaultTtl: 3600,
    presets: [
      {
        ttl: 60,
        label: "60 seconds",
        use: "Set this a day before a planned migration so changes take effect fast.",
      },
      {
        ttl: 300,
        label: "5 minutes",
        use: "A responsive everyday value for records you expect to change.",
      },
      {
        ttl: 3600,
        label: "1 hour",
        use: "The Azure DNS default TTL when you add a record without setting one.",
      },
      {
        ttl: 86400,
        label: "1 day",
        use: "Good for stable records like MX, painful if you need to change them quickly.",
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common belief",
        title: '"DNS propagation takes 48 hours."',
        body: "There is no propagation. Azure DNS changes the record set the instant you save it. What you are waiting on is resolvers letting their cached copies expire, and that never exceeds the record set's TTL.",
      },
      {
        kind: "note",
        tag: "TTL on the set",
        title: "TTL is a property of the record set.",
        body: "In Azure DNS the TTL is set once per record set and shared by every record in it, so you cannot give two A records in the same set different caching windows.",
      },
    ],
  },
  quiz: [
    {
      q: "A user's browser needs an address for www.example.com. Who actually walks the root, TLD, and authoritative servers?",
      opts: [
        "The recursive resolver",
        "The Azure DNS name servers",
        "The browser itself",
        "The root servers",
      ],
      answer: 0,
      explain:
        "The recursive resolver does the walking and caches each step. Azure DNS is authoritative only: it answers for its zones and never resolves other names.",
    },
    {
      q: "A resolver asks the Azure DNS name servers for a name in a zone they do not host. What happens?",
      opts: [
        "They walk the hierarchy, resolve it, and cache the answer",
        "They return the closest matching record they happen to hold",
        "They only answer for the zones they hold, so they do not resolve it for you",
        "They forward the query to the root servers on the resolver's behalf",
      ],
      answer: 2,
      explain:
        "Azure DNS is authoritative only. It answers for the zones it holds and never resolves other names. Walking the hierarchy is the recursive resolver's job.",
    },
    {
      q: "Delegation is complete only when which records point at your provider's name servers?",
      opts: [
        "The NS records in the parent zone at your registrar",
        "The A records in your zone",
        "The SOA record",
        "The MX records",
      ],
      answer: 0,
      explain:
        "The parent zone must publish NS records naming all four Azure DNS servers. Until then the resolution walk never reaches your zone, and delegating all four is what qualifies the zone for the SLA.",
    },
    {
      q: "You add a second A record with the same name to an Azure DNS zone. Where does its TTL come from?",
      opts: [
        "Each A record carries its own independent TTL",
        "From the record set: one TTL shared by every record with that name and type",
        "From the zone's SOA record",
        "From the recursive resolver",
      ],
      answer: 1,
      explain:
        "Azure DNS groups every record with the same name and type into a record set with one shared TTL, so the two A records cannot have different caching windows. SOA and CNAME sets are the exception, holding only one record.",
    },
    {
      q: "You want shop.example.com to resolve to the same place as www.example.com, an ordinary hostname. Which record fits, and what is the constraint?",
      opts: [
        "An alias record set, because CNAMEs are not allowed on subdomains",
        "A CNAME set; it works on a subdomain but holds exactly one record and cannot sit at the apex",
        "An A record, because a CNAME cannot point at another name",
        "An NS record set delegating shop to www",
      ],
      answer: 1,
      explain:
        "A CNAME aliases one name to another and is fine on a subdomain like shop. A CNAME set holds exactly one record, and it cannot sit at the zone apex.",
    },
    {
      q: "Why can't you create a CNAME for the bare domain example.com?",
      opts: [
        "CNAMEs are deprecated",
        "A CNAME can't coexist with the apex's required SOA and NS records",
        "A CNAME at the apex would create a resolution loop",
        "The apex only accepts TXT records",
      ],
      answer: 1,
      explain:
        "A CNAME must be the only record for its name, but the apex must carry SOA and NS records, so they collide. An alias record set is the supported fix.",
    },
    {
      q: "You want the apex example.com to front a Traffic Manager profile. What do you use?",
      opts: [
        "A CNAME record",
        "An A record with the profile's IP",
        "An A/AAAA alias record set",
        "An MX record",
      ],
      answer: 2,
      explain:
        "An alias record set works at the apex and points at the Traffic Manager profile. A profile is a name, not a fixed IP, so an A record has nothing to target.",
    },
    {
      q: "The apex example.com must point at a server you run on a stable, fixed public IP that is not an Azure resource. What is the right record?",
      opts: [
        "An alias record set",
        "A CNAME record",
        "A plain A record at the apex",
        "An NS record set",
      ],
      answer: 2,
      explain:
        "When you own a stable IP that is not an Azure resource, a plain A record at the apex is exactly right. Alias record sets target Azure resources, not an arbitrary external IP, and a CNAME cannot sit at the apex.",
    },
    {
      q: "In Azure, where does a weighted or failover routing decision live?",
      opts: [
        "In the Azure DNS record set",
        "In a separate Azure Traffic Manager profile",
        "In the resolver's cache",
        "In the registrar",
      ],
      answer: 1,
      explain:
        "Azure DNS only hosts records. Routing lives in Traffic Manager, a separate service a DNS alias record set points at. Route 53 instead does both in one.",
    },
    {
      q: "You run an active-passive setup and want traffic served to the standby only when the primary is down. What makes that work in Azure?",
      opts: [
        "A weighted routing method with equal weights",
        "A Traffic Manager priority routing method, using its built-in endpoint health monitoring",
        "A performance routing method",
        "Lowering the record set TTL to zero",
      ],
      answer: 1,
      explain:
        "Traffic Manager's priority routing method serves the highest-priority healthy endpoint and falls back down the list. Every Traffic Manager profile includes endpoint health monitoring and automatic failover, independent of the DNS zone.",
    },
    {
      q: "You lower a record set's TTL from 1 hour to 60 seconds, then change its value. What decides how long some users still see the old answer?",
      opts: [
        "The registrar's refresh interval",
        "A fixed 48-hour propagation delay",
        "How much of the old TTL was still cached when you changed it",
        "The number of name servers",
      ],
      answer: 2,
      explain:
        "Resolvers serve a cached answer until its TTL expires. Lowering the TTL ahead of a change shrinks that worst-case stale window.",
    },
    {
      q: "You want two A records in the same Azure DNS record set to have different caching windows. Can you?",
      opts: [
        "Yes, set a separate TTL on each record",
        "No, TTL is a property of the record set and is shared by every record in it",
        "Yes, but only if the records have different names",
        "Yes, an alias record overrides the set's TTL",
      ],
      answer: 1,
      explain:
        "In Azure DNS the TTL is set once per record set and shared by every record in it, so you cannot give two A records in the same set different caching windows.",
    },
  ],
};

export const CONTENT: Record<Provider, LessonContent> = {
  aws: AWS_CONTENT,
  azure: AZURE_CONTENT,
};
