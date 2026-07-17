"use client";

import { useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import {
  DiagramCanvas,
  DiagramFrame,
  DiagramNode,
} from "@/components/lesson/diagram";
import { SectionHeading } from "@/components/lesson/section-heading";
import { getConcept } from "@/content/registry";
import { PROVIDER_LABELS, type Provider } from "@/content/types";
import { cn } from "@/lib/utils";

const concept = getConcept("virtual-machines");

const TIERS = ["Small", "Balanced", "Compute"] as const;
const CITIES = ["N. Virginia", "W. Europe", "Sydney"] as const;

const VM: Record<
  Provider,
  { sizes: string[]; regions: string[]; disk: string }
> = {
  aws: {
    sizes: ["t3.micro", "t3.large", "c6i.xlarge"],
    regions: ["us-east-1", "eu-west-1", "ap-southeast-2"],
    disk: "Amazon EBS · gp3",
  },
  azure: {
    sizes: ["B1s", "D2s_v5", "F4s_v2"],
    regions: ["eastus", "westeurope", "australiaeast"],
    disk: "Managed Disk · Premium",
  },
};

function OptionButton({
  primary,
  secondary,
  active,
  onSelect,
}: {
  primary: string;
  secondary: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between gap-[10px] rounded-[11px] border-[1.5px] px-[13px] py-[11px] text-left transition-all",
        active
          ? "border-[oklch(0.7_0.09_195)] bg-teal-tint"
          : "border-line bg-surface-muted text-body",
      )}
    >
      <span className="flex flex-col items-start">
        <span className="text-[13px] font-semibold text-ink-strong">
          {primary}
        </span>
        <span className="font-mono text-[11.5px] text-teal">{secondary}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "h-[16px] w-[16px] shrink-0 rounded-full",
          active
            ? "bg-teal-ring shadow-[inset_0_0_0_3px_#fff]"
            : "border-[1.5px] border-[oklch(0.85_0.01_230)]",
        )}
      />
    </button>
  );
}

/**
 * The interactive core of the Virtual Machines lesson. Holds the machine
 * configuration and re-labels the architecture diagram, resource id, and CLI
 * as the learner tweaks it — and, when the lens switches, shows the same
 * machine named the other provider's way.
 */
export function VmInteractive({ provider }: { provider: Provider }) {
  const [name, setName] = useState("web-01");
  const [sizeIx, setSizeIx] = useState(0);
  const [regionIx, setRegionIx] = useState(0);

  const vm = VM[provider];
  const service = concept?.services[provider] ?? "";
  const size = vm.sizes[sizeIx];
  const region = vm.regions[regionIx];
  const safeName = name || "vm-01";

  const resourceId =
    provider === "aws"
      ? `arn:aws:ec2:${region}:452110:instance/i-0f3ac91b7d2`
      : `/subscriptions/8f2e.../resourceGroups/intro-cloud/providers/Microsoft.Compute/virtualMachines/${safeName}`;

  const cli =
    provider === "aws"
      ? `aws ec2 run-instances --image-id ami-0abc123 --instance-type ${size} --region ${region}`
      : `az vm create -g intro-cloud -n ${safeName} --size ${size} --location ${region} --image Ubuntu2204`;

  return (
    <>
      <SectionHeading>How it fits together</SectionHeading>
      <DiagramCanvas>
        <DiagramFrame label={`Region · ${region}`} tone="blue">
          <DiagramFrame
            label="Virtual Network · private subnet"
            tone="green"
            className="mt-[12px]"
          >
            <div className="mt-[12px] flex flex-wrap gap-[12px]">
              <DiagramNode title={service} sub={size} />
              <DiagramNode title="Attached disk" sub={vm.disk} tone="gray" />
            </div>
          </DiagramFrame>
        </DiagramFrame>
      </DiagramCanvas>

      <SectionHeading>Try it · provision a machine</SectionHeading>
      <p className="mt-[10px] text-[14px] text-muted">
        Configure a server and watch the{" "}
        <strong className="font-semibold">same resource</strong> get named the{" "}
        {PROVIDER_LABELS[provider]} way. Switch the lens up top — your settings
        stay put.
      </p>
      <div className="mt-[16px] overflow-hidden rounded-[18px] border border-teal-line bg-surface">
        <div className="grid grid-cols-1 gap-[22px] p-[22px] min-[760px]:grid-cols-2">
          <div>
            <label
              htmlFor="vm-name"
              className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted"
            >
              Name
            </label>
            <input
              id="vm-name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 24),
                )
              }
              className="mt-[8px] w-full rounded-[10px] border border-input bg-surface-muted px-[12px] py-[10px] font-mono text-[14px] text-ink-soft"
            />
            <span className="mt-[18px] block text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted">
              Size
            </span>
            <div className="mt-[8px] flex flex-col gap-[8px]">
              {TIERS.map((tier, i) => (
                <OptionButton
                  key={tier}
                  primary={tier}
                  secondary={vm.sizes[i]}
                  active={i === sizeIx}
                  onSelect={() => setSizeIx(i)}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted">
              Region
            </span>
            <div className="mt-[8px] flex flex-col gap-[8px]">
              {CITIES.map((city, i) => (
                <OptionButton
                  key={city}
                  primary={city}
                  secondary={vm.regions[i]}
                  active={i === regionIx}
                  onSelect={() => setRegionIx(i)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-line bg-panel px-[22px] py-[18px]">
          <div className="flex items-center justify-between gap-[12px]">
            <div className="flex items-center gap-[8px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[oklch(0.75_0.13_150)] shadow-[0_0_0_3px_oklch(0.75_0.13_150_/_0.25)]" />
              <span className="font-mono text-[12px] text-[oklch(0.85_0.02_150)]">
                running
              </span>
            </div>
            <span className="font-mono text-[11px] text-[oklch(0.7_0.02_230)]">
              {PROVIDER_LABELS[provider]} resource id
            </span>
          </div>
          <div className="mt-[10px] break-all font-mono text-[12.5px] leading-[1.6] text-[oklch(0.92_0.02_195)]">
            {resourceId}
          </div>
        </div>
      </div>

      <SectionHeading>The command</SectionHeading>
      <CliBlock command={cli} />
    </>
  );
}
