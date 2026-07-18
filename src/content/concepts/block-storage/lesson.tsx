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
import { SECURITY } from "./security";

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
    mutable: [
      "Volume size, increase only via Elastic Volumes",
      "Volume type across gp2, gp3, io1, io2, st1, sc1",
      "Provisioned IOPS on gp3, io1, io2",
      "Throughput on gp3 volumes",
      "Multi-Attach enablement on io1 and io2",
      "Auto-enable I/O flag and tags",
    ],
    immutable: [
      "Availability Zone of the volume",
      "Encryption state, encrypted versus unencrypted",
      "KMS key used for encryption",
      "Source snapshot the volume was created from",
      "Decreasing volume size below current",
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
    mutable: [
      "Disk size in GiB, increase only",
      "Disk SKU across Premium SSD, Standard SSD, Standard HDD",
      "Performance tier on Premium SSD",
      "Redundancy between LRS and ZRS on a regional disk",
      "Network access policy and tags",
    ],
    immutable: [
      "Disk name after creation",
      "Logical sector size on Ultra and Premium SSD v2",
      "Availability zone placement of a zonal disk",
      "Region the disk resides in",
      "Decreasing the disk size below current",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Encrypted gp3 volume",
        blurb:
          "The everyday starting point: one general-purpose gp3 volume with encryption on, ready to attach to an instance. Reach for this when you just need a durable disk with sensible defaults.",
        prompt:
          "Provision an Amazon EBS volume using the aws CLI. First run `aws sts get-caller-identity` to confirm the active credentials and account, and check the configured region with `aws configure get region`, since EBS volumes are pinned to a single Availability Zone. Create one gp3 volume of 50 GiB in that zone with encryption enabled, tagged Name=intro-to-cloud-demo, using sensible default IOPS and throughput. Echo the full plan, including the volume type, size, zone, and encryption setting, and wait for my confirmation before running anything that creates or deletes resources. After it is created, print the volume ID, its ARN, the Availability Zone, and the encryption status.",
      },
      {
        label: "High-IOPS io2 volume",
        blurb:
          "A provisioned-IOPS io2 volume for a latency-sensitive workload such as a busy database. Reach for this when gp3's baseline is not enough and you need to buy dedicated IOPS.",
        prompt:
          "Provision a high-performance, encrypted Amazon EBS volume using the aws CLI. First run `aws sts get-caller-identity` to confirm the active credentials and account, and check the configured region with `aws configure get region`, since EBS volumes are pinned to a single Availability Zone. Create one io2 volume of 100 GiB in that zone with encryption enabled and 10000 provisioned IOPS, tagged Name=intro-to-cloud-highperf, using the default KMS key for EBS. Echo the full plan, including the volume type, size, provisioned IOPS, zone, and encryption setting, and wait for my confirmation before running anything that creates or deletes resources. After it is created, print the volume ID, its ARN, the provisioned IOPS, the Availability Zone, and the encryption status.",
      },
      {
        label: "Snapshot and restore",
        blurb:
          "Take a point-in-time snapshot of an existing volume, then create a fresh volume from it. Reach for this to back up a disk or to clone one into a new copy for testing or recovery.",
        prompt:
          "Snapshot an Amazon EBS volume and restore it into a new volume using the aws CLI. First run `aws sts get-caller-identity` to confirm the active credentials and account, and check the configured region with `aws configure get region`. Ask me for the source volume ID, then take a snapshot of it with `aws ec2 create-snapshot`, tagged Name=intro-to-cloud-snapshot, and wait for the snapshot to reach the completed state. Once it is complete, create a new volume in the source volume's Availability Zone from that snapshot with `aws ec2 create-volume --snapshot-id`, tagged Name=intro-to-cloud-restore. Echo the full plan, including the source volume, the snapshot, and the target zone, and wait for my confirmation before running anything that creates or deletes resources. After both steps finish, print the snapshot ID, its state, and the restored volume ID with its Availability Zone.",
      },
      {
        label: "Grow and expand volume",
        blurb:
          "Increase the size of a live volume with Elastic Volumes, then grow the filesystem so the guest OS sees the new space. Reach for this when a disk is running out of room and you want to expand it in place.",
        prompt:
          "Grow an existing Amazon EBS volume and expand its filesystem using the aws CLI. First run `aws sts get-caller-identity` to confirm the active credentials and account, and check the configured region with `aws configure get region`. Ask me for the volume ID and its current size, then use `aws ec2 modify-volume` to increase it to 100 GiB and poll `aws ec2 describe-volumes-modifications` until the modification reaches the optimizing or completed state. Echo the full plan, including the volume ID, the current and target sizes, and remind me that after the volume grows I must extend the partition and grow the filesystem on the guest OS (for example with `growpart` and then `resize2fs` or `xfs_growfs`), and wait for my confirmation before running anything that creates or deletes resources. After the modification finishes, print the volume ID, the new size, the modification state, and the exact filesystem commands to run on the instance.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Premium SSD v2 disk",
        blurb:
          "The everyday starting point: one managed disk with default at-rest encryption, ready to attach to a VM. Reach for this when you just need a durable disk with sensible defaults.",
        prompt:
          "Provision an Azure managed disk using the az CLI. First run `az account show` to confirm the active subscription and tenant, and confirm the target region and resource group before doing anything. Create one Premium SSD v2 (or Premium_LRS if v2 is unavailable in the region) managed disk of 50 GiB named intro-to-cloud-demo in that resource group, relying on the default server-side encryption at rest. Echo the full plan, including the disk SKU, size, region, and resource group, and wait for my confirmation before running anything that creates or deletes resources. After it is created, print the disk resource ID, its name, the SKU, and the provisioned size.",
      },
      {
        label: "High-IOPS Premium SSD v2",
        blurb:
          "A Premium SSD v2 disk with IOPS and throughput provisioned above its size-based baseline for a latency-sensitive workload such as a busy database. Reach for this when the default performance is not enough.",
        prompt:
          "Provision a high-performance Azure managed disk using the az CLI. First run `az account show` to confirm the active subscription and tenant, and confirm the target region and resource group before doing anything. Create one Premium SSD v2 (PremiumV2_LRS) managed disk of 100 GiB named intro-to-cloud-highperf in that resource group, with 10000 provisioned IOPS and 400 MBps provisioned throughput, in a zone the region supports, relying on the default server-side encryption at rest. Echo the full plan, including the disk SKU, size, provisioned IOPS, throughput, zone, region, and resource group, and wait for my confirmation before running anything that creates or deletes resources. After it is created, print the disk resource ID, its name, the SKU, the provisioned IOPS and throughput, and the provisioned size.",
      },
      {
        label: "Snapshot and restore",
        blurb:
          "Take a point-in-time snapshot of an existing disk, then create a fresh disk from it. Reach for this to back up a disk or to clone one into a new copy for testing or recovery.",
        prompt:
          "Snapshot an Azure managed disk and restore it into a new disk using the az CLI. First run `az account show` to confirm the active subscription and tenant, and confirm the target region and resource group before doing anything. Ask me for the source disk name, then create a snapshot of it with `az snapshot create --source`, named intro-to-cloud-snapshot in that resource group, and wait for it to finish provisioning. Once the snapshot is ready, create a new managed disk from it with `az disk create --source`, named intro-to-cloud-restore in the same resource group. Echo the full plan, including the source disk, the snapshot, and the resource group, and wait for my confirmation before running anything that creates or deletes resources. After both steps finish, print the snapshot resource ID, its provisioning state, and the restored disk resource ID with its SKU and size.",
      },
      {
        label: "Grow and expand disk",
        blurb:
          "Increase the size of a managed disk, then grow the filesystem so the guest OS sees the new space. Reach for this when a disk is running out of room and you want to expand it in place.",
        prompt:
          "Grow an existing Azure managed disk and expand its filesystem using the az CLI. First run `az account show` to confirm the active subscription and tenant, and confirm the target region and resource group before doing anything. Ask me for the disk name and its current size, then use `az disk update --size-gb` to increase it to 100 GiB, noting that a size increase may require the attached VM to be deallocated depending on the disk type. Echo the full plan, including the disk name, the current and target sizes, and remind me that after the disk grows I must extend the partition and grow the filesystem on the guest OS (for example with `growpart` and then `resize2fs` or `xfs_growfs` on Linux, or Disk Management on Windows), and wait for my confirmation before running anything that creates or deletes resources. After the update finishes, print the disk resource ID, the new size, the provisioning state, and the exact filesystem commands to run on the VM.",
      },
    ],
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
        security={SECURITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
