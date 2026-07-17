import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { ContentDeliveryChapters } from "./chapters";

const concept = getConcept("cdn");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is Amazon CloudFront?",
      href: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html",
      note: "Distributions, origins, edge locations, and the default 24 hour cache.",
    },
    {
      label: "How CloudFront delivers content",
      href: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html",
      note: "The hit and miss flow, and how regional edge caches form a second tier.",
    },
    {
      label: "Understand the cache key",
      href: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/understanding-the-cache-key.html",
      note: "What is in the key by default and how a cache policy changes it.",
    },
    {
      label: "Invalidate files to remove content",
      href: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html",
      note: "Invalidation versus versioned file names, and why versioning is cheaper.",
    },
    {
      label: "Serve private content with signed URLs and signed cookies",
      href: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PrivateContent.html",
      note: "Time-limited access to private objects backed by a trusted key group.",
    },
  ],
  azure: [
    {
      label: "What is Azure Front Door?",
      href: "https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview",
      note: "The CDN and global load balancer, its PoPs, and the Microsoft network.",
    },
    {
      label: "Caching with Azure Front Door",
      href: "https://learn.microsoft.com/en-us/azure/frontdoor/front-door-caching",
      note: "Per-route caching, GET-only responses, query strings, and object chunking.",
    },
    {
      label: "How requests get matched to a route",
      href: "https://learn.microsoft.com/en-us/azure/frontdoor/front-door-route-matching",
      note: "Most-specific matching on protocol, host, and path, with 404 on no match.",
    },
    {
      label: "Routing architecture",
      href: "https://learn.microsoft.com/en-us/azure/frontdoor/front-door-routing-architecture",
      note: "The full path from anycast PoP through WAF, rules, cache, and origin group.",
    },
    {
      label: "Traffic routing methods to origin",
      href: "https://learn.microsoft.com/en-us/azure/frontdoor/routing-methods",
      note: "Latency, priority, weighted, and session affinity across healthy origins.",
    },
  ],
};

const BLURB =
  "Serving every viewer from one origin means someone always pays a long round trip. A content delivery network caches copies of your content at edge sites spread around the world, so a request is answered from a location near the viewer instead of from the origin. You point it at your origin, decide what is cacheable and for how long, and it takes care of the global distribution.";

const ELEVATOR =
  "cache content at the edge, close to your users, so it loads fast";

const TERMS: GlossaryTerm[] = [
  {
    term: "Distribution / Front Door profile",
    definition:
      "The top-level resource you configure to front your content with a CDN.",
  },
  {
    term: "Edge location / Point of presence",
    definition:
      "A nearby cache site that terminates the viewer's connection and serves cached content.",
  },
  {
    term: "Origin",
    definition:
      "The source of truth the CDN pulls from on a miss, such as a bucket or an HTTP server.",
  },
  {
    term: "Cache behavior / Route",
    definition:
      "The rule that maps a path pattern to an origin and its caching settings.",
  },
  {
    term: "Cache key",
    definition:
      "The identifier that decides whether a request is a hit on an existing object.",
  },
  {
    term: "TTL / Cache-Control",
    definition:
      "How long a cached response stays fresh before the edge refetches it.",
  },
  {
    term: "Invalidation / Purge",
    definition:
      "Removing a cached file from the edge before it would expire on its own.",
  },
  {
    term: "Regional edge cache / Origin group",
    definition:
      "CloudFront's larger second caching tier; on Azure, the health-probed set of origins a route targets.",
  },
];

/**
 * The Content Delivery lesson. The interactive body lives in
 * ContentDeliveryChapters and is driven per provider. Amazon CloudFront is a CDN
 * with distributions, ordered cache behaviors, a second regional caching tier,
 * and signed URLs for private content. Azure Front Door is a global load
 * balancer and CDN in one, where caching is an optional per-route feature,
 * routing is most-specific with no implicit catch-all, and private content is
 * gated with the WAF, rules engine, and Private Link. This shell provides the
 * shared framing, the cross-provider equivalence, the glossary, and links to the
 * authoritative documentation for the active lens.
 */
export function ContentDeliveryLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon CloudFront", code: "cloudfront" }}
        azure={{ service: "Azure Front Door", code: "Microsoft.Cdn · afd" }}
        elevator={ELEVATOR}
      />
      <ContentDeliveryChapters provider={provider} />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
