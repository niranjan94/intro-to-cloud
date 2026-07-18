import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the virtual-network lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "A VPC is logically isolated with no inbound internet path by default, but the moment you attach an internet gateway, a public IP, and a permissive route or security group you create exposure: you own security group rules, subnet placement, IAM over who can change them, and turning on logging.",
    practices: [
      {
        risk: "Open management ports",
        label:
          "Keep security groups least-privilege and never open SSH (22) or RDP (3389) to 0.0.0.0/0.",
        why: "Security groups are stateful, allow-only firewalls attached to each elastic network interface and are the primary access control in a VPC. A rule with source 0.0.0.0/0 on port 22 or 3389 lets anyone on the internet reach the instance and brute-force it, so scope each rule to a specific source CIDR or a referencing security group and split groups by function so one loose rule does not widen access everywhere.",
      },
      {
        risk: "Direct internet exposure",
        label:
          "Put instances that should not be internet-reachable in private subnets and egress through a NAT gateway or bastion.",
        why: "A subnet is public only because its route table sends 0.0.0.0/0 to an internet gateway and its instances carry public IPs, which makes everything in it reachable inbound. Placing application and database tiers in private subnets removes the inbound path entirely, while a NAT gateway gives outbound-only internet and a bastion host mediates administrative access.",
      },
      {
        risk: "Traffic over public internet",
        label:
          "Reach AWS services through VPC endpoints and AWS PrivateLink instead of the public internet.",
        why: "By default, calls from your instances to AWS service APIs leave through an internet or NAT gateway and traverse the public internet. A VPC interface endpoint (PrivateLink) gives the service a private IP inside your VPC so traffic stays on the AWS network and needs no internet gateway or NAT device, which lets you keep the subnet private and attach endpoint policies that restrict which principals and resources the endpoint will serve.",
      },
      {
        risk: "Unauthorized rule changes",
        label:
          "Use IAM to restrict which principals can create or modify security groups, network ACLs, and routes.",
        why: "Anyone holding broad EC2 or VPC permissions can rewrite a security group or route table and silently open the network. Scope IAM policies so only specific roles can change network controls, and use identity federation and IAM roles rather than long-lived users, so every network change is least-privilege and auditable.",
      },
      {
        risk: "No traffic visibility",
        label:
          "Turn on VPC Flow Logs to CloudWatch Logs or Amazon S3 so accepted and rejected connections are recorded.",
        why: "A VPC keeps no record of accepted or rejected connections unless you enable Flow Logs, so without them you cannot investigate an incident or spot data exfiltration. Flow Logs capture source, destination, ports, and the accept or reject decision at the VPC, subnet, or interface level, which also exposes overly permissive or overly restrictive rules and provides a foundational data source that Amazon GuardDuty analyzes for threat detection.",
      },
      {
        risk: "Single control failure",
        label:
          "Add network ACLs as a stateless subnet-level guardrail behind your security groups.",
        why: "A security group only protects an instance that was launched with the correct group attached, whereas a network ACL applies to the entire subnet regardless. Network ACLs therefore catch instances launched without the right group and can explicitly deny known-bad traffic, which security groups cannot do because they are allow-only. Use them as coarse defense in depth, not as the primary control.",
      },
    ],
  },
  azure: {
    posture:
      "A VNet isolates your resources and NSG default rules allow intra-VNet traffic while blocking most inbound internet traffic, but Azure PaaS services such as Storage and SQL ship with public endpoints on by default and subnets have default outbound internet access, so you own private endpoints, NSG rules, and RBAC over who can change them.",
    practices: [
      {
        risk: "Lateral movement",
        label:
          "Apply NSGs with Application Security Groups to subnets and NICs using deny-by-default rules.",
        why: "A Network Security Group is a stateful Layer 4 filter evaluated by priority on source and destination IP, port, and protocol, and its default rules allow all traffic within the VNet, which lets an attacker who lands on one VM move laterally to others. Apply NSGs at both subnet and NIC level with a permit-by-exception baseline, and use Application Security Groups to write rules against application tiers instead of brittle IP lists.",
      },
      {
        risk: "Public PaaS endpoints",
        label:
          "Access Azure PaaS such as Storage and SQL through Private Endpoints and disable public network access.",
        why: "Azure PaaS services are created with an internet-facing public endpoint by default, so your data sits only a leaked key or a firewall rule away from public exposure. A Private Endpoint is a network interface with a private IP from your VNet that connects to the service over Azure Private Link so traffic stays on the Azure backbone, and setting the service public network access to Disabled ensures the public endpoint can no longer be used at all.",
      },
      {
        risk: "Exposed RDP/SSH",
        label:
          "Use Azure Bastion for RDP and SSH instead of assigning public IPs to VMs.",
        why: "Attaching a public IP and opening 3389 or 22 exposes a VM to constant internet scanning and brute-force attempts. Azure Bastion is a managed PaaS jump host deployed inside your VNet that brokers RDP and SSH over TLS on port 443, so VMs need no public IP and their management ports stay closed to the internet, which protects them from port scanning and shrinks the attack surface.",
      },
      {
        risk: "Over-privileged network edits",
        label:
          "Configure Azure RBAC on network resources with a least-privilege, no-access-by-default mindset.",
        why: "If broad roles like Contributor can edit NSGs, route tables, and peerings, any of those principals can open the network or reroute traffic through a malicious appliance. Assign narrowly scoped built-in roles such as Network Contributor only to those whose job requires them, so changes to security-relevant network settings stay limited and auditable.",
      },
      {
        risk: "No traffic visibility",
        label:
          "Enable Virtual Network flow logs with Traffic Analytics for monitoring and forensics.",
        why: "Without flow logging there is no record of which connections were allowed or denied, so you cannot detect anomalies or reconstruct an incident. Virtual Network flow logs, the successor to the retiring NSG flow logs, capture IP traffic through a VNet to a storage account, and Traffic Analytics processes them in Azure Monitor Log Analytics to visualize flows and surface suspicious patterns such as traffic to known-malicious IP addresses.",
      },
      {
        risk: "Unencrypted east-west traffic",
        label:
          "Enable Virtual Network encryption to protect data in transit between VMs.",
        why: "Traffic between VMs in a VNet, and across peered VNets, is not encrypted at the network layer by default, so anyone able to tap the path could read it. Virtual Network encryption builds a DTLS tunnel that encrypts private-IP-to-private-IP traffic between supported VMs and scale sets within a VNet and across regionally and globally peered VNets, so plan for its requirements: it needs supported VM sizes and Accelerated Networking enabled, and traffic to unsupported VMs stays unencrypted.",
      },
    ],
  },
};
