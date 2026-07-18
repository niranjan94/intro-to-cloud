import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the virtual-machines lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "An EC2 instance boots into your VPC where AWS secures the hypervisor and physical host, but you own the guest OS, network exposure, credentials, and encryption: the default security group, the fact that instances accept legacy IMDSv1 by default, and EBS volumes that are unencrypted unless you ask are the sharp edges you must close yourself.",
    practices: [
      {
        risk: "Network exposure",
        label:
          "Scope security groups to least privilege and never open port 22 or 3389 to 0.0.0.0/0.",
        why: "A security group is a stateful virtual firewall evaluated on every packet reaching the instance, and the default group plus a wide-open SSH or RDP rule is the single most common path to compromise. Restrict inbound rules to specific source CIDRs and protocols so brute-force and scanning traffic from the public internet never reaches the guest OS. Instances that should not face the internet belong in private subnets reached through a bastion or NAT gateway.",
      },
      {
        risk: "Credential theft via SSRF",
        label:
          "Require IMDSv2 by setting HttpTokens to required on every instance.",
        why: "The Instance Metadata Service at 169.254.169.254 hands out the temporary credentials of the instance's IAM role, and by default an instance accepts both IMDSv1 and IMDSv2. IMDSv1 is a simple unauthenticated GET, so a server-side request forgery flaw or open reverse proxy can be tricked into fetching those credentials. IMDSv2 forces a session-oriented PUT to obtain a token first, which defeats the typical SSRF and open-firewall exfiltration path.",
      },
      {
        risk: "Long-lived secrets",
        label:
          "Attach an IAM role to the instance instead of baking access keys into the AMI or app config.",
        why: "An IAM role delivers automatically rotated, short-lived credentials through the metadata service, so no static access key ever lands on disk, in an environment variable, or in source control where it can leak. Grant the role only the permissions the workload needs, following least privilege. Embedded long-term keys, by contrast, are hard to rotate and become a durable liability the moment the instance or image is exposed.",
      },
      {
        risk: "Data at rest exposure",
        label:
          "Enable EBS encryption on volumes and turn on account-level EBS encryption by default.",
        why: "Attached EBS volumes and their snapshots are not encrypted unless you ask, so a shared or leaked snapshot can expose raw disk contents. Amazon EBS encryption uses AWS KMS keys to transparently encrypt data at rest, the volume, its snapshots, and disk I/O, with no key infrastructure for you to run. Turning on encryption by default at the account level closes the gap where a forgotten volume ships in plaintext.",
      },
      {
        risk: "Data in transit interception",
        label:
          "Use TLS for all API and application traffic and keep private-tier instances off the internet.",
        why: "AWS requires TLS 1.2 and recommends TLS 1.3 with perfect-forward-secrecy cipher suites such as ECDHE for calls to its published APIs, which prevents on-path interception and tampering of control-plane traffic. Apply the same standard to your own application listeners. Placing application and database tiers in private subnets with minimal route-table entries ensures sensitive traffic never traverses a public path in the first place.",
      },
      {
        risk: "Unpatched vulnerabilities",
        label:
          "Patch the guest OS and applications regularly and scan for CVEs with Amazon Inspector.",
        why: "In the shared responsibility model AWS patches the hypervisor but the guest operating system and everything you install on it is entirely yours to maintain. Keeping instances current on OS and application updates and using Amazon Inspector to automatically discover software vulnerabilities and unintended network exposure catches known, publicly documented flaws before an attacker does. Skipping this leaves exploitable CVEs running under your account.",
      },
    ],
  },
  azure: {
    posture:
      "An Azure VM deploys into your virtual network with managed disks encrypted at rest by default, but you retain Full Access to the guest OS and own network security groups, sign-in method, identity, and access control: an NSG is not attached automatically, and once attached its default rules deny inbound from the internet yet allow traffic from within the VNet and Azure Load Balancer, so exposed management ports are the edge you must lock down.",
    practices: [
      {
        risk: "Management port exposure",
        label:
          "Apply a Network Security Group to every subnet and NIC that restricts inbound management ports.",
        why: "A Network Security Group filters traffic by port, protocol, and source or destination IP, and while its default rules deny inbound traffic from the internet they allow traffic from within the virtual network and Azure Load Balancer. NSGs are not enabled automatically, so a subnet without one relies only on those defaults. Create explicit rules that block RDP (3389) and SSH (22) from untrusted networks so management planes are never reachable from the open internet.",
      },
      {
        risk: "Standing attack surface",
        label:
          "Enable Microsoft Defender for Cloud just-in-time (JIT) VM access to open management ports only on demand.",
        why: "JIT keeps inbound management ports closed with deny rules at the NSG level until an authorized user requests access, at which point Defender for Cloud verifies their Azure RBAC permissions and temporarily opens the port from their IP for a limited window, then restores the original rules. This shrinks the time an RDP or SSH port is exposed from always-on to minutes. Without it, an open management port is a permanent target for brute-force and scanning.",
      },
      {
        risk: "Credentials in code",
        label:
          "Use a managed identity for the VM to authenticate to Azure services instead of storing secrets.",
        why: "A managed identity gives the VM an automatically managed Microsoft Entra ID service principal, so code running on the machine requests a token from the Instance Metadata Service endpoint that is reachable only from within the VM and authenticates to services like Key Vault without any credentials in source or config. This removes the classic problem of secrets leaking onto developer workstations or into repositories. Pair it with Key Vault to hold any remaining secrets and certificates.",
      },
      {
        risk: "Password brute force",
        label:
          "Authenticate Linux VMs with SSH key pairs and avoid password sign-in.",
        why: "SSH key pairs use public-key cryptography so the private key never crosses the network, unlike passwords which stay vulnerable to brute-force attacks even over SSH, especially on internet-facing hosts. Creating the VM with an SSH public key makes Azure disable the SSH server's password authentication entirely, so there is no guessable secret to attack. This closes the most heavily automated attack against exposed Linux hosts.",
      },
      {
        risk: "Data at rest exposure",
        label:
          "Rely on managed disk server-side encryption and add customer-managed keys or Azure Disk Encryption where required.",
        why: "Azure managed disks automatically encrypt OS and data disks at rest with 256-bit AES server-side encryption using platform-managed keys, meeting a FIPS 140-2 baseline with nothing to configure. For stronger control you supply customer-managed keys in Key Vault, and Azure Disk Encryption adds OS-level encryption with BitLocker on Windows or dm-crypt on Linux. Customer-managed keys let you audit and revoke key use, which platform-managed keys alone do not.",
      },
      {
        risk: "Over-privileged access",
        label:
          "Assign Azure RBAC roles to segregate duties and grant only the VM permissions each user needs.",
        why: "Azure role-based access control lets you grant specific actions on a VM at a narrow scope rather than blanket administrative rights, so a compromised or careless account cannot perform operations outside its job. Limiting roles and scopes limits what is at risk if a security principal is ever compromised. Giving everyone unrestricted permissions turns any single credential compromise into full control of the resource.",
      },
    ],
  },
};
