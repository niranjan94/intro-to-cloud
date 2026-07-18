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
import { ContainersChapters } from "./chapters";

const concept = getConcept("containers");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is Amazon ECS?",
      href: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html",
      note: "The orchestration model: clusters, task definitions, tasks, and services.",
    },
    {
      label: "Amazon ECS task definitions",
      href: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html",
      note: "The JSON blueprint: image, CPU and memory, ports, environment, and roles.",
    },
    {
      label: "Architect for AWS Fargate for Amazon ECS",
      href: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html",
      note: "The serverless capacity option: run tasks with no EC2 instances to manage.",
    },
    {
      label: "Automatically scale your Amazon ECS service",
      href: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html",
      note: "Service Auto Scaling through Application Auto Scaling and CloudWatch.",
    },
    {
      label: "Use load balancing to distribute service traffic",
      href: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html",
      note: "Put an Elastic Load Balancing load balancer and target group in front.",
    },
    {
      label: "Concepts and components of Amazon ECR",
      href: "https://docs.aws.amazon.com/AmazonECR/latest/userguide/concept-and-components.html",
      note: "The private image registry: registry, repositories, and image references.",
    },
  ],
  azure: [
    {
      label: "Azure Container Apps overview",
      href: "https://learn.microsoft.com/en-us/azure/container-apps/overview",
      note: "The serverless platform: revisions, scaling, ingress, and traffic splitting.",
    },
    {
      label: "Azure Container Apps environments",
      href: "https://learn.microsoft.com/en-us/azure/container-apps/environment",
      note: "The secure boundary that holds apps, its virtual network, and logging.",
    },
    {
      label: "Update and deploy changes with revisions",
      href: "https://learn.microsoft.com/en-us/azure/container-apps/revisions",
      note: "Immutable revisions, single versus multiple mode, and blue/green rollouts.",
    },
    {
      label: "Set scaling rules in Azure Container Apps",
      href: "https://learn.microsoft.com/en-us/azure/container-apps/scale-app",
      note: "KEDA-based scale rules, replica limits, and scale to zero.",
    },
    {
      label: "Ingress in Azure Container Apps",
      href: "https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview",
      note: "Built-in external and internal ingress with an FQDN and managed TLS.",
    },
  ],
};

const BLURB =
  "Package an application and its dependencies into a portable image, then let a managed service run copies of it for you: pulling the image, placing it on compute, keeping the right number healthy, scaling with load, routing traffic, and rolling out new versions. You bring the image and a small blueprint; the platform runs the containers.";

const ELEVATOR =
  "package your app as an image once, and let the platform run and scale copies of it";

const TERMS: GlossaryTerm[] = [
  {
    term: "Container image",
    definition:
      "A read-only, layered snapshot of an app and its dependencies that runs the same anywhere.",
  },
  {
    term: "Registry (Amazon ECR / ACR)",
    definition:
      "The managed service that stores and serves your images, addressed by reference.",
  },
  {
    term: "Task definition / Container app template",
    definition:
      "The blueprint declaring the image, CPU, memory, ports, and environment.",
  },
  {
    term: "Task / Replica",
    definition:
      "One running instance of the container(s) the blueprint defines.",
  },
  {
    term: "Service / Container app",
    definition:
      "The manager that keeps the desired number of instances running and heals failures.",
  },
  {
    term: "Cluster / Environment",
    definition: "The boundary the platform runs your containers inside.",
  },
  {
    term: "Fargate / Workload profile",
    definition:
      "The serverless compute the containers run on, with no servers to provision.",
  },
  {
    term: "Service Auto Scaling / KEDA rules",
    definition:
      "The mechanism that adds and removes instances as load rises and falls.",
  },
];

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "The container image and what runs inside it",
      "The task definition: CPU, memory, ports, and environment",
      "IAM task and execution roles for least privilege",
      "Service desired count and Application Auto Scaling policies",
      "Security groups, subnets, and load balancer target groups",
      "Application logs, health checks, and secrets in Secrets Manager",
    ],
    providerManages: [
      "The Fargate node OS, kernel, and runtime patching",
      "The ECS control plane that schedules and places tasks",
      "Health monitoring and replacement of failed tasks",
      "Scaling and provisioning of the underlying compute",
      "Physical hosts, network fabric, and data center security",
    ],
    mutable: [
      "Desired task count",
      "Task definition revision the service runs",
      "Deployment configuration and circuit breaker",
      "Subnets and security groups (network config)",
      "Load balancer and target group configuration",
      "Capacity provider strategy and platform version",
    ],
    immutable: [
      "Service name",
      "Cluster the service belongs to",
      "Launch type (Fargate vs EC2)",
      "Scheduling strategy (REPLICA or DAEMON)",
      "A task definition revision's contents",
      "Task definition awsvpc network mode",
    ],
  },
  azure: {
    youManage: [
      "The container image and what runs inside it",
      "The container app template: CPU, memory, and environment",
      "Managed identity and Azure RBAC role assignments",
      "KEDA scale rules, replica limits, and scale to zero",
      "Ingress configuration, revisions, and traffic splitting",
      "Application logs, health probes, and app secrets",
    ],
    providerManages: [
      "The node OS, kernel, and container runtime patching",
      "The managed environment, KEDA, and Dapr infrastructure",
      "Health monitoring and rescheduling of failed replicas",
      "Scaling infrastructure and managed TLS certificates",
      "Physical hosts, network fabric, and data center security",
    ],
    mutable: [
      "Ingress settings and traffic splitting rules",
      "Secret values referenced by the app",
      "Active revision mode (single or multiple)",
      "Container image (via new revision)",
      "CPU, memory and scale rules (via new revision)",
      "Environment variables (via new revision)",
    ],
    immutable: [
      "Container app name",
      "Resource group and region",
      "Associated Container Apps environment",
      "An individual revision once created",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "Basic Fargate service",
        blurb:
          "Stands up a single always-on task on serverless Fargate. Reach for this first when you just want one copy of a container running with no load balancer or scaling.",
        prompt:
          "Provision a containerized service on Amazon ECS using the aws CLI on AWS Fargate. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create an ECS cluster named intro-cloud-cluster, register a task definition that uses the awsvpc network mode with sensible defaults (256 CPU units, 512 MB memory, a public sample image, and port 80), and create a Fargate service named intro-cloud-service with a desired count of 1. Show me the full plan, including every resource you intend to create, and wait for my confirmation before running any command that creates or deletes resources. Prefer idempotent checks that reuse existing resources over recreating them. When finished, print the cluster ARN, the task definition ARN, and the service ARN.",
      },
      {
        label: "Load-balanced + autoscaling",
        blurb:
          "Puts an Application Load Balancer in front of the service and adds target-tracking autoscaling on CPU and request count. Reach for this when the service takes public traffic and load varies.",
        prompt:
          "Provision a load-balanced, autoscaling containerized service on Amazon ECS using the aws CLI on AWS Fargate. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create an ECS cluster named intro-cloud-cluster, register an awsvpc task definition with sensible defaults (256 CPU units, 512 MB memory, a public sample image, and port 80), create an internet-facing Application Load Balancer named intro-cloud-alb with a target group of type ip and an HTTP listener on port 80, and create a Fargate service named intro-cloud-service that registers with that target group. Then register the service as a scalable target with Application Auto Scaling (`aws application-autoscaling register-scalable-target` on ecs:service:DesiredCount) and add two target-tracking policies via `aws application-autoscaling put-scaling-policy`: one on ECSServiceAverageCPUUtilization at 60 percent and one on ALBRequestCountPerTarget at 1000 requests, with a minimum of 2 and a maximum of 6 tasks. Tag every resource with project=intro-cloud for easy cleanup. Show me the full plan, including every resource you intend to create, and wait for my confirmation before running any command that creates or deletes resources. Prefer idempotent checks that reuse existing resources over recreating them. When finished, print the cluster ARN, the task definition ARN, the service ARN, the load balancer ARN, and the load balancer DNS name.",
      },
      {
        label: "Scheduled cron task",
        blurb:
          "Runs a container on a schedule instead of keeping it always on, using an EventBridge Scheduler rule that launches a one-off Fargate task. Reach for this for nightly batch jobs and periodic maintenance.",
        prompt:
          "Provision a scheduled, one-off container task on Amazon ECS using the aws CLI on AWS Fargate. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create an ECS cluster named intro-cloud-cluster if it does not already exist, register an awsvpc task definition named intro-cloud-job with sensible defaults (256 CPU units, 512 MB memory, and a public sample image that runs a short command and exits), and create an Amazon EventBridge Scheduler schedule named intro-cloud-schedule with a cron expression that runs once daily, targeting the ECS RunTask API to launch a single Fargate task from that task definition (including the awsvpc network configuration and the IAM role EventBridge Scheduler needs to call RunTask). Do not create a long-running service. Tag every resource with project=intro-cloud for easy cleanup. Show me the full plan, including every resource you intend to create, and wait for my confirmation before running any command that creates or deletes resources. Prefer idempotent checks that reuse existing resources over recreating them. When finished, print the cluster ARN, the task definition ARN, and the schedule ARN.",
      },
      {
        label: "Config + secrets from env",
        blurb:
          "Injects plain config as environment variables and pulls sensitive values from Secrets Manager into the container at launch. Reach for this when the container is configured entirely through its environment.",
        prompt:
          "Provision a containerized service on Amazon ECS using the aws CLI on AWS Fargate that reads its configuration and secrets from the environment. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create a secret in AWS Secrets Manager named intro-cloud/app-secret holding a sample value, create an ECS cluster named intro-cloud-cluster, and register an awsvpc task definition with sensible defaults (256 CPU units, 512 MB memory, a public sample image, and port 80) that sets a plain environment variable APP_ENV=demo through the environment field and injects the secret as an environment variable APP_SECRET through the secrets field referencing the Secrets Manager ARN, granting the execution role permission to read that secret. Then create a Fargate service named intro-cloud-service with a desired count of 1. Tag every resource with project=intro-cloud for easy cleanup. Show me the full plan, including every resource you intend to create, and wait for my confirmation before running any command that creates or deletes resources. Prefer idempotent checks that reuse existing resources over recreating them. When finished, print the cluster ARN, the task definition ARN, the service ARN, and the secret ARN.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "Basic container app",
        blurb:
          "Stands up a single container app with external ingress inside a fresh environment. Reach for this first when you just want one HTTP-reachable app running with sensible defaults.",
        prompt:
          "Provision a containerized service on Azure Container Apps using the az CLI. First run `az account show` and confirm the active subscription and location before doing anything else. Create a resource group named intro-cloud-rg, a Container Apps environment named intro-cloud-env, and a container app named intro-cloud-app using a public sample image with sensible defaults (0.25 vCPU, 0.5 GB memory, external ingress on port 80, and a scale range of 0 to 3 replicas). Echo the full plan, including every resource you intend to create, and wait for my confirmation before running any command that creates or deletes resources. Prefer idempotent checks that reuse existing resources over recreating them. When finished, print the container app resource id and its ingress FQDN.",
      },
      {
        label: "Ingress + HTTP autoscaling",
        blurb:
          "Exposes the app through external ingress and adds a KEDA HTTP scale rule so replicas track concurrent requests. Reach for this when the app takes public traffic and load varies.",
        prompt:
          "Provision a public-facing, autoscaling containerized service on Azure Container Apps using the az CLI. First run `az account show` and confirm the active subscription and location before doing anything else. Create a resource group named intro-cloud-rg, a Container Apps environment named intro-cloud-env, and a container app named intro-cloud-app using a public sample image with sensible defaults (0.25 vCPU, 0.5 GB memory, and external ingress on port 80). Set the replica range with a minimum of 1 and a maximum of 10, and add an HTTP scale rule named http-rule that targets 50 concurrent requests per replica (`az containerapp create` with `--scale-rule-name`, `--scale-rule-type http`, and `--scale-rule-http-concurrency`, or the equivalent `az containerapp update`). Tag every resource with project=intro-cloud for easy cleanup. Echo the full plan, including every resource you intend to create, and wait for my confirmation before running any command that creates or deletes resources. Prefer idempotent checks that reuse existing resources over recreating them. When finished, print the container app resource id, its ingress FQDN, and the configured scale rule.",
      },
      {
        label: "Scheduled cron job",
        blurb:
          "Runs a container on a cron schedule as a Container Apps job instead of a long-running app. Reach for this for nightly batch work and periodic maintenance tasks.",
        prompt:
          "Provision a scheduled, one-off container job on Azure Container Apps using the az CLI. First run `az account show` and confirm the active subscription and location before doing anything else. Create a resource group named intro-cloud-rg if it does not already exist, a Container Apps environment named intro-cloud-env, and a Container Apps job named intro-cloud-job (`az containerapp job create` with `--trigger-type Schedule`) using a public sample image that runs a short command and exits, with sensible defaults (0.25 vCPU, 0.5 GB memory) and a cron expression that runs once daily. Do not create a long-running container app. Tag every resource with project=intro-cloud for easy cleanup. Echo the full plan, including every resource you intend to create, and wait for my confirmation before running any command that creates or deletes resources. Prefer idempotent checks that reuse existing resources over recreating them. When finished, print the job resource id and its configured cron schedule.",
      },
      {
        label: "Config + secrets from env",
        blurb:
          "Defines plain config as environment variables and stores sensitive values as container app secrets referenced by the environment. Reach for this when the container is configured entirely through its environment.",
        prompt:
          'Provision a containerized service on Azure Container Apps using the az CLI that reads its configuration and secrets from the environment. First run `az account show` and confirm the active subscription and location before doing anything else. Create a resource group named intro-cloud-rg, a Container Apps environment named intro-cloud-env, and a container app named intro-cloud-app using a public sample image with sensible defaults (0.25 vCPU, 0.5 GB memory, and external ingress on port 80). Define a secret named app-secret holding a sample value (`--secrets`), set a plain environment variable APP_ENV=demo, and set an environment variable APP_SECRET that references the secret using the secretref syntax (`--env-vars "APP_ENV=demo" "APP_SECRET=secretref:app-secret"`). Tag every resource with project=intro-cloud for easy cleanup. Echo the full plan, including every resource you intend to create, and wait for my confirmation before running any command that creates or deletes resources. Prefer idempotent checks that reuse existing resources over recreating them. When finished, print the container app resource id, its ingress FQDN, and the names of the configured secrets.',
      },
    ],
  },
};

/**
 * The Containers lesson. The interactive body lives in ContainersChapters and is
 * driven per provider: ECS keeps the blueprint (task definition), the manager
 * (service), and the boundary (cluster) as separate resources, while Container
 * Apps folds them into one container-app resource made of immutable revisions in
 * an environment. They diverge again in compute (Fargate or EC2 versus always
 * serverless), scaling (no default scale-to-zero versus KEDA scale-to-zero), and
 * rollout (rolling task replacement versus a revision flip with optional weighted
 * traffic split). This shell provides the shared framing, the cross-provider
 * equivalence, the glossary, and links to the authoritative docs for the lens.
 */
export function ContainersLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon ECS", code: "AWS::ECS · Fargate" }}
        azure={{
          service: "Azure Container Apps",
          code: "Microsoft.App/containerApps",
        }}
        elevator={ELEVATOR}
      />
      <ContainersChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
