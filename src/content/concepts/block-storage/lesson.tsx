import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
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
      <BlockStorageChapters provider={provider} />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
