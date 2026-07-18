import { StackIcon as Stack } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { WipBadge } from "@/components/wip-badge";
import { getConcept } from "@/content/registry";
import type { Project, Provider } from "@/content/types";

/**
 * A project summary card for the projects index. Shows the project's
 * provider-agnostic title and goal, the concrete stack for the active lens, and
 * the concepts it builds on. Links into the build for the current provider.
 */
export function ProjectCard({
  project,
  provider,
}: {
  project: Project;
  provider: Provider;
}) {
  const stack = project.stack[provider] ?? [];
  const concepts = project.concepts
    .map((id) => getConcept(id)?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <Link
      href={`/${provider}/projects/${project.id}`}
      className="flex flex-col rounded-[16px] border border-line bg-surface p-[20px] shadow-[0_1px_2px_oklch(0.4_0.02_230_/_0.03)] transition-all hover:-translate-y-[2px] hover:border-[oklch(0.78_0.06_195)] hover:shadow-[0_10px_26px_-16px_oklch(0.4_0.06_195_/_0.5)]"
    >
      <span className="flex items-center gap-[8px]">
        <Stack size={17} weight="duotone" aria-hidden className="text-teal" />
        <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink-soft">
          {project.title}
        </span>
        {project.wip ? <WipBadge /> : null}
      </span>
      <span className="mt-[8px] text-pretty text-[13px] leading-[1.5] text-ink-muted">
        {project.short}
      </span>
      {stack.length > 0 ? (
        <span className="mt-[12px] flex flex-wrap gap-[6px]">
          {stack.map((service) => (
            <span
              key={service}
              className="rounded-full bg-teal-tint px-[9px] py-[3px] font-mono text-[11px] text-teal-ink"
            >
              {service}
            </span>
          ))}
        </span>
      ) : null}
      {concepts.length > 0 ? (
        <span className="mt-[12px] text-[11.5px] text-faint">
          Builds on {concepts.join(" + ")}
        </span>
      ) : null}
    </Link>
  );
}
