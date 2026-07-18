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

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "The objects you upload and how you organize keys",
      "Bucket policies, IAM permissions, and object ACLs",
      "Block Public Access settings and public exposure",
      "Storage class per object and lifecycle rules",
      "Encryption choices, whether SSE-S3, SSE-KMS, or your keys",
      "Versioning, replication rules, and access logging",
    ],
    providerManages: [
      "Eleven nines of durability across the region",
      "Replication of objects across Availability Zones",
      "The storage fleet, disks, and their replacement",
      "Service availability and the HTTP API endpoint",
      "Physical hosts, network fabric, and data center security",
    ],
    mutable: [
      "Bucket policy and Block Public Access settings",
      "Default server-side encryption configuration",
      "Lifecycle rules and storage class transitions",
      "Versioning state, enabled then only suspended not removed",
      "CORS, logging, and static website config",
      "Tags",
    ],
    immutable: [
      "Bucket name",
      "AWS Region the bucket lives in",
      "Bucket namespace scope, global or account-regional",
    ],
  },
  azure: {
    youManage: [
      "The blobs you upload and their container layout",
      "Azure RBAC roles, and account keys or SAS tokens",
      "The anonymous access toggle and public exposure",
      "Access tier per blob and lifecycle policies",
      "Encryption with Microsoft-managed or customer-managed keys",
      "Redundancy choice such as LRS, ZRS, GRS, or GZRS",
    ],
    providerManages: [
      "Durability and the copies your redundancy tier promises",
      "Replication within and across regions as configured",
      "The storage hardware, disks, and their replacement",
      "Service availability and the blob service endpoint",
      "Physical hosts, network fabric, and data center security",
    ],
    mutable: [
      "Default access tier, hot, cool, or cold",
      "Redundancy through supported replication conversions",
      "Encryption settings and customer-managed keys",
      "Network rules and public network access",
      "Minimum TLS version and secure transfer",
      "Tags",
    ],
    immutable: [
      "Storage account name",
      "Region or location",
      "Account kind and performance tier",
      "Hierarchical namespace once enabled cannot revert",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Private, versioned bucket",
        blurb:
          "A locked-down general-purpose bucket: no public access, encryption on, and versioning to protect against accidental overwrites. Start here when you just need durable storage your own code reaches with credentials.",
        prompt:
          "Provision an Amazon S3 bucket using the aws CLI. First run `aws sts get-caller-identity` to confirm which account and identity you are using, and check the target region with `aws configure get region`. Propose a globally unique bucket name such as intro-to-cloud-demo-<accountid> in that region, with Block Public Access fully enabled, default SSE-S3 encryption, and versioning turned on. Echo the full plan, including the exact create-bucket and configuration commands, and wait for my confirmation before running anything that creates or changes resources. After it applies, print the bucket name, its ARN, and its regional endpoint URL.",
      },
      {
        label: "Static website hosting",
        blurb:
          "A bucket that serves an HTML site directly over HTTP, with an index and error document. Reach for this to host a simple static site or single-page app without running any server.",
        prompt:
          "Provision an Amazon S3 bucket configured for static website hosting using the aws CLI. First run `aws sts get-caller-identity` to confirm which account and identity you are using, and check the target region with `aws configure get region`. Propose a globally unique bucket name such as intro-to-cloud-site-<accountid> in that region, tagged Project=intro-to-cloud for easy cleanup. Plan to disable the relevant Block Public Access settings, attach a bucket policy granting `s3:GetObject` to everyone, enable the website configuration with `aws s3 website` setting index.html as the index document and error.html as the error document, and upload a small placeholder index.html. Echo the full plan, including the exact create-bucket, put-public-access-block, put-bucket-policy, and website commands, and wait for my confirmation before running anything that creates or changes resources. After it applies, print the bucket name, its ARN, and the website endpoint URL.",
      },
      {
        label: "Lifecycle tiering",
        blurb:
          "A versioned bucket with a lifecycle rule that transitions aging objects to cheaper storage classes and expires old noncurrent versions. Use this when you keep data long term but read it less over time.",
        prompt:
          "Provision an Amazon S3 bucket with a lifecycle rule using the aws CLI. First run `aws sts get-caller-identity` to confirm which account and identity you are using, and check the target region with `aws configure get region`. Propose a globally unique bucket name such as intro-to-cloud-archive-<accountid> in that region, tagged Project=intro-to-cloud, with Block Public Access fully enabled, default SSE-S3 encryption, and versioning turned on. Plan a lifecycle configuration applied with `aws s3api put-bucket-lifecycle-configuration` that transitions current objects to STANDARD_IA after 30 days and GLACIER after 90 days, and expires noncurrent versions after 90 days. Echo the full plan, including the exact create-bucket, versioning, and lifecycle JSON and commands, and wait for my confirmation before running anything that creates or changes resources. After it applies, print the bucket name, its ARN, and the applied lifecycle rule id.",
      },
      {
        label: "Public asset bucket",
        blurb:
          "A bucket with public read access so browsers and clients can fetch assets like images or downloads by URL. Reach for this when you deliberately want objects served publicly, without static-site routing.",
        prompt:
          "Provision an Amazon S3 bucket with public read access for serving assets using the aws CLI. First run `aws sts get-caller-identity` to confirm which account and identity you are using, and check the target region with `aws configure get region`. Propose a globally unique bucket name such as intro-to-cloud-assets-<accountid> in that region, tagged Project=intro-to-cloud, with default SSE-S3 encryption on. Plan to relax the Block Public Access settings that block public policies, attach a bucket policy granting `s3:GetObject` on `arn:aws:s3:::<bucket>/*` to everyone so uploaded objects are publicly readable, and upload a small placeholder object to confirm. Echo the full plan, including the exact create-bucket, put-public-access-block, and put-bucket-policy commands, and wait for my confirmation before running anything that creates or changes resources. After it applies, print the bucket name, its ARN, and the public object URL for the placeholder.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Private container",
        blurb:
          "A locked-down storage account and container: public access off, TLS 1.2 minimum, and locally redundant storage. Start here when you just need durable blob storage your own code reaches with credentials.",
        prompt:
          "Provision Azure Blob Storage using the az CLI. First run `az account show` to confirm the active subscription and tenant, and note the location you intend to deploy to. Propose a resource group and a storage account with a globally unique name such as introclouddemo<suffix> in that location, using Standard_LRS, TLS 1.2 minimum, and allow-blob-public-access disabled, then create a container named demo inside it. Echo the full plan with the exact az group, az storage account, and az storage container commands, and wait for my confirmation before running anything that creates or changes resources. After it applies, print the storage account name, its resource id, and the primary blob endpoint.",
      },
      {
        label: "Static website hosting",
        blurb:
          "A storage account with the static website feature enabled, serving an index and error document from the $web container. Reach for this to host a simple static site or single-page app without running any server.",
        prompt:
          "Provision Azure Blob Storage configured for static website hosting using the az CLI. First run `az account show` to confirm the active subscription and tenant, and note the location you intend to deploy to. Propose a resource group and a storage account with a globally unique name such as introcloudsite<suffix> in that location, using Standard_LRS and TLS 1.2 minimum, tagged project=intro-to-cloud for easy cleanup. Plan to enable the static website feature with `az storage blob service-properties update --static-website` setting index.html as the index document and error.html as the error document, then upload a small placeholder index.html to the $web container. Echo the full plan with the exact az group, az storage account, az storage blob service-properties update, and az storage blob upload commands, and wait for my confirmation before running anything that creates or changes resources. After it applies, print the storage account name, its resource id, and the primary web endpoint URL.",
      },
      {
        label: "Lifecycle tiering",
        blurb:
          "A storage account with a lifecycle management policy that moves aging blobs to Cool and Archive tiers and deletes old ones. Use this when you keep data long term but read it less over time.",
        prompt:
          "Provision Azure Blob Storage with a lifecycle management policy using the az CLI. First run `az account show` to confirm the active subscription and tenant, and note the location you intend to deploy to. Propose a resource group and a storage account with a globally unique name such as introcloudarchive<suffix> in that location, using Standard_LRS and TLS 1.2 minimum, allow-blob-public-access disabled, and tagged project=intro-to-cloud, then create a container named data inside it. Plan a lifecycle policy applied with `az storage account management-policy create` that tiers blobs to Cool after 30 days and Archive after 90 days since last modification, and deletes them after 365 days. Echo the full plan with the exact az group, az storage account, az storage container, and az storage account management-policy commands plus the policy JSON, and wait for my confirmation before running anything that creates or changes resources. After it applies, print the storage account name, its resource id, and a summary of the applied policy rule.",
      },
      {
        label: "Public asset container",
        blurb:
          "A container set to blob-level anonymous read access so browsers and clients can fetch assets by URL. Reach for this when you deliberately want blobs served publicly, without static-site routing.",
        prompt:
          "Provision Azure Blob Storage with a publicly readable container for serving assets using the az CLI. First run `az account show` to confirm the active subscription and tenant, and note the location you intend to deploy to. Propose a resource group and a storage account with a globally unique name such as introcloudassets<suffix> in that location, using Standard_LRS and TLS 1.2 minimum, tagged project=intro-to-cloud. Plan to enable allow-blob-public-access on the account, create a container named assets with `az storage container create --public-access blob` so its blobs are anonymously readable, and upload a small placeholder blob to confirm. Echo the full plan with the exact az group, az storage account, az storage container create, and az storage blob upload commands, and wait for my confirmation before running anything that creates or changes resources. After it applies, print the storage account name, its resource id, and the public blob URL for the placeholder.",
      },
    ],
  },
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
      <ObjectStorageChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
