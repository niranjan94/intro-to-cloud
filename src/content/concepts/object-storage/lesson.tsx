import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { ObjectStorageChapters } from "./chapters";

const concept = getConcept("object-storage");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is Amazon S3?",
      href: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
      note: "The service model: buckets, objects, keys, and the flat namespace.",
    },
    {
      label: "Understanding and managing Amazon S3 storage classes",
      href: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html",
      note: "Compare Standard, Infrequent Access, and the Glacier archive classes.",
    },
    {
      label: "Blocking public access to your S3 storage",
      href: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html",
      note: "The guardrail that keeps new buckets private by default.",
    },
    {
      label: "Download and upload objects with presigned URLs",
      href: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html",
      note: "Grant time-limited access to one object with a signed link.",
    },
  ],
  azure: [
    {
      label: "Introduction to Azure Blob Storage",
      href: "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction",
      note: "The storage account, container, and blob model, and blob types.",
    },
    {
      label: "Access tiers for blob data",
      href: "https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview",
      note: "Hot, Cool, Cold, and Archive: cost against how often you read.",
    },
    {
      label: "Azure Storage redundancy",
      href: "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy",
      note: "LRS, ZRS, GRS, and GZRS: how many copies exist and where.",
    },
    {
      label: "Grant limited access with a shared access signature (SAS)",
      href: "https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview",
      note: "Signed, time-limited access to a blob without an Azure identity.",
    },
  ],
};

const BLURB =
  "Store and retrieve any amount of unstructured data, from images and backups to logs and video, as objects in a flat namespace you reach over HTTP. There are no disks to size and no servers to run: you pay for what you store, choose how fast you need it back, and address every object by a URL.";

const ELEVATOR = "dump files somewhere durable and fetch them by URL";

const TERMS: GlossaryTerm[] = [
  {
    term: "Bucket / Container",
    definition: "The top-level holder your objects live in.",
  },
  {
    term: "Object / Blob",
    definition: "A single stored file plus its metadata.",
  },
  {
    term: "Key / Blob name",
    definition:
      "The full name used to fetch it; also builds the folder illusion.",
  },
  {
    term: "Storage class / Access tier",
    definition: "The cost-against-access setting you choose per object.",
  },
  {
    term: "Presigned URL / SAS",
    definition: "A signed, time-limited link that grants temporary access.",
  },
  {
    term: "Bucket policy / Azure RBAC",
    definition:
      "The main way to say who can do what, preferred over legacy ACLs or account keys.",
  },
  {
    term: "Block Public Access / Anonymous toggle",
    definition:
      "The account-level guardrail that keeps storage from being exposed publicly.",
  },
  {
    term: "Storage account",
    definition:
      "Azure's billing and endpoint boundary above a container. S3 has no equivalent.",
  },
];

/**
 * The Object Storage lesson. The interactive body lives in ObjectStorageChapters
 * and is driven per provider: AWS and Azure diverge in the namespace layering
 * (Azure adds the storage account), the tier vocabulary (storage classes vs
 * access tiers), and the signed-access model (presigned URL vs SAS). This shell
 * provides the shared concept framing, the cross-provider equivalence, the
 * glossary, and links to the authoritative documentation for the active lens.
 */
export function ObjectStorageLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon S3", code: "s3" }}
        azure={{ service: "Azure Blob Storage", code: "Microsoft.Storage" }}
        elevator={ELEVATOR}
      />
      <ObjectStorageChapters provider={provider} />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
