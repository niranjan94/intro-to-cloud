import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the TLS Certificates lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own documentation (docs.aws.amazon.com and learn.microsoft.com)
 * and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "ACM issues publicly trusted certificates for free and, with DNS validation, renews them for you, so most certificate risk is operational rather than cryptographic: prove control the way that keeps renewal automatic, terminate TLS on a service that can, and do not let the validation record or the attachment quietly disappear.",
    practices: [
      {
        risk: "Silent expiry",
        label:
          "Validate with DNS and leave the CNAME published, rather than using email validation.",
        why: "ACM renews a certificate automatically only while the validation CNAME stays in place and the certificate is still attached to a service. Email-validated certificates need a human to click a renewal link every time, so one missed message means an expired certificate and a full-page browser warning for every visitor.",
      },
      {
        risk: "Plaintext downgrade",
        label:
          "Add an HTTPS listener with the ACM certificate and redirect HTTP to HTTPS.",
        why: "Terminating TLS on the load balancer or CloudFront encrypts the client leg, and a redirect from port 80 keeps a client from staying on plaintext HTTP, where an on-path attacker could read cookies or tamper with responses. The certificate is what makes the HTTPS listener possible.",
      },
      {
        risk: "Weak TLS",
        label:
          "Choose a modern predefined security policy on the HTTPS listener.",
        why: "The listener's security policy decides which TLS versions and ciphers are accepted. A current policy refuses the outdated TLS 1.0 and 1.1 and the weak ciphers older policies still permit, closing downgrade attacks at the front door without touching your instances.",
      },
      {
        risk: "Private-key exposure",
        label:
          "Keep the default non-exportable certificate, rather than reaching for an exportable one.",
        why: "A default ACM public certificate never releases its private key, so the key cannot leak from a server or a backup. You attach the certificate to an integrated service instead of copying key material around. Exportable certificates exist for self-managed hosts, but then protecting the key becomes your job.",
      },
      {
        risk: "Wrong-Region certificate",
        label:
          "Request CloudFront certificates in us-east-1 and keep load-balancer certificates in the balancer's Region.",
        why: "ACM certificates are regional and cannot be copied across Regions, and CloudFront only accepts a certificate from us-east-1. A certificate in the wrong Region simply will not attach, and under deadline pressure that is when people are tempted to weaken TLS to ship.",
      },
    ],
  },
  azure: {
    posture:
      "Azure has no single certificate service, so the first security choice is where TLS terminates and which certificate source feeds it. Managed certificates from App Service and Front Door issue and renew for free; Key Vault is the controlled store for certificates you bring, with access and rotation you configure.",
    practices: [
      {
        risk: "Silent expiry",
        label:
          "Prefer managed certificates, and keep DNS pointed the way rotation needs.",
        why: "App Service and Front Door managed certificates auto-renew, but Front Door only keeps rotating while the domain's CNAME points directly at its endpoint. Move to an apex A record or a chained CNAME and rotation stops, so the certificate lapses into a browser warning unless you re-validate in time.",
      },
      {
        risk: "Plaintext downgrade",
        label:
          "Terminate TLS on Application Gateway or Front Door and redirect HTTP to HTTPS.",
        why: "An HTTPS listener encrypts the client leg with the certificate you supply, and a redirect keeps clients off plaintext port 80. This is a Layer 7 capability: Azure Load Balancer passes bytes through at Layer 4 and cannot terminate TLS, so the certificate lives on the gateway or the front door.",
      },
      {
        risk: "Weak TLS",
        label:
          "Apply a modern predefined TLS policy on the gateway's listener.",
        why: "Application Gateway lets you set the minimum TLS version and the allowed ciphers through a predefined or custom SSL policy. A current policy refuses TLS 1.0 and 1.1 and weak ciphers a client might otherwise negotiate, closing downgrade attacks at the frontend.",
      },
      {
        risk: "Key sprawl",
        label:
          "Store bring-your-own certificates in Key Vault and reference them, instead of pasting PFX files into configuration.",
        why: "Key Vault gives one audited, access-controlled home for private keys. Application Gateway reads the certificate through a managed identity rather than holding a copy, so the key never lands in a config file, a VM image, or a deployment pipeline where it could leak.",
      },
      {
        risk: "Broken auto-rotation",
        label:
          "Reference the Key Vault secret without a version so rotation is picked up.",
        why: "Application Gateway rolls onto a renewed certificate only when the listener points at the versionless secret identifier, re-polling Key Vault every four hours. Pin a specific version and the gateway keeps serving the old certificate until it expires, defeating the renewal you set up.",
      },
    ],
  },
};
