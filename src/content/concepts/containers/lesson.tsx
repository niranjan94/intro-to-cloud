import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
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
      <ContainersChapters provider={provider} />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
