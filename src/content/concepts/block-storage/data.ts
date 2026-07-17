import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the Block Storage lesson. The interactive
 * components under this folder are provider-agnostic and read everything they
 * render from here, so the AWS and Azure lessons stay bespoke without
 * duplicating the interaction machinery. The two providers genuinely diverge in
 * the placement boundary (an EBS volume is pinned to one Availability Zone; an
 * Azure disk is regional, and Premium SSD v2 and Ultra pin to a zone), the type
 * catalog (gp3, io2 Block Express, st1, sc1 versus Premium SSD v2, Ultra Disk,
 * Premium SSD, Standard SSD, Standard HDD), and the default persistence of a
 * disk when its machine is deleted.
 *
 * Facts verified against Amazon EBS documentation (docs.aws.amazon.com) and
 * Microsoft Learn (learn.microsoft.com). Relative bars are illustrative for
 * comparison, not price or benchmark quotes. Prose is neutral and professional;
 * no em dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* --------------------------- Chapter 0 · attach --------------------------- */

export interface AttachDisk {
  id: string;
  /** The role this disk plays, e.g. "Root volume" or "Data disk". */
  role: string;
  /** The disk resource name shown in the box. */
  name: string;
  /** Small detail line, e.g. "gp3 · 30 GiB". */
  sub: string;
  isRoot: boolean;
  /** Whether it is deleted with the machine by default (root usually is). */
  deletesWithMachineDefault: boolean;
  /** Whether the learner can flip its delete-with-machine setting. */
  toggleable: boolean;
}

export interface AttachStateMeta {
  id: "running" | "stopped" | "terminated";
  label: string;
  /** What the machine is doing in this state. */
  machineNote: string;
}

export interface AttachContent {
  /** The placement boundary label, e.g. "Availability Zone · us-east-1a". */
  boundaryLabel: string;
  boundaryNote: string;
  machineTerm: string;
  machineName: string;
  diskTerm: string;
  states: AttachStateMeta[];
  disks: AttachDisk[];
  /** Verb for the terminate/delete action shown on the control. */
  terminateVerb: string;
  /** Label for the delete-with-machine toggle on the data disk. */
  deleteToggleLabel: string;
  /** Explanation when a preserved disk survives termination. */
  persistExplain: string;
  /** Explanation when a disk is deleted with the machine. */
  deleteExplain: string;
  hint: string;
  /** The attach command for this provider. */
  cli: string;
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 1 · types --------------------------- */

export interface TypeFact {
  label: string;
  value: string;
}

export interface VolumeType {
  id: string;
  /** The provider name for the type, e.g. "gp3" or "Premium SSD v2". */
  name: string;
  /** The family it belongs to, e.g. "General Purpose SSD". */
  family: string;
  tone: Tone;
  tagline: string;
  /** Illustrative relative peak performance, 1 = the fastest type. */
  perfRel: number;
  facts: TypeFact[];
  use: string;
}

export interface TypesContent {
  /** What the provider calls this setting, e.g. "Volume type". */
  label: string;
  types: VolumeType[];
  note: string;
  callouts: CalloutData[];
}

/* ------------------------- Chapter 2 · performance ------------------------ */

export interface PerfContent {
  /** The type whose provisioning model is shown, e.g. "gp3". */
  typeName: string;
  sizeUnit: string;
  iopsUnit: string;
  throughputUnit: string;
  /** Slider range for size, in sizeUnit. Demo range, not the real ceiling. */
  sizeMin: number;
  sizeMax: number;
  sizeStep: number;
  sizeDefault: number;
  /** Free baseline included with storage. */
  baselineIops: number;
  baselineThroughput: number;
  /** The absolute ceilings for this type. */
  maxIops: number;
  maxThroughput: number;
  iopsStep: number;
  throughputStep: number;
  /** Additional IOPS available per unit of size. */
  iopsPerSize: number;
  /** Additional throughput available per provisioned IOPS. */
  throughputPerIops: number;
  /** Size needed to unlock max IOPS (maxIops / iopsPerSize). */
  sizeForMaxIops: number;
  /** IOPS needed to unlock max throughput. */
  iopsForMaxThroughput: number;
  /** The real maximum size, stated in copy (the slider stops earlier). */
  realMaxSizeLabel: string;
  intro: string;
  /** Contrast with a size-coupled type on the same provider. */
  coupledNote: string;
  /** A representative create command with a valid configuration. */
  cli: string;
  callouts: CalloutData[];
}

/* -------------------------- Chapter 3 · snapshots ------------------------- */

export interface SnapshotStep {
  /** A point on the timeline, e.g. "Day 0". */
  day: string;
  /** What happens, e.g. "First snapshot". */
  action: string;
  /** A short chip, e.g. "Volume" or "Snapshot". */
  chip: string;
  tone: Tone;
  /** Illustrative cumulative backup footprint, 0 to 1. */
  storedRel: number;
  note: string;
}

export interface SnapshotContent {
  policyLabel: string;
  ruleSummary: string;
  storedLabel: string;
  steps: SnapshotStep[];
  callouts: CalloutData[];
}

/* -------------------------- Chapter 4 · decision -------------------------- */

/** The dimension a workload signal pushes on, which drives its color and glyph. */
export type SignalWeight = "iops" | "throughput" | "latency" | "cost" | "boot";

export interface PickSignal {
  label: string;
  value: string;
  weight: SignalWeight;
}

export interface PickScenario {
  id: string;
  label: string;
  workload: string;
  signals: PickSignal[];
  /** The recommended type name. */
  pick: string;
  pickTone: Tone;
  why: string;
}

export interface PickerContent {
  rule: string;
  scenarios: PickScenario[];
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
  attach: AttachContent;
  types: TypesContent;
  perf: PerfContent;
  snapshots: SnapshotContent;
  picker: PickerContent;
  quiz: QuizQ[];
}

/* ================================ AWS ==================================== */

const AWS: LessonContent = {
  chapters: [
    {
      navLabel: "attach",
      kicker: "Chapter 1",
      title: "A disk you attach to one machine",
      intro:
        "An Amazon EBS volume is a raw disk that exists on its own. You attach it to an EC2 instance in the same Availability Zone, and it behaves like a local drive. The volume outlives the instance unless you tell it otherwise. Move the instance through its lifecycle and watch what the disks do.",
    },
    {
      navLabel: "types",
      kicker: "Chapter 2",
      title: "SSD for IOPS, HDD for throughput",
      intro:
        "EBS offers several volume types split into two families: SSD-backed volumes tuned for small random reads and writes where IOPS dominate, and HDD-backed volumes tuned for large sequential streams where throughput dominates. Walk the ladder and read the tradeoff.",
    },
    {
      navLabel: "performance",
      kicker: "Chapter 3",
      title: "Sizing performance apart from capacity",
      intro:
        "The gp3 volume decouples performance from size: a small disk can carry high IOPS. But the two dials are still linked to each other. Provision a volume and see which constraint binds when you push IOPS and throughput.",
    },
    {
      navLabel: "snapshots",
      kicker: "Chapter 4",
      title: "Backups that live on their own",
      intro:
        "An EBS snapshot is a point-in-time backup stored in Amazon S3, independent of the volume. Snapshots are incremental: each one saves only the blocks that changed since the last. Step through a snapshot chain and watch the stored data.",
    },
    {
      navLabel: "decision",
      kicker: "Chapter 5",
      title: "Which volume for the job",
      intro:
        "Type choice follows the workload. Read the signals a workload sends, latency, IOPS, throughput, cost, or whether it boots the machine, and see which volume type fits.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Six questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  attach: {
    boundaryLabel: "Availability Zone · us-east-1a",
    boundaryNote:
      "An EBS volume lives in one Availability Zone. It can attach only to instances in that same zone.",
    machineTerm: "EC2 instance",
    machineName: "web-01",
    diskTerm: "EBS volume",
    states: [
      {
        id: "running",
        label: "Running",
        machineNote: "The instance is on and both volumes are readable.",
      },
      {
        id: "stopped",
        label: "Stopped",
        machineNote:
          "The instance is off but still exists. EBS volumes stay attached and keep their data.",
      },
      {
        id: "terminated",
        label: "Terminated",
        machineNote:
          "The instance is gone for good. Each volume is kept or deleted by its own DeleteOnTermination setting.",
      },
    ],
    disks: [
      {
        id: "root",
        role: "Root volume",
        name: "/dev/xvda",
        sub: "gp3 · 30 GiB",
        isRoot: true,
        deletesWithMachineDefault: true,
        toggleable: false,
      },
      {
        id: "data",
        role: "Data volume",
        name: "/dev/sdf",
        sub: "gp3 · 200 GiB",
        isRoot: false,
        deletesWithMachineDefault: false,
        toggleable: true,
      },
    ],
    terminateVerb: "Terminate",
    deleteToggleLabel: "Delete data volume on termination",
    persistExplain:
      "Preserved. The volume survives in the available state, ready to attach to another instance or to snapshot. It keeps billing until you delete it.",
    deleteExplain:
      "Deleted. The volume and its data are removed with the instance and cannot be recovered.",
    hint: "Terminate the instance, then flip the data volume toggle to see how DeleteOnTermination decides its fate.",
    cli: "aws ec2 attach-volume --volume-id vol-0abc123 --instance-id i-0def456 --device /dev/sdf",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Terminating an instance always destroys its disks.",
        body: "Only if DeleteOnTermination is true for that volume. A root volume attached at launch defaults to delete, but a data volume attached after launch defaults to preserve. The volume is a separate resource with its own lifecycle.",
      },
      {
        kind: "note",
        tag: "Placement",
        title: "Same Availability Zone, always.",
        body: "You cannot attach a volume in us-east-1a to an instance in us-east-1b. To move data across zones you take a snapshot, which is replicated across all zones in the Region, and restore a new volume in the target zone.",
      },
    ],
  },
  types: {
    label: "Volume type",
    types: [
      {
        id: "gp3",
        name: "gp3",
        family: "General Purpose SSD",
        tone: "ssd",
        tagline: "Balanced price and performance. The default choice.",
        perfRel: 0.55,
        facts: [
          { label: "Max IOPS", value: "80,000" },
          { label: "Max throughput", value: "2,000 MiB/s" },
          { label: "Size", value: "1 GiB - 64 TiB" },
          { label: "Boot volume", value: "Yes" },
        ],
        use: "Boot volumes, most databases, dev and test, latency-sensitive apps.",
      },
      {
        id: "io2",
        name: "io2 Block Express",
        family: "Provisioned IOPS SSD",
        tone: "top",
        tagline: "Highest IOPS and durability, sub-millisecond latency.",
        perfRel: 1,
        facts: [
          { label: "Max IOPS", value: "256,000" },
          { label: "Max throughput", value: "4,000 MiB/s" },
          { label: "Durability", value: "99.999%" },
          { label: "Multi-Attach", value: "Up to 16 instances" },
        ],
        use: "Critical, IOPS-heavy databases: Oracle, SAP HANA, SQL Server, SAS.",
      },
      {
        id: "gp2",
        name: "gp2",
        family: "General Purpose SSD (previous gen)",
        tone: "ssd",
        tagline: "Older general purpose SSD. Performance scales with size.",
        perfRel: 0.4,
        facts: [
          { label: "Max IOPS", value: "16,000" },
          { label: "Max throughput", value: "250 MiB/s" },
          { label: "IOPS rule", value: "3 IOPS per GiB" },
          { label: "Boot volume", value: "Yes" },
        ],
        use: "Existing workloads not yet migrated to gp3, which is cheaper.",
      },
      {
        id: "st1",
        name: "st1",
        family: "Throughput Optimized HDD",
        tone: "hdd",
        tagline: "Cheap sequential throughput, not for random IOPS.",
        perfRel: 0.3,
        facts: [
          { label: "Max IOPS", value: "500" },
          { label: "Max throughput", value: "500 MiB/s" },
          { label: "Size", value: "125 GiB - 16 TiB" },
          { label: "Boot volume", value: "No" },
        ],
        use: "Big data, log processing, data warehouses, streaming reads.",
      },
      {
        id: "sc1",
        name: "sc1",
        family: "Cold HDD",
        tone: "hdd",
        tagline: "Lowest cost HDD for data you rarely touch.",
        perfRel: 0.15,
        facts: [
          { label: "Max IOPS", value: "250" },
          { label: "Max throughput", value: "250 MiB/s" },
          { label: "Size", value: "125 GiB - 16 TiB" },
          { label: "Boot volume", value: "No" },
        ],
        use: "Cold data scanned occasionally where the lowest storage price wins.",
      },
    ],
    note: "IOPS is operations per second, the currency of small random access. Throughput is MiB/s, the currency of large sequential streams. SSD types optimize the first, HDD types the second.",
    callouts: [
      {
        kind: "fix",
        tag: "Rule of thumb",
        title: "Boot from SSD, stream from HDD.",
        body: "HDD volumes (st1, sc1) cannot be boot volumes and deliver only hundreds of IOPS, so random access crawls. They shine only on large sequential reads. For anything a machine boots from or that does random I/O, use an SSD type.",
      },
    ],
  },
  perf: {
    typeName: "gp3",
    sizeUnit: "GiB",
    iopsUnit: "IOPS",
    throughputUnit: "MiB/s",
    sizeMin: 1,
    sizeMax: 256,
    sizeStep: 1,
    sizeDefault: 100,
    baselineIops: 3000,
    baselineThroughput: 125,
    maxIops: 80000,
    maxThroughput: 2000,
    iopsStep: 500,
    throughputStep: 25,
    iopsPerSize: 500,
    throughputPerIops: 0.25,
    sizeForMaxIops: 160,
    iopsForMaxThroughput: 8000,
    realMaxSizeLabel: "64 TiB",
    intro:
      "gp3 includes a free baseline of 3,000 IOPS and 125 MiB/s at any size. You can provision more, but the dials constrain each other: extra IOPS need enough size, and extra throughput needs enough IOPS.",
    coupledNote:
      "The older gp2 type could not do this: its performance was locked to size at 3 IOPS per GiB, so the only way to go faster was to buy a bigger disk. gp3 broke that link.",
    cli: "aws ec2 create-volume --volume-type gp3 --size 200 --iops 10000 --throughput 400 --availability-zone us-east-1a",
    callouts: [
      {
        kind: "note",
        tag: "Why the ceilings move",
        title: "160 GiB unlocks max IOPS; 8,000 IOPS unlocks max throughput.",
        body: "gp3 adds up to 500 IOPS per GiB, so 80,000 IOPS needs at least 160 GiB. Throughput scales at 0.25 MiB/s per provisioned IOPS, so the 2,000 MiB/s ceiling needs at least 8,000 IOPS. Push one slider and the other slider's ceiling follows.",
      },
      {
        kind: "fix",
        tag: "No downtime",
        title: "Elastic Volumes change all three live.",
        body: "You can grow size and tune IOPS and throughput on a live volume with an Elastic Volumes modify operation, no detach and no instance stop. There is a cooldown of at least six hours before the next change to the same volume.",
      },
    ],
  },
  snapshots: {
    policyLabel: "Snapshot chain",
    ruleSummary:
      "Snapshots are incremental point-in-time backups stored in Amazon S3, separate from the volume. The first captures every used block; each later one saves only what changed.",
    storedLabel: "Cumulative snapshot storage",
    steps: [
      {
        day: "Day 0",
        action: "Create a 200 GiB volume",
        chip: "Volume",
        tone: "disk",
        storedRel: 0,
        note: "The volume holds live data in one Availability Zone. Nothing is backed up yet: AWS does not snapshot for you.",
      },
      {
        day: "Day 1",
        action: "First snapshot",
        chip: "Snapshot",
        tone: "snapshot",
        storedRel: 0.5,
        note: "This snapshot copies every used block to S3. It is a full baseline of the data at this instant, replicated across all zones in the Region.",
      },
      {
        day: "Day 8",
        action: "Incremental snapshot",
        chip: "Snapshot",
        tone: "snapshot",
        storedRel: 0.62,
        note: "Only the blocks changed since Day 1 are stored. The snapshot still restores a complete volume, because it references the unchanged blocks from earlier snapshots.",
      },
      {
        day: "Day 30",
        action: "Restore into another zone",
        chip: "New volume",
        tone: "disk",
        storedRel: 0.62,
        note: "You create a fresh volume from any snapshot in a different Availability Zone. This is how you move or copy a volume across zones, since a volume itself cannot cross one.",
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Deleting a snapshot always frees its full size.",
        body: "Because snapshots share unchanged blocks, deleting one only frees the blocks no other snapshot still references. The data a later snapshot depends on is kept. Automate creation and expiry with Amazon Data Lifecycle Manager.",
      },
    ],
  },
  picker: {
    rule: "Match the type to the dominant signal. Latency and random IOPS point to Provisioned IOPS SSD, sequential throughput to HDD, and a balance of cost and capability to General Purpose SSD.",
    scenarios: [
      {
        id: "oltp",
        label: "Transactional database",
        workload:
          "A busy relational database doing many small random reads and writes.",
        signals: [
          {
            label: "Latency",
            value: "Sub-millisecond, consistent",
            weight: "latency",
          },
          { label: "Access", value: "High random IOPS", weight: "iops" },
          {
            label: "Boots the machine",
            value: "No, a data volume",
            weight: "boot",
          },
        ],
        pick: "io2 Block Express",
        pickTone: "top",
        why: "Only Provisioned IOPS SSD sustains very high random IOPS at consistent sub-millisecond latency, with 99.999% durability for critical data.",
      },
      {
        id: "web",
        label: "General web server",
        workload:
          "A boot volume plus moderate application I/O on a standard instance.",
        signals: [
          { label: "Access", value: "Moderate mixed I/O", weight: "iops" },
          { label: "Boots the machine", value: "Yes", weight: "boot" },
          { label: "Priority", value: "Low cost, no tuning", weight: "cost" },
        ],
        pick: "gp3",
        pickTone: "ssd",
        why: "General Purpose SSD boots instances and covers most application I/O with its free 3,000 IOPS baseline, at the lowest SSD price.",
      },
      {
        id: "analytics",
        label: "Log and big-data processing",
        workload: "Batch jobs scanning large files end to end.",
        signals: [
          {
            label: "Access",
            value: "Large sequential reads",
            weight: "throughput",
          },
          { label: "IOPS", value: "Not the bottleneck", weight: "iops" },
          { label: "Priority", value: "Throughput per dollar", weight: "cost" },
        ],
        pick: "st1",
        pickTone: "hdd",
        why: "Throughput Optimized HDD delivers up to 500 MiB/s of streaming reads far more cheaply than SSD, and the low IOPS ceiling does not hurt sequential work.",
      },
      {
        id: "cold",
        label: "Cold archive volume",
        workload: "Data kept on a volume but scanned only occasionally.",
        signals: [
          { label: "Access", value: "Infrequent", weight: "cost" },
          { label: "Priority", value: "Lowest storage price", weight: "cost" },
          { label: "Boots the machine", value: "No", weight: "boot" },
        ],
        pick: "sc1",
        pickTone: "hdd",
        why: "Cold HDD is the cheapest EBS volume per GiB. When data is rarely read, its low performance ceiling is an acceptable trade for the price.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "Cost angle",
        title: "Right-sizing beats over-provisioning.",
        body: "Because gp3 lets you dial IOPS and throughput without buying capacity, many workloads that once needed Provisioned IOPS SSD now run on gp3 for less. Reach for io2 Block Express when you truly need its latency or IOPS ceiling.",
      },
    ],
  },
  quiz: [
    {
      q: "You have an EBS volume in us-east-1a and an instance in us-east-1b. How do you attach the volume?",
      opts: [
        "Attach it directly; zones do not matter",
        "You cannot: snapshot it and restore a new volume in us-east-1b",
        "Move the instance to us-east-1a automatically",
        "Enable Multi-Attach across zones",
      ],
      answer: 1,
      explain:
        "A volume attaches only to instances in its own Availability Zone. To cross a zone you snapshot the volume, which is replicated across the Region, and restore a new volume in the target zone.",
    },
    {
      q: "A data volume was attached after launch with default settings. You terminate the instance. What happens to the volume?",
      opts: [
        "It is deleted with the instance",
        "It is preserved and keeps its data",
        "It is converted to a snapshot",
        "It moves to another instance automatically",
      ],
      answer: 1,
      explain:
        "DeleteOnTermination defaults to preserve for a data volume attached after launch. A root volume attached at launch defaults to delete. The volume is a separate resource with its own lifecycle.",
    },
    {
      q: "On a gp3 volume, what do you need to reach the maximum 2,000 MiB/s of throughput?",
      opts: [
        "A volume of at least 16 TiB",
        "At least 8,000 provisioned IOPS",
        "Nothing: it is included in the baseline",
        "The io2 Block Express type",
      ],
      answer: 1,
      explain:
        "gp3 throughput scales at 0.25 MiB/s per provisioned IOPS, so 2,000 MiB/s requires at least 8,000 IOPS. IOPS in turn needs enough size: 80,000 IOPS requires at least 160 GiB.",
    },
    {
      q: "Your batch job streams large files sequentially and IOPS is not the bottleneck. Which type fits best?",
      opts: [
        "io2 Block Express",
        "gp3",
        "st1 (Throughput Optimized HDD)",
        "A root volume",
      ],
      answer: 2,
      explain:
        "st1 delivers high sequential throughput cheaply. Its low IOPS ceiling does not matter for sequential scans, and it costs far less than SSD for this pattern.",
    },
    {
      q: "You take a first snapshot, then a second one a week later. What does the second snapshot store?",
      opts: [
        "A full copy of the whole volume again",
        "Only the blocks that changed since the first snapshot",
        "Nothing until the first snapshot is deleted",
        "A copy on the instance's local disk",
      ],
      answer: 1,
      explain:
        "EBS snapshots are incremental: each one saves only the blocks changed since the previous snapshot, while still referencing the unchanged blocks so it can restore a complete volume.",
    },
    {
      q: "Which statement about gp3 and gp2 performance is correct?",
      opts: [
        "gp2 lets you set IOPS independently of size; gp3 ties them together",
        "gp3 lets you set IOPS independently of size; gp2 ties IOPS to size",
        "Both tie performance strictly to size",
        "Neither lets you change performance after creation",
      ],
      answer: 1,
      explain:
        "gp3 decouples performance from capacity: a small volume can carry high IOPS. gp2 scaled IOPS with size at 3 IOPS per GiB, so faster meant bigger.",
    },
  ],
};

/* =============================== AZURE =================================== */

const AZURE: LessonContent = {
  chapters: [
    {
      navLabel: "attach",
      kicker: "Chapter 1",
      title: "A disk you attach to one machine",
      intro:
        "An Azure managed disk is a raw block volume Azure manages for you. You attach it to a virtual machine as its OS disk or as a data disk, and it behaves like a local drive. The disk is its own resource and outlives the VM unless you ask for it to be deleted. Move the VM through its lifecycle and watch the disks.",
    },
    {
      navLabel: "types",
      kicker: "Chapter 2",
      title: "SSD for IOPS, HDD for throughput",
      intro:
        "Azure offers five managed disk types, from Standard HDD for cold data up to Ultra Disk for the most demanding databases. SSD types are tuned for IOPS and latency, HDD for cheap sequential throughput. Walk the ladder and read the tradeoff.",
    },
    {
      navLabel: "performance",
      kicker: "Chapter 3",
      title: "Sizing performance apart from capacity",
      intro:
        "Premium SSD v2 decouples performance from size: a small disk can carry high IOPS. But the dials still constrain each other. Provision a disk and see which limit binds as you push IOPS and throughput.",
    },
    {
      navLabel: "snapshots",
      kicker: "Chapter 4",
      title: "Backups that live on their own",
      intro:
        "A managed disk snapshot is a read-only copy of a disk, stored independently as its own managed disk. Incremental snapshots save only what changed since the last one. Step through a snapshot chain and watch the stored data.",
    },
    {
      navLabel: "decision",
      kicker: "Chapter 5",
      title: "Which disk for the job",
      intro:
        "Type choice follows the workload. Read the signals a workload sends, latency, IOPS, throughput, cost, or whether it boots the machine, and see which disk type fits.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Six questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  attach: {
    boundaryLabel: "Region · East US (zone 1)",
    boundaryNote:
      "A managed disk is a regional resource. Premium SSD v2 and Ultra disks are pinned to one availability zone and attach only to a VM in that same zone.",
    machineTerm: "Virtual machine",
    machineName: "web-01",
    diskTerm: "Managed disk",
    states: [
      {
        id: "running",
        label: "Running",
        machineNote: "The VM is on and both disks are readable.",
      },
      {
        id: "stopped",
        label: "Stopped (deallocated)",
        machineNote:
          "The VM is deallocated but still exists. Managed disks stay attached and keep their data.",
      },
      {
        id: "terminated",
        label: "Deleted",
        machineNote:
          "The VM is deleted. Each disk is kept or deleted by its own delete-with-VM setting.",
      },
    ],
    disks: [
      {
        id: "os",
        role: "OS disk",
        name: "web-01_osdisk",
        sub: "Premium SSD · 30 GiB",
        isRoot: true,
        deletesWithMachineDefault: true,
        toggleable: false,
      },
      {
        id: "data",
        role: "Data disk",
        name: "web-01_data_01",
        sub: "Premium SSD v2 · 200 GiB",
        isRoot: false,
        deletesWithMachineDefault: false,
        toggleable: true,
      },
    ],
    terminateVerb: "Delete VM",
    deleteToggleLabel: "Delete data disk with the VM",
    persistExplain:
      "Preserved. The disk survives as an unattached managed disk, ready to attach to another VM or to snapshot. It keeps billing until you delete it.",
    deleteExplain:
      "Deleted. The disk and its data are removed with the VM and cannot be recovered.",
    hint: "Delete the VM, then flip the data disk toggle to see how its delete-with-VM setting decides its fate.",
    cli: "az vm disk attach --resource-group rg-app --vm-name web-01 --name web-01_data_01",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Deleting a VM always destroys its disks.",
        body: "Only for disks whose delete option is set to delete. Each OS and data disk has its own setting; a VM created through the portal defaults its OS disk to delete but leaves data disks attached as independent resources.",
      },
      {
        kind: "note",
        tag: "Placement",
        title: "Regional by default, zonal for the fastest disks.",
        body: "Standard and Premium SSD disks are regional and attach to a VM in the region. Premium SSD v2 and Ultra disks are zonal: create the VM in a zone first, then attach a disk in that same zone.",
      },
    ],
  },
  types: {
    label: "Disk type",
    types: [
      {
        id: "premiumv2",
        name: "Premium SSD v2",
        family: "SSD",
        tone: "ssd",
        tagline:
          "Best price for performance. Tune size, IOPS, throughput on their own.",
        perfRel: 0.6,
        facts: [
          { label: "Max IOPS", value: "80,000" },
          { label: "Max throughput", value: "2,000 MB/s" },
          { label: "Size", value: "1 GiB - 64 TiB" },
          { label: "OS disk", value: "No, data only" },
        ],
        use: "Most production workloads: SQL, Oracle, SAP, Cassandra, MongoDB, analytics.",
      },
      {
        id: "ultra",
        name: "Ultra Disk",
        family: "SSD",
        tone: "top",
        tagline: "Highest limits, sub-millisecond latency, tune live.",
        perfRel: 1,
        facts: [
          { label: "Max IOPS", value: "400,000" },
          { label: "Max throughput", value: "10,000 MB/s" },
          { label: "Size", value: "4 GiB - 64 TiB" },
          { label: "OS disk", value: "No, data only" },
        ],
        use: "The most demanding IO: SAP HANA, top-tier and transaction-heavy databases.",
      },
      {
        id: "premium",
        name: "Premium SSD",
        family: "SSD",
        tone: "ssd",
        tagline: "Production SSD with fixed size tiers (P1 to P80).",
        perfRel: 0.45,
        facts: [
          { label: "Max IOPS", value: "20,000" },
          { label: "Max throughput", value: "900 MB/s" },
          { label: "Sizing", value: "Performance scales with tier" },
          { label: "OS disk", value: "Yes" },
        ],
        use: "Production VMs and boot disks needing consistent performance.",
      },
      {
        id: "standardssd",
        name: "Standard SSD",
        family: "SSD",
        tone: "ssd",
        tagline: "Entry SSD for light and bursty work.",
        perfRel: 0.3,
        facts: [
          { label: "Max IOPS", value: "6,000" },
          { label: "Max throughput", value: "750 MB/s" },
          { label: "Size", value: "Up to 32 TiB" },
          { label: "OS disk", value: "Yes" },
        ],
        use: "Web servers, lightly used enterprise apps, dev and test.",
      },
      {
        id: "standardhdd",
        name: "Standard HDD",
        family: "HDD",
        tone: "hdd",
        tagline: "Cheapest disk, for cold and infrequent data.",
        perfRel: 0.15,
        facts: [
          { label: "Max IOPS", value: "2,000" },
          { label: "Max throughput", value: "500 MB/s" },
          { label: "Size", value: "Up to 32 TiB" },
          { label: "OS disk", value: "Yes (retires 2028)" },
        ],
        use: "Backup, non-critical data, and workloads that are rarely accessed.",
      },
    ],
    note: "IOPS is operations per second, the currency of small random access. Throughput is MB/s, the currency of large sequential streams. SSD types optimize the first, HDD the second. Ultra and Premium SSD v2 must be data disks: pair them with a Premium SSD OS disk.",
    callouts: [
      {
        kind: "fix",
        tag: "Rule of thumb",
        title: "The fastest disks cannot boot.",
        body: "Ultra Disk and Premium SSD v2 are data disks only: they cannot be an OS disk. A common pattern is a Premium SSD OS disk paired with Premium SSD v2 or Ultra data disks that carry the heavy I/O.",
      },
    ],
  },
  perf: {
    typeName: "Premium SSD v2",
    sizeUnit: "GiB",
    iopsUnit: "IOPS",
    throughputUnit: "MB/s",
    sizeMin: 1,
    sizeMax: 256,
    sizeStep: 1,
    sizeDefault: 100,
    baselineIops: 3000,
    baselineThroughput: 125,
    maxIops: 80000,
    maxThroughput: 2000,
    iopsStep: 500,
    throughputStep: 25,
    iopsPerSize: 500,
    throughputPerIops: 0.25,
    sizeForMaxIops: 160,
    iopsForMaxThroughput: 8000,
    realMaxSizeLabel: "64 TiB",
    intro:
      "Premium SSD v2 includes a free baseline of 3,000 IOPS and 125 MB/s at any size. You can provision more, but the dials constrain each other: extra IOPS need enough size, and extra throughput needs enough IOPS.",
    coupledNote:
      "Classic Premium SSD cannot do this: it comes in fixed tiers (P1 to P80) where IOPS and throughput are set by the size tier, so the only way to go faster is a bigger tier. Premium SSD v2 broke that link.",
    cli: "az disk create --resource-group rg-app --name data-01 --sku PremiumV2_LRS --size-gb 200 --disk-iops-read-write 10000 --disk-mbps-read-write 400 --zone 1",
    callouts: [
      {
        kind: "note",
        tag: "Why the ceilings move",
        title: "160 GiB unlocks max IOPS; 8,000 IOPS unlocks max throughput.",
        body: "After 6 GiB, Premium SSD v2 adds up to 500 IOPS per GiB, so 80,000 IOPS needs at least 160 GiB. Throughput scales at 0.25 MB/s per provisioned IOPS, so 2,000 MB/s needs at least 8,000 IOPS. Push one slider and the other slider's ceiling follows.",
      },
      {
        kind: "fix",
        tag: "No downtime",
        title: "Adjust performance live, four times a day.",
        body: "You can change a Premium SSD v2 disk's IOPS and throughput without detaching it. Up to four performance changes are allowed in a 24-hour window, and a change can take up to an hour to take effect.",
      },
    ],
  },
  snapshots: {
    policyLabel: "Snapshot chain",
    ruleSummary:
      "A snapshot is a read-only copy of a managed disk, stored independently as its own resource. Incremental snapshots save only the blocks changed since the previous snapshot.",
    storedLabel: "Cumulative snapshot storage",
    steps: [
      {
        day: "Day 0",
        action: "Create a 200 GiB disk",
        chip: "Disk",
        tone: "disk",
        storedRel: 0,
        note: "The disk holds live data as a managed resource. Nothing is backed up yet: Azure does not snapshot for you.",
      },
      {
        day: "Day 1",
        action: "First incremental snapshot",
        chip: "Snapshot",
        tone: "snapshot",
        storedRel: 0.5,
        note: "The first snapshot captures all used data as a baseline, stored as its own resource independent of the source disk.",
      },
      {
        day: "Day 8",
        action: "Incremental snapshot",
        chip: "Snapshot",
        tone: "snapshot",
        storedRel: 0.62,
        note: "Only the blocks changed since Day 1 are stored. The snapshot still restores a complete disk by referencing earlier snapshots in the chain.",
      },
      {
        day: "Day 30",
        action: "Create a new disk from a snapshot",
        chip: "New disk",
        tone: "disk",
        storedRel: 0.62,
        note: "You create a fresh managed disk from any snapshot, in any zone in the region. This is how you clone a disk or move data between zones.",
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A snapshot lives inside the disk it came from.",
        body: "It does not. A snapshot is a separate managed resource with its own lifecycle; deleting the source disk leaves its snapshots intact. Automate creation and retention with Azure Backup or a snapshot policy.",
      },
    ],
  },
  picker: {
    rule: "Match the type to the dominant signal. Latency and the highest IOPS point to Ultra Disk, tunable production IOPS to Premium SSD v2, a bootable production disk to Premium SSD, and cold data to Standard HDD.",
    scenarios: [
      {
        id: "hana",
        label: "SAP HANA / top-tier database",
        workload:
          "An in-memory database demanding the highest IOPS at the lowest latency.",
        signals: [
          { label: "Latency", value: "Sub-millisecond", weight: "latency" },
          { label: "Access", value: "Very high IOPS", weight: "iops" },
          { label: "Tuning", value: "Change performance live", weight: "iops" },
        ],
        pick: "Ultra Disk",
        pickTone: "top",
        why: "Ultra Disk reaches the highest IOPS and throughput limits and lets you adjust performance at runtime, which top-tier databases like SAP HANA need.",
      },
      {
        id: "prod-db",
        label: "Production database",
        workload:
          "A busy transactional database that needs consistent IOPS at a good price.",
        signals: [
          { label: "Access", value: "High IOPS", weight: "iops" },
          {
            label: "Provisioning",
            value: "Tune IOPS apart from size",
            weight: "iops",
          },
          {
            label: "Priority",
            value: "Best price for performance",
            weight: "cost",
          },
        ],
        pick: "Premium SSD v2",
        pickTone: "ssd",
        why: "Premium SSD v2 gives high, granularly tunable IOPS and throughput without buying extra capacity, usually the best price for performance. Pair it with a Premium SSD OS disk.",
      },
      {
        id: "boot",
        label: "Production boot disk",
        workload: "The OS disk for a production VM needing steady performance.",
        signals: [
          {
            label: "Boots the machine",
            value: "Yes, an OS disk",
            weight: "boot",
          },
          {
            label: "Access",
            value: "Consistent moderate IOPS",
            weight: "iops",
          },
          {
            label: "Provisioning",
            value: "Fixed tier is fine",
            weight: "cost",
          },
        ],
        pick: "Premium SSD",
        pickTone: "ssd",
        why: "Premium SSD can be an OS disk (Premium SSD v2 and Ultra cannot) and gives consistent tiered performance, making it the standard production boot disk.",
      },
      {
        id: "backup",
        label: "Backup / cold data",
        workload: "Data kept on a disk but rarely read.",
        signals: [
          { label: "Access", value: "Infrequent", weight: "cost" },
          { label: "Priority", value: "Lowest price", weight: "cost" },
          { label: "IOPS", value: "Not important", weight: "iops" },
        ],
        pick: "Standard HDD",
        pickTone: "hdd",
        why: "Standard HDD is the cheapest managed disk. When data is rarely accessed, its low performance is an acceptable trade for the lowest storage price.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "Cost angle",
        title: "Right-sizing beats over-provisioning.",
        body: "Because Premium SSD v2 lets you dial IOPS and throughput without buying capacity, many workloads that once needed Premium SSD tiers or Ultra now run on it for less. Reach for Ultra Disk when you truly need its latency or IOPS ceiling.",
      },
    ],
  },
  quiz: [
    {
      q: "You have a Premium SSD v2 disk in zone 1 and want to attach it to a VM. What must be true?",
      opts: [
        "Nothing: managed disks attach to any VM in any region",
        "The VM must be in the same region and in zone 1",
        "The disk must first be converted to Standard SSD",
        "The VM must be deallocated",
      ],
      answer: 1,
      explain:
        "Premium SSD v2 and Ultra disks are zonal: they attach only to a VM in the same region and the same availability zone. Create the VM in the zone first, then attach the disk.",
    },
    {
      q: "A data disk was left attached with its default delete setting. You delete the VM. What happens to the disk?",
      opts: [
        "It is deleted with the VM",
        "It is preserved as an unattached managed disk",
        "It is converted to a snapshot",
        "It moves to another VM automatically",
      ],
      answer: 1,
      explain:
        "Each disk has its own delete-with-VM setting. A portal-created VM defaults its OS disk to delete but leaves data disks as independent resources, so the data disk survives.",
    },
    {
      q: "On a Premium SSD v2 disk, what do you need to reach the maximum 2,000 MB/s of throughput?",
      opts: [
        "A disk of at least 32 TiB",
        "At least 8,000 provisioned IOPS",
        "Nothing: it is included in the baseline",
        "The Ultra Disk type",
      ],
      answer: 1,
      explain:
        "Premium SSD v2 throughput scales at 0.25 MB/s per provisioned IOPS, so 2,000 MB/s needs at least 8,000 IOPS. IOPS in turn needs size: 80,000 IOPS requires at least 160 GiB.",
    },
    {
      q: "You need an OS (boot) disk for a production VM. Which type can you NOT use?",
      opts: ["Premium SSD", "Standard SSD", "Ultra Disk", "Standard HDD"],
      answer: 2,
      explain:
        "Ultra Disk (and Premium SSD v2) can only be data disks, not OS disks. A common pattern is a Premium SSD OS disk paired with Ultra or Premium SSD v2 data disks.",
    },
    {
      q: "You take a first snapshot, then an incremental one a week later. What does the second store?",
      opts: [
        "A full copy of the whole disk again",
        "Only the blocks that changed since the first snapshot",
        "Nothing until the first snapshot is deleted",
        "A copy inside the source disk",
      ],
      answer: 1,
      explain:
        "Incremental snapshots save only the blocks changed since the previous snapshot, while still referencing unchanged blocks so each one can restore a complete disk. They are independent resources.",
    },
    {
      q: "Which statement about Premium SSD v2 and classic Premium SSD is correct?",
      opts: [
        "Premium SSD lets you set IOPS independently of size; v2 ties them together",
        "Premium SSD v2 lets you set IOPS independently of size; classic Premium SSD uses fixed tiers",
        "Both use fixed size tiers",
        "Neither lets you change performance after creation",
      ],
      answer: 1,
      explain:
        "Premium SSD v2 decouples performance from capacity and lets you tune IOPS and throughput on their own. Classic Premium SSD uses fixed tiers (P1 to P80) where performance is set by the size tier.",
    },
  ],
};

/* ------------------------------- Export ---------------------------------- */

export const CONTENT: Record<Provider, LessonContent> = {
  aws: AWS,
  azure: AZURE,
};
