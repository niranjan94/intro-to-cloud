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
    mutable: [
      "Function code and deployment package",
      "Memory size and CPU allocation",
      "Execution timeout up to 900 seconds",
      "Environment variables",
      "Execution IAM role",
      "Runtime version, handler, and layers",
    ],
    immutable: [
      "Function name once assigned",
      "Package type (zip archive or container image)",
      "Tenant isolation configuration",
      "Durable execution configuration",
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
    mutable: [
      "Application settings and environment variables",
      "Deployed function code and package",
      "Runtime version via FUNCTIONS_EXTENSION_VERSION",
      "Scale and concurrency limits",
      "Application Insights connection",
      "VNet integration and networking",
    ],
    immutable: [
      "Function app name and hostname",
      "Region or location",
      "Operating system (Windows or Linux)",
      "In-place migration to or from Flex Consumption",
    ],
  },
};

const AGENT: Record<Provider, AgentSetup> = {
  aws: {
    cli: "aws",
    scenarios: [
      {
        label: "HTTP-invoked function",
        blurb:
          "The simplest starting point: a stand-alone Node.js handler you invoke directly. Reach for this when you just want a working function and its execution role before wiring any event source.",
        prompt:
          "Provision an AWS Lambda function using the aws CLI. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create a minimal Node.js handler zipped into a deployment package, an IAM execution role that trusts lambda.amazonaws.com with the AWSLambdaBasicExecutionRole policy attached, and a function named intro-lambda-demo with sensible defaults (128 MB memory, a 10 second timeout). Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After the function is created, invoke it once to verify it responds. Finally, print the function ARN, name, and CloudWatch log group so I can find it.",
      },
      {
        label: "Queue-triggered function",
        blurb:
          "A function that drains an SQS queue through an event source mapping. Reach for this when work arrives asynchronously and you want Lambda to poll and process messages as they land.",
        prompt:
          "Provision a queue-triggered AWS Lambda function using the aws CLI. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create a standard SQS queue named intro-lambda-queue, a minimal Node.js handler zipped into a deployment package that logs each received record, an IAM execution role that trusts lambda.amazonaws.com with the AWSLambdaBasicExecutionRole and AWSLambdaSQSQueueExecutionRole policies attached, a function named intro-lambda-queue-demo with sensible defaults (128 MB memory, a 30 second timeout), and an event source mapping from the queue to the function with a small batch size. Tag every resource with project=intro-cloud so cleanup is easy. Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After everything is wired, send one test message to the queue and confirm from the CloudWatch logs that the function processed it. Finally, print the queue ARN, the function ARN, the event source mapping UUID, and the CloudWatch log group so I can find them.",
      },
      {
        label: "Scheduled function",
        blurb:
          "A function invoked on a cron schedule by an EventBridge rule. Reach for this when work needs to run at fixed intervals rather than in response to inbound requests.",
        prompt:
          "Provision a scheduled AWS Lambda function using the aws CLI. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create a minimal Node.js handler zipped into a deployment package that logs the invocation time, an IAM execution role that trusts lambda.amazonaws.com with the AWSLambdaBasicExecutionRole policy attached, a function named intro-lambda-cron-demo with sensible defaults (128 MB memory, a 10 second timeout), an EventBridge (CloudWatch Events) rule named intro-lambda-schedule with a `rate(5 minutes)` schedule expression, the rule set as the function's target, and the resource-based permission that lets events.amazonaws.com invoke the function. Tag every resource with project=intro-cloud so cleanup is easy. Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After everything is wired, wait for one scheduled invocation and confirm it from the CloudWatch logs. Finally, print the function ARN, the rule ARN, and the CloudWatch log group so I can find them.",
      },
      {
        label: "Function with env vars + secret",
        blurb:
          "A function that reads plain configuration from environment variables and a sensitive value from Secrets Manager at runtime. Reach for this when a handler needs credentials or config kept out of the code.",
        prompt:
          "Provision an AWS Lambda function wired with environment variables and a secret using the aws CLI. First run `aws sts get-caller-identity` and confirm the target account and region before doing anything else. Create a Secrets Manager secret named intro-lambda-secret holding a sample API token, a minimal Node.js handler zipped into a deployment package that reads a plain environment variable and fetches the secret at runtime via the AWS SDK, an IAM execution role that trusts lambda.amazonaws.com with the AWSLambdaBasicExecutionRole policy attached plus an inline policy granting secretsmanager:GetSecretValue on that secret's ARN only, and a function named intro-lambda-config-demo with sensible defaults (128 MB memory, a 10 second timeout) whose environment variables include the secret name and one non-sensitive setting. Tag every resource with project=intro-cloud so cleanup is easy. Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After the function is created, invoke it once and confirm from the CloudWatch logs that it read both the environment variable and the secret. Finally, print the function ARN, the secret ARN, and the CloudWatch log group so I can find them.",
      },
    ],
  },
  azure: {
    cli: "az",
    scenarios: [
      {
        label: "HTTP-triggered function",
        blurb:
          "The simplest starting point: an HTTP-triggered function on a Flex Consumption plan. Reach for this when you just want a working endpoint and its storage account before adding any other trigger.",
        prompt:
          "Provision an Azure Functions app using the az CLI. First run `az account show` and confirm the active subscription and the target region before doing anything else. Create a resource group named intro-func-rg, a storage account for the function app, and a Flex Consumption function app named intro-func-demo running a minimal Node.js HTTP-triggered function with sensible defaults. Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After the app is deployed, call its endpoint once to verify it responds. Finally, print the function app resource id, its default hostname, and the HTTP trigger URL so I can find it.",
      },
      {
        label: "Queue-triggered function",
        blurb:
          "A function that fires on each message added to an Azure Storage queue via a queue trigger. Reach for this when work arrives asynchronously and you want the host to scale on the queue backlog.",
        prompt:
          "Provision a queue-triggered Azure Functions app using the az CLI. First run `az account show` and confirm the active subscription and the target region before doing anything else. Create a resource group named intro-func-rg, a storage account for the function app, a storage queue named intro-func-queue in that account, and a Flex Consumption function app named intro-func-queue-demo running a minimal Node.js queue-triggered function bound to that queue that logs each message. Tag every resource with project=intro-cloud so cleanup is easy. Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After the app is deployed, add one test message to the queue with `az storage message put` and confirm from the app's Application Insights logs or the streaming logs that the function processed it. Finally, print the function app resource id, its default hostname, the storage queue name, and the storage account name so I can find them.",
      },
      {
        label: "Timer-triggered function",
        blurb:
          "A function invoked on a cron schedule by a timer trigger. Reach for this when work needs to run at fixed intervals rather than in response to inbound requests.",
        prompt:
          "Provision a timer-triggered Azure Functions app using the az CLI. First run `az account show` and confirm the active subscription and the target region before doing anything else. Create a resource group named intro-func-rg, a storage account for the function app, and a Flex Consumption function app named intro-func-timer-demo running a minimal Node.js timer-triggered function with a NCRONTAB schedule of `0 */5 * * * *` (every five minutes) that logs the invocation time. Tag every resource with project=intro-cloud so cleanup is easy. Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After the app is deployed, wait for one scheduled invocation and confirm it from the app's Application Insights logs or the streaming logs. Finally, print the function app resource id, its default hostname, and the storage account name so I can find them.",
      },
      {
        label: "Function with app settings + secret",
        blurb:
          "A function that reads plain configuration from app settings and a sensitive value from Key Vault via a reference. Reach for this when a handler needs credentials or config kept out of the code.",
        prompt:
          "Provision an Azure Functions app wired with app settings and a secret using the az CLI. First run `az account show` and confirm the active subscription and the target region before doing anything else. Create a resource group named intro-func-rg, a storage account for the function app, a Key Vault named intro-func-kv with a secret holding a sample API token, and a Flex Consumption function app named intro-func-config-demo running a minimal Node.js HTTP-triggered function that reads a plain app setting and the secret value at runtime. Assign the function app a system-assigned managed identity, grant that identity get access to the vault's secrets, and set the app settings to include one non-sensitive value plus a Key Vault reference (`@Microsoft.KeyVault(...)`) to the secret. Tag every resource with project=intro-cloud so cleanup is easy. Show me the full plan and the exact commands before you run anything that creates or deletes resources, and wait for my confirmation. After the app is deployed, call its endpoint once and confirm from the response or the Application Insights logs that it read both the app setting and the resolved secret. Finally, print the function app resource id, its default hostname, and the Key Vault resource id so I can find them.",
      },
    ],
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
