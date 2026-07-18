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
import { DnsChapters } from "./chapters";

const concept = getConcept("dns");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "Working with public hosted zones",
      href: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/AboutHZWorkingWith.html",
      note: "How a hosted zone holds records and gets its four name servers.",
    },
    {
      label: "Choosing between alias and non-alias records",
      href: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html",
      note: "Why alias records work at the zone apex and how they differ from CNAMEs.",
    },
    {
      label: "Choosing a routing policy",
      href: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html",
      note: "Simple, weighted, latency, failover, geolocation, and the rest.",
    },
    {
      label: "Supported DNS record types",
      href: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/ResourceRecordTypes.html",
      note: "A, AAAA, CNAME, MX, TXT, NS, and every other type Route 53 supports.",
    },
  ],
  azure: [
    {
      label: "Overview of DNS zones and records",
      href: "https://learn.microsoft.com/en-us/azure/dns/dns-zones-records",
      note: "Zones, record sets, TTL on the set, and the supported record types.",
    },
    {
      label: "Azure DNS alias records overview",
      href: "https://learn.microsoft.com/en-us/azure/dns/dns-alias",
      note: "Apex-safe alias record sets that track an Azure resource.",
    },
    {
      label: "Traffic Manager routing methods",
      href: "https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-routing-methods",
      note: "Priority, weighted, performance, geographic, multivalue, and subnet.",
    },
    {
      label: "Delegate a domain to Azure DNS",
      href: "https://learn.microsoft.com/en-us/azure/dns/dns-delegate-domain-azure-dns",
      note: "Point a parent zone's NS records at all four Azure DNS name servers.",
    },
  ],
};

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "The hosted zone and every record set it holds",
      "Record values, types, TTLs, and routing policies",
      "Delegating the domain by setting the registrar's NS records",
      "Health checks and failover configuration for routed records",
      "Access control through IAM policies on Route 53 actions",
      "DNSSEC signing enablement and key-signing key management",
    ],
    providerManages: [
      "The four authoritative name servers assigned to each zone",
      "Global anycast network answering queries near the client",
      "Query capacity, scaling, and DDoS resilience of the fleet",
      "Availability and durability of the DNS service itself",
      "Underlying servers, patching, and physical infrastructure",
    ],
    mutable: [
      "Record values (ResourceRecords)",
      "Record TTL",
      "Routing policy, alias target, health check",
      "Hosted zone comment",
      "Hosted zone tags",
      "Private zone VPC associations",
    ],
    immutable: [
      "Hosted zone domain name",
      "Record set name",
      "Record type",
      "Hosted zone a record belongs to",
      "Assigned name servers (delegation set)",
    ],
  },
  azure: {
    youManage: [
      "The DNS zone and every record set it holds",
      "Record values, types, TTL on each set, and alias targets",
      "Delegating the domain by pointing the parent NS records",
      "Access control through Azure RBAC and Entra identities",
      "Traffic Manager profiles when you need routing methods",
      "DNSSEC signing enablement on the zone",
    ],
    providerManages: [
      "The four authoritative name servers assigned to each zone",
      "Global anycast network answering queries near the client",
      "Query capacity, scaling, and DDoS resilience of the fleet",
      "Availability and durability of the DNS service itself",
      "Underlying servers, patching, and physical infrastructure",
    ],
    mutable: [
      "DNS zone tags",
      "Record set TTL",
      "Record set records and values",
      "Record set metadata",
      "Adding or removing record sets",
    ],
    immutable: [
      "DNS zone name",
      "Zone type (public or private)",
      "Record set name",
      "Record set type",
      "Assigned Azure name servers",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Public hosted zone",
        blurb:
          "Stands up an empty public hosted zone and hands you the four name servers to delegate at your registrar. Start here when you just need authoritative DNS for a new domain.",
        prompt:
          "Provision a public DNS zone on Amazon Route 53 using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and note that Route 53 is a global service so no region is required.\nCreate a public hosted zone for a domain I will provide (default to example.com if I do not), with a clear caller reference, and plan to add a simple A record for www pointing at a placeholder address.\nBefore running any command that creates, modifies, or deletes resources, echo the exact commands and the resources they will affect, then wait for my confirmation.\nAfter applying, print the hosted zone ID, the domain name, and the four assigned name servers so I can delegate the domain at my registrar.",
      },
      {
        label: "Apex alias + www CNAME",
        blurb:
          "Points the bare domain at a cloud resource with an apex-safe alias record and adds a www CNAME onto it. Reach for this when you need the root domain to resolve, which a plain CNAME cannot do.",
        prompt:
          "Configure the apex and www records for a domain in an existing public hosted zone on Amazon Route 53 using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and note that Route 53 is a global service so no region is required.\nAsk me for the hosted zone ID and domain (default to example.com), then plan an alias A record at the zone apex targeting a cloud resource I name (an Application Load Balancer, CloudFront distribution, or S3 website endpoint) using its hosted zone ID and DNS name, plus a CNAME record for www that points back at the apex domain; use `aws route53 change-resource-record-sets` with a clearly commented change batch and a consistent caller reference for cleanup.\nBefore running any command that creates, modifies, or deletes resources, echo the exact change batch JSON and the resources it will affect, then wait for my confirmation.\nAfter applying, print the change ID, the apex alias target, and the www record so I can verify propagation.",
      },
      {
        label: "Weighted / failover routing",
        blurb:
          "Publishes two records under the same name that split traffic by weight or fail over on a health check. Use it for a canary rollout or an active-passive standby across two endpoints.",
        prompt:
          "Set up weighted or failover routing across two endpoints for a name in an existing public hosted zone on Amazon Route 53 using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and note that Route 53 is a global service so no region is required.\nAsk me whether I want weighted or failover routing, the hosted zone ID and record name (default to app.example.com), and the two endpoint addresses; for failover create a Route 53 health check per endpoint with `aws route53 create-health-check`, then create two record sets sharing the name with distinct set identifiers and either weights or primary/secondary failover records via `aws route53 change-resource-record-sets`, using a consistent naming and set-identifier scheme for cleanup.\nBefore running any command that creates, modifies, or deletes resources, echo the exact commands and change batch and the resources they will affect, then wait for my confirmation.\nAfter applying, print the change ID, any health check IDs, and each record's set identifier and weight or failover role so I can verify the policy.",
      },
      {
        label: "Delegated subdomain zone",
        blurb:
          "Creates a child hosted zone for a subdomain and wires the NS delegation into the parent zone. Choose this when a team or environment needs to manage its own subdomain independently.",
        prompt:
          "Delegate a subdomain to its own public hosted zone on Amazon Route 53 using the aws CLI.\nFirst run `aws sts get-caller-identity` to confirm which account and credentials are active, and note that Route 53 is a global service so no region is required.\nAsk me for the parent domain and its hosted zone ID plus the subdomain label (default the subdomain to dev.example.com), then create a new public hosted zone for the subdomain with a clear caller reference, read back its four assigned name servers, and add an NS record for the subdomain in the parent hosted zone pointing at exactly those name servers via `aws route53 change-resource-record-sets`, keeping a consistent naming scheme for cleanup.\nBefore running any command that creates, modifies, or deletes resources, echo the exact commands and change batch and the resources they will affect, then wait for my confirmation.\nAfter applying, print the child hosted zone ID, its four name servers, and the NS record change ID in the parent zone so I can confirm the delegation.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Public DNS zone",
        blurb:
          "Stands up an empty public DNS zone in a resource group and hands you the four name servers to delegate at your registrar. Start here when you just need authoritative DNS for a new domain.",
        prompt:
          "Provision a public DNS zone on Azure DNS using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm which resource group and location I want (create the resource group if it does not exist).\nCreate a public DNS zone for a domain I will provide (default to example.com if I do not) inside that resource group, and plan to add a simple A record set for www pointing at a placeholder address.\nBefore running any command that creates, modifies, or deletes resources, echo the exact commands and the resources they will affect, then wait for my confirmation.\nAfter applying, print the zone's resource ID, the domain name, and the four assigned name servers so I can delegate the domain at my registrar.",
      },
      {
        label: "Apex alias + www CNAME",
        blurb:
          "Points the bare domain at an Azure resource with an apex-safe alias record set and adds a www CNAME onto it. Reach for this when you need the root domain to resolve, which a plain CNAME cannot do.",
        prompt:
          "Configure the apex and www records for a domain in an existing public DNS zone on Azure DNS using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm which resource group holds the zone.\nAsk me for the zone name (default to example.com) and the Azure resource to target (a public IP address, Traffic Manager profile, or CDN endpoint), then plan an alias A record set at the zone apex (record name @) that references that resource with `az network dns record-set a create --target-resource`, plus a CNAME record set for www that points at the apex domain via `az network dns record-set cname set-record`; tag every record set with a consistent tag for cleanup.\nBefore running any command that creates, modifies, or deletes resources, echo the exact commands and the resources they will affect, then wait for my confirmation.\nAfter applying, print each record set's resource ID, the apex alias target, and the www record so I can verify propagation.",
      },
      {
        label: "Weighted / priority routing",
        blurb:
          "Fronts two endpoints with a Traffic Manager profile using weighted or priority routing and points a DNS alias at it. Use it for a canary rollout or an active-passive standby across two endpoints.",
        prompt:
          "Set up weighted or priority routing across two endpoints on Azure DNS using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm which resource group and DNS zone to use.\nAsk me whether I want the Weighted or Priority routing method, the record name to expose (default to app.example.com), and the two endpoint targets, then create a Traffic Manager profile with `az network traffic-manager profile create` using that routing method and a health probe, add the two endpoints with `az network traffic-manager endpoint create` (assigning weights or priorities), and create an apex or subdomain alias A record set in the DNS zone that references the Traffic Manager profile; tag everything with a consistent tag for cleanup.\nBefore running any command that creates, modifies, or deletes resources, echo the exact commands and the resources they will affect, then wait for my confirmation.\nAfter applying, print the Traffic Manager profile's resource ID and DNS name, each endpoint's weight or priority, and the alias record set's resource ID so I can verify the routing.",
      },
      {
        label: "Delegated subdomain zone",
        blurb:
          "Creates a child DNS zone for a subdomain and wires the NS delegation into the parent zone. Choose this when a team or environment needs to manage its own subdomain independently.",
        prompt:
          "Delegate a subdomain to its own public DNS zone on Azure DNS using the az CLI.\nFirst run `az account show` to confirm the active subscription and tenant, and confirm which resource group holds the parent zone.\nAsk me for the parent zone name and the subdomain label (default the subdomain to dev.example.com), then create a new public DNS zone for the full subdomain with `az network dns zone create`, read back its four assigned name servers, and add an NS record set for the subdomain label in the parent zone pointing at exactly those name servers via `az network dns record-set ns add-record`, tagging both zones with a consistent tag for cleanup.\nBefore running any command that creates, modifies, or deletes resources, echo the exact commands and the resources they will affect, then wait for my confirmation.\nAfter applying, print the child zone's resource ID, its four name servers, and the parent NS record set so I can confirm the delegation.",
      },
    ],
  },
};

const BLURB =
  "The Domain Name System turns a memorable name like www.example.com into the address a machine actually connects to. A managed DNS service hosts your zone on globally distributed, authoritative name servers, lets you publish the records that map names to resources, and controls how long the answers are cached. This is the front door every user walks through before they reach anything you built.";

const ELEVATOR = "turn a domain name into the address of your resource";

const TERMS: GlossaryTerm[] = [
  {
    term: "Hosted zone / DNS zone",
    definition: "The container that holds all the records for one domain.",
  },
  {
    term: "Record / Record set",
    definition:
      "A typed entry mapping a name to a value. Azure groups same-name, same-type entries into a set.",
  },
  {
    term: "Authoritative name server",
    definition:
      "The server that gives the definitive answer for a zone. Both clouds assign four per zone.",
  },
  {
    term: "Recursive resolver",
    definition:
      "The server that walks the hierarchy on a client's behalf and caches each answer.",
  },
  {
    term: "Zone apex",
    definition:
      "The bare domain (example.com) itself. It cannot hold a CNAME record.",
  },
  {
    term: "Alias record / Alias record set",
    definition:
      "A provider extension that points the apex at a cloud resource and tracks its address.",
  },
  {
    term: "Routing policy / Traffic Manager",
    definition:
      "How one name yields different answers. Route 53 bakes it into the record; Azure uses a separate service.",
  },
  {
    term: "TTL",
    definition:
      "How long resolvers cache an answer, and so the worst-case delay for a change.",
  },
];

/**
 * The DNS lesson. The interactive body lives in DnsChapters and is driven per
 * provider: AWS and Azure diverge most in routing (a Route 53 routing policy on
 * the record versus a separate Azure Traffic Manager profile), and in naming
 * (hosted zone versus DNS zone, record versus record set). This shell provides
 * the shared concept framing, the cross-provider equivalence, the glossary, and
 * links to the authoritative documentation for the active lens.
 */
export function DnsLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon Route 53", code: "route53" }}
        azure={{ service: "Azure DNS", code: "Microsoft.Network/dnsZones" }}
        elevator={ELEVATOR}
      />
      <DnsChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
