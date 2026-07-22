import {
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
  CaretRightIcon as CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  type OrientationSection,
  OrientationWalkthrough,
} from "@/components/investigation/orientation-walkthrough";
import { Callout } from "@/components/lesson/callout";
import {
  type DocLink,
  FurtherReading,
} from "@/components/lesson/further-reading";
import { Glossary, type GlossaryTerm } from "@/components/lesson/glossary";
import { AlertAnatomy } from "@/content/investigations/orientation/alert-anatomy";

/**
 * The Primer: an expository, ungraded orientation to the SOC analyst's job that
 * prepares a learner arriving from the cloud Concepts to work the alert queue
 * (ADR-0006). Hand-authored interactive content, not a data-driven engine: there
 * is one Primer and its sections are bespoke. The five-phase framing here is the
 * same flow every Investigation runs, so the vocabulary carries straight over.
 */

/** A left-to-right sequence of labelled steps; wraps on narrow screens. */
function Flow({ steps }: { steps: { label: string; sub?: string }[] }) {
  return (
    <div className="mt-[18px] flex flex-wrap items-center gap-y-[8px]">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="rounded-[10px] border border-line bg-surface px-[12px] py-[9px]">
            <div className="text-[13px] font-semibold text-ink-strong">
              {step.label}
            </div>
            {step.sub ? (
              <div className="mt-[2px] font-mono text-[11px] text-ink-muted">
                {step.sub}
              </div>
            ) : null}
          </div>
          {i < steps.length - 1 ? (
            <CaretRight
              size={15}
              weight="bold"
              aria-hidden
              className="mx-[6px] shrink-0 text-faint"
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** A card grid of term-and-definition pairs. */
function TermGrid({ terms }: { terms: { term: string; def: ReactNode }[] }) {
  return (
    <dl className="mt-[18px] grid gap-[12px] [grid-template-columns:repeat(auto-fill,minmax(248px,1fr))]">
      {terms.map((t) => (
        <div
          key={t.term}
          className="rounded-[12px] border border-line bg-surface p-[14px]"
        >
          <dt className="text-[13.5px] font-semibold text-ink-strong">
            {t.term}
          </dt>
          <dd className="mt-[5px] text-[13px] leading-[1.55] text-body">
            {t.def}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The analyst tiers, each a labelled row with its remit. */
function TierList({
  tiers,
}: {
  tiers: { tag: string; name: string; body: string; you?: boolean }[];
}) {
  return (
    <div className="mt-[18px] flex flex-col gap-[10px]">
      {tiers.map((tier) => (
        <div
          key={tier.tag}
          className="flex items-start gap-[12px] rounded-[12px] border border-line bg-surface p-[14px]"
        >
          <span className="mt-[1px] shrink-0 rounded-[7px] bg-surface-muted px-[9px] py-[4px] font-mono text-[11.5px] font-bold text-ink-soft">
            {tier.tag}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-[8px]">
              <span className="text-[14px] font-semibold text-ink-strong">
                {tier.name}
              </span>
              {tier.you ? (
                <span className="rounded-[6px] bg-teal-tint px-[7px] py-[1px] font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-teal-ink">
                  You start here
                </span>
              ) : null}
            </div>
            <p className="mt-[4px] text-[13px] leading-[1.55] text-body">
              {tier.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** A supporting paragraph within a section body. */
function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-[14px] text-pretty text-[14.5px] leading-[1.7] text-body">
      {children}
    </p>
  );
}

/** A quick-reference glossary of the terms used across the primer and the queue. */
const KEY_TERMS: GlossaryTerm[] = [
  {
    term: "SOC",
    definition:
      "Security Operations Center. The team that watches an organization's systems for misuse and attack and decides what to do.",
  },
  {
    term: "Triage",
    definition:
      "Working the alert queue one item at a time, sorting real problems from noise and deciding what to escalate.",
  },
  {
    term: "Detection rule",
    definition:
      "Logic that watches raw telemetry for a pattern worth a human's attention and raises an alert when it matches.",
  },
  {
    term: "Event vs alert",
    definition:
      "An event is one thing that happened. An alert is an event, or a pattern of them, that a rule flags for review.",
  },
  {
    term: "Alert fatigue",
    definition:
      "The dulling of attention from reading a long queue of mostly false alarms. The discipline is treating each alert with equal care.",
  },
  {
    term: "True positive",
    definition:
      "The alert caught something real. There is a genuine problem to act on.",
  },
  {
    term: "False positive",
    definition:
      "The alert fired but nothing bad happened. The detection's premise did not hold up.",
  },
  {
    term: "Benign true positive",
    definition:
      "It really happened and it is expected, such as a sanctioned admin action. Real, but not a threat, so it closes.",
  },
  {
    term: "Signal vs noise",
    definition:
      "A signal genuinely points to a threat. Noise merely looks interesting. Triage is separating the two.",
  },
  {
    term: "Indicator of compromise (IOC)",
    definition:
      "A concrete artifact you can act on or hand off: an IP address, a domain, a user account, a file hash.",
  },
  {
    term: "Severity",
    definition:
      "How bad it would be if the alert were real, from Critical to Info. Pre-assigned by the rule, not your verdict.",
  },
  {
    term: "Effective severity",
    definition:
      "The severity after triage weighs context. A Critical finding with no real exposure often drops well below its base rating.",
  },
  {
    term: "Escalate / Close",
    definition:
      "The two terminal calls. Escalate hands the alert up with your reasoning; Close ends it with a note explaining why.",
  },
  {
    term: "MITRE ATT&CK",
    definition:
      'A shared catalog of attacker techniques. A tag like "Valid Accounts (T1078)" names the technique an alert maps to.',
  },
  {
    term: "OCSF",
    definition:
      "Open Cybersecurity Schema Framework. A common event schema that makes findings from different tools read alike.",
  },
  {
    term: "CVSS",
    definition:
      "A context-free score from 0 to 10 rating how severe a vulnerability could be. It measures the flaw, not your exposure.",
  },
  {
    term: "EPSS",
    definition:
      "Exploit Prediction Scoring System. The probability that a vulnerability will be exploited in the near term.",
  },
  {
    term: "CISA KEV",
    definition:
      "CISA's Known Exploited Vulnerabilities catalog. A list of flaws confirmed to be exploited in the wild.",
  },
];

/** Authoritative external references for the frameworks the exercises lean on. */
const FURTHER_READING: DocLink[] = [
  {
    label: "MITRE ATT&CK",
    href: "https://attack.mitre.org/",
    note: "The catalog of attacker tactics and techniques behind the ATT&CK tags on each alert.",
  },
  {
    label: "CISA Known Exploited Vulnerabilities",
    href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    note: "The authoritative list of CVEs confirmed to be exploited in the wild.",
  },
  {
    label: "FIRST EPSS",
    href: "https://www.first.org/epss/",
    note: "How the Exploit Prediction Scoring System estimates the odds a CVE gets exploited.",
  },
  {
    label: "FIRST CVSS",
    href: "https://www.first.org/cvss/",
    note: "What a CVSS base score does, and does not, tell you about real-world risk.",
  },
  {
    label: "Open Cybersecurity Schema Framework",
    href: "https://schema.ocsf.io/",
    note: "The normalized event schema the raw alerts in this section are shaped in.",
  },
  {
    label: "NIST SP 800-61: Incident Handling Guide",
    href: "https://csrc.nist.gov/pubs/sp/800/61/r2/final",
    note: "The standard lifecycle for detecting, triaging, and responding to incidents.",
  },
];

const sections: readonly OrientationSection[] = [
  {
    navLabel: "The SOC",
    kicker: "The room that watches",
    title: "What a Security Operations Center is",
    intro:
      "In the earlier modules you built cloud systems. Once systems like those are running for real, someone has to watch them for misuse, mistakes, and attack. That watching is the job of the Security Operations Center.",
    body: (
      <>
        <P>
          A Security Operations Center, or SOC, is a team whose whole purpose is
          to notice when something is wrong across an organization's systems and
          decide what to do about it. It is the defensive side of security,
          often called the blue team, in contrast to the red team that attacks
          systems on purpose to test them.
        </P>
        <P>
          The SOC runs continuously, because attacks do not keep office hours. A
          misconfigured bucket, a stolen password, a server quietly reaching out
          to somewhere it should not: these surface at any hour, and the queue
          is watched around the clock.
        </P>
        <Callout
          kind="note"
          tag="A different kind of expertise"
          title="You do not need to have built the system to defend it."
          body="A SOC analyst rarely owns the applications they watch. The skill is not knowing one product deeply; it is reading signals across many unfamiliar systems and telling a real problem from noise. That is a learnable habit, and it is what this section trains."
        />
      </>
    ),
  },
  {
    navLabel: "The job",
    kicker: "The analyst's day",
    title: "Where you start, and where alerts go next",
    intro:
      "Most of a SOC analyst's day is triage: working a queue of alerts one at a time and deciding which ones are real. SOCs usually organize that work into tiers.",
    body: (
      <>
        <TierList
          tiers={[
            {
              tag: "T1",
              name: "Triage",
              body: "Works the incoming alert queue. Sorts real from noise, closes the false alarms with a note, and escalates the ones that warrant a deeper look. This is where a new analyst begins.",
              you: true,
            },
            {
              tag: "T2",
              name: "Investigation and response",
              body: "Takes the escalations, digs into the full picture, and contains and remediates confirmed incidents.",
            },
            {
              tag: "T3",
              name: "Hunting and detection engineering",
              body: "Looks for threats no alert caught, and writes and tunes the detection rules that feed everyone else's queue.",
            },
          ]}
        />
        <P>
          The queue never empties, and most alerts turn out to be false alarms.
          Reading dozens of them in a shift wears down attention; the industry
          calls this alert fatigue. The discipline that separates a good analyst
          is treating the two-hundredth alert with the same care as the first,
          because the one you wave through is the one that mattered.
        </P>
      </>
    ),
  },
  {
    navLabel: "Lifecycle",
    kicker: "The alert lifecycle",
    title: "From an event to an alert on your desk",
    intro:
      "Alerts do not appear from nowhere. Understanding how one reaches your queue tells you how much to trust it, and reminds you that an alert firing is a question, not an answer.",
    body: (
      <>
        <P>
          Systems emit events constantly: a sign-in, a file read, a permission
          change. That raw stream is telemetry, and almost all of it is routine.
          A detection rule watches the stream for a pattern worth a human's
          attention. When one matches, it raises an alert and drops it in your
          queue.
        </P>
        <Flow
          steps={[
            { label: "Telemetry", sub: "raw events" },
            { label: "Detection rule", sub: "pattern match" },
            { label: "Alert", sub: "in the queue" },
            { label: "Triage", sub: "your call" },
            { label: "Escalate / Close" },
          ]}
        />
        <P>
          Keep the difference between an event and an alert clear. An event is
          one thing that happened. An alert is an event, or a pattern of them,
          that a rule thinks you should look at. Most events never become
          alerts, and most alerts are not incidents. Your job is the last step:
          deciding which of the alerts in front of you actually is one.
        </P>
        <Callout
          kind="note"
          tag="Where your alerts come from"
          title="Same job, different evidence."
          body="The alerts in this section originate from four kinds of source: cloud control planes (AWS and Azure), identity systems (Entra ID), and operating systems (Linux). The triage method is identical across all of them; only the shape of the evidence changes."
        />
      </>
    ),
  },
  {
    navLabel: "Vocabulary",
    kicker: "The words analysts use",
    title: "The vocabulary you will need",
    intro:
      "Every alert you work is described with a small, shared vocabulary. These are the terms that appear throughout the exercises, so it is worth getting them straight before your first alert.",
    body: (
      <>
        <TermGrid
          terms={[
            {
              term: "True positive",
              def: "The alert caught something real. There is a genuine problem to act on.",
            },
            {
              term: "False positive",
              def: "The alert fired but nothing bad happened, like a scheduled backup that resembles data being exfiltrated.",
            },
            {
              term: "Benign true positive",
              def: "It really happened and it is expected, such as a sanctioned admin action. Real, but not a threat, so it closes.",
            },
            {
              term: "Signal vs noise",
              def: "A signal is an aspect of the evidence that genuinely points to a threat. Noise is everything that merely looks interesting.",
            },
            {
              term: "Indicator of compromise (IOC)",
              def: "A concrete artifact you can act on or hand off: an IP address, a domain, a user account, a file hash.",
            },
            {
              term: "Severity",
              def: "How bad it would be if the alert were real, from Critical down to Info. It is pre-assigned by the rule, not something you decide.",
            },
            {
              term: "MITRE ATT&CK",
              def: 'A shared catalog of attacker techniques. A tag like "Valid Accounts (T1078)" names the technique an alert maps to, so teams describe attacks the same way.',
            },
          ]}
        />
        <Callout
          kind="fix"
          tag="Common mix-up"
          title="Severity is not the verdict."
          body="A Critical alert can still be a false positive, and a Low alert can still be a real breach. Severity says how much would be at stake if it were real; your verdict says what actually happened. Judge the evidence, not the loudness of the label."
        />
      </>
    ),
  },
  {
    navLabel: "Anatomy",
    kicker: "Anatomy of an alert",
    title: "What an alert is made of",
    intro:
      "Every alert you open has the same parts, laid out the way the Evidence phase shows them. Before you learn the method, get familiar with the shape: tap through a real one and see what each field is telling you and how much to trust it.",
    wide: true,
    body: <AlertAnatomy />,
  },
  {
    navLabel: "The method",
    kicker: "The triage method",
    title: "How you will work an alert",
    intro:
      "Every Investigation in this section runs the same five phases, in order. It is one disciplined version of what analysts do under many names, and the order is the point: evidence before conclusion, reasoning before action.",
    body: (
      <>
        <div className="mt-[18px] flex flex-col gap-[10px]">
          {[
            {
              n: "Evidence",
              body: "Read the raw alert and its context. Do not judge yet; just take in what happened.",
            },
            {
              n: "Identify",
              body: "Pick out the aspects that are actually suspicious from a list that deliberately includes decoys.",
            },
            {
              n: "Justify",
              body: "Say why each pick matters. A right answer for the wrong reason is not analysis.",
            },
            {
              n: "Extract",
              body: "Pull the concrete indicators, the IOCs, that you would hand to the next tier.",
            },
            {
              n: "Verdict",
              body: "Make the call: Escalate or Close. This is the headline outcome you are graded on.",
            },
          ].map((phase, i) => (
            <div
              key={phase.n}
              className="flex items-start gap-[12px] rounded-[12px] border border-line bg-surface p-[14px]"
            >
              <span className="mt-[1px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-teal-soft font-mono text-[12px] font-bold text-teal-ink">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-ink-strong">
                  {phase.n}
                </div>
                <p className="mt-[3px] text-[13px] leading-[1.55] text-body">
                  {phase.body}
                </p>
              </div>
            </div>
          ))}
        </div>
        <P>
          Underneath those phases, three questions do most of the analytical
          work. Hold them in mind as you read every alert; they are how you turn
          a wall of evidence into a call.
        </P>
        <TermGrid
          terms={[
            {
              term: "Is this normal here?",
              def: "Most triage is comparison. A root login is alarming for an account that never uses root and routine for one that always does. Judge the event against what is usual for this user, host, or region, not against nothing.",
            },
            {
              term: "What would an attacker be doing?",
              def: "Read the evidence as a story, not a single line. One event is rarely damning; a sequence that fits a known technique is. Ask what an intruder would want here, and whether the events line up with it.",
            },
            {
              term: "Does anything corroborate it?",
              def: "One weak signal is a maybe. Two independent ones pointing the same way, an unusual location and an unusual action at the same time, make a case. Look for the second thing before you commit.",
            },
          ]}
        />
        <P>
          The exercises grade the whole chain, not just the final call. It is
          possible to reach the right verdict and still score poorly because the
          reasoning behind it was thin. That is on purpose: in a real SOC, an
          escalation nobody can justify is nearly as useless as a missed one.
        </P>
      </>
    ),
  },
  {
    navLabel: "The call",
    kicker: "The verdict",
    title: "The two calls, and what each one costs",
    intro:
      "Triage ends one of two ways. Both are legitimate outcomes, and both carry a cost when you get them wrong, which is exactly why the method exists.",
    body: (
      <>
        <div className="mt-[18px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <div className="rounded-[12px] border border-line bg-surface p-[16px]">
            <div className="text-[14px] font-semibold text-ink-strong">
              Escalate
            </div>
            <p className="mt-[5px] text-[13px] leading-[1.55] text-body">
              This is real, real enough to warrant a deeper look, or something
              you cannot confidently rule out. It goes to Tier 2 with your
              reasoning and the indicators you pulled.
            </p>
          </div>
          <div className="rounded-[12px] border border-line bg-surface p-[16px]">
            <div className="text-[14px] font-semibold text-ink-strong">
              Close
            </div>
            <p className="mt-[5px] text-[13px] leading-[1.55] text-body">
              Benign or a false positive. It stops here, with a note explaining
              why, so the next analyst who sees something similar has your work.
            </p>
          </div>
        </div>
        <P>
          A false escalation burns Tier 2's time, and repeated often enough it
          trains the team to ignore you. A wrong close is the expensive one: a
          real intruder walks, and it is the mistake you will be most tempted to
          make when the queue is deep and the evidence is ambiguous. The method
          exists to make your call defensible: you escalate because of a signal
          you named and an indicator you pulled, not a hunch.
        </P>
      </>
    ),
  },
  {
    navLabel: "When unsure",
    kicker: "The safety net",
    title: "When you are not sure, escalate",
    intro:
      "You are Tier 1, and Tier 1 is not expected to be certain. The tiers above you exist precisely so an alert you cannot resolve does not stop with you. Knowing when to hand one up is part of the job, not an admission that you failed at it.",
    body: (
      <>
        <P>
          Some alerts will not resolve cleanly. The evidence is thin, or it
          points both ways, or it touches a system you have never seen. That is
          normal, and it does not mean you worked the alert badly. It means the
          alert needs more time, more access, or more experience than a triage
          pass is meant to give.
        </P>
        <P>
          When that happens, escalate. A Tier 2 or Tier 3 analyst can pull logs
          you cannot reach, correlate across more systems, and has likely seen
          the pattern before. Handing them a clear "I cannot rule this out, and
          here is exactly what I see" is good work. It is far better than
          forcing a confident-looking verdict you do not actually hold.
        </P>
        <Callout
          kind="fix"
          tag="The rule that keeps you safe"
          title="Uncertainty is a reason to escalate, never a reason to close."
          body="A close means you are confident nothing happened. If you are not confident, you have not earned a close. When you genuinely cannot tell whether something is a signal, hand it up to L2 or L3 rather than waving it through. The close you were unsure about is the one that comes back."
        />
        <P>
          These exercises are solo, so there is no live Tier 2 to ping
          mid-alert; you make the final call yourself. Carry the same rule
          anyway. When the evidence leaves you genuinely torn and you cannot
          rule out a threat, lean toward Escalate. That is the instinct a real
          SOC wants you to build, and it is the safer error to make.
        </P>
        <div className="mt-[24px] rounded-[14px] border border-line bg-surface-muted p-[18px]">
          <p className="text-[15px] font-semibold text-ink-strong">
            You have the vocabulary, the method, and a safety net. Time to work
            a real one.
          </p>
          <p className="mt-[6px] text-[13.5px] leading-[1.6] text-body">
            Head to the alert queue and start with a Guided alert, which reveals
            a little more scaffolding as you go.
          </p>
          <Link
            href="/investigations"
            className="mt-[14px] inline-flex items-center gap-[7px] rounded-button bg-primary px-[16px] py-[9px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go to the alert queue
            <ArrowRight size={14} weight="bold" aria-hidden />
          </Link>
        </div>
      </>
    ),
  },
];

/** The Primer page: breadcrumb, an orientation marker, framing, and the stepped walkthrough. */
export default function Orientation() {
  return (
    <article className="max-w-[1200px] px-[44px] pt-[40px] motion-safe:animate-[fadeUp_0.4s_ease_both] max-[760px]:px-[20px] max-[760px]:pt-[28px]">
      <div className="flex items-center gap-[8px] font-mono text-[12.5px] text-ink-muted">
        <Link href="/investigations" className="text-teal-ink">
          Investigations
        </Link>
        <span>/</span>
        <span className="text-body">Orientation</span>
      </div>

      <div className="mt-[14px]">
        <span className="rounded-[7px] border border-line bg-surface-muted px-[10px] py-[4px] font-mono text-[11.5px] uppercase tracking-[0.05em] text-ink-muted">
          Orientation · read-through, not graded
        </span>
      </div>

      <h1 className="mt-[12px] text-[38px] font-extrabold tracking-[-0.03em] text-ink max-[520px]:text-[28px]">
        The SOC analyst's job
      </h1>

      <p className="mt-[16px] max-w-[72ch] text-pretty text-[17px] leading-[1.6] text-body">
        You have learned how cloud systems are built. This is the other side of
        that work: how a security team watches systems like them, and how you,
        as a new analyst, decide whether an alert is a real problem. Read it
        once before working the queue; it takes a few minutes and every term
        here shows up in the exercises.
      </p>

      <OrientationWalkthrough sections={sections} />

      <Glossary terms={KEY_TERMS} />
      <FurtherReading links={FURTHER_READING} />

      <div className="mt-[44px] flex gap-[12px] border-t border-line pt-[24px]">
        <Link
          href="/investigations"
          className="inline-flex items-center gap-[6px] text-[14px] text-teal-ink"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden />
          Back to the alert queue
        </Link>
      </div>
    </article>
  );
}
