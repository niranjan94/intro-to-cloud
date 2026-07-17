import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the Containers lesson. The interactive
 * components under this folder are provider-agnostic and read everything they
 * render from here, so the AWS and Azure lessons stay bespoke without
 * duplicating the interaction machinery. The two providers genuinely diverge:
 * ECS separates the blueprint (task definition) from the manager (service) and
 * the boundary (cluster), while Container Apps folds them into one container-app
 * resource made of immutable revisions inside an environment. They diverge again
 * in scaling (Application Auto Scaling target tracking, no default scale-to-zero,
 * versus KEDA scale rules that scale to zero), in ingress (attach an Application
 * Load Balancer versus built-in ingress with an FQDN), and in rollout (a rolling
 * task replacement versus a revision flip with optional weighted traffic split).
 *
 * Facts verified against the Amazon ECS and Amazon ECR documentation
 * (docs.aws.amazon.com) and Microsoft Learn (learn.microsoft.com). Numbers used
 * in the scaling and rollout simulators are illustrative, not quotas or quotes.
 * Prose is neutral and professional; no em dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* --------------------------- Chapter 0 · image ---------------------------- */

/** One step in the build-push-run delivery pipeline. */
export interface PipelineStage {
  id: string;
  /** Short nav label, e.g. "Build". */
  label: string;
  title: string;
  tone: Tone;
  /** The real CLI invocation for this step. */
  cli: string;
  /** What now exists after this step runs. */
  artifact: string;
  body: string;
}

export interface ImageContent {
  registryName: string;
  /** The registry resource identifier shown small. */
  registryCode: string;
  /** The image reference, split so the explorer can assemble it. */
  reference: { host: string; repository: string; tag: string };
  hostLabel: string;
  stages: PipelineStage[];
  note: string;
  callouts: CalloutData[];
}

/* -------------------------- Chapter 1 · anatomy --------------------------- */

/** One field of the run spec, mapped to where the provider declares it. */
export interface SpecField {
  id: string;
  /** The provider-neutral thing being set, e.g. "Container image". */
  concept: string;
  /** The example value for this field. */
  value: string;
  /** Where in the provider's spec it lives. */
  home: string;
  note: string;
}

/** One level of the containment model, ordered outer to inner. */
export interface ContainmentLevel {
  term: string;
  sub: string;
  tone: Tone;
}

export interface AnatomyContent {
  /** What the provider calls the spec, e.g. "Task definition (JSON)". */
  specLabel: string;
  specNote: string;
  fields: SpecField[];
  containment: ContainmentLevel[];
  containmentNote: string;
  callouts: CalloutData[];
}

/* --------------------------- Chapter 2 · compute -------------------------- */

export interface ComputeFact {
  label: string;
  value: string;
}

export interface ComputeOption {
  id: string;
  name: string;
  tone: Tone;
  /** True when the provider runs the servers for you. */
  serverless: boolean;
  tagline: string;
  facts: ComputeFact[];
  use: string;
  recommended?: boolean;
}

export interface ComputeContent {
  /** What the provider calls this choice, e.g. "Capacity option". */
  label: string;
  options: ComputeOption[];
  note: string;
  callouts: CalloutData[];
}

/* --------------------------- Chapter 3 · scaling -------------------------- */

export interface ScaleContent {
  /** The signal the app scales on, e.g. "Concurrent HTTP requests". */
  metricLabel: string;
  /** The engine that does the scaling. */
  engine: string;
  /** What one running instance is called, e.g. "task" or "replica". */
  unitNoun: string;
  /** Minimum instances the app is kept at. */
  min: number;
  /** Maximum instances it may scale out to. */
  max: number;
  /** Illustrative load one instance absorbs before another is added. */
  perUnit: number;
  /** Ceiling of the load slider. */
  loadMax: number;
  /** Whether idle load drops the app to zero instances. */
  canScaleToZero: boolean;
  ruleSummary: string;
  /** Label under the load slider. */
  loadLabel: string;
  note: string;
  callouts: CalloutData[];
}

/* --------------------------- Chapter 4 · traffic -------------------------- */

/** One step of a rollout, as a traffic split between the old and new version. */
export interface RolloutStep {
  id: string;
  label: string;
  oldPct: number;
  newPct: number;
  note: string;
}

export interface TrafficContent {
  /** How external requests reach a running instance. */
  ingressModel: string;
  ingressNote: string;
  /** Whether you must attach a separate load balancer resource. */
  needsLoadBalancer: boolean;
  /** The public endpoint the app is reached at. */
  endpoint: string;
  healthCheck: string;
  /** What the provider calls the rollout, e.g. "Rolling update". */
  rolloutLabel: string;
  oldName: string;
  newName: string;
  steps: RolloutStep[];
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 5 · quiz ---------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/* ------------------------------ The bundle -------------------------------- */

export interface LessonContent {
  chapters: ChapterMeta[];
  image: ImageContent;
  anatomy: AnatomyContent;
  compute: ComputeContent;
  scale: ScaleContent;
  traffic: TrafficContent;
  quiz: QuizQ[];
}

/* ================================ AWS ==================================== */

const AWS: LessonContent = {
  chapters: [
    {
      navLabel: "image",
      kicker: "Chapter 1",
      title: "From code to a portable image",
      intro:
        "A container starts life as an image: a read-only, layered snapshot of your app and everything it needs to run. You build it once, push it to a registry, and the platform pulls it back by reference to run it. Step through the pipeline and watch the image reference get built.",
    },
    {
      navLabel: "anatomy",
      kicker: "Chapter 2",
      title: "Declaring how it runs",
      intro:
        "The image says what to run. A separate blueprint says how: which image, how much CPU and memory, which port, which environment. On ECS that blueprint is the task definition, and it runs inside a cluster as tasks managed by a service. Explore the fields and the boxes they nest in.",
    },
    {
      navLabel: "compute",
      kicker: "Chapter 3",
      title: "Where the containers run",
      intro:
        "Your containers still need CPU and memory from somewhere. ECS lets you pick that capacity: run serverless on Fargate, or manage your own EC2 instances. The tradeoff is control against operational work. Compare the options.",
    },
    {
      navLabel: "scaling",
      kicker: "Chapter 4",
      title: "Scaling with load",
      intro:
        "One container handles only so much. Service Auto Scaling adds and removes tasks as demand rises and falls, between a floor and a ceiling you set. Drag the load and watch the task count follow.",
    },
    {
      navLabel: "traffic",
      kicker: "Chapter 5",
      title: "Traffic in, new version out",
      intro:
        "A running task is no use until requests reach it, and eventually you ship a new version without downtime. ECS puts a load balancer in front and rolls tasks over in batches. Step through a rollout and watch traffic move.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Five questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  image: {
    registryName: "Amazon ECR",
    registryCode: "Amazon Elastic Container Registry",
    reference: {
      host: "111122223333.dkr.ecr.us-east-1.amazonaws.com",
      repository: "web",
      tag: "1.4.0",
    },
    hostLabel: "Registry host",
    stages: [
      {
        id: "build",
        label: "Build",
        title: "Build the image from a Dockerfile",
        tone: "image",
        cli: "docker build -t web:1.4.0 .",
        artifact:
          "A local image: stacked read-only layers plus a manifest, addressable by a content digest.",
        body: "A build turns your Dockerfile into an image made of cached layers. The same image bytes run identically on your laptop and in the cloud, which is the whole point of a container.",
      },
      {
        id: "push",
        label: "Push",
        title: "Push it to Amazon ECR",
        tone: "registry",
        cli: "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 111122223333.dkr.ecr.us-east-1.amazonaws.com && docker push 111122223333.dkr.ecr.us-east-1.amazonaws.com/web:1.4.0",
        artifact:
          "The image stored in a private ECR repository, now pullable anywhere by its full reference.",
        body: "Amazon ECR is a fully managed private registry: one registry per account, holding repositories of images. You authenticate with a token from get-login-password (valid 12 hours), then push with plain docker.",
      },
      {
        id: "run",
        label: "Run",
        title: "Reference it and run",
        tone: "container",
        cli: "aws ecs create-service --cluster app --service-name web --task-definition web --desired-count 3 --launch-type FARGATE",
        artifact:
          "Running tasks: the platform pulled the image by reference and started your containers.",
        body: "You never re-upload the image to run it. The task definition points at the reference, and ECS pulls it from ECR to start each task. The next chapters unpack that blueprint.",
      },
    ],
    note: "The reference is host / repository : tag. The host names the registry, the repository groups versions of one image, and the tag (or an immutable @digest) picks the exact version. Pin a digest in production so a moving tag never changes what runs.",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A container image is a virtual machine image.",
        body: "It is not. A VM image carries a whole guest operating system; a container image carries only your app and its libraries, and every container on a host shares the host kernel. That is why images are small and start in seconds, not minutes.",
      },
      {
        kind: "note",
        tag: "Layers",
        title: "Images are layered and shared.",
        body: "Each Dockerfile instruction adds a layer. Layers are content-addressed and cached, so a rebuild that changes only your code reuses the base and dependency layers, and a registry stores each shared layer once.",
      },
    ],
  },
  anatomy: {
    specLabel: "Task definition (JSON)",
    specNote:
      "A task definition is a versioned JSON blueprint. Registering a change creates a new revision (web:3, web:4). A service then runs and maintains a desired count of tasks from one revision.",
    fields: [
      {
        id: "image",
        concept: "Container image",
        value: "111122223333.dkr.ecr.us-east-1.amazonaws.com/web:1.4.0",
        home: "containerDefinitions[].image",
        note: "The reference the platform pulls. A task can define more than one container that run together.",
      },
      {
        id: "cpumem",
        concept: "CPU and memory",
        value: "cpu: 256 · memory: 512",
        home: "cpu / memory (task level)",
        note: "For Fargate these are set at the task level in supported combinations (256 CPU units = 0.25 vCPU).",
      },
      {
        id: "port",
        concept: "Port",
        value: "containerPort: 80",
        home: "containerDefinitions[].portMappings",
        note: "The port your container listens on, mapped so a load balancer can reach it.",
      },
      {
        id: "env",
        concept: "Environment variables",
        value: "LOG_LEVEL=info",
        home: "containerDefinitions[].environment",
        note: "Plain config passed in at launch. Secrets come from Secrets Manager or SSM via the secrets field instead.",
      },
      {
        id: "count",
        concept: "How many to run",
        value: "desiredCount: 3",
        home: "service (not the task definition)",
        note: "The count lives on the service, not the blueprint. The service keeps that many tasks healthy and running.",
      },
      {
        id: "role",
        concept: "Identity",
        value: "taskRoleArn: arn:aws:iam::...:role/web",
        home: "taskRoleArn",
        note: "An IAM role the running task assumes, so your code calls AWS with no stored keys.",
      },
      {
        id: "capacity",
        concept: "Compute type",
        value: "FARGATE",
        home: "requiresCompatibilities",
        note: "Declares whether the task runs on serverless Fargate or on EC2 capacity. Covered next chapter.",
      },
    ],
    containment: [
      {
        term: "Cluster",
        sub: "the logical grouping tasks run in",
        tone: "idle",
      },
      {
        term: "Service",
        sub: "keeps the desired count of tasks running",
        tone: "serverless",
      },
      {
        term: "Task",
        sub: "one running instance of the blueprint",
        tone: "container",
      },
      {
        term: "Container",
        sub: "one image running inside the task",
        tone: "image",
      },
    ],
    containmentNote:
      "The task definition is the blueprint, not a box in this tree. A cluster holds services, a service holds tasks, and a task holds one or more containers that share its network and lifecycle.",
    callouts: [
      {
        kind: "fix",
        tag: "Two different resources",
        title: "The blueprint and the manager are separate.",
        body: "The task definition describes one task; the service decides how many run and heals them when they fail. You update the blueprint by registering a new revision, then update the service to roll tasks onto it.",
      },
    ],
  },
  compute: {
    label: "Capacity option",
    options: [
      {
        id: "fargate",
        name: "AWS Fargate",
        tone: "serverless",
        serverless: true,
        recommended: true,
        tagline: "Serverless: no servers to provision or patch.",
        facts: [
          { label: "You manage", value: "The task, not the host" },
          { label: "Scaling unit", value: "Per task, on demand" },
          { label: "Isolation", value: "Each task in its own boundary" },
        ],
        use: "Most workloads: web services and jobs where you would rather not run a fleet of instances.",
      },
      {
        id: "ec2",
        name: "Amazon EC2",
        tone: "managed",
        serverless: false,
        tagline: "You run the instances the tasks pack onto.",
        facts: [
          { label: "You manage", value: "Instance type, count, patching" },
          { label: "Scaling unit", value: "Tasks plus cluster instances" },
          { label: "Isolation", value: "Tasks share an instance kernel" },
        ],
        use: "Special instance types (GPU, particular CPUs), tight per-instance cost control, or existing capacity.",
      },
    ],
    note: "Fargate is a serverless, pay-as-you-go compute engine: you package the app, state its CPU and memory, and launch, with no cluster of virtual machines to size or scale. EC2 capacity trades that convenience for control over the exact hardware. Fargate Spot runs interruption-tolerant tasks at a discount.",
    callouts: [
      {
        kind: "note",
        tag: "Same blueprint",
        title: "The task definition barely changes.",
        body: "Choosing Fargate versus EC2 is mostly the requiresCompatibilities value plus how CPU and memory are set. The image, ports, and environment are identical, so you can move a workload between capacity types with little change.",
      },
    ],
  },
  scale: {
    metricLabel: "Average CPU utilization",
    engine: "Application Auto Scaling (target tracking)",
    unitNoun: "task",
    min: 2,
    max: 10,
    perUnit: 20,
    loadMax: 200,
    canScaleToZero: false,
    ruleSummary:
      "Service Auto Scaling adjusts the desired task count to keep a target metric (say 60% CPU) steady, adding tasks under load and removing them when it falls, within the minimum and maximum you set.",
    loadLabel: "Incoming load",
    note: "Bars are illustrative, not a capacity model. ECS publishes CPU and memory metrics to CloudWatch every minute; Application Auto Scaling reacts through target-tracking, step, scheduled, or predictive policies. A cooldown paces scaling so it does not thrash.",
    callouts: [
      {
        kind: "fix",
        tag: "The floor stays warm",
        title: "ECS services do not scale to zero on request volume.",
        body: "Auto scaling moves the desired count between the minimum and maximum you set. Keep a minimum of one or more tasks so there is always something to serve traffic: there is no built-in request-driven scale-to-zero, unlike Azure Container Apps or AWS Lambda.",
      },
    ],
  },
  traffic: {
    ingressModel: "Application Load Balancer + target group",
    ingressNote:
      "You attach an Elastic Load Balancing load balancer to the service. ECS registers each task in a target group, the load balancer spreads requests across healthy tasks, and its health check decides which tasks receive traffic.",
    needsLoadBalancer: true,
    endpoint: "web-alb-1a2b3c.us-east-1.elb.amazonaws.com",
    healthCheck: "Target group health check on GET /healthz",
    rolloutLabel: "Rolling update",
    oldName: "Tasks · web:3",
    newName: "Tasks · web:4",
    steps: [
      {
        id: "start",
        label: "Start",
        oldPct: 100,
        newPct: 0,
        note: "All tasks run web:3 behind the load balancer. You register web:4 and update the service to the new revision.",
      },
      {
        id: "batch1",
        label: "Batch 1",
        oldPct: 66,
        newPct: 34,
        note: "The scheduler starts web:4 tasks and, once they pass the health check, drains and stops some web:3 tasks. minimumHealthyPercent keeps enough serving throughout.",
      },
      {
        id: "batch2",
        label: "Batch 2",
        oldPct: 33,
        newPct: 67,
        note: "More web:4 tasks come up healthy and more web:3 tasks drain. The load balancer only sends traffic to tasks passing the health check.",
      },
      {
        id: "done",
        label: "Done",
        oldPct: 0,
        newPct: 100,
        note: "Every task now runs web:4 and the old revision is gone. If a new task failed its health check, the rollout would stall instead of taking the service down.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "Other rollout styles",
        title: "Blue/green is available too.",
        body: "The default deployment type is a rolling update. For an all-at-once cutover with a test phase and instant rollback, ECS integrates with AWS CodeDeploy for blue/green deployments across two target groups.",
      },
    ],
  },
  quiz: [
    {
      q: "What is a container image?",
      opts: [
        "A running process on a host",
        "A read-only, layered snapshot of an app and its dependencies",
        "A virtual machine with its own operating system",
        "A load balancer configuration",
      ],
      answer: 1,
      explain:
        "An image is a read-only, layered package of your app and its libraries. It shares the host kernel, so it is far smaller than a VM image and starts in seconds. A running instance of it is a container.",
    },
    {
      q: "In ECS, where does the desired number of copies to run live?",
      opts: [
        "In the task definition",
        "In the container image",
        "On the service",
        "In the registry",
      ],
      answer: 2,
      explain:
        "The task definition is the per-task blueprint. The service owns desiredCount and keeps that many tasks healthy, replacing any that fail. Blueprint and manager are separate resources.",
    },
    {
      q: "What does AWS Fargate give you compared with the EC2 capacity option?",
      opts: [
        "Cheaper storage for images",
        "Serverless compute with no instances to provision, patch, or scale",
        "A different container image format",
        "Automatic DNS records",
      ],
      answer: 1,
      explain:
        "Fargate is a serverless compute engine: you state CPU and memory and launch, with no cluster of EC2 instances to size or manage. EC2 capacity trades that for control over the exact hardware.",
    },
    {
      q: "Under load, how does an ECS service add capacity, and how low can it go?",
      opts: [
        "It scales to zero when idle, like a function",
        "Service Auto Scaling changes the task count between a minimum and maximum you set",
        "It resizes a single task to use more CPU",
        "It creates new clusters automatically",
      ],
      answer: 1,
      explain:
        "Service Auto Scaling adds and removes tasks between the min and max you configure, driven by CloudWatch metrics through Application Auto Scaling. It does not scale to zero on request volume, so you keep a floor of tasks running.",
    },
    {
      q: "How do external requests reach the tasks of an ECS service?",
      opts: [
        "Each task gets its own public domain automatically",
        "Through an attached Elastic Load Balancing load balancer and target group",
        "Only from inside the cluster",
        "Through the container registry",
      ],
      answer: 1,
      explain:
        "You attach a load balancer (usually an Application Load Balancer) to the service. ECS registers tasks in a target group and the load balancer routes to healthy tasks based on its health check.",
    },
  ],
};

/* =============================== Azure =================================== */

const AZURE: LessonContent = {
  chapters: [
    {
      navLabel: "image",
      kicker: "Chapter 1",
      title: "From code to a portable image",
      intro:
        "A container starts life as an image: a read-only, layered snapshot of your app and everything it needs to run. You build it once, push it to a registry, and the platform pulls it back by reference to run it. Step through the pipeline and watch the image reference get built.",
    },
    {
      navLabel: "anatomy",
      kicker: "Chapter 2",
      title: "Declaring how it runs",
      intro:
        "The image says what to run. A separate blueprint says how: which image, how much CPU and memory, which port, which environment. On Container Apps that blueprint is the container app itself, deployed as immutable revisions inside an environment. Explore the fields and the boxes they nest in.",
    },
    {
      navLabel: "compute",
      kicker: "Chapter 3",
      title: "Where the containers run",
      intro:
        "Your containers still need CPU and memory from somewhere. Container Apps is serverless by design: the platform runs the servers. Your choice is the workload profile, from a scale-to-zero Consumption profile to Dedicated hardware. Compare the options.",
    },
    {
      navLabel: "scaling",
      kicker: "Chapter 4",
      title: "Scaling with load",
      intro:
        "One container handles only so much. KEDA scale rules add and remove replicas as demand rises and falls, and with an HTTP rule the app can drop all the way to zero. Drag the load and watch the replica count follow.",
    },
    {
      navLabel: "traffic",
      kicker: "Chapter 5",
      title: "Traffic in, new version out",
      intro:
        "A running replica is no use until requests reach it, and eventually you ship a new version without downtime. Container Apps has built-in ingress and immutable revisions, so a new version comes up beside the old before traffic flips. Step through a rollout.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Five questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  image: {
    registryName: "Azure Container Registry",
    registryCode: "Microsoft.ContainerRegistry",
    reference: {
      host: "acme.azurecr.io",
      repository: "web",
      tag: "1.4.0",
    },
    hostLabel: "Login server",
    stages: [
      {
        id: "build",
        label: "Build",
        title: "Build the image from a Dockerfile",
        tone: "image",
        cli: "docker build -t web:1.4.0 .",
        artifact:
          "A local image: stacked read-only layers plus a manifest, addressable by a content digest.",
        body: "A build turns your Dockerfile into an image made of cached layers. The same image bytes run identically on your laptop and in the cloud, which is the whole point of a container.",
      },
      {
        id: "push",
        label: "Push",
        title: "Push it to Azure Container Registry",
        tone: "registry",
        cli: "az acr login --name acme && docker push acme.azurecr.io/web:1.4.0",
        artifact:
          "The image stored in a private ACR repository, now pullable anywhere by its full reference.",
        body: "Azure Container Registry is a managed private registry reached at a login server, name.azurecr.io. az acr login signs Docker in with your Entra identity. You can also build server-side with az acr build, no local Docker needed.",
      },
      {
        id: "run",
        label: "Run",
        title: "Reference it and run",
        tone: "container",
        cli: "az containerapp up --name web --resource-group app --image acme.azurecr.io/web:1.4.0 --target-port 80 --ingress external",
        artifact:
          "A running revision: the platform pulled the image by reference and started your replicas.",
        body: "You never re-upload the image to run it. The container app template points at the reference, and Container Apps pulls it from ACR to start each replica. The next chapters unpack that template.",
      },
    ],
    note: "The reference is loginServer / repository : tag. The login server names the registry, the repository groups versions of one image, and the tag (or an immutable @digest) picks the exact version. Pin a digest in production so a moving tag never changes what runs.",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A container image is a virtual machine image.",
        body: "It is not. A VM image carries a whole guest operating system; a container image carries only your app and its libraries, and every container on a host shares the host kernel. That is why images are small and start in seconds, not minutes.",
      },
      {
        kind: "note",
        tag: "Layers",
        title: "Images are layered and shared.",
        body: "Each Dockerfile instruction adds a layer. Layers are content-addressed and cached, so a rebuild that changes only your code reuses the base and dependency layers, and a registry stores each shared layer once.",
      },
    ],
  },
  anatomy: {
    specLabel: "Container app template",
    specNote:
      "The container app resource has a configuration section (ingress, secrets, registries) and a template section (containers, scale). A change to the template creates a new immutable revision; a change to configuration does not.",
    fields: [
      {
        id: "image",
        concept: "Container image",
        value: "acme.azurecr.io/web:1.4.0",
        home: "template.containers[].image",
        note: "The reference the platform pulls. A template can define more than one container that run together in a replica.",
      },
      {
        id: "cpumem",
        concept: "CPU and memory",
        value: "cpu: 0.5 · memory: 1Gi",
        home: "template.containers[].resources",
        note: "Set per container in allowed CPU-to-memory pairings (0.5 vCPU pairs with 1 Gi).",
      },
      {
        id: "port",
        concept: "Port",
        value: "targetPort: 80",
        home: "configuration.ingress.targetPort",
        note: "The port your container listens on. Ingress lives in configuration, so changing it does not spin a new revision.",
      },
      {
        id: "env",
        concept: "Environment variables",
        value: "LOG_LEVEL=info",
        home: "template.containers[].env",
        note: "Plain config passed in at launch. Secrets are referenced from the app's secrets, which live in configuration.",
      },
      {
        id: "count",
        concept: "How many to run",
        value: "minReplicas: 1 · maxReplicas: 10",
        home: "template.scale",
        note: "You set a replica range, not a fixed count. KEDA rules pick the actual number within it. Covered in the scaling chapter.",
      },
      {
        id: "role",
        concept: "Identity",
        value: "managed identity (system-assigned)",
        home: "identity",
        note: "A managed identity so your code calls Azure with no stored secrets, including pulling from ACR.",
      },
      {
        id: "capacity",
        concept: "Compute type",
        value: "workloadProfileName: Consumption",
        home: "workloadProfileName",
        note: "Selects the workload profile the revision runs on. Covered next chapter.",
      },
    ],
    containment: [
      {
        term: "Environment",
        sub: "the secure boundary, one virtual network",
        tone: "idle",
      },
      {
        term: "Container app",
        sub: "your application and its config",
        tone: "serverless",
      },
      {
        term: "Revision",
        sub: "an immutable snapshot of a version",
        tone: "registry",
      },
      {
        term: "Replica",
        sub: "one running instance of the revision",
        tone: "container",
      },
    ],
    containmentNote:
      "There is one extra layer that ECS has no direct equal of: the revision. An environment holds container apps, a container app holds revisions (versions), a revision runs replicas, and a replica runs one or more containers.",
    callouts: [
      {
        kind: "fix",
        tag: "One resource, many versions",
        title: "The blueprint and the manager are the same resource.",
        body: "Unlike ECS, there is no separate service object. The container app is both the definition and the running application, and each deploy of a template change produces a new immutable revision you can keep, split traffic to, or roll back to.",
      },
    ],
  },
  compute: {
    label: "Workload profile",
    options: [
      {
        id: "consumption",
        name: "Consumption profile",
        tone: "serverless",
        serverless: true,
        recommended: true,
        tagline: "Serverless, scales to zero, pay for what you use.",
        facts: [
          { label: "You manage", value: "Nothing below the app" },
          { label: "Scaling unit", value: "Per replica, to zero" },
          { label: "Billing", value: "Per-second resource use" },
        ],
        use: "Most workloads: web apps and event handlers where idle time should cost nothing.",
      },
      {
        id: "dedicated",
        name: "Dedicated profile",
        tone: "managed",
        serverless: true,
        tagline: "Customized hardware with predictable cost.",
        facts: [
          { label: "You manage", value: "Profile size, not servers" },
          { label: "Scaling unit", value: "Replicas on reserved capacity" },
          { label: "Billing", value: "Fixed per-environment plus instances" },
        ],
        use: "Larger or memory-heavy apps, or workloads that need reserved, more predictable capacity.",
      },
    ],
    note: "Container Apps is serverless either way: Azure runs and patches the underlying servers. The workload profile only sets what hardware your replicas land on. A workload profiles environment (the default) can mix Consumption and Dedicated profiles, and only Consumption apps can scale to zero.",
    callouts: [
      {
        kind: "note",
        tag: "No cluster to run",
        title: "There is no capacity for you to manage.",
        body: "Unlike the ECS EC2 option, Container Apps never exposes a fleet of virtual machines. Even the Dedicated profile is managed capacity: you choose a profile size, and the platform still handles OS upgrades, scaling operations, and failover inside the environment.",
      },
    ],
  },
  scale: {
    metricLabel: "Concurrent HTTP requests",
    engine: "KEDA scale rules",
    unitNoun: "replica",
    min: 0,
    max: 10,
    perUnit: 20,
    loadMax: 200,
    canScaleToZero: true,
    ruleSummary:
      "A scale rule sets the trigger (say 50 concurrent requests per replica) and the platform adds replicas as load rises and removes them as it falls, between the minReplicas and maxReplicas you set.",
    loadLabel: "Incoming load",
    note: "Bars are illustrative, not a capacity model. Container Apps uses KEDA and supports HTTP, TCP, CPU, memory, and event sources such as Service Bus, Event Hubs, Kafka, and Redis. The default range is 0 to 10 replicas, configurable up to 1000. If several rules are set, scaling starts when any one triggers.",
    callouts: [
      {
        kind: "fix",
        tag: "All the way down",
        title: "Container Apps can scale to zero.",
        body: "With an HTTP or event-driven rule and minReplicas of 0, an idle app drops to zero replicas and you are not billed usage while it is there; the next request wakes it. The one exception: apps that scale on CPU or memory load cannot scale to zero.",
      },
    ],
  },
  traffic: {
    ingressModel: "Built-in ingress",
    ingressNote:
      "Enable ingress and the app gets a fully qualified domain name and TLS with no load balancer, public IP, or other resource to create. External ingress faces the internet; internal ingress is reachable only inside the environment.",
    needsLoadBalancer: false,
    endpoint: "web.happy-sky-1a2b3c.eastus.azurecontainerapps.io",
    healthCheck: "Startup and readiness probes on the revision",
    rolloutLabel: "Revision rollout (single mode)",
    oldName: "Revision web--v1",
    newName: "Revision web--v2",
    steps: [
      {
        id: "start",
        label: "Start",
        oldPct: 100,
        newPct: 0,
        note: "web--v1 serves all traffic. You deploy a template change, which creates the new immutable revision web--v2.",
      },
      {
        id: "provision",
        label: "Provisioning",
        oldPct: 100,
        newPct: 0,
        note: "web--v2 provisions and scales up beside v1. In single revision mode, v1 keeps 100% of traffic while v2 is not yet ready. No downtime.",
      },
      {
        id: "ready",
        label: "Ready",
        oldPct: 100,
        newPct: 0,
        note: "v2 has provisioned, scaled to match, and passed its startup and readiness probes. It is now considered ready to receive traffic.",
      },
      {
        id: "flip",
        label: "Flip",
        oldPct: 0,
        newPct: 100,
        note: "Traffic flips to web--v2 and the old revision is deprovisioned. If v2 had failed to become ready, traffic would have stayed on v1.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "Weighted splits",
        title: "Multiple revision mode splits traffic by weight.",
        body: "Single revision mode does a clean flip. Switch to multiple revision mode and you can run several revisions at once and assign traffic by percentage, for example 80% to v1 and 20% to v2, for canary and blue/green releases.",
      },
    ],
  },
  quiz: [
    {
      q: "What is a container image?",
      opts: [
        "A running process on a host",
        "A read-only, layered snapshot of an app and its dependencies",
        "A virtual machine with its own operating system",
        "An ingress configuration",
      ],
      answer: 1,
      explain:
        "An image is a read-only, layered package of your app and its libraries. It shares the host kernel, so it is far smaller than a VM image and starts in seconds. A running instance of it is a container, and in Container Apps that runs as a replica.",
    },
    {
      q: "What is the extra layer Container Apps has that ECS does not?",
      opts: [
        "The cluster",
        "The revision, an immutable snapshot of a version",
        "The registry",
        "The load balancer",
      ],
      answer: 1,
      explain:
        "A container app is deployed as immutable revisions. Each template change creates a new revision you can keep, split traffic to, or roll back to. ECS has no direct equal; it uses task definition revisions plus a service.",
    },
    {
      q: "How does compute work in Azure Container Apps?",
      opts: [
        "You provision and patch a fleet of virtual machines",
        "It is serverless: Azure runs the servers, and you pick a workload profile",
        "Each replica is a separate VM you manage",
        "You must bring your own Kubernetes cluster",
      ],
      answer: 1,
      explain:
        "Container Apps is serverless. Azure manages the underlying servers, OS upgrades, and failover. Your choice is the workload profile (Consumption or Dedicated), not individual machines.",
    },
    {
      q: "Under load, how does a container app scale, and how low can it go?",
      opts: [
        "It resizes a single replica to use more CPU",
        "KEDA scale rules change the replica count, and HTTP apps can scale to zero",
        "It keeps a fixed number of replicas always running",
        "It creates new environments automatically",
      ],
      answer: 1,
      explain:
        "KEDA scale rules add and remove replicas between minReplicas and maxReplicas. With an HTTP or event rule and a minimum of 0, an idle app scales to zero and stops billing usage. CPU- or memory-scaled apps cannot reach zero.",
    },
    {
      q: "How do external requests reach a container app?",
      opts: [
        "You attach a separate Azure Load Balancer and target group",
        "Through built-in ingress, which gives the app an FQDN and TLS with no extra resource",
        "Only from inside the environment",
        "Through the container registry",
      ],
      answer: 1,
      explain:
        "Enabling ingress gives the app a fully qualified domain name and managed TLS with no load balancer or public IP to create. External ingress faces the internet; internal ingress stays inside the environment.",
    },
  ],
};

/* ================================ Export ================================= */

export const CONTENT: Record<Provider, LessonContent> = {
  aws: AWS,
  azure: AZURE,
};
