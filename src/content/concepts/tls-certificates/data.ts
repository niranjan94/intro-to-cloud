import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";

/**
 * All per-provider content for the TLS Certificates lesson, keyed by Provider.
 * The interactive components are provider-agnostic and render whatever slice of
 * this model they are handed, so every difference between AWS and Azure lives
 * here as data, not as branching in render code (ADR-0003).
 *
 * This concept diverges between the providers more than most, which is exactly
 * what the "where the certificate lives" chapter turns on. AWS has one service,
 * AWS Certificate Manager, that issues a certificate you attach to a load
 * balancer, CDN, or API gateway. Azure has no single certificate service: App
 * Service, Application Gateway, and Front Door each terminate TLS with their own
 * certificate source, and Key Vault is the shared store the last two can read.
 * Grounded in the providers' own documentation (docs.aws.amazon.com and
 * learn.microsoft.com).
 */

/** A single multiple-choice question; structurally identical to the kit's. */
export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/** Framing for one chapter: matches the shape the chapter shell renders. */
export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* Chapter 1: the anatomy of a certificate. */
export interface CertField {
  /** Which part of the cert this is, used to highlight the culprit field. */
  id: "subject" | "sans" | "issuer" | "validity" | "key";
  label: string;
  value: string;
}
export interface CertState {
  id: string;
  /** Short tab label, e.g. "Expired". */
  label: string;
  verdict: "secure" | "insecure";
  verdictTitle: string;
  verdictBody: string;
  /** The field the browser objects to, highlighted when this state is active. */
  culprit: CertField["id"] | null;
}
export interface AnatomyContent {
  /** The domain the visitor typed, shown as the address being checked. */
  visiting: string;
  fields: CertField[];
  states: CertState[];
  callouts: CalloutData[];
}

/* Chapter 2: proving you control the domain. */
export interface ValidationRecord {
  type: string;
  name: string;
  value: string;
}
export interface ValidationContent {
  domain: string;
  method: string;
  methodNote: string;
  /** The challenge record the authority asks you to publish. */
  record: ValidationRecord;
  /** The other way to prove control, and why it is the weaker default. */
  altMethod: string;
  /** Why this validation method keeps renewal automatic. */
  renewalInsight: string;
  callouts: CalloutData[];
}

/* Chapter 3: where the certificate lives and terminates TLS. */
export interface Terminator {
  id: string;
  name: string;
  role: string;
  certSource: string;
  issuance: string;
  autoRenew: string;
  note: string;
}
export interface MapContent {
  storeLabel: string;
  storeNote: string;
  terminators: Terminator[];
  /** The raw-server story: a machine you manage, and why the default cert stays off it. */
  rawServerTitle: string;
  rawServerNote: string;
  callouts: CalloutData[];
}

/* Chapter 4: renewal, and how it breaks. */
export interface RenewalContent {
  validityLabel: string;
  renewWindowLabel: string;
  conditionLabel: string;
  keepTitle: string;
  keepBody: string;
  breakTitle: string;
  breakBody: string;
  callouts: CalloutData[];
}

export interface ConceptContent {
  chapters: ChapterMeta[];
  anatomy: AnatomyContent;
  validation: ValidationContent;
  map: MapContent;
  renewal: RenewalContent;
  quiz: QuizQ[];
}

const AWS: ConceptContent = {
  chapters: [
    {
      navLabel: "what it is",
      kicker: "Anatomy",
      title: "What a certificate proves",
      intro:
        "A TLS certificate is a small signed file that binds your domain name to a public key. A browser trusts a site only when the certificate matches the name in the address bar, has not expired, and was signed by an authority it already recognizes. Break any one of those and the padlock turns into a warning.",
    },
    {
      navLabel: "prove it",
      kicker: "Domain validation",
      title: "Prove you own the domain",
      intro:
        "Before Amazon's certificate authority will sign a certificate for your name, AWS Certificate Manager makes you prove you control the domain. The recommended way is a DNS record: ACM hands you a CNAME to publish, then checks that it resolves. Publishing it is the whole gate.",
    },
    {
      navLabel: "attach it",
      kicker: "Where it lives",
      title: "Where the certificate lives",
      intro:
        "An ACM certificate is not installed on a server. You request it once, and attach it to a service that terminates TLS in front of your app: a load balancer, CloudFront, or API Gateway. Pick a terminator to see how the same certificate reaches it.",
    },
    {
      navLabel: "renew it",
      kicker: "Lifecycle",
      title: "Renewal, and how it breaks",
      intro:
        "Certificates are deliberately short-lived, so the real work is renewal. With DNS validation, ACM renews for you before expiry, but only while the conditions that let it check the domain still hold. Toggle the validation record to see the difference.",
    },
    {
      navLabel: "quiz",
      kicker: "Check yourself",
      title: "Five questions",
      intro:
        "Five questions on how certificates are issued, attached, and renewed on AWS. Answer each to reveal why.",
    },
  ],
  anatomy: {
    visiting: "https://shop.example.com",
    fields: [
      {
        id: "subject",
        label: "Subject (common name)",
        value: "shop.example.com",
      },
      {
        id: "sans",
        label: "Subject alternative names",
        value: "shop.example.com, www.example.com",
      },
      {
        id: "issuer",
        label: "Issued by (CA)",
        value: "Amazon RSA 2048 M0x · Amazon Trust Services",
      },
      {
        id: "validity",
        label: "Valid",
        value: "2026-07-01 to 2027-01-15 (198 days)",
      },
      { id: "key", label: "Public key", value: "RSA 2048-bit" },
    ],
    states: [
      {
        id: "valid",
        label: "Valid",
        verdict: "secure",
        verdictTitle: "Padlock: connection is secure",
        verdictBody:
          "The name matches shop.example.com, the certificate is inside its validity window, and Amazon Trust Services is a CA browsers already trust. The browser encrypts the connection and shows the padlock.",
        culprit: null,
      },
      {
        id: "expired",
        label: "Expired",
        verdict: "insecure",
        verdictTitle: "Warning: certificate expired",
        verdictBody:
          "The certificate is past its valid-to date. Browsers reject expired certificates outright with a full-page warning, even though the name and issuer are fine. This is the most common real-world outage, and why automatic renewal matters.",
        culprit: "validity",
      },
      {
        id: "mismatch",
        label: "Wrong domain",
        verdict: "insecure",
        verdictTitle: "Warning: name does not match",
        verdictBody:
          "The visitor asked for shop.example.com but the certificate only covers a different name. A certificate vouches only for the names listed on it, so the browser refuses the connection. This is why you request every hostname you serve, or a wildcard.",
        culprit: "subject",
      },
      {
        id: "untrusted",
        label: "Untrusted CA",
        verdict: "insecure",
        verdictTitle: "Warning: issuer not trusted",
        verdictBody:
          "The certificate is signed, but by an authority the browser does not recognize, such as a self-signed or private CA. A public ACM certificate is signed by Amazon Trust Services, which is already in every browser's trust store, so this does not happen with it.",
        culprit: "issuer",
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A certificate is not the encryption.",
        body: "The certificate does not encrypt anything itself. It carries a public key and a trusted signature that let the browser verify who it is talking to and agree on keys. The encryption is the TLS handshake that follows.",
      },
    ],
  },
  validation: {
    domain: "shop.example.com",
    method: "DNS validation",
    methodNote:
      "ACM gives you a CNAME record to add to your domain's DNS. If your domain is in Route 53, ACM can write the record for you with one click.",
    record: {
      type: "CNAME",
      name: "_a79865eb4cba.shop.example.com",
      value: "_x2ba4c1d.acm-validations.aws",
    },
    altMethod:
      "Email validation is the other option: ACM emails the domain's registered contacts a link to approve. It works, but a human must click that link again at every renewal, so a missed email means an expired certificate. DNS validation is recommended for exactly this reason.",
    renewalInsight:
      "The CNAME is a permanent alias, not a one-time code. Because it stays published, ACM can re-check it 45 days before expiry and renew the certificate automatically, with no action from you.",
    callouts: [
      {
        kind: "fix",
        tag: "Why DNS wins",
        title: "Leave the record in place.",
        body: "The validation CNAME is not disposable. Deleting it after issuance is the classic mistake: the certificate keeps working until it expires, then automatic renewal silently fails because ACM can no longer confirm you control the domain.",
      },
      {
        kind: "note",
        tag: "AWS detail",
        title: "Validation has a 72-hour deadline.",
        body: "If the CNAME is not detected within 72 hours of the request, ACM times the request out and you have to request the certificate again. Publishing the record promptly, or letting Route 53 do it, avoids the reset.",
      },
    ],
  },
  map: {
    storeLabel: "One ACM store, per Region",
    storeNote:
      "Request a certificate once and it lives in ACM in that Region. Any integrated service in the same Region can attach it. Certificates are regional and cannot be copied across Regions.",
    terminators: [
      {
        id: "alb",
        name: "Application Load Balancer",
        role: "Layer 7 load balancer",
        certSource: "ACM certificate in the same Region",
        issuance: "Attach the certificate to an HTTPS listener",
        autoRenew: "Automatic",
        note: "The certificate and the load balancer must be in the same Region. TLS terminates on the balancer; traffic to your instances stays inside the VPC.",
      },
      {
        id: "cloudfront",
        name: "Amazon CloudFront",
        role: "CDN / edge",
        certSource: "ACM certificate in us-east-1",
        issuance: "Select the certificate on the distribution",
        autoRenew: "Automatic",
        note: "A CloudFront distribution can only use a certificate requested or imported in the US East (N. Virginia) Region, no matter where your origin runs. This trips people up constantly.",
      },
      {
        id: "apigw",
        name: "Amazon API Gateway",
        role: "Managed API front door",
        certSource: "ACM certificate for the custom domain",
        issuance: "Attach the certificate to a custom domain name",
        autoRenew: "Automatic",
        note: "The certificate is bound to the API's custom domain name, and TLS terminates at the gateway before requests reach your integration.",
      },
    ],
    rawServerTitle: "A plain EC2 instance",
    rawServerNote:
      "The default ACM public certificate is non-exportable: you never get the private key, so you cannot install it on a web server you run yourself. The intended pattern is to put an integrated service in front and terminate TLS there. To put a publicly trusted certificate on the host itself, you instead automate issuance with the ACME protocol or request an exportable certificate.",
    callouts: [
      {
        kind: "note",
        tag: "The divergence",
        title: "One certificate, many front doors.",
        body: "The strength of ACM is that a single certificate can attach to a load balancer, a CDN, and an API gateway from one regional store. Each service handles the TLS handshake for you.",
      },
    ],
  },
  renewal: {
    validityLabel: "Amazon issues the certificate for 198 days.",
    renewWindowLabel: "ACM attempts automatic renewal 45 days before expiry.",
    conditionLabel:
      "as long as the validation CNAME is still published and the certificate is still attached to a service",
    keepTitle: "Renewed automatically, no downtime",
    keepBody:
      "ACM re-checks the CNAME, issues a fresh certificate, and rolls it onto every attached service. The certificate's ARN never changes, so nothing you configured needs touching.",
    breakTitle: "Renewal fails, then the certificate expires",
    breakBody:
      "Delete the validation CNAME, or detach the certificate from every service, and ACM can no longer confirm you control the domain. At expiry the certificate lapses and every visitor hits a full-page browser warning.",
    callouts: [
      {
        kind: "fix",
        tag: "The real failure mode",
        title: '"Auto-renewal" is not unconditional.',
        body: 'ACM renews only when it can still validate the domain and the certificate is in use. An expired certificate on "managed renewal" almost always means the CNAME was removed or the certificate was left attached to nothing.',
      },
    ],
  },
  quiz: [
    {
      q: "Why does AWS recommend DNS validation over email validation?",
      opts: [
        "DNS validation is cheaper",
        "The validation CNAME stays published, so ACM can renew the certificate automatically",
        "Email validation does not prove domain control",
        "DNS validation issues the certificate faster",
      ],
      answer: 1,
      explain:
        "Both methods prove control, but the DNS CNAME is a permanent alias. Because it stays in place, ACM re-checks it and renews automatically. Email validation needs a human to click a link at every renewal.",
    },
    {
      q: "You want to serve a certificate through Amazon CloudFront. Which Region must the certificate be in?",
      opts: [
        "The same Region as your origin",
        "Any Region",
        "US East (N. Virginia), us-east-1",
        "It does not matter, CloudFront is global",
      ],
      answer: 2,
      explain:
        "A CloudFront distribution can only use an ACM certificate requested or imported in us-east-1, regardless of where the origin runs. Certificates for a load balancer, by contrast, must be in the load balancer's own Region.",
    },
    {
      q: "Your default ACM public certificate will not install on your EC2 web server. Why?",
      opts: [
        "EC2 does not support TLS",
        "The certificate is non-exportable, so you attach it to an integrated service instead",
        "The certificate is in the wrong Region",
        "You need to pay for it first",
      ],
      answer: 1,
      explain:
        "A default ACM public certificate never hands you the private key, so it cannot be installed on a server you run. You attach it to a load balancer, CloudFront, or API Gateway, where TLS terminates. Putting a cert on the host itself needs ACME automation or an exportable certificate.",
    },
    {
      q: "What does ACM charge for a standard public certificate attached to a load balancer?",
      opts: [
        "A monthly fee per certificate",
        "A fee per domain name",
        "Nothing, it is free",
        "A fee only at renewal",
      ],
      answer: 2,
      explain:
        "Public certificates you manage with ACM and attach to integrated services carry no charge. You pay only for the AWS resources you run. Exportable public certificates and a private CA are the paid exceptions.",
    },
    {
      q: 'A certificate on "managed renewal" expired anyway. What is the most likely cause?',
      opts: [
        "ACM was down",
        "The validation CNAME was deleted, or the certificate was attached to nothing",
        "The certificate was too old to renew",
        "The Region changed",
      ],
      answer: 1,
      explain:
        "ACM renews only while it can still validate the domain and the certificate is in use. Removing the validation CNAME, or leaving the certificate detached, quietly breaks renewal, and the certificate lapses at expiry.",
    },
  ],
};

const AZURE: ConceptContent = {
  chapters: [
    {
      navLabel: "what it is",
      kicker: "Anatomy",
      title: "What a certificate proves",
      intro:
        "A TLS certificate is a small signed file that binds your domain name to a public key. A browser trusts a site only when the certificate matches the name in the address bar, has not expired, and was signed by an authority it already recognizes. Break any one of those and the padlock turns into a warning.",
    },
    {
      navLabel: "prove it",
      kicker: "Domain validation",
      title: "Prove you own the domain",
      intro:
        "Before a certificate authority will sign a certificate for your name, Azure makes you prove you control the domain. For a Front Door managed certificate the proof is a DNS TXT record; Azure checks that it resolves before DigiCert issues. Publishing it is the whole gate.",
    },
    {
      navLabel: "attach it",
      kicker: "Where it lives",
      title: "Where the certificate lives",
      intro:
        "Azure has no single certificate service. Each place that terminates TLS has its own certificate source, and Key Vault is the shared store the load balancer and CDN can read from. Pick a terminator to see which certificate feeds it.",
    },
    {
      navLabel: "renew it",
      kicker: "Lifecycle",
      title: "Renewal, and how it breaks",
      intro:
        "Certificates are deliberately short-lived, so the real work is renewal. Managed certificates rotate for you before expiry, but only while the conditions that let Azure re-validate the domain still hold. Toggle the DNS setup to see the difference.",
    },
    {
      navLabel: "quiz",
      kicker: "Check yourself",
      title: "Five questions",
      intro:
        "Five questions on how certificates are issued, attached, and renewed on Azure. Answer each to reveal why.",
    },
  ],
  anatomy: {
    visiting: "https://shop.example.com",
    fields: [
      {
        id: "subject",
        label: "Subject (common name)",
        value: "shop.example.com",
      },
      {
        id: "sans",
        label: "Subject alternative names",
        value: "shop.example.com, www.example.com",
      },
      {
        id: "issuer",
        label: "Issued by (CA)",
        value: "DigiCert · a Microsoft partner CA",
      },
      {
        id: "validity",
        label: "Valid",
        value: "2026-07-01 to 2027-01-15 (198 days)",
      },
      { id: "key", label: "Public key", value: "RSA 2048-bit" },
    ],
    states: [
      {
        id: "valid",
        label: "Valid",
        verdict: "secure",
        verdictTitle: "Padlock: connection is secure",
        verdictBody:
          "The name matches shop.example.com, the certificate is inside its validity window, and DigiCert is a CA browsers already trust. The browser encrypts the connection and shows the padlock.",
        culprit: null,
      },
      {
        id: "expired",
        label: "Expired",
        verdict: "insecure",
        verdictTitle: "Warning: certificate expired",
        verdictBody:
          "The certificate is past its valid-to date. Browsers reject expired certificates outright with a full-page warning, even though the name and issuer are fine. This is the most common real-world outage, and why automatic rotation matters.",
        culprit: "validity",
      },
      {
        id: "mismatch",
        label: "Wrong domain",
        verdict: "insecure",
        verdictTitle: "Warning: name does not match",
        verdictBody:
          "The visitor asked for shop.example.com but the certificate only covers a different name. A certificate vouches only for the names listed on it, so the browser refuses the connection. A free App Service managed certificate cannot cover a wildcard, so multi-subdomain sites need a different source.",
        culprit: "subject",
      },
      {
        id: "untrusted",
        label: "Untrusted CA",
        verdict: "insecure",
        verdictTitle: "Warning: issuer not trusted",
        verdictBody:
          "The certificate is signed, but by an authority the browser does not recognize, such as a self-signed certificate from Key Vault used in public. Azure's managed certificates are signed by DigiCert, which is already in every browser's trust store, so this does not happen with them.",
        culprit: "issuer",
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A certificate is not the encryption.",
        body: "The certificate does not encrypt anything itself. It carries a public key and a trusted signature that let the browser verify who it is talking to and agree on keys. The encryption is the TLS handshake that follows.",
      },
    ],
  },
  validation: {
    domain: "shop.example.com",
    method: "DNS TXT validation",
    methodNote:
      "For a Front Door managed certificate, Azure asks you to publish a TXT record. If your domain is in Azure DNS, Azure can add the record for you as part of onboarding the custom domain.",
    record: {
      type: "TXT",
      name: "_dnsauth.shop.example.com",
      value: "75b2a1c9f0e34d8a...",
    },
    altMethod:
      "App Service's free managed certificate proves control a different way, over HTTP: DigiCert fetches a token file from a well-known path on your site instead of reading a DNS record. Different terminators on Azure genuinely validate differently.",
    renewalInsight:
      "Front Door rotates the managed certificate for you before expiry, but only while the domain's CNAME still points directly at the Front Door endpoint, which is how Azure keeps confirming you control the name.",
    callouts: [
      {
        kind: "fix",
        tag: "Keep DNS pointed right",
        title: "Auto-rotation depends on the CNAME.",
        body: "Front Door can only keep rotating the certificate while the custom domain's CNAME points straight at the Front Door endpoint. Move to an apex A record or a chained CNAME and rotation stops, so you must re-validate before expiry.",
      },
      {
        kind: "note",
        tag: "Azure detail",
        title: "Validation records are time-limited.",
        body: "The DNS TXT validation token is not permanent. If auto-rotation is not in play, you re-validate roughly 45 days before expiry, and the TXT tokens themselves expire after about a week if unused.",
      },
    ],
  },
  map: {
    storeLabel: "No single store",
    storeNote:
      "Each terminator has its own certificate source. Key Vault is the shared, access-controlled store that Application Gateway and Front Door can read certificates from; App Service's free managed certificate and Front Door's own managed certificate are issued and held by those services.",
    terminators: [
      {
        id: "appservice",
        name: "Azure App Service",
        role: "The web app itself",
        certSource:
          "App Service managed certificate (free), or Key Vault import",
        issuance: "Create a managed certificate for the custom domain",
        autoRenew: "Automatic (managed certificate)",
        note: "The free managed certificate is issued by DigiCert at no cost and renews for you, but it cannot cover a wildcard and cannot be exported. For those you use Key Vault or a paid certificate.",
      },
      {
        id: "appgw",
        name: "Application Gateway",
        role: "Layer 7 load balancer",
        certSource: "Key Vault certificate (v2 SKU), or uploaded PFX",
        issuance: "Reference the Key Vault secret on an HTTPS listener",
        autoRenew: "Automatic, if referenced without a version",
        note: "The gateway uses a managed identity to read the certificate from Key Vault and polls every four hours for a renewed version. Reference the secret without a version so rotation is picked up. Key Vault integration is v2 SKU only.",
      },
      {
        id: "frontdoor",
        name: "Azure Front Door",
        role: "CDN / edge",
        certSource: "Front Door managed certificate (DigiCert), or Key Vault",
        issuance: "Enable HTTPS on the custom domain",
        autoRenew: "Automatic, if the CNAME points at the endpoint",
        note: "Front Door can issue and rotate the certificate for you. Auto-rotation holds only while the domain's CNAME points directly at the Front Door endpoint. A wildcard is the exception: for that you bring your own certificate from Key Vault, since the managed certificate does not cover wildcards.",
      },
    ],
    rawServerTitle: "A plain virtual machine",
    rawServerNote:
      "A VM you run terminates TLS in its own web server, so you install the certificate on the host yourself. The clean pattern is to store the certificate in Key Vault and pull it onto the VM, rather than copying private-key files around. Managed certificates from App Service and Front Door are held by those services, not something you export onto a VM.",
    callouts: [
      {
        kind: "note",
        tag: "The divergence",
        title: "Three terminators, three certificate sources.",
        body: "Unlike a single ACM store, Azure spreads certificates across services. Key Vault is the closest thing to a shared store, but App Service and Front Door each issue and hold their own managed certificates.",
      },
    ],
  },
  renewal: {
    validityLabel:
      "DigiCert issues the managed certificate, and Azure tracks its expiry.",
    renewWindowLabel:
      "Azure rotates the managed certificate automatically before it expires.",
    conditionLabel:
      "as long as the domain's CNAME still points directly at the Front Door endpoint",
    keepTitle: "Rotated automatically, no downtime",
    keepBody:
      "Front Door issues a fresh certificate and swaps it in at the edge. You do nothing, and visitors never notice. An Application Gateway does the same by re-polling Key Vault for the renewed version.",
    breakTitle: "Rotation stops, then the certificate expires",
    breakBody:
      "Point the domain at an apex A record or a chained CNAME and Front Door can no longer keep validating it, so auto-rotation stops. If you do not re-validate before expiry, the certificate lapses and every visitor hits a browser warning.",
    callouts: [
      {
        kind: "fix",
        tag: "The real failure mode",
        title: '"Auto-rotation" is not unconditional.',
        body: "Managed rotation holds only while Azure can still confirm you control the domain: the right CNAME for Front Door, a versionless Key Vault reference for Application Gateway. Break the condition and the certificate quietly runs out.",
      },
    ],
  },
  quiz: [
    {
      q: 'Is there a single "Azure Certificate Manager" service?',
      opts: [
        "Yes, it manages all certificates",
        "No, certificate management is split across Key Vault, App Service, and Front Door",
        "Yes, but only for App Service",
        "No, Azure does not manage certificates at all",
      ],
      answer: 1,
      explain:
        "Unlike AWS ACM, Azure has no single certificate service. Each terminator has its own source: App Service and Front Door issue their own managed certificates, and Key Vault is the shared store Application Gateway and Front Door can read from.",
    },
    {
      q: "Your Application Gateway needs a TLS certificate. Where does it read it from?",
      opts: [
        "It generates its own certificate",
        "From Amazon Certificate Manager",
        "From a certificate in Azure Key Vault, referenced through a managed identity",
        "From the App Service managed certificate",
      ],
      answer: 2,
      explain:
        "Application Gateway (v2) reads the certificate from Key Vault using a managed identity, and polls every four hours for a renewed version. You can also upload a PFX directly, but Key Vault is the recommended, access-controlled store.",
    },
    {
      q: "You need a wildcard certificate for your web app. Can the free App Service managed certificate do it?",
      opts: [
        "Yes, all managed certificates support wildcards",
        "No, the free managed certificate does not support wildcards",
        "Yes, but only on the Premium tier",
        "Only if you also use Front Door",
      ],
      answer: 1,
      explain:
        "The free App Service managed certificate cannot cover a wildcard and cannot be exported. Azure's managed certificates are not the wildcard path: for a wildcard you bring your own certificate, stored in Key Vault, from a paid or CA-issued source.",
    },
    {
      q: "Front Door's managed certificate stopped rotating automatically. What is the most likely cause?",
      opts: [
        "Key Vault was deleted",
        "The domain no longer points a CNAME directly at the Front Door endpoint",
        "DigiCert stopped issuing certificates",
        "The certificate was too old",
      ],
      answer: 1,
      explain:
        "Front Door can only keep rotating while the custom domain's CNAME points straight at its endpoint. Switching to an apex A record or a chained CNAME breaks that, so you must re-validate before expiry or the certificate lapses.",
    },
    {
      q: "What auto-renews a certificate stored in Azure Key Vault?",
      opts: [
        "Every certificate in Key Vault renews automatically",
        "Only certificates from an integrated CA (DigiCert or GlobalSign) or self-signed ones",
        "Nothing, Key Vault never renews",
        "Only certificates under 2048 bits",
      ],
      answer: 1,
      explain:
        "Key Vault fully auto-renews certificates issued through an integrated CA (DigiCert or GlobalSign) and self-signed certificates. A certificate from a non-integrated CA only gets a near-expiry email notification, so its renewal is on you.",
    },
  ],
};

export const CONTENT: Record<Provider, ConceptContent> = {
  aws: AWS,
  azure: AZURE,
};
