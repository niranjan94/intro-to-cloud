import type { SecurityChecklist } from "@/components/lesson/lesson-reference";
import type { Provider } from "@/content/types";

/*
 * Security practices for the containers lesson, per provider. Each practice
 * teaches the mechanism and the failure mode, not just a rule. Grounded in the
 * providers' own security documentation (docs.aws.amazon.com and
 * learn.microsoft.com) and verified against those pages.
 */
export const SECURITY: Record<Provider, SecurityChecklist> = {
  aws: {
    posture:
      "Amazon ECS orchestrates your containers but leaves task hardening to you: on the EC2 launch type containers run as root and can reach the instance metadata service by default, so you own IAM scoping, network isolation, and image hygiene even though AWS secures the underlying fabric.",
    practices: [
      {
        risk: "Over-broad credentials",
        label:
          "Give every task its own IAM task role scoped to least privilege, distinct from the container instance role.",
        why: "A task role delivers temporary credentials to the container through the AWS_CONTAINER_CREDENTIALS_RELATIVE_URI endpoint, valid for six hours and then auto-rotated by the ECS container agent, so application code never holds long-lived keys. Without a per-task role the container falls back to the EC2 instance profile and inherits every permission the host has, so one compromised container can act as the whole node.",
      },
      {
        risk: "Metadata credential theft",
        label:
          "Block container access to the EC2 Instance Metadata Service by setting ECS_AWSVPC_BLOCK_IMDS to true on EC2 hosts.",
        why: "On the EC2 launch type a container can reach IMDS at 169.254.169.254 and read the instance profile credentials, escalating from the app to the host's IAM role. Setting ECS_AWSVPC_BLOCK_IMDS to true in /etc/ecs/ecs.config for awsvpc tasks (or ECS_ENABLE_TASK_IAM_ROLE_NETWORK_HOST to false for host mode) severs that path so the container can only use its own task role.",
      },
      {
        risk: "Unrestricted task traffic",
        label:
          "Run tasks in awsvpc network mode and use security groups to gate inbound and outbound traffic.",
        why: "awsvpc gives each task its own Elastic Network Interface with a VPC IP, and it is the only mode that lets you attach a security group directly to a task and the only mode Fargate supports. Without it, tasks share the host's network stack and you lose task-level firewalling, so a service behind a load balancer cannot restrict inbound traffic to only the load balancer's security group.",
      },
      {
        risk: "Plaintext data on the wire and at rest",
        label:
          "Terminate TLS at the load balancer with ACM certificates, and rely on default encryption at rest for ECR images and Fargate ephemeral storage.",
        why: "Fargate platform version 1.4.0 or later encrypts each task's 20 GiB of ephemeral storage with AES-256 using a Fargate-managed key, and Amazon ECR encrypts images at rest by default with SSE-S3 (AES-256) at no cost, so a snapshot or registry leak exposes only ciphertext · opt into SSE-KMS with a customer managed key when you need key control and CloudTrail auditing. For data in transit, terminate TLS at the Application Load Balancer with an AWS Certificate Manager certificate so on-path attackers cannot read client traffic.",
      },
      {
        risk: "Leaked secrets in config",
        label:
          "Inject secrets from AWS Secrets Manager through the task execution role instead of hardcoding them.",
        why: "The task execution role lets the ECS agent pull referenced secrets, such as image pull credentials or connection strings, from Secrets Manager and hand them to the container at launch, so values never live in the task definition, image, or source control. Baking secrets into environment variables or images means anyone with DescribeTaskDefinition or registry read access recovers them.",
      },
      {
        risk: "Container breakout",
        label:
          "Run containers as a non-root user with a read-only root filesystem, forbid privileged mode, and scan images for CVEs.",
        why: "Containers default to the root user and a writable root filesystem, and a privileged container inherits host Linux capabilities, so a single exploited process can tamper with the host. Setting a USER directive, marking readonlyRootFilesystem true, disabling privileged launches (ECS_DISABLE_PRIVILEGED), and rebuilding images that ECR scanning flags HIGH or CRITICAL shrink the blast radius of any code-execution bug.",
      },
    ],
  },
  azure: {
    posture:
      "Azure Container Apps is a serverless platform with no host access and HTTPS on by default (allowInsecure is false), but a Container Apps environment is reachable from the public internet unless you deploy it with VNet integration, internal ingress, or a private endpoint, and identity, secrets, and egress control are still yours to configure.",
    practices: [
      {
        risk: "Stored credentials",
        label:
          "Assign a managed identity and authenticate to Azure services and ACR through it instead of keys or passwords.",
        why: "A system-assigned or user-assigned managed identity gives the app an automatically managed Microsoft Entra ID identity, so it authenticates to Key Vault, Storage, SQL, or Azure Container Registry (via the AcrPull role) with no secret in code or config and with rotation handled by the platform. Falling back to registry admin credentials or connection strings means a leaked config file hands an attacker durable access.",
      },
      {
        risk: "Public internet exposure",
        label:
          "Use VNet integration with internal ingress and a private endpoint, then disable public network access at the environment level.",
        why: "By default the environment is internet-reachable · integrating it into a virtual network and setting internal ingress confines inbound traffic to callers inside the VNet, and adding a Private Link endpoint (which requires public network access to be set to Disabled) forces client traffic through a private IP so it never traverses the public internet. Skipping this leaves every app in the environment addressable from the internet and exposed to external attack.",
      },
      {
        risk: "Plaintext traffic",
        label:
          "Keep allowInsecure false to enforce HTTPS and enable mTLS for service-to-service traffic.",
        why: "The Envoy ingress proxy defaults to allowInsecure false, which redirects HTTP on port 80 to HTTPS on 443 using TLS 1.2 or 1.3 so data in transit is encrypted against network-layer eavesdropping; enabling environment-level mTLS additionally authenticates and encrypts traffic between apps by verifying both parties. Turning allowInsecure on to smooth a client integration silently reopens unencrypted connections.",
      },
      {
        risk: "Secret sprawl",
        label:
          "Store secrets in Azure Key Vault and reference them from the container app rather than inline values.",
        why: "Container Apps can reference Key Vault secrets (resolved via managed identity) and surface them as environment variables or mounted files, keeping certificates and connection strings out of the app's own configuration and giving you a central audit log of retrievals and rotations. Storing secrets directly in the app for production leaves them readable to anyone who can view the app definition and with no rotation trail.",
      },
      {
        risk: "Unauthenticated endpoints",
        label:
          "Enable built-in authentication (Easy Auth) with Microsoft Entra ID and set Restrict access to Require authentication.",
        why: "The built-in auth middleware runs as a sidecar container on each replica and validates federated identity tokens before requests reach your code, so setting Restrict access to Require authentication rejects anonymous traffic with a redirect or 401 without any auth code in the app. Without it, an ingress-enabled app trusts every caller and you must build and maintain token validation yourself, a common source of bugs.",
      },
      {
        risk: "Data exfiltration",
        label:
          "Control egress with user-defined routes through Azure Firewall and restrict subnets with NSGs.",
        why: "On a workload profiles environment, user-defined routes send outbound traffic through an Azure Firewall so containers can only reach approved destinations, and deny-by-default Network Security Group rules on the Container Apps subnet limit which networks can talk to the apps. Leaving egress open lets a compromised container freely call out to attacker infrastructure and exfiltrate data.",
      },
    ],
  },
};
