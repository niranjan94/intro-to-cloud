import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { VmInteractive } from "./vm-interactive";

const concept = getConcept("virtual-machines");

const BLURB =
  "Rent a full computer in the cloud — CPU, memory, an OS — and treat it like a server you could reach out and touch, except you pay by the second and can throw it away when you're done.";

const ELEVATOR = "rent a whole server by the hour";

const TERMS: GlossaryTerm[] = [
  { term: "Instance / VM", definition: "One running virtual server you rent." },
  {
    term: "Image (AMI / Image)",
    definition: "The disk template it boots from.",
  },
  {
    term: "Instance type / Size",
    definition: "The CPU + memory shape you pick.",
  },
  { term: "Region", definition: "The geographic location it runs in." },
];

/** The Virtual Machines lesson: equivalence, an interactive provisioner, terms. */
export function VirtualMachinesLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon EC2", code: "ec2" }}
        azure={{ service: "Azure Virtual Machines", code: "Microsoft.Compute" }}
        elevator={ELEVATOR}
      />
      <VmInteractive provider={provider} />
      <Glossary terms={TERMS} />
    </LessonLayout>
  );
}
