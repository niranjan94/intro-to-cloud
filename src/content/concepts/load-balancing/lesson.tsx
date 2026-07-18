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
import { LoadBalancingChapters } from "./chapters";
import { SECURITY } from "./security";

const concept = getConcept("load-balancing");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is Elastic Load Balancing?",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
      note: "The umbrella service and its load balancer types.",
    },
    {
      label: "What is an Application Load Balancer?",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
      note: "Layer 7 concepts: listeners, rules, and target groups.",
    },
    {
      label: "What is a Network Load Balancer?",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html",
      note: "Layer 4: TCP and UDP, static IPs, and source IP preservation.",
    },
    {
      label: "Application Load Balancers",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html",
      note: "Subnet requirements and load balancer security groups.",
    },
    {
      label: "create-load-balancer (AWS CLI reference)",
      href: "https://docs.aws.amazon.com/cli/latest/reference/elbv2/create-load-balancer.html",
      note: "The elbv2 command and its --type and --scheme flags.",
    },
  ],
  azure: [
    {
      label: "What is Azure Load Balancer?",
      href: "https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview",
      note: "Layer 4 overview, SKUs, and the secure-by-default posture.",
    },
    {
      label: "What is Azure Application Gateway?",
      href: "https://learn.microsoft.com/en-us/azure/application-gateway/overview",
      note: "Layer 7 routing, TLS termination, and the WAF SKU.",
    },
    {
      label: "Load-balancing options",
      href: "https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/load-balancing-overview",
      note: "Choosing across global vs regional and HTTP(S) vs non-HTTP(S).",
    },
    {
      label: "Application Gateway infrastructure configuration",
      href: "https://learn.microsoft.com/en-us/azure/application-gateway/configuration-infrastructure",
      note: "The dedicated-subnet requirement and subnet sizing.",
    },
    {
      label: "az network lb (Azure CLI reference)",
      href: "https://learn.microsoft.com/en-us/cli/azure/network/lb",
      note: "The load balancer command and its create flags.",
    },
  ],
};

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "Load balancer type: Application (L7), Network (L4), or Gateway",
      "Listeners, listener rules, and target groups",
      "Which subnets it uses and internet-facing versus internal scheme",
      "Health check protocol, path, and thresholds",
      "TLS certificates, the listener security policy, and HTTP-to-HTTPS redirects",
      "Security groups and any AWS WAF web ACL",
    ],
    providerManages: [
      "The load balancer nodes and their scaling with traffic",
      "Spreading capacity across the Availability Zones you enable",
      "The health-check machinery and automatic failover",
      "Availability of the service and its DNS name",
      "Physical hosts, network fabric, and data center security",
    ],
    mutable: [
      "Listeners, rules, and target group membership",
      "Health check settings and target registration",
      "Certificates and the listener security policy",
      "Security groups and WAF association",
      "Cross-zone load balancing (always on for ALB; a toggle for NLB)",
      "Subnets and Availability Zones for an ALB, and tags",
    ],
    immutable: [
      "Load balancer type (Application, Network, or Gateway)",
      "Name assigned at creation",
      "Scheme: internet-facing versus internal",
      "The VPC the load balancer belongs to",
    ],
  },
  azure: {
    youManage: [
      "The service: Application Gateway (L7) or Azure Load Balancer (L4)",
      "Frontend IP configuration, public or private",
      "Backend pool membership and health probes",
      "Load balancing rules, or listeners, routing rules, and HTTP settings",
      "SKU choice (Standard) and the dedicated gateway subnet",
      "TLS certificates, the SSL policy, and any WAF policy",
    ],
    providerManages: [
      "The load balancing infrastructure and its scaling",
      "Zone redundancy where the region supports it",
      "The health-probe machinery and automatic failover",
      "Availability of the service and the frontend endpoint",
      "Physical hosts, network fabric, and data center security",
    ],
    mutable: [
      "Backend pool members and health probes",
      "Rules, listeners, and HTTP settings",
      "Certificates and the SSL policy",
      "WAF policy and mode (detection or prevention)",
      "Autoscaling minimum and maximum instances (Application Gateway v2)",
      "Tags",
    ],
    immutable: [
      "Region or location",
      "Resource name",
      "The virtual network and dedicated subnet an Application Gateway sits in",
      "Moving between SKU tiers, which is a migration rather than an in-place edit",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Public ALB, private targets",
        blurb:
          "The everyday web-facing setup: an internet-facing Application Load Balancer in public subnets forwarding HTTP to instances that stay in private subnets. Start here to expose an app without exposing the servers.",
        prompt:
          "Provision an internet-facing Application Load Balancer using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Assume a VPC with at least two public subnets in different Availability Zones and a private subnet with a couple of instances; if they do not exist, create a minimal set. Create a security group for the load balancer allowing inbound 80 and 443, a target group for HTTP on port 80 with a health check on /, and register the instances. Then create the load balancer with `aws elbv2 create-load-balancer --type application --scheme internet-facing --subnets <two public subnet ids> --security-groups <lb sg id>`, add an HTTP listener that forwards to the target group, and lock the instances' security group so it accepts traffic only from the load balancer's security group. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Tag every resource clearly for easy cleanup. When finished, print the load balancer ARN, its DNS name, the target group ARN, and the listener ARN.",
      },
      {
        label: "Network Load Balancer (Layer 4)",
        blurb:
          "A Layer 4 balancer for raw TCP or UDP: ultra-low latency and huge throughput, but no path or host routing. Reach for this for non-HTTP protocols or when you need a static IP front door.",
        prompt:
          "Provision an internet-facing Network Load Balancer using the aws CLI. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Create a target group of type instance for TCP on port 443 with a TCP health check, and register the targets. Then create the load balancer with `aws elbv2 create-load-balancer --type network --scheme internet-facing --subnets <public subnet ids>`, and add a TCP listener on 443 that forwards to the target group. Note in the plan that a Network Load Balancer works at Layer 4 and cannot route on the URL path, and that cross-zone load balancing is disabled by default on an NLB. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Tag every resource clearly for easy cleanup. When finished, print the load balancer ARN, its DNS name, and the target group ARN.",
      },
      {
        label: "Internal ALB between tiers",
        blurb:
          "An Application Load Balancer with only private IPs, for balancing traffic between private tiers such as a web tier calling a backend tier. It never touches the internet.",
        prompt:
          "Provision an internal Application Load Balancer using the aws CLI, for balancing traffic between private tiers. First run `aws sts get-caller-identity` and confirm the configured region so I know which account and region you will build in. Create a security group and a target group on port 80, and register the backend instances. Then create the load balancer with `aws elbv2 create-load-balancer --type application --scheme internal --subnets <two private subnet ids> --security-groups <lb sg id>`, and add an HTTP listener that forwards to the target group. Note in the plan that the load balancer will have only private IPs and will not be reachable from the internet. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Tag every resource clearly for easy cleanup. When finished, print the load balancer ARN, its private DNS name, and the target group ARN.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Application Gateway, private backends",
        blurb:
          "The everyday web-facing setup: a Layer 7 Application Gateway with a public frontend IP forwarding to VMs that have no public IP. Start here to expose an app without exposing the servers.",
        prompt:
          'Provision an Azure Application Gateway using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group if needed, a virtual network with a dedicated subnet named appgw-subnet for the gateway and a separate backend-subnet for the servers, and a Standard public IP. Create the backend VMs in backend-subnet with no public IP (pass `--public-ip-address ""`). Then create the gateway with `az network application-gateway create --sku Standard_v2 --capacity 2 --public-ip-address <public ip name> --vnet-name <vnet> --subnet appgw-subnet --servers <backend private ips> --priority 100`. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming for easy cleanup. When finished, print the gateway resource ID, its public IP address, and the backend pool name.',
      },
      {
        label: "Public Load Balancer (Layer 4)",
        blurb:
          "A Layer 4 Azure Load Balancer for raw TCP or UDP: ultra-low latency and huge throughput, but no path or host routing. Reach for this for non-HTTP protocols or extreme scale.",
        prompt:
          "Provision a public Azure Load Balancer using the az CLI. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group if needed and a Standard public IP, then create the load balancer with `az network lb create -g <rg> -n <name> --sku Standard --public-ip-address <public ip name> --frontend-ip-name frontend --backend-pool-name backend`. Add a health probe on TCP 80 and a load balancing rule mapping frontend port 80 to backend port 80, and add backend VMs with no public IP to the backend pool. Note in the plan that a Standard load balancer is closed to inbound by default, so a network security group must allow the traffic, and that this Layer 4 balancer cannot route on the URL path. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming for easy cleanup. When finished, print the load balancer resource ID, the public IP address, and the backend pool name.",
      },
      {
        label: "Internal Load Balancer",
        blurb:
          "An Azure Load Balancer with a private frontend IP, for balancing a private tier inside the virtual network. It never touches the internet.",
        prompt:
          "Provision an internal Azure Load Balancer using the az CLI, for balancing a private tier inside a virtual network. First run `az account show` and confirm the active subscription and default location so I know where you will build. Create a resource group and a virtual network with a subnet if needed, then create the load balancer with `az network lb create -g <rg> -n <name> --sku Standard --vnet-name <vnet> --subnet <subnet> --frontend-ip-name internal-frontend --backend-pool-name backend`, giving it a private frontend IP and no public IP. Add a health probe and a load balancing rule, and add the private VMs to the backend pool. Note in the plan that the balancer will have only a private IP and will never touch the internet. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. Use consistent naming for easy cleanup. When finished, print the load balancer resource ID, its private frontend IP, and the backend pool name.",
      },
    ],
  },
};

const BLURB =
  "Put one address in front of many servers. A load balancer takes every request at a single front door, spreads it across a pool of identical servers, checks their health, and routes around the ones that fail. Work at Layer 4 and it forwards raw connections by IP and port; work at Layer 7 and it reads the HTTP request and routes by path or host. Either way it can be the only thing on the public internet, while your servers stay private behind it.";

const ELEVATOR =
  "one front door that spreads traffic across many servers and keeps the servers off the public internet";

const TERMS: GlossaryTerm[] = [
  {
    term: "ALB / Application Gateway",
    definition: "The Layer 7, HTTP-aware load balancer that routes on content.",
  },
  {
    term: "NLB / Azure Load Balancer",
    definition:
      "The Layer 4 balancer that forwards TCP and UDP by IP and port.",
  },
  {
    term: "Target group / Backend pool",
    definition:
      "The set of interchangeable servers the balancer sends traffic to.",
  },
  {
    term: "Health check / Health probe",
    definition: "The periodic test that decides whether a server gets traffic.",
  },
  {
    term: "Listener rule / Routing rule",
    definition: "A Layer 7 condition on path or host that picks a target.",
  },
  {
    term: "TLS termination",
    definition:
      "Decrypting HTTPS at the balancer so it can read and route the request.",
  },
  {
    term: "Internet-facing / Public frontend",
    definition:
      "A public address on the balancer; targets can stay private behind it.",
  },
  {
    term: "Internal / Private frontend",
    definition:
      "A balancer with only private IPs, for traffic between internal tiers.",
  },
];

/**
 * The Load Balancing lesson. The interactive body lives in
 * LoadBalancingChapters and is driven per provider: AWS and Azure diverge most
 * in how the two layers map to services (AWS picks a type under one service;
 * Azure uses two services), which the chapters make concrete. This shell
 * provides the shared concept framing, the cross-provider equivalence, the
 * glossary, and links to the authoritative documentation for the active lens.
 */
export function LoadBalancingLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Elastic Load Balancing", code: "elbv2 · ALB / NLB" }}
        azure={{
          service: "Load Balancer + App Gateway",
          code: "Microsoft.Network",
        }}
        elevator={ELEVATOR}
      />
      <LoadBalancingChapters
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
