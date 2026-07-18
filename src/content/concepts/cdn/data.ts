import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the Content Delivery lesson. The interactive
 * components under this folder are provider-agnostic and read everything they
 * render from here, so the AWS and Azure lessons stay bespoke without
 * duplicating the interaction machinery. The two providers genuinely diverge:
 * Amazon CloudFront is a content delivery network with distributions and cache
 * behaviors and a second caching tier (regional edge caches), while Azure Front
 * Door is a global load balancer and CDN in one, where caching is an optional
 * per-route feature layered on top of origin-group routing with health probes
 * and failover.
 *
 * Facts verified against Amazon CloudFront documentation (docs.aws.amazon.com)
 * and Microsoft Learn (learn.microsoft.com). Latency figures and relative bars
 * are illustrative, not measurements. Prose is neutral and professional; no em
 * dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* --------------------------- Chapter 0 · the edge ------------------------- */

export interface Viewer {
  id: string;
  city: string;
  /** Illustrative round trip straight to the origin Region, in ms. */
  directMs: number;
  /** Illustrative round trip to the nearest edge point of presence, in ms. */
  edgeMs: number;
  /** The nearest edge location that serves this viewer. */
  edgeName: string;
}

export interface EdgeContent {
  /** Where the single origin lives, e.g. "Origin Region · N. Virginia". */
  originLabel: string;
  /** What the provider calls an edge site, singular. */
  edgeTerm: string;
  /** The private network the request rides once it reaches the provider. */
  networkName: string;
  viewers: Viewer[];
  note: string;
  callouts: CalloutData[];
}

/* -------------------------- Chapter 1 · hit or miss ----------------------- */

export interface TraceNode {
  id: string;
  label: string;
  sub?: string;
  tone: Tone;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** hit = served from the edge · miss = fetched and then cached · dynamic = never cached. */
export type TraceOutcome = "hit" | "miss" | "dynamic";

export interface TraceFlow {
  id: string;
  label: string;
  /** Node ids in the order the request visits them. */
  path: string[];
  outcome: TraceOutcome;
  /** Node id where the outcome marker lands. */
  terminal: string;
  title: string;
  body: string;
}

export interface TraceContent {
  viewBox: string;
  nodes: TraceNode[];
  flows: TraceFlow[];
  note: string;
  callouts: CalloutData[];
}

/* --------------------------- Chapter 2 · cache key ------------------------ */

export interface KeyPart {
  id: string;
  label: string;
  /** The value this part carries in request A. */
  aValue: string;
  /** The value this part carries in request B. */
  bValue: string;
  /** Always part of the key and cannot be toggled off (the URL path). */
  locked?: boolean;
  /** In the cache key by default for this provider. */
  defaultOn?: boolean;
  hint: string;
}

export interface CacheKeyContent {
  /** What the provider calls the setting that shapes the key. */
  configName: string;
  /** The shared request path both example requests use. */
  requestPath: string;
  parts: KeyPart[];
  note: string;
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 3 · routing ------------------------- */

/** first = first matching rule in list order wins · specific = most-specific match wins. */
export type MatchOrder = "first" | "specific";

export interface RouteRule {
  id: string;
  /** A path pattern, e.g. "/images/*", "/*", or an exact "/index.html". */
  pattern: string;
  /** Where a matching request is sent. */
  origin: string;
  note: string;
}

export interface RouteContent {
  matchOrder: MatchOrder;
  /** What the provider calls one of these rules. */
  ruleTerm: string;
  /** Plain-language description of the matching algorithm. */
  algorithm: string;
  rules: RouteRule[];
  samplePaths: string[];
  /** Shown when a path matches nothing (only reachable when matchOrder is "specific"). */
  noMatch: string;
  note: string;
  callouts: CalloutData[];
}

/* --------------------------- Chapter 4 · operations ----------------------- */

export interface OpsScenario {
  id: string;
  label: string;
  /** The situation the operator is in. */
  question: string;
  /** The provider's mechanism name, e.g. "Invalidation". */
  mechanism: string;
  tone: Tone;
  /** Short outcome tag, e.g. "Purge the path" or "Sign the URL". */
  verdict: string;
  why: string;
  /** A real CLI invocation, when one fits in a line. */
  cli?: string;
}

export interface OpsContent {
  scenarios: OpsScenario[];
  callouts: CalloutData[];
}

/* ------------------------------- Chapter 5 · quiz ------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/* ------------------------------- The content ----------------------------- */

export interface CdnContent {
  chapters: ChapterMeta[];
  edge: EdgeContent;
  trace: TraceContent;
  cacheKey: CacheKeyContent;
  routing: RouteContent;
  ops: OpsContent;
  quiz: QuizQ[];
}

const AWS: CdnContent = {
  chapters: [
    {
      navLabel: "The edge",
      kicker: "Chapter 1 · Why the edge",
      title: "Content that meets the viewer",
      intro:
        "A viewer in Sydney should not wait on a round trip to a server in Virginia. CloudFront answers from an edge location near the viewer and rides the AWS backbone the rest of the way.",
    },
    {
      navLabel: "Hit or miss",
      kicker: "Chapter 2 · Cache hit and miss",
      title: "The first request pays, the rest are cheap",
      intro:
        "The edge only speeds things up once it holds a copy. Trace a cold request to the origin, then a warm one served straight from the edge, then a dynamic one that can never be cached.",
    },
    {
      navLabel: "Cache key",
      kicker: "Chapter 3 · The cache key",
      title: "What counts as the same request",
      intro:
        "Two requests share a cached object only when they build the same cache key. Choose what goes into the key and watch the cache either share one copy or split into many.",
    },
    {
      navLabel: "Routing",
      kicker: "Chapter 4 · Routing to origins",
      title: "One distribution, many origins",
      intro:
        "A distribution can front several origins. Cache behaviors decide which origin serves each path, and CloudFront picks the first behavior whose pattern matches.",
    },
    {
      navLabel: "Operations",
      kicker: "Chapter 5 · Fresh and protected",
      title: "Update, expire, and lock content",
      intro:
        "Caching is only useful if you can also change and protect what is cached. Pick a situation and see the mechanism CloudFront gives you for it.",
    },
    {
      navLabel: "Quiz",
      kicker: "Chapter 6 · Check yourself",
      title: "Twelve questions",
      intro:
        "Twelve short questions on edges, cache keys, and behaviors. Each explains itself once you answer.",
    },
  ],

  edge: {
    originLabel: "Origin Region · N. Virginia (us-east-1)",
    edgeTerm: "edge location",
    networkName: "AWS backbone network",
    viewers: [
      {
        id: "syd",
        city: "Sydney",
        directMs: 220,
        edgeMs: 12,
        edgeName: "Sydney edge location",
      },
      {
        id: "lon",
        city: "London",
        directMs: 88,
        edgeMs: 9,
        edgeName: "London edge location",
      },
      {
        id: "sao",
        city: "Sao Paulo",
        directMs: 130,
        edgeMs: 14,
        edgeName: "Sao Paulo edge location",
      },
      {
        id: "tok",
        city: "Tokyo",
        directMs: 168,
        edgeMs: 11,
        edgeName: "Tokyo edge location",
      },
    ],
    note: "Latency is the time to the first byte, and it tracks distance. DNS sends each viewer to the edge location with the lowest latency, and copies of your files sit cached in edge locations worldwide.",
    callouts: [
      {
        kind: "note",
        tag: "Two-tier caching",
        title: "Behind the edge locations sit regional edge caches",
        body: "When an edge location misses, it usually asks a nearby regional edge cache before it reaches your origin. The regional tier holds a larger, longer-lived cache, so less popular files stay close to viewers and the origin is hit less often.",
      },
    ],
  },

  trace: {
    viewBox: "0 0 720 200",
    nodes: [
      {
        id: "viewer",
        label: "Viewer",
        sub: "browser",
        tone: "viewer",
        x: 24,
        y: 74,
        w: 120,
        h: 56,
      },
      {
        id: "edge",
        label: "Edge location",
        sub: "POP cache",
        tone: "edge",
        x: 208,
        y: 74,
        w: 130,
        h: 56,
      },
      {
        id: "mid",
        label: "Regional edge cache",
        sub: "wider cache",
        tone: "mid",
        x: 402,
        y: 74,
        w: 142,
        h: 56,
      },
      {
        id: "origin",
        label: "Origin",
        sub: "S3 or HTTP server",
        tone: "origin",
        x: 584,
        y: 74,
        w: 116,
        h: 56,
      },
    ],
    flows: [
      {
        id: "cold",
        label: "First request · cold cache",
        path: ["viewer", "edge", "mid", "origin"],
        outcome: "miss",
        terminal: "origin",
        title: "Cache miss",
        body: "Neither the edge location nor the regional edge cache had the file, so CloudFront fetched it from the origin. It streams to the viewer as the first byte arrives and is stored in the cache on the way back.",
      },
      {
        id: "warm",
        label: "Next request · warm cache",
        path: ["viewer", "edge"],
        outcome: "hit",
        terminal: "edge",
        title: "Cache hit",
        body: "The edge location already holds a valid copy, so it answers in one short hop. The regional cache and the origin never hear about this request.",
      },
      {
        id: "dynamic",
        label: "Dynamic response · not cacheable",
        path: ["viewer", "edge", "mid", "origin"],
        outcome: "dynamic",
        terminal: "origin",
        title: "Never cached",
        body: "A response marked private or no-store is not cacheable, so every request travels to the origin. You still gain the fast backbone path and TLS at the edge, but not a cache hit.",
      },
    ],
    note: "By default a file stays cached at an edge location for 24 hours before it expires. You change that with the origin's Cache-Control header or the distribution's minimum, maximum, and default TTL.",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A CDN does not make the first request faster",
        body: "The first viewer to ask for a cold object still waits for the origin fetch. The win is that every later viewer near that edge is served from cache. A low cache hit ratio means most requests are paying the miss cost.",
      },
    ],
  },

  cacheKey: {
    configName: "cache policy",
    requestPath: "/content/story.html",
    parts: [
      {
        id: "path",
        label: "Host + URL path",
        aValue: "/content/story.html",
        bValue: "/content/story.html",
        locked: true,
        defaultOn: true,
        hint: "Always in the key. The distribution domain plus the path identify the object.",
      },
      {
        id: "query",
        label: "Query string",
        aValue: "?ref=twitter",
        bValue: "?ref=email",
        hint: "Off by default. Include it only when the query actually changes the response.",
      },
      {
        id: "country",
        label: "CloudFront-Viewer-Country header",
        aValue: "US",
        bValue: "DE",
        hint: "Off by default. Add it when the origin returns different content per country.",
      },
      {
        id: "cookie",
        label: "Session cookie",
        aValue: "theme=dark",
        bValue: "theme=light",
        hint: "Off by default. A per-user cookie in the key can drop your hit ratio to near zero.",
      },
    ],
    note: "By default the CloudFront cache key is only the distribution domain and the URL path. You add query strings, headers, or cookies with a cache policy. Every value you add can split one cached object into many.",
    callouts: [
      {
        kind: "fix",
        tag: "Higher hit ratio",
        title: "Put the minimum in the cache key",
        body: "Include a value only when it changes what the origin returns. A marketing query string like ref=twitter usually does not, so leaving it out lets both links share one cached copy.",
      },
    ],
  },

  routing: {
    matchOrder: "first",
    ruleTerm: "cache behavior",
    algorithm:
      "CloudFront checks cache behaviors in the order you list them and uses the first whose path pattern matches. The default behavior with pattern * sits last and catches everything else.",
    rules: [
      {
        id: "img",
        pattern: "/images/*",
        origin: "images bucket (Amazon S3)",
        note: "Static images, cached hard.",
      },
      {
        id: "api",
        pattern: "/api/*",
        origin: "API server (custom origin)",
        note: "Dynamic, caching disabled.",
      },
      {
        id: "default",
        pattern: "*",
        origin: "site bucket (Amazon S3)",
        note: "The default behavior, the catch-all.",
      },
    ],
    samplePaths: [
      "/images/logo.png",
      "/api/orders",
      "/index.html",
      "/images/hero/banner.jpg",
    ],
    noMatch: "",
    note: "Because matching is first-in-list, order matters. Put the most specific patterns first and let the * default behavior catch the rest.",
    callouts: [
      {
        kind: "note",
        tag: "Path patterns only",
        title: "Behaviors match on the path, not the file type",
        body: "A pattern like /images/* matches on the request path. Anything under that prefix follows that behavior's cache and origin settings, whatever the file extension.",
      },
    ],
  },

  ops: {
    scenarios: [
      {
        id: "update",
        label: "You shipped a new logo",
        question:
          "You replaced logo.png at the origin, but viewers still see the old one from cache.",
        mechanism: "Invalidation or versioned names",
        tone: "miss",
        verdict: "Invalidate the path, or rename the file",
        why: "An invalidation removes the file from edge and regional caches so the next request refetches it. For frequent updates AWS recommends versioned file names instead, because invalidations are billed per path and versioning is free.",
        cli: 'aws cloudfront create-invalidation --distribution-id EDFDVBD6EXAMPLE --paths "/logo.png"',
      },
      {
        id: "ttl",
        label: "A price feed must stay fresh",
        question: "A JSON file changes often and must not go stale for long.",
        mechanism: "TTL and Cache-Control",
        tone: "edge",
        verdict: "Set a short TTL",
        why: "Send a short Cache-Control max-age from the origin, or set the minimum, maximum, and default TTL on the cache behavior. The edge then refetches once the object expires rather than serving a stale copy.",
      },
      {
        id: "lock",
        label: "Lock premium video to buyers",
        question: "Only paying users should be able to fetch the video files.",
        mechanism: "Signed URLs or signed cookies",
        tone: "block",
        verdict: "Require a signed URL",
        why: "CloudFront signed URLs and signed cookies grant time-limited access to private content, backed by a trusted key group. Your app issues a signed link only to authorized viewers.",
        cli: "aws cloudfront sign --url https://d111111abcdef8.cloudfront.net/video.mp4 --key-pair-id K2JCJMDEHXQW5F --private-key file://private_key.pem --date-less-than 2026-08-01",
      },
      {
        id: "private",
        label: "Keep the origin bucket private",
        question:
          "The S3 bucket should be reachable only through CloudFront, never directly.",
        mechanism: "Origin Access Control",
        tone: "block",
        verdict: "Attach Origin Access Control",
        why: "Origin Access Control lets only your distribution read the bucket and keeps the bucket itself private. Viewers reach content through the CloudFront URL, and the origin has no public door.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "Prefer versioning",
        title: "Renaming beats invalidating for frequent changes",
        body: "Versioned file names like app.9f2c.css also defeat any caches between the edge and the viewer, such as a corporate proxy, which an invalidation cannot reach. They are cheaper and easier to roll back.",
      },
    ],
  },

  quiz: [
    {
      q: "A viewer in Sydney and a viewer in London both load the same site. How does each one reach a nearby edge location?",
      opts: [
        "DNS sends each viewer to the edge location with the lowest latency to them",
        "Both connect to the origin Region, which forwards them to an edge",
        "The viewer picks an edge location by hand",
        "Every viewer is pinned to the London edge location",
      ],
      answer: 0,
      explain:
        "DNS resolves each viewer to the edge location with the lowest latency, so Sydney and London are each served nearby while copies of your files sit cached in edge locations worldwide.",
    },
    {
      q: "An edge location gets a request but does not hold the file. Before it reaches your origin, where does it usually look next?",
      opts: [
        "It gives up and returns an error",
        "A nearby regional edge cache, a larger and longer-lived tier behind the edge locations",
        "Another edge location in a different city",
        "The viewer's browser cache",
      ],
      answer: 1,
      explain:
        "When an edge location misses, it usually asks a nearby regional edge cache before reaching your origin. That regional tier holds a larger, longer-lived cache, so the origin is hit less often.",
    },
    {
      q: "The very first viewer requests a cold object. What happens?",
      opts: [
        "It is served instantly from the edge cache",
        "The edge misses and fetches it from the origin, then caches it",
        "The request is rejected until the cache is warmed",
        "CloudFront returns a placeholder",
      ],
      answer: 1,
      explain:
        "A cold object is a cache miss. CloudFront fetches it from the origin, streams it to the viewer, and stores it for the next request.",
    },
    {
      q: "A distribution's dashboard shows a low cache hit ratio. What does that tell you?",
      opts: [
        "The CDN is speeding up the first request for every object",
        "Nothing, the hit ratio has no effect on latency",
        "Most requests are missing the cache and paying the origin fetch cost",
        "The edge locations are offline",
      ],
      answer: 2,
      explain:
        "A CDN does not make the first request faster; the win is that later viewers near an edge are served from cache. A low hit ratio means most requests miss and pay the origin fetch cost.",
    },
    {
      q: "An origin marks a response private (no-store). What happens on each request for it, and what do you still gain from CloudFront?",
      opts: [
        "It is cached like anything else after the first fetch",
        "CloudFront rejects the response",
        "It is never cached, so every request travels to the origin, but you still get the fast backbone path and TLS at the edge",
        "It is cached, but only for five minutes",
      ],
      answer: 2,
      explain:
        "A response marked private or no-store is not cacheable, so every request reaches the origin. You still gain the fast backbone path and TLS at the edge, just not a cache hit.",
    },
    {
      q: "How long does a file stay cached at an edge location by default?",
      opts: ["5 minutes", "1 hour", "24 hours", "Forever"],
      answer: 2,
      explain:
        "The default TTL is 24 hours. Override it with the origin's Cache-Control header or the behavior's minimum, maximum, and default TTL.",
    },
    {
      q: "By default, what is in a CloudFront cache key?",
      opts: [
        "The full request including all query strings and headers",
        "The distribution domain and the URL path only",
        "Only the query string",
        "The viewer's IP address",
      ],
      answer: 1,
      explain:
        "By default the key is just the distribution domain plus the URL path. Query strings, headers, and cookies are added only through a cache policy.",
    },
    {
      q: "Two links differ only by a ref query string that does not change the response. What raises the hit ratio?",
      opts: [
        "Add the query string to the cache key",
        "Leave the query string out of the cache key",
        "Disable caching for the path",
        "Give each link a different path",
      ],
      answer: 1,
      explain:
        "If the value does not change the response, keeping it out of the key lets both links share one cached object, which raises the hit ratio.",
    },
    {
      q: "You add a per-user session cookie like theme=dark to the cache key. What is the likely effect on the hit ratio?",
      opts: [
        "It rises, because responses become more specific",
        "It stays the same, because cookies are ignored",
        "Caching is turned off entirely",
        "It drops to near zero, because each user's cookie splits the object into a separate copy",
      ],
      answer: 3,
      explain:
        "Every value you add to the key can split one cached object into many. A per-user cookie gives almost every request a unique key, which can drop the hit ratio to near zero.",
    },
    {
      q: "A distribution lists /images/* before the * default behavior. A request for /images/logo.png arrives. Which behavior serves it?",
      opts: [
        "The * default behavior, because it is the fallback",
        "The /images/* behavior, the first pattern that matches",
        "Both, merged together",
        "Neither, it returns a 404",
      ],
      answer: 1,
      explain:
        "CloudFront uses the first cache behavior whose pattern matches, in list order. /images/* matches first, so the * default never gets a look.",
    },
    {
      q: "A request for /about.html matches neither /images/* nor /api/*. Which behavior serves it?",
      opts: [
        "None, CloudFront returns a 404",
        "The /images/* behavior, as the closest prefix",
        "The * default behavior, which sits last and catches everything else",
        "The request is queued until a matching behavior is added",
      ],
      answer: 2,
      explain:
        "The default behavior with pattern * sits last and catches everything the more specific patterns did not, so /about.html is served by the * default.",
    },
    {
      q: "You updated a file but need viewers to stop seeing the old cached copy now. Most durable fix?",
      opts: [
        "Invalidate the path on every deploy",
        "Serve the file under a new versioned name",
        "Delete the distribution",
        "Lower the TTL to zero forever",
      ],
      answer: 1,
      explain:
        "Versioned file names are free, roll back easily, and defeat caches between the edge and the viewer. Invalidations are billed per path and cannot reach a corporate proxy.",
    },
  ],
};

const AZURE: CdnContent = {
  chapters: [
    {
      navLabel: "The edge",
      kicker: "Chapter 1 · Why the edge",
      title: "Content that meets the viewer",
      intro:
        "A viewer in Sydney should not wait on a round trip to a server in Virginia. Front Door answers from a point of presence near the viewer and rides the Microsoft global network the rest of the way.",
    },
    {
      navLabel: "Hit or miss",
      kicker: "Chapter 2 · Cache hit and miss",
      title: "The first request pays, the rest are cheap",
      intro:
        "The edge only speeds things up once it holds a copy, and only when caching is turned on for the route. Trace a cold request to the origin, then a warm one served from the edge, then a dynamic route with caching off.",
    },
    {
      navLabel: "Cache key",
      kicker: "Chapter 3 · The cache key",
      title: "What counts as the same request",
      intro:
        "Two requests share a cached response only when they resolve to the same key. Choose what shapes the key and watch the cache either share one copy or split into many.",
    },
    {
      navLabel: "Routing",
      kicker: "Chapter 4 · Routing to origins",
      title: "One endpoint, many origins",
      intro:
        "A Front Door endpoint fronts several origin groups. Routes decide which origin group serves each path, and Front Door picks the most specific match.",
    },
    {
      navLabel: "Operations",
      kicker: "Chapter 5 · Fresh and protected",
      title: "Update, expire, and lock content",
      intro:
        "Caching is only useful if you can also change and protect what is cached. Pick a situation and see the mechanism Front Door gives you for it.",
    },
    {
      navLabel: "Quiz",
      kicker: "Chapter 6 · Check yourself",
      title: "Twelve questions",
      intro:
        "Twelve short questions on edges, cache keys, and routes. Each explains itself once you answer.",
    },
  ],

  edge: {
    originLabel: "Origin Region · East US",
    edgeTerm: "point of presence",
    networkName: "Microsoft global network",
    viewers: [
      {
        id: "syd",
        city: "Sydney",
        directMs: 220,
        edgeMs: 12,
        edgeName: "Sydney PoP",
      },
      {
        id: "lon",
        city: "London",
        directMs: 88,
        edgeMs: 9,
        edgeName: "London PoP",
      },
      {
        id: "sao",
        city: "Sao Paulo",
        directMs: 130,
        edgeMs: 14,
        edgeName: "Sao Paulo PoP",
      },
      {
        id: "tok",
        city: "Tokyo",
        directMs: 168,
        edgeMs: 11,
        edgeName: "Tokyo PoP",
      },
    ],
    note: "Latency is the time to the first byte, and it tracks distance. An anycast address plus split TCP terminate the viewer's connection at the closest of Front Door's points of presence, spread across metro areas worldwide.",
    callouts: [
      {
        kind: "note",
        tag: "More than a cache",
        title: "Front Door is a global load balancer as well as a CDN",
        body: "The same edge that caches static files also health-probes your origins, routes to the fastest healthy one, and fails over automatically. Caching is one feature layered on top of that acceleration, not the whole service.",
      },
    ],
  },

  trace: {
    viewBox: "0 0 720 200",
    nodes: [
      {
        id: "viewer",
        label: "Viewer",
        sub: "browser",
        tone: "viewer",
        x: 40,
        y: 74,
        w: 140,
        h: 56,
      },
      {
        id: "edge",
        label: "Point of presence",
        sub: "edge cache",
        tone: "edge",
        x: 288,
        y: 74,
        w: 150,
        h: 56,
      },
      {
        id: "origin",
        label: "Origin",
        sub: "in an origin group",
        tone: "origin",
        x: 540,
        y: 74,
        w: 150,
        h: 56,
      },
    ],
    flows: [
      {
        id: "cold",
        label: "First request · cold cache",
        path: ["viewer", "edge", "origin"],
        outcome: "miss",
        terminal: "origin",
        title: "Cache miss",
        body: "The point of presence had no valid response, so it forwarded the request to the origin group and picked a healthy origin. The response streams back and is cached at that edge site. Each edge site keeps its own cache.",
      },
      {
        id: "warm",
        label: "Next request · warm cache",
        path: ["viewer", "edge"],
        outcome: "hit",
        terminal: "edge",
        title: "Cache hit",
        body: "This point of presence already holds a valid response for the route, so it answers directly. The origin never hears about this request.",
      },
      {
        id: "dynamic",
        label: "Caching disabled route · not cached",
        path: ["viewer", "edge", "origin"],
        outcome: "dynamic",
        terminal: "origin",
        title: "Never cached",
        body: "Caching is off for this route, or the method is not GET, so every request is proxied to the origin. You still gain TLS offload, health-based routing, and the fast network path, but not a cache hit.",
      },
    ],
    note: "Front Door caches only GET responses, and only on routes where you turn caching on. How long a response stays fresh comes from its Cache-Control header, which you can override with the rules engine.",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A CDN does not make the first request faster",
        body: "The first viewer to ask for a cold object still waits for the origin fetch. The win is that later viewers at that same point of presence are served from cache. Because each edge site caches independently, some traffic still reaches the origin.",
      },
    ],
  },

  cacheKey: {
    configName: "query string behavior and rules engine",
    requestPath: "/content/story.html",
    parts: [
      {
        id: "path",
        label: "Host + URL path",
        aValue: "/content/story.html",
        bValue: "/content/story.html",
        locked: true,
        defaultOn: true,
        hint: "Always part of the key. The host plus the path identify the response.",
      },
      {
        id: "query",
        label: "Query string",
        aValue: "?ref=twitter",
        bValue: "?ref=email",
        hint: "Controlled by the route's query string behavior. Ignore it, or cache every unique URL.",
      },
      {
        id: "lang",
        label: "Accept-Language header",
        aValue: "en",
        bValue: "de",
        hint: "Added through the rules engine when the origin returns different content per language.",
      },
      {
        id: "cookie",
        label: "Session cookie",
        aValue: "theme=dark",
        bValue: "theme=light",
        hint: "A per-user value in the key can drop your hit ratio to near zero.",
      },
    ],
    note: "Front Door's query string behavior decides whether the query is part of the key. Ignore Query String shares one copy across query variants, while Use Query String caches every unique URL separately. Every value you key on can split one cached response into many.",
    callouts: [
      {
        kind: "fix",
        tag: "Higher hit ratio",
        title: "Key on the minimum",
        body: "Include a value only when it changes what the origin returns. A marketing query string like ref=twitter usually does not, so ignoring the query lets both links share one cached response.",
      },
    ],
  },

  routing: {
    matchOrder: "specific",
    ruleTerm: "route",
    algorithm:
      "Front Door matches on protocol, then host, then path, and always picks the most specific match. An exact path wins over a wildcard, and if nothing matches the request is rejected with a 404.",
    rules: [
      {
        id: "img",
        pattern: "/images/*",
        origin: "images origin group (Blob Storage)",
        note: "Static images, caching on.",
      },
      {
        id: "api",
        pattern: "/api/*",
        origin: "api origin group (App Service)",
        note: "Dynamic, caching off.",
      },
      {
        id: "home",
        pattern: "/",
        origin: "site origin group (Blob Storage)",
        note: "Exact match for the home page.",
      },
    ],
    samplePaths: ["/images/logo.png", "/api/orders", "/", "/about.html"],
    noMatch:
      "No route matches this path, so Front Door returns a 404. Unlike a catch-all pattern, an unmatched request is rejected rather than sent to a default origin.",
    note: "Front Door has no implicit catch-all. If you want a fallback, add a route with a /* pattern; otherwise unmatched paths return a 404.",
    callouts: [
      {
        kind: "note",
        tag: "Most specific wins",
        title: "Exact paths beat wildcards",
        body: "A wildcard * is only valid at the end of a path and must follow a slash. When both an exact path and a /* pattern could match, Front Door takes the exact one.",
      },
    ],
  },

  ops: {
    scenarios: [
      {
        id: "update",
        label: "You shipped a new logo",
        question:
          "You replaced logo.png at the origin, but viewers still see the old one from cache.",
        mechanism: "Cache purge or versioned names",
        tone: "miss",
        verdict: "Purge the path, or rename the file",
        why: "A purge removes the file from Front Door's edge caches so the next request refetches it. For frequent updates, versioned file names avoid purges entirely and also defeat caches between the edge and the viewer.",
        cli: 'az afd endpoint purge --resource-group shop-rg --profile-name shop --endpoint-name web --content-paths "/logo.png"',
      },
      {
        id: "ttl",
        label: "A price feed must stay fresh",
        question: "A JSON file changes often and must not go stale for long.",
        mechanism: "Cache-Control and rules engine",
        tone: "edge",
        verdict: "Set a short freshness",
        why: "Send a short Cache-Control max-age from the origin, or set a cache expiration override in the rules engine for the route. The edge then refetches once the response is no longer fresh.",
      },
      {
        id: "lock",
        label: "Lock premium video to buyers",
        question: "Only paying users should be able to fetch the video files.",
        mechanism: "WAF and rules engine",
        tone: "block",
        verdict: "Gate at the edge",
        why: "Front Door has no built-in signed URL like CloudFront. You restrict access with the Web Application Firewall and rules engine, for example checking a token or header, and let your app hand that token only to authorized viewers.",
      },
      {
        id: "private",
        label: "Keep the origin private",
        question:
          "The origin should be reachable only through Front Door, never directly.",
        mechanism: "Private Link",
        tone: "block",
        verdict: "Connect with Private Link",
        why: "Azure Private Link connects Front Door to your origin over the Microsoft network, so the origin has no public endpoint. This is the Zero Trust path for private origins.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "Prefer versioning",
        title: "Renaming beats purging for frequent changes",
        body: "Versioned file names like app.9f2c.css also defeat any caches between the edge and the viewer, such as a corporate proxy, which a purge cannot reach. They are cheaper and easier to roll back.",
      },
    ],
  },

  quiz: [
    {
      q: "A viewer in Sydney and a viewer in London both load the same site through Front Door. What terminates each viewer's connection close to them?",
      opts: [
        "An anycast address plus split TCP terminate the connection at the closest point of presence",
        "A single origin in East US handles both directly",
        "Each viewer selects a point of presence by hand",
        "Both are routed to the London PoP",
      ],
      answer: 0,
      explain:
        "An anycast address plus split TCP terminate each viewer's connection at the closest of Front Door's points of presence, spread across metro areas worldwide.",
    },
    {
      q: "Besides caching static files, what else does the same Front Door edge do for your origins?",
      opts: [
        "Nothing, Front Door is only a cache",
        "It health-probes your origins, routes to the fastest healthy one, and fails over automatically",
        "It stores your origin's database",
        "It rewrites your application code",
      ],
      answer: 1,
      explain:
        "Front Door is a global load balancer as well as a CDN. The same edge health-probes your origins, routes to the fastest healthy one, and fails over automatically. Caching is one feature layered on top.",
    },
    {
      q: "The very first viewer requests a cold object on a caching-enabled route. What happens?",
      opts: [
        "It is served instantly from the edge cache",
        "The point of presence misses and fetches it from the origin, then caches it",
        "The request is rejected until the cache is warmed",
        "Front Door returns a placeholder",
      ],
      answer: 1,
      explain:
        "A cold object is a cache miss. The point of presence forwards to the origin group, streams the response to the viewer, and stores it for next time.",
    },
    {
      q: "One point of presence already holds a warm copy of an object. A viewer at a different PoP requests the same object for the first time. What happens?",
      opts: [
        "The second PoP serves it instantly from the first PoP's cache",
        "Front Door merges the two PoP caches automatically",
        "It is a miss at the second PoP, which fetches from the origin, because each edge site caches independently",
        "The request is rejected",
      ],
      answer: 2,
      explain:
        "Each edge site keeps its own cache. A warm copy at one point of presence does not help another, so the first request at a different PoP is a miss that reaches the origin.",
    },
    {
      q: "A route has caching turned off. What happens on each request to it, and what do you still gain from Front Door?",
      opts: [
        "It is cached after the first request anyway",
        "Front Door returns a 404",
        "Every request is proxied to the origin, but you still get TLS offload, health-based routing, and the fast network path",
        "The request is cached for 24 hours",
      ],
      answer: 2,
      explain:
        "With caching off, or a non-GET method, every request is proxied to the origin. You still gain TLS offload, health-based routing, and the fast network path, just not a cache hit.",
    },
    {
      q: "Which requests can Front Door cache?",
      opts: [
        "Any request on any route",
        "Only GET requests, and only on routes where caching is enabled",
        "Only POST requests",
        "Every request, automatically",
      ],
      answer: 1,
      explain:
        "Only GET responses are cacheable, and only when caching is turned on for the route. Caching is off by default and every other method is proxied.",
    },
    {
      q: "Before you change any query string behavior, what identifies a cached response in Front Door?",
      opts: [
        "The full request including all headers and cookies",
        "The host plus the URL path",
        "Only the query string",
        "The viewer's IP address",
      ],
      answer: 1,
      explain:
        "The host plus the URL path always identify the response. Query strings and headers only shape the key when you turn them on through the query string behavior or the rules engine.",
    },
    {
      q: "Two links differ only by a ref query string that does not change the response. What raises the hit ratio?",
      opts: [
        "Cache every unique URL",
        "Set the query string behavior to ignore the query",
        "Disable caching for the route",
        "Give each link a different path",
      ],
      answer: 1,
      explain:
        "Ignore Query String makes both links resolve to the same key and share one cached response, which raises the hit ratio.",
    },
    {
      q: "You key on a per-user session cookie like theme=dark. What is the likely effect on the hit ratio?",
      opts: [
        "It rises, because responses become more specific",
        "It stays the same, because cookies are ignored",
        "Caching is turned off entirely",
        "It drops to near zero, because each user's value splits the response into a separate copy",
      ],
      answer: 3,
      explain:
        "Every value you key on can split one cached response into many. A per-user cookie value gives almost every request a unique key, which can drop the hit ratio to near zero.",
    },
    {
      q: "When both an exact path and a /* wildcard route could match, which wins?",
      opts: [
        "The wildcard, because it is broader",
        "The exact path, because Front Door picks the most specific match",
        "Whichever is listed first",
        "Both, merged together",
      ],
      answer: 1,
      explain:
        "Front Door always takes the most specific match, and an exact path is more specific than a wildcard.",
    },
    {
      q: "A request arrives for a path that no route matches. What does Front Door do?",
      opts: [
        "Sends it to a default origin",
        "Returns a 404",
        "Caches an empty response",
        "Retries against every origin",
      ],
      answer: 1,
      explain:
        "Front Door has no implicit catch-all. An unmatched path returns a 404 unless you add a route with a /* pattern as a fallback.",
    },
    {
      q: "You replaced logo.png at the origin but viewers still see the old cached copy. What is the durable fix that also reaches caches between the edge and the viewer?",
      opts: [
        "Purge the path on every deploy",
        "Serve the file under a new versioned name",
        "Delete the Front Door profile",
        "Turn caching off forever",
      ],
      answer: 1,
      explain:
        "A purge removes the file from Front Door's edge caches, but versioned file names avoid purges entirely and also defeat caches between the edge and the viewer, such as a corporate proxy, which a purge cannot reach.",
    },
  ],
};

export const CONTENT: Record<Provider, CdnContent> = {
  aws: AWS,
  azure: AZURE,
};
