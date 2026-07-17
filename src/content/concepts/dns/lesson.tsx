import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
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
      <DnsChapters provider={provider} />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
