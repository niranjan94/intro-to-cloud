import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  PROVIDER_BRAND,
  PROVIDER_LABELS,
  type Project,
  type Provider,
} from "@/content/types";

/** The "you're viewing the X lens" marker shown beside the project title. */
function LensBadge({ provider }: { provider: Provider }) {
  return (
    <div className="flex items-center gap-[8px] rounded-[10px] border border-line bg-surface-muted px-[12px] py-[8px] text-[12.5px] text-ink-muted">
      <span
        aria-hidden
        className="h-[9px] w-[9px] rounded-full"
        style={{ background: PROVIDER_BRAND[provider] }}
      />
      You&rsquo;re building with the{" "}
      <strong className="font-semibold text-ink-strong">
        {PROVIDER_LABELS[provider]}
      </strong>{" "}
      lens
    </div>
  );
}

/**
 * The shared chrome every project build sits in: a breadcrumb back to the
 * projects index, the project title with its active-lens badge, a goal blurb,
 * the build body, and a footer link back to all projects. Mirrors
 * {@link LessonLayout} but scoped to the projects surface.
 */
export function ProjectShell({
  project,
  provider,
  blurb,
  children,
}: {
  project: Project;
  provider: Provider;
  blurb: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="max-w-[1200px] px-[44px] pt-[40px] motion-safe:animate-[fadeUp_0.4s_ease_both] max-[760px]:px-[20px] max-[760px]:pt-[28px]">
      <div className="flex items-center gap-[8px] font-mono text-[12.5px] text-ink-muted">
        <Link href={`/${provider}/projects`} className="text-teal-ink">
          Projects
        </Link>
        <span>/</span>
        <span className="text-body">{project.title}</span>
      </div>

      <div className="mt-[12px] flex flex-wrap items-start justify-between gap-[20px]">
        <h1 className="text-[38px] font-extrabold tracking-[-0.03em] text-ink max-[520px]:text-[28px]">
          {project.title}
        </h1>
        <LensBadge provider={provider} />
      </div>

      <p className="mt-[16px] max-w-[72ch] text-pretty text-[17px] leading-[1.6] text-body">
        {blurb}
      </p>

      {children}

      <div className="mt-[44px] flex gap-[12px] border-t border-line pt-[24px]">
        <Link
          href={`/${provider}/projects`}
          className="inline-flex items-center gap-[6px] text-[14px] text-teal-ink"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden />
          All projects
        </Link>
      </div>
    </article>
  );
}
