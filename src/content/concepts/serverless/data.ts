import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the Serverless Functions lesson. The
 * interactive components under this folder are provider-agnostic and read
 * everything they render from here, so the AWS and Azure lessons stay bespoke
 * without duplicating the interaction machinery.
 *
 * The two providers genuinely diverge:
 *   - Triggering: AWS delivers every source as one JSON event into one handler
 *     signature and you write outputs with the SDK, while Azure adds a
 *     declarative binding layer (one trigger plus optional input and output
 *     bindings) that AWS has no equivalent of.
 *   - Lifecycle and scaling: AWS Lambda is a single model with knobs
 *     (provisioned concurrency, reserved concurrency, a default account limit of
 *     1,000), whereas Azure's cold-start, scale ceiling, and timeout are set by
 *     the hosting plan you pick (Consumption, the recommended Flex Consumption,
 *     or Premium).
 *   - Sizing: AWS memory is a continuous slider that also buys CPU (1,769 MB is
 *     one vCPU), while Flex Consumption offers three fixed instance sizes.
 *
 * Facts verified against the AWS Lambda Developer Guide (docs.aws.amazon.com)
 * and Microsoft Learn (learn.microsoft.com). Durations and prices are
 * illustrative and representative, not quotes. Prose is neutral and
 * professional; no em dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* -------------------------- Chapter 1 · triggers -------------------------- */

export interface Trigger {
  id: string;
  /** The trigger's name, e.g. "API Gateway" or "HTTP trigger". */
  name: string;
  /** What produces the event. */
  source: string;
  /** How the function is invoked: synchronous, asynchronous, or polled. */
  delivery: string;
  deliveryTone: Tone;
  /** What the function code receives when it runs. */
  data: string;
  /** A representative use for this trigger. */
  use: string;
}

export interface TriggersContent {
  /** What the provider calls the unit of code, e.g. "Lambda function". */
  unitTerm: string;
  /** How the running code receives its input, in one line. */
  handlerNote: string;
  /** A short, representative handler signature (not a full program). */
  handlerCode: string;
  /** Heading for the binding-model panel. */
  bindingsTitle: string;
  /** How the provider connects a function to other services for I/O. */
  bindingsBody: string;
  triggers: Trigger[];
  callouts: CalloutData[];
}

/* -------------------------- Chapter 2 · lifecycle ------------------------- */

export interface Phase {
  id: string;
  label: string;
  sub: string;
  /** Illustrative duration in milliseconds. Not a benchmark. */
  ms: number;
  tone: Tone;
}

export interface InvokePath {
  id: string;
  label: string;
  kind: "cold" | "warm";
  phases: Phase[];
  /** One-line takeaway shown when this path finishes. */
  verdict: string;
}

export interface LifecycleContent {
  paths: InvokePath[];
  /** What happens to the environment between requests. */
  freezeNote: string;
  /** The provider's cold-start mitigation. */
  mitigation: { name: string; body: string };
  callouts: CalloutData[];
}

/* --------------------------- Chapter 3 · scaling -------------------------- */

export interface ScalingContent {
  /** What one unit of scale is called, e.g. "execution environment". */
  unitTerm: string;
  /** The scaling rule in one line. */
  rule: string;
  /** What the ceiling is called, e.g. "Account concurrency limit". */
  limitLabel: string;
  /** The documented default ceiling. */
  limitDefault: number;
  /** A scaled-down cap used only for the on-screen illustration. */
  demoCap: number;
  /** How to raise or reserve capacity. */
  controls: { name: string; body: string };
  /** Bridges the demo cap to the real number. */
  note: string;
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 4 · limits -------------------------- */

export interface SizeOption {
  /** Memory in MB. */
  value: number;
  /** vCPU cores at this size. */
  cores: number;
  label: string;
}

export type SizingModel =
  | {
      mode: "continuous";
      label: string;
      min: number;
      max: number;
      step: number;
      defaultValue: number;
      /** Memory in MB that equals one vCPU (CPU scales with memory). */
      vcpuAtMb: number;
      cpuNote: string;
    }
  | {
      mode: "discrete";
      label: string;
      sizes: SizeOption[];
      defaultIndex: number;
      cpuNote: string;
    };

export interface LimitRow {
  label: string;
  value: string;
  note: string;
}

export interface LimitsContent {
  sizing: SizingModel;
  limits: LimitRow[];
  callouts: CalloutData[];
}

/* --------------------------- Chapter 5 · pricing ------------------------- */

export interface PricingContent {
  /** The billing model in one line. */
  model: string;
  /** What one billed call is called, e.g. "request" or "execution". */
  requestTerm: string;
  /** Illustrative price per one million calls, in USD. */
  reqPricePerM: number;
  /** Illustrative price per GB-second, in USD. */
  gbSecPrice: number;
  /** Monthly free grant of calls. */
  freeReq: number;
  /** Monthly free grant of GB-seconds. */
  freeGbSec: number;
  billingNote: string;
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 6 · quiz --------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/* ------------------------------ The bundle -------------------------------- */

export interface LessonContent {
  chapters: ChapterMeta[];
  /** A representative deploy or invoke command for the CLI block. */
  cli: string;
  triggers: TriggersContent;
  lifecycle: LifecycleContent;
  scaling: ScalingContent;
  limits: LimitsContent;
  pricing: PricingContent;
  quiz: QuizQ[];
}

/* ================================ AWS ==================================== */

const AWS: LessonContent = {
  cli: "aws lambda invoke --function-name hello --payload '{}' response.json",
  chapters: [
    {
      navLabel: "triggers",
      kicker: "Chapter 1",
      title: "What runs your code",
      intro:
        "A function does nothing until something invokes it. In Lambda, dozens of AWS services can be a trigger, and each one hands your handler the same shape: a single JSON event plus a context object. Pick a trigger to see what fires it and what your code receives.",
    },
    {
      navLabel: "cold start",
      kicker: "Chapter 2",
      title: "Cold starts and the environment lifecycle",
      intro:
        "Lambda runs your function inside an execution environment it creates on demand. The first request pays to set that environment up (the Init phase); later requests reuse it and skip straight to the handler. Trace a cold and a warm invocation to see where the time goes.",
    },
    {
      navLabel: "scaling",
      kicker: "Chapter 3",
      title: "How it scales out",
      intro:
        "Lambda does not run one busy copy of your function. For each concurrent request it provisions a separate execution environment, so ten requests at once means ten environments. That is how it scales to zero and back, up to your account limit. Push the load and watch.",
    },
    {
      navLabel: "sizing",
      kicker: "Chapter 4",
      title: "Sizing and the hard limits",
      intro:
        "You do not pick a CPU. You pick memory, and Lambda gives you CPU in proportion: at 1,769 MB your function has one full vCPU. A handful of hard limits box in what a single invocation can do. Move the memory to see the CPU follow.",
    },
    {
      navLabel: "pricing",
      kicker: "Chapter 5",
      title: "What you actually pay",
      intro:
        "There is no idle cost. You pay per request and for compute measured in GB-seconds: how much memory you allocated multiplied by how long the code ran. A generous free tier covers small workloads entirely. Estimate a monthly bill.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Six questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  triggers: {
    unitTerm: "Lambda function",
    handlerNote:
      "Every trigger, whatever the source, invokes the same handler with two arguments: the event (a JSON document describing what happened) and the context (runtime metadata like the remaining time). You read the event and, to affect other services, call them with the AWS SDK.",
    handlerCode:
      "export const handler = async (event, context) => { /* read event, call AWS SDK, return */ };",
    bindingsTitle: "Outputs are code, not configuration",
    bindingsBody:
      "Lambda has no declarative binding layer. To write to a queue, a table, or a bucket, you create an AWS SDK client inside your handler and call it. The trigger delivers input; everything your function does with the result is plain code.",
    triggers: [
      {
        id: "apigw",
        name: "API Gateway / Function URL",
        source: "An incoming HTTP request",
        delivery: "Synchronous",
        deliveryTone: "invoke",
        data: "The request (path, method, headers, body) as an event; your return value becomes the HTTP response.",
        use: "REST and HTTP APIs, webhooks, backends for web and mobile apps.",
      },
      {
        id: "s3",
        name: "Amazon S3",
        source: "An object created or deleted in a bucket",
        delivery: "Asynchronous",
        deliveryTone: "event",
        data: "An event naming the bucket and object key; Lambda retries automatically on failure.",
        use: "Generate thumbnails, index uploads, kick off a processing pipeline.",
      },
      {
        id: "eventbridge",
        name: "EventBridge (schedule)",
        source: "A cron or rate schedule, or a matched event",
        delivery: "Asynchronous",
        deliveryTone: "event",
        data: "A scheduled or routed event; no caller waits for the result.",
        use: "Nightly jobs, cleanup tasks, reacting to events across services.",
      },
      {
        id: "sqs",
        name: "Amazon SQS",
        source: "Messages waiting in a queue",
        delivery: "Polled in batches",
        deliveryTone: "meta",
        data: "A batch of messages, delivered by an event source mapping that polls the queue for you.",
        use: "Decouple producers from work, absorb spikes, process at your own pace.",
      },
      {
        id: "ddbstream",
        name: "DynamoDB Streams",
        source: "Rows changed in a DynamoDB table",
        delivery: "Polled in batches",
        deliveryTone: "meta",
        data: "A batch of change records in order per partition, again via an event source mapping.",
        use: "Replicate changes, maintain aggregates, fan out on writes.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "Two ways in",
        title: "Direct triggers versus event source mappings.",
        body: "Services like API Gateway, S3, and EventBridge push an event to Lambda directly, one invocation per event. For streams and queues (SQS, Kinesis, DynamoDB Streams), a Lambda-managed event source mapping polls the source and invokes your function with a batch of records instead.",
      },
      {
        kind: "fix",
        tag: "Sync versus async",
        title: "Synchronous callers wait; asynchronous ones do not.",
        body: "A synchronous invocation (RequestResponse, used by API Gateway) blocks until your function returns, and you handle errors. An asynchronous invocation (Event, used by S3 and EventBridge) queues the event, returns immediately, and Lambda retries failures for you.",
      },
    ],
  },
  lifecycle: {
    paths: [
      {
        id: "cold",
        label: "Cold start (new environment)",
        kind: "cold",
        phases: [
          {
            id: "extensions",
            label: "Extension init",
            sub: "start any extensions",
            ms: 90,
            tone: "init",
          },
          {
            id: "runtime",
            label: "Runtime init",
            sub: "bootstrap the language runtime",
            ms: 170,
            tone: "init",
          },
          {
            id: "funcinit",
            label: "Function init",
            sub: "run your code outside the handler",
            ms: 300,
            tone: "init",
          },
          {
            id: "invoke",
            label: "Invoke",
            sub: "run the handler",
            ms: 40,
            tone: "invoke",
          },
        ],
        verdict:
          "A cold start pays the full Init phase (extensions, runtime, then your static code) before the handler runs. That setup, not the handler, is the latency people call the cold start.",
      },
      {
        id: "warm",
        label: "Warm invocation (reused environment)",
        kind: "warm",
        phases: [
          {
            id: "invoke",
            label: "Invoke",
            sub: "run the handler",
            ms: 40,
            tone: "invoke",
          },
        ],
        verdict:
          "A warm invocation reuses an already-initialized environment, so it skips the entire Init phase and runs the handler straight away. This is why the second request feels so much faster than the first.",
      },
    ],
    freezeNote:
      "After the handler returns, Lambda freezes the environment rather than tearing it down, then thaws it for the next request. Anything you set up in the Init phase (a database client, a loaded model) survives the freeze, which is why initializing outside the handler pays off.",
    mitigation: {
      name: "Provisioned Concurrency and SnapStart",
      body: "To remove cold starts on a latency-sensitive path, Provisioned Concurrency keeps a set number of environments initialized and ready before requests arrive. SnapStart instead takes a snapshot of the initialized environment at publish time and restores from it, cutting startup for supported runtimes.",
    },
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Every request pays the cold-start penalty.",
        body: "It does not. Only the request that has to create a fresh environment pays the Init phase. Once warm, an environment is reused for many requests and each skips straight to the handler. Cold starts happen on the first request and when Lambda adds environments to scale out.",
      },
      {
        kind: "note",
        tag: "The 10-second rule",
        title: "The Init phase has its own limit.",
        body: "On-demand initialization is capped at 10 seconds. If your static code does not finish starting up in time, Lambda retries the Init phase at the first invocation using the configured function timeout instead.",
      },
    ],
  },
  scaling: {
    unitTerm: "execution environment",
    rule: "For each concurrent request, Lambda provisions a separate execution environment. Concurrency is simply how many requests are in flight at once.",
    limitLabel: "Account concurrency limit",
    limitDefault: 1000,
    demoCap: 12,
    controls: {
      name: "Reserved and provisioned concurrency",
      body: "Reserved concurrency carves out a guaranteed slice of the account limit for one function (and caps it there). Provisioned concurrency pre-initializes environments so they are warm on arrival. Both are per-function controls over the shared pool.",
    },
    note: "This board caps at 12 environments to fit on screen. The real default is 1,000 concurrent executions per Region across all your functions, a soft limit you can raise.",
    callouts: [
      {
        kind: "fix",
        tag: "Scale to zero",
        title: "Idle functions cost nothing because nothing is running.",
        body: "When no requests arrive, Lambda keeps no environments busy and you pay nothing for compute. When a burst arrives, it adds environments up to the concurrency limit, then throttles the overflow (with retries for asynchronous and stream sources). Scaling out and back to zero is automatic.",
      },
    ],
  },
  limits: {
    sizing: {
      mode: "continuous",
      label: "Memory",
      min: 128,
      max: 10240,
      step: 64,
      defaultValue: 128,
      vcpuAtMb: 1769,
      cpuNote:
        "CPU is allocated in proportion to memory. At 1,769 MB a function has one vCPU; more memory buys more CPU, which can make a compute-bound function both faster and cheaper.",
    },
    limits: [
      {
        label: "Timeout",
        value: "15 min max",
        note: "Default 3 seconds, up to a hard maximum of 900 seconds. Lambda is built for short tasks.",
      },
      {
        label: "Payload",
        value: "6 MB",
        note: "Request and response are capped at 6 MB each for a synchronous invocation; asynchronous events are smaller.",
      },
      {
        label: "/tmp storage",
        value: "512 MB to 10 GB",
        note: "Ephemeral scratch space in /tmp, configurable up to 10,240 MB, gone when the environment is torn down.",
      },
      {
        label: "Package size",
        value: "250 MB / 10 GB",
        note: "50 MB zipped on upload and 250 MB unzipped, or up to a 10 GB container image.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "One lever",
        title: "Memory is the performance dial.",
        body: "Because CPU, and to a degree network and disk throughput, scale with the memory setting, tuning memory is how you tune performance. Sometimes raising memory lowers cost, because the function finishes in proportionally less time.",
      },
    ],
  },
  pricing: {
    model:
      "Two parts: a charge per request, plus compute billed in GB-seconds (allocated memory multiplied by run time). No servers, no idle charge.",
    requestTerm: "request",
    reqPricePerM: 0.2,
    gbSecPrice: 0.0000167,
    freeReq: 1_000_000,
    freeGbSec: 400_000,
    billingNote:
      "The AWS Free Tier includes one million requests and 400,000 GB-seconds every month. Rates here are representative x86 values for illustration, not a quote; the real price depends on Region and architecture.",
    callouts: [
      {
        kind: "fix",
        tag: "GB-seconds",
        title: "Duration is billed against the memory you allocated.",
        body: "A GB-second is one gigabyte of allocated memory held for one second. A 512 MB function running 200 ms uses 0.1 GB-second per invocation. Doubling memory doubles the per-second rate, but if it halves the run time the cost can come out even.",
      },
    ],
  },
  quiz: [
    {
      q: "In Lambda, what does a cold start actually refer to?",
      opts: [
        "The handler running slowly on its first call",
        "The Init phase spent creating and initializing a new execution environment before the handler runs",
        "A function that has timed out",
        "The time to upload your deployment package",
      ],
      answer: 1,
      explain:
        "A cold start is the Init phase: starting extensions, bootstrapping the runtime, and running your static code to set up a fresh environment. A reused (warm) environment skips all of that.",
    },
    {
      q: "Your function receives 10 requests at the exact same moment. What does Lambda do?",
      opts: [
        "Queues them and runs them one at a time",
        "Provisions up to 10 execution environments, one per concurrent request",
        "Rejects 9 and runs 1",
        "Runs all 10 threads inside a single environment",
      ],
      answer: 1,
      explain:
        "Lambda provisions a separate execution environment for each concurrent request, scaling out until it hits the account concurrency limit (1,000 by default), then throttling the overflow.",
    },
    {
      q: "You set your function's memory to 1,769 MB. How much CPU does it get?",
      opts: [
        "It is unrelated to memory; you set CPU separately",
        "One full vCPU, because CPU scales in proportion to memory",
        "Always the maximum available",
        "Half a vCPU",
      ],
      answer: 1,
      explain:
        "Lambda allocates CPU in proportion to memory, and 1,769 MB is the point at which a function has the equivalent of one vCPU. Memory is the single lever for compute power.",
    },
    {
      q: "How does a Lambda function write a message to another AWS service, such as an SQS queue?",
      opts: [
        "By declaring an output binding in configuration",
        "By creating an AWS SDK client in the handler and calling the service",
        "Lambda writes it automatically from the return value",
        "It cannot; functions can only read",
      ],
      answer: 1,
      explain:
        "Lambda has no declarative binding layer. The trigger delivers an input event, and anything the function does with the result (writing to a queue, a table, a bucket) is plain code using the AWS SDK.",
    },
    {
      q: "A brand-new account runs a Lambda function that gets zero traffic all month. What is the compute cost?",
      opts: [
        "A fixed monthly reservation fee",
        "Nothing, because with no requests nothing runs",
        "The cost of one always-on environment",
        "It depends on the allocated memory",
      ],
      answer: 1,
      explain:
        "Serverless has no idle charge. You pay per request and for GB-seconds of actual run time, so a function that never runs costs nothing for compute.",
    },
    {
      q: "Which invocation is asynchronous, with Lambda retrying failures for you?",
      opts: [
        "An API Gateway HTTP request",
        "A direct synchronous Invoke call",
        "An S3 object-created event",
        "A function URL request",
      ],
      answer: 2,
      explain:
        "S3 invokes Lambda asynchronously: it queues the event, returns immediately, and Lambda retries on failure. API Gateway and function URLs are synchronous, so the caller waits and handles errors.",
    },
  ],
};

/* =============================== Azure =================================== */

const AZURE: LessonContent = {
  cli: "func azure functionapp publish my-function-app",
  chapters: [
    {
      navLabel: "triggers",
      kicker: "Chapter 1",
      title: "Triggers and bindings",
      intro:
        "Every Azure function has exactly one trigger that runs it, and optional bindings that connect it to other services declaratively. A trigger brings data in; an input binding fetches more; an output binding writes results out, all without SDK code. Pick a trigger to see the model.",
    },
    {
      navLabel: "cold start",
      kicker: "Chapter 2",
      title: "Cold starts and the hosting plan",
      intro:
        "When an instance spins up to run your function, the first request waits for the platform to allocate it and load your worker and code. Whether you feel that cold start depends on your hosting plan. Trace a cold and a warm invocation to see where the time goes.",
    },
    {
      navLabel: "scaling",
      kicker: "Chapter 3",
      title: "Event-driven scaling",
      intro:
        "Azure Functions scales by adding instances of the function host based on how many events are waiting, and scales back to zero when they are gone. How far it scales out is set by the plan. Push the load and watch instances come and go.",
    },
    {
      navLabel: "sizing",
      kicker: "Chapter 4",
      title: "Sizing and the hard limits",
      intro:
        "On the Flex Consumption plan you choose an instance memory size, and CPU comes with it. Timeouts and other limits depend on the plan you run. Pick an instance size to see the CPU it carries.",
    },
    {
      navLabel: "pricing",
      kicker: "Chapter 5",
      title: "What you actually pay",
      intro:
        "On a serverless plan there is no idle cost. You pay per execution and for resource consumption measured in GB-seconds: allocated memory multiplied by run time. A monthly free grant covers small workloads. Estimate a bill.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Six questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  triggers: {
    unitTerm: "Azure function",
    handlerNote:
      "A function must have exactly one trigger, which defines how it is invoked and passes in the triggering data. Bindings then connect it to other services declaratively: an input binding pulls extra data in, an output binding writes results out, so you avoid hand-writing SDK access for the common cases.",
    handlerCode:
      "app.http('hello', { handler: async (request, context) => { return { body: 'hi' }; } });",
    bindingsTitle: "Bindings connect services declaratively",
    bindingsBody:
      "A trigger is really a special input binding. You can add more input and output bindings to a function so data arrives as parameters and leaves via the return value or an output object, with no SDK client in your code. You can still use an SDK directly when you prefer.",
    triggers: [
      {
        id: "http",
        name: "HTTP trigger",
        source: "An incoming HTTP request",
        delivery: "Synchronous",
        deliveryTone: "invoke",
        data: "The HTTP request as a parameter; your return value becomes the response.",
        use: "REST APIs, webhooks, backends for web and mobile apps.",
      },
      {
        id: "blob",
        name: "Blob trigger",
        source: "A blob created or updated in a container",
        delivery: "Asynchronous",
        deliveryTone: "event",
        data: "The blob's contents and metadata, delivered to your function.",
        use: "Process uploads, generate thumbnails, index new files.",
      },
      {
        id: "timer",
        name: "Timer trigger",
        source: "A schedule expressed as an NCRONTAB expression",
        delivery: "Asynchronous",
        deliveryTone: "event",
        data: "A timer object with schedule status; nothing waits for the result.",
        use: "Nightly jobs, cleanup, periodic polling.",
      },
      {
        id: "queue",
        name: "Queue trigger",
        source: "Messages on an Azure Storage queue",
        delivery: "Per message",
        deliveryTone: "meta",
        data: "One message per invocation; the platform reads the queue for you.",
        use: "Decouple producers from work and absorb spikes.",
      },
      {
        id: "cosmos",
        name: "Azure Cosmos DB trigger",
        source: "Documents changed in a container (change feed)",
        delivery: "Per change batch",
        deliveryTone: "meta",
        data: "The changed documents from the change feed, in order.",
        use: "React to writes, maintain materialized views, fan out.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "One trigger, many bindings",
        title: "The binding layer is the headline difference from Lambda.",
        body: "A scheduled function can declare a Blob Storage input binding and a Cosmos DB output binding, and the runtime reads the blob and writes the document for you. Lambda has no equivalent: there you get one event in and call the SDK for everything else.",
      },
      {
        kind: "fix",
        tag: "Sync versus async",
        title: "Only the HTTP trigger makes a caller wait.",
        body: "An HTTP trigger is synchronous: the client holds the connection until the function returns. Queue, blob, timer, and change-feed triggers are asynchronous, so the platform invokes the function on your behalf and retries on failure per the trigger's rules.",
      },
    ],
  },
  lifecycle: {
    paths: [
      {
        id: "cold",
        label: "Cold start (new instance)",
        kind: "cold",
        phases: [
          {
            id: "allocate",
            label: "Allocate instance",
            sub: "the platform assigns an instance",
            ms: 200,
            tone: "init",
          },
          {
            id: "worker",
            label: "Start worker",
            sub: "load the runtime and language worker",
            ms: 220,
            tone: "init",
          },
          {
            id: "load",
            label: "Load function",
            sub: "load your code and its bindings",
            ms: 180,
            tone: "init",
          },
          {
            id: "run",
            label: "Run",
            sub: "execute the function",
            ms: 40,
            tone: "invoke",
          },
        ],
        verdict:
          "A cold start pays to allocate an instance and start the worker and your code before the function runs. On the Consumption plan this happens whenever the app has scaled to zero, so the first request after idle feels it.",
      },
      {
        id: "warm",
        label: "Warm invocation (running instance)",
        kind: "warm",
        phases: [
          {
            id: "run",
            label: "Run",
            sub: "execute the function",
            ms: 40,
            tone: "invoke",
          },
        ],
        verdict:
          "A warm invocation lands on an instance that is already running, so it skips allocation and startup and executes immediately. Keeping an instance warm is exactly what the Premium and Flex Consumption plans offer.",
      },
    ],
    freezeNote:
      "An instance handles many invocations while it is alive, so anything you set up once (a client, a cached config) is reused across requests on that instance. When traffic stops, the Consumption plan scales the app back to zero and the next request starts cold again.",
    mitigation: {
      name: "Always-ready and prewarmed instances",
      body: "The plan decides your cold-start story. The Flex Consumption plan can keep one or more always-ready instances warm, and the Premium plan runs prewarmed workers that avoid the startup delay after idle. The legacy Consumption plan has no such option and can go fully cold.",
    },
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Cold starts are just a fact of serverless you cannot avoid.",
        body: "On Azure they are largely a function of the plan. The legacy Consumption plan scales to zero and pays a cold start on the first request after idle; Flex Consumption can keep always-ready instances, and Premium keeps prewarmed workers, so latency-sensitive apps can avoid the penalty.",
      },
      {
        kind: "note",
        tag: "Recommended plan",
        title: "Flex Consumption is the current serverless default.",
        body: "Microsoft now points new serverless function apps at the Flex Consumption plan, which keeps the pay-for-use model but adds faster scaling, optional always-ready instances, and virtual network integration. The original Consumption plan is treated as legacy.",
      },
    ],
  },
  scaling: {
    unitTerm: "instance",
    rule: "The Azure Functions host scales by adding and removing instances based on the number of events waiting to be processed, and scales to zero when there are none.",
    limitLabel: "Flex Consumption max instances",
    limitDefault: 1000,
    demoCap: 12,
    controls: {
      name: "Per-function scaling and always-ready",
      body: "Flex Consumption scales each function in the app independently based on its own load, and can hold a floor of always-ready instances so bursts do not all start cold. You set the maximum scale-out to bound cost.",
    },
    note: "This board caps at 12 instances to fit on screen. Flex Consumption scales out to 1,000 instances; the legacy Consumption plan tops out around 200 (100 on Linux).",
    callouts: [
      {
        kind: "fix",
        tag: "Scale to zero",
        title: "The plan sets how far and how fast you scale.",
        body: "Event-driven scaling adds instances as the backlog grows and removes them as it clears. Flex Consumption scales out to 1,000 instances and does so quickly; the legacy Consumption plan is slower and caps lower. Beyond that ceiling, new work waits for an instance to free up.",
      },
    ],
  },
  limits: {
    sizing: {
      mode: "discrete",
      label: "Instance memory size (Flex Consumption)",
      sizes: [
        { value: 512, cores: 0.25, label: "512 MB" },
        { value: 2048, cores: 1, label: "2,048 MB" },
        { value: 4096, cores: 2, label: "4,096 MB" },
      ],
      defaultIndex: 1,
      cpuNote:
        "On Flex Consumption you choose the instance memory size and CPU comes with it: 512 MB carries a quarter core, 2,048 MB one core, 4,096 MB two cores. The platform adds a small memory buffer on top that you are not billed for.",
    },
    limits: [
      {
        label: "Timeout",
        value: "30 min default",
        note: "Flex Consumption and Premium default to 30 minutes and can be unbounded; the legacy Consumption plan defaults to 5 minutes with a 10-minute maximum.",
      },
      {
        label: "HTTP response",
        value: "230 s max",
        note: "Whatever the timeout, an HTTP-triggered function has about 230 seconds to respond, set by the Azure Load Balancer idle timeout.",
      },
      {
        label: "Instance memory",
        value: "512 / 2,048 / 4,096 MB",
        note: "Fixed Flex Consumption instance sizes; the default of 2,048 MB suits most workloads.",
      },
      {
        label: "Scale-out",
        value: "up to 1,000",
        note: "Flex Consumption scales to 1,000 instances; the legacy Consumption plan caps around 200.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "The plan decides",
        title: "Limits move with the hosting plan, not just the code.",
        body: "The same function code behaves very differently on Consumption, Flex Consumption, and Premium: the plan sets the timeout ceiling, the scale-out maximum, the cold-start story, and whether you get virtual network integration. Choosing the plan is a real design decision.",
      },
    ],
  },
  pricing: {
    model:
      "On a serverless plan, two parts: a charge per execution, plus resource consumption billed in GB-seconds (allocated memory multiplied by run time). No idle charge.",
    requestTerm: "execution",
    reqPricePerM: 0.2,
    gbSecPrice: 0.000016,
    freeReq: 1_000_000,
    freeGbSec: 400_000,
    billingNote:
      "The Consumption plan includes a monthly free grant of one million executions and 400,000 GB-seconds. Rates here are representative values for illustration, not a quote; real pricing depends on Region and plan, and Premium bills on prewarmed instances instead.",
    callouts: [
      {
        kind: "fix",
        tag: "GB-seconds",
        title: "Consumption bills executions and resource consumption.",
        body: "Resource consumption is measured in GB-seconds: memory used while a function runs, times the run time. A function that never runs incurs no compute cost on the Consumption plan. Premium, by contrast, bills for prewarmed instances even when idle, in exchange for no cold starts.",
      },
    ],
  },
  quiz: [
    {
      q: "How many triggers can a single Azure function have?",
      opts: [
        "As many as you attach",
        "Exactly one; it defines how the function is invoked",
        "Zero or one",
        "One per input binding",
      ],
      answer: 1,
      explain:
        "A function has exactly one trigger, which defines how it runs and passes in the triggering data. Bindings are separate: optional input and output connections you can add around that one trigger.",
    },
    {
      q: "What is an output binding in Azure Functions?",
      opts: [
        "A second trigger for the function",
        "A declarative connection that writes data out to a service without SDK code",
        "The function's return type",
        "A networking rule",
      ],
      answer: 1,
      explain:
        "An output binding declaratively connects a function to a service it writes to, so results leave via the return value or an output object instead of hand-written SDK calls. Lambda has no equivalent.",
    },
    {
      q: "On which plan can an Azure function app avoid cold starts by keeping instances warm?",
      opts: [
        "Only the legacy Consumption plan",
        "The Flex Consumption plan (always-ready) or the Premium plan (prewarmed)",
        "No plan can avoid cold starts",
        "Any plan, automatically",
      ],
      answer: 1,
      explain:
        "Flex Consumption can keep always-ready instances and Premium runs prewarmed workers, both of which avoid the startup delay after idle. The legacy Consumption plan has no such option and can go fully cold.",
    },
    {
      q: "How does Azure Functions decide how many instances to run?",
      opts: [
        "You set a fixed instance count",
        "It adds and removes instances based on the number of events waiting, scaling to zero when idle",
        "One instance per function forever",
        "It never scales past one",
      ],
      answer: 1,
      explain:
        "Scaling is event-driven: the host adds instances as the event backlog grows and removes them as it clears, down to zero. The plan sets the ceiling, up to 1,000 on Flex Consumption.",
    },
    {
      q: "On the Flex Consumption plan, how do you get more CPU for a function?",
      opts: [
        "Set a CPU count directly",
        "Choose a larger instance memory size, which carries more CPU",
        "Add more functions",
        "Raise the timeout",
      ],
      answer: 1,
      explain:
        "You pick an instance memory size (512, 2,048, or 4,096 MB) and CPU comes with it: a quarter, one, and two cores respectively. There is no separate CPU dial.",
    },
    {
      q: "Why does the same function code behave differently on Consumption versus Premium?",
      opts: [
        "The code is recompiled per plan",
        "The hosting plan sets cold-start behavior, scale ceiling, timeout, and networking",
        "Premium runs a different language",
        "It does not; behavior is identical",
      ],
      answer: 1,
      explain:
        "In Azure the hosting plan is a real design choice: it determines whether instances stay warm, how far the app scales out, the maximum timeout, and whether you get virtual network integration.",
    },
  ],
};

/* ================================ Export ================================= */

export const CONTENT: Record<Provider, LessonContent> = {
  aws: AWS,
  azure: AZURE,
};
