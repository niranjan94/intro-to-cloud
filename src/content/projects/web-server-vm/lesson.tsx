import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import type {
  AgentSetup,
  ResponsibilitySplit,
  SecurityChecklist,
} from "@/components/lesson/lesson-reference";
import { ProjectShell } from "@/components/lesson/project-shell";
import { StackPanel } from "@/components/lesson/stack-panel";
import { getProject } from "@/content/projects";
import type { Provider } from "@/content/types";
import { WebServerChapters } from "./chapters";

const project = getProject("web-server-vm");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "Enable internet access with an internet gateway",
      href: "https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html",
      note: "What makes a subnet public, and why the instance still needs a public IP.",
    },
    {
      label: "Security group rules",
      href: "https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html",
      note: "A new security group allows nothing inbound until you add rules.",
    },
    {
      label: "Run commands at launch with user data",
      href: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html",
      note: "How a boot script installs nginx on the instance's first boot.",
    },
  ],
  azure: [
    {
      label: "Quickstart: Create a Linux VM with the Azure CLI",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-cli",
      note: "Create a VM with a public IP and open a port, end to end.",
    },
    {
      label: "Customize a Linux VM on first boot with cloud-init",
      href: "https://learn.microsoft.com/en-us/azure/virtual-machines/linux/tutorial-automate-vm-deployment",
      note: "The cloud-init file that installs nginx as the VM boots.",
    },
    {
      label: "Default outbound access in Azure",
      href: "https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access",
      note: "Why new VMs need an explicit outbound method, not the old implicit one.",
    },
  ],
};

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "the OS, patches, and the nginx install and config",
      "the page content nginx serves",
      "security group rules and which ports are open",
      "the key pair and who can SSH in",
      "the public IP or Elastic IP the server answers on",
      "instance type, cost, and when to stop it",
    ],
    providerManages: [
      "the physical host and hypervisor",
      "the software-defined network fabric",
      "availability of the Availability Zone",
      "the managed Internet Gateway plumbing",
      "physical security of the data centers",
    ],
    mutable: [
      "security group inbound and outbound rules",
      "instance type (stop, resize, start)",
      "the served page and nginx configuration",
      "an associated Elastic IP",
      "resource tags",
    ],
    immutable: [
      "the VPC and subnet the instance launched into",
      "the AMI the instance booted from",
      "the Availability Zone",
      "the instance ID assigned at launch",
    ],
  },
  azure: {
    youManage: [
      "the OS, patches, and the nginx install and config",
      "the page content nginx serves",
      "NSG rules and which ports are open",
      "the SSH keys and who can connect in",
      "the Public IP resource the server answers on",
      "VM size, cost, and when to deallocate it",
    ],
    providerManages: [
      "the physical host and hypervisor",
      "the software-defined network fabric",
      "availability of the region and zones",
      "the managed load-balancing and IP plumbing",
      "physical security of the data centers",
    ],
    mutable: [
      "NSG inbound and outbound rules",
      "VM size (deallocate, resize, start)",
      "the served page and nginx configuration",
      "an associated Public IP resource",
      "resource tags",
    ],
    immutable: [
      "the region and resource group location",
      "the VNet and subnet the VM was placed in",
      "the OS disk image the VM was created from",
      "the VM resource ID assigned at creation",
    ],
  },
};

const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "The security group is deny-by-default inbound: a newly created group has no inbound rules, so nothing reaches the instance until you add allow rules, and it is stateful, so return traffic for allowed requests flows back automatically. Amazon Linux AMIs already require an SSH key pair and block password logins. The sharp edges are the metadata endpoint (reachable from any process on the box) and EBS volumes, which stay unencrypted unless you opt in.",
    practices: [
      {
        risk: "Public exposure",
        label:
          "Restrict inbound SSH (port 22) to a known admin IP or CIDR, never 0.0.0.0/0.",
        why: "A rule that allows port 22 from 0.0.0.0/0 puts sshd in front of the entire internet, where automated bots run continuous credential and brute-force attempts. Scoping the source to a single office or VPN address means packets from every other origin are dropped before they reach the daemon. AWS Security Hub explicitly fails a security group that allows unrestricted ingress to port 22.",
      },
      {
        risk: "Credential theft (SSRF)",
        label:
          "Set the instance metadata service to IMDSv2-only (httpTokens required).",
        why: "IMDSv2 requires a PUT to obtain a session token before any metadata GET, and it rejects PUT requests that carry an X-Forwarded-For header, so the call cannot come through a proxy hop. This blocks the classic SSRF path where a tricked web app fetches the metadata endpoint and leaks the instance role's credentials. Leaving IMDSv1 enabled lets a single unauthenticated GET return those same credentials.",
      },
      {
        risk: "Long-lived credentials",
        label:
          "Attach a least-privilege IAM role through an instance profile instead of storing access keys on the box.",
        why: "An instance profile delivers temporary, automatically rotated credentials through the metadata service, so there is no static access key on disk to steal, leak in a commit, or forget to rotate. Scoping the role's policy to only the API calls the workload needs limits what an attacker can reach if the instance is compromised. Long-lived keys copied onto a server stay valid until someone notices and manually revokes them.",
      },
      {
        risk: "Data at rest",
        label:
          "Enable EBS encryption on the OS volume (turn on encryption by default for the Region).",
        why: "EBS encryption uses AES-256 with a KMS key to protect the volume, its snapshots, and the traffic between the instance and the volume, transparently to the OS. Without it, a copied or exposed snapshot is readable in plaintext by anyone who obtains it. Encryption is not automatic: unless you enable encryption by default for the Region, a volume launched without the encrypted flag is unencrypted.",
      },
      {
        risk: "Vulnerability exploitation",
        label: "Keep the OS and nginx patched on a regular cadence.",
        why: "A public web server is continuously probed for known vulnerabilities, and an unpatched package is an unauthenticated remote entry point no matter how tight the firewall is. AWS recommends Amazon Inspector to discover missing patches and unintended network exposure automatically. The longer a disclosed vulnerability sits unpatched on an internet-facing host, the wider the window for a working exploit.",
      },
      {
        risk: "Attack surface",
        label:
          "Keep the security group to ports 80 and 443 plus restricted 22, and expose no other management ports.",
        why: "Every open port is another service an attacker can reach and fingerprint, so the group should allow only the ports this build actually serves. AWS Security Hub flags unrestricted ingress to a long list of high-risk ports precisely because they widen exposure. For administrative access, Systems Manager Session Manager reaches the instance without opening any inbound port at all.",
      },
    ],
  },
  azure: {
    posture:
      "Inbound is deny-by-default: every NSG ends with a DenyAllInBound rule at priority 65500, and a VM with no NSG on its subnet or NIC receives no internet traffic at all. Managed OS disks are encrypted at rest out of the box with platform-managed keys. The sharp edges are the temp disk and disk caches that server-side encryption does not cover, the metadata identity endpoint reachable from any process on the box, and management ports if you open them to Any.",
    practices: [
      {
        risk: "Public exposure",
        label:
          "In the NSG, restrict inbound SSH (22) to a known admin IP, never Any or 0.0.0.0/0.",
        why: "An NSG rule that allows port 22 from Any exposes sshd to the whole internet, where brute-force and password-guessing bots run constantly. Narrowing the rule's source to a specific address means the DenyAllInBound default rule drops SSH attempts from every other origin. Microsoft Defender for Cloud flags any NSG inbound rule that allows access from any source IP.",
      },
      {
        risk: "Password brute force",
        label:
          "Authenticate over SSH with a key pair and keep password authentication disabled.",
        why: "SSH keys are long, machine-generated, and not human-chosen, so they resist the brute-force and credential-stuffing attacks that passwords fall to. When you create an Azure Linux VM with an SSH public key, Azure copies it to authorized_keys and disables the SSH server's password authentication by default. Re-enabling passwords on an internet-facing VM reopens the brute-force path that key-only auth closes.",
      },
      {
        risk: "Long-lived credentials",
        label:
          "Give the VM a managed identity instead of storing secrets or connection strings on it.",
        why: "A managed identity lets code on the VM request short-lived Microsoft Entra tokens from the local metadata endpoint, with Azure rotating the underlying credential, so no secret sits on disk to leak. The token request requires a Metadata: true header, which mitigates SSRF attempts to reach the endpoint through a tricked request. Static keys or connection strings placed on the box stay valid until manually rotated and are a prime target after any compromise.",
      },
      {
        risk: "Data at rest",
        label:
          "Rely on default managed-disk encryption, and enable encryption at host to also cover the temp disk and caches.",
        why: "Azure managed disks are encrypted at rest by default with platform-managed keys, so the OS disk is protected with no action from you. Server-side encryption does not, however, cover the temporary disk or the disk caches, where the OS can write swap, page memory, or spill crash dumps in plaintext. Enabling encryption at host extends encryption to that data end to end before it reaches storage.",
      },
      {
        risk: "Vulnerability exploitation",
        label:
          "Patch the OS and nginx yourself on a schedule; Azure does not do it for you.",
        why: "Azure does not push OS updates to your VM, so an unpatched internet-facing host accumulates known vulnerabilities that stay exploitable regardless of firewall rules. Azure Update Manager, or automatic VM guest patching, assesses and installs missing security and critical updates on a cadence you control. The longer a disclosed flaw sits unpatched on a public server, the wider the window for a working exploit.",
      },
      {
        risk: "Attack surface",
        label:
          "Do not leave management ports open to the internet; use just-in-time access or Bastion for admin.",
        why: "Every management port left open to Any is a standing target that attackers scan and probe around the clock. Just-in-time VM access keeps a deny rule on the NSG and inserts a temporary, higher-priority allow rule only when you request access, then removes it, so port 22 is closed by default. Azure Bastion goes further by brokering SSH over HTTPS, so the port is never exposed to the public internet.",
      },
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Public nginx web server",
        blurb:
          "The whole build in one go: a VPC with a public subnet, a security group opening the web ports, and an EC2 instance that installs nginx on first boot and serves a page.",
        prompt:
          "Provision a public nginx web server on AWS using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Create a VPC named intro-web-vpc (10.0.0.0/16), a public subnet (10.0.1.0/24), an internet gateway attached to the VPC, and a route table sending 0.0.0.0/0 through the gateway for that subnet. Create a security group that allows inbound TCP 80 and 443 from 0.0.0.0/0 and inbound TCP 22 from my current public IP only. Launch a t3.micro Amazon Linux 2023 instance into the public subnet with a public IP assigned and that security group attached, passing user data that runs `dnf install -y nginx`, writes `<h1>Hello from EC2</h1>` to /usr/share/nginx/html/index.html, and runs `systemctl enable --now nginx`. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Tag every resource clearly so it is easy to find and clean up. When finished, print the VPC ID, subnet ID, security group ID, instance ID, and the public IP, plus the http URL to open.",
      },
      {
        label: "Reuse my default VPC",
        blurb:
          "A faster path when you just want the server: skip building a network and launch into the account's existing default VPC, which already has a public subnet and internet gateway.",
        prompt:
          "Launch a public nginx web server into my existing default VPC using the aws CLI. First run `aws sts get-caller-identity` and confirm the region, then find the default VPC and one of its default (public) subnets. Create a security group in that VPC allowing inbound TCP 80 and 443 from 0.0.0.0/0 and inbound TCP 22 from my current public IP only. Launch a t3.micro Amazon Linux 2023 instance into the default subnet with a public IP and that security group, passing user data that runs `dnf install -y nginx`, writes a simple index.html to /usr/share/nginx/html, and runs `systemctl enable --now nginx`. Before running anything that creates or deletes resources, print the full plan and wait for me to confirm. Tag everything clearly. When finished, print the security group ID, instance ID, public IP, and the http URL.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Public nginx web server",
        blurb:
          "The whole build in one go: az vm create stands up the VNet, subnet, NIC, and public IP, cloud-init installs nginx on first boot, and one command opens port 80.",
        prompt:
          "Provision a public nginx web server on Azure using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group named intro-web-rg. Write a cloud-init file that installs nginx and writes `<h1>Hello from Azure</h1>` to /var/www/html/index.html. Run `az vm create` to create a VM named intro-web-vm from the Ubuntu2204 image in a new VNet and subnet, with `--public-ip-sku Standard`, `--generate-ssh-keys`, and `--custom-data` pointing at the cloud-init file. Then open inbound port 80 (for example with `az vm open-port --port 80`), and add an NSG rule allowing inbound TCP 22 from my current public IP only. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming so the resources are easy to locate and remove later. When finished, print the resource group, VM name, public IP address, and the http URL to open.",
      },
      {
        label: "Bring your own network",
        blurb:
          "More control: create the VNet, subnet, NSG, and public IP up front, then place the VM into them. Reach for this when the network already exists or must match a standard.",
        prompt:
          "Provision a public nginx web server on Azure into a network you create explicitly, using the az CLI. First run `az account show` and confirm the subscription and location. Create a resource group intro-web-rg, a VNet intro-web-vnet (10.0.0.0/16) with a subnet (10.0.1.0/24), and a network security group with inbound allow rules for TCP 80 and 443 from any source and TCP 22 from my current public IP only, associated with the subnet. Create a Standard public IP. Write a cloud-init file that installs nginx and writes a simple index.html to /var/www/html. Create an Ubuntu2204 VM placed in that subnet with the public IP attached, `--generate-ssh-keys`, and `--custom-data` pointing at the cloud-init file. Before running anything that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming. When finished, print the VNet ID, subnet ID, NSG ID, public IP, VM name, and the http URL.",
      },
    ],
  },
};

const BLURB =
  "Take the two foundations you already met and put them to work: stand up a virtual network, run a Linux VM inside it, install nginx, open exactly the right ports, and serve a page to the internet. It is the smallest complete cloud deployment, and every gate the request passes through is one you now understand.";

const ELEVATOR =
  "one Linux VM in a network you control, serving a page to the internet";

/**
 * The Web Server on a VM capstone. The heavy, interactive body lives in
 * WebServerChapters and is driven per provider (AWS and Azure diverge in how a
 * machine becomes reachable and how the firewall is shaped), while this shell
 * provides the shared framing and the cross-provider stack.
 */
export function WebServerLesson({ provider }: { provider: Provider }) {
  if (!project) return null;

  return (
    <ProjectShell project={project} provider={provider} blurb={BLURB}>
      <StackPanel
        provider={provider}
        aws={project.stack.aws ?? []}
        azure={project.stack.azure ?? []}
        elevator={ELEVATOR}
      />
      <WebServerChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        security={SECURITY[provider]}
        agent={AGENT[provider]}
      />
      <FurtherReading links={DOCS[provider]} />
    </ProjectShell>
  );
}
