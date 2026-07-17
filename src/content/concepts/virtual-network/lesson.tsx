import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { NetworkChapters } from "./chapters";

const concept = getConcept("virtual-network");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is Amazon VPC?",
      href: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html",
      note: "What a VPC is and the pieces it gives you.",
    },
    {
      label: "Plan your VPC",
      href: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-getting-started.html",
      note: "Address ranges, subnets, and internet access, step by step.",
    },
  ],
  azure: [
    {
      label: "What is Azure Virtual Network?",
      href: "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview",
      note: "Why VNets exist and how subnets and peering fit.",
    },
    {
      label: "Quickstart: Create a virtual network",
      href: "https://learn.microsoft.com/en-us/azure/virtual-network/quickstart-create-virtual-network",
      note: "Create a VNet and test connectivity between two VMs.",
    },
  ],
};

const BLURB =
  "Carve out your own private, isolated network inside the cloud: pick its address range, split it into public and private subnets, and control exactly what can reach the internet and what can reach your servers.";

const ELEVATOR =
  "a private, isolated slice of cloud network you shape yourself";

/**
 * The Virtual Network lesson. The heavy, interactive body lives in
 * NetworkChapters and is driven per provider (AWS and Azure diverge in how they
 * reach the internet and how their firewalls work), while this shell provides
 * the shared concept framing and the cross-provider equivalence.
 */
export function VirtualNetworkLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon VPC", code: "ec2 · vpc" }}
        azure={{
          service: "Azure Virtual Network",
          code: "Microsoft.Network",
        }}
        elevator={ELEVATOR}
      />
      <NetworkChapters provider={provider} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
