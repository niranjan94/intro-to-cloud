import type { Project, Provider } from "./types";

/**
 * The capstone-project catalog. Projects are the applied counterpart to the
 * concept catalog in `registry.ts`: each one assembles concepts the learner has
 * already met into a single working system. Array order is the recommended
 * order to attempt them (simplest build first). Every project appears in
 * navigation; a lesson component is wired in `components` only once it has been
 * authored, and a project without a component for the active provider renders a
 * "coming soon" state.
 */
export const projects: readonly Project[] = [
  {
    id: "web-server-vm",
    title: "Web Server on a VM",
    short: "Run nginx on a cloud VM and serve a page to the internet.",
    concepts: ["virtual-network", "virtual-machines"],
    stack: {
      aws: ["Amazon VPC", "Amazon EC2"],
      azure: ["Azure Virtual Network", "Azure Virtual Machine"],
    },
    components: {
      aws: () => import("./projects/web-server-vm/aws"),
      azure: () => import("./projects/web-server-vm/azure"),
    },
  },
  {
    id: "load-balanced-web-app",
    title: "Load-Balanced Web App",
    short:
      "Run a web app on private VMs, reached only through a Layer 7 load balancer.",
    concepts: ["virtual-network", "virtual-machines", "load-balancing"],
    stack: {
      aws: ["Amazon VPC", "Application Load Balancer", "Amazon EC2"],
      azure: [
        "Azure Virtual Network",
        "Azure Application Gateway",
        "Azure Virtual Machine",
      ],
    },
    components: {
      aws: () => import("./projects/load-balanced-web-app/aws"),
      azure: () => import("./projects/load-balanced-web-app/azure"),
    },
  },
];

/** Look up a project by its id. */
export function getProject(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

/** The providers a project has an authored build for. */
export function projectProviders(project: Project): Provider[] {
  return Object.keys(project.components) as Provider[];
}

/** Whether a project has an authored build for a given provider. */
export function projectSupportsProvider(
  project: Project,
  provider: Provider,
): boolean {
  return provider in project.components;
}
