import {
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { Callout } from "@/components/lesson/callout";

/**
 * The Baseline: a fixed, read-only sample of the environment baseline the SOC
 * keeps for the fictional organization "Meridian". A baseline records what
 * "normal" looks like (known networks, privileged identities, automation, cloud
 * accounts, activity windows, workloads) so that every alert can be judged
 * against it. It is framed as a living document because in practice a baseline
 * is never finished: each closed investigation teaches the team something new
 * about the environment, and that understanding gets written back here.
 *
 * The facts on this page are deliberately consistent with the context every
 * Investigation in this section reasons against (office egress 198.51.100.0/24,
 * the production account 400123456789, root usage policy, and so on), so the
 * "is this normal here?" question in each exercise has a concrete answer to
 * check against. All values are fictional (ADR-0005).
 */

interface Fact {
  /** A concrete identifier for the fact: an address, role, account, or resource. */
  id?: string;
  label: string;
  meaning: ReactNode;
  /** The class of false alarm this fact lets the team quiet. */
  quiets?: string;
}

/** A key/value card in the "environment at a glance" summary. */
function Glance({ rows }: { rows: { k: string; v: ReactNode }[] }) {
  return (
    <dl className="mt-[22px] grid gap-[12px] [grid-template-columns:repeat(auto-fill,minmax(236px,1fr))]">
      {rows.map((row) => (
        <div
          key={row.k}
          className="rounded-[12px] border border-line bg-surface-muted p-[14px]"
        >
          <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-ink-muted">
            {row.k}
          </dt>
          <dd className="mt-[6px] text-[13.5px] leading-[1.5] text-ink-strong">
            {row.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The repeating baseline table: a fact and what it means when you triage. */
function FactTable({ facts }: { facts: Fact[] }) {
  return (
    <div className="@container mt-[16px] overflow-hidden rounded-[14px] border border-line bg-surface">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="grid gap-[6px] border-b border-line p-[16px] last:border-b-0 @[620px]:grid-cols-[minmax(0,290px)_1fr] @[620px]:gap-[24px]"
        >
          <div>
            {fact.id ? (
              <div className="break-words font-mono text-[12px] text-teal-ink">
                {fact.id}
              </div>
            ) : null}
            <div className="mt-[2px] text-[13.5px] font-semibold text-ink-strong">
              {fact.label}
            </div>
          </div>
          <div>
            <p className="text-[13.5px] leading-[1.6] text-body">
              {fact.meaning}
            </p>
            {fact.quiets ? (
              <p className="mt-[8px] flex flex-wrap items-baseline gap-x-[7px] gap-y-[2px]">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-teal">
                  Quiets
                </span>
                <span className="text-[12.5px] leading-[1.5] text-ink-muted">
                  {fact.quiets}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/** One numbered baseline section: an index, a heading, a lead, then its facts. */
function Section({
  index,
  title,
  lead,
  facts,
  children,
}: {
  index: string;
  title: string;
  lead: ReactNode;
  facts?: Fact[];
  children?: ReactNode;
}) {
  return (
    <section className="mt-[44px]">
      <div className="flex items-baseline gap-[10px]">
        <span className="font-mono text-[13px] font-bold text-teal">
          {index}
        </span>
        <h2 className="font-mono text-[15px] uppercase tracking-[0.04em] text-[oklch(0.4_0.02_230)]">
          {title}
        </h2>
      </div>
      <p className="mt-[10px] max-w-[72ch] text-[14.5px] leading-[1.65] text-body">
        {lead}
      </p>
      {facts ? <FactTable facts={facts} /> : null}
      {children}
    </section>
  );
}

const GLANCE: { k: string; v: ReactNode }[] = [
  {
    k: "Organization",
    v: "Meridian (a fictional company), a distributed and fully remote workforce. Primary domain meridian.example.",
  },
  {
    k: "AWS",
    v: (
      <>
        Production account{" "}
        <span className="font-mono text-[12.5px]">400123456789</span>, home
        region us-east-1.
      </>
    ),
  },
  {
    k: "Azure",
    v: (
      <>
        Subscription meridian-prod, tenant meridian.onmicrosoft.com, region
        eastus.
      </>
    ),
  },
  {
    k: "Biggest noise source",
    v: "Amazon Inspector vulnerability findings. A large open backlog is normal background.",
  },
];

const NETWORKS: Fact[] = [
  {
    id: "198.51.100.0/24",
    label: "Meridian trusted egress",
    meaning:
      "Every Meridian office, the CI/CD runners, and remote staff tunneling through the corporate VPN reach the internet from this range. Actions and sign-ins from here are the expected case. When something that normally originates here shows up from another address, that change is the thing to look at.",
    quiets:
      "off-hours and new-location sign-in flags for known staff and pipelines.",
  },
  {
    id: "203.0.113.140",
    label: "VPN concentrator egress",
    meaning:
      "Remote employees route through this concentrator, sitting in a datacenter far from where they physically are. A sign-in that pairs this address with the same user's home ISP minutes apart looks like impossible travel on paper, but it is exactly what a VPN user produces.",
    quiets: "impossible-travel alerts for staff behind the VPN.",
  },
  {
    id: "203.0.113.61",
    label: "Edge API public address",
    meaning:
      "The internet-facing Edge API answers on this address by design. Inbound traffic here is normal. It is also why a reachable vulnerability on that service is treated as urgent: the exposure is real.",
  },
];

const IDENTITIES: Fact[] = [
  {
    id: "root",
    label: "AWS account root user",
    meaning:
      "Hardware MFA is required, root is used only from trusted egress, and it is never used for day-to-day work. There is no routine reason for a root sign-in, so every one is reviewed rather than suppressed.",
  },
  {
    label: "AWS administrators",
    meaning:
      "Admins operate through short-lived SSO role sessions from trusted egress. They never use long-lived IAM access keys, so a long-lived key performing an admin-style action is off-pattern by definition.",
  },
  {
    id: "svc-*",
    label: "Service accounts",
    meaning:
      "Service accounts carry the svc- prefix, are created only by the terraform-ci pipeline with the boundary-service-accounts permissions boundary attached, and are programmatic-only with no console access. A new svc- principal born through that path with that boundary is exactly how a service account is meant to appear.",
    quiets: "new-IAM-user alerts for pipeline-provisioned service accounts.",
  },
  {
    id: "svc-reporting",
    label: "Reporting service account",
    meaning:
      "Read-only access to s3://meridian-analytics/reporting/*, onboarded under CHG-4471 for quarterly reporting. One programmatic key, no console. Anything beyond that read scope is outside its remit.",
  },
  {
    label: "Azure privileged roles",
    meaning:
      "Standing privileged roles are granted only through PIM as time-bound, approval-gated activations from trusted egress. Permanent Owner is prohibited, so a permanent Owner grant at subscription scope is a policy violation on its face.",
  },
];

const AUTOMATION: Fact[] = [
  {
    id: "terraform-ci",
    label: "Infrastructure pipeline role",
    meaning:
      "The CI/CD pipeline assumes this role from trusted egress to provision infrastructure and service accounts. High-volume configuration changes and new-principal creations from it are expected, provided they carry the standard permissions boundary.",
    quiets: "configuration-change and new-user alerts for pipeline activity.",
  },
  {
    id: "web-platform-sp",
    label: "Azure web platform service principal",
    meaning:
      "Operates the public marketing web platform. Its activity against the web assets is routine automation, not a human making changes.",
  },
  {
    id: "Amazon Inspector",
    label: "Vulnerability scanner",
    meaning:
      "Runs continuously and routes findings to vulnerability management on the normal patch cadence, not to the SOC. A large open backlog is background. What reaches an analyst is a finding on a reachable, exposed, or actively exploited asset, not raw scan volume.",
    quiets: "the steady stream of low-exposure CVE findings.",
  },
];

const ACCOUNTS: Fact[] = [
  {
    id: "400123456789",
    label: "AWS production account",
    meaning:
      "The single production AWS account, home region us-east-1, on the Business support plan. Global, IAM, and root events always land in us-east-1, so that region on those events is placement, not signal.",
  },
  {
    id: "meridian-prod",
    label: "Azure production subscription",
    meaning:
      "Subscription id 7f3a1c9e-4b22-4e18-9a67-1d0e5c8b2a41 in tenant meridian.onmicrosoft.com, region eastus. The single production subscription for Meridian's Azure workloads.",
  },
];

const WORKLOADS: Fact[] = [
  {
    id: "s3://meridian-customer-exports",
    label: "Customer data exports (private)",
    meaning:
      "Holds nightly customer data exports and must stay fully private. Block Public Access stays on. Any public-access grant on this bucket is an incident regardless of who made it or why.",
  },
  {
    id: "meridianwebassets / $web",
    label: "Marketing static site (public by design)",
    meaning:
      "The $web container is the reserved static-website container and is public by design for the public marketing site, moved there under CHG-5120. The data and backups containers in the same account must stay private. The call turns on which container went public, not on the word public.",
    quiets: "anonymous-read alerts on the marketing $web container.",
  },
  {
    label: "Edge API vs internal batch workers",
    meaning:
      "The Edge API is internet-facing by design; internal batch workers sit in private subnets with no inbound internet path. Exposure, not the raw CVSS score, decides how urgent a vulnerability is. A reachable flaw on the Edge API is an incident; the same flaw on a private batch worker is patch-cadence work.",
  },
];

const CHANGES: Fact[] = [
  {
    id: "CHG-####",
    label: "Change tickets",
    meaning:
      "Every sanctioned change carries a CHG-#### ticket. The ticket is how you tell an authorized change from an intrusion dressed up as one. A sensitive change with no ticket referencing it is a red flag; a matching ticket is often what turns a scary-looking alert into a benign true positive.",
  },
  {
    id: "CHG-4471 · CHG-5120",
    label: "Recent approved changes",
    meaning:
      "CHG-4471 onboarded the svc-reporting service account for quarterly reporting. CHG-5120 moved the marketing site to public static hosting, which required anonymous read on the $web container. Both explain activity that would otherwise look suspicious.",
  },
];

/** The baseline page: a read-only sample environment baseline for Meridian. */
export default function Baseline() {
  return (
    <article className="max-w-[1080px] px-[44px] pt-[40px] motion-safe:animate-[fadeUp_0.4s_ease_both] max-[760px]:px-[20px] max-[760px]:pt-[28px]">
      <div className="flex items-center gap-[8px] font-mono text-[12.5px] text-ink-muted">
        <Link href="/investigations" className="text-teal-ink">
          Investigations
        </Link>
        <span>/</span>
        <span className="text-body">Baseline</span>
      </div>

      <div className="mt-[14px]">
        <span className="rounded-[7px] border border-line bg-surface-muted px-[10px] py-[4px] font-mono text-[11.5px] uppercase tracking-[0.05em] text-ink-muted">
          Reference · living document
        </span>
      </div>

      <h1 className="mt-[12px] text-[38px] font-extrabold tracking-[-0.03em] text-ink max-[520px]:text-[28px]">
        The Meridian baseline
      </h1>

      <p className="mt-[16px] max-w-[74ch] text-pretty text-[17px] leading-[1.6] text-body">
        A baseline is the record of what normal looks like for one organization:
        the networks its traffic comes from, who is allowed to do sensitive
        things, what its automation does on its own, and which resources are
        meant to be public. It is the context every alert is judged against.
        Without it, a root login or a public bucket is just a scary-looking
        event; with it, you can tell whether that event is expected here.
      </p>
      <p className="mt-[12px] max-w-[74ch] text-[14px] leading-[1.6] text-ink-muted">
        Meridian is a fictional company invented for these exercises. It is not
        a real business, and the name is not a security term. Everything below,
        every address, account, and identity, is made up (ADR-0005), but it all
        hangs together so the alerts you triage have a consistent world to be
        judged against.
      </p>

      <div className="mt-[18px] flex flex-wrap items-center gap-x-[8px] gap-y-[6px] font-mono text-[11.5px] text-ink-muted">
        <span>Version 4</span>
        <span aria-hidden>·</span>
        <span>Reviewed 2026-07-15</span>
        <span aria-hidden>·</span>
        <span>Owned by the Meridian SOC and detection engineering</span>
        <span aria-hidden>·</span>
        <span>Drawn from ~90 days of signals</span>
      </div>

      <Glance rows={GLANCE} />

      <Callout
        kind="note"
        tag="How to read this"
        title="A baseline is never finished."
        body="This is a snapshot, not a final answer. A baseline grows one confirmed fact at a time: every investigation the team closes teaches it something new about the environment, and that gets written back here. A fact that is missing today is not wrong, it just has not been learned yet. When an alert contradicts this page, that is the point, and it is where triage begins."
      />

      <Section
        index="01"
        title="Trusted networks and egress"
        lead="Where legitimate traffic comes from. These are the addresses Meridian's own people, pipelines, and services use, each trusted for a specific role rather than blanket-trusted."
        facts={NETWORKS}
      >
        <Callout
          kind="fix"
          tag="A range is not a verdict"
          title="Known-good addresses are listed one at a time, on purpose."
          body="These exercises reuse the same documentation ranges for both Meridian's assets and the attackers targeting them, which is true to life: a single subnet can hold a trusted VPN egress and a hostile host at once. Trust the specific addresses on this list for their stated role. Do not extend that trust to a whole range, and do not treat a range as hostile just because one bad address lives in it."
        />
      </Section>

      <Section
        index="02"
        title="People and privileged identities"
        lead="Who is allowed to perform sensitive actions, and through which path. The path matters as much as the person: the same action is routine down one channel and alarming down another."
        facts={IDENTITIES}
      />

      <Section
        index="03"
        title="Automation and platform principals"
        lead="The non-human identities that legitimately make privileged changes on a schedule. Most of the noisiest, highest-volume activity in the environment is one of these doing its job."
        facts={AUTOMATION}
      />

      <Section
        index="04"
        title="Cloud accounts and subscriptions"
        lead="The known-good accounts that own or receive activity. There is one production account per cloud; anything claiming to be a Meridian account outside these is not."
        facts={ACCOUNTS}
      />

      <Section
        index="05"
        title="Activity windows"
        lead="When activity is expected, used for off-hours anomaly scoring."
      >
        <div className="@container mt-[16px] overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="grid gap-[6px] border-b border-line p-[16px] @[620px]:grid-cols-[minmax(0,290px)_1fr] @[620px]:gap-[24px]">
            <div className="text-[13.5px] font-semibold text-ink-strong">
              Human activity
            </div>
            <p className="text-[13.5px] leading-[1.6] text-body">
              Meridian is a distributed, fully remote workforce spread across
              time zones, so it runs no meaningful office-hours window. Time of
              day on its own is not an anomaly here. A privileged action at
              02:00 is judged on who did it, from where, and whether it was
              sanctioned, never on the clock alone.
            </p>
          </div>
          <div className="grid gap-[6px] p-[16px] @[620px]:grid-cols-[minmax(0,290px)_1fr] @[620px]:gap-[24px]">
            <div className="text-[13.5px] font-semibold text-ink-strong">
              Automation
            </div>
            <p className="text-[13.5px] leading-[1.6] text-body">
              Pipelines and batch workers run continuously at a steady rate.
              Listed automated principals are excluded from off-hours scoring,
              because for them there is no off-hours.
            </p>
          </div>
        </div>
      </Section>

      <Section
        index="06"
        title="Workloads, data, and exposure"
        lead="What each notable resource is for, and which are meant to be reachable. Exposure is the hinge that turns an identical finding into either an incident or routine maintenance."
        facts={WORKLOADS}
      />

      <Section
        index="07"
        title="Change management"
        lead="How a legitimate change announces itself. The presence or absence of a ticket is one of the fastest ways to sort a sanctioned action from an intrusion."
        facts={CHANGES}
      />

      <section className="mt-[48px] rounded-[16px] border border-line bg-surface-muted p-[20px] max-[760px]:p-[16px]">
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink-strong">
          Kept visible on purpose
        </h2>
        <p className="mt-[8px] max-w-[74ch] text-[14px] leading-[1.6] text-body">
          A baseline is used to quiet noise, but quieting the wrong thing is how
          a real intrusion slips through. These stay in the queue no matter what
          the rest of this document says.
        </p>
        <ul className="mt-[14px] flex flex-col gap-[12px]">
          {[
            {
              h: "Any root usage",
              b: "Reviewed every time, never auto-closed. There is no version of a root sign-in that is routine here.",
            },
            {
              h: "A dormant principal waking up",
              b: "A known service principal that has been silent for months is treated as suspicious the moment it acts again. Being on this list is not the same as being expected right now.",
            },
            {
              h: "Private storage going public",
              b: 'The marketing $web container is public by design; the data and backups containers going public is always an incident. Never blanket-trust the word "public".',
            },
            {
              h: "Trusted egress is narrow",
              b: "The VPN concentrator and Edge API addresses are trusted for their specific role, not as general office egress. A known-good address doing something outside its role still earns scrutiny.",
            },
            {
              h: "Genuine posture gaps",
              b: "Real vulnerabilities and CVE backlogs are downgraded, not hidden, and stay visible until they are actually remediated.",
            },
          ].map((item) => (
            <li key={item.h} className="flex items-start gap-[10px]">
              <span
                aria-hidden
                className="mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full bg-[oklch(0.72_0.14_25)]"
              />
              <span className="min-w-0">
                <span className="text-[14px] font-semibold text-ink-strong">
                  {item.h}.
                </span>{" "}
                <span className="text-[13.5px] leading-[1.6] text-body">
                  {item.b}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-[36px] rounded-[14px] border border-line bg-surface p-[18px]">
        <p className="text-[15px] font-semibold text-ink-strong">
          Keep this page open while you work the queue.
        </p>
        <p className="mt-[6px] max-w-[74ch] text-[13.5px] leading-[1.6] text-body">
          Every alert asks the same first question: is this normal here? This
          page is where the answer lives. When an alert lines up with a fact
          above, it is probably benign; when it contradicts one, you have found
          your signal.
        </p>
        <Link
          href="/investigations"
          className="mt-[14px] inline-flex items-center gap-[7px] rounded-button bg-primary px-[16px] py-[9px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to the alert queue
          <ArrowRight size={14} weight="bold" aria-hidden />
        </Link>
      </div>

      <div className="mt-[36px] flex gap-[12px] border-t border-line pt-[24px]">
        <Link
          href="/investigations/orientation"
          className="inline-flex items-center gap-[6px] text-[14px] text-teal-ink"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden />
          Back to Orientation
        </Link>
      </div>
    </article>
  );
}
