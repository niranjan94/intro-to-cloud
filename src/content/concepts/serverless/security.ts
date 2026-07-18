import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the serverless lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "Lambda runs your code on AWS-managed, patched infrastructure and always encrypts environment variables at rest with a KMS key by default, but you own the function's IAM execution role, how it is invoked and authenticated, what secrets it holds, and its network reach: an over-permissive role or an unauthenticated public trigger is the sharp edge.",
    practices: [
      {
        risk: "Over-broad permissions",
        label:
          "Scope each function's IAM execution role to least privilege, ideally one role per function.",
        why: "A Lambda function assumes its execution role for every action it takes against other AWS services, so the role's policy is the blast radius if the code is compromised. Start from AWS managed policies but narrow to customer managed policies that grant only the specific actions, resources, and conditions the function needs, and validate them with IAM Access Analyzer. A shared or wildcard role means one vulnerable function can read or delete resources across your whole account.",
      },
      {
        risk: "Unauthenticated invocation",
        label:
          "Put public functions behind API Gateway with IAM, Amazon Cognito, or a Lambda authorizer, and attach AWS WAF.",
        why: "A function exposed to the internet is invocable by anyone who finds the endpoint unless you enforce authentication first. Front it with API Gateway and use IAM or Amazon Cognito authorizers so requests missing a valid token are rejected before they reach or bill your function, and requests rejected this way do not count toward throttling quotas. Attach AWS WAF to blunt SQL injection, XSS, and DoS traffic, because skipping this lets attackers drive invocations, run up cost, and probe your logic directly.",
      },
      {
        risk: "Secret exposure",
        label:
          "Encrypt sensitive environment variables with a customer managed KMS key and enable the client-side encryption helpers.",
        why: "Lambda always encrypts environment variables at rest, but by default with an AWS managed key, and their values are visible in plaintext in the console to anyone with read access. Use a customer managed KMS key so you control rotation and can deny decrypt access via the key policy, and enable the console encryption helpers so sensitive values are encrypted client-side and protected in transit to the function. Storing raw credentials as plain environment variables makes them readable to every principal who can describe the function.",
      },
      {
        risk: "Plaintext interception",
        label:
          "Communicate with Lambda and downstream AWS resources over TLS 1.2 or higher only.",
        why: "Lambda API endpoints only support secure connections over HTTPS, and AWS requires TLS 1.2 and recommends TLS 1.3 for management traffic, which keeps credentials and payloads encrypted and authenticated on the wire. Extend the same discipline to the calls your function code makes to databases, EFS, and other services so data in transit is never sent in the clear. Downgrading or disabling TLS on a downstream call reopens the interception and man-in-the-middle risk that the platform closed.",
      },
      {
        risk: "Tampered code",
        label:
          "Enable Lambda code signing and set the signature validation policy to Enforce.",
        why: "Code signing uses AWS Signer to attach a digital signature to your deployment package, and once a code signing configuration is attached, Lambda always blocks unsigned or altered packages at deployment time. The default UntrustedArtifactOnDeployment policy is Warn, which only logs a warning when a signature is expired, revoked, or from a disallowed profile, so set it to Enforce to block those too. Without code signing, anyone who can call UpdateFunctionCode can silently replace your function's logic.",
      },
      {
        risk: "Network exposure",
        label:
          "Attach functions that reach private resources to VPC private subnets, and grant only the documented ENI permissions.",
        why: "Connecting a function to private subnets lets it reach RDS, ElastiCache, and internal services without traversing the public internet, and it inherits the subnet's security group rules for egress control. The EC2 network-interface permissions Lambda needs on the execution role (for example ec2:CreateNetworkInterface) are implicitly callable by your function code, so use the AWSLambdaVPCAccessExecutionRole managed policy or grant only those documented ENI actions and nothing broader. Leaving a data-plane function on public egress or granting wide EC2 rights expands both exposure and lateral-movement potential.",
      },
    ],
  },
  azure: {
    posture:
      "Azure Functions runs on the hardened, App Service-managed platform with app settings and stored secrets encrypted at rest, but out of the box public network access is allowed, clients may connect over plain HTTP, and legacy publishing (basic auth) credentials are enabled: locking down identity, transport, and network exposure is the customer's job.",
    practices: [
      {
        risk: "Hard-coded credentials",
        label:
          "Authenticate to other Azure resources with a managed identity instead of connection strings or keys.",
        why: "A system-assigned or user-assigned managed identity from Microsoft Entra ID lets your function app call Key Vault, Storage, and other Entra-protected resources with a platform-managed credential that Azure provisions and rotates and never exposes in code or app settings. Connection strings and keys stored in application settings give every function in the app the same standing permissions, and any leak of them is long-lived. Managed identities remove that stored secret entirely and add fine-grained, auditable access control.",
      },
      {
        risk: "Legacy credential abuse",
        label:
          "Disable basic (publishing) authentication and require Microsoft Entra ID for deployment and SCM access.",
        why: "Function apps ship with local publishing credentials enabled by default: username and password secrets that bypass Entra ID and its Conditional Access controls. Disable basic authentication so deployment and SCM (Kudu) access are governed by Entra ID identities, tokens, and Conditional Access policies instead. Leaving these credentials active gives attackers a password-based path to push code that never touches your identity guardrails.",
      },
      {
        risk: "Plaintext interception",
        label:
          "Enforce HTTPS Only and require the latest TLS version on the function app.",
        why: "By default clients can reach function endpoints over either HTTP or HTTPS, so an unencrypted request can carry access keys and payloads in the clear. Turn on HTTPS Only to redirect HTTP to TLS, and set a minimum TLS version so weak, downgradable protocol versions are refused. Without this, credentials in the request and the response data are exposed to network interception.",
      },
      {
        risk: "Weak endpoint auth",
        label:
          "Do not rely on function access keys alone: layer App Service Authentication (Entra ID) or API Management in front.",
        why: "Function access keys only make an endpoint harder to guess: they are shared secrets, not proof of caller identity. Enable App Service Authentication/Authorization with Microsoft Entra ID, or front the app with API Management, so requests are positively authenticated and you can make authorization decisions per identity. Treating keys as your security boundary means a single leaked key grants full access with no per-user revocation or audit.",
      },
      {
        risk: "Public data exposure",
        label:
          "Restrict network reach with private endpoints and VNet integration rather than leaving public access open.",
        why: "Functions allows public network access by default, so the app and its endpoints are reachable from the internet until you constrain them. Deploy private endpoints via Azure Private Link and use inbound IP access restrictions or NSG rules so traffic arrives only from your virtual network and trusted sources. Leaving the default open posture exposes the app's HTTP surface and management endpoints to the entire internet.",
      },
      {
        risk: "Privileged admin surface",
        label:
          "Disable the runtime /admin endpoints by setting the functionsRuntimeAdminIsolationEnabled site property to true.",
        why: "The Functions host serves administrative operations under the /admin route, such as host status and test invocations, gated only by the app's master key. Setting functionsRuntimeAdminIsolationEnabled to true disables these endpoints so administrative actions go through the Azure Resource Manager Microsoft.Web/sites API, which is governed by Azure RBAC. Leaving /admin exposed means anyone who obtains the master key can drive privileged host operations outside your RBAC controls.",
      },
    ],
  },
};
