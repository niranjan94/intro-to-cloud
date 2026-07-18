import type { CalloutData } from "@/components/lesson/callout";
import type { DocLink } from "@/components/lesson/further-reading";
import type {
  AgentSetup,
  ResponsibilitySplit,
  SecurityChecklist,
} from "@/components/lesson/lesson-reference";
import type { QuizQ } from "@/components/lesson/quiz";
import type { Tone } from "@/components/lesson/tones";
import type { Provider } from "@/content/types";

/*
 * All provider-specific content for the "Load-Balanced Web App" capstone. The
 * interactive components under this folder are provider-agnostic and read
 * everything they render from here, so the AWS and Azure builds stay bespoke
 * (they genuinely differ in how the front door is shaped and how private
 * compute reaches the internet) without duplicating the interaction machinery.
 *
 * This build is the next rung up from "Web Server on a VM": the compute sits in
 * a private subnet with no public IP, and the only way in is a Layer 7 load
 * balancer in front of it. Prose is neutral and professional; no em dashes
 * (house rule). Facts are grounded in the provider documentation linked from
 * the lesson shell (see DOCS below).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* -------------------------- Chapter 0 · the plan -------------------------- */

/**
 * A node in the architecture diagram. `container` nodes nest other nodes;
 * `resource` nodes are concrete things; `rule` nodes are firewalls that attach
 * rather than contain. `attached` items render as chips clipped to the header.
 */
export interface ArchNode {
  key: string;
  label: string;
  sub?: string;
  tone: Tone;
  kind: "container" | "resource" | "rule";
  children?: ArchNode[];
  attached?: ArchNode[];
}

export interface Hotspot {
  title: string;
  rel: string;
  body: string;
}

/* ------------------------ Chapter 1 · the request ------------------------- */

export interface FlowStage {
  id: string;
  label: string;
  sub?: string;
  tone: Tone;
}

export interface FlowGate {
  id: string;
  label: string;
  defaultOn: boolean;
  /** Index into `stages` where a closed gate stops the request. */
  stage: number;
  /** Verdict shown when this gate is the reason the request fails. */
  failTitle: string;
  failBody: string;
}

export interface FlowContent {
  stages: FlowStage[];
  /** The gate that fails first if off (the load balancer's public front door). */
  reach: FlowGate;
  /** The gate that fails next if off (the instance firewall allowing the LB). */
  firewall: FlowGate;
  /** Index of the web server stage the request reaches on success. */
  serverStage: number;
  passTitle: string;
  passBody: string;
  callouts: CalloutData[];
}

/* -------------------------- Chapter 2 · the build ------------------------- */

export interface BuildStep {
  label: string;
  /** Concept id this step draws on, linked back to its lesson. */
  concept?: string;
  detail: string;
  /** Optional example command, shown in a mono chip. */
  cli?: string;
}

/* ----------------------- Chapter 3 · the provisioning --------------------- */

export interface ScriptLine {
  code: string;
  /** Plain-language note on what this line does, shown on reveal. */
  note?: string;
}

export interface ProvisionContent {
  filename: string;
  /** How the script is handed to the machine, e.g. "EC2 user data". */
  mechanism: string;
  lines: ScriptLine[];
  /** The page nginx serves once provisioning finishes, for the preview. */
  page: { heading: string; sub: string };
  callouts: CalloutData[];
}

/* ------------------------------ The bundle ------------------------------- */

export interface LoadBalancedContent {
  chapters: ChapterMeta[];
  arch: ArchNode[];
  hotspots: Record<string, Hotspot>;
  archHint: string;
  flow: FlowContent;
  steps: BuildStep[];
  provision: ProvisionContent;
  quiz: QuizQ[];
}

/* ================================ AWS =================================== */

const AWS: LoadBalancedContent = {
  chapters: [
    {
      navLabel: "plan",
      kicker: "Chapter 0 · The plan",
      title: "The whole build on one screen",
      intro:
        "This is the web server you already built, moved one rung up: the instances now sit in a private subnet with no public IP, and the only way in is an Application Load Balancer in front of them. Tap any labelled piece to read what it is and how it relates to its neighbours.",
    },
    {
      navLabel: "request",
      kicker: "Chapter 1 · The request path",
      title: "What a browser has to get through",
      intro:
        "A visitor's request no longer reaches a public server directly. It arrives at the load balancer's front door, gets routed to a healthy target, and only then crosses the instance firewall to nginx. Close a gate and watch the request stop.",
    },
    {
      navLabel: "build",
      kicker: "Chapter 2 · The build order",
      title: "Seven steps, in order",
      intro:
        "Here is the whole build as an ordered checklist. Each step depends on the ones above it, and each draws on a concept you have already met. Expand a step to see what it does and why.",
    },
    {
      navLabel: "provision",
      kicker: "Chapter 3 · Installing nginx",
      title: "The script that runs on first boot",
      intro:
        "The instances have no public IP, so the first-boot script can only install nginx because the private subnet routes outbound through a NAT gateway. Step through the script, then see what the load balancer serves.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 4 · Check yourself",
      title: "Six questions",
      intro:
        "Pick an answer to see whether it holds up. These are the exact spots people slip when they put private compute behind a Layer 7 load balancer.",
    },
  ],

  arch: [
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
          key: "publicSubnets",
          label: "Public subnets (2 AZs)",
          sub: "10.0.1.0/24 · 10.0.2.0/24 · route 0.0.0.0/0 → IGW",
          tone: "public",
          kind: "container",
          children: [
            {
              key: "alb",
              label: "Application Load Balancer",
              sub: "Layer 7 · internet-facing",
              tone: "public",
              kind: "resource",
              attached: [
                {
                  key: "albSg",
                  label: "ALB security group",
                  tone: "firewall",
                  kind: "rule",
                },
              ],
            },
            {
              key: "nat",
              label: "NAT gateway",
              sub: "+ Elastic IP",
              tone: "public",
              kind: "resource",
            },
          ],
        },
        {
          key: "privateSubnet",
          label: "Private subnet",
          sub: "10.0.3.0/24 · route 0.0.0.0/0 → NAT",
          tone: "private",
          kind: "container",
          children: [
            {
              key: "ec2",
              label: "EC2 instances",
              sub: "Amazon Linux · nginx · no public IP",
              tone: "resource",
              kind: "resource",
              children: [
                {
                  key: "eni",
                  label: "Network interface",
                  sub: "10.0.3.20 · private only",
                  tone: "private",
                  kind: "resource",
                  attached: [
                    {
                      key: "instanceSg",
                      label: "Instance security group",
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
      body: "Where your visitors are. Their browsers reach only the load balancer's public address. Nothing behind it has a public IP, so the balancer is the single, deliberate way in.",
    },
    vpc: {
      title: "VPC (Virtual Private Cloud)",
      rel: "the outermost box · owns a CIDR range",
      body: "Your private slice of the cloud, from the Virtual Network concept. It owns one address range (10.0.0.0/16) and holds both the public subnets the load balancer lives in and the private subnet the instances hide in.",
    },
    igw: {
      title: "Internet Gateway",
      rel: "attaches to the VPC (one per VPC)",
      body: "A two-way door between the VPC and the internet. The public subnets' route table sends 0.0.0.0/0 to it, which is what makes the load balancer internet-facing and gives the NAT gateway a path out.",
    },
    publicSubnets: {
      title: "Public subnets (two Availability Zones)",
      rel: "boxes inside the VPC",
      body: "An internet-facing Application Load Balancer requires subnets in at least two Availability Zones, so it stays up if one zone fails. These public subnets hold the load balancer and the NAT gateway, not your instances.",
    },
    alb: {
      title: "Application Load Balancer",
      rel: "spans the public subnets · the front door",
      body: "The Layer 7 load balancer, from the Load Balancing concept. A listener accepts requests on port 80, a rule forwards them to a target group, and health checks keep traffic off any instance that is not answering. It is the only public thing in the build.",
    },
    albSg: {
      title: "ALB security group",
      rel: "rules attached to the load balancer",
      body: "Allows inbound port 80 and 443 from the internet, because the load balancer is what the public actually talks to. Its outbound side is what reaches the instances, which is why the instance firewall can trust it as a source.",
    },
    nat: {
      title: "NAT gateway",
      rel: "in a public subnet · outbound only",
      body: "Gives the private instances a way out to the internet, so a first-boot script can install nginx. It lives in a public subnet with an Elastic IP and never accepts unsolicited inbound connections, so egress does not become an entrance.",
    },
    privateSubnet: {
      title: "Private subnet",
      rel: "a box inside the VPC",
      body: "Where the instances actually run. Its route table sends 0.0.0.0/0 to the NAT gateway, not an Internet Gateway, so the instances can reach out but nothing on the internet can reach in. That is what private means here.",
    },
    ec2: {
      title: "EC2 instances",
      rel: "the virtual machines · run nginx",
      body: "The servers themselves, from the Virtual Machines concept, with no public IP. The load balancer registers them as targets and reaches them over their private IPs. You can run several identical ones and let the balancer spread traffic across them.",
    },
    eni: {
      title: "Network interface",
      rel: "attached to the instance · private IP only",
      body: "The instance's network card carries a private IP (10.0.3.20) and nothing else. There is no public IPv4 address to route to from outside, which is exactly the point: the only traffic it sees is what the load balancer forwards.",
    },
    instanceSg: {
      title: "Instance security group",
      rel: "rules attached to the network interface",
      body: "Allows inbound port 80 from the ALB security group as the source, not from 0.0.0.0/0. Sourcing on the load balancer's security group means only forwarded traffic is accepted, so the internet cannot reach the instance even if it found the private IP.",
    },
  },

  archHint:
    "Read it inside-out: the instances run nginx on private IPs with no way in from the internet. The Application Load Balancer, in public subnets across two Availability Zones, is the only public front door, and it reaches the instances over the private network. The NAT gateway is the one-way exit that lets them install packages.",

  flow: {
    stages: [
      { id: "browser", label: "Browser", sub: "a visitor", tone: "resource" },
      {
        id: "alb",
        label: "Load balancer",
        sub: "internet-facing",
        tone: "public",
      },
      {
        id: "route",
        label: "Listener + rule",
        sub: "forward → target group",
        tone: "net",
      },
      {
        id: "sg",
        label: "Instance firewall",
        sub: "allow from LB?",
        tone: "firewall",
      },
      { id: "nginx", label: "nginx", sub: "private EC2", tone: "ok" },
    ],
    reach: {
      id: "internetFacing",
      label: "Load balancer is internet-facing",
      defaultOn: true,
      stage: 1,
      failTitle: "no public front door",
      failBody:
        "The load balancer has no internet-facing listener, so the browser has nothing to reach. The instances have no public IP of their own, so there is no fallback path. Make the load balancer internet-facing in public subnets across two Availability Zones.",
    },
    firewall: {
      id: "allowFromLb",
      label: "Instance firewall allows the load balancer",
      defaultOn: true,
      stage: 3,
      failTitle: "stopped at the instance firewall",
      failBody:
        "The load balancer took the request and tried to forward it, but the instance security group has no inbound rule allowing port 80 from the ALB security group. The request is dropped, the health check fails, and the target is marked unhealthy. Allow port 80 from the ALB security group.",
    },
    serverStage: 4,
    passTitle: "nginx answered · 200 OK",
    passBody:
      "The internet-facing load balancer accepted the request, a listener rule forwarded it to the target group, the instance security group allowed traffic from the balancer, and nginx returned the page over the private network. The instance never needed a public IP.",
    callouts: [
      {
        kind: "fix",
        tag: "The two gates that matter",
        title: "The front door is the balancer now, not a public IP.",
        body: "Reachability changed shape. The first gate is no longer a public IP on the server; it is the load balancer's internet-facing front door, the only public thing in the build. The second gate is no longer a rule allowing the whole internet; it is the instance firewall allowing the load balancer as its source. Miss either and the page never loads.",
      },
      {
        kind: "note",
        tag: "Health checks decide who gets traffic",
        title: "A blocked target is a failing health check.",
        body: "The load balancer only forwards to targets that pass their health check. If the instance firewall blocks the balancer, the health check fails too, so the target is quietly taken out of rotation. That is why a firewall mistake here shows up as an unhealthy target, not a timeout.",
      },
    ],
  },

  steps: [
    {
      label: "Create a VPC with public and private subnets",
      concept: "virtual-network",
      detail:
        "Give the network an address range (10.0.0.0/16). Carve two public subnets in two different Availability Zones for the load balancer, and a private subnet for the instances. Attach an Internet Gateway and route the public subnets' 0.0.0.0/0 to it.",
      cli: "aws ec2 create-vpc · create-subnet · create-internet-gateway",
    },
    {
      label: "Add a NAT gateway for private outbound",
      concept: "virtual-network",
      detail:
        "The private instances have no route to the internet, so they cannot install packages. Put a NAT gateway in a public subnet with an Elastic IP, then route the private subnet's 0.0.0.0/0 to it. Now the instances can reach out but stay unreachable from outside.",
      cli: "aws ec2 create-nat-gateway --subnet-id <public> --allocation-id <eip>",
    },
    {
      label: "Create two security groups",
      concept: "virtual-network",
      detail:
        "The ALB security group allows inbound port 80 and 443 from the internet. The instance security group allows inbound port 80 only from the ALB security group as the source, so the internet can never reach the instance directly.",
      cli: "aws ec2 authorize-security-group-ingress --source-group <alb-sg>",
    },
    {
      label: "Launch EC2 instances in the private subnet",
      concept: "virtual-machines",
      detail:
        "Pick an Amazon Linux image and a small instance type, place the instances in the private subnet with no public IP, attach the instance security group, and pass a user-data script that installs nginx on first boot.",
      cli: "aws ec2 run-instances --no-associate-public-ip-address --user-data file://install-nginx.sh",
    },
    {
      label: "Create a target group and register the instances",
      concept: "load-balancing",
      detail:
        "Create a target group of type instance on HTTP port 80, with a health check that requests GET / and expects a 200. Register the instances into it. The load balancer will forward only to targets this group reports healthy.",
      cli: "aws elbv2 create-target-group --target-type instance · register-targets",
    },
    {
      label: "Create the load balancer and a listener",
      concept: "load-balancing",
      detail:
        "Create an internet-facing Application Load Balancer across the two public subnets with the ALB security group. Add a listener on port 80 whose default action forwards to the target group. This is the public front door.",
      cli: "aws elbv2 create-load-balancer --scheme internet-facing · create-listener",
    },
    {
      label: "Browse to the load balancer's DNS name",
      detail:
        "Open http://<load-balancer-dns> in a browser. If the page loads, every gate from Chapter 1 is open. A 502 or 504 almost always means the target is unhealthy: check the instance security group and that nginx is listening.",
    },
  ],

  provision: {
    filename: "install-nginx.sh",
    mechanism: "EC2 user data",
    lines: [
      {
        code: "#!/bin/bash",
        note: "Run this script with bash. User data runs once, as root, on the first boot.",
      },
      {
        code: "dnf install -y nginx",
        note: "Install nginx from the Amazon Linux 2023 repositories. This reaches the internet through the NAT gateway, since the instance has no public IP of its own.",
      },
      {
        code: 'echo "<h1>Hello from a private EC2 instance</h1>" > /usr/share/nginx/html/index.html',
        note: "Write a one-line page into the nginx web root, replacing the default welcome page.",
      },
      {
        code: "systemctl enable --now nginx",
        note: "Start nginx now and set it to start automatically on every future boot, so the load balancer's health check passes.",
      },
    ],
    page: {
      heading: "Hello from a private EC2 instance",
      sub: "served by nginx, reached through the load balancer",
    },
    callouts: [
      {
        kind: "note",
        tag: "Why the NAT gateway matters here",
        title: "No public IP means the install depends on the NAT gateway.",
        body: "On the public web-server build, the instance had its own public IP and could reach the package repositories directly. Here it does not, so dnf install can only work because the private subnet routes outbound through the NAT gateway. Without it, or without a prebaked image that already has nginx, the install hangs and the target never becomes healthy.",
      },
      {
        kind: "fix",
        tag: "If the load balancer returns 502",
        title: "A running nginx can still be an unhealthy target.",
        body: "Provisioning and reachability are separate. If nginx is installed and running but the load balancer returns 502 or 504, the balancer cannot reach the target: check that the instance security group allows port 80 from the ALB security group and that nginx is actually listening on port 80.",
      },
    ],
  },

  quiz: [
    {
      q: "Your instances are in a private subnet with nginx running, but the load balancer returns 502. Which is the most likely cause?",
      opts: [
        "The instances need public IP addresses",
        "The instance security group does not allow port 80 from the ALB security group",
        "The VPC is too small",
        "The load balancer is in the wrong Availability Zone",
      ],
      answer: 1,
      explain:
        "A 502 means the load balancer could not get a healthy response from the target. The usual cause is the instance security group not allowing port 80 from the ALB security group, so the forwarded request and the health check are both dropped.",
    },
    {
      q: "How can an EC2 instance with no public IP still install nginx on first boot?",
      opts: [
        "AWS pre-installs nginx on every instance",
        "It borrows the load balancer's public IP",
        "The private subnet routes outbound traffic through a NAT gateway",
        "It cannot; you must give it a public IP",
      ],
      answer: 2,
      explain:
        "The private subnet's route table sends 0.0.0.0/0 to a NAT gateway, which gives the instance outbound internet access to reach the package repositories while accepting no inbound connections. A prebaked image is the alternative.",
    },
    {
      q: "What makes the load balancer reachable from the internet while the instances are not?",
      opts: [
        "The instances are simply turned off to the public",
        "The ALB is internet-facing in public subnets; the instances have private IPs only",
        "The instances use public-looking IP numbers",
        "Nothing; both are reachable",
      ],
      answer: 1,
      explain:
        "The Application Load Balancer is internet-facing and lives in public subnets, so it has a public front door. The instances sit in a private subnet with no public IP, reachable only over private IPs, which the balancer uses to forward traffic.",
    },
    {
      q: "An internet-facing Application Load Balancer requires…",
      opts: [
        "A single public subnet",
        "Subnets in at least two Availability Zones",
        "The instances to have public IPs",
        "A NAT gateway in front of it",
      ],
      answer: 1,
      explain:
        "An ALB must be given subnets in at least two Availability Zones so it stays available if one zone fails. For an internet-facing scheme, those subnets must be public with a route to an Internet Gateway.",
    },
    {
      q: "How does the instance security group restrict inbound traffic to just the load balancer?",
      opts: [
        "It allows port 80 from 0.0.0.0/0",
        "It references the ALB's security group as the source",
        "It blocks all traffic and relies on the NAT gateway",
        "It only allows traffic from the same subnet",
      ],
      answer: 1,
      explain:
        "The inbound rule names the ALB's security group as its source rather than an IP range. Only traffic from resources in that security group, meaning the load balancer, is accepted, so the internet cannot reach the instance directly.",
    },
    {
      q: "The load balancer forwards a request to a target only when that target…",
      opts: [
        "has the most free memory",
        "passes its health check",
        "is in the same subnet as the browser",
        "has a public IP",
      ],
      answer: 1,
      explain:
        "Health checks gate the traffic. The load balancer periodically checks each target and forwards only to those passing, so a blocked or broken instance is quietly taken out of rotation instead of serving errors to users.",
    },
  ],
};

/* =============================== Azure ================================= */

const AZURE: LoadBalancedContent = {
  chapters: [
    {
      navLabel: "plan",
      kicker: "Chapter 0 · The plan",
      title: "The whole build on one screen",
      intro:
        "This is the web server you already built, moved one rung up: the VMs now sit in a private backend subnet with no public IP, and the only way in is an Application Gateway in front of them. Tap any labelled piece to read what it is and how it relates to its neighbours.",
    },
    {
      navLabel: "request",
      kicker: "Chapter 1 · The request path",
      title: "What a browser has to get through",
      intro:
        "A visitor's request no longer reaches a public VM directly. It arrives at the gateway's public frontend, gets routed to a healthy backend, and only then crosses the backend firewall to nginx. Close a gate and watch the request stop.",
    },
    {
      navLabel: "build",
      kicker: "Chapter 2 · The build order",
      title: "Seven steps, in order",
      intro:
        "Here is the whole build as an ordered checklist. Each step depends on the ones above it, and each draws on a concept you have already met. Expand a step to see what it does and why.",
    },
    {
      navLabel: "provision",
      kicker: "Chapter 3 · Installing nginx",
      title: "The cloud-init that runs on first boot",
      intro:
        "The VMs have no public IP, so the first-boot file can only install nginx because the backend subnet egresses through a NAT gateway. Step through the file, then see what the gateway serves.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 4 · Check yourself",
      title: "Six questions",
      intro:
        "Pick an answer to see whether it holds up. These are the exact spots people slip when they put private compute behind a Layer 7 load balancer.",
    },
  ],

  arch: [
    {
      key: "internet",
      label: "The internet",
      tone: "resource",
      kind: "resource",
    },
    {
      key: "vnet",
      label: "VNet",
      sub: "10.21.0.0/16",
      tone: "net",
      kind: "container",
      children: [
        {
          key: "agSubnet",
          label: "Application Gateway subnet",
          sub: "10.21.0.0/24 · dedicated",
          tone: "public",
          kind: "container",
          attached: [
            {
              key: "agNsg",
              label: "Gateway NSG",
              tone: "firewall",
              kind: "rule",
            },
          ],
          children: [
            {
              key: "appgw",
              label: "Application Gateway",
              sub: "Layer 7 · Standard_v2",
              tone: "public",
              kind: "resource",
              attached: [
                {
                  key: "pip",
                  label: "Public IP",
                  tone: "public",
                  kind: "resource",
                },
              ],
            },
          ],
        },
        {
          key: "backendSubnet",
          label: "Backend subnet",
          sub: "10.21.1.0/24 · route → NAT",
          tone: "private",
          kind: "container",
          attached: [
            {
              key: "natgw",
              label: "NAT gateway",
              tone: "public",
              kind: "resource",
            },
            {
              key: "beNsg",
              label: "Backend NSG",
              tone: "firewall",
              kind: "rule",
            },
          ],
          children: [
            {
              key: "vm",
              label: "Virtual machines",
              sub: "Ubuntu · nginx · no public IP",
              tone: "resource",
              kind: "resource",
              children: [
                {
                  key: "nic",
                  label: "Network interface",
                  sub: "10.21.1.4 · private only",
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
      body: "Where your visitors are. Their browsers reach only the Application Gateway's public IP. Nothing behind it has a public address, so the gateway is the single, deliberate way in.",
    },
    vnet: {
      title: "Virtual Network (VNet)",
      rel: "the outermost box · owns an address space",
      body: "Your private network in Azure, from the Virtual Network concept. It owns an address space (10.21.0.0/16) and holds both the gateway's dedicated subnet and the backend subnet the VMs hide in.",
    },
    agSubnet: {
      title: "Application Gateway subnet",
      rel: "a dedicated box inside the VNet",
      body: "The Application Gateway requires its own subnet that no other resource can share. A /24 is recommended so the gateway has room to scale. Only the gateway lives here; your VMs go in a separate subnet.",
    },
    agNsg: {
      title: "Gateway NSG",
      rel: "rules associated with the gateway subnet",
      body: "Must allow the client ports (80 and 443) inbound, and must also allow inbound from the GatewayManager service tag on ports 65200-65535, which is the gateway's own control channel. Deny that and the gateway itself breaks.",
    },
    appgw: {
      title: "Application Gateway",
      rel: "in the dedicated subnet · the front door",
      body: "The Layer 7 load balancer, from the Load Balancing concept. A listener accepts requests on its public frontend, a routing rule sends them to a backend pool, and health probes keep traffic off any VM that is not answering. It is the only public thing in the build.",
    },
    pip: {
      title: "Public IP",
      rel: "attached to the gateway's frontend",
      body: "A Standard, static public IP resource on the gateway's frontend. The Standard_v2 gateway requires it, and it is the address the whole internet actually talks to. The VMs behind never get one.",
    },
    backendSubnet: {
      title: "Backend subnet",
      rel: "a box inside the VNet",
      body: "Where the VMs actually run. It is separate from the gateway subnet, and its VMs have no public IP. A NAT gateway associated here gives them outbound internet while keeping them unreachable from outside.",
    },
    natgw: {
      title: "NAT gateway",
      rel: "associated with the backend subnet · outbound only",
      body: "Gives the private VMs a way out to the internet so a first-boot file can install nginx. Azure's implicit default outbound access is being retired, so this is the explicit egress you should rely on. It never accepts unsolicited inbound connections.",
    },
    beNsg: {
      title: "Backend NSG",
      rel: "rules associated with the backend subnet",
      body: "Allows inbound port 80 sourced from the Application Gateway subnet's address range, not from the internet. There is no service tag for your specific gateway, so you scope the rule to its subnet CIDR.",
    },
    vm: {
      title: "Virtual machines",
      rel: "the servers · run nginx",
      body: "The servers themselves, from the Virtual Machines concept, with no public IP. The gateway's backend pool points at their private IPs and forwards traffic to them. You can run several identical ones and let the gateway spread traffic across them.",
    },
    nic: {
      title: "Network interface",
      rel: "attached to the VM · private IP only",
      body: "The VM's network card carries a private IP (10.21.1.4) and nothing else. There is no public address to route to from outside, so the only traffic it sees is what the Application Gateway forwards.",
    },
  },

  archHint:
    "Read it inside-out: the VMs run nginx on private IPs with no way in from the internet. The Application Gateway, alone in its dedicated subnet, is the only public front door, and it reaches the VMs over the private network. The NAT gateway is the one-way exit that lets them install packages.",

  flow: {
    stages: [
      { id: "browser", label: "Browser", sub: "a visitor", tone: "resource" },
      {
        id: "appgw",
        label: "Application Gateway",
        sub: "public frontend",
        tone: "public",
      },
      {
        id: "route",
        label: "Listener + rule",
        sub: "route → backend pool",
        tone: "net",
      },
      {
        id: "nsg",
        label: "Backend NSG",
        sub: "allow gateway?",
        tone: "firewall",
      },
      { id: "nginx", label: "nginx", sub: "private VM", tone: "ok" },
    ],
    reach: {
      id: "publicFrontend",
      label: "Gateway has a public frontend",
      defaultOn: true,
      stage: 1,
      failTitle: "no public front door",
      failBody:
        "The Application Gateway has no public frontend, so the browser has nothing to reach. The VMs have no public IP of their own, so there is no fallback path. Give the gateway a Standard public IP and a listener on its public frontend.",
    },
    firewall: {
      id: "allowGateway",
      label: "Backend NSG allows the gateway",
      defaultOn: true,
      stage: 3,
      failTitle: "stopped at the backend NSG",
      failBody:
        "The gateway took the request and tried to forward it, but the backend NSG has no inbound rule allowing port 80 from the Application Gateway subnet. The request is dropped, the health probe fails, and the backend is marked unhealthy. Allow port 80 from the gateway subnet's address range.",
    },
    serverStage: 4,
    passTitle: "nginx answered · 200 OK",
    passBody:
      "The gateway's public frontend accepted the request, a routing rule sent it to the backend pool, the backend NSG allowed traffic from the gateway subnet, and nginx returned the page over the private network. The VM never needed a public IP.",
    callouts: [
      {
        kind: "fix",
        tag: "The two gates that matter",
        title: "The front door is the gateway now, not a public IP.",
        body: "Reachability changed shape. The first gate is no longer a public IP on the VM; it is the Application Gateway's public frontend, the only public thing in the build. The second gate is no longer a rule allowing the whole internet; it is the backend NSG allowing the gateway's subnet as its source. Miss either and the page never loads.",
      },
      {
        kind: "note",
        tag: "Health probes decide who gets traffic",
        title: "A blocked backend is a failing health probe.",
        body: "The gateway only forwards to backends that pass their health probe. If the backend NSG blocks the gateway, the probe fails too, so the backend is quietly taken out of rotation. That is why a firewall mistake here shows up as an unhealthy backend, not a timeout.",
      },
    ],
  },

  steps: [
    {
      label: "Create a VNet with a gateway subnet and a backend subnet",
      concept: "virtual-network",
      detail:
        "Give the network an address space (10.21.0.0/16). Carve a dedicated subnet for the Application Gateway (a /24 is recommended, and no other resource may share it), and a separate backend subnet for the VMs.",
      cli: "az network vnet create · az network vnet subnet create",
    },
    {
      label: "Add a NAT gateway for backend outbound",
      concept: "virtual-network",
      detail:
        "A VM with no public IP has no guaranteed way out, and Azure's implicit default outbound access is being retired. Associate a NAT gateway with the backend subnet so the VMs can install packages on first boot while staying unreachable from the internet.",
      cli: "az network nat gateway create · az network vnet subnet update --nat-gateway",
    },
    {
      label: "Create the NSGs",
      concept: "virtual-network",
      detail:
        "The gateway NSG must allow the client ports and inbound from the GatewayManager service tag on 65200-65535, or the gateway itself fails. The backend NSG allows port 80 only from the gateway subnet's address range.",
      cli: "az network nsg rule create --source-address-prefixes GatewayManager --destination-port-ranges 65200-65535",
    },
    {
      label: "Create the VMs in the backend subnet",
      concept: "virtual-machines",
      detail:
        "Pick an Ubuntu image and a small size, place the VMs in the backend subnet with no public IP, and pass a cloud-init file as custom data so each one installs nginx on first boot.",
      cli: 'az vm create --image Ubuntu2204 --public-ip-address "" --custom-data cloud-init.yaml',
    },
    {
      label: "Create the Application Gateway frontend",
      concept: "load-balancing",
      detail:
        "Create a Standard_v2 Application Gateway in its dedicated subnet with a Standard static public IP and a listener on port 80. This is the public front door that the whole internet talks to.",
      cli: "az network application-gateway create --sku Standard_v2 --public-ip-address <pip> --subnet <ag-subnet>",
    },
    {
      label: "Wire the backend pool, settings, and probe",
      concept: "load-balancing",
      detail:
        "Point the backend pool at the VMs' private IPs, set the backend settings to HTTP port 80, add a health probe, and bind them with a routing rule. The create command does this in one shot when you pass the servers and a rule priority.",
      cli: "az network application-gateway create --servers <vm-ip-1> <vm-ip-2> --priority 100",
    },
    {
      label: "Browse to the gateway's public IP",
      detail:
        "Open http://<public-ip> in a browser. If the page loads, every gate from Chapter 1 is open. A 502 almost always means the backend is unhealthy: check the backend NSG and that nginx is listening.",
    },
  ],

  provision: {
    filename: "cloud-init.yaml",
    mechanism: "custom data (cloud-init)",
    lines: [
      {
        code: "#cloud-config",
        note: "The header cloud-init looks for. It marks this as a cloud-config file, not a shell script.",
      },
      {
        code: "package_upgrade: true",
        note: "Refresh the package lists and upgrade installed packages before installing anything new. This reaches the archives through the NAT gateway.",
      },
      {
        code: "packages:",
        note: "A list of packages to install. cloud-init picks the right package manager for the distro (apt on Ubuntu).",
      },
      {
        code: "  - nginx",
        note: "Install nginx. On Ubuntu this also starts and enables the service automatically, so the gateway's health probe passes.",
      },
      {
        code: "write_files:",
        note: "Files to create on first boot, before the run commands.",
      },
      {
        code: "  - path: /var/www/html/index.html",
        note: "The nginx web root on Ubuntu. Writing here replaces the default welcome page.",
      },
      {
        code: "    content: <h1>Hello from a private VM</h1>",
        note: "The one-line page nginx will serve behind the gateway.",
      },
    ],
    page: {
      heading: "Hello from a private VM",
      sub: "served by nginx, reached through the gateway",
    },
    callouts: [
      {
        kind: "note",
        tag: "Why the NAT gateway matters here",
        title: "No public IP means the install depends on the NAT gateway.",
        body: "On the public web-server build, the VM had its own public IP and could reach the package archives directly. Here it does not. Azure's implicit default outbound access is being retired, so a new VM with no public IP has no guaranteed egress. The NAT gateway on the backend subnet is the explicit path that lets apt install nginx.",
      },
      {
        kind: "fix",
        tag: "If the gateway returns 502",
        title: "A running nginx can still be an unhealthy backend.",
        body: "Provisioning and reachability are separate. If nginx is installed and running but the gateway returns 502, the gateway cannot reach the backend: check that the backend NSG allows port 80 from the gateway subnet and that the health probe path returns a success code.",
      },
    ],
  },

  quiz: [
    {
      q: "Your VMs are in a backend subnet with nginx running, but the Application Gateway returns 502. Which is the most likely cause?",
      opts: [
        "The VMs need public IP addresses",
        "The backend NSG does not allow port 80 from the gateway subnet",
        "The VNet is too small",
        "The VMs are the wrong size",
      ],
      answer: 1,
      explain:
        "A 502 means the gateway could not get a healthy response from the backend. The usual cause is the backend NSG not allowing port 80 from the Application Gateway subnet, so the forwarded request and the health probe are both dropped.",
    },
    {
      q: "Why does the Application Gateway need its own subnet?",
      opts: [
        "To give it a public IP",
        "It requires a dedicated subnet that no other resource can share",
        "So the VMs can share its NSG",
        "To make the subnet public",
      ],
      answer: 1,
      explain:
        "An Application Gateway must be deployed into a dedicated subnet where no other resources are placed. A /24 is recommended so the gateway has room to scale its instances.",
    },
    {
      q: "How can a VM with no public IP still install nginx on first boot?",
      opts: [
        "Azure pre-installs nginx on every VM",
        "It borrows the gateway's public IP",
        "A NAT gateway on the backend subnet provides outbound access",
        "It cannot; you must give it a public IP",
      ],
      answer: 2,
      explain:
        "A NAT gateway associated with the backend subnet gives the VMs outbound internet to reach the package archives while accepting no inbound connections. Relying on Azure's default outbound access is not an option since it is being retired.",
    },
    {
      q: "The gateway subnet's NSG must allow inbound from which service tag on ports 65200-65535?",
      opts: [
        "Internet",
        "AzureLoadBalancer",
        "GatewayManager",
        "VirtualNetwork",
      ],
      answer: 2,
      explain:
        "A v2 Application Gateway needs inbound from the GatewayManager service tag on ports 65200-65535 for its control channel. Block it and the gateway loses management connectivity and reports unhealthy.",
    },
    {
      q: "What makes the gateway reachable from the internet while the VMs are not?",
      opts: [
        "The VMs are simply turned off to the public",
        "The gateway has a public frontend; the VMs have private IPs only",
        "The VMs use public-looking IP numbers",
        "Nothing; both are reachable",
      ],
      answer: 1,
      explain:
        "The Application Gateway has a Standard public IP on its frontend, so it has a public front door. The VMs sit in a private backend subnet with no public IP, reachable only over private IPs, which the gateway uses to forward traffic.",
    },
    {
      q: "The gateway forwards a request to a backend only when that backend…",
      opts: [
        "has the most free memory",
        "passes its health probe",
        "is in the same subnet as the browser",
        "has a public IP",
      ],
      answer: 1,
      explain:
        "Health probes gate the traffic. The gateway periodically probes each backend and forwards only to those passing, so a blocked or broken VM is quietly taken out of rotation instead of serving errors to users.",
    },
  ],
};

export const CONTENT: Record<Provider, LoadBalancedContent> = {
  aws: AWS,
  azure: AZURE,
};

/* ========================= Reference-tab data ========================== */

/** Shared-responsibility split for the "Who owns what" reference tab. */
export const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "the OS, patches, and the nginx install and config",
      "the page content nginx serves",
      "the ALB listener, rules, target group, and health checks",
      "both security groups and which sources they trust",
      "the NAT gateway and the private subnet's route table",
      "instance type, how many run, cost, and when to stop them",
    ],
    providerManages: [
      "the physical host and hypervisor",
      "the software-defined network fabric",
      "the load balancer data plane and its per-AZ nodes",
      "the managed NAT gateway and Internet Gateway plumbing",
      "physical security of the data centers",
    ],
    mutable: [
      "security group rules on either group",
      "the ALB's subnets and Availability Zones (keep at least two)",
      "target group health-check settings and registered targets",
      "listener rules and forwarding actions",
      "instance type (stop, resize, start)",
    ],
    immutable: [
      "the ALB scheme (internet-facing or internal)",
      "a target group's target type, protocol, and port",
      "the VPC and subnet an instance launched into",
      "the AMI an instance booted from",
    ],
  },
  azure: {
    youManage: [
      "the OS, patches, and the nginx install and config",
      "the page content nginx serves",
      "the gateway SKU, listeners, backend pool, settings, and probes",
      "both NSGs and which sources they trust",
      "the NAT gateway associated with the backend subnet",
      "VM size, how many run, cost, and when to deallocate them",
    ],
    providerManages: [
      "the physical host and hypervisor",
      "the software-defined network fabric",
      "the gateway data plane and its autoscaling instances",
      "the managed NAT gateway and public IP plumbing",
      "physical security of the data centers",
    ],
    mutable: [
      "NSG rules on either group",
      "backend pool members (add or remove servers)",
      "backend settings and the health probe",
      "routing rules and listeners",
      "VM size (deallocate, resize, start)",
    ],
    immutable: [
      "the gateway SKU tier (v1 or v2)",
      "the VNet a VM connects to",
      "the OS disk image the VM was created from",
      "the dedicated-subnet requirement for the gateway",
    ],
  },
};

/** Security practices for the "Lock it down, and why" reference tab. */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "A new security group allows nothing inbound, and instances in a private subnet have no public IP, so nothing is exposed until you open a path. The one path you open runs through the load balancer, never straight to an instance.",
    practices: [
      {
        risk: "Direct exposure",
        label: "Keep the instances in a private subnet with no public IP",
        why: "Only the load balancer sits in public subnets. The instances answer on private IPs only, so a firewall slip cannot accidentally expose them to the internet the way a public IP would.",
      },
      {
        risk: "Over-broad firewall",
        label: "Allow the app port from the ALB security group, not 0.0.0.0/0",
        why: "Sourcing the instance rule on the load balancer's security group means only traffic the balancer forwards is accepted. Even if someone learned the private IP, the internet has no path to it.",
      },
      {
        risk: "Unsolicited inbound",
        label: "Use the NAT gateway for outbound only",
        why: "A NAT gateway lets instances reach the internet to patch and install packages but never accepts unsolicited inbound connections, so opening a path out does not open a path in.",
      },
      {
        risk: "Plaintext traffic",
        label: "Terminate HTTPS at the load balancer",
        why: "Add a port 443 listener with an ACM certificate so traffic is encrypted to the front door. The load balancer is the natural place to centralize TLS instead of managing certificates on every instance.",
      },
      {
        risk: "Open management port",
        label: "Do not expose SSH to the internet",
        why: "Reach the instances through SSM Session Manager or a bastion rather than opening port 22. The private subnet already removes the direct path, so keep it that way.",
      },
    ],
  },
  azure: {
    posture:
      "An NSG's default rules deny inbound internet traffic, and a VM with no public IP has no front door, so the VMs are unreachable until you route a path through the gateway. The gateway subnet still needs its required infrastructure rules or the gateway itself breaks.",
    practices: [
      {
        risk: "Direct exposure",
        label: "Keep the VMs in a private backend subnet with no public IP",
        why: "Only the gateway has a public frontend. The VMs answer on private IPs only, so they cannot be reached directly from the internet no matter how the rest is configured.",
      },
      {
        risk: "Over-broad firewall",
        label: "Allow the app port from the gateway subnet, not Any",
        why: "Scope the backend NSG rule to the Application Gateway subnet's address range so only the gateway's forwarded traffic is accepted. There is no service tag for a specific gateway, so the subnet CIDR is how you scope it.",
      },
      {
        risk: "Broken gateway",
        label: "Keep the GatewayManager and AzureLoadBalancer rules",
        why: "A v2 gateway needs inbound from the GatewayManager service tag on 65200-65535 and from the AzureLoadBalancer tag. Deny either and the gateway loses its control channel and reports its backends unhealthy.",
      },
      {
        risk: "Unsolicited inbound",
        label: "Use the NAT gateway for outbound only",
        why: "A NAT gateway gives the private VMs egress to patch and install packages without ever accepting inbound connections, so egress never becomes an ingress path.",
      },
      {
        risk: "Plaintext traffic",
        label: "Terminate HTTPS on the gateway listener",
        why: "Put the certificate on the gateway's port 443 listener so traffic is encrypted to the public frontend. Centralizing TLS at the edge keeps certificates off every VM.",
      },
    ],
  },
};

/** Copy-ready coding-agent prompts for the "Set it up with an agent" tab. */
export const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Private app behind an ALB",
        blurb:
          "The whole build in one go: a VPC with public and private subnets, a NAT gateway for outbound, two security groups, private EC2 instances that install nginx on first boot, and an internet-facing Application Load Balancer in front.",
        prompt:
          "Provision a private web app behind an Application Load Balancer on AWS using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Create a VPC named intro-lb-vpc (10.0.0.0/16). Create two public subnets in two different Availability Zones (10.0.1.0/24 and 10.0.2.0/24) and one private subnet (10.0.3.0/24). Attach an internet gateway and add a route sending 0.0.0.0/0 through it for the public subnets. Allocate an Elastic IP and create a NAT gateway in one public subnet, then add a route sending 0.0.0.0/0 through the NAT gateway for the private subnet. Create an ALB security group allowing inbound TCP 80 and 443 from 0.0.0.0/0. Create an instance security group allowing inbound TCP 80 from the ALB security group only (use --source-group). Launch two t3.micro Amazon Linux 2023 instances into the private subnet with --no-associate-public-ip-address and the instance security group, passing user data that runs `dnf install -y nginx`, writes `<h1>Hello from a private EC2 instance</h1>` to /usr/share/nginx/html/index.html, and runs `systemctl enable --now nginx`. Create a target group of --target-type instance on --protocol HTTP --port 80 with a health check on path / expecting HTTP 200, and register both instances. Create an internet-facing Application Load Balancer (--type application, --scheme internet-facing) across the two public subnets with the ALB security group, and add a listener on port 80 whose default action forwards to the target group. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Tag every resource clearly so it is easy to find and clean up. When finished, print the VPC ID, subnet IDs, security group IDs, instance IDs, target group ARN, load balancer ARN, and the load balancer DNS name plus the http URL to open.",
      },
      {
        label: "Skip the NAT gateway with a prebaked image",
        blurb:
          "A leaner path when you want to avoid paying for a NAT gateway: launch the private instances from an AMI that already has nginx installed, so they need no outbound internet on first boot at all.",
        prompt:
          "Provision a private web app behind an Application Load Balancer on AWS using the aws CLI, without a NAT gateway. First run `aws sts get-caller-identity` and confirm the region. I will give you the ID of a custom AMI that already has nginx installed and enabled, so the private instances need no outbound internet. Create a VPC named intro-lb-vpc (10.0.0.0/16), two public subnets in two Availability Zones for the load balancer, and one private subnet for the instances, with an internet gateway and a public route table (no NAT gateway). Create an ALB security group allowing inbound TCP 80 and 443 from 0.0.0.0/0, and an instance security group allowing inbound TCP 80 from the ALB security group only (--source-group). Launch two t3.micro instances from my prebaked AMI into the private subnet with --no-associate-public-ip-address and the instance security group. Create a target group (--target-type instance, HTTP 80, health check path /) and register both instances. Create an internet-facing Application Load Balancer across the two public subnets with the ALB security group and a listener on port 80 forwarding to the target group. Before running anything that creates or deletes resources, print the full plan and wait for me to confirm. Tag everything clearly. When finished, print the security group IDs, instance IDs, target group ARN, load balancer ARN, and the load balancer DNS name plus the http URL.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Private app behind an Application Gateway",
        blurb:
          "The whole build in one go: a VNet with a dedicated gateway subnet and a backend subnet, a NAT gateway for outbound, both NSGs, private VMs that install nginx on first boot, and a Standard_v2 Application Gateway in front.",
        prompt:
          'Provision a private web app behind an Application Gateway on Azure using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group named intro-lb-rg. Create a VNet intro-lb-vnet (10.21.0.0/16) with a dedicated subnet for the Application Gateway named appgw-subnet (10.21.0.0/24) and a separate backend subnet named backend-subnet (10.21.1.0/24). Create a Standard, static public IP for the gateway. Create a NAT gateway and associate it with the backend subnet so the VMs have outbound internet. Create an NSG for the gateway subnet that allows inbound TCP 80 and 443 from the internet and inbound from the GatewayManager service tag on ports 65200-65535, and associate it with appgw-subnet. Create an NSG for the backend subnet that allows inbound TCP 80 from the 10.21.0.0/24 gateway subnet only, and associate it with backend-subnet. Write a cloud-init file that installs nginx and writes `<h1>Hello from a private VM</h1>` to /var/www/html/index.html. Create two Ubuntu2204 VMs in backend-subnet with --public-ip-address "" (no public IP), --generate-ssh-keys, and --custom-data pointing at the cloud-init file. Create a Standard_v2 Application Gateway in appgw-subnet with the public IP, --servers set to the two VMs\' private IPs, --http-settings-port 80, --frontend-port 80, --capacity 2, and --priority 100 for the routing rule. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming so the resources are easy to locate and remove later. When finished, print the resource group, VNet and subnet names, NSG names, VM names and private IPs, the gateway name, and the public IP address plus the http URL to open.',
      },
      {
        label: "Reuse an existing VNet",
        blurb:
          "More control when a network already exists: create the dedicated gateway subnet and backend subnet inside your current VNet, then build the rest. Reach for this when the VNet must match an existing standard.",
        prompt:
          'Provision a private web app behind an Application Gateway on Azure into an existing VNet, using the az CLI. First run `az account show` and confirm the subscription and location, then confirm the name and resource group of the VNet I want to use and that it has free address space. In that VNet, create a dedicated subnet for the Application Gateway named appgw-subnet (a /24 with no other resources) and a backend subnet named backend-subnet. Create a Standard static public IP. Create a NAT gateway and associate it with backend-subnet. Create an NSG for appgw-subnet allowing inbound TCP 80 and 443 from the internet plus inbound from the GatewayManager service tag on 65200-65535, and an NSG for backend-subnet allowing inbound TCP 80 from the appgw-subnet address range only. Write a cloud-init file that installs nginx and writes a simple index.html to /var/www/html. Create two Ubuntu2204 VMs in backend-subnet with --public-ip-address "", --generate-ssh-keys, and --custom-data pointing at the cloud-init file. Create a Standard_v2 Application Gateway in appgw-subnet with the public IP, --servers set to the VMs\' private IPs, --frontend-port 80, --http-settings-port 80, --capacity 2, and --priority 100. Before running anything that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming. When finished, print the subnet names, NSG names, VM names and private IPs, gateway name, and the public IP plus the http URL.',
      },
    ],
  },
};

/** Per-lens further-reading links to the authoritative provider docs. */
export const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is an Application Load Balancer?",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
      note: "The Layer 7 load balancer: listeners, rules, and target groups.",
    },
    {
      label: "How Elastic Load Balancing works",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html",
      note: "Internet-facing versus internal schemes, and the two-Availability-Zone requirement.",
    },
    {
      label: "Health checks for your target groups",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html",
      note: "How the load balancer decides which targets are healthy enough to receive traffic.",
    },
    {
      label: "NAT gateways",
      href: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html",
      note: "Outbound-only internet for the private instances, so first-boot installs work.",
    },
    {
      label: "Security group rules",
      href: "https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html",
      note: "Referencing the load balancer's security group as a source instead of an IP range.",
    },
  ],
  azure: [
    {
      label: "What is Azure Application Gateway?",
      href: "https://learn.microsoft.com/en-us/azure/application-gateway/overview",
      note: "The Layer 7 load balancer: listeners, routing rules, backend pools, and settings.",
    },
    {
      label: "Application Gateway infrastructure configuration",
      href: "https://learn.microsoft.com/en-us/azure/application-gateway/configuration-infrastructure",
      note: "The dedicated subnet and the required GatewayManager NSG rules.",
    },
    {
      label: "Application Gateway health probes overview",
      href: "https://learn.microsoft.com/en-us/azure/application-gateway/application-gateway-probe-overview",
      note: "How the gateway probes each backend and removes the unhealthy ones.",
    },
    {
      label: "What is Azure NAT Gateway?",
      href: "https://learn.microsoft.com/en-us/azure/nat-gateway/nat-overview",
      note: "Outbound-only egress for the private backend VMs.",
    },
    {
      label: "Default outbound access in Azure",
      href: "https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access",
      note: "Why a new VM needs an explicit outbound method, not the retiring implicit one.",
    },
  ],
};
