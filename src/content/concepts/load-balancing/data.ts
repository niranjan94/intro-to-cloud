import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/**
 * All per-provider content for the Load Balancing lesson, keyed by Provider.
 * The interactive components are provider-agnostic and render whatever slice of
 * this model they are handed, so every difference between AWS and Azure lives
 * here as data, not as branching in render code (ADR-0003).
 *
 * The load-balancing concept diverges between the providers in a way worth
 * teaching: AWS bundles both layers under one service (Elastic Load Balancing)
 * and you pick the layer by picking the load balancer type (Application = L7,
 * Network = L4), whereas Azure splits the layers across two distinct services
 * (Application Gateway = L7, Azure Load Balancer = L4). Grounded in the
 * providers' own documentation (docs.aws.amazon.com and learn.microsoft.com).
 */

import type { Provider } from "@/content/types";

/** A single multiple-choice question; structurally identical to the kit's. */
export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/** Framing for one chapter: matches the shape the chapter shell renders. */
export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* Chapter 1 — the core fan-out model. */
export interface FanOutTarget {
  id: string;
  name: string;
  ip: string;
}
export interface FanOutContent {
  frontDoorLabel: string;
  frontDoorSub: string;
  poolLabel: string;
  targetNoun: string;
  algorithm: string;
  targets: FanOutTarget[];
  healthNote: string;
  note: string;
  callouts: CalloutData[];
}

/* Chapter 2 — what each layer can read. */
export interface RequestModel {
  transport: {
    srcIp: string;
    srcPort: string;
    dstIp: string;
    dstPort: string;
    protocol: string;
  };
  application: {
    method: string;
    host: string;
    path: string;
    headers: { name: string; value: string }[];
  };
}
export interface LayerFacet {
  layer: "l4" | "l7";
  name: string;
  service: string;
  sees: string[];
  blind: string[];
  routesOn: string;
}
export interface InspectorContent {
  request: RequestModel;
  facets: LayerFacet[];
  callouts: CalloutData[];
}

/* Chapter 3 — routing by content (Layer 7). */
export interface RouteRule {
  id: string;
  kind: "host" | "path";
  pattern: string;
  label: string;
  target: string;
}
export interface RouterRequest {
  id: string;
  label: string;
  host: string;
  path: string;
}
export interface RouterContent {
  rulesLabel: string;
  rules: RouteRule[];
  defaultTarget: string;
  requests: RouterRequest[];
  l4Fallback: string;
  callouts: CalloutData[];
}

/* Chapter 4 — the public/private exposure pattern. */
export interface ExposureInstance {
  id: string;
  name: string;
  sub: string;
}
export interface ExposureFlow {
  id: string;
  kind: "via-lb" | "direct";
  label: string;
  allowed: boolean;
  verdictTitle: string;
  why: string;
}
export interface ExposureContent {
  publicZoneLabel: string;
  publicZoneSub: string;
  privateZoneLabel: string;
  privateZoneSub: string;
  lbLabel: string;
  lbSub: string;
  instances: ExposureInstance[];
  flows: ExposureFlow[];
  subnetNote: string;
  callouts: CalloutData[];
}

/* Chapter 5 — pick a layer. */
export interface PickerScenario {
  id: string;
  label: string;
  need: string;
  layer: "l4" | "l7";
  verdict: string;
  verdictTone: Tone;
  gain: string;
  cost: string;
}
export interface PickerContent {
  scenarios: PickerScenario[];
  callouts: CalloutData[];
}

export interface LessonContent {
  /** Five guided chapters plus the quiz meta as the final entry. */
  chapters: ChapterMeta[];
  fanOut: FanOutContent;
  inspector: InspectorContent;
  router: RouterContent;
  exposure: ExposureContent;
  picker: PickerContent;
  quiz: QuizQ[];
}

const CHAPTERS: ChapterMeta[] = [
  {
    navLabel: "fan out",
    kicker: "The core model",
    title: "One door, many servers",
    intro:
      "A load balancer gives your app a single front door: one address, one DNS name, and spreads incoming requests across a pool of identical servers behind it. It health-checks each one and quietly stops sending traffic to any that fail, so a broken server never reaches a user.",
  },
  {
    navLabel: "layer",
    kicker: "Where it works",
    title: "Layer 4 or Layer 7",
    intro:
      "The single biggest choice is which layer the balancer works at. A Layer 4 balancer sees only the transport envelope: source and destination IP and port. A Layer 7 balancer opens the HTTP request and reads the method, host, path, and headers. What it can see is exactly what it can route on.",
  },
  {
    navLabel: "route",
    kicker: "What Layer 7 buys",
    title: "Routing by content",
    intro:
      "Because a Layer 7 balancer reads the HTTP request, it can send one path to one pool, another path to a second, and a different hostname to a third, all behind one address. Rules are evaluated in order and the first match wins. A Layer 4 balancer cannot do this: it only knows the port.",
  },
  {
    navLabel: "expose",
    kicker: "The exposure pattern",
    title: "Public door, private rooms",
    intro:
      "This is the pattern that lets you put an app on the internet without putting the server on the internet. The balancer takes the public address; your servers keep private addresses only. The internet can reach the balancer, and only the balancer can reach the servers.",
  },
  {
    navLabel: "choose",
    kicker: "Pick a layer",
    title: "When to pick what",
    intro:
      "Layer 7 gives you content routing, TLS termination, and a web firewall, at the cost of being HTTP-only and doing more work per request. Layer 4 gives you raw speed, any TCP or UDP protocol, and pass-through simplicity, at the cost of being blind to anything above the connection. Match the layer to the traffic.",
  },
  {
    navLabel: "quiz",
    kicker: "Check yourself",
    title: "Quick check",
    intro:
      "Five questions to see whether the model stuck. Answer each one to reveal why.",
  },
];

export const CONTENT: Record<Provider, LessonContent> = {
  aws: {
    chapters: CHAPTERS,
    fanOut: {
      frontDoorLabel: "Load balancer",
      frontDoorSub: "one DNS name for the whole app",
      poolLabel: "Target group",
      targetNoun: "target",
      algorithm:
        "By default an Application Load Balancer spreads requests round robin across the healthy targets.",
      targets: [
        { id: "t1", name: "web-1", ip: "10.0.1.11" },
        { id: "t2", name: "web-2", ip: "10.0.1.12" },
        { id: "t3", name: "web-3", ip: "10.0.1.13" },
      ],
      healthNote:
        "The load balancer sends a periodic health check to each target. One that fails is marked unhealthy and taken out of rotation, so a user's request never lands on it. When it passes again, it rejoins the group.",
      note: "Targets are interchangeable. Adding or removing one changes throughput, not the address users type.",
      callouts: [
        {
          kind: "note",
          tag: "Under the hood",
          title: "Round robin is not the only algorithm",
          body: "An Application Load Balancer defaults to round robin and can switch to least outstanding requests. A Network Load Balancer instead hashes the connection tuple, so a given client sticks to one target. Either way, only healthy targets are in play.",
        },
      ],
    },
    inspector: {
      request: {
        transport: {
          srcIp: "203.0.113.42",
          srcPort: "51514",
          dstIp: "the load balancer",
          dstPort: "443",
          protocol: "TCP",
        },
        application: {
          method: "GET",
          host: "shop.example.com",
          path: "/api/orders?id=42",
          headers: [
            { name: "Cookie", value: "session=ab12cd" },
            { name: "User-Agent", value: "Mozilla/5.0" },
          ],
        },
      },
      facets: [
        {
          layer: "l4",
          name: "Layer 4 · transport",
          service: "Network Load Balancer (NLB)",
          sees: [
            "Source IP and port",
            "Destination IP and port",
            "Protocol: TCP, UDP, or TLS",
          ],
          blind: [
            "The URL path",
            "The Host header",
            "Cookies and any other header",
          ],
          routesOn:
            "Hashes the connection tuple to one target and forwards the raw connection. It never opens the request.",
        },
        {
          layer: "l7",
          name: "Layer 7 · application",
          service: "Application Load Balancer (ALB)",
          sees: [
            "Everything Layer 4 sees",
            "HTTP method and URL path",
            "Host header and query string",
            "Cookies and any header",
          ],
          blind: ["Anything that is not HTTP or HTTPS"],
          routesOn:
            "Reads the HTTP request and matches it against listener rules to choose a target group.",
        },
      ],
      callouts: [
        {
          kind: "myth",
          tag: "Common mix-up",
          title: "A Layer 4 balancer can just read the URL",
          body: "It cannot. The path and host live inside the HTTP request, above the transport layer. To route on them the balancer must terminate the connection and read HTTP, which is exactly what a Layer 7 balancer does. Need path routing? You need Layer 7.",
        },
        {
          kind: "note",
          tag: "AWS shape",
          title: "One service, pick the type",
          body: "AWS bundles both layers under Elastic Load Balancing. The Application Load Balancer is Layer 7 and the Network Load Balancer is Layer 4; you choose the layer by choosing the load balancer type.",
        },
      ],
    },
    router: {
      rulesLabel: "Listener rules · first match wins",
      rules: [
        {
          id: "r1",
          kind: "host",
          pattern: "admin.shop.example.com",
          label: "Host is admin.shop.example.com",
          target: "admin-targets",
        },
        {
          id: "r2",
          kind: "path",
          pattern: "/api",
          label: "Path starts with /api",
          target: "api-targets",
        },
        {
          id: "r3",
          kind: "path",
          pattern: "/images",
          label: "Path starts with /images",
          target: "static-targets",
        },
      ],
      defaultTarget: "web-targets",
      requests: [
        {
          id: "q1",
          label: "Open the storefront",
          host: "shop.example.com",
          path: "/",
        },
        {
          id: "q2",
          label: "Load a product image",
          host: "shop.example.com",
          path: "/images/shoe.jpg",
        },
        {
          id: "q3",
          label: "Place an order (API)",
          host: "shop.example.com",
          path: "/api/orders",
        },
        {
          id: "q4",
          label: "Visit the admin panel",
          host: "admin.shop.example.com",
          path: "/dashboard",
        },
      ],
      l4Fallback:
        "Switch to a Network Load Balancer and the rules vanish. Every connection to port 443 goes to a single target group, because a Layer 4 balancer sees only the port, not the path or host.",
      callouts: [
        {
          kind: "fix",
          tag: "Why it matters",
          title: "One address can front an entire site",
          body: "Path and host rules are why a single balancer can serve the storefront, the API, the images, and the admin panel, each on its own target group, all sharing one public address and one TLS certificate.",
        },
        {
          kind: "note",
          tag: "Rule order",
          title: "Priority, then a default",
          body: "The load balancer evaluates listener rules in priority order and the first match wins, so put the most specific rules first. A required default action catches everything that matches no rule.",
        },
      ],
    },
    exposure: {
      publicZoneLabel: "Public subnet",
      publicZoneSub: "has a route to an internet gateway",
      privateZoneLabel: "Private subnet",
      privateZoneSub: "no route to the internet gateway",
      lbLabel: "Load balancer",
      lbSub: "public IP · scheme: internet-facing",
      instances: [
        { id: "i1", name: "app-1", sub: "10.0.1.11 · private IP only" },
        { id: "i2", name: "app-2", sub: "10.0.1.12 · private IP only" },
      ],
      flows: [
        {
          id: "f1",
          kind: "via-lb",
          label: "User → load balancer",
          allowed: true,
          verdictTitle: "Reaches the app",
          why: "The user hits the load balancer's public address in the public subnet. The balancer opens a fresh connection to a target's private IP and forwards the request. The user never learns the server's address.",
        },
        {
          id: "f2",
          kind: "direct",
          label: "User → server directly",
          allowed: false,
          verdictTitle: "Blocked",
          why: "The instances have no public IP and sit in a subnet with no route to the internet gateway, so a packet from the internet has no path to them. The only way in is through the load balancer.",
        },
      ],
      subnetNote:
        "An internet-facing Application Load Balancer needs public subnets in at least two Availability Zones, each a /27 or larger with at least eight free IP addresses. The targets stay in private subnets.",
      callouts: [
        {
          kind: "myth",
          tag: "Common mix-up",
          title: "Exposing the app means exposing the server",
          body: "It does not. The balancer is the only thing with a public address. The servers keep private IPs and are reachable only through the balancer, which shrinks their attack surface to one door you control.",
        },
        {
          kind: "note",
          tag: "The other direction",
          title: "Internal load balancers stay private",
          body: "An internal load balancer (scheme: internal) has only private IPs and never touches the internet. Reach for it to spread traffic between private tiers, such as a web tier calling a backend tier.",
        },
      ],
    },
    picker: {
      scenarios: [
        {
          id: "s1",
          label: "Public HTTPS site, split /api and /images to different pools",
          need: "Content-based routing on the URL path and host",
          layer: "l7",
          verdict: "Layer 7 · Application Load Balancer",
          verdictTone: "l7",
          gain: "Path and host rules, TLS termination, and AWS WAF in front, all behind one address and one certificate.",
          cost: "HTTP and HTTPS only, and a little more latency per request as it terminates and re-opens each connection.",
        },
        {
          id: "s2",
          label: "Millions of connections to a game backend over raw TCP",
          need: "Extreme throughput and low latency over a non-HTTP protocol",
          layer: "l4",
          verdict: "Layer 4 · Network Load Balancer",
          verdictTone: "l4",
          gain: "Millions of requests per second at ultra-low latency, TCP or UDP, and the client source IP can be preserved.",
          cost: "No path or host routing and no web firewall; it knows only IP and port.",
        },
        {
          id: "s3",
          label:
            "A public endpoint that must present one fixed IP to allow-list",
          need: "A stable static IP address for the front door",
          layer: "l4",
          verdict: "Layer 4 · Network Load Balancer",
          verdictTone: "l4",
          gain: "A static IP per Availability Zone, and you can attach an Elastic IP, which an Application Load Balancer does not offer.",
          cost: "You give up content routing and TLS termination; add a Layer 7 balancer behind it if you need those.",
        },
        {
          id: "s4",
          label: "Block SQL injection and common web attacks at the edge",
          need: "A managed web application firewall",
          layer: "l7",
          verdict: "Layer 7 · Application Load Balancer",
          verdictTone: "l7",
          gain: "Native AWS WAF integration inspects each HTTP request and drops malicious ones before they reach a target.",
          cost: "Protects HTTP and HTTPS only; a Layer 4 balancer cannot run a web firewall because it never reads the request.",
        },
      ],
      callouts: [
        {
          kind: "note",
          tag: "Not exclusive",
          title: "You can stack both",
          body: "A common shape is a Network Load Balancer at the edge for raw throughput and a static IP, with an Application Load Balancer behind it for content routing. Pick per tier, not once per app.",
        },
        {
          kind: "fix",
          tag: "The full menu",
          title: "ALB, NLB, and two more",
          body: "Elastic Load Balancing also has a Gateway Load Balancer for inserting security appliances, and the previous-generation Classic Load Balancer. For new work the choice is an Application Load Balancer for Layer 7 or a Network Load Balancer for Layer 4.",
        },
      ],
    },
    quiz: [
      {
        q: "You need to send /api requests to one set of servers and /images to another, behind a single public address. Which do you reach for?",
        opts: [
          "A Network Load Balancer (Layer 4)",
          "An Application Load Balancer (Layer 7)",
          "Either one works the same way",
          "Neither; you need two separate addresses",
        ],
        answer: 1,
        explain:
          "Routing on the URL path means reading the HTTP request, which only a Layer 7 balancer does. The Application Load Balancer matches listener rules on path and host; a Network Load Balancer sees only IP and port.",
      },
      {
        q: "Your backend instances are in private subnets with no public IP. How does a user on the internet reach the app?",
        opts: [
          "They cannot; the app is unreachable",
          "Through an internet-facing load balancer in a public subnet, which forwards to the private targets",
          "By attaching a public IP to each instance",
          "Through the internet gateway straight to the instances",
        ],
        answer: 1,
        explain:
          "The internet-facing load balancer sits in a public subnet with a public address and opens connections to the targets' private IPs. The servers stay private; only the balancer is exposed.",
      },
      {
        q: "What can a Layer 4 Network Load Balancer NOT do?",
        opts: [
          "Handle millions of requests per second",
          "Balance UDP traffic",
          "Route based on the URL path",
          "Preserve the client source IP",
        ],
        answer: 2,
        explain:
          "A Layer 4 balancer forwards connections by IP and port without reading the payload, so it cannot see or route on the URL path. That needs Layer 7. It can do the other three.",
      },
      {
        q: "Which is a real cost of choosing a Layer 7 load balancer?",
        opts: [
          "It cannot terminate TLS",
          "It works only with HTTP and HTTPS traffic",
          "It has no health checks",
          "It cannot use security groups",
        ],
        answer: 1,
        explain:
          "A Layer 7 balancer is an HTTP-aware reverse proxy, so it handles HTTP and HTTPS only; non-HTTP protocols need a Layer 4 balancer. TLS termination, health checks, and security groups are all things an ALB does.",
      },
      {
        q: "In AWS, how do you choose between Layer 4 and Layer 7?",
        opts: [
          "By AWS Region",
          "By the load balancer type under Elastic Load Balancing: Application (L7) or Network (L4)",
          "By the instance size behind it",
          "You cannot; Elastic Load Balancing is always Layer 7",
        ],
        answer: 1,
        explain:
          "Elastic Load Balancing makes the layer a type choice: Application Load Balancer for Layer 7, Network Load Balancer for Layer 4, plus Gateway Load Balancer for appliances. You pick the layer by picking the type.",
      },
      {
        q: "A target starts failing its health check. What does the load balancer do?",
        opts: [
          "Sends it an error page to display",
          "Takes it out of rotation and routes to the remaining healthy targets",
          "Shuts the whole target group down",
          "Keeps sending it traffic until you intervene",
        ],
        answer: 1,
        explain:
          "A failing target is marked unhealthy and taken out of rotation, so requests go only to targets still passing the check. When it passes again, it rejoins the group. The balancer never sends a user to a known-bad target.",
      },
      {
        q: "You want to terminate TLS at the load balancer so it can inspect and route on the HTTP request. Which type lets you do that?",
        opts: [
          "A Network Load Balancer",
          "An Application Load Balancer",
          "A Gateway Load Balancer",
          "Any type; they all read HTTP",
        ],
        answer: 1,
        explain:
          "Reading the HTTP request means terminating TLS and working at Layer 7, which is the Application Load Balancer. It uses certificates from AWS Certificate Manager. A Network Load Balancer can pass TLS through but does not read the request.",
      },
      {
        q: "You want AWS WAF to filter malicious HTTP requests before they reach your servers. Which load balancer can you attach it to?",
        opts: [
          "Network Load Balancer",
          "Application Load Balancer",
          "Gateway Load Balancer",
          "WAF cannot attach to any load balancer",
        ],
        answer: 1,
        explain:
          "AWS WAF inspects HTTP requests, so it attaches to the Layer 7 Application Load Balancer. A Network Load Balancer never reads the request body, so a web firewall in front of it is not possible.",
      },
      {
        q: "You need the load balancer to present one fixed IP address that a partner can add to an allow-list. Which type gives you a static IP?",
        opts: [
          "Application Load Balancer",
          "Network Load Balancer",
          "Neither; load balancer IPs always change",
          "Only an internal load balancer",
        ],
        answer: 1,
        explain:
          "A Network Load Balancer gets a static IP address per Availability Zone and can have an Elastic IP attached. An Application Load Balancer does not offer a fixed IP; you reach it by its DNS name instead.",
      },
      {
        q: "How does cross-zone load balancing differ by default between the two types?",
        opts: [
          "It is off for both by default",
          "It is on for both by default",
          "Always on for the Application Load Balancer, off by default for the Network Load Balancer",
          "It is only available on the Network Load Balancer",
        ],
        answer: 2,
        explain:
          "Cross-zone load balancing is always enabled at the load balancer level for an Application Load Balancer, but disabled by default for a Network Load Balancer, where you turn it on per target group if you want it.",
      },
      {
        q: "What does an internet-facing Application Load Balancer require of its subnets?",
        opts: [
          "One public subnet is enough",
          "Public subnets in at least two Availability Zones, each with enough free IP addresses",
          "The same private subnets as its targets",
          "A dedicated subnet with no other resources",
        ],
        answer: 1,
        explain:
          "An internet-facing Application Load Balancer needs public subnets in at least two Availability Zones, each a /27 or larger with at least eight free IP addresses so it can scale. The targets themselves stay in private subnets.",
      },
      {
        q: "You must load-balance a UDP-based protocol that is not HTTP. Which do you reach for?",
        opts: [
          "An Application Load Balancer, in UDP mode",
          "A Network Load Balancer",
          "A Gateway Load Balancer",
          "Neither; UDP cannot be load-balanced",
        ],
        answer: 1,
        explain:
          "A Network Load Balancer works at Layer 4 and supports TCP and UDP, so it fits any non-HTTP protocol. An Application Load Balancer only handles HTTP and HTTPS, so it cannot carry raw UDP.",
      },
    ],
  },
  azure: {
    chapters: CHAPTERS,
    fanOut: {
      frontDoorLabel: "Load balancer",
      frontDoorSub: "one frontend IP for the whole app",
      poolLabel: "Backend pool",
      targetNoun: "backend",
      algorithm:
        "By default Azure Load Balancer spreads new flows across the healthy backends using a five-tuple hash.",
      targets: [
        { id: "t1", name: "vm-1", ip: "10.21.1.4" },
        { id: "t2", name: "vm-2", ip: "10.21.1.5" },
        { id: "t3", name: "vm-3", ip: "10.21.1.6" },
      ],
      healthNote:
        "A health probe checks each backend on an interval. One that fails is dropped from the pool, so a user's request never lands on it. When it passes again, it rejoins the pool.",
      note: "Backends are interchangeable. Adding or removing one changes throughput, not the address users type.",
      callouts: [
        {
          kind: "note",
          tag: "Under the hood",
          title: "Hash versus round robin",
          body: "Azure Load Balancer hashes the five-tuple, so a given flow sticks to one backend. Application Gateway, the Layer 7 service, uses round robin across backends. Either way, only backends passing the health probe are in play.",
        },
      ],
    },
    inspector: {
      request: {
        transport: {
          srcIp: "203.0.113.42",
          srcPort: "51514",
          dstIp: "the frontend IP",
          dstPort: "443",
          protocol: "TCP",
        },
        application: {
          method: "GET",
          host: "shop.example.com",
          path: "/api/orders?id=42",
          headers: [
            { name: "Cookie", value: "session=ab12cd" },
            { name: "User-Agent", value: "Mozilla/5.0" },
          ],
        },
      },
      facets: [
        {
          layer: "l4",
          name: "Layer 4 · transport",
          service: "Azure Load Balancer",
          sees: [
            "Source IP and port",
            "Destination IP and port",
            "Protocol: TCP or UDP",
          ],
          blind: [
            "The URL path",
            "The Host header",
            "Cookies and any other header",
          ],
          routesOn:
            "Hashes the connection tuple to one backend and forwards the raw flow. It never opens the request.",
        },
        {
          layer: "l7",
          name: "Layer 7 · application",
          service: "Application Gateway",
          sees: [
            "Everything Layer 4 sees",
            "HTTP method and URL path",
            "Host header and query string",
            "Cookies and any header",
          ],
          blind: ["Anything that is not HTTP or HTTPS"],
          routesOn:
            "Reads the HTTP request and applies its routing rules to choose a backend pool.",
        },
      ],
      callouts: [
        {
          kind: "myth",
          tag: "Common mix-up",
          title: "A Layer 4 balancer can just read the URL",
          body: "It cannot. The path and host live inside the HTTP request, above the transport layer. To route on them the balancer must terminate the connection and read HTTP, which is exactly what Application Gateway does. Need path routing? You need Layer 7.",
        },
        {
          kind: "note",
          tag: "Azure shape",
          title: "Two services, one per layer",
          body: "Azure splits the layers across separate services. Application Gateway is Layer 7 and Azure Load Balancer is Layer 4; you choose the layer by choosing the service. (Front Door is a global Layer 7 service for routing across regions.)",
        },
      ],
    },
    router: {
      rulesLabel: "Routing rules · listener then path map",
      rules: [
        {
          id: "r1",
          kind: "host",
          pattern: "admin.shop.example.com",
          label: "Listener host is admin.shop.example.com",
          target: "admin-pool",
        },
        {
          id: "r2",
          kind: "path",
          pattern: "/api",
          label: "Path starts with /api",
          target: "api-pool",
        },
        {
          id: "r3",
          kind: "path",
          pattern: "/images",
          label: "Path starts with /images",
          target: "static-pool",
        },
      ],
      defaultTarget: "web-pool",
      requests: [
        {
          id: "q1",
          label: "Open the storefront",
          host: "shop.example.com",
          path: "/",
        },
        {
          id: "q2",
          label: "Load a product image",
          host: "shop.example.com",
          path: "/images/shoe.jpg",
        },
        {
          id: "q3",
          label: "Place an order (API)",
          host: "shop.example.com",
          path: "/api/orders",
        },
        {
          id: "q4",
          label: "Visit the admin panel",
          host: "admin.shop.example.com",
          path: "/dashboard",
        },
      ],
      l4Fallback:
        "Swap Application Gateway for Azure Load Balancer and the rules vanish. Every connection to the frontend port goes to a single backend pool by a five-tuple hash, because a Layer 4 balancer sees only the port, not the path or host.",
      callouts: [
        {
          kind: "fix",
          tag: "Why it matters",
          title: "One frontend can serve an entire site",
          body: "Host listeners and path maps are why a single gateway can serve the storefront, the API, the images, and the admin panel, each on its own backend pool, all sharing one public frontend and one TLS certificate.",
        },
        {
          kind: "note",
          tag: "Rule order",
          title: "Listener first, then the path map",
          body: "Application Gateway matches the listener first (by host and port), then applies the URL path map, with a default backend for anything the path rules do not match.",
        },
      ],
    },
    exposure: {
      publicZoneLabel: "Gateway subnet",
      publicZoneSub: "dedicated subnet · public frontend IP",
      privateZoneLabel: "Backend subnet",
      privateZoneSub: "VMs with private IPs only",
      lbLabel: "Application Gateway",
      lbSub: "public frontend IP · internet-facing",
      instances: [
        { id: "i1", name: "vm-1", sub: "10.21.1.4 · private IP only" },
        { id: "i2", name: "vm-2", sub: "10.21.1.5 · private IP only" },
      ],
      flows: [
        {
          id: "f1",
          kind: "via-lb",
          label: "User → Application Gateway",
          allowed: true,
          verdictTitle: "Reaches the app",
          why: "The user hits the gateway's public frontend IP in its dedicated subnet. The gateway opens a fresh connection to a backend's private IP and forwards the request. The user never learns the VM's address.",
        },
        {
          id: "f2",
          kind: "direct",
          label: "User → VM directly",
          allowed: false,
          verdictTitle: "Blocked",
          why: "The backend VMs are created with no public IP, and the network security group blocks inbound internet traffic, so nothing on the internet can open a connection to them directly. Traffic arrives only through the gateway.",
        },
      ],
      subnetNote:
        "Application Gateway lives in its own dedicated subnet where no other resource is allowed; a /24 is recommended for the v2 SKU. The backend VMs sit in a separate subnet, created with no public IP.",
      callouts: [
        {
          kind: "myth",
          tag: "Common mix-up",
          title: "Exposing the app means exposing the VM",
          body: "It does not. The gateway is the only thing with a public address. The VMs keep private IPs and are reachable only through it, which shrinks their attack surface to one door you control.",
        },
        {
          kind: "note",
          tag: "The other direction",
          title: "Internal frontends stay private",
          body: "A private frontend IP, or an internal Azure Load Balancer, has no public address and never touches the internet. Reach for it to spread traffic between private tiers inside the virtual network.",
        },
      ],
    },
    picker: {
      scenarios: [
        {
          id: "s1",
          label: "Public HTTPS site, split /api and /images to different pools",
          need: "Content-based routing on the URL path and host",
          layer: "l7",
          verdict: "Layer 7 · Application Gateway",
          verdictTone: "l7",
          gain: "URL path and host routing, TLS termination, and a built-in web application firewall, behind one public frontend.",
          cost: "HTTP and HTTPS only, and a little more latency as it terminates each connection as a reverse proxy.",
        },
        {
          id: "s2",
          label: "Millions of connections to a game backend over raw TCP",
          need: "Extreme throughput and low latency over a non-HTTP protocol",
          layer: "l4",
          verdict: "Layer 4 · Azure Load Balancer",
          verdictTone: "l4",
          gain: "Millions of flows at ultra-low latency for any TCP or UDP app, as a pass-through with no proxying.",
          cost: "No URL awareness and no web firewall; it routes on the five-tuple only.",
        },
        {
          id: "s3",
          label: "Spread a private database tier across VMs inside the VNet",
          need: "Load balancing between internal tiers, no public exposure",
          layer: "l4",
          verdict: "Layer 4 · internal Azure Load Balancer",
          verdictTone: "l4",
          gain: "A private frontend IP spreads TCP connections across the tier at pass-through speed, never touching the internet.",
          cost: "Layer 4 only; for HTTP routing between tiers you would use an internal Application Gateway instead.",
        },
        {
          id: "s4",
          label: "Block SQL injection and common web attacks at the edge",
          need: "A managed web application firewall",
          layer: "l7",
          verdict: "Layer 7 · Application Gateway (WAF SKU)",
          verdictTone: "l7",
          gain: "The WAF SKU inspects each HTTP request and blocks common attacks before they reach a backend.",
          cost: "Protects HTTP and HTTPS only; a Layer 4 balancer cannot run a web firewall because it never reads the request.",
        },
      ],
      callouts: [
        {
          kind: "note",
          tag: "Not exclusive",
          title: "You can stack both",
          body: "A common shape is Azure Load Balancer at the edge for raw throughput, with Application Gateway behind it for content routing. Pick per tier, not once per app.",
        },
        {
          kind: "fix",
          tag: "Regional versus global",
          title: "Gateway, Load Balancer, and Front Door",
          body: "Application Gateway is the regional, in-VNet Layer 7 balancer and Azure Load Balancer is the regional Layer 4 one. For Layer 7 routing across regions at the edge, Azure has Front Door.",
        },
      ],
    },
    quiz: [
      {
        q: "You need to send /api requests to one set of servers and /images to another, behind a single public frontend. Which do you reach for?",
        opts: [
          "Azure Load Balancer (Layer 4)",
          "Application Gateway (Layer 7)",
          "Either one works the same way",
          "Neither; you need two separate frontends",
        ],
        answer: 1,
        explain:
          "Routing on the URL path means reading the HTTP request, which is Application Gateway's job at Layer 7. Azure Load Balancer works at Layer 4 and sees only IP and port.",
      },
      {
        q: "Your backend VMs have no public IP. How does a user on the internet reach the app?",
        opts: [
          "They cannot; the app is unreachable",
          "Through Application Gateway (or a public Load Balancer) with a public frontend IP, which forwards to the private backends",
          "By attaching a public IP to each VM",
          "Through the virtual network gateway straight to the VMs",
        ],
        answer: 1,
        explain:
          "The gateway or public load balancer holds the public frontend IP and opens connections to the backends' private IPs. The VMs stay private; only the frontend is exposed.",
      },
      {
        q: "What can a Layer 4 Azure Load Balancer NOT do?",
        opts: [
          "Balance millions of flows",
          "Balance UDP traffic",
          "Route based on the URL path",
          "Load-balance inside the virtual network",
        ],
        answer: 2,
        explain:
          "Azure Load Balancer forwards flows on the five-tuple without reading the payload, so it cannot route on the URL path. That needs Application Gateway at Layer 7. It can do the other three.",
      },
      {
        q: "Which is a real cost of choosing a Layer 7 load balancer?",
        opts: [
          "It cannot terminate TLS",
          "It works only with HTTP and HTTPS traffic",
          "It has no health probes",
          "It cannot sit in a virtual network",
        ],
        answer: 1,
        explain:
          "Application Gateway is an HTTP-aware reverse proxy, so it handles HTTP and HTTPS only; non-HTTP protocols need Azure Load Balancer. TLS termination, health probes, and living in a VNet are all things the gateway does.",
      },
      {
        q: "In Azure, how do you choose between Layer 4 and Layer 7?",
        opts: [
          "By Azure region",
          "By the service: Application Gateway for Layer 7, Azure Load Balancer for Layer 4",
          "By the VM size behind it",
          "You cannot; they are the same service",
        ],
        answer: 1,
        explain:
          "Unlike AWS, which selects a type under one service, Azure uses two separate services: Application Gateway at Layer 7 and Azure Load Balancer at Layer 4. You pick the layer by picking the service.",
      },
      {
        q: "A backend starts failing its health probe. What does the balancer do?",
        opts: [
          "Sends it an error page to display",
          "Drops it from the pool and routes to the remaining healthy backends",
          "Stops the whole backend pool",
          "Keeps sending it traffic until you intervene",
        ],
        answer: 1,
        explain:
          "A backend that fails its health probe is dropped from the pool, so traffic goes only to backends still passing. When it passes again, it rejoins. The balancer never sends a user to a known-bad backend.",
      },
      {
        q: "You want to terminate TLS at the balancer so it can inspect and route on the HTTP request. Which service lets you do that?",
        opts: [
          "Azure Load Balancer",
          "Application Gateway",
          "Both do it the same way",
          "Neither can terminate TLS",
        ],
        answer: 1,
        explain:
          "Reading the HTTP request means terminating TLS and working at Layer 7, which is Application Gateway. Azure Load Balancer works at Layer 4 and passes bytes through without reading them.",
      },
      {
        q: "You want a web application firewall filtering malicious HTTP requests before they reach your servers. What do you use?",
        opts: [
          "Azure Load Balancer with a firewall rule",
          "The WAF SKU of Application Gateway",
          "A network security group",
          "It is not possible in Azure",
        ],
        answer: 1,
        explain:
          "The Web Application Firewall SKU of Application Gateway inspects HTTP requests at Layer 7 and blocks common attacks. Azure Load Balancer never reads the request, so a web firewall must live on the Layer 7 gateway.",
      },
      {
        q: "What is special about the subnet an Application Gateway is deployed into?",
        opts: [
          "It must be a public subnet with an internet gateway",
          "It must be dedicated to the gateway, with no other resources in it",
          "It must be the same subnet as the backends",
          "It has no special requirement",
        ],
        answer: 1,
        explain:
          "Application Gateway requires its own dedicated subnet where no other resource is allowed; a /24 is recommended for the v2 SKU. The backend VMs sit in a separate subnet on private IPs.",
      },
      {
        q: "A Standard Load Balancer and its public IP are, by default, in what state for inbound traffic?",
        opts: [
          "Open to the internet until you add a rule to block it",
          "Closed until a network security group explicitly allows the traffic",
          "Reachable only over a private endpoint",
          "Open only on ports 80 and 443",
        ],
        answer: 1,
        explain:
          "The Standard SKU is secure by default on a Zero Trust model: it is closed to inbound connections until a network security group permits them. Traffic is dropped if no NSG allows it. The retired Basic SKU was open by default.",
      },
      {
        q: "Which SKU should you choose for a new Azure Load Balancer?",
        opts: [
          "Basic, because it is simpler",
          "Standard, since Basic was retired on 30 September 2025",
          "Either; they are equivalent",
          "Whichever the region defaults to",
        ],
        answer: 1,
        explain:
          "The Basic Load Balancer was retired on 30 September 2025, so new work should use the Standard SKU, which is zone-redundant and secure by default. Existing Basic load balancers should be migrated to Standard.",
      },
      {
        q: "You need Layer 7 routing across several regions at the edge, not just within one virtual network. Which service fits?",
        opts: [
          "Application Gateway",
          "Azure Front Door",
          "Azure Load Balancer",
          "A larger Application Gateway SKU",
        ],
        answer: 1,
        explain:
          "Azure Front Door is the global, edge Layer 7 service for routing across regions. Application Gateway is the regional, in-VNet Layer 7 balancer, and Azure Load Balancer is the regional Layer 4 one.",
      },
    ],
  },
};
