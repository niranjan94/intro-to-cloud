import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the cdn lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "CloudFront is a managed edge service where AWS secures the infrastructure and you own the distribution config: it can serve HTTPS, but by default an S3 origin stays directly reachable and AWS WAF, access logging, signed URLs, and a modern TLS security policy are all opt-in.",
    practices: [
      {
        risk: "Origin bypass",
        label:
          "Lock the S3 origin behind Origin Access Control (OAC) and turn on S3 Block Public Access so files are reachable only through the distribution.",
        why: "Without OAC, viewers can request the S3 object URL directly and skip CloudFront, defeating your WAF, signed URLs, and geo rules. OAC makes CloudFront send authenticated (SigV4-signed) requests that the S3 bucket policy grants to the cloudfront.amazonaws.com service principal for your specific distribution ARN, and Block Public Access strips any public bucket or object ACL, so the only remaining path to the content runs through CloudFront where your controls apply.",
      },
      {
        risk: "Cleartext interception",
        label:
          "Set the Viewer protocol policy to redirect-to-HTTPS and require HTTPS to the origin (matching the viewer protocol), using the recommended TLS security policy.",
        why: "If viewers can connect over HTTP, session data and cookies travel in cleartext and can be read or tampered with on the path. Forcing HTTPS at the viewer and using the same protocol to the origin keeps the request encrypted on both hops, and choosing the latest security policy drops SSLv3 and weak ciphers in favor of TLS 1.2 or higher with perfect forward secrecy.",
      },
      {
        risk: "Web exploits (OWASP)",
        label:
          "Associate an AWS WAF web ACL with the distribution, using console one-click protection or a managed rule set.",
        why: "CloudFront evaluates every request against the associated web ACL before it reaches your origin, so SQL injection, XSS, and known-bad IPs from Amazon threat intelligence are blocked at the edge close to the attacker. With no web ACL attached, malicious requests pass straight through to your application, and the CloudFront Security dashboard shows no security metrics until AWS WAF is enabled.",
      },
      {
        risk: "Content leakage",
        label:
          "Gate private or paid content with signed URLs or signed cookies backed by a trusted key group, and rotate the signing keys periodically.",
        why: "CloudFront hashes and signs part of the URL or cookie with your private key and verifies it against the public key in the trusted key group, refusing to serve when the signature or expiry does not match, which stops link sharing and hotlinking of restricted files. Trusted key groups let you add and rotate RSA or ECDSA keys without root account credentials, so a leaked key can be retired quickly.",
      },
      {
        risk: "No forensic trail",
        label:
          "Enable CloudFront standard access logs (v2) so every request is recorded for audit and incident investigation.",
        why: "Access logs capture per-request detail (viewer IP, URI, response status, edge location) that is the primary evidence for investigating abuse or a breach and for tuning WAF rules. If logging is left off, an attack or data exfiltration through the CDN leaves no record to reconstruct what happened. Note that CloudFront delivers logs on a best-effort basis, so treat them as investigative evidence rather than a billing-grade count.",
      },
      {
        risk: "Geo/compliance exposure",
        label:
          "Apply CloudFront geographic restrictions to allow or deny delivery by viewer country where licensing or regulation requires it.",
        why: "CloudFront maps the viewer's IP to a country and returns a 403 for denied locations before serving, enforcing contractual or regulatory limits (for example video licensing) at the edge. Without geo restrictions the content is delivered globally by default, which can violate distribution agreements or export rules. The IP-to-country lookup is roughly 99.8 percent accurate, so use it for licensing, not as a hard security boundary.",
      },
    ],
  },
  azure: {
    posture:
      "Azure Front Door encrypts client traffic in transit with TLS and includes always-on infrastructure (network-layer) DDoS protection by default, but you still own the sharp edges: origins stay publicly reachable unless you lock them to Front Door, and WAF is opt-in (full Microsoft-managed rule sets require the Premium tier; Standard supports custom rules only).",
    practices: [
      {
        risk: "Origin bypass",
        label:
          "Restrict origins to accept traffic only from Front Door: use Private Link on Premium, or the AzureFrontDoor.Backend service tag plus validation of the X-Azure-FDID header.",
        why: "If the origin stays publicly routable, attackers can hit it directly and bypass Front Door's WAF and DDoS protection. Private Link (Premium) keeps origin traffic off the public internet entirely. Where Private Link is unavailable, filtering to the AzureFrontDoor.Backend service tag and checking that X-Azure-FDID matches your profile identifier rejects requests that did not come from your Front Door instance. Service-tag IP ranges are shared across all Azure customers, so the header check is essential, not optional.",
      },
      {
        risk: "Web exploits (OWASP)",
        label:
          "Attach an Azure WAF policy with Microsoft-managed rule sets to the Front Door profile (full managed rules require the Premium tier; Standard supports custom rules only).",
        why: "WAF inspects every incoming request at the network edge before it enters your virtual network, blocking OWASP Top 10 attacks, malicious bots via the IP Reputation rule set, and known-bad IPs close to the source. Front Door does not enable WAF by default, so without a policy attached, exploit traffic reaches your application unfiltered. Run a new policy in Detection mode first to log matches and tune out false positives, then switch it to Prevention mode.",
      },
      {
        risk: "Cleartext interception",
        label:
          "Enable end-to-end TLS, turn on the Redirect all traffic to use HTTPS setting, and set the minimum TLS version to 1.2 on custom domains.",
        why: "Front Door terminates the client TLS connection at the edge and opens a fresh connection to the origin, so both hops must use TLS or data travels in cleartext on part of the path. Redirecting HTTP to HTTPS and pinning a 1.2 minimum prevents downgrade to weak protocols and keeps the exchange encrypted between client, edge, and origin.",
      },
      {
        risk: "Credential exposure",
        label:
          "Enable a managed identity so Front Door authenticates to Azure Key Vault (and Entra-protected origins) without stored secrets.",
        why: "A system-assigned or user-assigned managed identity lets Front Door obtain tokens from Microsoft Entra ID to read Key Vault certificates or call origins, so there is no secret to leak, hardcode, or rotate manually. Falling back to static credentials creates a long-lived secret that, if exposed, hands an attacker access to your certificate store or backend.",
      },
      {
        risk: "Certificate expiry outage",
        label:
          "Use Azure Front Door managed TLS certificates by default, or store your own in Key Vault with the certificate version set to Latest for automatic rotation.",
        why: "Managed certificates are issued and rotated automatically, removing the most common cause of avoidable HTTPS outages: a forgotten renewal. If you bring your own certificate, pointing Front Door at the Latest Key Vault version means renewals propagate without manual reconfiguration, so the endpoint never serves an expired certificate.",
      },
      {
        risk: "Volumetric abuse",
        label:
          "Configure WAF rate-limiting rules on top of the built-in infrastructure DDoS protection to cap high-volume traffic per client IP.",
        why: "Front Door's platform DDoS protection absorbs network-layer floods automatically, but application-layer floods (many valid-looking HTTP requests) need a WAF rate-limit rule that throttles individual IPs once they exceed a threshold over a time window. Without rate limiting, a single abusive source can exhaust your origin's capacity even though each request looks legitimate to network-layer defenses.",
      },
    ],
  },
};
