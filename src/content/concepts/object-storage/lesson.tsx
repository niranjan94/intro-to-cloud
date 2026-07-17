import { CliBlock } from "@/components/lesson/cli-block";
import {
  DiagramCanvas,
  DiagramFrame,
  DiagramNode,
} from "@/components/lesson/diagram";
import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import { SectionHeading } from "@/components/lesson/section-heading";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";

const concept = getConcept("object-storage");

const BLURB =
  "Store and retrieve any amount of unstructured data — images, backups, logs — as objects in a flat namespace, reachable over HTTP.";

const ELEVATOR = "dump files somewhere durable and fetch them by URL";

const LENS: Record<
  Provider,
  { code: string; cli: string; region: string; unit: string }
> = {
  aws: {
    code: "s3",
    cli: "aws s3 mb s3://my-bucket",
    region: "us-east-1",
    unit: "bucket",
  },
  azure: {
    code: "Microsoft.Storage",
    cli: "az storage container create -n my-data",
    region: "eastus",
    unit: "container",
  },
};

const TERMS: GlossaryTerm[] = [
  {
    term: "Bucket / Container",
    definition: "The top-level holder your objects live in.",
  },
  {
    term: "Object / Blob",
    definition: "A single stored file plus its metadata.",
  },
  { term: "Key", definition: "The unique path used to fetch an object." },
  { term: "Region", definition: "The geography the data physically sits in." },
];

/**
 * The Object Storage lesson. Provider-specific facts come in through `provider`
 * so both the AWS and Azure entry points share one authored lesson body.
 */
export function ObjectStorageLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;
  const lens = LENS[provider];

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon S3", code: LENS.aws.code }}
        azure={{ service: "Azure Blob Storage", code: LENS.azure.code }}
        elevator={ELEVATOR}
      />

      <SectionHeading>How it fits together</SectionHeading>
      <DiagramCanvas>
        <DiagramFrame label={`Region · ${lens.region}`} tone="blue">
          <div className="mt-[12px] flex flex-wrap gap-[12px]">
            <DiagramNode
              title={concept.services[provider] ?? ""}
              sub={`one flat ${lens.unit}, no folders`}
            />
            <DiagramNode
              title="Object"
              sub="fetched by key over HTTPS"
              tone="gray"
            />
          </div>
        </DiagramFrame>
      </DiagramCanvas>

      <SectionHeading>The command</SectionHeading>
      <CliBlock command={lens.cli} />

      <Glossary terms={TERMS} />
    </LessonLayout>
  );
}
