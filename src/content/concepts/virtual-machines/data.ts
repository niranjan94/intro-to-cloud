import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the Virtual Machines lesson. The interactive
 * components under this folder are provider-agnostic and read everything they
 * render from here, so the AWS and Azure lessons stay bespoke (they genuinely
 * differ in the lifecycle, where Azure adds a deallocate step AWS has no
 * equivalent of) without duplicating the interaction machinery.
 *
 * Facts verified against AWS and Microsoft Learn documentation. Prose is kept
 * neutral and professional; no em dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* -------------------------- Chapter 0 · anatomy --------------------------- */

/** A clickable part of the machine, colored by its category tone. */
export interface AnatomyPart {
  key: string;
  label: string;
  sub: string;
  tone: Tone;
}

export interface AnatomyGroup {
  label: string;
  parts: AnatomyPart[];
}

export interface AnatomyHotspot {
  title: string;
  /** Plain-language relation, e.g. "the server itself". */
  rel: string;
  body: string;
}

export interface AnatomyContent {
  region: string;
  subnet: string;
  /** The central machine node (clickable, keyed "vm"). */
  vm: { label: string; sub: string };
  groups: AnatomyGroup[];
  hotspots: Record<string, AnatomyHotspot>;
  hint: string;
  /** The single-line create command shown under the map. */
  cli: string;
}

/* -------------------------- Chapter 1 · sizing ---------------------------- */

export interface SizeFamily {
  letter: string;
  meaning: string;
}

export interface SizeRow {
  id: string;
  /** The workload this shape suits, e.g. "Small / burstable". */
  workload: string;
  /** The provider's name for the shape, e.g. "t3.micro". */
  name: string;
  /** How to read that name, e.g. "T burstable · gen 3 · micro". */
  decode: string;
  vcpu: string;
  ram: string;
  use: string;
}

export interface SizingContent {
  /** The naming pattern, e.g. "[family][gen][options].[size]". */
  pattern: string;
  families: SizeFamily[];
  rows: SizeRow[];
  note: string;
}

/* ------------------------- Chapter 2 · lifecycle -------------------------- */

/**
 * A meter row in the lifecycle readout. `charge` is amber (money burning),
 * `free` and `kept` are green (safe), `lost` is red (data gone), `muted` is a
 * neutral not-applicable state.
 */
export type MeterKind = "charge" | "free" | "kept" | "lost" | "muted";

export interface Meter {
  label: string;
  value: string;
  kind: MeterKind;
}

export interface LifeState {
  id: string;
  label: string;
  tone: Tone;
  /** One-line state description shown in the track. */
  tagline: string;
  /** The full readout paragraph for this state. */
  detail: string;
  meters: Meter[];
  terminal?: boolean;
}

export interface LifeAction {
  from: string;
  to: string;
  label: string;
  intent?: "primary" | "danger";
}

export interface LifecycleContent {
  /** The state a freshly provisioned machine lands in first. */
  initial: string;
  /** Label for the reset-to-start button, e.g. "Provision". */
  resetLabel: string;
  states: LifeState[];
  actions: LifeAction[];
  callouts: CalloutData[];
}

/* --------------------------- Chapter 3 · cost ----------------------------- */

export interface PriceModel {
  id: string;
  label: string;
  /** Illustrative relative unit price, 1 = on-demand baseline. */
  rel: number;
  /** Headline discount, e.g. "up to 90% off". */
  save: string;
  /** Commitment summary, e.g. "no commitment". */
  commit: string;
  /** What it suits best. */
  best: string;
  blurb: string;
}

export interface PricingContent {
  models: PriceModel[];
  note: string;
}

/* ---------------------------- Chapter 4 · quiz ---------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/* ------------------------------ The bundle -------------------------------- */

export interface LessonContent {
  chapters: ChapterMeta[];
  anatomy: AnatomyContent;
  sizing: SizingContent;
  lifecycle: LifecycleContent;
  pricing: PricingContent;
  quiz: QuizQ[];
}

/* ================================ AWS ==================================== */

const AWS: LessonContent = {
  chapters: [
    {
      navLabel: "anatomy",
      kicker: "Chapter 1",
      title: "What you actually rent",
      intro:
        "An EC2 instance is never just a CPU. It boots from an image, gets a size, attaches disks, plugs into the network through a security group, and lets you in with a key. Tap each part to see what it is.",
    },
    {
      navLabel: "sizing",
      kicker: "Chapter 2",
      title: "Picking the shape",
      intro:
        "You do not choose a CPU and some RAM directly. You choose an instance type: a pre-baked combination of CPU, memory, and network. The name looks cryptic until you learn to read it.",
    },
    {
      navLabel: "lifecycle",
      kicker: "Chapter 3",
      title: "Running it, stopping it, throwing it away",
      intro:
        "A machine you rent by the second has states, and each state bills differently and keeps or drops different data. Drive the instance through its lifecycle and watch the meter and the disks.",
    },
    {
      navLabel: "cost",
      kicker: "Chapter 4",
      title: "How the meter runs",
      intro:
        "The same instance can cost wildly different amounts depending on how you commit to it. Four purchasing models trade flexibility for a lower price.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 5",
      title: "Check yourself",
      intro:
        "Five questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  anatomy: {
    region: "Region · us-east-1",
    subnet: "Subnet · private",
    vm: { label: "EC2 instance", sub: "i-0f3ac91b · t3.micro" },
    groups: [
      {
        label: "Boots from",
        parts: [
          {
            key: "image",
            label: "AMI",
            sub: "ami-0abc123",
            tone: "compute",
          },
        ],
      },
      {
        label: "Storage",
        parts: [
          {
            key: "osdisk",
            label: "EBS root volume",
            sub: "gp3 · 30 GiB",
            tone: "storage",
          },
          {
            key: "tempdisk",
            label: "Instance store",
            sub: "ephemeral · optional",
            tone: "storage",
          },
        ],
      },
      {
        label: "Network",
        parts: [
          {
            key: "nic",
            label: "Elastic network interface",
            sub: "eni-0a1b",
            tone: "network",
          },
          {
            key: "pubip",
            label: "Public IPv4",
            sub: "auto-assigned",
            tone: "network",
          },
          {
            key: "firewall",
            label: "Security group",
            sub: "sg-903004f8",
            tone: "security",
          },
        ],
      },
      {
        label: "Access",
        parts: [
          {
            key: "key",
            label: "Key pair",
            sub: "my-key (SSH)",
            tone: "identity",
          },
        ],
      },
    ],
    hotspots: {
      vm: {
        title: "The instance",
        rel: "the server itself",
        body: "One running virtual server, identified by an instance id like i-0f3ac91b. It lives inside a subnet of your VPC, in one Availability Zone of the Region. The instance type (t3.micro here) fixes its CPU, memory, and network shape.",
      },
      image: {
        title: "Amazon Machine Image (AMI)",
        rel: "the disk template it boots from",
        body: "A snapshot of an operating system plus any pre-installed software. Launching an instance copies the AMI onto the root volume and boots it. Swap the AMI and you swap what the machine boots as: Amazon Linux, Ubuntu, Windows, or your own baked image.",
      },
      osdisk: {
        title: "EBS root volume",
        rel: "the persistent disk",
        body: "An Elastic Block Store volume is network-attached block storage that survives stop and start. gp3 is the current general-purpose SSD tier. Because it is separate from the instance, it keeps billing even while the instance is stopped.",
      },
      tempdisk: {
        title: "Instance store",
        rel: "the throwaway disk",
        body: "Some instance types include local, physically-attached NVMe storage. It is fast and free, but ephemeral: its data is erased when the instance stops or terminates. Never keep anything you care about here.",
      },
      nic: {
        title: "Elastic network interface (ENI)",
        rel: "the network card",
        body: "The virtual NIC that connects the instance to its subnet. It carries the private IP, and optionally a public IP, and it is what a security group attaches to.",
      },
      pubip: {
        title: "Public IPv4 address",
        rel: "the address on the internet",
        body: "An optional public address so the instance can be reached from the internet. An auto-assigned public IP is released when you stop the instance and a different one is given on start. An Elastic IP stays fixed across stop and start.",
      },
      firewall: {
        title: "Security group",
        rel: "the firewall",
        body: "A stateful set of allow rules on inbound and outbound traffic, attached to the network interface. If a reply is allowed out because the request was allowed in, that is the stateful part: you only write the inbound rule.",
      },
      key: {
        title: "Key pair",
        rel: "how you log in",
        body: "An SSH key pair. AWS holds the public key and injects it into the instance at launch; you keep the private half. That is how you prove who you are when you connect. There is no default password.",
      },
    },
    hint: "Every box is clickable. Start with the instance in the middle, then follow what plugs into it.",
    cli: "aws ec2 run-instances --image-id ami-0abc123 --instance-type t3.micro --key-name my-key --security-group-ids sg-903004f8 --subnet-id subnet-6e7f829e --count 1",
  },
  sizing: {
    pattern: "[family][generation][options] . [size]",
    families: [
      { letter: "T", meaning: "Burstable general purpose" },
      { letter: "M", meaning: "Balanced general purpose" },
      { letter: "C", meaning: "Compute optimized" },
      { letter: "R / X", meaning: "Memory optimized" },
      { letter: "I / D", meaning: "Storage optimized" },
      { letter: "P / G", meaning: "GPU / accelerated" },
    ],
    rows: [
      {
        id: "small",
        workload: "Small / burstable",
        name: "t3.micro",
        decode: "T burstable · gen 3 · micro",
        vcpu: "2 vCPU",
        ram: "1 GiB",
        use: "Dev boxes, low-traffic sites, bastions.",
      },
      {
        id: "balanced",
        workload: "Balanced general purpose",
        name: "m7i.large",
        decode: "M general · gen 7 · Intel · large",
        vcpu: "2 vCPU",
        ram: "8 GiB",
        use: "Web and app servers with steady traffic.",
      },
      {
        id: "compute",
        workload: "Compute optimized",
        name: "c7i.xlarge",
        decode: "C compute · gen 7 · Intel · xlarge",
        vcpu: "4 vCPU",
        ram: "8 GiB",
        use: "Batch, encoding, CPU-bound APIs.",
      },
      {
        id: "memory",
        workload: "Memory optimized",
        name: "r7i.xlarge",
        decode: "R memory · gen 7 · Intel · xlarge",
        vcpu: "4 vCPU",
        ram: "32 GiB",
        use: "In-memory caches, large databases.",
      },
    ],
    note: "The size suffix (micro, large, xlarge, 2xlarge) roughly doubles vCPU and memory each step. Later generations (the number) are usually faster and cheaper per unit than earlier ones, so prefer the newest generation a Region offers.",
  },
  lifecycle: {
    initial: "running",
    resetLabel: "Provision",
    states: [
      {
        id: "running",
        label: "Running",
        tone: "running",
        tagline: "Powered on and billing.",
        detail:
          "The instance is on. You pay for compute per second (with a one-minute minimum after each start), plus the EBS volumes it uses.",
        meters: [
          { label: "Compute", value: "Billed per second", kind: "charge" },
          { label: "EBS storage", value: "Billed", kind: "charge" },
          { label: "Public IPv4", value: "Assigned", kind: "kept" },
          { label: "Instance store", value: "Present", kind: "kept" },
        ],
      },
      {
        id: "stopped",
        label: "Stopped",
        tone: "stopped",
        tagline: "Powered off, no compute charge.",
        detail:
          "Stopping releases the compute: you stop paying for the instance. But the EBS volumes stay and keep billing, so your data and configuration survive. Any instance-store data is wiped, and the auto-assigned public IP is released.",
        meters: [
          { label: "Compute", value: "Not billed", kind: "free" },
          { label: "EBS storage", value: "Still billed", kind: "charge" },
          {
            label: "Public IPv4",
            value: "Released, new one on start",
            kind: "lost",
          },
          { label: "Instance store", value: "Data erased", kind: "lost" },
        ],
      },
      {
        id: "terminated",
        label: "Terminated",
        tone: "terminated",
        tagline: "Gone. Nothing left to bill.",
        detail:
          "Terminating deletes the instance for good. By default its root EBS volume is deleted too, so unless you took a snapshot or kept the volume, the data is gone. You cannot start a terminated instance.",
        terminal: true,
        meters: [
          { label: "Compute", value: "Not billed", kind: "free" },
          {
            label: "EBS storage",
            value: "Root deleted by default",
            kind: "lost",
          },
          { label: "Public IPv4", value: "Released", kind: "lost" },
          { label: "Instance store", value: "Gone", kind: "lost" },
        ],
      },
    ],
    actions: [
      { from: "running", to: "stopped", label: "Stop" },
      { from: "stopped", to: "running", label: "Start", intent: "primary" },
      {
        from: "running",
        to: "terminated",
        label: "Terminate",
        intent: "danger",
      },
      {
        from: "stopped",
        to: "terminated",
        label: "Terminate",
        intent: "danger",
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A stopped instance is free.",
        body: "The compute stops billing, but the EBS volumes attached to it do not. A stopped instance with a 100 GiB volume still bills you for 100 GiB of storage every month. To pay nothing, terminate it (and delete or snapshot the volume).",
      },
      {
        kind: "fix",
        tag: "Keep the address",
        title: "Stop and start changes your public IP.",
        body: "An auto-assigned public IPv4 is handed back when you stop and a fresh one is assigned on start. If a DNS record or firewall rule points at it, that breaks. Allocate an Elastic IP to keep a stable address across restarts.",
      },
    ],
  },
  pricing: {
    models: [
      {
        id: "ondemand",
        label: "On-Demand",
        rel: 1,
        save: "baseline price",
        commit: "no commitment",
        best: "Spiky or short-lived workloads.",
        blurb:
          "Pay by the second with nothing to sign. The most flexible option and the highest unit price. The right default until a pattern is clear.",
      },
      {
        id: "savings",
        label: "Savings Plans",
        rel: 0.4,
        save: "up to 72% off",
        commit: "1 or 3 year spend",
        best: "Steady baseline compute.",
        blurb:
          "Commit to a dollars-per-hour spend for one or three years and everything under that rate is discounted. AWS now recommends Savings Plans over Reserved Instances for EC2.",
      },
      {
        id: "reserved",
        label: "Reserved Instances",
        rel: 0.35,
        save: "up to 72% off",
        commit: "1 or 3 year, fixed config",
        best: "Known, unchanging instances.",
        blurb:
          "Commit to a specific instance type in a Region for one or three years. Less flexible than Savings Plans, and can also reserve capacity in an Availability Zone.",
      },
      {
        id: "spot",
        label: "Spot Instances",
        rel: 0.12,
        save: "up to 90% off",
        commit: "can be reclaimed",
        best: "Fault-tolerant batch work.",
        blurb:
          "Bid on spare capacity for the deepest discount, but AWS can reclaim the instance with a two-minute warning. Perfect for batch jobs that can restart, wrong for a database.",
      },
    ],
    note: "Bars show illustrative relative unit price, not a quote. Real discounts depend on term, instance, and Region.",
  },
  quiz: [
    {
      q: "You stop an EC2 instance overnight to save money. What are you still paying for?",
      opts: [
        "Nothing, a stopped instance is free",
        "The attached EBS volumes",
        "The compute, at half rate",
        "Only the public IP",
      ],
      answer: 1,
      explain:
        "Stopping releases the compute charge, but the EBS volumes persist and keep billing. To pay nothing you must terminate and remove the volumes.",
    },
    {
      q: "Reading the instance type c7i.xlarge, what does the c tell you?",
      opts: [
        "It is a compute-optimized family",
        "It has c gigabytes of RAM",
        "It is the cheapest tier",
        "It runs containers",
      ],
      answer: 0,
      explain:
        "The first letter is the family. C means compute optimized; the 7 is the generation and xlarge is the size.",
    },
    {
      q: "An instance had an auto-assigned public IP. You stop it and start it again. The address:",
      opts: [
        "Stays exactly the same",
        "Is a new, different address",
        "Is deleted permanently",
        "Becomes a private address",
      ],
      answer: 1,
      explain:
        "An auto-assigned public IPv4 is released on stop and a new one is assigned on start. Use an Elastic IP if you need it to stay put.",
    },
    {
      q: "What is an AMI?",
      opts: [
        "The physical machine your instance runs on",
        "The billing account for the instance",
        "The disk image the instance boots from",
        "The firewall protecting the instance",
      ],
      answer: 2,
      explain:
        "An Amazon Machine Image is the template of OS plus software that gets copied onto the root volume and booted when you launch an instance.",
    },
    {
      q: "You run a fault-tolerant batch job that can restart if interrupted. Which purchasing model fits best?",
      opts: [
        "On-Demand",
        "A 3-year Reserved Instance",
        "Spot Instances",
        "None, batch jobs need dedicated hosts",
      ],
      answer: 2,
      explain:
        "Spot Instances give the deepest discount in exchange for possible reclamation with a two-minute warning, which a restartable batch job can tolerate.",
    },
  ],
};

/* =============================== Azure =================================== */

const AZURE: LessonContent = {
  chapters: [
    {
      navLabel: "anatomy",
      kicker: "Chapter 1",
      title: "What you actually rent",
      intro:
        "An Azure VM is never just a CPU. It boots from an image, gets a size, attaches managed disks, plugs into the network through a network security group, and lets you in with a key. Tap each part to see what it is.",
    },
    {
      navLabel: "sizing",
      kicker: "Chapter 2",
      title: "Picking the shape",
      intro:
        "You do not choose a CPU and some RAM directly. You choose a VM size: a pre-baked combination of CPU, memory, and network. The name looks cryptic until you learn to read it.",
    },
    {
      navLabel: "lifecycle",
      kicker: "Chapter 3",
      title: "Running it, stopping it, throwing it away",
      intro:
        "A machine you rent by the second has states, and each state bills differently and keeps or drops different data. Azure has one trap here worth learning carefully: stopping is not the same as deallocating.",
    },
    {
      navLabel: "cost",
      kicker: "Chapter 4",
      title: "How the meter runs",
      intro:
        "The same VM can cost wildly different amounts depending on how you commit to it. Four purchasing models trade flexibility for a lower price.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 5",
      title: "Check yourself",
      intro:
        "Five questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  anatomy: {
    region: "Region · eastus",
    subnet: "Subnet · private",
    vm: { label: "Virtual machine", sub: "web-01 · Standard_D2s_v5" },
    groups: [
      {
        label: "Boots from",
        parts: [
          {
            key: "image",
            label: "Image",
            sub: "Ubuntu2204",
            tone: "compute",
          },
        ],
      },
      {
        label: "Storage",
        parts: [
          {
            key: "osdisk",
            label: "OS managed disk",
            sub: "Premium SSD · 30 GiB",
            tone: "storage",
          },
          {
            key: "tempdisk",
            label: "Temp disk (D:)",
            sub: "ephemeral",
            tone: "storage",
          },
        ],
      },
      {
        label: "Network",
        parts: [
          {
            key: "nic",
            label: "Network interface",
            sub: "web-01-nic",
            tone: "network",
          },
          {
            key: "pubip",
            label: "Public IP",
            sub: "dynamic",
            tone: "network",
          },
          {
            key: "firewall",
            label: "Network security group",
            sub: "web-01-nsg",
            tone: "security",
          },
        ],
      },
      {
        label: "Access",
        parts: [
          { key: "key", label: "SSH key", sub: "azureuser", tone: "identity" },
        ],
      },
    ],
    hotspots: {
      vm: {
        title: "The virtual machine",
        rel: "the server itself",
        body: "One running virtual server. It lives inside a subnet of your Virtual Network, in one Availability Zone of the Region. The VM size (Standard_D2s_v5 here) fixes its CPU, memory, and network shape.",
      },
      image: {
        title: "Image",
        rel: "the disk template it boots from",
        body: "A snapshot of an operating system plus any pre-installed software. Marketplace images are named by alias (Ubuntu2204) or a full URN; your own images live in an Azure Compute Gallery. The image is copied onto the OS disk and booted.",
      },
      osdisk: {
        title: "OS managed disk",
        rel: "the persistent disk",
        body: "A managed disk is Azure-managed block storage that survives deallocation. Premium SSD is a common tier. Because it is separate from the compute, it keeps billing even while the VM is deallocated: that is where your data and configuration live.",
      },
      tempdisk: {
        title: "Temp disk (D:)",
        rel: "the throwaway disk",
        body: "Many sizes include a local temporary disk, surfaced as D: on Windows. It is fast but ephemeral: its data is lost on deallocate, redeploy, or host maintenance. Never keep anything you care about here.",
      },
      nic: {
        title: "Network interface",
        rel: "the network card",
        body: "The virtual NIC that connects the VM to its subnet. It carries the private IP, and optionally a public IP, and it is what a network security group attaches to.",
      },
      pubip: {
        title: "Public IP",
        rel: "the address on the internet",
        body: "An optional public address so the VM can be reached from the internet. A dynamic public IP is released when the VM is deallocated and may differ on restart. A static public IP stays fixed, and is billed even while the VM is stopped.",
      },
      firewall: {
        title: "Network security group (NSG)",
        rel: "the firewall",
        body: "A stateful set of allow and deny rules on inbound and outbound traffic. It can attach to the NIC or to the whole subnet. Stateful means an allowed request's reply is allowed back automatically.",
      },
      key: {
        title: "SSH key",
        rel: "how you log in",
        body: "For Linux VMs, Azure injects your public SSH key at create time (az vm create --generate-ssh-keys) and you keep the private half. Windows VMs use an admin username and password instead.",
      },
    },
    hint: "Every box is clickable. Start with the virtual machine in the middle, then follow what plugs into it.",
    cli: "az vm create -g intro-cloud -n web-01 --image Ubuntu2204 --size Standard_D2s_v5 --admin-username azureuser --generate-ssh-keys --location eastus",
  },
  sizing: {
    pattern: "Standard_ [family][#vCPUs][features] _ [version]",
    families: [
      { letter: "B", meaning: "Burstable, economical" },
      { letter: "D", meaning: "General purpose" },
      { letter: "F", meaning: "Compute optimized" },
      { letter: "E", meaning: "Memory optimized" },
      { letter: "L", meaning: "Storage optimized" },
      { letter: "N", meaning: "GPU / accelerated" },
    ],
    rows: [
      {
        id: "small",
        workload: "Small / burstable",
        name: "Standard_B2s",
        decode: "B burstable · 2 vCPU · s Premium-SSD capable",
        vcpu: "2 vCPU",
        ram: "4 GiB",
        use: "Dev boxes, low-traffic sites, bastions.",
      },
      {
        id: "balanced",
        workload: "Balanced general purpose",
        name: "Standard_D2s_v5",
        decode: "D general · 2 vCPU · s · version 5",
        vcpu: "2 vCPU",
        ram: "8 GiB",
        use: "Web and app servers with steady traffic.",
      },
      {
        id: "compute",
        workload: "Compute optimized",
        name: "Standard_F4s_v2",
        decode: "F compute · 4 vCPU · s · version 2",
        vcpu: "4 vCPU",
        ram: "8 GiB",
        use: "Batch, encoding, CPU-bound APIs.",
      },
      {
        id: "memory",
        workload: "Memory optimized",
        name: "Standard_E4s_v5",
        decode: "E memory · 4 vCPU · s · version 5",
        vcpu: "4 vCPU",
        ram: "32 GiB",
        use: "In-memory caches, large databases.",
      },
    ],
    note: "The digit is the vCPU count, so D4s_v5 has twice the cores of D2s_v5. The trailing s means the size can use Premium SSD; the version (v5) marks the hardware generation, and newer is usually faster and cheaper per unit.",
  },
  lifecycle: {
    initial: "running",
    resetLabel: "Create",
    states: [
      {
        id: "running",
        label: "Running",
        tone: "running",
        tagline: "Powered on and billing.",
        detail:
          "The VM is on. You pay for compute per second, plus the managed disks it uses. This is the normal working state.",
        meters: [
          { label: "Compute", value: "Billed per second", kind: "charge" },
          { label: "Managed disks", value: "Billed", kind: "charge" },
          { label: "Public IP", value: "Assigned", kind: "kept" },
          { label: "Temp disk", value: "Present", kind: "kept" },
        ],
      },
      {
        id: "stopped",
        label: "Stopped (allocated)",
        tone: "stopped",
        tagline: "Powered off, but still billing compute.",
        detail:
          "Shutting down from inside the OS, or az vm stop, powers the VM off but leaves it holding its lease on the hardware. You are still billed for compute. This is the trap: a shut-down VM is not a free VM. To stop the compute charge you must deallocate.",
        meters: [
          { label: "Compute", value: "Still billed", kind: "charge" },
          { label: "Managed disks", value: "Billed", kind: "charge" },
          { label: "Public IP", value: "Kept", kind: "kept" },
          { label: "Temp disk", value: "Kept", kind: "kept" },
        ],
      },
      {
        id: "deallocated",
        label: "Stopped (deallocated)",
        tone: "deallocated",
        tagline: "Hardware released, no compute charge.",
        detail:
          "Deallocating releases the underlying hardware, so compute billing stops. The managed disks stay and keep billing, so your data survives. The temp disk is wiped, and a dynamic public IP is released and may change on restart.",
        meters: [
          { label: "Compute", value: "Not billed", kind: "free" },
          { label: "Managed disks", value: "Still billed", kind: "charge" },
          {
            label: "Public IP",
            value: "Dynamic released, may change",
            kind: "lost",
          },
          { label: "Temp disk", value: "Data erased", kind: "lost" },
        ],
      },
      {
        id: "deleted",
        label: "Deleted",
        tone: "terminated",
        tagline: "Gone. Nothing left to bill.",
        detail:
          "Deleting removes the VM. Its disks and network interface are separate resources; unless you delete them too they can linger and keep billing. A deleted VM cannot be started.",
        terminal: true,
        meters: [
          { label: "Compute", value: "Not billed", kind: "free" },
          {
            label: "Managed disks",
            value: "Linger unless deleted",
            kind: "lost",
          },
          {
            label: "Public IP",
            value: "Released (static persists)",
            kind: "lost",
          },
          { label: "Temp disk", value: "Gone", kind: "lost" },
        ],
      },
    ],
    actions: [
      { from: "running", to: "stopped", label: "Stop (from OS)" },
      { from: "running", to: "deallocated", label: "Deallocate" },
      {
        from: "stopped",
        to: "deallocated",
        label: "Deallocate",
        intent: "primary",
      },
      { from: "stopped", to: "running", label: "Start", intent: "primary" },
      { from: "deallocated", to: "running", label: "Start", intent: "primary" },
      { from: "deallocated", to: "deleted", label: "Delete", intent: "danger" },
      { from: "stopped", to: "deleted", label: "Delete", intent: "danger" },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "The Azure trap",
        title: "Shutting the VM down stops the bill.",
        body: "Shutting down from inside the guest OS, or az vm stop, leaves the VM allocated: it still holds the hardware and still bills compute. Only Stopped (deallocated), from az vm deallocate or the portal Stop button, releases the hardware and stops the compute charge.",
      },
      {
        kind: "fix",
        tag: "How to stop paying",
        title: "Deallocate, do not just stop.",
        body: "Run az vm deallocate (the portal Stop button does this for you). Compute billing stops; the managed disks keep billing so your data is safe. A dynamic public IP is released, so assign a static IP if you need a stable address.",
      },
    ],
  },
  pricing: {
    models: [
      {
        id: "payg",
        label: "Pay-as-you-go",
        rel: 1,
        save: "baseline price",
        commit: "no commitment",
        best: "Spiky or short-lived workloads.",
        blurb:
          "Pay by the second, billed hourly, with nothing to sign. The most flexible option and the highest unit price. The right default until a pattern is clear.",
      },
      {
        id: "savings",
        label: "Savings plan",
        rel: 0.45,
        save: "up to 65% off",
        commit: "1 or 3 year spend",
        best: "Steady baseline across compute.",
        blurb:
          "Azure savings plan for compute: commit to a fixed hourly spend for one or three years across compute services. More flexible than reservations, with a smaller discount.",
      },
      {
        id: "reserved",
        label: "Reserved VM Instances",
        rel: 0.35,
        save: "up to 72% off",
        commit: "1 or 3 year, fixed config",
        best: "Known, unchanging VMs.",
        blurb:
          "Commit to a specific VM type in a Region for one or three years for the deepest committed-use discount. Less flexible than a savings plan.",
      },
      {
        id: "spot",
        label: "Spot VMs",
        rel: 0.15,
        save: "up to 90% off",
        commit: "can be evicted",
        best: "Fault-tolerant batch work.",
        blurb:
          "Use surplus capacity for the deepest discount, but Azure can evict the VM when it needs the capacity back. Great for restartable batch jobs; not available for B-series burstable sizes.",
      },
    ],
    note: "Bars show illustrative relative unit price, not a quote. Real discounts depend on term, size, and Region.",
  },
  quiz: [
    {
      q: "You shut your VM down from inside the operating system to save money. What happens to the bill?",
      opts: [
        "Compute billing stops immediately",
        "Compute is still billed, the VM is only stopped, not deallocated",
        "The whole VM is deleted",
        "You are charged double",
      ],
      answer: 1,
      explain:
        "An OS shutdown (or az vm stop) leaves the VM allocated and still billing compute. You must deallocate to release the hardware and stop the compute charge.",
    },
    {
      q: "Reading the size Standard_F4s_v2, what does the 4 tell you?",
      opts: [
        "It is generation 4",
        "It has 4 GiB of RAM",
        "It has 4 vCPUs",
        "It costs 4 cents per hour",
      ],
      answer: 2,
      explain:
        "In Azure size names the digit after the family letter is the vCPU count. F is compute optimized, 4 is four vCPUs, s means Premium-SSD capable, v2 is the version.",
    },
    {
      q: "Your VM is Stopped (deallocated). Which of these still costs you money?",
      opts: [
        "The compute",
        "The temp disk data",
        "The managed disks",
        "Nothing at all",
      ],
      answer: 2,
      explain:
        "Deallocating stops the compute charge, but the managed disks persist and keep billing so your data survives. The temp disk is wiped on deallocate.",
    },
    {
      q: "What is an image in Azure Virtual Machines?",
      opts: [
        "The physical host the VM runs on",
        "A screenshot of the running VM",
        "The disk template the VM boots from",
        "The network security group",
      ],
      answer: 2,
      explain:
        "An image is the OS-plus-software template copied onto the OS disk at create time. Marketplace images use an alias or URN; custom images live in an Azure Compute Gallery.",
    },
    {
      q: "You run a fault-tolerant batch job that can restart if interrupted. Which purchasing model fits best?",
      opts: [
        "Pay-as-you-go",
        "A 3-year reservation",
        "Spot VMs",
        "None, batch jobs need dedicated hosts",
      ],
      answer: 2,
      explain:
        "Spot VMs give the deepest discount in exchange for possible eviction when Azure needs the capacity, which a restartable batch job can tolerate.",
    },
  ],
};

/* ================================ Export ================================= */

export const CONTENT: Record<Provider, LessonContent> = {
  aws: AWS,
  azure: AZURE,
};
