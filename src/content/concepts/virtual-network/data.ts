import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the Virtual Network lesson. The interactive
 * components under this folder are provider-agnostic and read everything they
 * render from here, so the AWS and Azure lessons stay bespoke (they genuinely
 * differ in Chapters 3 and 4) without duplicating the interaction machinery.
 *
 * Prose is kept neutral and professional; no em dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* --------------------------- Chapter 0 · the map -------------------------- */

/**
 * A node in the orientation map. `container` nodes nest other nodes; `resource`
 * nodes are concrete things; `rule` nodes are firewalls that attach rather than
 * contain. `attached` items render as chips clipped onto the node's header.
 */
export interface MapNode {
  key: string;
  label: string;
  sub?: string;
  tone: Tone;
  kind: "container" | "resource" | "rule";
  children?: MapNode[];
  attached?: MapNode[];
}

export interface Hotspot {
  title: string;
  rel: string;
  body: string;
}

/* ------------------------ Chapter 1 · the nesting ------------------------- */

export interface NestNode {
  label: string;
  note?: string;
  tone: Tone;
  dashed?: boolean;
  children?: NestNode[];
  /** Rule chips shown attached beside this node (with a connector). */
  attach?: { label: string; note?: string }[];
}

export interface FlipModel {
  correct: boolean;
  caption: string;
  root: NestNode;
  footnote?: string;
}

export interface NestingContent {
  right: FlipModel;
  wrong: FlipModel;
  callouts: CalloutData[];
}

/* ----------------------- Chapter 2 · addresses --------------------------- */

export interface CidrPreset {
  label: string;
  vpc: string;
  sub: string;
}

export interface CidrConfig {
  spaceLabel: string;
  netName: string;
  presets: CidrPreset[];
  /** Addresses reserved per subnet. Both AWS and Azure reserve 5. */
  reserved: number;
  /** Largest prefix number allowed: AWS caps subnets at /28, Azure at /29. */
  maxPrefix?: number;
  callouts: CalloutData[];
}

/* --------------------- Chapter 3 · reaching the internet ------------------ */

export interface Vec {
  x: number;
  y: number;
}

export interface SceneRect {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  sub?: string;
  tone: Tone;
  dashed?: boolean;
  /** When set, the rect dims while this toggle is off. */
  toggle?: string;
  radius?: number;
}

export interface SimToggle {
  id: string;
  label: string;
  defaultOn: boolean;
}

export interface FlowResult {
  /** Ordered waypoint names the packet travels through. */
  path: string[];
  ok: boolean;
  title: string;
  body: string;
}

export interface Flow {
  id: string;
  label: string;
  run: (state: Record<string, boolean>) => FlowResult;
}

export interface PacketScene {
  viewBox: string;
  rects: SceneRect[];
  waypoints: Record<string, Vec>;
  toggles: SimToggle[];
  flows: Flow[];
  callouts: CalloutData[];
}

/* ------------------------- Chapter 4 · the firewalls ---------------------- */

export interface Gate {
  toggleId: string;
  toggleLabel: string;
  diagLabel: string;
  sublabel: string;
  level: "subnet" | "nic";
  stateful: boolean;
  /** X position of the gate line in the fixed 640-wide firewall scene. */
  x: number;
  defaultOn: boolean;
  failInTitle: string;
  failInBody: string;
  /** For a stateless gate: the separate outbound rule the reply needs. */
  replyToggle?: {
    id: string;
    label: string;
    hint?: string;
    defaultOn: boolean;
    failTitle: string;
    failBody: string;
  };
}

export interface FirewallModel {
  gates: Gate[];
  vmLabel: string;
  passTitle: string;
  passBody: string;
  callouts: CalloutData[];
}

/* ------------------------- Chapter 5 · peering ---------------------------- */

export interface PeeringPreset {
  /** Short label naming the case, e.g. "identical ranges". */
  label: string;
  /** CIDR for the first network. */
  a: string;
  /** CIDR for the second network. */
  b: string;
}

export interface PeeringConfig {
  /** Noun for one network on this lens, e.g. "VPC" or "VNet". */
  netName: string;
  /** Name of the peering resource, e.g. "VPC peering connection". */
  linkLabel: string;
  /** Label for the first network, e.g. "VPC A". */
  aLabel: string;
  /** Label for the second network, e.g. "VPC B". */
  bLabel: string;
  presets: PeeringPreset[];
  callouts: CalloutData[];
}

/* --------------------------- Chapter 6 · the quiz ------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/* ------------------------------ The bundle ------------------------------- */

export interface NetworkContent {
  chapters: ChapterMeta[];
  map: MapNode[];
  hotspots: Record<string, Hotspot>;
  mapHint: string;
  nesting: NestingContent;
  cidr: CidrConfig;
  scene: PacketScene;
  firewall: FirewallModel;
  peering: PeeringConfig;
  quiz: QuizQ[];
}

/* ================================ AWS =================================== */

const AWS: NetworkContent = {
  chapters: [
    {
      navLabel: "The map",
      kicker: "Chapter 0 · Orientation",
      title: "The whole map on one screen",
      intro:
        "Tap any labelled piece to read what it is and, more importantly, how it relates to its neighbours. Notice which pieces are boxes you put things in and which are rules you attach.",
    },
    {
      navLabel: "What contains what",
      kicker: "Chapter 1 · The nesting",
      title: "What lives inside what",
      intro:
        "This is the part that trips almost everyone up. Flip between the mental model people imagine and how things actually nest.",
    },
    {
      navLabel: "Addresses",
      kicker: "Chapter 2 · Addresses & subnets",
      title: "Carving up the address range",
      intro:
        "A VPC owns a private address range, written as CIDR like 10.0.0.0/16. A subnet is just a slice of that range. Two hard rules live here: try to break them below.",
    },
    {
      navLabel: "Reaching the internet",
      kicker: "Chapter 3 · Reaching the internet",
      title: "What a gateway is actually for",
      intro:
        "The clearest way to learn what the Internet Gateway and NAT Gateway do is to take them away and watch traffic break. Toggle them, pick a packet to send, and read the verdict.",
    },
    {
      navLabel: "The two firewalls",
      kicker: "Chapter 4 · The two firewalls",
      title: "Security group vs. network ACL",
      intro:
        "There are two firewalls and they sit in different places. Trace a web request on port 80 coming in, and its reply going back out.",
    },
    {
      navLabel: "Peering",
      kicker: "Chapter 5 · Peering",
      title: "Wiring two VPCs together",
      intro:
        "Two separate VPCs can be joined so their instances reach each other over private IPs, with no internet in between. One hard rule governs whether that join is even allowed. Try to break it below.",
    },
    {
      navLabel: "Check yourself",
      kicker: "Chapter 6 · Check yourself",
      title: "Six questions",
      intro:
        "Pick an answer to see whether it holds up. These are the exact spots people slip.",
    },
  ],

  map: [
    {
      key: "internet",
      label: "The internet",
      tone: "resource",
      kind: "resource",
    },
    {
      key: "vpc",
      label: "VPC",
      sub: "10.0.0.0/16",
      tone: "net",
      kind: "container",
      attached: [
        {
          key: "igw",
          label: "Internet Gateway",
          tone: "public",
          kind: "resource",
        },
      ],
      children: [
        {
          key: "public",
          label: "Public subnet",
          sub: "10.0.1.0/24",
          tone: "public",
          kind: "container",
          attached: [
            {
              key: "nacl",
              label: "Network ACL",
              tone: "firewall",
              kind: "rule",
            },
          ],
          children: [
            {
              key: "nat",
              label: "NAT Gateway",
              tone: "public",
              kind: "resource",
            },
          ],
        },
        {
          key: "private",
          label: "Private subnet",
          sub: "10.0.2.0/24",
          tone: "private",
          kind: "container",
          attached: [
            {
              key: "nacl",
              label: "Network ACL",
              tone: "firewall",
              kind: "rule",
            },
          ],
          children: [
            {
              key: "ec2",
              label: "EC2 instance",
              sub: "a virtual server",
              tone: "resource",
              kind: "resource",
              children: [
                {
                  key: "eni",
                  label: "ENI",
                  sub: "10.0.2.31",
                  tone: "private",
                  kind: "resource",
                  attached: [
                    {
                      key: "sg",
                      label: "Security group",
                      tone: "firewall",
                      kind: "rule",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  hotspots: {
    internet: {
      title: "The internet",
      rel: "outside your VPC",
      body: "Everything beyond your private network. Your VPC is completely walled off from it by default: nothing gets in or out until you add a gateway and a route.",
    },
    vpc: {
      title: "VPC (Virtual Private Cloud)",
      rel: "the outermost box · owns a CIDR range",
      body: "Your own private slice of the cloud. It owns one address range (here 10.0.0.0/16) and everything else lives inside it. Think of it as the plot of land the whole network is built on.",
    },
    public: {
      title: "Public subnet",
      rel: "a box inside the VPC · one availability zone",
      body: "A slice of the VPC's address range whose route table points 0.0.0.0/0 at the Internet Gateway. That routing, not the IP numbers, is what makes it public.",
    },
    private: {
      title: "Private subnet",
      rel: "a box inside the VPC · one availability zone",
      body: "Another slice of the range, with no route to the Internet Gateway. Instances here can't be reached from the internet. If they need to fetch updates, they route out through a NAT Gateway.",
    },
    igw: {
      title: "Internet Gateway",
      rel: "attaches to the VPC (one per VPC)",
      body: "A two-way door between the VPC and the internet. On its own it does nothing: a subnet only uses it if that subnet's route table sends traffic to it.",
    },
    nat: {
      title: "NAT Gateway",
      rel: "a resource that sits in a public subnet",
      body: "A one-way door for private subnets. It lets private instances start outbound conversations (downloads, updates) while blocking anything the outside world tries to start inward.",
    },
    ec2: {
      title: "EC2 instance",
      rel: "lives inside a subnet · HAS a network interface",
      body: "A virtual server. It doesn't talk to the network directly: it does so through its network interface(s). The instance has the card; the card isn't a wrapper around the instance.",
    },
    eni: {
      title: "Network interface (ENI)",
      rel: "attached to the EC2 · lives in the subnet · holds the private IP",
      body: "The virtual network card plugged into the instance. It carries the private IP address, and it's the thing a security group attaches to. An instance can even have more than one.",
    },
    sg: {
      title: "Security group",
      rel: "rules ATTACHED to one or more ENIs, not a box",
      body: "A stateful allow-list firewall. It is not a container and it is not tied to a subnet. You attach it to network interfaces, so it travels with the instance, and one security group can be attached to many instances at once.",
    },
    nacl: {
      title: "Network ACL",
      rel: "rules ATTACHED to the subnet border · one per subnet",
      body: "The subnet's own firewall. Stateless (it judges each packet with no memory) and it guards the border of the whole subnet, so every instance in the subnet is subject to it. Every subnet has one; if you don't attach your own, it inherits the VPC's default ACL, which allows everything.",
    },
  },

  mapHint:
    "The single most useful habit: for each piece, ask whether it is a container or a rule attached to something. Boxes contain. Firewalls (the dashed red border and the red badge) are just rules that attach: they don't contain anything.",

  nesting: {
    right: {
      correct: true,
      caption: "how it actually nests",
      root: {
        label: "VPC",
        note: "10.0.0.0/16 · the land",
        tone: "net",
        children: [
          {
            label: "Subnet",
            note: "10.0.2.0/24 · a slice, in one zone",
            tone: "private",
            children: [
              {
                label: "EC2 instance",
                note: "the server",
                tone: "resource",
                children: [
                  {
                    label: "ENI · 10.0.2.31",
                    note: "the card the server has",
                    tone: "private",
                    attach: [
                      { label: "Security group", note: "rules, reusable" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            label: "Network ACL",
            note: "a rule set on the subnet's border (not in the chain above)",
            tone: "firewall",
            dashed: true,
          },
        ],
      },
    },
    wrong: {
      correct: false,
      caption: "how it's often imagined (this is wrong)",
      root: {
        label: "Subnet",
        tone: "private",
        children: [
          {
            label: "Security group",
            note: "imagined as a box that belongs to the subnet…",
            tone: "firewall",
            children: [
              {
                label: "Network interface",
                note: "…imagined as a box inside the SG…",
                tone: "private",
                children: [
                  {
                    label: "EC2 instance",
                    note: "…imagined tucked inside the ENI",
                    tone: "resource",
                  },
                ],
              },
            ],
          },
        ],
      },
      footnote:
        "Three things are wrong: the security group isn't a box, it doesn't belong to the subnet, and the EC2-inside-ENI order is inside-out.",
    },
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up #1",
        title:
          "An EC2 lives inside a network interface, which lives inside a security group.",
        body: "Backwards. An EC2 instance is the server. A network interface (ENI) is its network card: the instance has the card plugged into it. A security group isn't a box at all; it's a list of allow-rules that you attach to the card. Nothing lives inside a security group.",
      },
      {
        kind: "myth",
        tag: "Common mix-up #2",
        title: "A security group belongs to a subnet.",
        body: "No. The firewall that belongs to the subnet is the Network ACL. A security group attaches to network interfaces, so it follows the instance around: the very same security group can be attached to fifty instances in three different subnets at once.",
      },
      {
        kind: "fix",
        tag: "The rule of thumb",
        title: "Boxes contain. Rules attach.",
        body: "VPC then subnet then EC2 then ENI is a real nesting of things (roughly is inside). A security group and a network ACL are not in that chain: they're rule sets clipped onto an ENI and a subnet respectively.",
      },
    ],
  },

  cidr: {
    spaceLabel: "VPC range",
    netName: "VPC",
    reserved: 5,
    maxPrefix: 28,
    presets: [
      { label: "a valid slice", vpc: "10.0.0.0/16", sub: "10.0.1.0/24" },
      { label: "outside the VPC", vpc: "10.0.0.0/16", sub: "192.168.1.0/24" },
      {
        label: "a public-looking range",
        vpc: "10.0.0.0/16",
        sub: "8.8.8.0/24",
      },
      { label: "bigger than the VPC", vpc: "10.0.0.0/16", sub: "10.0.0.0/8" },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "The trap",
        title:
          "If I give the subnet a public-looking range like 8.8.8.0/24, it'll have internet access.",
        body: "The numbers don't grant internet access, and using someone else's public range inside your VPC just breaks routing to those real addresses. Reaching the internet is about routing through a gateway, not about which numbers you picked (that's the next chapter). Subnets normally use private ranges (10.x, 172.16-31.x, 192.168.x), and a subnet's range must always fit inside the VPC's range.",
      },
      {
        kind: "note",
        tag: "AWS specifics",
        title:
          "AWS reserves 5 addresses in every subnet, and the smallest subnet is /28.",
        body: "In each subnet AWS keeps the first four addresses and the last one for its own use, so a /24 gives you 251 usable addresses, not 256. Subnet sizes run from /28 (the smallest) up to /16.",
      },
    ],
  },

  scene: {
    viewBox: "0 0 640 430",
    rects: [
      {
        x: 12,
        y: 185,
        w: 82,
        h: 60,
        label: "internet",
        tone: "resource",
        radius: 30,
      },
      {
        x: 140,
        y: 24,
        w: 480,
        h: 382,
        label: "VPC 10.0.0.0/16",
        tone: "net",
      },
      {
        x: 108,
        y: 130,
        w: 64,
        h: 40,
        label: "Internet Gateway",
        tone: "public",
        toggle: "igw",
      },
      {
        x: 180,
        y: 60,
        w: 410,
        h: 150,
        label: "PUBLIC SUBNET · route 0.0.0.0/0 → IGW",
        tone: "public",
      },
      {
        x: 470,
        y: 112,
        w: 96,
        h: 42,
        label: "NAT Gateway",
        tone: "public",
        toggle: "nat",
      },
      {
        x: 205,
        y: 112,
        w: 120,
        h: 66,
        label: "Web server",
        sub: "public IP + private IP",
        tone: "resource",
      },
      {
        x: 180,
        y: 234,
        w: 410,
        h: 150,
        label: "PRIVATE SUBNET · route 0.0.0.0/0 → NAT",
        tone: "private",
      },
      {
        x: 205,
        y: 286,
        w: 120,
        h: 66,
        label: "Database",
        sub: "private IP only",
        tone: "resource",
      },
    ],
    waypoints: {
      NET: { x: 53, y: 215 },
      IGW_OUT: { x: 108, y: 150 },
      IGW_IN: { x: 172, y: 150 },
      PUB: { x: 265, y: 145 },
      PRIV: { x: 265, y: 319 },
      PRIV_R: { x: 518, y: 319 },
      NAT: { x: 518, y: 133 },
      NAT_UP: { x: 518, y: 95 },
      LANE: { x: 172, y: 95 },
    },
    toggles: [
      { id: "igw", label: "Internet Gateway attached to VPC", defaultOn: true },
      { id: "nat", label: "NAT Gateway in the public subnet", defaultOn: true },
    ],
    flows: [
      {
        id: "pub-out",
        label: "Web server → internet",
        run: (s) =>
          s.igw
            ? {
                path: ["PUB", "IGW_IN", "IGW_OUT", "NET"],
                ok: true,
                title: "out through the IGW",
                body: "Public subnet, route to the Internet Gateway, internet. Because the server also has a public IP, replies can find their way back.",
              }
            : {
                path: ["PUB", "IGW_IN"],
                ok: false,
                title: "no Internet Gateway",
                body: "The web server's subnet routes 0.0.0.0/0 to the Internet Gateway, but there isn't one. The packet reaches the VPC edge and stops. Attach an IGW.",
              },
      },
      {
        id: "pub-in",
        label: "Internet → web server",
        run: (s) =>
          s.igw
            ? {
                path: ["NET", "IGW_OUT", "IGW_IN", "PUB"],
                ok: true,
                title: "reached the web server",
                body: "The IGW is a two-way door and the server has a public IP, so an inbound request can reach it. (A firewall could still block it: that's Chapter 4.)",
              }
            : {
                path: ["NET", "IGW_OUT"],
                ok: false,
                title: "no Internet Gateway",
                body: "Nothing from outside can enter the VPC without an Internet Gateway to come through.",
              },
      },
      {
        id: "priv-out",
        label: "Database → internet (updates)",
        run: (s) => {
          if (!s.nat)
            return {
              path: ["PRIV", "PRIV_R", "NAT"],
              ok: false,
              title: "no NAT Gateway",
              body: "The private subnet routes 0.0.0.0/0 to a NAT Gateway so instances can fetch updates, but none exists. Add a NAT Gateway in the public subnet.",
            };
          if (!s.igw)
            return {
              path: ["PRIV", "PRIV_R", "NAT", "NAT_UP", "LANE", "IGW_IN"],
              ok: false,
              title: "NAT can't reach out either",
              body: "The database reaches the NAT Gateway, but the NAT itself needs the Internet Gateway to get to the internet. No IGW, no exit.",
            };
          return {
            path: [
              "PRIV",
              "PRIV_R",
              "NAT",
              "NAT_UP",
              "LANE",
              "IGW_IN",
              "IGW_OUT",
              "NET",
            ],
            ok: true,
            title: "out via NAT, then IGW",
            body: "Database, right and up into the NAT Gateway, over to the Internet Gateway, internet. The private instance started the conversation, so the reply is allowed back to it.",
          };
        },
      },
      {
        id: "priv-in",
        label: "Internet → database",
        run: () => ({
          path: ["NET", "IGW_OUT", "IGW_IN"],
          ok: false,
          title: "nothing routes in",
          body: "The packet gets into the VPC through the IGW, then has nowhere to go, and that's the point of a private subnet. There's no route from the internet to it, the database has no public IP, and a NAT Gateway only permits conversations the inside started. Unsolicited inbound traffic can't reach it.",
        }),
      },
    ],
    callouts: [
      {
        kind: "fix",
        tag: "The distinction that matters",
        title:
          "Internet Gateway = a two-way door for a public subnet. NAT Gateway = a one-way door for a private subnet.",
        body: "A subnet is public only because its route table sends 0.0.0.0/0 to the Internet Gateway, nothing about the IP range. Instances there also need a public IP to be reached from outside. A private subnet has no route to the IGW; instead it routes out through a NAT Gateway (which itself sits in the public subnet). NAT lets private instances start conversations outward, for updates say, but the outside world can never start a conversation inward. That's the whole point of private.",
      },
    ],
  },

  firewall: {
    vmLabel: "EC2 instance",
    gates: [
      {
        toggleId: "naclIn",
        toggleLabel: "Network ACL allows port 80 IN",
        diagLabel: "Network ACL",
        sublabel: "stateless · judges every packet alone",
        level: "subnet",
        stateful: false,
        x: 150,
        defaultOn: true,
        failInTitle: "stopped at the subnet border",
        failInBody:
          "The network ACL has no inbound rule for port 80, so the request never even reaches your instance. The ACL guards the whole subnet.",
        replyToggle: {
          id: "naclOut",
          label: "Network ACL allows the reply OUT",
          hint: "high ephemeral ports",
          defaultOn: false,
          failTitle: "reply dropped by the network ACL",
          failBody:
            "The security group let the reply out automatically: it's stateful, it remembered the request. But the network ACL is stateless: to it, the reply is an unfamiliar packet. With no outbound rule for the ephemeral reply ports, it drops it. Flip the reply OUT toggle on.",
        },
      },
      {
        toggleId: "sgIn",
        toggleLabel: "Security group allows port 80 IN",
        diagLabel: "Security group",
        sublabel: "stateful · remembers the conversation",
        level: "nic",
        stateful: true,
        x: 360,
        defaultOn: true,
        failInTitle: "stopped at the security group",
        failInBody:
          "It cleared the subnet's ACL but the security group on the ENI has no rule allowing port 80 in. The security group sits right on the network card.",
      },
    ],
    passTitle: "full round trip",
    passBody:
      "Request cleared both firewalls inbound; the reply left freely because the security group is stateful, and the network ACL allowed the ephemeral reply ports outbound. Both firewalls, both directions.",
    callouts: [
      {
        kind: "fix",
        tag: "Why the reply toggle matters",
        title: "Stateful vs. stateless is the real difference.",
        body: "A security group is stateful: if it let the request in, it automatically lets the matching reply out, so you never write a return rule. A network ACL is stateless: it inspects every packet with no memory, so the reply is a brand-new packet it hasn't seen. If you allow port 80 in but forget to allow the reply out (the second toggle), the ACL silently drops your response. The security group also lives on the ENI, while the ACL guards the subnet border: the same two-places idea from Chapter 1.",
      },
    ],
  },

  peering: {
    netName: "VPC",
    linkLabel: "VPC peering connection",
    aLabel: "VPC A",
    bLabel: "VPC B",
    presets: [
      { label: "clean · no overlap", a: "10.0.0.0/16", b: "10.1.0.0/16" },
      { label: "identical ranges", a: "10.0.0.0/16", b: "10.0.0.0/16" },
      { label: "one inside the other", a: "10.0.0.0/16", b: "10.0.42.0/24" },
      { label: "adjacent, still fine", a: "10.0.0.0/24", b: "10.0.1.0/24" },
    ],
    callouts: [
      {
        kind: "fix",
        tag: "The one hard rule",
        title: "Peered VPCs cannot have overlapping address ranges.",
        body: "AWS refuses a peering connection between VPCs with matching or overlapping CIDR blocks (IPv4 or IPv6): the connection goes straight to failed. The reason is routing. If the same address lived in both VPCs, a route to it would be ambiguous. Plan non-overlapping ranges up front, because while a peering is active you can't add an overlapping CIDR to either VPC later either.",
      },
      {
        kind: "note",
        tag: "Non-transitive",
        title: "Peering doesn't chain.",
        body: "If VPC A is peered with B, and B with C, that does not give A a path to C. You only reach VPCs you are peered with directly; A cannot use B as a transit hop. For a hub topology you peer every spoke to the hub and add explicit routes, or reach for Transit Gateway instead.",
      },
      {
        kind: "note",
        tag: "How it comes up",
        title: "One side requests, the other accepts, then both add routes.",
        body: "You create the peering from one VPC and the owner of the other accepts it (an unaccepted request expires after 7 days). The connection alone carries nothing: each VPC's route table has to add a route to the other's range. It works across Regions and across accounts, and within a single Region a security group can even reference one in the peer VPC.",
      },
    ],
  },

  quiz: [
    {
      q: "You want to peer two VPCs. VPC A is 10.0.0.0/16. Which range for VPC B lets the peering succeed?",
      opts: ["10.0.0.0/16", "10.0.128.0/17", "10.1.0.0/16", "10.0.0.0/8"],
      answer: 2,
      explain:
        "Peered VPCs can't have matching or overlapping CIDR blocks. 10.0.0.0/16 is identical to A, 10.0.128.0/17 sits inside A, and 10.0.0.0/8 contains A. Only 10.1.0.0/16 shares no addresses with A, so the connection is allowed.",
    },
    {
      q: "You create a VPC as 10.0.0.0/16. Which subnet range is legal?",
      opts: ["192.168.1.0/24", "10.0.5.0/24", "8.8.8.0/24", "172.16.0.0/24"],
      answer: 1,
      explain:
        "A subnet must fit inside the VPC's range. Only 10.0.5.0/24 sits within 10.0.0.0/16; the others live outside that block entirely.",
    },
    {
      q: "What makes a subnet public?",
      opts: [
        "It uses public-looking IP numbers",
        "Its route table sends 0.0.0.0/0 to an Internet Gateway",
        "It has more addresses than a private subnet",
        "You tick a public checkbox and nothing else",
      ],
      answer: 1,
      explain:
        "Public is purely about routing: a default route to the Internet Gateway (plus instances having public IPs). The IP numbers are irrelevant.",
    },
    {
      q: "A security group is…",
      opts: [
        "A box that contains network interfaces",
        "A firewall that belongs to a subnet",
        "A rule set you attach to network interfaces",
        "The same thing as a network ACL",
      ],
      answer: 2,
      explain:
        "It's a stateful allow-list attached to ENIs, so it follows the instance and can be reused across many. The subnet-level firewall is the network ACL.",
    },
    {
      q: "Which describes the real relationship?",
      opts: [
        "EC2 is inside its ENI, which is inside a security group",
        "The ENI is attached to the EC2; a security group attaches to the ENI",
        "The security group contains the subnet",
        "The subnet is inside the network interface",
      ],
      answer: 1,
      explain:
        "The instance has the network card (ENI); the security group clips onto that card. Nothing is inside a security group.",
    },
    {
      q: "A database in a private subnet needs to download updates. What lets it?",
      opts: [
        "An Internet Gateway route in its own subnet",
        "A public IP on the database",
        "A NAT Gateway it routes outbound through",
        "Nothing, private means fully offline",
      ],
      answer: 2,
      explain:
        "A NAT Gateway (sitting in a public subnet) lets private instances start outbound connections while blocking unsolicited inbound. That's the one-way door.",
    },
  ],
};

/* =============================== Azure ================================= */

const AZURE: NetworkContent = {
  chapters: [
    {
      navLabel: "The map",
      kicker: "Chapter 0 · Orientation",
      title: "The whole map on one screen",
      intro:
        "Tap any labelled piece to read what it is and how it relates to its neighbours. Notice which pieces are boxes you put things in and which are things you attach.",
    },
    {
      navLabel: "What contains what",
      kicker: "Chapter 1 · The nesting",
      title: "What lives inside what",
      intro:
        "This is the part that trips almost everyone up. Flip between the model people imagine and how things actually nest.",
    },
    {
      navLabel: "Addresses",
      kicker: "Chapter 2 · Addresses & subnets",
      title: "Carving up the address space",
      intro:
        "A VNet owns a private address space, written as CIDR like 10.0.0.0/16. A subnet is a slice of it. Try to break the rules below.",
    },
    {
      navLabel: "Reaching the internet",
      kicker: "Chapter 3 · Reaching the internet",
      title: "Getting in and out, without an internet gateway",
      intro:
        "Azure has no Internet Gateway object to attach. Instead, being reachable from the internet needs a public IP, and reaching out needs an explicit method like a NAT gateway. Toggle them and send packets.",
    },
    {
      navLabel: "The firewall (NSG)",
      kicker: "Chapter 4 · The firewall",
      title: "One NSG, possibly at two levels",
      intro:
        "Azure has a single firewall resource, the NSG, but it can sit on the subnet and on the NIC at the same time. When it does, traffic must pass both. Trace a web request on port 80 in, and its reply out.",
    },
    {
      navLabel: "Peering",
      kicker: "Chapter 5 · Peering",
      title: "Wiring two VNets together",
      intro:
        "Two separate VNets can be joined so their VMs reach each other over private IPs, staying on Azure's backbone with no internet in between. One hard rule governs whether that join is even allowed. Try to break it below.",
    },
    {
      navLabel: "Check yourself",
      kicker: "Chapter 6 · Check yourself",
      title: "Six questions",
      intro:
        "Pick an answer to see whether it holds up. These are the exact spots people slip.",
    },
  ],

  map: [
    {
      key: "internet",
      label: "The internet",
      tone: "resource",
      kind: "resource",
    },
    {
      key: "vnet",
      label: "VNet",
      sub: "10.0.0.0/16",
      tone: "net",
      kind: "container",
      attached: [
        { key: "pip", label: "Public IP", tone: "public", kind: "resource" },
        { key: "nat", label: "NAT Gateway", tone: "public", kind: "resource" },
      ],
      children: [
        {
          key: "public",
          label: "Public-style subnet",
          sub: "10.0.1.0/24",
          tone: "public",
          kind: "container",
          children: [
            {
              key: "vm",
              label: "Virtual machine",
              sub: "web server",
              tone: "resource",
              kind: "resource",
              children: [
                {
                  key: "nic",
                  label: "NIC",
                  sub: "10.0.1.20",
                  tone: "private",
                  kind: "resource",
                  attached: [
                    {
                      key: "nsg",
                      label: "NSG on this NIC",
                      tone: "firewall",
                      kind: "rule",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          key: "private",
          label: "Private subnet",
          sub: "10.0.2.0/24",
          tone: "private",
          kind: "container",
          attached: [
            {
              key: "nsg",
              label: "NSG on the subnet",
              tone: "firewall",
              kind: "rule",
            },
          ],
          children: [
            {
              key: "vm",
              label: "Virtual machine",
              sub: "database",
              tone: "resource",
              kind: "resource",
              children: [
                {
                  key: "nic",
                  label: "NIC",
                  sub: "10.0.2.31",
                  tone: "private",
                  kind: "resource",
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  hotspots: {
    internet: {
      title: "The internet",
      rel: "outside your VNet",
      body: "Everything beyond your private network. A VNet is walled off from it by default: a VM is only reachable from here if it has a public IP, and only reaches out here through an explicit method.",
    },
    vnet: {
      title: "Virtual Network (VNet)",
      rel: "the outermost box · owns an address space",
      body: "Your private network in Azure. It owns one or more address spaces (here 10.0.0.0/16) and everything else lives inside it. Think of it as the plot of land the whole network is built on.",
    },
    public: {
      title: "A public-style subnet",
      rel: "a box inside the VNet",
      body: "A slice of the VNet's address space. It's only public in the sense that a VM here has a public IP and an NSG rule allowing inbound traffic. Nothing about the IP numbers makes it public.",
    },
    private: {
      title: "Private subnet",
      rel: "a box inside the VNet",
      body: "Another slice of the address space, with no public IPs on its VMs. To fetch updates it reaches out through a NAT gateway; the internet can never start a connection into it.",
    },
    pip: {
      title: "Public IP",
      rel: "a separate resource, attached to a NIC",
      body: "A distinct Azure resource. Attach one to a VM's NIC (or to a load balancer) to make that VM reachable from the internet. Without it, there's no inbound front door: the private IP alone isn't routable from outside.",
    },
    nat: {
      title: "NAT Gateway",
      rel: "a resource associated with a subnet",
      body: "Gives a subnet a shared, static outbound path to the internet. Associate it with one or more subnets and every VM there uses it to reach out. It's outbound only: the outside world can't use it to get in.",
    },
    vm: {
      title: "Virtual machine (VM)",
      rel: "lives inside a subnet · HAS a NIC",
      body: "A virtual server. It doesn't touch the network directly: it does so through its NIC(s). The VM has the card; the card isn't a wrapper around the VM.",
    },
    nic: {
      title: "Network interface (NIC)",
      rel: "attached to the VM · lives in the subnet · holds the private IP",
      body: "The virtual network card attached to the VM. It carries the private IP, it's where a public IP gets attached, and it's one of the two places an NSG can attach. A VM can have more than one.",
    },
    nsg: {
      title: "Network Security Group (NSG)",
      rel: "a stateful rule set you associate with a subnet and/or a NIC",
      body: "Azure's firewall. It's not a container and not owned by one subnet: it's a reusable list of allow/deny rules. Associate it with a subnet, a NIC, or both; when it's on both, traffic must pass both. Always stateful, so replies to allowed traffic come back automatically.",
    },
  },

  mapHint:
    "Useful habit: for each piece, ask whether it is a container or a thing you attach. Boxes contain. An NSG is a rule set you associate, and in Azure you can associate the very same NSG to a subnet and to a NIC. That's why it shows up in two places here.",

  nesting: {
    right: {
      correct: true,
      caption: "how it actually nests",
      root: {
        label: "VNet",
        note: "10.0.0.0/16 · the land",
        tone: "net",
        children: [
          {
            label: "Subnet",
            note: "10.0.1.0/24 · a slice",
            tone: "private",
            children: [
              {
                label: "Virtual machine",
                note: "the server",
                tone: "resource",
                children: [
                  {
                    label: "NIC · 10.0.1.20",
                    note: "the card the VM has (+ optional public IP)",
                    tone: "private",
                  },
                ],
              },
            ],
          },
          {
            label: "One NSG",
            note: "reusable rules · associates to the subnet and/or the NIC",
            tone: "firewall",
            dashed: true,
          },
        ],
      },
    },
    wrong: {
      correct: false,
      caption: "how it's often imagined (this is wrong)",
      root: {
        label: "Subnet",
        tone: "private",
        children: [
          {
            label: "NSG",
            note: "imagined as a box owned by this one subnet…",
            tone: "firewall",
            children: [
              {
                label: "NIC",
                note: "…imagined as a box inside the NSG…",
                tone: "private",
                children: [
                  {
                    label: "Virtual machine",
                    note: "…imagined tucked inside the NIC",
                    tone: "resource",
                  },
                ],
              },
            ],
          },
        ],
      },
      footnote:
        "Three things are wrong: the NSG isn't a box, it isn't owned by one subnet (it's reusable and can also sit on the NIC), and the VM-inside-NIC order is inside-out.",
    },
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up #1",
        title: "A VM lives inside a NIC, which lives inside an NSG.",
        body: "Backwards. A virtual machine is the server. A NIC is its network card: the VM has the card attached to it. An NSG isn't a box at all; it's a list of allow/deny rules that you associate with a NIC or a subnet. Nothing lives inside an NSG.",
      },
      {
        kind: "myth",
        tag: "Common mix-up #2",
        title: "An NSG belongs to one subnet.",
        body: "Half-true in Azure, which is exactly why it's confusing. You can associate an NSG with a subnet. But you can also associate the same NSG with individual NICs, and reuse one NSG across many subnets and NICs at once. It's a reusable rule set, not something owned by a single subnet. Where you associate it decides what it guards.",
      },
      {
        kind: "note",
        tag: "If you're coming from AWS",
        title: "Azure folds two AWS concepts into one.",
        body: "AWS splits the job in two: a stateful security group on the NIC and a stateless network ACL on the subnet. Azure has a single resource, the NSG, that is always stateful and can attach at the subnet level, the NIC level, or both. There is no separate stateless subnet firewall to configure.",
      },
      {
        kind: "fix",
        tag: "The rule of thumb",
        title: "Boxes contain. NSGs associate.",
        body: "VNet then subnet then VM then NIC is a real nesting of things (roughly is inside). An NSG is not in that chain: it's a rule set you attach to a subnet and/or a NIC, and a public IP is a separate resource you attach to a NIC.",
      },
    ],
  },

  cidr: {
    spaceLabel: "VNet address space",
    netName: "VNet",
    reserved: 5,
    maxPrefix: 29,
    presets: [
      { label: "a valid slice", vpc: "10.0.0.0/16", sub: "10.0.1.0/24" },
      { label: "outside the VNet", vpc: "10.0.0.0/16", sub: "192.168.1.0/24" },
      {
        label: "a public-looking range",
        vpc: "10.0.0.0/16",
        sub: "8.8.8.0/24",
      },
      { label: "bigger than the VNet", vpc: "10.0.0.0/16", sub: "10.0.0.0/8" },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "The trap",
        title:
          "If I give the subnet a public-looking range like 8.8.8.0/24, it'll have internet access.",
        body: "The numbers don't grant internet access, and borrowing someone's real public range inside your VNet just breaks your routing to those addresses. Reaching the internet is about attaching the right resources, not the numbers you picked (that's the next chapter). Subnets normally use private ranges (10.x, 172.16-31.x, 192.168.x) and must fit inside the VNet's space.",
      },
      {
        kind: "note",
        tag: "Azure specifics",
        title:
          "Azure reserves 5 addresses in every subnet, and the smallest subnet is /29.",
        body: "In each subnet Azure keeps the first four addresses and the last one for its own use, so a /24 gives you 251 usable addresses, not 256. A VNet can also hold more than one address space, but every subnet must still fit within one of them.",
      },
    ],
  },

  scene: {
    viewBox: "0 0 640 430",
    rects: [
      {
        x: 12,
        y: 185,
        w: 82,
        h: 60,
        label: "internet",
        tone: "resource",
        radius: 30,
      },
      { x: 140, y: 24, w: 480, h: 382, label: "VNet 10.0.0.0/16", tone: "net" },
      {
        x: 108,
        y: 118,
        w: 64,
        h: 44,
        label: "Public IP",
        tone: "public",
        toggle: "pip",
      },
      {
        x: 108,
        y: 298,
        w: 64,
        h: 44,
        label: "NAT Gateway",
        tone: "public",
        toggle: "nat",
      },
      {
        x: 180,
        y: 60,
        w: 410,
        h: 150,
        label: "SUBNET · web VM has a public IP",
        tone: "public",
      },
      {
        x: 205,
        y: 112,
        w: 130,
        h: 66,
        label: "Web VM",
        sub: "public IP + private IP",
        tone: "resource",
      },
      {
        x: 180,
        y: 234,
        w: 410,
        h: 150,
        label: "SUBNET · NAT gateway associated",
        tone: "private",
      },
      {
        x: 205,
        y: 286,
        w: 130,
        h: 66,
        label: "Database VM",
        sub: "private IP only",
        tone: "resource",
      },
    ],
    waypoints: {
      NET: { x: 53, y: 215 },
      PIP_IN: { x: 172, y: 140 },
      PIP_OUT: { x: 108, y: 140 },
      NAT_IN: { x: 172, y: 320 },
      NAT_OUT: { x: 108, y: 320 },
      WEB: { x: 270, y: 145 },
      DB: { x: 270, y: 319 },
    },
    toggles: [
      { id: "pip", label: "Public IP on the web VM's NIC", defaultOn: true },
      {
        id: "nat",
        label: "NAT Gateway on the database's subnet",
        defaultOn: true,
      },
    ],
    flows: [
      {
        id: "pub-out",
        label: "Web VM → internet",
        run: (s) =>
          s.pip
            ? {
                path: ["WEB", "PIP_IN", "PIP_OUT", "NET"],
                ok: true,
                title: "out via its public IP",
                body: "The VM's own public IP gives it a route to the internet, and replies come back to that same address.",
              }
            : {
                path: ["WEB", "PIP_IN"],
                ok: false,
                title: "no outbound path",
                body: "The web VM has no public IP and no NAT gateway, so it has no explicit way out. Azure used to give VMs implicit outbound access, but that default is being retired. Attach a public IP or a NAT gateway.",
              },
      },
      {
        id: "pub-in",
        label: "Internet → web VM",
        run: (s) =>
          s.pip
            ? {
                path: ["NET", "PIP_OUT", "PIP_IN", "WEB"],
                ok: true,
                title: "reached the web VM",
                body: "The public IP is the VM's front door, so an inbound request can arrive. (An NSG rule still has to allow it: that's Chapter 4.)",
              }
            : {
                path: ["NET", "PIP_OUT"],
                ok: false,
                title: "no public IP",
                body: "With no public IP on the NIC, there's no front door. The VM's private IP isn't routable from the internet, so inbound traffic can't find it.",
              },
      },
      {
        id: "priv-out",
        label: "Database → internet (updates)",
        run: (s) =>
          s.nat
            ? {
                path: ["DB", "NAT_IN", "NAT_OUT", "NET"],
                ok: true,
                title: "out via the NAT gateway",
                body: "Database, NAT gateway (associated with the subnet), internet. The VM started the conversation, so the reply is allowed back to it.",
              }
            : {
                path: ["DB", "NAT_IN"],
                ok: false,
                title: "no NAT gateway",
                body: "The database has no public IP, so its only way out is a NAT gateway on its subnet, and there isn't one. Associate a NAT gateway with the subnet so its VMs can fetch updates.",
              },
      },
      {
        id: "priv-in",
        label: "Internet → database",
        run: () => ({
          path: ["NET", "NAT_OUT", "NAT_IN"],
          ok: false,
          title: "nothing routes in",
          body: "This always fails, and that's the point. The database has no public IP, and a NAT gateway is outbound only: it never lets the outside start a connection inward. There's simply no front door.",
        }),
      },
    ],
    callouts: [
      {
        kind: "fix",
        tag: "The distinction that matters",
        title:
          "A public IP is the front door in. A NAT gateway is the door out.",
        body: "To be reached from the internet, a VM needs a public IP attached to its NIC (and an NSG rule allowing it, Chapter 4). To reach out, a VM needs an explicit path: its own public IP, or a NAT gateway associated with its subnet (a static outbound IP shared by every VM in that subnet, outbound only). A NAT gateway never lets the outside start a conversation inward, which is what keeps the database private.",
      },
      {
        kind: "note",
        tag: "Recent change worth knowing",
        title: "It just worked before is going away.",
        body: "Historically Azure quietly gave new VMs implicit outbound internet access through a shared Microsoft IP. Microsoft is retiring that default, and new virtual networks now lean toward being private by default, so you're expected to attach an explicit outbound method (NAT gateway, public IP, or a load balancer). Treat outbound access as something you deliberately configure, not something you inherit.",
      },
    ],
  },

  firewall: {
    vmLabel: "Virtual machine",
    gates: [
      {
        toggleId: "subIn",
        toggleLabel: "Subnet NSG allows port 80 IN",
        diagLabel: "Subnet NSG",
        sublabel: "stateful · applies to every NIC in the subnet",
        level: "subnet",
        stateful: true,
        x: 150,
        defaultOn: true,
        failInTitle: "stopped at the subnet NSG",
        failInBody:
          "The subnet NSG has no inbound rule for port 80, so the request never reaches the VM. A subnet NSG applies to every NIC in the subnet at once.",
      },
      {
        toggleId: "nicIn",
        toggleLabel: "NIC NSG allows port 80 IN",
        diagLabel: "NIC NSG",
        sublabel: "stateful · applies to this NIC only",
        level: "nic",
        stateful: true,
        x: 360,
        defaultOn: true,
        failInTitle: "stopped at the NIC NSG",
        failInBody:
          "It cleared the subnet NSG, but the NIC NSG denies port 80. Both levels must allow the traffic: the stricter one wins.",
      },
    ],
    passTitle: "full round trip",
    passBody:
      "The request cleared both NSG levels inbound, and the reply left with no return rule at all. NSGs are stateful, so once the request is allowed, the response is automatically allowed back through both levels.",
    callouts: [
      {
        kind: "fix",
        tag: "Why both toggles matter",
        title:
          "Every NSG in the path must allow the traffic, and all of them are stateful.",
        body: "If you attach an NSG to both the subnet and the NIC, a packet has to be allowed by both to reach the VM. Deny it at either level and it's blocked. The upside of statefulness: once the request is allowed in, the reply flows back automatically, you never write a return rule, at either level. (For the record, inbound is checked subnet-NSG-then-NIC-NSG; outbound is the reverse.)",
      },
    ],
  },

  peering: {
    netName: "VNet",
    linkLabel: "peering",
    aLabel: "VNet A",
    bLabel: "VNet B",
    presets: [
      { label: "clean · no overlap", a: "10.0.0.0/16", b: "10.1.0.0/16" },
      { label: "identical ranges", a: "10.0.0.0/16", b: "10.0.0.0/16" },
      { label: "one inside the other", a: "10.0.0.0/16", b: "10.0.42.0/24" },
      { label: "adjacent, still fine", a: "10.0.0.0/24", b: "10.0.1.0/24" },
    ],
    callouts: [
      {
        kind: "fix",
        tag: "The one hard rule",
        title: "Peered VNets must have non-overlapping address spaces.",
        body: "Azure won't enable peering if the two VNets' address spaces overlap: matching or overlapping ranges are rejected outright. The reason is routing. An address that lived in both VNets would be ambiguous. The constraint is ongoing, not just at creation: an address-space change that would introduce an overlap on an already-peered VNet fails too. Plan non-overlapping ranges from the start.",
      },
      {
        kind: "note",
        tag: "Two flavors, both private",
        title: "Regional and global peering stay on the backbone.",
        body: "Peering within one region is virtual network peering; across regions it is global virtual network peering. Either way the traffic stays on the Microsoft backbone, with no gateway, no public internet, and no encryption to configure. For the ranges you route, the two VNets start behaving as one flat network.",
      },
      {
        kind: "note",
        tag: "Set up both directions",
        title: "A peering is a link each VNet establishes.",
        body: "The portal creates the link in both directions in one step. With the CLI you run az network vnet peering create twice, once from each VNet with the names reversed, and pass --allow-vnet-access to actually permit VM-to-VM traffic. Peering is not transitive: a spoke peered to a hub can't reach another spoke through it without gateway transit or user-defined routes.",
      },
    ],
  },

  quiz: [
    {
      q: "You want to peer two VNets. VNet A's address space is 10.0.0.0/16. Which address space for VNet B lets the peering succeed?",
      opts: ["10.0.0.0/16", "10.0.64.0/18", "10.2.0.0/16", "10.0.0.0/12"],
      answer: 2,
      explain:
        "Peered VNets must have non-overlapping address spaces. 10.0.0.0/16 is identical to A, 10.0.64.0/18 sits inside A, and 10.0.0.0/12 contains A. Only 10.2.0.0/16 avoids overlap entirely, so Azure allows the peering.",
    },
    {
      q: "You create a VNet with address space 10.0.0.0/16. Which subnet range is legal?",
      opts: ["192.168.1.0/24", "10.0.5.0/24", "8.8.8.0/24", "172.16.0.0/24"],
      answer: 1,
      explain:
        "A subnet must fit inside the VNet's address space. Only 10.0.5.0/24 sits within 10.0.0.0/16; the others are outside that block.",
    },
    {
      q: "What lets a VM be reached from the internet?",
      opts: [
        "Giving it public-looking IP numbers",
        "A Public IP resource attached to its NIC, plus an NSG rule allowing the traffic",
        "Putting it in a bigger subnet",
        "Ticking a public box and nothing else",
      ],
      answer: 1,
      explain:
        "Inbound reachability comes from a Public IP on the NIC (the front door) and an NSG rule that permits the traffic. The private IP alone isn't routable from outside, and the numbers themselves are irrelevant.",
    },
    {
      q: "An NSG is…",
      opts: [
        "A box that contains NICs",
        "A firewall permanently owned by one subnet",
        "A reusable, stateful rule set you associate with a subnet and/or a NIC",
        "A stateless subnet-only filter, like an AWS network ACL",
      ],
      answer: 2,
      explain:
        "It's a reusable list of stateful rules. Associate it with a subnet, a NIC, or both, and the same NSG can be reused across many. Azure has no separate stateless ACL; the NSG plays both roles.",
    },
    {
      q: "Which describes the real relationship?",
      opts: [
        "The VM is inside its NIC, which is inside an NSG",
        "The NIC is attached to the VM; an NSG associates to the NIC and/or subnet",
        "The NSG contains the subnet",
        "The subnet is inside the NIC",
      ],
      answer: 1,
      explain:
        "The VM has the NIC; an NSG associates to that NIC and/or the subnet. Nothing lives inside an NSG.",
    },
    {
      q: "A database in a private subnet needs to download updates. What lets it out?",
      opts: [
        "An Internet Gateway attached to the VNet",
        "A public IP on the database",
        "A NAT gateway associated with its subnet",
        "Nothing, private means fully offline",
      ],
      answer: 2,
      explain:
        "Azure has no Internet Gateway object. A NAT gateway associated with the subnet gives its VMs a shared, outbound-only path, perfect for a private VM fetching updates without becoming reachable from outside.",
    },
  ],
};

export const CONTENT: Record<Provider, NetworkContent> = {
  aws: AWS,
  azure: AZURE,
};
