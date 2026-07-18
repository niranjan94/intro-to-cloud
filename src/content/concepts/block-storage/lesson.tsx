import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import type {
  AgentSetup,
  ResponsibilitySplit,
} from "@/components/lesson/lesson-reference";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { BlockStorageChapters } from "./chapters";

const concept = getConcept("block-storage");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is Amazon Elastic Block Store?",
      href: "https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html",
      note: "Volumes, snapshots, and how EBS attaches to EC2 instances.",
    },
    {
      label: "Amazon EBS volume types",
      href: "https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html",
      note: "gp3, io2 Block Express, st1, and sc1 compared by IOPS and throughput.",
    },
    {
      label: "General Purpose SSD (gp3) volumes",
      href: "https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html",
      note: "The baseline, and how IOPS and throughput scale apart from size.",
    },
    {
      label: "Amazon EBS snapshots",
      href: "https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html",
      note: "Incremental point-in-time backups stored in Amazon S3.",
    },
    {
      label: "Preserve data when an instance is terminated",
      href: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/preserving-volumes-on-termination.html",
      note: "DeleteOnTermination defaults for root and data volumes.",
    },
  ],
  azure: [
    {
      label: "Introduction to Azure managed disks",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview",
      note: "The managed disk model, durability, snapshots, and encryption.",
    },
    {
      label: "Azure managed disk types",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types",
      note: "Ultra, Premium SSD v2, Premium SSD, Standard SSD, and Standard HDD.",
    },
    {
      label: "Deploy a Premium SSD v2",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/disks-deploy-premium-v2",
      note: "Set size, IOPS, and throughput independently on a zonal disk.",
    },
    {
      label: "Server-side encryption of Azure Disk Storage",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption",
      note: "Managed disks are encrypted at rest by default with 256-bit AES.",
    },
    {
      label: "Share an Azure managed disk across VMs",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/disks-shared",
      note: "Attach one disk to several VMs for clustered applications.",
    },
  ],
};

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "Choosing the volume type, size, and provisioned IOPS",
      "Formatting and mounting the volume on the guest OS",
      "The filesystem, partitions, and data written to it",
      "Snapshot schedule and lifecycle policies for backups",
      "The DeleteOnTermination flag and attachment to instances",
      "KMS key selection for encryption at rest",
    ],
    providerManages: [
      "The underlying SSD and HDD storage hardware",
      "Replication of the volume within its Availability Zone",
      "Durability and availability of the block device",
      "The physical hosts, network fabric, and data centers",
      "Encryption infrastructure and transparent at-rest crypto",
    ],
  },
  azure: {
    youManage: [
      "Choosing the disk SKU, size, and provisioned IOPS",
      "Formatting and mounting the disk on the guest OS",
      "The filesystem, partitions, and data written to it",
      "Snapshot schedule and lifecycle for backups",
      "The Delete with VM setting and disk attachment",
      "Disk encryption set and customer-managed key choices",
    ],
    providerManages: [
      "The underlying SSD and HDD storage hardware",
      "Three replica copies for locally redundant durability",
      "Durability and availability of the managed disk",
      "The physical hosts, network fabric, and data centers",
      "Server-side encryption at rest with 256-bit AES by default",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    prompt:
      "Provision an Amazon EBS volume using the aws CLI. First run `aws sts get-caller-identity` to confirm the active credentials and account, and check the configured region with `aws configure get region`, since EBS volumes are pinned to a single Availability Zone. Create one gp3 volume of 50 GiB in that zone with encryption enabled, tagged Name=intro-to-cloud-demo, using sensible default IOPS and throughput. Echo the full plan, including the volume type, size, zone, and encryption setting, and wait for my confirmation before running anything that creates or deletes resources. After it is created, print the volume ID, its ARN, the Availability Zone, and the encryption status.",
  },
  azure: {
    cli: "az",
    prompt:
      "Provision an Azure managed disk using the az CLI. First run `az account show` to confirm the active subscription and tenant, and confirm the target region and resource group before doing anything. Create one Premium SSD v2 (or Premium_LRS if v2 is unavailable in the region) managed disk of 50 GiB named intro-to-cloud-demo in that resource group, relying on the default server-side encryption at rest. Echo the full plan, including the disk SKU, size, region, and resource group, and wait for my confirmation before running anything that creates or deletes resources. After it is created, print the disk resource ID, its name, the SKU, and the provisioned size.",
  },
};

const BLURB =
  "Block storage is a raw disk you attach to a single machine and use like a local drive: format it, mount it, and read and write blocks. Unlike object storage, it is not reached over HTTP and holds no notion of files on its own. The disk is its own resource with its own lifecycle, so it can outlive the machine, be snapshotted, and be tuned for the exact speed a workload needs.";

const ELEVATOR = "a raw disk you attach to one machine and that can outlive it";

const TERMS: GlossaryTerm[] = [
  {
    term: "Volume / Managed disk",
    definition:
      "The block device you attach to a machine and use like a local drive.",
  },
  {
    term: "Root volume / OS disk",
    definition:
      "The disk the machine boots from, holding the operating system.",
  },
  {
    term: "Data volume / Data disk",
    definition:
      "An extra disk attached for application data, apart from the OS.",
  },
  {
    term: "IOPS",
    definition:
      "Input/output operations per second: the currency of small random access.",
  },
  {
    term: "Throughput",
    definition:
      "MiB/s or MB/s moved: the currency of large sequential streaming.",
  },
  {
    term: "Provisioned IOPS",
    definition:
      "IOPS you set for a volume, on gp3 and Premium SSD v2 apart from its size.",
  },
  {
    term: "Snapshot",
    definition:
      "An incremental point-in-time backup of a disk, stored as its own resource.",
  },
  {
    term: "DeleteOnTermination / Delete with VM",
    definition:
      "The per-disk setting that decides if a disk is removed with its machine.",
  },
];

/**
 * The Block Storage lesson. The interactive body lives in BlockStorageChapters
 * and is driven per provider: AWS and Azure diverge in the placement boundary
 * (an EBS volume is pinned to one Availability Zone; Azure disks are regional
 * and the fastest types pin to a zone), the type catalog (gp3, io2 Block
 * Express, st1, sc1 versus Premium SSD v2, Ultra, Premium SSD, Standard SSD,
 * Standard HDD), and the default persistence of a disk when its machine is
 * deleted. This shell provides the shared framing, the cross-provider
 * equivalence, the glossary, and links to the authoritative docs for the lens.
 */
export function BlockStorageLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon EBS", code: "AWS::EC2::Volume" }}
        azure={{
          service: "Azure Managed Disks",
          code: "Microsoft.Compute/disks",
        }}
        elevator={ELEVATOR}
      />
      <BlockStorageChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
