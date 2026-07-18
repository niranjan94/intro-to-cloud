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
import { SECURITY } from "./security";

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
    {
      label: "What is VPC peering?",
      href: "https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html",
      note: "Joining two VPCs privately, and the no-overlapping-CIDR rule.",
    },
    {
      label: "Route table concepts",
      href: "https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html",
      note: "The local route, targets, and how subnets associate with a table.",
    },
    {
      label: "How route priority works",
      href: "https://docs.aws.amazon.com/vpc/latest/userguide/route-tables-priority.html",
      note: "Longest-prefix match, and static routes beating propagated ones.",
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
    {
      label: "Virtual network peering overview",
      href: "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview",
      note: "Regional and global peering, and the non-overlapping address-space rule.",
    },
    {
      label: "Virtual network traffic routing",
      href: "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview",
      note: "System routes, user-defined routes, and how Azure selects a route.",
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
    mutable: [
      "DNS hostnames and DNS support settings",
      "secondary IPv4 and IPv6 CIDR blocks",
      "instance tenancy from dedicated to default",
      "resource tags",
    ],
    immutable: [
      "primary IPv4 CIDR block",
      "IPv4 CIDR allocated from an IPAM pool",
      "instance tenancy from default to dedicated",
      "the VPC ID assigned at creation",
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
    mutable: [
      "address space CIDR blocks (add, resize, remove)",
      "subnets (add, resize, remove)",
      "custom DNS server settings",
      "DDoS protection plan association",
      "virtual network peerings",
      "resource tags",
    ],
    immutable: [
      "region or location",
      "resource name",
      "the resource GUID assigned at creation",
      "deployment model (classic vs Resource Manager)",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Public + private subnets",
        blurb:
          "The everyday starting point: one VPC with a public subnet that reaches the internet and a private subnet that stays isolated. Reach for this when you want a web tier and a backend tier in a single network.",
        prompt:
          "Provision an Amazon VPC using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Create a VPC named intro-vpc with CIDR block 10.0.0.0/16, then add one public subnet (10.0.1.0/24) and one private subnet (10.0.2.0/24), an internet gateway attached to the VPC, and a route table sending 0.0.0.0/0 through the gateway for the public subnet. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Use tags to name each resource clearly so they are easy to find and clean up. When finished, print the VPC ID, subnet IDs, and internet gateway ID.",
      },
      {
        label: "Private-only network",
        blurb:
          "A fully isolated VPC with no internet gateway, so nothing inside can route to or from the public internet. Reach for this for internal-only workloads that talk to other resources over private links.",
        prompt:
          "Provision a private-only Amazon VPC using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Create a VPC named intro-private-vpc with CIDR block 10.1.0.0/16, then add two private subnets (10.1.1.0/24 and 10.1.2.0/24) with no internet gateway and no route to 0.0.0.0/0, leaving each subnet attached to a route table that keeps traffic local to the VPC. Do not create or attach an internet gateway or NAT gateway. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Use tags to name each resource clearly so they are easy to find and clean up. When finished, print the VPC ID, the subnet IDs, and the route table IDs.",
      },
      {
        label: "Two peered VPCs",
        blurb:
          "Two separate VPCs joined by a peering connection so resources in one can reach the other over private IPs. Reach for this when you need to connect isolated networks, such as separate environments or teams.",
        prompt:
          "Provision two peered Amazon VPCs using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Create a VPC named intro-vpc-a with CIDR block 10.10.0.0/16 and a VPC named intro-vpc-b with CIDR block 10.20.0.0/16, each with one private subnet, then create a VPC peering connection between them, accept it, and add routes on both sides so each VPC can reach the other's CIDR range through the peering connection. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Use tags to name each resource clearly so they are easy to find and clean up. When finished, print both VPC IDs, the subnet IDs, and the peering connection ID.",
      },
      {
        label: "Multi-AZ subnets",
        blurb:
          "Public and private subnets spread across two Availability Zones so a single zone failure does not take the whole tier down. Reach for this when you are building for high availability.",
        prompt:
          "Provision a multi-AZ Amazon VPC using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in, then list the available Availability Zones and pick the first two. Create a VPC named intro-ha-vpc with CIDR block 10.0.0.0/16, then add a public subnet and a private subnet in each of the two zones (10.0.1.0/24 and 10.0.2.0/24 in the first zone, 10.0.3.0/24 and 10.0.4.0/24 in the second), an internet gateway attached to the VPC, and a route table sending 0.0.0.0/0 through the gateway associated with both public subnets. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Use tags including the Availability Zone so each resource is easy to find and clean up. When finished, print the VPC ID, all subnet IDs grouped by zone, and the internet gateway ID.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "VNet with a secured subnet",
        blurb:
          "The everyday starting point: one virtual network with a single subnet locked down by a network security group. Reach for this when you want a simple, protected network to drop workloads into.",
        prompt:
          "Provision an Azure Virtual Network using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group named intro-rg if it does not exist, then create a virtual network named intro-vnet with address space 10.0.0.0/16 containing one subnet named app-subnet (10.0.1.0/24), and attach a network security group with sensible default deny-inbound rules. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming so the resources are easy to locate and remove later. When finished, print the virtual network resource ID, subnet ID, and the NSG ID.",
      },
      {
        label: "Private-only VNet",
        blurb:
          "A fully isolated virtual network with no public exposure, where the NSG denies all internet-bound traffic. Reach for this for internal-only workloads that communicate over private links.",
        prompt:
          "Provision a private-only Azure Virtual Network using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group named intro-private-rg if it does not exist, then create a virtual network named intro-private-vnet with address space 10.1.0.0/16 containing two subnets named app-subnet (10.1.1.0/24) and data-subnet (10.1.2.0/24), and attach a network security group whose rules deny all inbound and outbound internet traffic while allowing traffic within the VNet. Do not create any public IP addresses. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming so the resources are easy to locate and remove later. When finished, print the virtual network resource ID, both subnet IDs, and the NSG ID.",
      },
      {
        label: "Two peered VNets",
        blurb:
          "Two separate virtual networks joined by peering in both directions so resources in one can reach the other over private IPs. Reach for this when you need to connect isolated networks, such as separate environments or teams.",
        prompt:
          "Provision two peered Azure Virtual Networks using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group named intro-peer-rg if it does not exist, then create a virtual network named intro-vnet-a with address space 10.10.0.0/16 and one subnet, and a virtual network named intro-vnet-b with address space 10.20.0.0/16 and one subnet, then create virtual network peerings in both directions (a to b and b to a) with forwarded and virtual-network access allowed so each VNet can reach the other over private IPs. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming so the resources are easy to locate and remove later. When finished, print both virtual network resource IDs, the subnet IDs, and both peering IDs.",
      },
      {
        label: "Multi-zone subnets",
        blurb:
          "Public and private subnets ready for resources spread across Availability Zones, so a single zone failure does not take the whole tier down. Reach for this when you are building for high availability.",
        prompt:
          "Provision a zone-resilient Azure Virtual Network using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build, and confirm the location supports Availability Zones. Create a resource group named intro-ha-rg if it does not exist, then create a virtual network named intro-ha-vnet with address space 10.0.0.0/16 containing a public-facing subnet named web-subnet (10.0.1.0/24) and a private subnet named app-subnet (10.0.2.0/24), attach a network security group to each with sensible default rules, and note in the plan how workloads placed in these subnets will be spread across zones 1, 2, and 3 for resilience. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming so the resources are easy to locate and remove later. When finished, print the virtual network resource ID, both subnet IDs, and the NSG IDs.",
      },
    ],
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
        security={SECURITY[provider]}
        agent={AGENT[provider]}
      />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
