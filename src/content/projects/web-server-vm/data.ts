import type { CalloutData } from "@/components/lesson/callout";
import type { QuizQ } from "@/components/lesson/quiz";
import type { Tone } from "@/components/lesson/tones";
import type { Provider } from "@/content/types";

/*
 * All provider-specific content for the "Web Server on a VM" capstone. The
 * interactive components under this folder are provider-agnostic and read
 * everything they render from here, so the AWS and Azure builds stay bespoke
 * (they genuinely differ in how a VM becomes reachable and how the firewall is
 * shaped) without duplicating the interaction machinery.
 *
 * Prose is kept neutral and professional; no em dashes (house rule). Facts are
 * grounded in the provider documentation linked from the lesson shell.
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
  /** The gate that fails first if off (a public front door: public IP / IGW). */
  reach: FlowGate;
  /** The gate that fails next if off (the firewall allowing port 80 inbound). */
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

export interface WebServerContent {
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

const AWS: WebServerContent = {
  chapters: [
    {
      navLabel: "plan",
      kicker: "Chapter 0 · The plan",
      title: "The whole build on one screen",
      intro:
        "You are going to run one small web server and reach it from a browser. Tap any labelled piece to read what it is and how it relates to its neighbours. Notice which pieces you build once and which are rules you attach.",
    },
    {
      navLabel: "request",
      kicker: "Chapter 1 · The request path",
      title: "What a browser has to get through",
      intro:
        "A visitor's request has to cross a few gates before nginx can answer it. The clearest way to see what each gate does is to close it and watch the request stop. Toggle them, send a request, and read the verdict.",
    },
    {
      navLabel: "build",
      kicker: "Chapter 2 · The build order",
      title: "Six steps, in order",
      intro:
        "Here is the whole build as an ordered checklist. Each step depends on the ones above it, and each draws on a concept you have already met. Expand a step to see what it does and why.",
    },
    {
      navLabel: "provision",
      kicker: "Chapter 3 · Installing nginx",
      title: "The script that runs on first boot",
      intro:
        "Launching the instance gives you a bare Linux box. A user-data script runs once, automatically, the first time it boots, and turns that box into a web server. Step through it line by line, then see what it serves.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 4 · Check yourself",
      title: "Six questions",
      intro:
        "Pick an answer to see whether it holds up. These are the exact spots people slip when they stand up their first server.",
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
          key: "subnet",
          label: "Public subnet",
          sub: "10.0.1.0/24 · route 0.0.0.0/0 → IGW",
          tone: "public",
          kind: "container",
          children: [
            {
              key: "ec2",
              label: "EC2 instance",
              sub: "Amazon Linux · nginx",
              tone: "resource",
              kind: "resource",
              children: [
                {
                  key: "eni",
                  label: "Network interface",
                  sub: "10.0.1.20 + public IP",
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
      body: "Where your visitors are. Their browsers reach your server by its public IP address. By default a VPC is sealed off from here, so every piece below exists to open exactly one path in and back out.",
    },
    vpc: {
      title: "VPC (Virtual Private Cloud)",
      rel: "the outermost box · owns a CIDR range",
      body: "Your private slice of the cloud, from the Virtual Network concept. It owns one address range (10.0.0.0/16) and everything else lives inside it. On its own it has no way in or out.",
    },
    igw: {
      title: "Internet Gateway",
      rel: "attaches to the VPC (one per VPC)",
      body: "A two-way door between the VPC and the internet. It does nothing until a subnet's route table sends traffic to it. That route is what turns a subnet public.",
    },
    subnet: {
      title: "Public subnet",
      rel: "a box inside the VPC",
      body: "The slice of the range your server sits in. It is public because its route table points 0.0.0.0/0 at the Internet Gateway. The routing makes it public, not the IP numbers.",
    },
    ec2: {
      title: "EC2 instance",
      rel: "the virtual machine · runs nginx",
      body: "The server itself, from the Virtual Machines concept. It is a plain Linux box until a boot script installs nginx on it. Everything else here just decides who can reach it.",
    },
    eni: {
      title: "Network interface + public IP",
      rel: "attached to the instance · holds the addresses",
      body: "The instance's network card carries its private IP (10.0.1.20). To be reachable from the internet it also needs a public IPv4 address, assigned at launch or as an Elastic IP. No public IP, no front door.",
    },
    sg: {
      title: "Security group",
      rel: "rules attached to the network interface",
      body: "A stateful allow-list firewall on the card. A brand-new security group allows nothing inbound, so you open port 22 for SSH, port 80 for HTTP, and port 443 for HTTPS. Being stateful, replies leave automatically.",
    },
  },

  archHint:
    "Read it inside-out: the EC2 instance runs nginx, its network interface carries a public IP so the internet can find it, and the security group decides which ports are open. The VPC, subnet, and Internet Gateway are the network you already met, arranged so exactly one public path exists.",

  flow: {
    stages: [
      { id: "browser", label: "Browser", sub: "a visitor", tone: "resource" },
      {
        id: "igw",
        label: "Internet Gateway",
        sub: "public IP → in",
        tone: "public",
      },
      {
        id: "sg",
        label: "Security group",
        sub: "port 80 in?",
        tone: "firewall",
      },
      { id: "nginx", label: "nginx", sub: "on the EC2 instance", tone: "ok" },
    ],
    reach: {
      id: "publicIp",
      label: "Instance has a public IP",
      defaultOn: true,
      stage: 1,
      failTitle: "no public front door",
      failBody:
        "The request reaches the VPC edge, but the instance has no public IP address, so there is nothing on the internet to route to. Assign a public IPv4 address (auto-assign at launch or an Elastic IP). A private IP alone is not reachable from outside.",
    },
    firewall: {
      id: "allow80",
      label: "Security group allows port 80 in",
      defaultOn: true,
      stage: 2,
      failTitle: "stopped at the security group",
      failBody:
        "The request crossed the gateway but the security group has no inbound rule for port 80, so it is dropped before nginx ever sees it. A new security group allows nothing inbound until you add a rule. Open port 80.",
    },
    serverStage: 3,
    passTitle: "nginx answered · 200 OK",
    passBody:
      "Public IP gave the request a way in, the security group allowed port 80, and nginx returned the page. Because the security group is stateful, the response leaves on its own with no return rule to write.",
    callouts: [
      {
        kind: "fix",
        tag: "The two gates that matter",
        title:
          "Reachability is a public IP plus an open port. Both, or nothing.",
        body: "A public IPv4 address is the front door: without it the internet has no address to route to, no matter how the firewall is set. The security group is the lock: a new one allows nothing inbound, so port 80 must be opened explicitly. Miss either and the page never loads. This is the same routing-plus-firewall pair from the Virtual Network lesson, now serving a real request.",
      },
      {
        kind: "note",
        tag: "Ports you will open",
        title: "22 for SSH, 80 for HTTP, 443 for HTTPS.",
        body: "Port 22 lets you connect in to manage the box, port 80 serves plain HTTP, and port 443 serves HTTPS once you add a certificate. Open only what you need, and scope SSH to your own address rather than the whole internet.",
      },
    ],
  },

  steps: [
    {
      label: "Create a VPC with a public subnet",
      concept: "virtual-network",
      detail:
        "Give the network an address range (10.0.0.0/16), carve a subnet from it (10.0.1.0/24), attach an Internet Gateway, and add a route sending 0.0.0.0/0 to that gateway. The route is what makes the subnet public.",
      cli: "aws ec2 create-vpc · create-subnet · create-internet-gateway",
    },
    {
      label: "Create a security group with the right rules",
      concept: "virtual-network",
      detail:
        "A new security group allows nothing inbound. Add inbound rules for port 22 (SSH, ideally from your IP only), port 80 (HTTP), and port 443 (HTTPS). Outbound is open by default, which nginx needs to fetch packages.",
      cli: "aws ec2 authorize-security-group-ingress --port 80 --cidr 0.0.0.0/0",
    },
    {
      label: "Launch an EC2 instance in the subnet",
      concept: "virtual-machines",
      detail:
        "Pick an Amazon Linux image and a small instance type, place it in the public subnet, attach the security group, and assign a public IP. Add a key pair so you can SSH in later.",
      cli: "aws ec2 run-instances --associate-public-ip-address",
    },
    {
      label: "Install nginx with a user-data script",
      concept: "virtual-machines",
      detail:
        "Pass a boot script as user data so the instance installs and starts nginx the first time it boots. No manual SSH step, the box is a web server by the time it is running. Chapter 3 walks the script.",
      cli: "--user-data file://install-nginx.sh",
    },
    {
      label: "Replace the default page with your own",
      detail:
        "nginx serves whatever is in its web root. Drop your index.html into /usr/share/nginx/html to serve your own content instead of the default welcome page.",
    },
    {
      label: "Browse to the public IP",
      detail:
        "Open http://<public-ip> in a browser. If the page loads, every gate from Chapter 1 is open. If it hangs, the security group or public IP is usually the culprit.",
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
        note: "Install nginx from the Amazon Linux 2023 repositories. The -y answers yes so it runs unattended.",
      },
      {
        code: 'echo "<h1>Hello from EC2</h1>" > /usr/share/nginx/html/index.html',
        note: "Write a one-line page into the nginx web root, replacing the default welcome page.",
      },
      {
        code: "systemctl enable --now nginx",
        note: "Start nginx now and set it to start automatically on every future boot.",
      },
    ],
    page: {
      heading: "Hello from EC2",
      sub: "served by nginx on Amazon Linux",
    },
    callouts: [
      {
        kind: "note",
        tag: "Why user data",
        title: "The script runs once, automatically, with no one logged in.",
        body: "User data is handed to the instance at launch and executed by cloud-init on first boot as root. That is how a freshly launched box can already be serving a page by the time it finishes starting, with no manual SSH step. Re-running it later means relaunching or re-triggering cloud-init.",
      },
      {
        kind: "fix",
        tag: "If the page will not load",
        title: "A running nginx still needs an open door.",
        body: "Provisioning and reachability are separate. If nginx is installed and running but the page hangs, the request is being stopped before it arrives: check that the security group allows port 80 and that the instance has a public IP. That is Chapter 1, not this script.",
      },
    ],
  },

  quiz: [
    {
      q: "You launch an instance into a public subnet with nginx running, but the page will not load. Which is the most likely cause?",
      opts: [
        "nginx needs to be reinstalled",
        "The security group has no inbound rule for port 80",
        "The VPC is too small",
        "The instance is in the wrong Availability Zone",
      ],
      answer: 1,
      explain:
        "A new security group allows nothing inbound. If nginx is running but the page hangs, the request is almost always being dropped at the security group because port 80 was never opened.",
    },
    {
      q: "What makes the subnet your instance sits in a public subnet?",
      opts: [
        "It uses public-looking IP numbers",
        "The instance has a public IP",
        "Its route table sends 0.0.0.0/0 to an Internet Gateway",
        "It is larger than a private subnet",
      ],
      answer: 2,
      explain:
        "Public is about routing: a default route to the Internet Gateway. The instance also needs a public IP to be reached, but the subnet itself is public because of that route.",
    },
    {
      q: "Your instance is in a public subnet with port 80 open, but has no public IPv4 address. What happens to a browser request?",
      opts: [
        "It loads normally over the private IP",
        "There is no public address to route to, so it cannot arrive",
        "It loads, but slowly",
        "nginx returns a 403",
      ],
      answer: 1,
      explain:
        "A private IP is not routable from the internet. Without a public IPv4 address (auto-assigned or an Elastic IP) there is no front door, and the request has nowhere to land.",
    },
    {
      q: "Why can a user-data script install nginx without you ever logging in?",
      opts: [
        "It runs on your laptop and pushes files up",
        "cloud-init runs it as root on the instance's first boot",
        "AWS installs nginx on every instance by default",
        "It runs only after you SSH in",
      ],
      answer: 1,
      explain:
        "User data is executed by cloud-init on first boot, as root, with no interactive session. That is why a freshly launched instance can already be serving a page.",
    },
    {
      q: "A security group is…",
      opts: [
        "A stateless firewall on the subnet border",
        "A stateful allow-list attached to the network interface",
        "A box that contains the instance",
        "The same thing as a public IP",
      ],
      answer: 1,
      explain:
        "It is a stateful allow-list attached to the instance's network interface. Because it is stateful, allowing a request in automatically allows the reply out.",
    },
    {
      q: "Which ports does this web server build typically open inbound?",
      opts: [
        "Only port 80",
        "22 for SSH, 80 for HTTP, and 443 for HTTPS",
        "Every port, to be safe",
        "3389 for remote desktop",
      ],
      answer: 1,
      explain:
        "SSH (22) to manage the box, HTTP (80) to serve the page, and HTTPS (443) once you add a certificate. Open only what you need, and scope SSH to your own address.",
    },
  ],
};

/* =============================== Azure ================================= */

const AZURE: WebServerContent = {
  chapters: [
    {
      navLabel: "plan",
      kicker: "Chapter 0 · The plan",
      title: "The whole build on one screen",
      intro:
        "You are going to run one small web server and reach it from a browser. Tap any labelled piece to read what it is and how it relates to its neighbours. Notice which pieces you build once and which are rules you attach.",
    },
    {
      navLabel: "request",
      kicker: "Chapter 1 · The request path",
      title: "What a browser has to get through",
      intro:
        "A visitor's request has to cross a few gates before nginx can answer it. The clearest way to see what each gate does is to close it and watch the request stop. Toggle them, send a request, and read the verdict.",
    },
    {
      navLabel: "build",
      kicker: "Chapter 2 · The build order",
      title: "Six steps, in order",
      intro:
        "Here is the whole build as an ordered checklist. Each step depends on the ones above it, and each draws on a concept you have already met. Expand a step to see what it does and why.",
    },
    {
      navLabel: "provision",
      kicker: "Chapter 3 · Installing nginx",
      title: "The cloud-init that runs on first boot",
      intro:
        "Creating the VM gives you a bare Linux box. A cloud-init file runs once, automatically, the first time it boots, and turns that box into a web server. Step through it, then see what it serves.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 4 · Check yourself",
      title: "Six questions",
      intro:
        "Pick an answer to see whether it holds up. These are the exact spots people slip when they stand up their first server.",
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
      sub: "10.0.0.0/16",
      tone: "net",
      kind: "container",
      attached: [
        { key: "pip", label: "Public IP", tone: "public", kind: "resource" },
      ],
      children: [
        {
          key: "subnet",
          label: "Subnet",
          sub: "10.0.1.0/24",
          tone: "public",
          kind: "container",
          attached: [
            {
              key: "nsg",
              label: "Network security group",
              tone: "firewall",
              kind: "rule",
            },
          ],
          children: [
            {
              key: "vm",
              label: "Virtual machine",
              sub: "Ubuntu · nginx",
              tone: "resource",
              kind: "resource",
              children: [
                {
                  key: "nic",
                  label: "Network interface",
                  sub: "10.0.1.20 + public IP",
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
      body: "Where your visitors are. Their browsers reach your server by its public IP address. By default a VNet is sealed off from here, so every piece below exists to open exactly one path in and back out.",
    },
    vnet: {
      title: "Virtual Network (VNet)",
      rel: "the outermost box · owns an address space",
      body: "Your private network in Azure, from the Virtual Network concept. It owns an address space (10.0.0.0/16) and everything else lives inside it. On its own it has no path to the internet.",
    },
    pip: {
      title: "Public IP",
      rel: "a separate resource, attached to the NIC",
      body: "A distinct Azure resource. Attach a Standard public IP to the VM's network interface to give it a front door on the internet. Without one, the VM's private IP is not reachable from outside.",
    },
    subnet: {
      title: "Subnet",
      rel: "a box inside the VNet",
      body: "The slice of the address space the VM sits in. In Azure a subnet is reachable from the internet when a VM in it has a public IP and the NSG allows the traffic, not because of the IP numbers.",
    },
    nsg: {
      title: "Network security group (NSG)",
      rel: "rules associated with the subnet and/or NIC",
      body: "Azure's firewall. Its default rules allow traffic within the VNet and from the load balancer but deny everything else inbound, so you add allow rules for port 22 (SSH), port 80 (HTTP), and port 443 (HTTPS). Always stateful, so replies return automatically.",
    },
    vm: {
      title: "Virtual machine",
      rel: "the server · runs nginx",
      body: "The server itself, from the Virtual Machines concept. It is a plain Linux box until cloud-init installs nginx on it. Everything else here just decides who can reach it.",
    },
    nic: {
      title: "Network interface + public IP",
      rel: "attached to the VM · holds the addresses",
      body: "The VM's network card carries its private IP (10.0.1.20). The Public IP resource attaches here to make the VM reachable from the internet. No public IP, no front door.",
    },
  },

  archHint:
    "Read it inside-out: the VM runs nginx, its network interface carries a public IP so the internet can find it, and the NSG decides which ports are open. The VNet and subnet are the network you already met, arranged so exactly one public path exists.",

  flow: {
    stages: [
      { id: "browser", label: "Browser", sub: "a visitor", tone: "resource" },
      { id: "pip", label: "Public IP", sub: "front door → in", tone: "public" },
      { id: "nsg", label: "NSG", sub: "port 80 in?", tone: "firewall" },
      { id: "nginx", label: "nginx", sub: "on the VM", tone: "ok" },
    ],
    reach: {
      id: "publicIp",
      label: "VM has a public IP",
      defaultOn: true,
      stage: 1,
      failTitle: "no public front door",
      failBody:
        "The request reaches the VNet, but the VM has no Public IP resource attached, so there is nothing on the internet to route to. Attach a Standard public IP to the NIC. A private IP alone is not reachable from outside.",
    },
    firewall: {
      id: "allow80",
      label: "NSG allows port 80 in",
      defaultOn: true,
      stage: 2,
      failTitle: "stopped at the NSG",
      failBody:
        "The request reached the VM's front door, but the NSG's default rules deny inbound internet traffic and no rule allows port 80, so it is dropped before nginx sees it. Add an inbound allow rule for port 80.",
    },
    serverStage: 3,
    passTitle: "nginx answered · 200 OK",
    passBody:
      "The public IP gave the request a way in, the NSG allowed port 80, and nginx returned the page. Because the NSG is stateful, the response leaves on its own with no return rule to write.",
    callouts: [
      {
        kind: "fix",
        tag: "The two gates that matter",
        title:
          "Reachability is a public IP plus an open port. Both, or nothing.",
        body: "A Public IP resource on the NIC is the front door: without it the internet has no address to route to. The NSG is the lock: its defaults deny inbound internet traffic, so port 80 must be allowed explicitly. Miss either and the page never loads. This is the same routing-plus-firewall pair from the Virtual Network lesson, now serving a real request.",
      },
      {
        kind: "note",
        tag: "Ports you will open",
        title: "22 for SSH, 80 for HTTP, 443 for HTTPS.",
        body: "Port 22 lets you connect in to manage the box, port 80 serves plain HTTP, and port 443 serves HTTPS once you add a certificate. Open only what you need, and scope SSH to your own address rather than the whole internet.",
      },
    ],
  },

  steps: [
    {
      label: "Create a VNet with a subnet",
      concept: "virtual-network",
      detail:
        "Give the network an address space (10.0.0.0/16) and carve a subnet from it (10.0.1.0/24). The az vm create command can create these for you, or you can create them up front for more control.",
      cli: "az network vnet create --address-prefix 10.0.0.0/16 --subnet-prefix 10.0.1.0/24",
    },
    {
      label: "Create an NSG with the right rules",
      concept: "virtual-network",
      detail:
        "The NSG's default rules deny inbound internet traffic. Add allow rules for port 22 (SSH, ideally from your IP only), port 80 (HTTP), and port 443 (HTTPS). Outbound is allowed by default, which nginx needs to fetch packages.",
      cli: "az network nsg rule create --destination-port-range 80 --access allow",
    },
    {
      label: "Create the VM with a public IP",
      concept: "virtual-machines",
      detail:
        "Pick an Ubuntu image and a small size, place it in the subnet, and attach a Standard public IP so it is reachable. Generate SSH keys so you can connect in later.",
      cli: "az vm create --image Ubuntu2204 --public-ip-sku Standard --generate-ssh-keys",
    },
    {
      label: "Install nginx with cloud-init",
      concept: "virtual-machines",
      detail:
        "Pass a cloud-init file as custom data so the VM installs and starts nginx the first time it boots. No manual SSH step, the box is a web server by the time it is running. Chapter 3 walks the file.",
      cli: "--custom-data cloud-init.yaml",
    },
    {
      label: "Replace the default page with your own",
      detail:
        "nginx serves whatever is in its web root. Write your own index.html into /var/www/html to serve your content instead of the default welcome page. cloud-init can write it for you.",
    },
    {
      label: "Browse to the public IP",
      detail:
        "Open http://<public-ip> in a browser. If the page loads, every gate from Chapter 1 is open. If it hangs, the NSG or public IP is usually the culprit.",
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
        note: "Refresh the package lists and upgrade installed packages before installing anything new.",
      },
      {
        code: "packages:",
        note: "A list of packages to install. cloud-init picks the right package manager for the distro (apt on Ubuntu).",
      },
      {
        code: "  - nginx",
        note: "Install nginx. On Ubuntu this also starts and enables the service automatically.",
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
        code: "    content: <h1>Hello from Azure</h1>",
        note: "The one-line page nginx will serve.",
      },
    ],
    page: {
      heading: "Hello from Azure",
      sub: "served by nginx on Ubuntu",
    },
    callouts: [
      {
        kind: "note",
        tag: "Why cloud-init",
        title: "The file runs once, automatically, with no one logged in.",
        body: "cloud-init is handed to the VM as custom data at creation and executed on first boot, with no interactive session. It works the same way across distributions: you list packages and files rather than writing distro-specific install commands. That is how a freshly created VM can already be serving a page.",
      },
      {
        kind: "fix",
        tag: "If the page will not load",
        title: "A running nginx still needs an open door.",
        body: "Provisioning and reachability are separate. If nginx is installed and running but the page hangs, the request is being stopped before it arrives: check that the NSG allows port 80 and that the VM has a public IP. That is Chapter 1, not this file.",
      },
    ],
  },

  quiz: [
    {
      q: "You create a VM with nginx running, but the page will not load. Which is the most likely cause?",
      opts: [
        "nginx needs to be reinstalled",
        "The NSG has no inbound rule allowing port 80",
        "The VNet is too small",
        "The VM is the wrong size",
      ],
      answer: 1,
      explain:
        "An NSG's default rules deny inbound internet traffic. If nginx is running but the page hangs, the request is almost always being dropped at the NSG because port 80 was never allowed.",
    },
    {
      q: "What lets a browser reach your VM from the internet?",
      opts: [
        "Public-looking IP numbers on the subnet",
        "A Public IP resource on the NIC, plus an NSG rule allowing the traffic",
        "A larger subnet",
        "Nothing, Azure exposes VMs by default",
      ],
      answer: 1,
      explain:
        "Inbound reachability is a Public IP on the network interface (the front door) and an NSG rule permitting the traffic. The private IP alone is not routable from outside.",
    },
    {
      q: "Your VM is in a subnet with port 80 allowed, but has no Public IP attached. What happens to a browser request?",
      opts: [
        "It loads normally over the private IP",
        "There is no public address to route to, so it cannot arrive",
        "It loads, but slowly",
        "nginx returns a 403",
      ],
      answer: 1,
      explain:
        "A private IP is not routable from the internet. Without a Public IP resource on the NIC there is no front door, and the request has nowhere to land.",
    },
    {
      q: "Why can a cloud-init file install nginx without you ever logging in?",
      opts: [
        "It runs on your laptop and pushes files up",
        "cloud-init runs it on the VM's first boot, with no session",
        "Azure installs nginx on every VM by default",
        "It runs only after you SSH in",
      ],
      answer: 1,
      explain:
        "Custom data is executed by cloud-init on first boot, with no interactive session. That is why a freshly created VM can already be serving a page.",
    },
    {
      q: "An NSG is…",
      opts: [
        "A stateless firewall, like an AWS network ACL",
        "A stateful rule set you associate with a subnet and/or NIC",
        "A box that contains the VM",
        "The same thing as a public IP",
      ],
      answer: 1,
      explain:
        "It is a reusable, stateful rule set associated with a subnet, a NIC, or both. Because it is stateful, allowing a request in automatically allows the reply out.",
    },
    {
      q: "Which ports does this web server build typically open inbound?",
      opts: [
        "Only port 80",
        "22 for SSH, 80 for HTTP, and 443 for HTTPS",
        "Every port, to be safe",
        "3389 for remote desktop",
      ],
      answer: 1,
      explain:
        "SSH (22) to manage the box, HTTP (80) to serve the page, and HTTPS (443) once you add a certificate. Open only what you need, and scope SSH to your own address.",
    },
  ],
};

export const CONTENT: Record<Provider, WebServerContent> = {
  aws: AWS,
  azure: AZURE,
};
