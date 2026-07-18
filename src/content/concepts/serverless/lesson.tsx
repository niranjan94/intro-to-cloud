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
import { ServerlessChapters } from "./chapters";

const concept = getConcept("serverless");

const DOCS: Record<Provider, DocLink[]> = {
  aws: [
    {
      label: "What is AWS Lambda?",
      href: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html",
      note: "The service model: handlers, triggers, and event-driven execution.",
    },
    {
      label: "Understanding the Lambda execution environment lifecycle",
      href: "https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html",
      note: "The Init and Invoke phases, freezing, and what a cold start really is.",
    },
    {
      label: "Understanding Lambda function scaling",
      href: "https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html",
      note: "One environment per concurrent request, plus reserved and provisioned concurrency.",
    },
    {
      label: "Invoking Lambda functions",
      href: "https://docs.aws.amazon.com/lambda/latest/dg/lambda-invocation.html",
      note: "Synchronous versus asynchronous, triggers, and event source mappings.",
    },
    {
      label: "Lambda quotas",
      href: "https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html",
      note: "Memory, timeout, payload, package size, and concurrency limits.",
    },
  ],
  azure: [
    {
      label: "Azure Functions triggers and bindings",
      href: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings",
      note: "One trigger per function, plus declarative input and output bindings.",
    },
    {
      label: "Azure Functions hosting options",
      href: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale",
      note: "Consumption, Flex Consumption, and Premium: scaling, timeouts, and cold starts.",
    },
    {
      label: "Flex Consumption plan hosting",
      href: "https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan",
      note: "The recommended serverless plan: instance sizes, always-ready instances, scale to 1,000.",
    },
    {
      label: "Event-driven scaling in Azure Functions",
      href: "https://learn.microsoft.com/en-us/azure/azure-functions/event-driven-scaling",
      note: "How the host adds and removes instances based on the event backlog.",
    },
    {
      label: "Estimating consumption-based costs",
      href: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-consumption-costs",
      note: "Executions and GB-seconds on the Flex Consumption and Consumption plans.",
    },
  ],
};

const BLURB =
  "Serverless functions run your code in response to an event, then get out of the way. You upload a handler, connect it to a trigger, and the platform creates the compute to run it, scales that compute out and back to zero with demand, and bills you only for the requests and the time your code actually runs. There are no servers to size, patch, or keep alive.";

const ELEVATOR =
  "upload a function, wire it to an event, pay only when it runs";

const TERMS: GlossaryTerm[] = [
  {
    term: "Function / Handler",
    definition:
      "The unit of code the platform runs. A handler receives the triggering event and returns a result.",
  },
  {
    term: "Trigger",
    definition:
      "The event source that invokes the function: an HTTP request, a new file, a queue message, a schedule.",
  },
  {
    term: "Event source mapping / Binding",
    definition:
      "How input and output are wired. AWS polls streams via event source mappings; Azure adds declarative input and output bindings.",
  },
  {
    term: "Execution environment / Instance",
    definition:
      "The isolated sandbox one invocation runs in. A fresh one costs a cold start; a reused one is warm.",
  },
  {
    term: "Cold start",
    definition:
      "The init time to set up a new environment before the handler runs. Absent on a reused environment.",
  },
  {
    term: "Concurrency",
    definition:
      "The number of requests in flight at once. Each concurrent request gets its own environment or instance.",
  },
  {
    term: "Provisioned / Always-ready",
    definition:
      "Pre-warmed capacity kept initialized so latency-sensitive paths avoid cold starts, at a cost.",
  },
  {
    term: "GB-second",
    definition:
      "The compute unit you are billed on: allocated memory multiplied by run time. No traffic means no charge.",
  },
];

const RESPONSIBILITY: Record<Provider, ResponsibilitySplit> = {
  aws: {
    youManage: [
      "Function code, handler logic, and language runtime choice",
      "Dependencies and the deployment package or container image",
      "The execution role and IAM permissions the function assumes",
      "Triggers, event source mappings, and environment variables",
      "Memory allocation, timeout, and reserved or provisioned concurrency",
      "Structured logging, tracing, and CloudWatch alarms",
    ],
    providerManages: [
      "The underlying execution environment and its host OS",
      "Runtime patching and the Firecracker microVM isolation layer",
      "Automatic scaling out and back to zero with demand",
      "Fleet capacity, availability, and event polling infrastructure",
      "The physical hosts, hardware, and data-center security",
    ],
  },
  azure: {
    youManage: [
      "Function code, handler logic, and language runtime choice",
      "Dependencies and the deployment package or container image",
      "The managed identity and Azure RBAC role assignments",
      "Triggers, input and output bindings, and app settings",
      "The hosting plan, instance size, and scale ceiling",
      "Application Insights logging, tracing, and alert rules",
    ],
    providerManages: [
      "The Functions host runtime and the worker instance OS",
      "Runtime and language worker patching and updates",
      "Event-driven scaling across instances with demand",
      "Instance capacity, availability, and the scale controller",
      "The physical hosts, hardware, and data-center security",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    prompt:
      "Provision an AWS Lambda function using the aws CLI. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create a minimal Node.js handler zipped into a deployment package, an IAM execution role that trusts lambda.amazonaws.com with the AWSLambdaBasicExecutionRole policy attached, and a function named intro-lambda-demo with sensible defaults (128 MB memory, a 10 second timeout). Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After the function is created, invoke it once to verify it responds. Finally, print the function ARN, name, and CloudWatch log group so I can find it.",
  },
  azure: {
    cli: "az",
    prompt:
      "Provision an Azure Functions app using the az CLI. First run `az account show` and confirm the active subscription and the target region before doing anything else. Create a resource group named intro-func-rg, a storage account for the function app, and a Flex Consumption function app named intro-func-demo running a minimal Node.js HTTP-triggered function with sensible defaults. Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After the app is deployed, call its endpoint once to verify it responds. Finally, print the function app resource id, its default hostname, and the HTTP trigger URL so I can find it.",
  },
};

/**
 * The Serverless Functions lesson. The interactive body lives in
 * ServerlessChapters and is driven per provider. AWS and Azure diverge in the
 * triggering model (a single event into one handler plus the AWS SDK, versus a
 * trigger with declarative input and output bindings) and in how the Azure
 * hosting plan, rather than a single tunable model, sets cold-start behavior,
 * the scale ceiling, the timeout, and the instance sizing. This shell provides
 * the shared framing, the cross-provider equivalence, the glossary, and links to
 * the authoritative documentation for the active lens.
 */
export function ServerlessLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "AWS Lambda", code: "lambda" }}
        azure={{ service: "Azure Functions", code: "Microsoft.Web/sites" }}
        elevator={ELEVATOR}
      />
      <ServerlessChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        agent={AGENT[provider]}
      />
      <Glossary terms={TERMS} />
      <FurtherReading links={DOCS[provider]} />
    </LessonLayout>
  );
}
