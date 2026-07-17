import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { NetworkChapters } from "./chapters";

const concept = getConcept("virtual-network");

const BLURB =
  "Carve out your own private, isolated network inside the cloud: pick its address range, split it into public and private subnets, and control exactly what can reach the internet and what can reach your servers.";

const ELEVATOR =
  "a private, isolated slice of cloud network you shape yourself";

/**
 * The Virtual Network lesson. The heavy, interactive body lives in
 * NetworkChapters and is driven per provider (AWS and Azure diverge in how they
 * reach the internet and how their firewalls work), while this shell provides
 * the shared concept framing and the cross-provider equivalence.
 */
export function VirtualNetworkLesson({ provider }: { provider: Provider }) {
  if (!concept) return null;

  return (
    <LessonLayout concept={concept} provider={provider} blurb={BLURB}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: "Amazon VPC", code: "ec2 · vpc" }}
        azure={{
          service: "Azure Virtual Network",
          code: "Microsoft.Network",
        }}
        elevator={ELEVATOR}
      />
      <NetworkChapters provider={provider} />
    </LessonLayout>
  );
}
