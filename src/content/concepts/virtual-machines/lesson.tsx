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
import { VmChapters } from "./chapters";

const concept = getConcept("virtual-machines");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is Amazon EC2?",
      href: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html",
      note: "EC2 as on-demand, scalable compute you rent by the second.",
    },
    {
      label: "Get started with Amazon EC2",
      href: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html",
      note: "Launch and connect to your first instance.",
    },
  ],
  azure: [
    {
      label: "Overview of virtual machines in Azure",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/overview",
      note: "What to decide before you create a VM: size, region, OS, disks.",
    },
    {
      label: "Quickstart: Create a Linux VM in the portal",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal",
      note: "Deploy an Ubuntu VM from the Azure portal.",
    },
  ],
};

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

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "Choosing the AMI, instance type, and key pair",
      "Guest OS patching, packages, and configuration",
      "Security group rules and network ACLs you attach",
      "IAM roles and instance profiles granting access",
      "Data on EBS volumes, snapshots, and backups",
      "Application code, runtime, and in-guest monitoring",
    ],
    providerManages: [
      "Physical hosts, racks, power, and cooling",
      "The hypervisor isolating tenants on shared hardware",
      "The regional network fabric and availability zones",
      "Hardware health, retirement, and instance recovery",
      "Physical data center security and access control",
    ],
  },
  azure: {
    youManage: [
      "Choosing the image, VM size, and SSH or admin credentials",
      "Guest OS patching, packages, and configuration",
      "Network security group rules and subnet placement",
      "Entra ID identities and Azure RBAC role assignments",
      "Data on managed disks, snapshots, and backups",
      "Application code, runtime, and in-guest monitoring",
    ],
    providerManages: [
      "Physical hosts, racks, power, and cooling",
      "The Azure hypervisor isolating tenants on shared hardware",
      "The regional network backbone and availability zones",
      "Hardware health, retirement, and service healing",
      "Physical data center security and access control",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    prompt:
      "Provision a single Amazon EC2 instance for me using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and check the configured region with `aws configure get region`.\nLaunch one t3.micro instance from the latest Amazon Linux 2023 AMI, tagged Name=intro-to-cloud-vm, in the default VPC, attached to a new security group that allows SSH (port 22) only from my current public IP.\nBefore running any command that creates, modifies, or deletes resources, print the full plan (AMI id, instance type, region, security group rules) and wait for my confirmation.\nAfter the instance is running, print the instance id, public IP or DNS name, and the security group id.",
  },
  azure: {
    cli: "az",
    prompt:
      "Provision a single Azure Virtual Machine for me using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm the target region (for example eastus) with me before continuing.\nCreate a resource group named intro-to-cloud-rg, then create one Standard_B1s Ubuntu 22.04 LTS VM named intro-to-cloud-vm with SSH key authentication, letting the command create the network security group and opening only port 22.\nBefore running any command that creates, modifies, or deletes resources, echo the full plan (VM size, image, resource group, region, NSG rules) and wait for my confirmation.\nAfter deployment, print the VM id, public IP address, and the resource group name.",
  },
};

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
      <VmChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
