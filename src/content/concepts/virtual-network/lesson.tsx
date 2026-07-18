import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import type {
  AgentSetup,
  ResponsibilitySplit,
} from "@/components/lesson/lesson-reference";
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

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "CIDR block, subnet layout, and route tables",
      "internet, NAT, and other gateways you attach",
      "security groups and network ACL rules",
      "VPC peering, Transit Gateway, and endpoints",
      "IAM policies controlling who edits the network",
      "flow logs and traffic monitoring you enable",
    ],
    providerManages: [
      "physical routers, switches, and cabling",
      "the software-defined networking control plane",
      "isolation between tenants on shared hardware",
      "availability of the underlying network fabric",
      "physical security of the data centers",
    ],
  },
  azure: {
    youManage: [
      "address space, subnets, and route tables",
      "network security groups and application security groups",
      "peering, VPN, and ExpressRoute connections",
      "private endpoints and service endpoints",
      "Azure RBAC and Entra roles for network edits",
      "NSG flow logs and diagnostic settings",
    ],
    providerManages: [
      "physical network hardware and cabling",
      "the software-defined networking control plane",
      "isolation between tenants on shared infrastructure",
      "availability of the underlying network fabric",
      "physical security of the data centers",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    prompt:
      "Provision an Amazon VPC using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Create a VPC named intro-vpc with CIDR block 10.0.0.0/16, then add one public subnet (10.0.1.0/24) and one private subnet (10.0.2.0/24), an internet gateway attached to the VPC, and a route table sending 0.0.0.0/0 through the gateway for the public subnet. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Use tags to name each resource clearly so they are easy to find and clean up. When finished, print the VPC ID, subnet IDs, and internet gateway ID.",
  },
  azure: {
    cli: "az",
    prompt:
      "Provision an Azure Virtual Network using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group named intro-rg if it does not exist, then create a virtual network named intro-vnet with address space 10.0.0.0/16 containing one subnet named app-subnet (10.0.1.0/24), and attach a network security group with sensible default deny-inbound rules. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming so the resources are easy to locate and remove later. When finished, print the virtual network resource ID, subnet ID, and the NSG ID.",
  },
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
      <NetworkChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
