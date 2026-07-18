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
import { TlsCertificatesChapters } from "./chapters";
import { SECURITY } from "./security";

const concept = getConcept("tls-certificates");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is AWS Certificate Manager?",
      href: "https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html",
      note: "The service overview: what ACM issues, stores, and renews.",
    },
    {
      label: "AWS Certificate Manager DNS validation",
      href: "https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html",
      note: "How the CNAME proves control and why it enables automatic renewal.",
    },
    {
      label: "Managed certificate renewal in ACM",
      href: "https://docs.aws.amazon.com/acm/latest/userguide/managed-renewal.html",
      note: "The conditions that decide whether ACM renews a certificate.",
    },
    {
      label: "Services integrated with ACM",
      href: "https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html",
      note: "Which services attach a certificate, and where TLS terminates.",
    },
    {
      label: "Certificates and Regions",
      href: "https://docs.aws.amazon.com/acm/latest/userguide/acm-regions.html",
      note: "Why CloudFront needs us-east-1 and certificates do not copy across Regions.",
    },
    {
      label: "request-certificate (AWS CLI reference)",
      href: "https://docs.aws.amazon.com/cli/latest/reference/acm/request-certificate.html",
      note: "The command and its validation-method and key-algorithm flags.",
    },
  ],
  azure: [
    {
      label: "What is TLS/SSL in Azure App Service?",
      href: "https://learn.microsoft.com/en-us/azure/app-service/overview-tls",
      note: "Free managed, paid, and uploaded certificates compared in one place.",
    },
    {
      label: "Add a TLS/SSL certificate in App Service",
      href: "https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate",
      note: "Every certificate option and the free managed certificate's limits.",
    },
    {
      label: "Renew your Key Vault certificates",
      href: "https://learn.microsoft.com/en-us/azure/key-vault/certificates/overview-renew-certificate",
      note: "Exactly what auto-renews in Key Vault, and what only warns you.",
    },
    {
      label: "TLS termination with Key Vault certificates",
      href: "https://learn.microsoft.com/en-us/azure/application-gateway/key-vault-certs",
      note: "How Application Gateway pulls and rotates a certificate from Key Vault.",
    },
    {
      label: "Domains in Azure Front Door",
      href: "https://learn.microsoft.com/en-us/azure/frontdoor/domain",
      note: "Managed certificates, DNS TXT validation, and when auto-rotation applies.",
    },
    {
      label: "az webapp config ssl create (Azure CLI reference)",
      href: "https://learn.microsoft.com/en-us/cli/azure/webapp/config/ssl",
      note: "The command that creates a free managed certificate for a hostname.",
    },
  ],
};

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "Which domain names, or wildcard, the certificate covers",
      "The validation method: DNS (recommended) or email",
      "Publishing and keeping the validation CNAME in your DNS",
      "Which integrated service the certificate attaches to",
      "The HTTPS listener settings and TLS security policy",
      "Requesting CloudFront certificates in us-east-1",
    ],
    providerManages: [
      "Issuing the certificate from the Amazon certificate authority",
      "Storing the private key securely (non-exportable by default)",
      "Attempting automatic renewal 45 days before expiry",
      "Rolling the renewed certificate onto every attached service",
      "The trust chain browsers already recognize",
      "The TLS handshake at the integrated service",
    ],
    mutable: [
      "The service a certificate is attached to, and the listener settings",
      "The TLS security policy on the listener",
      "Adding or refreshing DNS validation records",
      "Tags on the certificate",
    ],
    immutable: [
      "The domain names on an issued certificate (request a new one to change them)",
      "The validation method (email cannot be switched to DNS later)",
      "The Region the certificate lives in (no cross-Region copy)",
      "The certificate ARN, which stays stable across renewals",
    ],
  },
  azure: {
    youManage: [
      "Where TLS terminates: App Service, Application Gateway, or Front Door",
      "The certificate source for that terminator (managed, or Key Vault)",
      "Proving domain control (a DNS record, or the HTTP token for App Service)",
      "Key Vault access for the terminator's managed identity",
      "Referencing the Key Vault secret without a version, for rotation",
      "The TLS policy on the Application Gateway listener",
    ],
    providerManages: [
      "Issuing managed certificates from DigiCert",
      "Renewing managed certificates and rotating integrated-CA certificates",
      "Storing keys in Key Vault under the access you set",
      "Polling Key Vault and rolling the new certificate onto the gateway",
      "The trust chain browsers already recognize",
      "The TLS handshake at the terminator",
    ],
    mutable: [
      "The certificate bound to a terminator, and the TLS policy",
      "Key Vault access policies and the referenced secret",
      "Adding or refreshing DNS validation records",
      "Tags on the certificate or key vault",
    ],
    immutable: [
      "A managed certificate's issuing CA (DigiCert), fixed by the service",
      "That a free App Service managed certificate covers no wildcard and cannot be exported",
      "That Key Vault integration on Application Gateway is v2 SKU only, set at creation",
      "The terminator a given managed certificate belongs to",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Public cert for a load balancer",
        blurb:
          "The everyday case: request a free public certificate with DNS validation, publish the CNAME, wait for it to be issued, then attach it to an HTTPS listener on an Application Load Balancer.",
        prompt:
          "Provision a public TLS certificate with the aws CLI and attach it to an Application Load Balancer. First run `aws sts get-caller-identity` and print the configured Region so I know which account and Region you will build in, and note that the certificate must be in the same Region as the load balancer. Request the certificate with `aws acm request-certificate --domain-name www.example.com --validation-method DNS --key-algorithm RSA_2048`, then run `aws acm describe-certificate` to read the DNS validation CNAME (name and value) and print it for me to publish; if the domain is in Route 53, offer to create the record with `aws acm ... ` via the appropriate route53 change-resource-record-sets call. Wait until the certificate status is ISSUED. Then add an HTTPS listener on an existing Application Load Balancer with `aws elbv2 create-listener --protocol HTTPS --port 443 --certificates CertificateArn=<cert arn> --default-actions ...`, and add a second listener on port 80 that redirects to 443. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. Remind me to leave the validation CNAME published so ACM can renew automatically. When finished, print the certificate ARN, its status, and the HTTPS listener ARN.",
      },
      {
        label: "CloudFront cert in us-east-1",
        blurb:
          "A certificate for a CloudFront distribution has one hard rule: it must live in us-east-1, no matter where your origin runs. This provisions it in the right Region and attaches it.",
        prompt:
          "Provision a public TLS certificate for Amazon CloudFront with the aws CLI. The certificate MUST be requested in the US East (N. Virginia) Region, us-east-1, regardless of where my origin runs, so pass `--region us-east-1` on the request. Run `aws sts get-caller-identity` first and confirm the account. Request the certificate with `aws acm request-certificate --domain-name cdn.example.com --validation-method DNS --region us-east-1`, read the validation CNAME with `aws acm describe-certificate --region us-east-1`, and print it for me to publish. Wait until it is ISSUED. Then attach it to a CloudFront distribution by setting the viewer certificate to the ACM certificate ARN. Before you run any command that creates or deletes resources, print the full plan and wait for me to confirm. When finished, print the certificate ARN and confirm it is in us-east-1.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Free managed cert on App Service",
        blurb:
          "The simplest HTTPS on Azure: a free, auto-renewed managed certificate for an App Service custom domain, then bound to the app. Note the create command is currently in preview.",
        prompt:
          "Provision a free App Service managed certificate with the az CLI and bind it to a web app. First run `az account show` and print the active subscription and default location. Assume a custom domain is already mapped to the web app; if it is not, tell me what CNAME or A record to add and stop. Create the managed certificate with `az webapp config ssl create --resource-group MyResourceGroup --name MyWebapp --hostname cname.mycustomdomain.com` (note this command is in preview), then bind it with `az webapp config ssl bind` using the returned thumbprint and an SNI binding. Point out that the free managed certificate cannot cover a wildcard and cannot be exported, so if I need either we should use Key Vault instead. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. When finished, print the certificate thumbprint and the binding.",
      },
      {
        label: "Key Vault cert for Application Gateway",
        blurb:
          "The Layer 7 load balancer path: store a certificate in Key Vault and let an Application Gateway read it through a managed identity, referencing the secret without a version so rotation is automatic.",
        prompt:
          'Provision a TLS certificate in Azure Key Vault and wire it to an Application Gateway (v2) with the az CLI. First run `az account show` and print the active subscription and location. Create or reuse a key vault, then create a certificate with `az keyvault certificate create --vault-name <vault> -n appgw-cert -p "$(az keyvault certificate get-default-policy)"` (for a real site, swap the policy to reference a DigiCert or GlobalSign issuer instead of self-signed). Give the Application Gateway a user-assigned managed identity and grant it get access to the vault\'s secrets and certificates. Then reference the certificate on an HTTPS listener using the Key Vault secret identifier WITHOUT a version, so the gateway auto-rotates when the certificate renews; note the gateway polls Key Vault every four hours and that Key Vault integration is v2 SKU only. Before you run any command that creates or deletes resources, echo the full plan and wait for me to confirm. When finished, print the Key Vault secret id used, the managed identity, and the listener name.',
      },
    ],
  },
};

const BLURB =
  "A browser shows a padlock only when a site proves two things: that the name in the address bar really is yours, and that traffic to it is encrypted. A TLS certificate carries that proof. It is a short-lived file, signed by an authority browsers already trust, that binds your domain name to a public key. You prove you control the domain, the authority issues the certificate, and the front door facing the internet, a load balancer or a CDN, uses it to terminate HTTPS. Because certificates expire, the real work is keeping them renewed automatically.";

const ELEVATOR =
  "prove you own a domain, get a trusted certificate, and serve HTTPS that renews itself";

const TERMS: GlossaryTerm[] = [
  {
    term: "TLS certificate",
    definition:
      "A signed file binding a domain name to a public key, so browsers trust the site.",
  },
  {
    term: "Certificate authority (CA)",
    definition:
      "The trusted issuer, such as Amazon or DigiCert, whose signature browsers already accept.",
  },
  {
    term: "Domain validation",
    definition:
      "Proving you control the domain, by DNS record or HTTP token, before a certificate is issued.",
  },
  {
    term: "TLS termination",
    definition:
      "Decrypting HTTPS at the front door (load balancer, CDN) so it can read and route the request.",
  },
  {
    term: "Subject Alternative Name (SAN)",
    definition:
      "An extra domain name covered by the same certificate, alongside the primary name.",
  },
  {
    term: "Wildcard certificate",
    definition:
      "One certificate covering every subdomain of a domain, written as *.example.com.",
  },
  {
    term: "Managed certificate",
    definition:
      "A certificate the provider issues, stores, and renews for you, rather than one you install by hand.",
  },
  {
    term: "Auto-renewal",
    definition:
      "The provider reissuing the certificate before it expires, so a valid one is always in place.",
  },
];

/**
 * The TLS Certificates lesson. The interactive body lives in
 * TlsCertificatesChapters and is driven per provider: AWS and Azure diverge most
 * in where a certificate lives and terminates TLS. AWS centers on one service,
 * ACM, whose certificate you attach to an integrated service; Azure spreads the
 * job across App Service, Application Gateway, and Front Door, with Key Vault as
 * the shared store. This shell provides the shared concept framing, the
 * cross-provider equivalence, the glossary, and links to the authoritative
 * documentation for the active lens.
 */
export function TlsCertificatesLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "AWS Certificate Manager", code: "acm · Amazon CA" }}
        azure={{
          service: "Key Vault + managed certs",
          code: "Microsoft.KeyVault",
        }}
        elevator={ELEVATOR}
      />
      <TlsCertificatesChapters
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
