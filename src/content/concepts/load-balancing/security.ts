import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the load-balancing lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own documentation (docs.aws.amazon.com and learn.microsoft.com)
 * and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "A load balancer is a deliberate front door, so most of its security is in how you place and configure it: expose only the balancer and keep targets private, terminate TLS on the balancer, and lock the targets' security group to accept traffic only from it. An Application Load Balancer has its own security group; a Network Load Balancer can now have one too.",
    practices: [
      {
        risk: "Server exposure",
        label:
          "Give the load balancer the internet-facing scheme in public subnets and keep every target in a private subnet with no public IP.",
        why: "An internet-facing load balancer is the only resource that needs a public address. Placing targets in private subnets, with no route from the internet gateway to them, means an attacker cannot open a connection to a server directly; the balancer is the single entry point you can monitor and defend. This is the pattern AWS documents for an ALB open to the internet.",
      },
      {
        risk: "Lateral reachability",
        label:
          "Scope the load balancer's security group to its listener ports, and set the targets' security group to allow traffic only from the load balancer's security group.",
        why: "Referencing the load balancer's security group as the source in the targets' inbound rule means only the balancer can reach the targets, even for other resources inside the same VPC. Without this, any host that can route to a target's private IP could hit the application port directly and bypass the controls the balancer enforces.",
      },
      {
        risk: "Traffic interception",
        label:
          "Add an HTTPS listener with a certificate from AWS Certificate Manager and redirect HTTP to HTTPS.",
        why: "Terminating TLS on the load balancer encrypts traffic between the client and the balancer, and ACM issues and auto-renews the certificate so it does not silently expire. A listener rule that redirects port 80 to port 443 ensures a client cannot stay on plaintext HTTP, where an on-path attacker could read cookies or tamper with responses.",
      },
      {
        risk: "Application-layer attacks",
        label:
          "Associate AWS WAF with the Application Load Balancer to filter malicious HTTP requests.",
        why: "AWS WAF inspects each HTTP request at Layer 7 and can block common exploits such as SQL injection and cross-site scripting before they reach a target. This only works on a Layer 7 balancer: a Network Load Balancer never reads the request body, so if you need a web firewall you need the ALB.",
      },
      {
        risk: "Weak TLS",
        label:
          "Choose a modern predefined security policy on the HTTPS listener.",
        why: "The listener's security policy decides which TLS protocol versions and cipher suites the balancer accepts. Selecting a current policy refuses the outdated TLS 1.0 and 1.1 versions and weak ciphers that older policies still permit, closing downgrade attacks without touching the targets.",
      },
      {
        risk: "No forensic trail",
        label:
          "Enable access logs to an S3 bucket so every request is recorded.",
        why: "Elastic Load Balancing access logs capture the client address, request path, target, and latency for each request, which is the record you need to investigate an incident or abuse. They are turned off by default, so without enabling them there is nothing to look back on after the fact.",
      },
    ],
  },
  azure: {
    posture:
      "The Standard SKU is secure by default: Standard load balancers and public IPs are closed to inbound traffic until a network security group explicitly allows it, on a Zero Trust model. (The old Basic SKU was open by default and was retired on 30 September 2025.) The rest is placement and configuration: keep backends private, terminate TLS on the gateway, and reach for the WAF SKU for HTTP protection.",
    practices: [
      {
        risk: "Server exposure",
        label:
          "Give only the frontend a public IP and create backend VMs with no public IP in a separate subnet.",
        why: "The public frontend IP on a load balancer or Application Gateway is the only address the internet needs. Creating backend VMs with no public IP, in their own subnet, means a packet from the internet has no path to them directly; traffic can arrive only through the frontend, which shrinks the attack surface to one controlled door.",
      },
      {
        risk: "Default-open inbound",
        label:
          "Use the Standard SKU and gate all inbound traffic with a network security group.",
        why: "Standard load balancers and their public IPs are closed to inbound connections by default, so an NSG must explicitly permit the ports you intend to serve; traffic is dropped if no NSG allows it. The retired Basic SKU was open by default, which is why new work should start on Standard and lean on its secure-by-default posture.",
      },
      {
        risk: "Traffic interception",
        label:
          "Terminate TLS on the Application Gateway listener and redirect HTTP to HTTPS.",
        why: "An HTTPS listener encrypts traffic between the client and the gateway using a certificate you supply, and a redirect from the HTTP listener keeps clients from staying on plaintext where an on-path attacker could read or alter it. This is a Layer 7 capability: Azure Load Balancer passes bytes through and cannot terminate TLS for you.",
      },
      {
        risk: "Application-layer attacks",
        label:
          "Deploy the WAF SKU of Application Gateway to filter malicious HTTP requests.",
        why: "The Web Application Firewall SKU inspects each HTTP request at Layer 7 and blocks common attacks such as SQL injection and cross-site scripting before they reach a backend. Azure Load Balancer works at Layer 4 and never reads the request, so a web firewall is only possible on the Layer 7 gateway.",
      },
      {
        risk: "Weak TLS",
        label: "Apply a modern TLS policy on the gateway's listener.",
        why: "Application Gateway lets you set a predefined or custom SSL policy that fixes the minimum TLS version and the allowed ciphers. Choosing a current policy refuses TLS 1.0 and 1.1 and weak ciphers that clients might otherwise negotiate, closing downgrade attacks at the frontend.",
      },
      {
        risk: "No forensic trail",
        label:
          "Turn on diagnostic and access logs so requests and firewall events are recorded.",
        why: "Access logs capture each request the frontend handles, and, on the WAF SKU, firewall logs record what was matched and blocked. These are the records you need to investigate an incident, and they are not all on by default, so enabling them is what gives you something to review afterward.",
      },
    ],
  },
};
