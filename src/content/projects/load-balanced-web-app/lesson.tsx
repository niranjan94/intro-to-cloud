import { FurtherReading } from "@/components/lesson/further-reading";
import { ProjectShell } from "@/components/lesson/project-shell";
import { StackPanel } from "@/components/lesson/stack-panel";
import { getProject } from "@/content/projects";
import type { Provider } from "@/content/types";
import { LoadBalancedChapters } from "./chapters";
import { AGENT, DOCS, RESPONSIBILITY, SECURITY } from "./data";

const project = getProject("load-balanced-web-app");

const BLURB =
  "Take the web server you already built and put it behind a Layer 7 load balancer. The compute moves into a private subnet with no public IP of its own, and the only way in becomes a load balancer in front of it: a listener, a health-checked pool of targets, and a firewall that trusts the balancer instead of the whole internet. Because the machines are now private, even installing nginx takes a deliberate outbound path.";

const ELEVATOR =
  "a web app on private VMs, reached only through a Layer 7 load balancer";

/**
 * The Load-Balanced Web App capstone, one rung up from Web Server on a VM. The
 * heavy, interactive body lives in LoadBalancedChapters and is driven per
 * provider (AWS and Azure diverge in how the front door is shaped and how
 * private compute reaches the internet), while this shell provides the shared
 * framing, the cross-provider stack, and the reference-tab data.
 */
export function LoadBalancedWebAppLesson({ provider }: { provider: Provider }) {
  if (!project) return null;

  return (
    <ProjectShell project={project} provider={provider} blurb={BLURB}>
      <StackPanel
        provider={provider}
        aws={project.stack.aws ?? []}
        azure={project.stack.azure ?? []}
        elevator={ELEVATOR}
      />
      <LoadBalancedChapters
        provider={provider}
        responsibility={RESPONSIBILITY[provider]}
        security={SECURITY[provider]}
        agent={AGENT[provider]}
      />
      <FurtherReading links={DOCS[provider]} />
    </ProjectShell>
  );
}
