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
import { SECURITY } from "./security";

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
    {
      label: "Amazon EC2 key pairs and Linux instances",
      href: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html",
      note: "EC2 stores the public key and places it in authorized_keys at first boot; you keep the private key.",
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
    {
      label: "Detailed steps: create and manage SSH keys",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/linux/create-ssh-keys-detailed",
      note: "Azure copies your public key onto the VM; the private key stays on your machine.",
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
  {
    term: "Public / private key",
    definition:
      "The two halves of an SSH key pair. The public half goes on the machine; the private half stays with you.",
  },
  {
    term: "authorized_keys",
    definition:
      "The file (~/.ssh/authorized_keys) listing the public keys allowed to log in as a user.",
  },
  {
    term: "cloud-init",
    definition:
      "The first-boot agent that writes your public key into the machine. Azure may use waagent instead.",
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
    mutable: [
      "Instance type (stop, then resize)",
      "Attached security groups",
      "IAM instance profile",
      "User data script",
      "Detailed CloudWatch monitoring",
      "Tags",
    ],
    immutable: [
      "AMI the instance booted from",
      "Key pair name",
      "CPU core and thread count",
      "Primary private IP address",
      "Subnet and availability zone placement",
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
    mutable: [
      "VM size (resize)",
      "OS and data disk size (grow only)",
      "Attached data disks",
      "Network interfaces and IP configuration",
      "Boot diagnostics and user data",
      "Tags",
    ],
    immutable: [
      "Availability set membership",
      "Availability zone assignment",
      "Computer name and admin username",
      "OS type (Windows or Linux)",
      "Region and resource location",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Single instance, SSH only",
        blurb:
          "The simplest starting point: one small on-demand instance in the default VPC, reachable over SSH from just your IP. Reach for this when you want a plain box to log into and experiment.",
        prompt:
          "Provision a single Amazon EC2 instance for me using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and check the configured region with `aws configure get region`.\nLaunch one t3.micro instance from the latest Amazon Linux 2023 AMI, tagged Name=intro-to-cloud-vm, in the default VPC, attached to a new security group that allows SSH (port 22) only from my current public IP.\nBefore running any command that creates, modifies, or deletes resources, print the full plan (AMI id, instance type, region, security group rules) and wait for my confirmation.\nAfter the instance is running, print the instance id, public IP or DNS name, and the security group id.",
      },
      {
        label: "Instance + data disk",
        blurb:
          "One instance with a separate EBS volume attached for persistent data that survives instance replacement. Reach for this when the OS disk is not enough and you want state kept apart from the boot volume.",
        prompt:
          "Provision a single Amazon EC2 instance with an extra attached data disk for me using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and check the configured region with `aws configure get region`.\nLaunch one t3.micro instance from the latest Amazon Linux 2023 AMI, tagged Name=intro-to-cloud-vm, in the default VPC, attached to a new security group that allows SSH (port 22) only from my current public IP, then create a 20 GiB gp3 EBS volume tagged Name=intro-to-cloud-data in the same availability zone and attach it to the instance as /dev/sdf.\nBefore running any command that creates, modifies, or deletes resources, print the full plan (AMI id, instance type, region, security group rules, volume size and type, attach device) and wait for my confirmation.\nAfter the instance is running and the volume is attached, print the instance id, public IP or DNS name, the security group id, and the EBS volume id.",
      },
      {
        label: "Auto Scaling behind an ALB",
        blurb:
          "A launch template driving an Auto Scaling group behind an Application Load Balancer, so traffic spreads across instances and capacity tracks demand. Reach for this when you need resilience and horizontal scale rather than a single box.",
        prompt:
          "Provision an autoscaling Amazon EC2 fleet behind a load balancer for me using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and check the configured region with `aws configure get region`.\nCreate a launch template named intro-to-cloud-lt using the latest Amazon Linux 2023 AMI and t3.micro instances, a security group allowing HTTP (port 80) from anywhere and SSH (port 22) only from my current public IP, then create an internet-facing Application Load Balancer named intro-to-cloud-alb with a target group across two subnets in the default VPC, and an Auto Scaling group named intro-to-cloud-asg with min 2, max 4, desired 2 instances attached to that target group. Tag every resource Project=intro-to-cloud so cleanup is easy.\nBefore running any command that creates, modifies, or deletes resources, print the full plan (launch template, instance type, security group rules, load balancer, target group, scaling min/max/desired) and wait for my confirmation.\nAfter the fleet is up, print the launch template id, Auto Scaling group name, load balancer ARN and DNS name, target group ARN, and the security group id.",
      },
      {
        label: "Spot instance for batch",
        blurb:
          "A single Spot instance that trades interruption risk for a steep discount, sized for a throwaway batch job. Reach for this when the work is interruptible and cost matters more than guaranteed uptime.",
        prompt:
          "Provision a single cheap Amazon EC2 Spot instance for a batch job for me using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and check the configured region with `aws configure get region`.\nLaunch one t3.micro Spot instance (one-time request, interruption behavior terminate) from the latest Amazon Linux 2023 AMI, tagged Name=intro-to-cloud-batch, in the default VPC, attached to a new security group that allows SSH (port 22) only from my current public IP.\nBefore running any command that creates, modifies, or deletes resources, print the full plan (AMI id, instance type, Spot request type and max price if set, region, security group rules) and wait for my confirmation.\nAfter the instance is running, print the instance id, the Spot instance request id, public IP or DNS name, and the security group id.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Single VM, SSH only",
        blurb:
          "The simplest starting point: one small VM in a fresh resource group, reachable over SSH on port 22. Reach for this when you want a plain box to log into and experiment.",
        prompt:
          "Provision a single Azure Virtual Machine for me using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm the target region (for example eastus) with me before continuing.\nCreate a resource group named intro-to-cloud-rg, then create one Standard_B1s Ubuntu 22.04 LTS VM named intro-to-cloud-vm with SSH key authentication, letting the command create the network security group and opening only port 22.\nBefore running any command that creates, modifies, or deletes resources, echo the full plan (VM size, image, resource group, region, NSG rules) and wait for my confirmation.\nAfter deployment, print the VM id, public IP address, and the resource group name.",
      },
      {
        label: "VM + data disk",
        blurb:
          "One VM with an extra managed data disk attached for persistent data kept apart from the OS disk. Reach for this when the OS disk is not enough and you want state that survives on its own volume.",
        prompt:
          "Provision a single Azure Virtual Machine with an extra attached data disk for me using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm the target region (for example eastus) with me before continuing.\nCreate a resource group named intro-to-cloud-rg, then create one Standard_B1s Ubuntu 22.04 LTS VM named intro-to-cloud-vm with SSH key authentication, letting the command create the network security group and opening only port 22, and attach a new 32 GiB Standard_LRS managed data disk named intro-to-cloud-data to the VM.\nBefore running any command that creates, modifies, or deletes resources, echo the full plan (VM size, image, resource group, region, NSG rules, data disk size and SKU) and wait for my confirmation.\nAfter deployment, print the VM id, public IP address, the managed data disk id, and the resource group name.",
      },
      {
        label: "Scale set behind a load balancer",
        blurb:
          "A Virtual Machine Scale Set behind an Azure Load Balancer, so traffic spreads across instances and capacity tracks demand. Reach for this when you need resilience and horizontal scale rather than a single VM.",
        prompt:
          "Provision an Azure Virtual Machine Scale Set behind a load balancer for me using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm the target region (for example eastus) with me before continuing.\nCreate a resource group named intro-to-cloud-rg, then create a Virtual Machine Scale Set named intro-to-cloud-vmss using Standard_B1s instances and the Ubuntu 22.04 LTS image with SSH key authentication and an instance count of 2, letting the command create and wire up a Standard Azure Load Balancer, and configure an autoscale profile on the scale set with min 2, max 4, default 2 instances. Tag every resource project=intro-to-cloud so cleanup is easy.\nBefore running any command that creates, modifies, or deletes resources, echo the full plan (VM size, image, resource group, region, instance count, load balancer, autoscale min/max/default) and wait for my confirmation.\nAfter deployment, print the scale set id, the load balancer public IP address, the autoscale setting name, and the resource group name.",
      },
      {
        label: "Spot VM for batch",
        blurb:
          "A single Spot VM that trades eviction risk for a steep discount, sized for a throwaway batch job. Reach for this when the work is interruptible and cost matters more than guaranteed uptime.",
        prompt:
          "Provision a single cheap Azure Spot Virtual Machine for a batch job for me using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm the target region (for example eastus) with me before continuing.\nCreate a resource group named intro-to-cloud-rg, then create one Standard_B1s Ubuntu 22.04 LTS Spot VM named intro-to-cloud-batch with priority Spot, eviction policy Delete, and max price -1 (pay up to the on-demand rate), with SSH key authentication, letting the command create the network security group and opening only port 22.\nBefore running any command that creates, modifies, or deletes resources, echo the full plan (VM size, image, resource group, region, priority, eviction policy, max price, NSG rules) and wait for my confirmation.\nAfter deployment, print the VM id, public IP address, and the resource group name.",
      },
    ],
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
        security={SECURITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
