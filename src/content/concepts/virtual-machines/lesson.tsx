import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { VmChapters } from "./chapters";

const concept = getConcept("virtual-machines");

const BLURB =
  "Rent a full computer in the cloud: CPU, memory, a disk, an operating system, reachable like a server you could touch. You pay by the second, shape it to the workload, and throw it away when you are done.";

const ELEVATOR = "rent a whole server by the second";

const TERMS: GlossaryTerm[] = [
  {
    term: "Instance / Virtual machine",
    definition: "One running virtual server you rent.",
  },
  {
    term: "AMI / Image",
    definition: "The disk template it boots from.",
  },
  {
    term: "Instance type / VM size",
    definition: "The pre-baked CPU and memory shape you pick.",
  },
  {
    term: "EBS volume / Managed disk",
    definition: "Persistent network-attached disk that survives a stop.",
  },
  {
    term: "Security group / NSG",
    definition: "The stateful firewall attached to the machine.",
  },
  {
    term: "Stop / Deallocate",
    definition: "Power off. In Azure only deallocate stops the compute bill.",
  },
];

/**
 * The Virtual Machines lesson. The heavy, interactive body lives in VmChapters
 * and is driven per provider (AWS and Azure diverge most in the lifecycle,
 * where Azure separates stopping from deallocating), while this shell provides
 * the shared concept framing, the cross-provider equivalence, and the glossary.
 */
export function VirtualMachinesLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon EC2", code: "ec2" }}
        azure={{
          service: "Azure Virtual Machines",
          code: "Microsoft.Compute",
        }}
        elevator={ELEVATOR}
      />
      <VmChapters provider={provider} />
      <Glossary terms={TERMS} />
    </LessonLayout>
  );
}
